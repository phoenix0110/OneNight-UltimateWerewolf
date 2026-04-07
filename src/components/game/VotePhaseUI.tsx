'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import PhaseHeader from './PhaseHeader';
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 512, margin: '0 auto', width: '100%' }}>
      <PhaseHeader icon="🗳️" title={t('game.vote')} accentColor="red" subtitle={t('game.voteDesc')} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 0' }}>
        {!hasVoted ? (
          <>
            {/* Vote instruction */}
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', marginBottom: 16 }}>
              {t('game.voteFor')}:
            </div>

            {/* Target grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24, width: '100%' }}>
              {otherPlayers.map((p) => {
                const isSelected = selectedTarget === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedTarget(p.id)}
                    className="panel"
                    style={{
                      padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      cursor: 'pointer', transition: 'all 0.15s',
                      borderColor: isSelected ? 'var(--accent-red)' : undefined,
                      boxShadow: isSelected ? '0 0 20px rgba(255,107,107,0.2), 0 0 0 2px rgba(255,107,107,0.4)' : undefined,
                      transform: isSelected ? 'scale(1.05)' : undefined,
                    }}
                  >
                    <PlayerAvatar name={p.name} size="lg" isSelected={isSelected} />
                    {isSelected && (
                      <span className="anim-fade-in-up" style={{ fontSize: 12, color: 'var(--accent-red)', fontWeight: 600 }}>
                        ⚔️ {t('game.target')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selection summary */}
            {selectedTarget !== null && (
              <div className="panel-raised anim-fade-in-up" style={{ padding: 12, marginBottom: 16, width: '100%', textAlign: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {t('game.votingFor')}{' '}
                  <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                    {players.find((p) => p.id === selectedTarget)?.name}
                  </span>
                </span>
              </div>
            )}
          </>
        ) : (
          /* Waiting state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="panel-raised anim-pulse-soft" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>⏳</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {t('game.waitingVotes')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="anim-pulse-soft"
                    style={{
                      width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,107,107,0.4)',
                      animationDelay: `${p.id * 200}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!hasVoted && (
        <div className="sticky-footer" style={{ padding: 16 }}>
          <button
            onClick={handleVote}
            disabled={selectedTarget === null || isProcessing}
            className="btn btn-danger"
            style={{ width: '100%', fontSize: 16, minHeight: 48 }}
          >
            {isProcessing ? t('game.waitingVotes') : t('game.confirmVote')}
          </button>
        </div>
      )}
    </div>
  );
}
