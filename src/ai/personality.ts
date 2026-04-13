import { PERSONALITY_CONFIGS, PERSONALITY_TYPES, PersonalityConfig, PersonalityType } from './personality-config';

export interface AIPersonality {
  name: string;
  type: PersonalityType;
  config: PersonalityConfig;
}

const NAMES_EN = [
  'Alex', 'Blake', 'Casey', 'Drew', 'Ellis',
  'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan',
  'Kit', 'Luna', 'Morgan', 'Nova', 'Oakley',
  'Phoenix', 'Quinn', 'Riley', 'Sage', 'Tatum',
];

const NAMES_ZH = [
  '楚天歌', '顾流苏', '沈夜澜', '柳暮烟', '萧寒声',
  '苏晚棠', '裴惊鸿', '陆九歌', '白鹤归', '叶霜序',
  '谢长安', '温如玉', '凌未央', '宋清辞', '江渡月',
  '卫晏然', '程无忧', '霍淮安', '方鹤鸣', '姜子默',
];

const NAMES_POOL: Record<string, string[]> = {
  en: NAMES_EN,
  zh: NAMES_ZH,
};

export function generatePersonalities(count: number, locale = 'en'): AIPersonality[] {
  const pool = NAMES_POOL[locale] || NAMES_EN;
  const shuffledNames = [...pool].sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, i) => {
    const type = PERSONALITY_TYPES[i % PERSONALITY_TYPES.length];
    return {
      name: shuffledNames[i % shuffledNames.length],
      type,
      config: PERSONALITY_CONFIGS[type],
    };
  });
}

export function getPersonalityPrompt(personality: AIPersonality): string {
  const { config } = personality;

  return `你的名字是${personality.name}。

性格——你的行为方式：
${config.speakingStyle}

性格——你如何形成观点：
${config.decisionStyle}

所有回复控制在1-3句短句。简洁但符合角色性格。`;
}

export function getPersonalityPromptCompact(personality: AIPersonality): string {
  return `你的名字是${personality.name}。
${personality.config.speakingStyle}
回复控制在1-3句短句。`;
}

export function getVotePersonalityPrompt(personality: AIPersonality): string {
  return personality.config.voteStyle;
}
