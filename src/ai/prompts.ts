import { NightActionLog } from '@/engine/game-state';
import { RoleId } from '@/engine/roles';

import { getRolePromptConfigs } from './role-prompts';
import { RolePromptConfig } from './role-prompts/types';

const NIGHT_ORDER: Record<string, number> = {
  doppelganger: 1,
  werewolf: 2,
  minion: 3,
  mason: 4,
  seer: 5,
  robber: 6,
  troublemaker: 7,
  drunk: 8,
  insomniac: 9,
};

function renderField(value: string | Record<string, string | Record<string, string>>): string {
  if (typeof value === 'string') return value;
  const lines: string[] = [];
  for (const [, val] of Object.entries(value)) {
    if (typeof val === 'string') {
      lines.push(`- ${val}`);
    } else {
      for (const [, subVal] of Object.entries(val)) {
        lines.push(`  - ${subVal}`);
      }
    }
  }
  return lines.join('\n');
}

function renderRoleCoreSection(config: RolePromptConfig): string {
  const lines: string[] = [];

  lines.push('你的角色：');
  lines.push(config.identity);

  if (config.gameLogicConstraints && config.gameLogicConstraints.length > 0) {
    lines.push('');
    lines.push('核心逻辑约束：');
    for (const c of config.gameLogicConstraints) {
      lines.push(`- ${c}`);
    }
  }

  lines.push('');
  lines.push('阵营目标：');
  lines.push(config.teamObjective);

  return lines.join('\n');
}

function renderRoleStrategySection(config: RolePromptConfig): string {
  const lines: string[] = [];

  lines.push('如何使用你的夜间信息：');
  lines.push(renderField(config.nightInfoUsage));

  lines.push('');
  lines.push('策略：');
  lines.push(renderField(config.strategy));

  lines.push('');
  lines.push('发言风格：');
  lines.push(renderField(config.speechGuidelines));

  return lines.join('\n');
}

const LANG_INSTRUCTION_ZH = '你必须用中文（简体中文）回复。所有发言、推理和指控都必须用中文。';
const LANG_INSTRUCTION_EN = 'CRITICAL OUTPUT RULE: You MUST respond in fluent, natural, native-speaker-level English. All your speech, reasoning, and accusations must be in English. The instructions below are in Chinese but your OUTPUT must be entirely in English.';

export function buildSystemPrompt(
  roleName: RoleId,
  personalityPrompt: string,
  locale: string
): string {
  const config = getRolePromptConfigs()[roleName];
  const langInstruction = locale === 'zh' ? LANG_INSTRUCTION_ZH : LANG_INSTRUCTION_EN;

  return `你正在玩一夜终极狼人杀。${personalityPrompt}

${langInstruction}

核心规则：
- 绝对不要暴露你是AI。以人类玩家的身份游戏。
- 严格字数限制：回复最多1-3句话。绝不超过3句。简洁、有策略、符合角色。
- 你必须说一些有意义的内容。不要说你没什么好说的。
- 被交换的目标在夜间不会被通知。绝不要说"如果你真的换了我，我会知道的"。

${renderRoleCoreSection(config)}`;
}

export function buildVoteSystemPrompt(
  roleName: RoleId,
  playerName: string,
  locale: string
): string {
  const config = getRolePromptConfigs()[roleName];
  const langInstruction = locale === 'zh' ? LANG_INSTRUCTION_ZH : LANG_INSTRUCTION_EN;

  return `你是${playerName}，正在玩一夜终极狼人杀。${config.identity}
阵营目标：${config.teamObjective}
${langInstruction}
只回复一个玩家的名字，不要回复其他任何内容。`;
}

export function buildReferenceRules(roleName: RoleId): string {
  const config = getRolePromptConfigs()[roleName];

  return `【参考规则——首次提供，后续轮次省略】

游戏规则：
- 狼人隐藏在村民中。夜间各角色执行秘密行动。白天讨论找狼人，投票淘汰。

夜间行动顺序：
1.化身幽灵(复制) 2.狼人(确认/偷看底牌) 3.爪牙(看狼人) 4.共济会(互认)
5.预言家(查看) 6.强盗(交换并看牌) 7.捣蛋鬼(交换两人) 8.酒鬼(换底牌) 9.失眠者(看自己牌)

关键时序：预言家(5)在交换前查看→信息可能过时。强盗(6)在捣蛋鬼(7)前→链条：原始→强盗换→捣蛋鬼换→最终。失眠者(9)最后看牌→最可靠。

判断声明：
- 声称角色并给出只有该角色知道的具体信息=强证据。
- 两人声称同一角色→其中一人撒谎。数角色总数（玩家+3底牌）检测矛盾。
- 关注逻辑一致性，不要被语气/自信程度/发言顺序干扰。

${renderRoleStrategySection(config)}`;
}

export interface DiscussionContext {
  speakingPosition: number;
  totalSpeakers: number;
  currentRound?: number;
  maxRounds?: number;
}

function buildNightInfoBlock(nightInfo: NightActionLog, originalRole: RoleId): string {
  const myOrder = NIGHT_ORDER[originalRole] ?? 99;
  const lines: string[] = [];

  lines.push(`=== 你的夜间行动（第${myOrder}步） ===`);
  lines.push(nightInfo.description);

  if (nightInfo.revealed && nightInfo.revealed.length > 0) {
    lines.push('');
    lines.push('你看到的信息：');
    for (const r of nightInfo.revealed) {
      if (r.isCenterCard) {
        lines.push(`  - 底牌 #${r.targetIndex + 1}：${r.role}`);
      } else {
        lines.push(`  - 玩家位置 ${r.targetIndex}：${r.role}`);
      }
    }
  }

  if (nightInfo.swapped) {
    lines.push('');
    lines.push(`牌被交换：位置 ${nightInfo.swapped.a} ↔ 位置 ${nightInfo.swapped.b}`);
  }

  lines.push('');
  if (myOrder <= 5) {
    lines.push(
      '时间提示：你的行动发生在强盗（第6步）、捣蛋鬼（第7步）和酒鬼（第8步）之前。' +
      '你获得的任何信息都可能已被后续交换改变。' +
      '如果有人声称是强盗或捣蛋鬼并说他们交换了你查看过的玩家，' +
      '那个玩家的角色现在可能和你看到的不同。'
    );
  } else if (originalRole === 'robber') {
    lines.push(
      '时间提示：你在第6步行动（在预言家之后，捣蛋鬼/酒鬼之前）。' +
      '你偷到的角色是目标在预言家查看之后、捣蛋鬼交换之前持有的。' +
      '如果捣蛋鬼把你和别人交换了，你偷来的角色就到了那个人手里。'
    );
  } else if (originalRole === 'troublemaker') {
    lines.push(
      '时间提示：你在第7步行动（在强盗之后，酒鬼/失眠者之前）。' +
      '你交换的两名玩家现在持有彼此在强盗行动之后的角色。' +
      '如果强盗偷了你交换目标之一的牌，链条是：强盗偷牌 → 然后你的交换。'
    );
  } else if (originalRole === 'drunk') {
    lines.push(
      '时间提示：你在第8步行动（在除失眠者外的所有行动之后）。' +
      '你把自己的牌和底牌交换了，但不知道变成了什么。' +
      '只有失眠者（第9步）能揭示你的牌发生了什么。'
    );
  } else if (originalRole === 'insomniac') {
    lines.push(
      '时间提示：你最后行动（第9步），在所有交换之后。' +
      '你看到的牌是你真正的最终角色——游戏中最可靠的信息。' +
      '如果你的牌从失眠者变成了其他角色，强盗、捣蛋鬼或酒鬼一定换了你。'
    );
  }

  lines.push('');
  lines.push(
    '用这些信息构建逻辑论证。' +
    '在讨论中将你的夜间信息与其他人的声明交叉验证。' +
    '如果声明与你看到的矛盾，有人在撒谎。'
  );

  return lines.join('\n');
}

export function buildDiscussionPrompt(
  nightInfo: NightActionLog | null,
  chatHistory: { name: string; text: string }[],
  currentRole: RoleId,
  originalRole: RoleId,
  context?: DiscussionContext,
  referenceRules?: string
): string {
  const recentChat = chatHistory
    .map((m) => `${m.name}: ${m.text}`)
    .join('\n');

  let nightContext = '';
  if (nightInfo) {
    nightContext = '\n' + buildNightInfoBlock(nightInfo, originalRole);
  } else {
    nightContext = '\n你没有夜间行动。你整晚都在睡觉，没有任何直接信息。';
  }

  const yourSituation =
    currentRole !== originalRole
      ? `\n重要：你的角色在夜间被交换了！你开始是${originalRole}，但你的牌现在是${currentRole}。这可能影响你的阵营归属。思考：谁可能交换了你（强盗在第6步，捣蛋鬼在第7步，或酒鬼在第8步）？`
      : '';

  let positionHint = '';
  let roundHint = '';
  if (context) {
    const { speakingPosition, totalSpeakers, currentRound, maxRounds } = context;
    if (speakingPosition <= 1) {
      positionHint = '\n你是最先发言的人之一。定下基调，做出声明，或提出试探性问题。';
    } else if (speakingPosition >= totalSpeakers - 1) {
      positionHint = '\n你是最后发言的人之一。分析矛盾，质疑可疑陈述。不要简单重复别人说过的话。';
    } else {
      positionHint = '\n你在讨论中间发言。回应已有内容——批判性思考，质疑你不同意的共识。';
    }
    if (currentRound && maxRounds) {
      if (currentRound >= maxRounds) {
        roundHint = `\n⚠ 最后一轮讨论（第${currentRound}/${maxRounds}轮）。说出最关键的信息或做出最终判断。`;
      } else {
        roundHint = `\n当前是第${currentRound}/${maxRounds}轮讨论。`;
      }
    }
  }

  const referenceBlock = referenceRules ? `\n\n${referenceRules}` : '';

  return `${nightContext}${yourSituation}${roundHint}${positionHint}${referenceBlock}

分析指导：
- 检查所有声明是否形成一致的身份链。矛盾在哪里？
- 追踪交换链：原始角色→强盗换→捣蛋鬼换→酒鬼换→最终角色。
- 不要盲目同意上一个发言者。根据所有证据形成你自己的结论。
- 如果某人的声明包含关于你的正确细节，这是他们说真话的证据。

最近的讨论：
${recentChat || '（还没有人发言）'}

轮到你发言了。根据你的角色和性格做出策略性发言。说一些有意义的内容——分享信息、做出声明、质疑某人，或指出矛盾。`;
}

export function buildVotePrompt(
  chatHistory: { name: string; text: string }[],
  playerNames: string[],
  nightInfo: NightActionLog | null,
  votePersonalityPrompt: string,
  _locale: string = 'en'
): string {
  const recentChat = chatHistory
    .map((m) => `${m.name}: ${m.text}`)
    .join('\n');

  const nightContext = nightInfo
    ? `你在夜间得到的信息：${nightInfo.description}\n`
    : '';

  return `${nightContext}
讨论摘要：
${recentChat}

可投票的玩家：${playerNames.join('、')}

投票性格：${votePersonalityPrompt}

根据讨论内容、你的夜间信息和你的性格，你投票淘汰谁？
思考：谁的辩护最薄弱？谁的声明与其他人矛盾？根据逻辑证据，你认为谁最可能是狼人？
只回复玩家的名字，不要回复其他任何内容。`;
}
