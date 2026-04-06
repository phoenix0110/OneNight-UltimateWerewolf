import { RoleId } from '@/engine/roles';
import { NightActionLog } from '@/engine/game-state';

export function buildSystemPrompt(
  roleName: RoleId,
  personalityPrompt: string,
  locale: string
): string {
  const langInstruction =
    locale === 'zh'
      ? 'You MUST respond in Chinese (简体中文).'
      : 'You MUST respond in English.';

  return `You are playing One Night Ultimate Werewolf. ${personalityPrompt}

${langInstruction}

RULES:
- You were dealt the ${roleName} role at the start of the night.
- During the day, you discuss with other players to figure out who the werewolves are (or to hide if you are one).
- After discussion, everyone votes on who to kill.
- NEVER reveal that you are an AI. Act as a human player.
- Keep responses to 1-2 sentences MAX. Players are impatient.
- Be strategic based on your role and what you learned at night.`;
}

export function buildDiscussionPrompt(
  nightInfo: NightActionLog | null,
  chatHistory: { name: string; text: string }[],
  currentRole: RoleId,
  originalRole: RoleId
): string {
  let nightContext = '';

  if (nightInfo) {
    nightContext = `\nWhat you learned at night: ${nightInfo.description}`;
  }

  const yourSituation =
    currentRole !== originalRole
      ? `\nNote: Your role may have been swapped. You started as ${originalRole} but might now be something else.`
      : '';

  const recentChat = chatHistory
    .slice(-10)
    .map((m) => `${m.name}: ${m.text}`)
    .join('\n');

  return `${nightContext}${yourSituation}

Recent discussion:
${recentChat || '(No one has spoken yet)'}

It's your turn to speak. Remember: 1-2 sentences only.`;
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
