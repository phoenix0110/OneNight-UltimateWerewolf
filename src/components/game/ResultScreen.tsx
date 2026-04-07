'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { saveGameResult } from '@/lib/firestore';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';

const ROLE_EMOJI: Record<string, string> = {
  werewolf: '🐺', seer: '🔮', robber: '🦹', troublemaker: '🔀',
  villager: '🧑‍🌾', insomniac: '😵', drunk: '🍺', hunter: '🏹',
  tanner: '🪶', minion: '👹', mason: '🤝', doppelganger: '🪞',
};

export default function ResultScreen() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const savedRef = useRef(false);

  const players = useGameStore((s) => s.players);
  const killedPlayerIds = useGameStore((s) => s.killedPlayerIds);
  const winResult = useGameStore((s) => s.winResult);
  const votes = useGameStore((s) => s.votes);
  const resetGame = useGameStore((s) => s.resetGame);
  const humanPlayerIndex = useGameStore((s) => s.humanPlayerIndex);
  const centerCards = useGameStore((s) => s.centerCards);
  const config = useGameStore((s) => s.config);

  useEffect(() => {
    if (!user || !winResult || savedRef.current) return;
    savedRef.current = true;

    const humanPlayer = players[humanPlayerIndex];
    const humanResult = winResult.playerResults.find((r) => r.playerId === humanPlayerIndex);
    const mainWinner = winResult.winners.includes('village')
      ? 'village_win'
      : winResult.winners.includes('tanner')
        ? 'tanner_win'
        : 'werewolf_win';

    saveGameResult(user.uid, {
      playerCount: players.length,
      rolesInGame: config.roles,
      playerRole: humanPlayer.originalRole,
      finalRole: humanPlayer.currentRole,
      result: mainWinner,
      didWin: humanResult?.won ?? false,
    }).catch(console.error);
  }, [user, winResult, players, humanPlayerIndex, config]);

  if (!winResult) return null;

  const humanWon = winResult.playerResults.find((r) => r.playerId === humanPlayerIndex)?.won;

  const voteCounts: Record<number, number> = {};
  for (const targetId of Object.values(votes)) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  const getWinMessage = () => {
    if (winResult.winners.includes('tanner') && winResult.winners.includes('village'))
      return `${t('game.villageWins')} ${t('game.tannerWins')}`;
    if (winResult.winners.includes('tanner') && winResult.winners.includes('werewolf'))
      return `${t('game.werewolfWins')} ${t('game.tannerWins')}`;
    if (winResult.winners.includes('village')) return t('game.villageWins');
    if (winResult.winners.includes('werewolf')) return t('game.werewolfWins');
    if (winResult.winners.includes('tanner')) return t('game.tannerWins');
    return '';
  };

  return (
    <div className="scene-dawn" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 512, margin: '0 auto', width: '100%' }}>
      {/* Outcome Banner */}
      <div className="anim-fade-in-up" style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {humanWon ? '🎉' : '💀'}
        </div>
        <h2
          className="font-pixel"
          style={{
            fontSize: 24, marginBottom: 12,
            color: humanWon ? 'var(--accent-lime)' : 'var(--accent-red)',
            textShadow: humanWon ? '0 0 12px rgba(125,255,152,0.4)' : '0 0 12px rgba(255,107,107,0.4)',
          }}
        >
          {humanWon ? t('game.youWin') : t('game.youLose')}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--accent-moon)', fontWeight: 600 }}>
          {getWinMessage()}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
          {t(`game.${winResult.reasonKey}`)}
          {winResult.tannerAlsoWins && t('game.reasonTannerAlsoWins')}
        </p>
      </div>

      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Killed Players */}
        {killedPlayerIds.length > 0 ? (
          <div className="panel-raised" style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-red)', marginBottom: 12 }}>
              {t('game.killed')}:
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {killedPlayerIds.map((id) => {
                const player = players[id];
                return (
                  <PlayerAvatar key={id} name={player.name} isDead showRole role={player.currentRole} size="md" />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--accent-lime)' }}>{t('game.noOneKilled')}</span>
          </div>
        )}

        {/* All Players Reveal */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', marginBottom: 12, textAlign: 'center' }}>
            {t('game.results')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((player) => {
              const result = winResult.playerResults.find((r) => r.playerId === player.id);
              const isDead = killedPlayerIds.includes(player.id);
              const didWin = result?.won;

              return (
                <div
                  key={player.id}
                  className="panel anim-slide-in"
                  style={{
                    padding: 12, display: 'flex', alignItems: 'center', gap: 12,
                    opacity: isDead ? 0.6 : 1, animationDelay: `${player.id * 80}ms`,
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <PlayerAvatar name={player.name} isHuman={player.isHuman} isDead={isDead} size="sm" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {player.name}
                      </span>
                      {player.isHuman && (
                        <span style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>{t('game.you')}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ color: 'var(--accent-orange)' }}>{t(`roles.${player.originalRole}`)}</span>
                      {player.originalRole !== player.currentRole && (
                        <>
                          {' → '}
                          <span style={{ color: 'var(--accent-cyan)' }}>{t(`roles.${player.currentRole}`)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {voteCounts[player.id] || 0} {t('game.votes')}
                    </span>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13,
                      background: didWin ? 'rgba(125,255,152,0.2)' : 'rgba(255,107,107,0.2)',
                      color: didWin ? 'var(--accent-lime)' : 'var(--accent-red)',
                    }}>
                      {didWin ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Cards */}
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', marginBottom: 12, textAlign: 'center' }}>
            {t('game.centerCards')}
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {centerCards.map((role, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="panel-raised" style={{ width: 64, height: 80, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 6 }}>
                  {ROLE_EMOJI[role] || '🃏'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {t(`roles.${role}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="sticky-footer" style={{ display: 'flex', gap: 12, padding: 16 }}>
        <button onClick={resetGame} className="btn btn-success" style={{ flex: 1, fontSize: 14 }}>
          {t('game.playAgain')}
        </button>
        <button
          onClick={() => { resetGame(); router.push(`/${locale}`); }}
          className="btn btn-secondary"
          style={{ flex: 1, fontSize: 14 }}
        >
          {t('game.backToMenu')}
        </button>
      </div>
    </div>
  );
}
