import { GameState, NightActionLog } from '@/engine/game-state';

import { AIPersonality, getPersonalityPrompt, getPersonalityPromptCompact, getVotePersonalityPrompt } from './personality';
import { buildDiscussionPrompt, buildReferenceRules, buildSystemPrompt, buildVotePrompt, buildVoteSystemPrompt, DiscussionContext } from './prompts';
import { ChatMessage as ProviderChatMessage } from './providers';

interface AIContext {
  playerIndex: number;
  personality: AIPersonality;
  nightLog: NightActionLog | null;
  locale: string;
  discussionContext?: DiscussionContext;
}

export function buildChatMessages(
  state: GameState,
  context: AIContext
): ProviderChatMessage[] {
  const player = state.players[context.playerIndex];
  const isFirstRound = !context.discussionContext?.currentRound || context.discussionContext.currentRound <= 1;

  const personalityPrompt = isFirstRound
    ? getPersonalityPrompt(context.personality)
    : getPersonalityPromptCompact(context.personality);

  const systemMsg = buildSystemPrompt(
    player.originalRole,
    personalityPrompt,
    context.locale
  );

  const chatHistory = state.chatMessages.map((m) => ({
    name: m.playerName,
    text: m.text,
  }));

  const referenceRules = isFirstRound ? buildReferenceRules(player.originalRole) : undefined;

  const userMsg = buildDiscussionPrompt(
    context.nightLog,
    chatHistory,
    player.currentRole,
    player.originalRole,
    context.discussionContext,
    referenceRules,
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
  const votePersonalityPrompt = getVotePersonalityPrompt(context.personality);

  const systemMsg = buildVoteSystemPrompt(
    player.originalRole,
    player.name,
    context.locale
  );

  const chatHistory = state.chatMessages.map((m) => ({
    name: m.playerName,
    text: m.text,
  }));

  const playerNames = state.players
    .filter((p) => p.id !== context.playerIndex)
    .map((p) => p.name);

  const userMsg = buildVotePrompt(chatHistory, playerNames, context.nightLog, votePersonalityPrompt);

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
