import { GameState, NightActionLog, swapRoles } from './game-state';
import { getRolesWithNightActions, RoleId } from './roles';

export interface NightActionChoice {
  role: RoleId;
  targets?: number[]; // player indices
  centerTargets?: number[]; // center card indices (0-2)
  option?: 'player' | 'center'; // for Seer: choose to view player or center
}

export function getAvailableNightAction(
  state: GameState,
  playerIndex: number
): NightActionChoice | null {
  const role = state.players[playerIndex].originalRole;
  const otherPlayers = state.players
    .filter((_, i) => i !== playerIndex)
    .map((p) => p.id);

  switch (role) {
    case 'werewolf':
      return { role, targets: [], option: 'player' };
    case 'seer':
      return { role, targets: [], option: 'player' };
    case 'robber':
      return { role, targets: otherPlayers };
    case 'troublemaker':
      return { role, targets: otherPlayers };
    case 'insomniac':
      return { role };
    case 'minion':
      return { role };
    case 'mason':
      return { role };
    case 'drunk':
      return { role, centerTargets: [0, 1, 2] };
    default:
      return null;
  }
}

export function resolveNightAction(
  state: GameState,
  action: NightActionChoice,
  actorIndex: number
): { state: GameState; log: NightActionLog } {
  switch (action.role) {
    case 'werewolf':
      return resolveWerewolf(state, actorIndex);
    case 'seer':
      return resolveSeer(state, actorIndex, action);
    case 'robber':
      return resolveRobber(state, actorIndex, action);
    case 'troublemaker':
      return resolveTroublemaker(state, actorIndex, action);
    case 'insomniac':
      return resolveInsomniac(state, actorIndex);
    case 'minion':
      return resolveMinion(state, actorIndex);
    case 'mason':
      return resolveMason(state, actorIndex);
    case 'drunk':
      return resolveDrunk(state, actorIndex, action);
    case 'doppelganger':
      return resolveDoppelganger(state, actorIndex, action);
    default:
      return {
        state,
        log: { role: action.role, actorIndex, description: 'No action' },
      };
  }
}

function resolveWerewolf(
  state: GameState,
  actorIndex: number
): { state: GameState; log: NightActionLog } {
  const werewolves = state.players.filter(
    (p) => p.originalRole === 'werewolf'
  );
  const otherWerewolves = werewolves.filter((w) => w.id !== actorIndex);

  if (otherWerewolves.length > 0) {
    return {
      state,
      log: {
        role: 'werewolf',
        actorIndex,
        description: `Werewolf sees other werewolf: ${otherWerewolves.map((w) => w.name).join(', ')}`,
        revealed: otherWerewolves.map((w) => ({
          targetIndex: w.id,
          role: 'werewolf' as RoleId,
        })),
      },
    };
  }

  // Lone wolf: peek at one random center card
  const centerIdx = Math.floor(Math.random() * 3);
  return {
    state,
    log: {
      role: 'werewolf',
      actorIndex,
      description: `Lone Werewolf peeks at center card ${centerIdx + 1}: ${state.centerCards[centerIdx]}`,
      revealed: [{ targetIndex: centerIdx, role: state.centerCards[centerIdx] }],
    },
  };
}

function resolveSeer(
  state: GameState,
  actorIndex: number,
  action: NightActionChoice
): { state: GameState; log: NightActionLog } {
  if (action.option === 'center' && action.centerTargets?.length === 2) {
    const [c1, c2] = action.centerTargets;
    return {
      state,
      log: {
        role: 'seer',
        actorIndex,
        description: `Seer views center cards ${c1 + 1} and ${c2 + 1}: ${state.centerCards[c1]}, ${state.centerCards[c2]}`,
        revealed: [
          { targetIndex: c1, role: state.centerCards[c1] },
          { targetIndex: c2, role: state.centerCards[c2] },
        ],
      },
    };
  }

  if (action.targets?.length === 1) {
    const targetIdx = action.targets[0];
    return {
      state,
      log: {
        role: 'seer',
        actorIndex,
        description: `Seer views ${state.players[targetIdx].name}'s card: ${state.players[targetIdx].currentRole}`,
        revealed: [
          {
            targetIndex: targetIdx,
            role: state.players[targetIdx].currentRole,
          },
        ],
      },
    };
  }

  return {
    state,
    log: { role: 'seer', actorIndex, description: 'Seer did not act' },
  };
}

function resolveRobber(
  state: GameState,
  actorIndex: number,
  action: NightActionChoice
): { state: GameState; log: NightActionLog } {
  if (!action.targets?.length) {
    return {
      state,
      log: { role: 'robber', actorIndex, description: 'Robber did not swap' },
    };
  }

  const targetIdx = action.targets[0];
  const stolenRole = state.players[targetIdx].currentRole;
  const newState = swapRoles(state, actorIndex, targetIdx);

  return {
    state: newState,
    log: {
      role: 'robber',
      actorIndex,
      description: `Robber swaps with ${state.players[targetIdx].name} and is now ${stolenRole}`,
      revealed: [{ targetIndex: targetIdx, role: stolenRole }],
      swapped: { a: actorIndex, b: targetIdx },
    },
  };
}

function resolveTroublemaker(
  state: GameState,
  actorIndex: number,
  action: NightActionChoice
): { state: GameState; log: NightActionLog } {
  if (!action.targets || action.targets.length < 2) {
    return {
      state,
      log: {
        role: 'troublemaker',
        actorIndex,
        description: 'Troublemaker did not swap',
      },
    };
  }

  const [t1, t2] = action.targets;
  const newState = swapRoles(state, t1, t2);

  return {
    state: newState,
    log: {
      role: 'troublemaker',
      actorIndex,
      description: `Troublemaker swaps ${state.players[t1].name} and ${state.players[t2].name}`,
      swapped: { a: t1, b: t2 },
    },
  };
}

function resolveInsomniac(
  state: GameState,
  actorIndex: number
): { state: GameState; log: NightActionLog } {
  return {
    state,
    log: {
      role: 'insomniac',
      actorIndex,
      description: `Insomniac checks own card: ${state.players[actorIndex].currentRole}`,
      revealed: [
        {
          targetIndex: actorIndex,
          role: state.players[actorIndex].currentRole,
        },
      ],
    },
  };
}

function resolveMinion(
  state: GameState,
  actorIndex: number
): { state: GameState; log: NightActionLog } {
  const werewolves = state.players.filter(
    (p) => p.originalRole === 'werewolf'
  );
  return {
    state,
    log: {
      role: 'minion',
      actorIndex,
      description:
        werewolves.length > 0
          ? `Minion sees werewolves: ${werewolves.map((w) => w.name).join(', ')}`
          : 'Minion sees no werewolves',
      revealed: werewolves.map((w) => ({
        targetIndex: w.id,
        role: 'werewolf' as RoleId,
      })),
    },
  };
}

function resolveMason(
  state: GameState,
  actorIndex: number
): { state: GameState; log: NightActionLog } {
  const masons = state.players.filter(
    (p) => p.originalRole === 'mason' && p.id !== actorIndex
  );
  return {
    state,
    log: {
      role: 'mason',
      actorIndex,
      description:
        masons.length > 0
          ? `Mason sees other mason: ${masons.map((m) => m.name).join(', ')}`
          : 'Mason sees no other mason',
      revealed: masons.map((m) => ({
        targetIndex: m.id,
        role: 'mason' as RoleId,
      })),
    },
  };
}

function resolveDrunk(
  state: GameState,
  actorIndex: number,
  action: NightActionChoice
): { state: GameState; log: NightActionLog } {
  const centerIdx =
    action.centerTargets?.[0] ?? Math.floor(Math.random() * 3);
  const newState = swapRoles(state, actorIndex, centerIdx, true);

  return {
    state: newState,
    log: {
      role: 'drunk',
      actorIndex,
      description: `Drunk swaps card with center card ${centerIdx + 1} (unknown)`,
      swapped: { a: actorIndex, b: centerIdx },
    },
  };
}

function resolveDoppelganger(
  state: GameState,
  actorIndex: number,
  action: NightActionChoice
): { state: GameState; log: NightActionLog } {
  if (!action.targets?.length) {
    return {
      state,
      log: {
        role: 'doppelganger',
        actorIndex,
        description: 'Doppelganger did not copy',
      },
    };
  }

  const targetIdx = action.targets[0];
  const copiedRole = state.players[targetIdx].originalRole;

  return {
    state,
    log: {
      role: 'doppelganger',
      actorIndex,
      description: `Doppelganger copies ${state.players[targetIdx].name}'s role: ${copiedRole}`,
      revealed: [{ targetIndex: targetIdx, role: copiedRole }],
    },
  };
}

export function processAllNightActions(
  state: GameState,
  humanAction: NightActionChoice | null
): GameState {
  const nightRoles = getRolesWithNightActions(state.config.roles);
  let currentState = { ...state, nightActions: [] as NightActionLog[] };

  for (const role of nightRoles) {
    const actors = currentState.players.filter(
      (p) => p.originalRole === role
    );

    for (const actor of actors) {
      let action: NightActionChoice;

      if (actor.isHuman && humanAction) {
        action = humanAction;
      } else {
        action = generateAINightAction(currentState, actor.id, role);
      }

      const result = resolveNightAction(currentState, action, actor.id);
      currentState = {
        ...result.state,
        nightActions: [...currentState.nightActions, result.log],
      };
    }
  }

  return { ...currentState, phase: 'day' };
}

function generateAINightAction(
  state: GameState,
  actorIndex: number,
  role: RoleId
): NightActionChoice {
  const otherPlayers = state.players
    .filter((p) => p.id !== actorIndex)
    .map((p) => p.id);

  switch (role) {
    case 'seer': {
      const viewPlayer = Math.random() > 0.4;
      if (viewPlayer) {
        const target =
          otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        return { role, targets: [target], option: 'player' };
      }
      const indices = [0, 1, 2];
      const c1 = indices.splice(
        Math.floor(Math.random() * indices.length),
        1
      )[0];
      const c2 = indices[Math.floor(Math.random() * indices.length)];
      return { role, centerTargets: [c1, c2], option: 'center' };
    }

    case 'robber': {
      const target =
        otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      return { role, targets: [target] };
    }

    case 'troublemaker': {
      const shuffled = [...otherPlayers].sort(() => Math.random() - 0.5);
      return { role, targets: [shuffled[0], shuffled[1]] };
    }

    case 'drunk': {
      const centerIdx = Math.floor(Math.random() * 3);
      return { role, centerTargets: [centerIdx] };
    }

    case 'doppelganger': {
      const target =
        otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      return { role, targets: [target] };
    }

    default:
      return { role };
  }
}
