'use client';

import { useState } from 'react';
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

/**
 * Color palette for pixel characters, one per player seat.
 * Matches the 8 possible background colors from before.
 */
const PIXEL_COLORS = [
  { hair: '#4A90D9', shirt: '#1d4ed8', skin: '#FFDAB9' },
  { hair: '#E84057', shirt: '#be123c', skin: '#FFE0BD' },
  { hair: '#34D399', shirt: '#047857', skin: '#FFDAB9' },
  { hair: '#FBBF24', shirt: '#b45309', skin: '#FFE0BD' },
  { hair: '#A78BFA', shirt: '#7e22ce', skin: '#FFDAB9' },
  { hair: '#2DD4BF', shirt: '#0f766e', skin: '#FFE0BD' },
  { hair: '#818CF8', shirt: '#4338ca', skin: '#FFDAB9' },
  { hair: '#38BDF8', shirt: '#0369a1', skin: '#FFE0BD' },
];

const SIZE_MAP = {
  sm: { box: 48, sprite: 40 },
  md: { box: 64, sprite: 52 },
  lg: { box: 80, sprite: 64 },
};

/**
 * Sprite path for real pixel art. Drop PNG files into public/sprites/ to override
 * the CSS placeholder characters.
 *
 * File naming convention:
 *   - player-0.png through player-7.png (one per color slot)
 *   - player-human.png (optional, for the human player)
 */
function getSpritePath(colorIndex: number, isHuman: boolean): string {
  if (isHuman) return '/sprites/player-human.png';
  return `/sprites/player-${colorIndex}.png`;
}

/**
 * CSS pixel-art character drawn with box-shadow.
 * Acts as a fallback when sprite PNGs are not available.
 */
function PixelCharacter({ colorIndex, size }: { colorIndex: number; size: number }) {
  const colors = PIXEL_COLORS[colorIndex % PIXEL_COLORS.length];
  const px = Math.max(2, Math.floor(size / 16)); // pixel unit size

  return (
    <div style={{ width: size, height: size, position: 'relative', imageRendering: 'pixelated' }}>
      {/* Head */}
      <div
        style={{
          position: 'absolute',
          top: px * 1,
          left: '50%',
          transform: 'translateX(-50%)',
          width: px * 6,
          height: px * 6,
          borderRadius: px,
          background: colors.skin,
        }}
      />
      {/* Hair */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: px * 7,
          height: px * 3,
          borderRadius: `${px}px ${px}px 0 0`,
          background: colors.hair,
        }}
      />
      {/* Eyes */}
      <div
        style={{
          position: 'absolute',
          top: px * 3,
          left: '50%',
          transform: 'translateX(-50%)',
          width: px * 4,
          height: px,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ width: px, height: px, background: '#333', borderRadius: '50%' }} />
        <div style={{ width: px, height: px, background: '#333', borderRadius: '50%' }} />
      </div>
      {/* Body / Shirt */}
      <div
        style={{
          position: 'absolute',
          top: px * 7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: px * 8,
          height: px * 5,
          borderRadius: `${px}px ${px}px 0 0`,
          background: colors.shirt,
        }}
      />
      {/* Legs */}
      <div
        style={{
          position: 'absolute',
          top: px * 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: px,
        }}
      >
        <div style={{ width: px * 3, height: px * 3, background: '#5C4A3A', borderRadius: `0 0 ${px}px ${px}px` }} />
        <div style={{ width: px * 3, height: px * 3, background: '#5C4A3A', borderRadius: `0 0 ${px}px ${px}px` }} />
      </div>
    </div>
  );
}

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
  const colorIndex = nameHash % PIXEL_COLORS.length;
  const [spriteError, setSpriteError] = useState(false);
  const spritePath = getSpritePath(colorIndex, isHuman);

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
          background: 'rgba(15, 22, 40, 0.6)',
          opacity: isDead ? 0.3 : 1,
          filter: isDead ? 'grayscale(1)' : undefined,
          boxShadow: isSelected
            ? '0 0 0 2px var(--accent-moon), 0 0 12px 4px rgba(246,211,101,0.4)'
            : isHuman
              ? '0 0 0 2px var(--accent-cyan)'
              : undefined,
          transition: 'all 0.2s',
          overflow: 'hidden',
        }}
      >
        {/* Try real sprite first, fall back to CSS pixel character */}
        {!spriteError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spritePath}
            alt={name}
            width={dims.sprite}
            height={dims.sprite}
            style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
            onError={() => setSpriteError(true)}
          />
        ) : (
          <PixelCharacter colorIndex={colorIndex} size={dims.sprite} />
        )}

        {/* Role emoji overlay when showing role */}
        {showRole && role && (
          <span
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              fontSize: size === 'sm' ? 12 : 16,
              lineHeight: 1,
              background: 'rgba(0,0,0,0.6)',
              borderRadius: 4,
              padding: '1px 2px',
            }}
          >
            {ROLE_EMOJI[role]}
          </span>
        )}

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
