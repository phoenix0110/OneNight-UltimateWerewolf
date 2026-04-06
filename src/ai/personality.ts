export interface AIPersonality {
  name: string;
  trait: 'aggressive' | 'cautious' | 'analytical' | 'chaotic';
  speakingStyle: string;
}

const NAMES_POOL = [
  'Alex', 'Blake', 'Casey', 'Drew', 'Ellis',
  'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan',
  'Kit', 'Luna', 'Morgan', 'Nova', 'Oakley',
  'Phoenix', 'Quinn', 'Riley', 'Sage', 'Tatum',
];

const TRAITS: AIPersonality['trait'][] = [
  'aggressive',
  'cautious',
  'analytical',
  'chaotic',
];

const TRAIT_STYLES: Record<AIPersonality['trait'], string> = {
  aggressive:
    'You are direct, confrontational, and quick to accuse. You push hard when suspicious.',
  cautious:
    'You are careful, observant, and reluctant to make bold claims without evidence.',
  analytical:
    'You focus on logic, deduction, and inconsistencies in what others say.',
  chaotic:
    'You are unpredictable, sometimes funny, and keep others guessing about your motives.',
};

export function generatePersonalities(count: number): AIPersonality[] {
  const shuffledNames = [...NAMES_POOL].sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, i) => {
    const trait = TRAITS[i % TRAITS.length];
    return {
      name: shuffledNames[i % shuffledNames.length],
      trait,
      speakingStyle: TRAIT_STYLES[trait],
    };
  });
}

export function getPersonalityPrompt(personality: AIPersonality): string {
  return `Your name is ${personality.name}. ${personality.speakingStyle} Keep all responses to 1-2 SHORT sentences max. Be concise.`;
}
