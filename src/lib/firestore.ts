import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { RoleId } from '@/engine/roles';
import { addStar, getRankId, removeStar } from './rank';

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export type SubscriptionPlan = 'free' | 'paid';

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  nickname?: string;
  stats: UserStats;
  stars: number;
  rank: string;
  subscription: {
    plan: SubscriptionPlan;
    gamesRemaining: number;
    expiresAt: Date | null;
  };
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
  const userSnap = await getDoc(userRef);
  const currentStars = userSnap.data()?.stars || 0;
  const newStars = record.didWin ? addStar(currentStars) : removeStar(currentStars);

  await updateDoc(userRef, {
    'stats.gamesPlayed': increment(1),
    'stats.wins': increment(record.didWin ? 1 : 0),
    'stats.losses': increment(record.didWin ? 0 : 1),
    stars: newStars,
    rank: getRankId(newStars),
  });

  const updatedSnap = await getDoc(userRef);
  const stats = updatedSnap.data()?.stats;
  if (stats && stats.gamesPlayed > 0) {
    await updateDoc(userRef, {
      'stats.winRate': Math.round((stats.wins / stats.gamesPlayed) * 100),
    });
  }
}

export async function consumeGame(userId: string): Promise<boolean> {
  if (!db) return false;

  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const sub = data.subscription;
    if (!sub) return false;

    const remaining = sub.gamesRemaining ?? 0;
    if (remaining <= 0) return false;

    await updateDoc(userRef, {
      'subscription.gamesRemaining': increment(-1),
    });
    return true;
  } catch (error) {
    console.warn('[Firestore] consumeGame failed (possibly offline):', error);
    // Fail open for gameplay: don't block local match start when quota check cannot reach Firestore.
    return true;
  }
}

export async function canStartGame(userId: string): Promise<{ allowed: boolean; gamesRemaining: number }> {
  if (!db) return { allowed: true, gamesRemaining: Infinity };

  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { allowed: true, gamesRemaining: 1 };

    const data = snap.data();
    const sub = data.subscription;
    if (!sub) return { allowed: true, gamesRemaining: 1 };

    const remaining = sub.gamesRemaining ?? 0;
    return { allowed: remaining > 0, gamesRemaining: remaining };
  } catch (error) {
    console.warn('[Firestore] canStartGame failed (possibly offline):', error);
    return { allowed: true, gamesRemaining: Infinity };
  }
}

export async function updateNickname(userId: string, nickname: string): Promise<void> {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { nickname: nickname.trim() });
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
): Promise<{ displayName: string; stars: number; rank: string }[]> {
  if (!db) return [];

  const q = query(
    collection(db, 'users'),
    orderBy('stars', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    displayName: d.data().displayName,
    stars: d.data().stars ?? d.data().rankPoints ?? 0,
    rank: d.data().rank,
  }));
}
