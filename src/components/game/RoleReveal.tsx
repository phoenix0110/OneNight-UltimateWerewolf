'use client';

import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';

const ALIGNMENT_COLOR: Record<string, string> = {
  werewolf: 'var(--accent-red)',
  minion: 'var(--accent-red)',
  tanner: 'var(--accent-orange)',
  doppelganger: 'var(--accent-purple)',
};

const ALIGNMENT_GLOW: Record<string, string> = {
  werewolf: '0 0 30px rgba(255,107,107,0.3)',
  minion: '0 0 30px rgba(255,107,107,0.2)',
  tanner: '0 0 30px rgba(255,180,84,0.3)',
  doppelganger: '0 0 30px rgba(176,140,255,0.3)',
};

const ALIGNMENT_TEAM_KEY: Record<string, string> = {
  werewolf: 'game.teamWerewolf',
  minion: 'game.teamWerewolf',
  tanner: 'game.teamSolo',
  doppelganger: 'game.teamUnknown',
};

export default function RoleReveal() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const humanPlayerIndex = useGameStore((s) => s.humanPlayerIndex);
  const proceedToNight = useGameStore((s) => s.proceedToNight);

  const humanPlayer = players[humanPlayerIndex];
  if (!humanPlayer) return null;

  const role = humanPlayer.originalRole;
  const color = ALIGNMENT_COLOR[role] || 'var(--accent-cyan)';
  const glow = ALIGNMENT_GLOW[role] || '0 0 30px rgba(89,208,255,0.3)';
  const teamLabelKey = ALIGNMENT_TEAM_KEY[role] || 'game.teamVillage';
  const teamLabel = t(teamLabelKey);

  const teamBorder = role === 'werewolf' || role === 'minion'
    ? 'rgba(255,107,107,0.3)'
    : role === 'tanner'
      ? 'rgba(255,180,84,0.3)'
      : role === 'doppelganger'
        ? 'rgba(176,140,255,0.3)'
        : 'rgba(125,255,152,0.3)';
  const teamBg = role === 'werewolf' || role === 'minion'
    ? 'rgba(255,107,107,0.1)'
    : role === 'tanner'
      ? 'rgba(255,180,84,0.1)'
      : role === 'doppelganger'
        ? 'rgba(176,140,255,0.1)'
        : 'rgba(125,255,152,0.1)';
  const teamColor = role === 'werewolf' || role === 'minion'
    ? 'var(--accent-red)'
    : role === 'tanner'
      ? 'var(--accent-orange)'
      : role === 'doppelganger'
        ? 'var(--accent-purple)'
        : 'var(--accent-lime)';

  return (
    <div className="scene-night-sky" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Players circle */}
      <div style={{ position: 'relative', width: 288, height: 288, marginBottom: 24 }}>
        {players.map((player, i) => {
          const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 110;
          const x = 50 + (Math.cos(angle) * radius) / 2.88;
          const y = 50 + (Math.sin(angle) * radius) / 2.88;

          return (
            <div
              key={player.id}
              className="anim-fade-in-up"
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${i * 100}ms`,
              }}
            >
              <PlayerAvatar
                name={player.name}
                isHuman={player.isHuman}
                showRole={player.isHuman}
                role={player.isHuman ? player.originalRole : undefined}
                size="sm"
              />
            </div>
          );
        })}

        {/* Center cards */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 6 }}>
            {t('game.centerCards')}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="panel-raised"
                style={{ width: 40, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-muted)' }}
              >
                ?
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Card */}
      <div
        className="panel-raised anim-fade-in-up"
        style={{ padding: 32, borderRadius: 12, textAlign: 'center', marginBottom: 24, maxWidth: 360, width: '100%', boxShadow: glow }}
      >
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          {t('game.youAre')}
        </div>
        <div className="font-pixel" style={{ fontSize: 24, color, marginBottom: 12, textShadow: `0 0 12px ${color}40` }}>
          {t(`roles.${role}`)}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
          {t(`roles.${role}Desc`)}
        </div>
        <span
          style={{
            display: 'inline-block', fontSize: 12, padding: '4px 12px', borderRadius: 99,
            border: `1px solid ${teamBorder}`, background: teamBg, color: teamColor,
          }}
        >
          {teamLabel}
        </span>
      </div>

      {/* Proceed */}
      <button onClick={proceedToNight} className="btn btn-success" style={{ fontSize: 16, padding: '12px 40px', minHeight: 48 }}>
        {t('game.night')} →
      </button>
    </div>
  );
}
