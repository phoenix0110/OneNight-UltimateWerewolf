import { GameState } from './game-state';

export interface VoteResult {
  voteCounts: Record<number, number>; // playerId -> vote count
  maxVotes: number;
  killedPlayerIds: number[];
  isTie: boolean;
}

export function tallyVotes(state: GameState): VoteResult {
  const voteCounts: Record<number, number> = {};

  for (const player of state.players) {
    voteCounts[player.id] = 0;
  }

  for (const [, targetId] of Object.entries(state.votes)) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  const maxVotes = Math.max(...Object.values(voteCounts));

  // If everyone gets exactly 1 vote (or max is 1), nobody dies
  if (maxVotes <= 1) {
    return { voteCounts, maxVotes, killedPlayerIds: [], isTie: false };
  }

  const playersWithMaxVotes = Object.entries(voteCounts)
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => parseInt(id));

  // In ONUW, ties mean all tied players die
  const killedPlayerIds = [...playersWithMaxVotes];

  // Hunter chain: if Hunter is killed, their vote target also dies
  const hunterKilled = killedPlayerIds.find(
    (id) => state.players[id].currentRole === 'hunter'
  );
  if (hunterKilled !== undefined) {
    const hunterVoteTarget = state.votes[hunterKilled];
    if (
      hunterVoteTarget !== undefined &&
      !killedPlayerIds.includes(hunterVoteTarget)
    ) {
      killedPlayerIds.push(hunterVoteTarget);
    }
  }

  return {
    voteCounts,
    maxVotes,
    killedPlayerIds,
    isTie: playersWithMaxVotes.length > 1,
  };
}

export function generateAIVote(
  state: GameState,
  playerIndex: number
): number {
  const player = state.players[playerIndex];
  const otherPlayers = state.players.filter((p) => p.id !== playerIndex);

  // Simple heuristic-based voting
  const role = player.originalRole;

  if (role === 'werewolf' || role === 'minion') {
    // Werewolves/Minion vote for non-werewolves, prefer vocal accusers
    const nonWerewolves = otherPlayers.filter(
      (p) => p.originalRole !== 'werewolf' && p.originalRole !== 'minion'
    );
    const targets = nonWerewolves.length > 0 ? nonWerewolves : otherPlayers;
    return targets[Math.floor(Math.random() * targets.length)].id;
  }

  if (role === 'tanner') {
    // Tanner acts suspicious to get voted out - votes randomly
    return otherPlayers[Math.floor(Math.random() * otherPlayers.length)].id;
  }

  // Village team: vote for someone suspicious (random for now, AI chat will refine)
  return otherPlayers[Math.floor(Math.random() * otherPlayers.length)].id;
}
