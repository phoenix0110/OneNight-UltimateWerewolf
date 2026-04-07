import { create } from 'zustand';

import { buildChatMessages, buildVoteChatMessages, parseVoteResponse } from '@/ai/decision';
import { BuiltInSpeech, fillTemplate, getBuiltInSpeeches } from '@/ai/built-in-speeches';
import { AIPersonality, generatePersonalities } from '@/ai/personality';
import { DiscussionContext } from '@/ai/prompts';
import { sendAIMessage } from '@/ai/providers';
import { ChatMessage, createInitialState, GameConfig, GameState } from '@/engine/game-state';
import { NightActionChoice, processAllNightActions, resolveNightAction } from '@/engine/night-actions';
import { RoleId } from '@/engine/roles';
import { generateAIVote, tallyVotes } from '@/engine/voting';
import { determineWinners, WinResult } from '@/engine/win-conditions';

interface GameStore extends GameState {
  aiPersonalities: AIPersonality[];
  locale: string;
  winResult: WinResult | null;
  isProcessing: boolean;
  humanNightAction: NightActionChoice | null;
  nightRevealed: { targetIndex: number; role: RoleId }[] | null;
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
  castVote: (targetId: number) => void;
  runAIVotes: () => Promise<void>;
  resolveGame: () => void;
  resetGame: () => void;
  getBuiltInSpeeches: () => BuiltInSpeech[];
  getFilledSpeech: (speech: BuiltInSpeech) => string;
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
  aiPersonalities: [],
  locale: 'en',
  winResult: null,
  isProcessing: false,
  humanNightAction: null,
  nightRevealed: null,
  thinkingPlayerId: null,

  setLocale: (locale) => set({ locale }),

  startGame: (config) => {
    const state = createInitialState(config);
    const personalities = generatePersonalities(config.playerCount - 1);
    const players = state.players.map((p, i) => {
      if (i === 0) return p;
      return { ...p, name: personalities[i - 1].name };
    });

    set({
      ...state,
      players,
      aiPersonalities: personalities,
      config,
      winResult: null,
      isProcessing: false,
      humanNightAction: null,
      nightRevealed: null,
      thinkingPlayerId: null,
    });
  },

  proceedToNight: () => set({ phase: 'night' }),

  setHumanNightAction: (action) => {
    const state = get();
    const result = resolveNightAction(state, action, state.humanPlayerIndex);
    set({
      humanNightAction: action,
      nightRevealed: result.log.revealed || null,
    });
  },

  executeNightPhase: () => {
    const state = get();
    const newState = processAllNightActions(
      state as GameState,
      state.humanNightAction
    );
    const order = generateSpeakingOrder(newState.players);
    set({
      ...newState,
      phase: 'day',
      chatMessages: [],
      speakingOrder: order,
      currentSpeakerIndex: 0,
      discussionRound: 1,
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

    const personalityIdx = playerIndex - 1;
    const personality = state.aiPersonalities[personalityIdx];
    if (!personality) return;

    const nightLog = state.nightActions.find(
      (log) => log.actorIndex === playerIndex
    ) || null;

    const context = {
      playerIndex,
      personality,
      nightLog,
      locale: state.locale,
      discussionContext,
    };

    set({ thinkingPlayerId: playerIndex });

    try {
      const messages = buildChatMessages(state as GameState, context);
      const response = await sendAIMessage(messages);

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

    for (const player of state.players) {
      if (player.isHuman) continue;

      const personalityIdx = player.id - 1;
      const personality = state.aiPersonalities[personalityIdx];
      const nightLog = state.nightActions.find(
        (log) => log.actorIndex === player.id
      ) || null;

      try {
        const messages = buildVoteChatMessages(state as GameState, {
          playerIndex: player.id,
          personality,
          nightLog,
          locale: state.locale,
        });
        const response = await sendAIMessage(messages);
        const playerNames = state.players
          .filter((p) => p.id !== player.id)
          .map((p) => p.name);
        const votedName = parseVoteResponse(response, playerNames);
        const votedPlayer = state.players.find((p) => p.name === votedName);

        if (votedPlayer) {
          newVotes[player.id] = votedPlayer.id;
        } else {
          newVotes[player.id] = generateAIVote(state as GameState, player.id);
        }
      } catch {
        newVotes[player.id] = generateAIVote(state as GameState, player.id);
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
    const otherNames = state.players
      .filter((p) => !p.isHuman)
      .map((p) => p.name);
    return fillTemplate(speech.template, otherNames);
  },
}));
