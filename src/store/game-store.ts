import { create } from 'zustand';

import { AIContext, buildChatMessages, buildVoteChatMessages, parseVoteResponse, sanitizeAIResponse } from '@/ai/decision';
import { BuiltInSpeech, getBuiltInSpeeches } from '@/ai/built-in-speeches';
import { DiscussionContext } from '@/ai/prompts';
import { AIRequestContext, sendAIMessage } from '@/ai/providers';
import { ChatMessage, createInitialState, GameConfig, GameState, RevealedInfo } from '@/engine/game-state';
import { MAX_DISCUSSION_ROUNDS } from '@/engine/game-rules';
import { NightActionChoice, processAllNightActions, resolveNightAction } from '@/engine/night-actions';
import { generateAIVote, tallyVotes } from '@/engine/voting';
import { determineWinners, WinResult } from '@/engine/win-conditions';

interface GameStore extends GameState {
  locale: string;
  gameSessionId: string;
  winResult: WinResult | null;
  isProcessing: boolean;
  humanNightAction: NightActionChoice | null;
  nightRevealed: RevealedInfo[] | null;
  thinkingPlayerId: number | null;

  setLocale: (locale: string) => void;
  startGame: (config: GameConfig) => void;
  proceedToNight: () => void;
  setHumanNightAction: (action: NightActionChoice) => void;
  executeNightPhase: () => void;
  addChatMessage: (text: string, isBuiltIn: boolean) => void;
  triggerAIChat: (playerIndex: number, discussionContext?: DiscussionContext) => Promise<void>;
  runAIDiscussion: () => Promise<void>;
  advanceSpeaker: () => void;
  submitHumanSpeech: (text: string, isBuiltIn: boolean) => void;
  proceedToVote: () => void;
  redealCards: () => void;
  castVote: (targetId: number) => void;
  runAIVotes: () => Promise<void>;
  resolveGame: () => void;
  resetGame: () => void;
  getBuiltInSpeeches: () => BuiltInSpeech[];
  getFilledSpeech: (speech: BuiltInSpeech) => string;
}

const AI_NAMES: Record<string, string[]> = {
  en: [
    'Alex', 'Blake', 'Casey', 'Drew', 'Ellis',
    'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan',
    'Kit', 'Luna', 'Morgan', 'Nova', 'Oakley',
    'Phoenix', 'Quinn', 'Riley', 'Sage', 'Tatum',
  ],
  zh: [
    '楚天歌', '顾流苏', '沈夜澜', '柳暮烟', '萧寒声',
    '苏晚棠', '裴惊鸿', '陆九歌', '白鹤归', '叶霜序',
    '谢长安', '温如玉', '凌未央', '宋清辞', '江渡月',
    '卫晏然', '程无忧', '霍淮安', '方鹤鸣', '姜子默',
  ],
};

function generateAINames(count: number, locale: string): string[] {
  const pool = AI_NAMES[locale] || AI_NAMES.en;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateSpeakingOrder(players: { id: number; isHuman: boolean }[]): number[] {
  const ids = players.map((p) => p.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const humanIdx = ids.findIndex((id) => players.find((p) => p.id === id)?.isHuman);
  if (humanIdx === 0 && ids.length > 1) {
    const newPos = 1 + Math.floor(Math.random() * (ids.length - 1));
    const [humanId] = ids.splice(humanIdx, 1);
    ids.splice(newPos, 0, humanId);
  }
  return ids;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'setup',
  players: [],
  centerCards: [],
  originalCenterCards: [],
  nightActions: [],
  currentNightRoleIndex: 0,
  chatMessages: [],
  votes: {},
  killedPlayerIds: [],
  winners: [],
  humanPlayerIndex: 0,
  config: { playerCount: 5, playerName: 'You', roles: [] },
  speakingOrder: [],
  currentSpeakerIndex: 0,
  discussionRound: 0,
  locale: 'en',
  gameSessionId: '',
  winResult: null,
  isProcessing: false,
  humanNightAction: null,
  nightRevealed: null,
  thinkingPlayerId: null,

  setLocale: (locale) => set({ locale }),

  startGame: (config) => {
    const state = createInitialState(config);
    const aiNames = generateAINames(config.playerCount - 1, get().locale);
    const players = state.players.map((p, i) => {
      if (i === 0) return p;
      return { ...p, name: aiNames[i - 1] };
    });

    const sessionId = `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    set({
      ...state,
      players,
      config,
      gameSessionId: sessionId,
      winResult: null,
      isProcessing: false,
      humanNightAction: null,
      nightRevealed: null,
      thinkingPlayerId: null,
    });
  },

  proceedToNight: () => set({ phase: 'night' }),

  redealCards: () => {
    const state = get();
    const newState = createInitialState(state.config);
    const aiNames = generateAINames(state.config.playerCount - 1, state.locale);
    const players = newState.players.map((p, i) => {
      if (i === 0) return p;
      return { ...p, name: aiNames[i - 1] };
    });
    set({
      ...newState,
      players,
      humanNightAction: null,
      nightRevealed: null,
    });
  },

  setHumanNightAction: (action) => {
    const state = get();
    const humanRole = state.players[state.humanPlayerIndex].originalRole;
    const result = resolveNightAction(state, action, state.humanPlayerIndex);
    set({
      humanNightAction: action,
      nightRevealed: humanRole === 'insomniac' ? null : (result.log.revealed || null),
    });
  },

  executeNightPhase: () => {
    const state = get();
    const newState = processAllNightActions(
      state as GameState,
      state.humanNightAction
    );

    let updatedNightRevealed = state.nightRevealed;
    const humanRole = state.players[state.humanPlayerIndex].originalRole;
    if (humanRole === 'insomniac') {
      const insomniacLog = newState.nightActions.find(
        (log) => log.actorIndex === state.humanPlayerIndex && log.role === 'insomniac'
      );
      if (insomniacLog?.revealed) {
        updatedNightRevealed = insomniacLog.revealed;
      }
    }

    const order = generateSpeakingOrder(newState.players);
    set({
      ...newState,
      phase: 'day',
      chatMessages: [],
      speakingOrder: order,
      currentSpeakerIndex: 0,
      discussionRound: 1,
      nightRevealed: updatedNightRevealed,
    });
  },

  addChatMessage: (text, isBuiltIn) => {
    const state = get();
    const humanPlayer = state.players[state.humanPlayerIndex];
    const message: ChatMessage = {
      playerId: humanPlayer.id,
      playerName: humanPlayer.name,
      text,
      timestamp: Date.now(),
      isBuiltIn,
    };
    set({ chatMessages: [...state.chatMessages, message] });
  },

  submitHumanSpeech: (text, isBuiltIn) => {
    const state = get();
    const humanPlayer = state.players[state.humanPlayerIndex];
    const currentSpeakerId = state.speakingOrder[state.currentSpeakerIndex];
    if (currentSpeakerId !== humanPlayer.id) return;

    const message: ChatMessage = {
      playerId: humanPlayer.id,
      playerName: humanPlayer.name,
      text,
      timestamp: Date.now(),
      isBuiltIn,
    };
    set({
      chatMessages: [...state.chatMessages, message],
      currentSpeakerIndex: state.currentSpeakerIndex + 1,
    });
  },

  advanceSpeaker: () => {
    set((state) => ({ currentSpeakerIndex: state.currentSpeakerIndex + 1 }));
  },

  triggerAIChat: async (playerIndex, discussionContext) => {
    const state = get();
    const player = state.players[playerIndex];
    if (player.isHuman) return;

    const nightLog = state.nightActions.find(
      (log) => log.actorIndex === playerIndex
    ) || null;

    const context: AIContext = {
      playerIndex,
      nightLog,
      locale: state.locale,
      discussionContext,
    };

    set({ thinkingPlayerId: playerIndex });

    const aiContext: AIRequestContext = {
      gameSessionId: state.gameSessionId,
      playerName: player.name,
      phase: 'discussion',
    };

    try {
      const messages = buildChatMessages(state as GameState, context);
      const rawResponse = await sendAIMessage(messages, aiContext);
      const response = sanitizeAIResponse(rawResponse, player.originalRole);

      const message: ChatMessage = {
        playerId: player.id,
        playerName: player.name,
        text: response,
        timestamp: Date.now(),
        isBuiltIn: false,
      };
      set({ chatMessages: [...get().chatMessages, message], thinkingPlayerId: null });
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Unknown error';
      const message: ChatMessage = {
        playerId: -1,
        playerName: 'System',
        text: `⚠ ${player.name} API error: ${errorText}`,
        timestamp: Date.now(),
        isBuiltIn: false,
      };
      set({ chatMessages: [...get().chatMessages, message], thinkingPlayerId: null });
    }
  },

  runAIDiscussion: async () => {
    const state = get();
    set({ isProcessing: true });

    const order = state.speakingOrder;
    const startIdx = state.currentSpeakerIndex;

    for (let i = startIdx; i < order.length; i++) {
      const playerId = order[i];
      const player = state.players.find((p) => p.id === playerId);
      if (!player) continue;

      if (player.isHuman) {
        set({ currentSpeakerIndex: i, isProcessing: false });
        return;
      }

      set({ currentSpeakerIndex: i });
      await get().triggerAIChat(player.id, {
        speakingPosition: i,
        totalSpeakers: order.length,
        currentRound: get().discussionRound,
        maxRounds: MAX_DISCUSSION_ROUNDS,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    set({
      currentSpeakerIndex: order.length,
      isProcessing: false,
    });
  },

  proceedToVote: () => set({ phase: 'vote' }),

  castVote: (targetId) => {
    const state = get();
    const newVotes = { ...state.votes, [state.humanPlayerIndex]: targetId };
    set({ votes: newVotes });
  },

  runAIVotes: async () => {
    const state = get();
    set({ isProcessing: true });
    const newVotes = { ...state.votes };

    const aiPlayers = state.players.filter((p) => !p.isHuman);
    const voteResults = await Promise.allSettled(
      aiPlayers.map(async (player) => {
        const nightLog = state.nightActions.find(
          (log) => log.actorIndex === player.id
        ) || null;

        const aiContext: AIRequestContext = {
          gameSessionId: state.gameSessionId,
          playerName: player.name,
          phase: 'vote',
        };

        try {
          const messages = buildVoteChatMessages(state as GameState, {
            playerIndex: player.id,
            nightLog,
            locale: state.locale,
          });
          const response = await sendAIMessage(messages, aiContext);
          const playerNames = state.players
            .filter((p) => p.id !== player.id)
            .map((p) => p.name);
          const votedName = parseVoteResponse(response, playerNames);
          const votedPlayer = state.players.find((p) => p.name === votedName);

          return {
            playerId: player.id,
            targetId: votedPlayer
              ? votedPlayer.id
              : generateAIVote(state as GameState, player.id),
          };
        } catch {
          return {
            playerId: player.id,
            targetId: generateAIVote(state as GameState, player.id),
          };
        }
      })
    );

    for (const result of voteResults) {
      if (result.status === 'fulfilled') {
        newVotes[result.value.playerId] = result.value.targetId;
      }
    }

    set({ votes: newVotes, isProcessing: false });
  },

  resolveGame: () => {
    const state = get();
    const voteResult = tallyVotes({ ...state, votes: state.votes } as GameState);
    const winResult = determineWinners(state as GameState, voteResult);

    set({
      phase: 'resolution',
      killedPlayerIds: voteResult.killedPlayerIds,
      winners: winResult.winners,
      winResult,
    });
  },

  resetGame: () => {
    set({
      phase: 'setup',
      players: [],
      centerCards: [],
      originalCenterCards: [],
      nightActions: [],
      currentNightRoleIndex: 0,
      chatMessages: [],
      votes: {},
      killedPlayerIds: [],
      winners: [],
      gameSessionId: '',
      winResult: null,
      isProcessing: false,
      humanNightAction: null,
      nightRevealed: null,
      speakingOrder: [],
      currentSpeakerIndex: 0,
      discussionRound: 0,
      thinkingPlayerId: null,
    });
  },

  getBuiltInSpeeches: () => {
    const state = get();
    const humanPlayer = state.players[state.humanPlayerIndex];
    if (!humanPlayer) return [];
    return getBuiltInSpeeches(humanPlayer.originalRole, state.locale);
  },

  getFilledSpeech: (speech) => {
    const state = get();
    const humanPlayer = state.players[state.humanPlayerIndex];
    const otherNames = state.players
      .filter((p) => !p.isHuman)
      .map((p) => p.name);
    const revealed = state.nightRevealed;

    let nightTargetName: string | undefined;
    let nightRoleName: string | undefined;

    if (revealed && revealed.length > 0) {
      if (revealed[0].isCenterCard) {
        nightRoleName = revealed.map((r) => r.role).join(' & ');
      } else {
        const target = state.players.find((p) => p.id === revealed[0].targetIndex);
        nightTargetName = target?.name;
        nightRoleName = revealed[0].role;
      }
    }

    let result = speech.template;

    if (speech.category === 'claim' && nightTargetName) {
      result = result.replace('{player}', nightTargetName);
    }

    const remaining = result.match(/\{player\}/g) || [];
    const shuffled = [...otherNames].sort(() => Math.random() - 0.5);
    remaining.forEach((_, i) => {
      result = result.replace('{player}', shuffled[i % shuffled.length]);
    });

    if (nightRoleName) {
      result = result.replace(/\{role\}/g, nightRoleName);
    } else if (humanPlayer) {
      result = result.replace(/\{role\}/g, humanPlayer.originalRole);
    }

    return result;
  },
}));
