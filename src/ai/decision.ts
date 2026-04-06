import { GameState, NightActionLog } from '@/engine/game-state';
import { buildDiscussionPrompt, buildSystemPrompt, buildVotePrompt } from './prompts';
import { getPersonalityPrompt, AIPersonality } from './personality';
import { ChatMessage as ProviderChatMessage } from './providers';

interface AIContext {
  playerIndex: number;
  personality: AIPersonality;
  nightLog: NightActionLog | null;
  locale: string;
}

export function buildChatMessages(
  state: GameState,
  context: AIContext
): ProviderChatMessage[] {
  const player = state.players[context.playerIndex];
  const personalityPrompt = getPersonalityPrompt(context.personality);

  const systemMsg = buildSystemPrompt(
    player.originalRole,
    personalityPrompt,
    context.locale
  );

  const chatHistory = state.chatMessages.map((m) => ({
    name: m.playerName,
    text: m.text,
  }));

  const userMsg = buildDiscussionPrompt(
    context.nightLog,
    chatHistory,
    player.currentRole,
    player.originalRole
  );

  return [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ];
}

export function buildVoteChatMessages(
  state: GameState,
  context: AIContext
): ProviderChatMessage[] {
  const player = state.players[context.playerIndex];
  const personalityPrompt = getPersonalityPrompt(context.personality);

  const systemMsg = buildSystemPrompt(
    player.originalRole,
    personalityPrompt,
    context.locale
  );

  const chatHistory = state.chatMessages.map((m) => ({
    name: m.playerName,
    text: m.text,
  }));

  const playerNames = state.players
    .filter((p) => p.id !== context.playerIndex)
    .map((p) => p.name);

  const userMsg = buildVotePrompt(chatHistory, playerNames, context.nightLog);

  return [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ];
}

export function parseVoteResponse(
  response: string,
  playerNames: string[]
): string | null {
  const cleaned = response.trim().replace(/[."'!?,]/g, '');
  const match = playerNames.find(
    (name) => cleaned.toLowerCase().includes(name.toLowerCase())
  );
  return match || null;
}

const FALLBACK_RESPONSES: Record<string, string[]> = {
  en: [
    "I don't trust anyone right now.",
    "Something feels off about this group.",
    "I'm watching everyone carefully.",
    "Let's hear more before I decide.",
    "I have my suspicions but I'll wait.",
  ],
  zh: [
    '我现在谁都不信。',
    '这个局总觉得哪里不对。',
    '我在仔细观察每个人。',
    '再听听大家的发言吧。',
    '我有怀疑对象，但先不说。',
  ],
};

export function getFallbackResponse(locale: string): string {
  const responses = FALLBACK_RESPONSES[locale] || FALLBACK_RESPONSES.en;
  return responses[Math.floor(Math.random() * responses.length)];
}
