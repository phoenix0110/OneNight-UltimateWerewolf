export interface RankInfo {
  id: string;
  nameKey: string; // i18n key
  tier?: number;
  minPoints: number;
  maxPoints: number;
  color: string;
  emoji: string;
}

export const RANKS: RankInfo[] = [
  { id: 'bronze_1', nameKey: 'achievements.bronze', tier: 1, minPoints: 0, maxPoints: 10, color: '#cd7f32', emoji: '🥉' },
  { id: 'silver_1', nameKey: 'achievements.silver', tier: 1, minPoints: 11, maxPoints: 25, color: '#c0c0c0', emoji: '⚪' },
  { id: 'silver_2', nameKey: 'achievements.silver', tier: 2, minPoints: 26, maxPoints: 40, color: '#c0c0c0', emoji: '⚪' },
  { id: 'silver_3', nameKey: 'achievements.silver', tier: 3, minPoints: 41, maxPoints: 60, color: '#c0c0c0', emoji: '⚪' },
  { id: 'gold_1', nameKey: 'achievements.gold', tier: 1, minPoints: 61, maxPoints: 90, color: '#ffd700', emoji: '🥇' },
  { id: 'gold_2', nameKey: 'achievements.gold', tier: 2, minPoints: 91, maxPoints: 120, color: '#ffd700', emoji: '🥇' },
  { id: 'gold_3', nameKey: 'achievements.gold', tier: 3, minPoints: 121, maxPoints: 150, color: '#ffd700', emoji: '🥇' },
  { id: 'platinum_1', nameKey: 'achievements.platinum', tier: 1, minPoints: 151, maxPoints: 200, color: '#00e5ff', emoji: '💎' },
  { id: 'platinum_2', nameKey: 'achievements.platinum', tier: 2, minPoints: 201, maxPoints: 250, color: '#00e5ff', emoji: '💎' },
  { id: 'platinum_3', nameKey: 'achievements.platinum', tier: 3, minPoints: 251, maxPoints: 300, color: '#00e5ff', emoji: '💎' },
  { id: 'diamond_1', nameKey: 'achievements.diamond', tier: 1, minPoints: 301, maxPoints: 400, color: '#b9f2ff', emoji: '💠' },
  { id: 'diamond_2', nameKey: 'achievements.diamond', tier: 2, minPoints: 401, maxPoints: 500, color: '#b9f2ff', emoji: '💠' },
  { id: 'diamond_3', nameKey: 'achievements.diamond', tier: 3, minPoints: 501, maxPoints: 750, color: '#b9f2ff', emoji: '💠' },
  { id: 'master', nameKey: 'achievements.master', minPoints: 751, maxPoints: 1000, color: '#9c27b0', emoji: '👑' },
  { id: 'grandmaster', nameKey: 'achievements.grandmaster', minPoints: 1001, maxPoints: 1500, color: '#f44336', emoji: '🔥' },
  { id: 'king', nameKey: 'achievements.king', minPoints: 1500, maxPoints: Infinity, color: '#ff6f00', emoji: '🏆' },
];

export function getRankInfo(rankId: string): RankInfo {
  return RANKS.find((r) => r.id === rankId) || RANKS[0];
}

export function getRankForPoints(points: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) return RANKS[i];
  }
  return RANKS[0];
}

export function getRankProgress(points: number): number {
  const rank = getRankForPoints(points);
  if (rank.maxPoints === Infinity) return 100;
  const range = rank.maxPoints - rank.minPoints;
  const progress = points - rank.minPoints;
  return Math.min(100, Math.round((progress / range) * 100));
}
