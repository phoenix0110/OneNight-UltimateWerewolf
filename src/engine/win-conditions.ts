import { GameState } from './game-state';
import { VoteResult } from './voting';

export type WinResult = {
  winners: ('village' | 'werewolf' | 'tanner')[];
  reason: string;
  playerResults: { playerId: number; won: boolean; finalRole: string }[];
};

export function determineWinners(
  state: GameState,
  voteResult: VoteResult
): WinResult {
  const { killedPlayerIds } = voteResult;
  const winners: ('village' | 'werewolf' | 'tanner')[] = [];

  const werewolvesInGame = state.players.filter(
    (p) => p.currentRole === 'werewolf'
  );
  const killedWerewolves = killedPlayerIds.filter(
    (id) => state.players[id].currentRole === 'werewolf'
  );
  const killedTanner = killedPlayerIds.find(
    (id) => state.players[id].currentRole === 'tanner'
  );

  let reason = '';

  // Tanner win check (independent)
  if (killedTanner !== undefined) {
    winners.push('tanner');
  }

  if (werewolvesInGame.length === 0) {
    // No werewolves in play
    if (killedPlayerIds.length === 0) {
      winners.push('village');
      reason = 'No werewolves in play and nobody was killed. Village wins!';
    } else {
      winners.push('werewolf');
      reason =
        'No werewolves in play but someone was killed. Werewolf team wins!';
    }
  } else {
    // Werewolves exist
    if (killedWerewolves.length > 0) {
      winners.push('village');
      reason = 'A werewolf was killed! Village wins!';
    } else {
      winners.push('werewolf');
      reason = 'No werewolf was killed. Werewolf team wins!';
    }
  }

  if (killedTanner !== undefined) {
    reason += ' Tanner also wins by getting killed!';
  }

  const playerResults = state.players.map((p) => {
    const currentTeam =
      p.currentRole === 'tanner'
        ? 'tanner'
        : p.currentRole === 'werewolf' || p.currentRole === 'minion'
          ? 'werewolf'
          : 'village';
    return {
      playerId: p.id,
      won: winners.includes(currentTeam),
      finalRole: p.currentRole,
    };
  });

  return { winners, reason, playerResults };
}
