'use client';

import { useTranslations } from 'next-intl';
import { RoleId } from '@/engine/roles';

interface RoleRevealCardProps {
  role: RoleId;
  animationDelay?: number;
}

const ROLE_EMOJI: Record<RoleId, string> = {
  werewolf: '🐺',
  seer: '🔮',
  robber: '🦹',
  troublemaker: '🔀',
  villager: '🧑‍🌾',
  insomniac: '😵',
  drunk: '🍺',
  hunter: '🏹',
  tanner: '🪶',
  minion: '👹',
  mason: '🤝',
  doppelganger: '🪞',
};

/** Color & glow config per role, following design doc Section 6 */
const ROLE_THEME: Record<
  string,
  {
    color: string;
    glowDim: string;
    glowBright: string;
    borderColor: string;
    teamBorder: string;
    teamBg: string;
    teamColor: string;
    teamKey: string;
  }
> = {
  werewolf: {
    color: 'var(--accent-red)',
    glowDim: '0 0 20px rgba(255,107,107,0.25), inset 0 0 20px rgba(255,107,107,0.05)',
    glowBright: '0 0 35px rgba(255,107,107,0.45), inset 0 0 25px rgba(255,107,107,0.08)',
    borderColor: 'rgba(255,107,107,0.4)',
    teamBorder: 'rgba(255,107,107,0.3)',
    teamBg: 'rgba(255,107,107,0.1)',
    teamColor: 'var(--accent-red)',
    teamKey: 'game.teamWerewolf',
  },
  minion: {
    color: 'var(--accent-red)',
    glowDim: '0 0 18px rgba(255,107,107,0.2), inset 0 0 15px rgba(255,107,107,0.04)',
    glowBright: '0 0 28px rgba(255,107,107,0.35), inset 0 0 20px rgba(255,107,107,0.06)',
    borderColor: 'rgba(255,107,107,0.3)',
    teamBorder: 'rgba(255,107,107,0.3)',
    teamBg: 'rgba(255,107,107,0.1)',
    teamColor: 'var(--accent-red)',
    teamKey: 'game.teamWerewolf',
  },
  seer: {
    color: 'var(--accent-cyan)',
    glowDim: '0 0 20px rgba(89,208,255,0.25), inset 0 0 20px rgba(89,208,255,0.05)',
    glowBright: '0 0 35px rgba(89,208,255,0.45), inset 0 0 25px rgba(89,208,255,0.08)',
    borderColor: 'rgba(89,208,255,0.4)',
    teamBorder: 'rgba(125,255,152,0.3)',
    teamBg: 'rgba(125,255,152,0.1)',
    teamColor: 'var(--accent-lime)',
    teamKey: 'game.teamVillage',
  },
  robber: {
    color: 'var(--accent-lime)',
    glowDim: '0 0 20px rgba(125,255,152,0.25), inset 0 0 20px rgba(125,255,152,0.05)',
    glowBright: '0 0 35px rgba(125,255,152,0.45), inset 0 0 25px rgba(125,255,152,0.08)',
    borderColor: 'rgba(125,255,152,0.4)',
    teamBorder: 'rgba(125,255,152,0.3)',
    teamBg: 'rgba(125,255,152,0.1)',
    teamColor: 'var(--accent-lime)',
    teamKey: 'game.teamVillage',
  },
  troublemaker: {
    color: 'var(--accent-purple)',
    glowDim: '0 0 20px rgba(176,140,255,0.25), inset 0 0 20px rgba(176,140,255,0.05)',
    glowBright: '0 0 35px rgba(176,140,255,0.45), inset 0 0 25px rgba(176,140,255,0.08)',
    borderColor: 'rgba(176,140,255,0.4)',
    teamBorder: 'rgba(125,255,152,0.3)',
    teamBg: 'rgba(125,255,152,0.1)',
    teamColor: 'var(--accent-lime)',
    teamKey: 'game.teamVillage',
  },
  tanner: {
    color: 'var(--accent-orange)',
    glowDim: '0 0 20px rgba(255,180,84,0.25), inset 0 0 20px rgba(255,180,84,0.05)',
    glowBright: '0 0 35px rgba(255,180,84,0.45), inset 0 0 25px rgba(255,180,84,0.08)',
    borderColor: 'rgba(255,180,84,0.4)',
    teamBorder: 'rgba(255,180,84,0.3)',
    teamBg: 'rgba(255,180,84,0.1)',
    teamColor: 'var(--accent-orange)',
    teamKey: 'game.teamSolo',
  },
  doppelganger: {
    color: 'var(--accent-purple)',
    glowDim: '0 0 20px rgba(176,140,255,0.25), inset 0 0 20px rgba(176,140,255,0.05)',
    glowBright: '0 0 35px rgba(176,140,255,0.45), inset 0 0 25px rgba(176,140,255,0.08)',
    borderColor: 'rgba(176,140,255,0.4)',
    teamBorder: 'rgba(176,140,255,0.3)',
    teamBg: 'rgba(176,140,255,0.1)',
    teamColor: 'var(--accent-purple)',
    teamKey: 'game.teamUnknown',
  },
};

// Default theme for village-team roles (villager, insomniac, drunk, hunter, mason)
const DEFAULT_THEME = {
  color: 'var(--accent-cyan)',
  glowDim: '0 0 20px rgba(89,208,255,0.2), inset 0 0 15px rgba(89,208,255,0.04)',
  glowBright: '0 0 30px rgba(89,208,255,0.35), inset 0 0 20px rgba(89,208,255,0.06)',
  borderColor: 'rgba(89,208,255,0.35)',
  teamBorder: 'rgba(125,255,152,0.3)',
  teamBg: 'rgba(125,255,152,0.1)',
  teamColor: 'var(--accent-lime)',
  teamKey: 'game.teamVillage',
};

/**
 * Enhanced role reveal card with role-specific glow, team badge, and dramatic reveal animation.
 */
export default function RoleRevealCard({ role, animationDelay = 800 }: RoleRevealCardProps) {
  const t = useTranslations();
  const theme = ROLE_THEME[role] || DEFAULT_THEME;

  return (
    <div
      className="anim-role-reveal"
      style={{
        opacity: 0,
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
        width: '100%',
        maxWidth: 380,
      }}
    >
      <div
        className="anim-glow-pulse"
        style={
          {
            '--glow-shadow-dim': theme.glowDim,
            '--glow-shadow-bright': theme.glowBright,
            background: 'var(--bg-panel)',
            border: `2px solid ${theme.borderColor}`,
            borderRadius: 16,
            padding: '28px 24px',
            textAlign: 'center' as const,
            animationDelay: `${animationDelay + 600}ms`,
          } as React.CSSProperties
        }
      >
        {/* Ritual header */}
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          ✨ {t('game.youAre')} ✨
        </div>

        {/* Role icon */}
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>
          {ROLE_EMOJI[role] || '❓'}
        </div>

        {/* Role name */}
        <div
          className="font-pixel"
          style={{
            fontSize: 26,
            color: theme.color,
            marginBottom: 20,
            textShadow: `0 0 16px ${theme.color}50`,
            lineHeight: 1.2,
          }}
        >
          {t(`roles.${role}`)}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.borderColor}, transparent)`,
            margin: '0 auto 16px',
          }}
        />

        {/* Team badge */}
        <span
          style={{
            display: 'inline-block',
            fontSize: 12,
            padding: '5px 16px',
            borderRadius: 99,
            border: `1px solid ${theme.teamBorder}`,
            background: theme.teamBg,
            color: theme.teamColor,
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}
        >
          {t(theme.teamKey)}
        </span>
      </div>
    </div>
  );
}
