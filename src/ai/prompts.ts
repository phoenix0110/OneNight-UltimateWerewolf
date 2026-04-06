import { NightActionLog } from '@/engine/game-state';
import { RoleId } from '@/engine/roles';

import { ROLE_PROMPT_CONFIGS } from './role-prompts';

export function buildSystemPrompt(
  roleName: RoleId,
  personalityPrompt: string,
  locale: string
): string {
  const langInstruction =
    locale === 'zh'
      ? 'You MUST respond in Chinese (简体中文).'
      : 'You MUST respond in English.';

  const config = ROLE_PROMPT_CONFIGS[roleName];

  return `You are playing One Night Ultimate Werewolf. ${personalityPrompt}

${langInstruction}

GAME RULES:
- There are Werewolves hiding among Village players. During the night, roles perform secret actions.
- During the day, everyone discusses to figure out who the Werewolves are (or to hide if you are one).
- After discussion, everyone votes on who to kill.
- NEVER reveal that you are an AI. Act as a human player.
- Keep responses to 1-3 sentences. Be concise, strategic, and in-character.
- You MUST always say something meaningful. Never say you have nothing to say.

YOUR ROLE:
${config.identity}

TEAM OBJECTIVE:
${config.teamObjective}

HOW TO USE YOUR NIGHT INFORMATION:
${config.nightInfoUsage}

STRATEGY — WHEN TO BE HONEST:
${config.strategy.honestApproach}

STRATEGY — WHEN TO DECEIVE:
${config.strategy.deceptiveApproach}

HOW TO DECIDE:
${config.strategy.decisionGuideline}

SPEAKING STYLE:
${config.speechGuidelines}`;
}

export interface DiscussionContext {
  speakingPosition: number;
  totalSpeakers: number;
}

export function buildDiscussionPrompt(
  nightInfo: NightActionLog | null,
  chatHistory: { name: string; text: string }[],
  currentRole: RoleId,
  originalRole: RoleId,
  context?: DiscussionContext
): string {
  let nightContext = '';

  if (nightInfo) {
    nightContext = `\nWhat you learned at night: ${nightInfo.description}`;
  }

  const yourSituation =
    currentRole !== originalRole
      ? `\nIMPORTANT: Your role may have been swapped! You started as ${originalRole} but might now be something else. Factor this into your strategy.`
      : '';

  const recentChat = chatHistory
    .slice(-10)
    .map((m) => `${m.name}: ${m.text}`)
    .join('\n');

  let positionHint = '';
  if (context) {
    const { speakingPosition, totalSpeakers } = context;
    if (speakingPosition <= 1) {
      positionHint = '\nYou are among the first to speak. You have little info from others yet — set the tone, make a claim, or ask a question.';
    } else if (speakingPosition >= totalSpeakers - 1) {
      positionHint = '\nYou are one of the last to speak. You have heard most claims — analyze contradictions, challenge suspicious statements, or build on what you trust.';
    } else {
      positionHint = '\nYou are speaking mid-discussion. React to what has been said, share your info, or question claims that seem off.';
    }
  }

  return `${nightContext}${yourSituation}${positionHint}

Recent discussion:
${recentChat || '(No one has spoken yet)'}

It's your turn to speak. Be strategic based on your role. Say something meaningful — share info, make a claim, question someone, or build your case.`;
}

export function buildVotePrompt(
  chatHistory: { name: string; text: string }[],
  playerNames: string[],
  nightInfo: NightActionLog | null
): string {
  const recentChat = chatHistory
    .slice(-15)
    .map((m) => `${m.name}: ${m.text}`)
    .join('\n');

  const nightContext = nightInfo
    ? `What you learned at night: ${nightInfo.description}\n`
    : '';

  return `${nightContext}
Discussion summary:
${recentChat}

Available players to vote for: ${playerNames.join(', ')}

Based on the discussion and your night information, who do you vote to kill? 
Respond with ONLY the player's name, nothing else.`;
}
