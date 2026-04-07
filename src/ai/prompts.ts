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
      ? 'You MUST respond in Chinese (简体中文). All your speech, reasoning, and accusations must be in Chinese.'
      : 'You MUST respond in English. All your speech, reasoning, and accusations must be in English.';

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

NIGHT ACTION ORDER (critical for logical reasoning):
1. Doppelganger — copies another player's role, then acts as that role
2. Werewolf — werewolves see each other; lone wolf peeks at one center card
3. Minion — sees who the werewolves are (werewolves do NOT see the Minion)
4. Mason — masons see each other
5. Seer — looks at one player's card OR two center cards (BEFORE any swaps)
6. Robber — swaps own card with another player's card, sees new role
7. Troublemaker — swaps two OTHER players' cards (does NOT see them)
8. Drunk — swaps own card with a center card (does NOT see new role)
9. Insomniac — checks own card AFTER all swaps

WHY ORDER MATTERS:
- The Seer sees roles BEFORE Robber and Troublemaker act. So a Seer's info may be outdated after swaps.
- The Robber acts BEFORE the Troublemaker. If the Robber steals a role, the Troublemaker may then swap the Robber's old card (now held by someone else).
- The Insomniac sees her final card AFTER all swaps — this is the most current information.
- Track the full identity chain: original role → Robber swap → Troublemaker swap → final role.

CRITICAL THINKING RULES:
- Do NOT simply agree with someone because they spoke confidently or accused someone first. Evaluate their LOGIC.
- Focus on logical consistency of claims, NOT specific word choices. Track the identity chain: who claims what role, and do the claims form a consistent story?
- If you see a logical flaw in someone's argument, CHALLENGE IT directly. Ask "how do you explain X?" or "that contradicts what Y said about Z."
- Consider: could someone's claim coexist with all other claims? If two claims conflict, one of them is lying.
- Count the roles: if two people claim Seer, one must be lying. If someone claims a role that another verified player already confirmed, something is wrong.
- Do NOT get distracted by tone, confidence level, or who spoke first. Focus on whether the information chain adds up.

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
      positionHint = '\nYou are among the first to speak. You have little info from others yet — set the tone, make a claim, or ask a probing question.';
    } else if (speakingPosition >= totalSpeakers - 1) {
      positionHint = '\nYou are one of the last to speak. You have heard most claims — analyze contradictions, challenge suspicious statements, or build on what you trust. Do NOT just repeat what others said.';
    } else {
      positionHint = '\nYou are speaking mid-discussion. React to what has been said — but think critically. Do you agree with the emerging consensus? If not, challenge it.';
    }
  }

  return `${nightContext}${yourSituation}${positionHint}

ANALYSIS INSTRUCTIONS:
- Before speaking, mentally check: do all the claims made so far form a consistent identity chain? If not, where is the contradiction?
- Consider the night action order: if a Seer claim and a Robber claim both exist, does the timeline make sense?
- If someone was accused and their defense was weak, note that. If someone was accused and their defense was strong, acknowledge it.
- Do NOT blindly agree with the last speaker. Form your OWN conclusion based on all evidence.

Recent discussion:
${recentChat || '(No one has spoken yet)'}

It's your turn to speak. Be strategic based on your role and personality. Say something meaningful — share info, make a claim, question someone, or challenge a contradiction you noticed.`;
}

export function buildVotePrompt(
  chatHistory: { name: string; text: string }[],
  playerNames: string[],
  nightInfo: NightActionLog | null,
  votePersonalityPrompt: string
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

VOTE PERSONALITY: ${votePersonalityPrompt}

Based on the discussion, your night information, and your personality, who do you vote to kill?
Think about: who had the weakest defense? Whose claims contradicted others? Who do YOU believe is most likely a Werewolf based on the logical evidence?
Respond with ONLY the player's name, nothing else.`;
}
