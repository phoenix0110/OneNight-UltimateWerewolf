import { NightActionLog, Player } from '@/engine/game-state';
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

const ROLE_NAMES_ZH: Record<string, string> = {
  werewolf: '狼人', seer: '预言家', robber: '强盗', troublemaker: '捣蛋鬼',
  villager: '村民', insomniac: '失眠者', drunk: '酒鬼', hunter: '猎人',
  tanner: '皮匠', minion: '爪牙', mason: '共济会', doppelganger: '化身幽灵',
};

function roleCn(role: RoleId): string {
  return ROLE_NAMES_ZH[role] ?? role;
}

/**
 * Builds a structured knowledge board for an AI player based on what they
 * can privately deduce from their own night action. Makes swap-chain
 * implications EXPLICIT so the LLM doesn't have to reason them out.
 */
export function buildKnowledgeBoard(
  playerIndex: number,
  originalRole: RoleId,
  nightActions: NightActionLog[],
  players: Player[],
): string {
  const pn = (idx: number) => players.find(p => p.id === idx)?.name ?? `玩家${idx}`;
  const myLog = nightActions.find(l => l.actorIndex === playerIndex) ?? null;
  const lines: string[] = ['=== 你的私有推理板 ==='];

  lines.push(`你的初始身份：${roleCn(originalRole)}`);

  switch (originalRole) {
    case 'werewolf': {
      if (myLog?.revealed?.length) {
        const otherWolves = myLog.revealed.filter(r => !r.isCenterCard);
        const centerCards = myLog.revealed.filter(r => r.isCenterCard);
        if (otherWolves.length > 0) {
          const names = otherWolves.map(r => pn(r.targetIndex));
          lines.push(`你看到的狼人同伴：${names.join('、')}`);
          lines.push('注意：这是夜间第2步的信息，后续强盗/捣蛋鬼/酒鬼可能改变了牌的位置。');
          lines.push('你和同伴的初始身份都是狼人，但当前持有的牌可能已被换走。');
        }
        if (centerCards.length > 0) {
          lines.push(`你是独狼，偷看了底牌：${centerCards.map(r => `底牌#${r.targetIndex + 1}=${roleCn(r.role as RoleId)}`).join('、')}`);
          lines.push('该角色在底牌中，不在任何玩家手上。');
        }
      }
      break;
    }
    case 'seer': {
      if (myLog?.revealed?.length) {
        const playerReveals = myLog.revealed.filter(r => !r.isCenterCard);
        const centerReveals = myLog.revealed.filter(r => r.isCenterCard);
        if (playerReveals.length > 0) {
          const r = playerReveals[0];
          lines.push(`你查看了${pn(r.targetIndex)}的牌：${roleCn(r.role as RoleId)}`);
          lines.push('注意：这是第5步查看的，是强盗交换前的状态。后续强盗/捣蛋鬼/酒鬼交换可能改变了该玩家的当前身份。');
        }
        if (centerReveals.length > 0) {
          lines.push(`你查看了底牌：${centerReveals.map(r => `底牌#${r.targetIndex + 1}=${roleCn(r.role as RoleId)}`).join('、')}`);
          lines.push('这些角色在底牌中，不在任何玩家手上（除非酒鬼换走了其中一张）。');
        }
      }
      break;
    }
    case 'robber': {
      if (myLog?.revealed?.length && myLog?.swapped) {
        const stolen = myLog.revealed[0];
        const targetName = pn(stolen.targetIndex);
        const stolenRole = roleCn(stolen.role as RoleId);
        lines.push(`你抢了${targetName}的牌，看到是${stolenRole}`);
        lines.push(`交换结果：你现在持有【${stolenRole}】牌，${targetName}现在持有【强盗】牌（${targetName}不知情）`);
        lines.push(`关键：${targetName}仍然认为自己是${stolenRole}，但实际已变成强盗。`);
        if (stolen.role === 'werewolf') {
          lines.push('你偷到了狼人牌，你现在属于狼人阵营！目标变为：不让任何狼人被投死。');
        }
        lines.push('注意：捣蛋鬼（第7步）可能在你之后又交换了你或目标的牌。');
      }
      break;
    }
    case 'troublemaker': {
      if (myLog?.swapped) {
        const nameA = pn(myLog.swapped.a);
        const nameB = pn(myLog.swapped.b);
        lines.push(`你交换了${nameA}和${nameB}的牌`);
        lines.push(`交换结果：${nameA}现在持有${nameB}的原始牌，${nameB}现在持有${nameA}的原始牌（双方都不知情）`);
        lines.push(`关键：${nameA}和${nameB}都仍认为自己是原来的身份，但实际持有的牌已互换。`);
        lines.push('注意：如果强盗（第6步）先抢了其中一人的牌，你交换的是被抢后的状态。');
      }
      break;
    }
    case 'insomniac': {
      if (myLog?.revealed?.length) {
        const finalRole = roleCn(myLog.revealed[0].role as RoleId);
        const changed = myLog.revealed[0].role !== 'insomniac';
        if (changed) {
          lines.push(`你最终查看自己的牌：${finalRole}（已被换！）`);
          lines.push('这是第9步的最终状态，所有交换后的结果，最可靠。');
          lines.push('有人在夜间换了你的牌。根据变成的角色推断是谁换的。');
        } else {
          lines.push('你最终查看自己的牌：仍是失眠者（没有被换）');
          lines.push('没有人交换过你的牌。任何声称交换了你的人在撒谎。');
        }
      }
      break;
    }
    case 'minion': {
      if (myLog?.revealed?.length) {
        const wolves = myLog.revealed.map(r => pn(r.targetIndex));
        lines.push(`你看到的狼人：${wolves.join('、')}`);
        lines.push('你的目标是保护狼人不被投死。你被投死而狼人存活=你赢。');
      } else {
        lines.push('没有看到狼人（两张狼人牌都在底牌中）。');
      }
      break;
    }
    case 'mason': {
      if (myLog?.revealed?.length) {
        const partners = myLog.revealed.map(r => pn(r.targetIndex));
        lines.push(`你看到的共济会同伴：${partners.join('、')}`);
      } else {
        lines.push('没有看到其他共济会成员，另一张在底牌中。');
      }
      break;
    }
    case 'drunk': {
      lines.push('你和一张底牌交换了，但不知道拿到了什么角色。');
      lines.push('你可能变成了任何角色，包括狼人。');
      break;
    }
    case 'doppelganger': {
      if (myLog?.revealed?.length) {
        const copied = myLog.revealed[0];
        lines.push(`你查看了${pn(copied.targetIndex)}，复制成为了${roleCn(copied.role as RoleId)}`);
      }
      break;
    }
    default: {
      lines.push('你没有夜间行动，没有额外信息。靠逻辑推理判断。');
      break;
    }
  }

  lines.push('');
  lines.push('重要概念：初始身份≠当前身份');
  lines.push('- 强盗抢牌后：目标变为强盗牌（不知情），强盗变为目标的牌');
  lines.push('- 捣蛋鬼换牌后：两人互换牌（都不知情），各自仍认为是原身份');
  lines.push('- 酒鬼换牌后：酒鬼变为底牌角色（不知情）');
  lines.push('- 玩家声称的身份=他们认为的初始身份，不一定是当前实际持有的牌');
  lines.push('- 关键：夜间能力只属于原始持有者，被换牌者不会获得新牌的夜间能力');

  return lines.join('\n');
}

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

  return lines.join('\n');
}

const LANG_INSTRUCTION_ZH = '你必须用简体中文回复。所有发言、推理和指控都必须用中文。';
const LANG_INSTRUCTION_EN = 'CRITICAL OUTPUT RULE: You MUST respond in native-speaker-level English. All your speech, reasoning, and accusations must be in English. The instructions below are in Chinese but your OUTPUT must be entirely in English.';

function buildRoleDistribution(gameRoles: RoleId[]): string {
  const roleCounts: Record<string, number> = {};
  for (const r of gameRoles) {
    const config = getRolePromptConfigs()[r];
    const name = config?.role ?? r;
    roleCounts[name] = (roleCounts[name] || 0) + 1;
  }
  const playerCount = gameRoles.length - 3;
  const roleList = Object.entries(roleCounts)
    .map(([name, count]) => `${name}x${count}`)
    .join('、');
  return `本局配置（${playerCount}人+3底牌）：${roleList}`;
}

function buildNightInfoBlock(
  nightInfo: NightActionLog,
  originalRole: RoleId,
  playerNames: Record<number, string>
): string {
  const myOrder = NIGHT_ORDER[originalRole] ?? 99;
  const pn = (idx: number) => playerNames[idx] ?? `玩家${idx}`;
  const lines: string[] = [];

  lines.push(`夜间行动（第${myOrder}步）：${nightInfo.description}`);

  if (nightInfo.revealed && nightInfo.revealed.length > 0) {
    lines.push('你看到：');
    for (const r of nightInfo.revealed) {
      if (r.isCenterCard) {
        lines.push(`  - 底牌#${r.targetIndex + 1}：${r.role}`);
      } else {
        lines.push(`  - ${pn(r.targetIndex)}：${r.role}`);
      }
    }
  }

  if (nightInfo.swapped) {
    lines.push(`牌被交换：${pn(nightInfo.swapped.a)} ↔ ${pn(nightInfo.swapped.b)}`);
  }

  return lines.join('\n');
}

/**
 * System prompt: stable per player per game. Contains persona, rules, role info,
 * night info, knowledge board, and role distribution. Maximizes cacheable prefix.
 */
export function buildSystemPrompt(
  roleName: RoleId,
  playerName: string,
  locale: string,
  knowledgeBoard: string,
  nightInfo: NightActionLog | null,
  gameRoles: RoleId[],
  playerNames?: Record<number, string>,
): string {
  const config = getRolePromptConfigs()[roleName];
  const langInstruction = locale === 'zh' ? LANG_INSTRUCTION_ZH : LANG_INSTRUCTION_EN;

  const nightBlock = nightInfo
    ? buildNightInfoBlock(nightInfo, roleName, playerNames ?? {})
    : '你没有夜间行动，没有直接信息。';

  return `你是${playerName}，正在玩一夜终极狼人杀。
${langInstruction}

输出规则：
- 你的回复将直接作为公开发言，所有玩家都能看到
- 禁止输出内心想法独白、推理过程、角色分析。不要输出错误的思考过程
- 只输出你要对其他玩家说的话，2-3句，60字以内
- 不暴露AI身份

游戏规则：
- 被交换的玩家(不管是被强盗，捣蛋鬼，酒鬼交换)不会被通知。不要假设被交换玩家会知道自己的身份被换了，除非场上已经有人公开交换信息
- 夜间能力属于原始角色玩家：被换了牌不会获得新牌的能力。例如村民被换成失眠者牌，该村民不会有失眠者的查看能力
- 被换了牌的玩家可以正常使用原始角色的夜间能力，不要假设被换了牌的玩家会失去原始角色的夜间能力
- 严禁篡改或错误引用他人发言。引用时必须准确
- 独立思考，用夜间信息验证他人逻辑，不盲从
- 不要抓住玩家发言的用词细节，而是关注逻辑和推理过程
- 被指控时要求具体证据，信息矛盾时坚定反驳
- 第一轮不公开身份很正常，第二轮仍不公开则非常可疑
- 好人阵营如果确定自己身份仍然属于阵营好人，则在第二轮公开身份，确保可以推理狼坑

${renderRoleCoreSection(config)}

${nightBlock}

${knowledgeBoard}

${buildRoleDistribution(gameRoles)}`;
}

export function buildVoteSystemPrompt(
  roleName: RoleId,
  playerName: string,
  locale: string,
  knowledgeBoard: string,
): string {
  const config = getRolePromptConfigs()[roleName];
  const langInstruction = locale === 'zh' ? LANG_INSTRUCTION_ZH : LANG_INSTRUCTION_EN;

  return `你是${playerName}，正在玩一夜狼人杀。${config.identity}
阵营目标：${config.teamObjective}
${langInstruction}

${knowledgeBoard}

只回复一个玩家的名字，不要回复其他任何内容。`;
}

export function buildReferenceRules(roleName: RoleId): string {
  const config = getRolePromptConfigs()[roleName];

  return `行动顺序：1.化身幽灵 2.狼人 3.爪牙 4.共济会 5.预言家 6.强盗 7.捣蛋鬼 8.酒鬼 9.失眠者
交换链：原始→强盗换→捣蛋鬼换→酒鬼换→最终。失眠者最后看牌最可靠。
判断：两人声称同一角色→必有人撒谎。统计声称身份对比配置找矛盾。除失眠者外，玩家不一定知道最终身份。

${renderRoleStrategySection(config)}`;
}

export interface DiscussionContext {
  speakingPosition: number;
  totalSpeakers: number;
  currentRound?: number;
  maxRounds?: number;
}

/**
 * User prompt: dynamic per turn. Only chat history + position/round hints.
 * Static content (night info, role distribution, knowledge board) lives in system prompt.
 */
export function buildDiscussionPrompt(
  chatHistory: { name: string; text: string }[],
  context?: DiscussionContext,
  referenceRules?: string,
  playerNames?: Record<number, string>,
): string {
  const recentChat = chatHistory
    .map((m) => `${m.name}: ${m.text}`)
    .join('\n');

  let positionHint = '';
  let roundHint = '';
  if (context) {
    const { speakingPosition, totalSpeakers, currentRound, maxRounds } = context;
    if (speakingPosition <= 1) {
      positionHint = '\n你先发言。主动声明或提问。';
    } else if (speakingPosition >= totalSpeakers - 1) {
      positionHint = '\n你最后发言。总结矛盾，不要重复别人的话。';
    } else {
      positionHint = '\n回应前面的发言，质疑你不认同的部分。';
    }
    if (currentRound && maxRounds) {
      if (currentRound >= maxRounds) {
        roundHint = `\n最后一轮（第${currentRound}/${maxRounds}轮）。说出最关键信息或最终判断。`;
      } else {
        roundHint = `\n第${currentRound}/${maxRounds}轮讨论。`;
      }
    }
  }

  const referenceBlock = referenceRules ? `\n${referenceRules}\n` : '';

  // Suppress unused parameter lint — playerNames reserved for future claim-tracking
  void playerNames;

  return `${roundHint}${positionHint}${referenceBlock}
讨论记录：
${recentChat || '（还没有人发言）'}

轮到你发言。`;
}

export function buildVotePrompt(
  chatHistory: { name: string; text: string }[],
  playerNames: string[],
  nightInfo: NightActionLog | null,
): string {
  const recentChat = chatHistory
    .map((m) => `${m.name}: ${m.text}`)
    .join('\n');

  const nightContext = nightInfo
    ? `你在夜间得到的信息：${nightInfo.description}\n`
    : '';

  return `${nightContext}讨论摘要：
${recentChat}

可投票的玩家：${playerNames.join('、')}
根据讨论和你的夜间信息，谁最可能是狼人？只回复一个名字。`;
}
