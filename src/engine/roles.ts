export type RoleId =
  | 'werewolf'
  | 'seer'
  | 'robber'
  | 'troublemaker'
  | 'villager'
  | 'insomniac'
  | 'drunk'
  | 'hunter'
  | 'tanner'
  | 'minion'
  | 'mason'
  | 'doppelganger';

export type Team = 'village' | 'werewolf' | 'tanner';

export interface RoleDefinition {
  id: RoleId;
  team: Team;
  nightOrder: number; // -1 = no night action
  maxCount: number;
  hasNightAction: boolean;
  isMvpRole: boolean;
}

export const ROLES: Record<RoleId, RoleDefinition> = {
  doppelganger: {
    id: 'doppelganger',
    team: 'village',
    nightOrder: 0,
    maxCount: 1,
    hasNightAction: true,
    isMvpRole: false,
  },
  werewolf: {
    id: 'werewolf',
    team: 'werewolf',
    nightOrder: 1,
    maxCount: 2,
    hasNightAction: true,
    isMvpRole: true,
  },
  minion: {
    id: 'minion',
    team: 'werewolf',
    nightOrder: 2,
    maxCount: 1,
    hasNightAction: true,
    isMvpRole: false,
  },
  mason: {
    id: 'mason',
    team: 'village',
    nightOrder: 3,
    maxCount: 2,
    hasNightAction: true,
    isMvpRole: false,
  },
  seer: {
    id: 'seer',
    team: 'village',
    nightOrder: 4,
    maxCount: 1,
    hasNightAction: true,
    isMvpRole: true,
  },
  robber: {
    id: 'robber',
    team: 'village',
    nightOrder: 5,
    maxCount: 1,
    hasNightAction: true,
    isMvpRole: true,
  },
  troublemaker: {
    id: 'troublemaker',
    team: 'village',
    nightOrder: 6,
    maxCount: 1,
    hasNightAction: true,
    isMvpRole: true,
  },
  drunk: {
    id: 'drunk',
    team: 'village',
    nightOrder: 7,
    maxCount: 1,
    hasNightAction: true,
    isMvpRole: false,
  },
  insomniac: {
    id: 'insomniac',
    team: 'village',
    nightOrder: 8,
    maxCount: 1,
    hasNightAction: true,
    isMvpRole: true,
  },
  villager: {
    id: 'villager',
    team: 'village',
    nightOrder: -1,
    maxCount: 3,
    hasNightAction: false,
    isMvpRole: true,
  },
  hunter: {
    id: 'hunter',
    team: 'village',
    nightOrder: -1,
    maxCount: 1,
    hasNightAction: false,
    isMvpRole: false,
  },
  tanner: {
    id: 'tanner',
    team: 'tanner',
    nightOrder: -1,
    maxCount: 1,
    hasNightAction: false,
    isMvpRole: false,
  },
};

export const NIGHT_ORDER: RoleId[] = [
  'doppelganger',
  'werewolf',
  'minion',
  'mason',
  'seer',
  'robber',
  'troublemaker',
  'drunk',
  'insomniac',
];

export function getRolesWithNightActions(rolesInGame: RoleId[]): RoleId[] {
  const roleSet = new Set(rolesInGame);
  return NIGHT_ORDER.filter((r) => roleSet.has(r));
}

export function getTeamForRole(roleId: RoleId): Team {
  return ROLES[roleId].team;
}
