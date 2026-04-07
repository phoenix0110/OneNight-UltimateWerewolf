import { GameState } from './game-state';
import { VoteResult } from './voting';

export type WinReasonKey =
  | 'reasonNoWwNobodyDied'
  | 'reasonNoWwSomeoneDied'
  | 'reasonWwKilled'
  | 'reasonNoWwKilled';

export type WinResult = {
  winners: ('village' | 'werewolf' | 'tanner')[];
  reasonKey: WinReasonKey;
  tannerAlsoWins: boolean;
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

  let reasonKey: WinReasonKey;
  const tannerAlsoWins = killedTanner !== undefined;

  // Tanner win check (independent)
  if (tannerAlsoWins) {
    winners.push('tanner');
  }

  if (werewolvesInGame.length === 0) {
    // No werewolves in play
    if (killedPlayerIds.length === 0) {
      winners.push('village');
      reasonKey = 'reasonNoWwNobodyDied';
    } else {
      winners.push('werewolf');
      reasonKey = 'reasonNoWwSomeoneDied';
    }
  } else {
    // Werewolves exist
    if (killedWerewolves.length > 0) {
      winners.push('village');
      reasonKey = 'reasonWwKilled';
    } else {
      winners.push('werewolf');
      reasonKey = 'reasonNoWwKilled';
    }
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

  return { winners, reasonKey, tannerAlsoWins, playerResults };
}
