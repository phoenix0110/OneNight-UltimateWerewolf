'use client';

import { useTranslations } from 'next-intl';
import { RoleId } from '@/engine/roles';

interface PlayerAvatarProps {
  name: string;
  isHuman?: boolean;
  showRole?: boolean;
  role?: RoleId;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  isDead?: boolean;
  onClick?: () => void;
  speechBubble?: string;
  voteCount?: number;
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

const BG_COLORS = [
  '#1d4ed8', '#be123c', '#047857', '#b45309',
  '#7e22ce', '#0f766e', '#4338ca', '#0369a1',
];

const SIZE_MAP = {
  sm: { box: 48, emoji: 20 },
  md: { box: 64, emoji: 26 },
  lg: { box: 80, emoji: 32 },
};

export default function PlayerAvatar({
  name,
  isHuman = false,
  showRole = false,
  role,
  size = 'md',
  isSelected = false,
  isDead = false,
  onClick,
  speechBubble,
  voteCount,
}: PlayerAvatarProps) {
  const t = useTranslations();
  const dims = SIZE_MAP[size];
  const nameHash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bgColor = BG_COLORS[nameHash % BG_COLORS.length];

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    >
      {speechBubble && (
        <div
          className="panel"
          style={{ padding: 8, borderRadius: 8, fontSize: 12, maxWidth: 140, textAlign: 'center', color: 'var(--text-secondary)' }}
        >
          {speechBubble}
        </div>
      )}

      <div
        style={{
          width: dims.box,
          height: dims.box,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: bgColor,
          opacity: isDead ? 0.3 : 1,
          filter: isDead ? 'grayscale(1)' : undefined,
          boxShadow: isSelected
            ? '0 0 0 2px var(--accent-moon), 0 0 12px 4px rgba(246,211,101,0.4)'
            : isHuman
              ? '0 0 0 2px var(--accent-cyan)'
              : undefined,
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: dims.emoji, lineHeight: 1 }}>
          {showRole && role ? ROLE_EMOJI[role] : '😐'}
        </span>

        {isDead && (
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            ❌
          </span>
        )}

        {voteCount !== undefined && voteCount > 0 && (
          <span
            style={{
              position: 'absolute', top: -8, right: -8,
              background: 'var(--accent-red)', color: '#fff',
              fontSize: 11, fontWeight: 700, borderRadius: '50%',
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {voteCount}
          </span>
        )}
      </div>

      <span
        style={{
          fontSize: 12, textAlign: 'center', maxWidth: 80,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontWeight: 500,
          color: isHuman ? 'var(--accent-cyan)' : 'var(--text-secondary)',
        }}
      >
        {name}
      </span>

      {showRole && role && (
        <span style={{ fontSize: 11, color: 'var(--accent-moon)', textAlign: 'center' }}>
          {t(`roles.${role}`)}
        </span>
      )}
    </div>
  );
}
