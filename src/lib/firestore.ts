import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { RoleId } from '@/engine/roles';

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  stats: UserStats;
  rankPoints: number;
  rank: string;
  subscription: { plan: 'free' | 'premium'; expiresAt: Date | null };
  createdAt: Date;
}

export interface GameRecord {
  userId: string;
  playerCount: number;
  rolesInGame: RoleId[];
  playerRole: RoleId;
  finalRole: RoleId;
  result: 'village_win' | 'werewolf_win' | 'tanner_win';
  didWin: boolean;
  timestamp: Date;
}

export async function saveGameResult(
  userId: string,
  record: Omit<GameRecord, 'userId' | 'timestamp'>
): Promise<void> {
  if (!db) return;

  await addDoc(collection(db, 'gameHistory'), {
    ...record,
    userId,
    timestamp: serverTimestamp(),
  });

  const userRef = doc(db, 'users', userId);
  const pointChange = record.didWin ? 20 : -10;

  const userSnap = await getDoc(userRef);
  const currentPoints = userSnap.data()?.rankPoints || 0;
  const newPoints = Math.max(0, currentPoints + pointChange);

  await updateDoc(userRef, {
    'stats.gamesPlayed': increment(1),
    'stats.wins': increment(record.didWin ? 1 : 0),
    'stats.losses': increment(record.didWin ? 0 : 1),
    rankPoints: newPoints,
    rank: calculateRank(newPoints),
  });

  // Update win rate
  const updatedSnap = await getDoc(userRef);
  const stats = updatedSnap.data()?.stats;
  if (stats && stats.gamesPlayed > 0) {
    await updateDoc(userRef, {
      'stats.winRate': Math.round((stats.wins / stats.gamesPlayed) * 100),
    });
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  if (!db) return null;

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function getGameHistory(
  userId: string,
  maxResults: number = 20
): Promise<GameRecord[]> {
  if (!db) return [];

  const q = query(
    collection(db, 'gameHistory'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GameRecord);
}

export async function getLeaderboard(
  maxResults: number = 50
): Promise<{ displayName: string; rankPoints: number; rank: string }[]> {
  if (!db) return [];

  const q = query(
    collection(db, 'users'),
    orderBy('rankPoints', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    displayName: d.data().displayName,
    rankPoints: d.data().rankPoints,
    rank: d.data().rank,
  }));
}

function calculateRank(points: number): string {
  if (points >= 1500) return 'king';
  if (points >= 1001) return 'grandmaster';
  if (points >= 751) return 'master';
  if (points >= 501) return 'diamond_3';
  if (points >= 401) return 'diamond_2';
  if (points >= 301) return 'diamond_1';
  if (points >= 251) return 'platinum_3';
  if (points >= 201) return 'platinum_2';
  if (points >= 151) return 'platinum_1';
  if (points >= 121) return 'gold_3';
  if (points >= 91) return 'gold_2';
  if (points >= 61) return 'gold_1';
  if (points >= 41) return 'silver_3';
  if (points >= 26) return 'silver_2';
  if (points >= 11) return 'silver_1';
  return 'bronze_1';
}

export { calculateRank };
