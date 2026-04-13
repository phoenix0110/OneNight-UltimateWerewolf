export interface RankTier {
  id: string;
  nameKey: string;
  color: string;
  emoji: string;
}

export interface RankSubLevel {
  id: string;
  tier: RankTier;
  subRank: number; // 3=III, 2=II, 1=I (lower number = higher sub-rank)
  starsToPromote: number;
  cumulativeStarsAtStart: number;
}

export interface RankPosition {
  subLevel: RankSubLevel;
  currentStars: number; // stars earned within this sub-level (0..starsToPromote-1, or 0..N for King)
  totalStars: number;
}

const TIERS: RankTier[] = [
  { id: 'bronze', nameKey: 'achievements.bronze', color: '#cd7f32', emoji: '🥉' },
  { id: 'silver', nameKey: 'achievements.silver', color: '#c0c0c0', emoji: '⚪' },
  { id: 'gold', nameKey: 'achievements.gold', color: '#ffd700', emoji: '🥇' },
  { id: 'platinum', nameKey: 'achievements.platinum', color: '#00e5ff', emoji: '💎' },
  { id: 'diamond', nameKey: 'achievements.diamond', color: '#b9f2ff', emoji: '💠' },
  { id: 'superstar', nameKey: 'achievements.superstar', color: '#9c27b0', emoji: '🌟' },
  { id: 'king', nameKey: 'achievements.king', color: '#ff6f00', emoji: '👑' },
];

interface SubRankDef {
  tierId: string;
  subRanks: number[]; // e.g. [3,2,1] for III, II, I
  starsPerSub: number;
}

const SUB_RANK_DEFS: SubRankDef[] = [
  { tierId: 'bronze', subRanks: [3, 2, 1], starsPerSub: 3 },
  { tierId: 'silver', subRanks: [3, 2, 1], starsPerSub: 3 },
  { tierId: 'gold', subRanks: [3, 2, 1], starsPerSub: 4 },
  { tierId: 'platinum', subRanks: [3, 2, 1], starsPerSub: 4 },
  { tierId: 'diamond', subRanks: [3, 2, 1], starsPerSub: 4 },
  { tierId: 'superstar', subRanks: [3, 2, 1], starsPerSub: 5 },
];

// Build the flat list of sub-levels with cumulative star thresholds
const SUB_LEVELS: RankSubLevel[] = [];
let cumulative = 0;

for (const def of SUB_RANK_DEFS) {
  const tier = TIERS.find((t) => t.id === def.tierId)!;
  for (const sub of def.subRanks) {
    SUB_LEVELS.push({
      id: `${def.tierId}_${sub}`,
      tier,
      subRank: sub,
      starsToPromote: def.starsPerSub,
      cumulativeStarsAtStart: cumulative,
    });
    cumulative += def.starsPerSub;
  }
}

// King has no sub-ranks — stars are uncapped
const KING_TIER = TIERS.find((t) => t.id === 'king')!;
const KING_THRESHOLD = cumulative; // total stars needed to reach King

const KING_SUB_LEVEL: RankSubLevel = {
  id: 'king',
  tier: KING_TIER,
  subRank: 0,
  starsToPromote: Infinity,
  cumulativeStarsAtStart: KING_THRESHOLD,
};

export function getRankPosition(totalStars: number): RankPosition {
  if (totalStars >= KING_THRESHOLD) {
    return {
      subLevel: KING_SUB_LEVEL,
      currentStars: totalStars - KING_THRESHOLD,
      totalStars,
    };
  }

  for (let i = SUB_LEVELS.length - 1; i >= 0; i--) {
    if (totalStars >= SUB_LEVELS[i].cumulativeStarsAtStart) {
      return {
        subLevel: SUB_LEVELS[i],
        currentStars: totalStars - SUB_LEVELS[i].cumulativeStarsAtStart,
        totalStars,
      };
    }
  }

  return { subLevel: SUB_LEVELS[0], currentStars: 0, totalStars: 0 };
}

export function getRankId(totalStars: number): string {
  return getRankPosition(totalStars).subLevel.id;
}

export function addStar(totalStars: number): number {
  return totalStars + 1;
}

export function removeStar(totalStars: number): number {
  return Math.max(0, totalStars - 1);
}

export function getSubRankLabel(subRank: number): string {
  if (subRank === 0) return '';
  const labels: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III' };
  return labels[subRank] || '';
}

export function formatRankDisplay(position: RankPosition): string {
  const sub = getSubRankLabel(position.subLevel.subRank);
  if (position.subLevel.id === 'king') {
    return `${position.currentStars}`;
  }
  return sub;
}

export { TIERS, SUB_LEVELS, KING_THRESHOLD, KING_SUB_LEVEL };
