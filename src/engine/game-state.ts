import { RoleId } from './roles';

export type GamePhase =
  | 'setup'
  | 'role_reveal'
  | 'night'
  | 'day'
  | 'vote'
  | 'resolution';

export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  originalRole: RoleId;
  currentRole: RoleId; // may change due to Robber/Troublemaker/Drunk swaps
  votedFor: number | null; // player id they voted for
}

export interface NightActionLog {
  role: RoleId;
  actorIndex: number; // player index or -1 for center-only
  description: string; // human-readable log
  revealed?: { targetIndex: number; role: RoleId }[];
  swapped?: { a: number; b: number }; // indices that were swapped
}

export interface ChatMessage {
  playerId: number;
  playerName: string;
  text: string;
  timestamp: number;
  isBuiltIn: boolean; // was a pre-written prompt
}

export interface GameConfig {
  playerCount: number;
  playerName: string;
  roles: RoleId[]; // exactly playerCount + 3
  aiProvider: string;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  centerCards: RoleId[]; // always 3
  originalCenterCards: RoleId[]; // snapshot before swaps
  nightActions: NightActionLog[];
  currentNightRoleIndex: number; // index into the night order being processed
  chatMessages: ChatMessage[];
  votes: Record<number, number>; // voterId -> targetId
  killedPlayerIds: number[];
  winners: ('village' | 'werewolf' | 'tanner')[];
  humanPlayerIndex: number;
  config: GameConfig;
}

export function createInitialState(config: GameConfig): GameState {
  const shuffled = shuffleArray([...config.roles]);
  const centerCards = shuffled.slice(0, 3);
  const playerRoles = shuffled.slice(3);

  const players: Player[] = playerRoles.map((role, i) => ({
    id: i,
    name: i === 0 ? config.playerName : `Player ${i + 1}`,
    isHuman: i === 0,
    originalRole: role,
    currentRole: role,
    votedFor: null,
  }));

  return {
    phase: 'role_reveal',
    players,
    centerCards: [...centerCards],
    originalCenterCards: [...centerCards],
    nightActions: [],
    currentNightRoleIndex: 0,
    chatMessages: [],
    votes: {},
    killedPlayerIds: [],
    winners: [],
    humanPlayerIndex: 0,
    config,
  };
}

export function swapRoles(
  state: GameState,
  indexA: number,
  indexB: number,
  isCenter: boolean = false
): GameState {
  const newPlayers = state.players.map((p) => ({ ...p }));
  const newCenter = [...state.centerCards];

  if (isCenter) {
    // indexA = player index, indexB = center card index
    const temp = newPlayers[indexA].currentRole;
    newPlayers[indexA].currentRole = newCenter[indexB];
    newCenter[indexB] = temp;
  } else {
    const temp = newPlayers[indexA].currentRole;
    newPlayers[indexA].currentRole = newPlayers[indexB].currentRole;
    newPlayers[indexB].currentRole = temp;
  }

  return { ...state, players: newPlayers, centerCards: newCenter };
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
