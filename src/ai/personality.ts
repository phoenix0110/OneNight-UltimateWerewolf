import { PERSONALITY_CONFIGS, PERSONALITY_TYPES, PersonalityConfig, PersonalityType } from './personality-config';

export interface AIPersonality {
  name: string;
  type: PersonalityType;
  config: PersonalityConfig;
}

const NAMES_POOL = [
  'Alex', 'Blake', 'Casey', 'Drew', 'Ellis',
  'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan',
  'Kit', 'Luna', 'Morgan', 'Nova', 'Oakley',
  'Phoenix', 'Quinn', 'Riley', 'Sage', 'Tatum',
];

export function generatePersonalities(count: number): AIPersonality[] {
  const shuffledNames = [...NAMES_POOL].sort(() => Math.random() - 0.5);

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
  return `Your name is ${personality.name}.

PERSONALITY — HOW YOU BEHAVE:
${config.speakingStyle}

PERSONALITY — HOW YOU FORM OPINIONS:
${config.decisionStyle}

Keep all responses to 1-3 SHORT sentences. Be concise but in-character.`;
}

export function getVotePersonalityPrompt(personality: AIPersonality): string {
  return personality.config.voteStyle;
}
