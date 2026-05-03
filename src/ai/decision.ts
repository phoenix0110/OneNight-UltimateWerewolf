import { GameState, NightActionLog } from '@/engine/game-state';
import { RoleId } from '@/engine/roles';

import { buildDiscussionPrompt, buildKnowledgeBoard, buildReferenceRules, buildSystemPrompt, buildVotePrompt, buildVoteSystemPrompt, DiscussionContext } from './prompts';
import { ChatMessage as ProviderChatMessage } from './providers';

export interface AIContext {
  playerIndex: number;
  nightLog: NightActionLog | null;
  locale: string;
  discussionContext?: DiscussionContext;
}

const SENSITIVE_ROLES: Set<RoleId> = new Set(['werewolf', 'minion', 'tanner']);

export function sanitizeAIResponse(
  response: string,
  originalRole: RoleId,
): string {
  let text = response.trim();

  const thinkingPatterns = [
    /^[\s]*（[^）]*）[\s]*/gm,
    /^[\s]*\([^)]*\)[\s]*/gm,
    /^[\s]*【内心[^】]*】[^\n]*/gm,
    /^[\s]*(?:让我(?:想想|分析|理清)|分析：|推理：|思考：|内心：|心想：)[^\n]*/gm,
    /^[\s]*(?:我(?:其实|实际上|真正)是)[^\n]*/gm,
  ];
  for (const pat of thinkingPatterns) {
    text = text.replace(pat, '');
  }

  if (SENSITIVE_ROLES.has(originalRole)) {
    const roleLeakPatterns: Record<string, RegExp[]> = {
      werewolf: [/我是狼人/g, /我(?:其实|实际上|真正)?是狼/g, /身为狼人/g],
      minion: [/我是爪牙/g, /身为爪牙/g],
      tanner: [/我是皮匠/g, /身为皮匠/g, /我想被投死/g],
    };
    const patterns = roleLeakPatterns[originalRole] ?? [];
    for (const pat of patterns) {
      if (pat.test(text)) {
        const sentences = text.split(/(?<=[。！？!?.\n])/);
        text = sentences.filter(s => !pat.test(s)).join('');
      }
    }
  }

  text = text.replace(/\n{2,}/g, '\n').trim();

  const sentences = text.split(/(?<=[。！？!?])/);
  if (sentences.length > 5) {
    text = sentences.slice(0, 5).join('');
  }

  return text || response.trim();
}

export function buildChatMessages(
  state: GameState,
  context: AIContext
): ProviderChatMessage[] {
  const player = state.players[context.playerIndex];
  const isFirstRound = !context.discussionContext?.currentRound || context.discussionContext.currentRound <= 1;

  const playerNames: Record<number, string> = {};
  for (const p of state.players) {
    playerNames[p.id] = p.name;
  }

  const knowledgeBoard = buildKnowledgeBoard(
    context.playerIndex,
    player.originalRole,
    state.nightActions,
    state.players,
  );

  const systemMsg = buildSystemPrompt(
    player.originalRole,
    player.name,
    context.locale,
    knowledgeBoard,
    context.nightLog,
    state.config.roles,
    playerNames,
  );

  const chatHistory = state.chatMessages.map((m) => ({
    name: m.playerName,
    text: m.text,
  }));

  const referenceRules = isFirstRound ? buildReferenceRules(player.originalRole) : undefined;

  const userMsg = buildDiscussionPrompt(
    chatHistory,
    context.discussionContext,
    referenceRules,
    playerNames,
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

  const knowledgeBoard = buildKnowledgeBoard(
    context.playerIndex,
    player.originalRole,
    state.nightActions,
    state.players,
  );

  const systemMsg = buildVoteSystemPrompt(
    player.originalRole,
    player.name,
    context.locale,
    knowledgeBoard,
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
