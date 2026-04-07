/**
 * Game Rules & Constants for One Night Ultimate Werewolf
 *
 * All core game configuration lives here.
 * Change this file to adjust player counts, role presets, center card count, etc.
 */

import { RoleId } from './roles';

// ─── Player Configuration ────────────────────────────────────────────
/** Minimum number of players allowed */
export const MIN_PLAYERS = 5;
/** Maximum number of players allowed */
export const MAX_PLAYERS = 8;
/** Available player count options in the UI */
export const PLAYER_COUNT_OPTIONS = [5, 6, 7, 8] as const;

// ─── Center Cards ────────────────────────────────────────────────────
/**
 * In One Night Ultimate Werewolf, there are always 3 cards placed
 * face-down in the center of the table. These are not dealt to players.
 * Total roles needed = playerCount + CENTER_CARD_COUNT
 */
export const CENTER_CARD_COUNT = 3;

/** Calculate total roles needed for a given player count */
export function calculateRequiredRoles(playerCount: number): number {
  return playerCount + CENTER_CARD_COUNT;
}

// ─── Discussion ──────────────────────────────────────────────────────
/** Number of discussion rounds before voting */
export const DISCUSSION_ROUNDS = 1;

// ─── Default Role Presets ────────────────────────────────────────────
/**
 * Pre-configured role selections for each player count.
 * Each preset has exactly (playerCount + CENTER_CARD_COUNT) roles.
 *
 * These presets define the default starting configuration when
 * a player selects a specific player count.
 */
export const DEFAULT_ROLE_CONFIGS: Record<number, RoleId[]> = {
  // 5 players → 8 total roles (5 dealt + 3 center)
  5: [
    'werewolf', 'werewolf', 'seer', 'robber', 'troublemaker',
    'villager', 'villager', 'insomniac',
  ],
  // 6 players → 9 total roles (6 dealt + 3 center)
  6: [
    'werewolf', 'werewolf', 'seer', 'robber', 'troublemaker',
    'villager', 'villager', 'drunk', 'insomniac',
  ],
  // 7 players → 10 total roles (7 dealt + 3 center)
  7: [
    'werewolf', 'werewolf', 'minion', 'seer', 'robber',
    'troublemaker', 'villager', 'drunk', 'insomniac', 'hunter',
  ],
  // 8 players → 11 total roles (8 dealt + 3 center)
  8: [
    'werewolf', 'werewolf', 'minion', 'seer', 'robber',
    'troublemaker', 'villager', 'villager', 'drunk', 'insomniac', 'tanner',
  ],
};

// ─── All available roles for selection UI ────────────────────────────
export const ALL_ROLE_OPTIONS: RoleId[] = [
  'werewolf', 'seer', 'robber', 'troublemaker', 'villager',
  'insomniac', 'drunk', 'hunter', 'tanner', 'minion', 'mason', 'doppelganger',
];
