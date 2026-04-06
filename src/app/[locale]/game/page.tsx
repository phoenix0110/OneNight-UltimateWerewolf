'use client';

import { useGameStore } from '@/store/game-store';
import GameSetup from '@/components/game/GameSetup';
import RoleReveal from '@/components/game/RoleReveal';
import NightPhaseUI from '@/components/game/NightPhaseUI';
import DayPhaseUI from '@/components/game/DayPhaseUI';
import VotePhaseUI from '@/components/game/VotePhaseUI';
import ResultScreen from '@/components/game/ResultScreen';

export default function GamePage() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="min-h-screen flex flex-col">
      {phase === 'setup' && <GameSetup />}
      {phase === 'role_reveal' && <RoleReveal />}
      {phase === 'night' && <NightPhaseUI />}
      {phase === 'day' && <DayPhaseUI />}
      {phase === 'vote' && <VotePhaseUI />}
      {phase === 'resolution' && <ResultScreen />}
    </div>
  );
}
