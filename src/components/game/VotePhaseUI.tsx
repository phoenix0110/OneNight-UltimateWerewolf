'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';

export default function VotePhaseUI() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const humanPlayerIndex = useGameStore((s) => s.humanPlayerIndex);
  const castVote = useGameStore((s) => s.castVote);
  const runAIVotes = useGameStore((s) => s.runAIVotes);
  const resolveGame = useGameStore((s) => s.resolveGame);
  const isProcessing = useGameStore((s) => s.isProcessing);

  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const otherPlayers = players.filter((p) => p.id !== humanPlayerIndex);

  const handleVote = async () => {
    if (selectedTarget === null) return;
    castVote(selectedTarget);
    setHasVoted(true);

    await runAIVotes();
    resolveGame();
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
      <div className="text-center mb-6">
        <div className="text-2xl mb-2">🗳️</div>
        <h2 className="text-sm pixel-text text-pixel-red mb-1">
          {t('game.vote')}
        </h2>
        <p className="text-[9px] text-pixel-gray">{t('game.voteDesc')}</p>
      </div>

      {!hasVoted ? (
        <>
          <div className="text-[10px] text-pixel-yellow mb-4">
            {t('game.voteFor')}:
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 w-full">
            {otherPlayers.map((p) => (
              <div key={p.id} className="flex justify-center">
                <PlayerAvatar
                  name={p.name}
                  size="md"
                  isSelected={selectedTarget === p.id}
                  onClick={() => setSelectedTarget(p.id)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleVote}
            disabled={selectedTarget === null || isProcessing}
            className={`pixel-btn pixel-btn-danger px-8 py-3 text-[11px] w-full max-w-xs ${
              selectedTarget === null || isProcessing
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isProcessing ? t('game.waitingVotes') : t('game.confirmVote')}
          </button>
        </>
      ) : (
        <div className="text-center">
          <div className="pixel-box p-4 rounded mb-4 animate-blink">
            <div className="text-[10px] text-pixel-light">
              {t('game.waitingVotes')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
