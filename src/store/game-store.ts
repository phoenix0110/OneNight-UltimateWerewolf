import { create } from 'zustand';

import { buildChatMessages, buildVoteChatMessages, getFallbackResponse, parseVoteResponse } from '@/ai/decision';
import { getBuiltInSpeeches, BuiltInSpeech, fillTemplate } from '@/ai/built-in-speeches';
import { AIPersonality, generatePersonalities } from '@/ai/personality';
import { createProvider, ProviderConfig, BUILT_IN_PROVIDERS } from '@/ai/providers';
import { ChatMessage, createInitialState, GameConfig, GameState } from '@/engine/game-state';
import { NightActionChoice, processAllNightActions, resolveNightAction } from '@/engine/night-actions';
import { RoleId } from '@/engine/roles';
import { generateAIVote, tallyVotes } from '@/engine/voting';
import { determineWinners, WinResult } from '@/engine/win-conditions';

interface GameStore extends GameState {
  aiPersonalities: AIPersonality[];
  providerConfig: ProviderConfig;
  locale: string;
  winResult: WinResult | null;
  isProcessing: boolean;
  humanNightAction: NightActionChoice | null;
  nightRevealed: { targetIndex: number; role: RoleId }[] | null;

  setLocale: (locale: string) => void;
  setProvider: (config: ProviderConfig) => void;
  startGame: (config: GameConfig) => void;
  proceedToNight: () => void;
  setHumanNightAction: (action: NightActionChoice) => void;
  executeNightPhase: () => void;
  addChatMessage: (text: string, isBuiltIn: boolean) => void;
  triggerAIChat: (playerIndex: number) => Promise<void>;
  runAIDiscussion: () => Promise<void>;
  proceedToVote: () => void;
  castVote: (targetId: number) => void;
  runAIVotes: () => Promise<void>;
  resolveGame: () => void;
  resetGame: () => void;
  getBuiltInSpeeches: () => BuiltInSpeech[];
  getFilledSpeech: (speech: BuiltInSpeech) => string;
}

const DEFAULT_PROVIDER: ProviderConfig = {
  ...BUILT_IN_PROVIDERS[0],
  apiKey: '',
};

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
  config: { playerCount: 5, playerName: 'You', roles: [], aiProvider: 'openai' },
  aiPersonalities: [],
  providerConfig: DEFAULT_PROVIDER,
  locale: 'en',
  winResult: null,
  isProcessing: false,
  humanNightAction: null,
  nightRevealed: null,

  setLocale: (locale) => set({ locale }),

  setProvider: (config) => set({ providerConfig: config }),

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
    set({
      ...newState,
      phase: 'day',
      chatMessages: [],
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

  triggerAIChat: async (playerIndex) => {
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
    };

    try {
      if (!state.providerConfig.apiKey) {
        const fallback = getFallbackResponse(state.locale);
        const message: ChatMessage = {
          playerId: player.id,
          playerName: player.name,
          text: fallback,
          timestamp: Date.now(),
          isBuiltIn: false,
        };
        set({ chatMessages: [...get().chatMessages, message] });
        return;
      }

      const messages = buildChatMessages(state as GameState, context);
      const provider = createProvider(state.providerConfig);
      const response = await provider.sendMessage(messages);

      const message: ChatMessage = {
        playerId: player.id,
        playerName: player.name,
        text: response,
        timestamp: Date.now(),
        isBuiltIn: false,
      };
      set({ chatMessages: [...get().chatMessages, message] });
    } catch {
      const fallback = getFallbackResponse(state.locale);
      const message: ChatMessage = {
        playerId: player.id,
        playerName: player.name,
        text: fallback,
        timestamp: Date.now(),
        isBuiltIn: false,
      };
      set({ chatMessages: [...get().chatMessages, message] });
    }
  },

  runAIDiscussion: async () => {
    const state = get();
    set({ isProcessing: true });

    const aiPlayers = state.players.filter((p) => !p.isHuman);
    // Each AI speaks once in random order
    const shuffled = [...aiPlayers].sort(() => Math.random() - 0.5);

    for (const player of shuffled) {
      await get().triggerAIChat(player.id);
      // Small delay between messages for UX
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    set({ isProcessing: false });
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

      if (state.providerConfig.apiKey) {
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
          const provider = createProvider(state.providerConfig);
          const response = await provider.sendMessage(messages);
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
      } else {
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
    });
  },

  getBuiltInSpeeches: () => {
    const state = get();
    const humanPlayer = state.players[state.humanPlayerIndex];
    if (!humanPlayer) return [];
    return getBuiltInSpeeches(humanPlayer.originalRole);
  },

  getFilledSpeech: (speech) => {
    const state = get();
    const otherNames = state.players
      .filter((p) => !p.isHuman)
      .map((p) => p.name);
    return fillTemplate(speech.template, otherNames);
  },
}));
