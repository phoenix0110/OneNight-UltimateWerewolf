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

const AVATAR_COLORS = [
  'bg-pixel-blue',
  'bg-pixel-red',
  'bg-pixel-green',
  'bg-pixel-orange',
  'bg-pixel-purple',
  'bg-pixel-teal',
  'bg-pixel-navy',
  'bg-pixel-sky',
];

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

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-18 h-18',
    lg: 'w-22 h-22',
  };

  const nameHash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const colorClass = AVATAR_COLORS[nameHash % AVATAR_COLORS.length];

  return (
    <div
      className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Speech bubble */}
      {speechBubble && (
        <div className="pixel-box p-1.5 rounded text-[7px] max-w-[120px] text-center mb-1 animate-fadeInUp">
          {speechBubble}
        </div>
      )}

      {/* Avatar */}
      <div
        className={`
          ${sizeClasses[size]} rounded-lg flex items-center justify-center relative
          ${colorClass} ${isDead ? 'opacity-40 grayscale' : ''}
          ${isSelected ? 'ring-2 ring-pixel-yellow animate-glow' : ''}
          ${isHuman ? 'ring-2 ring-pixel-cyan' : ''}
          transition-all
        `}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Pixel face */}
        <div className="text-center">
          <div className="text-lg leading-none">
            {showRole && role ? ROLE_EMOJI[role] : '😐'}
          </div>
        </div>

        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            ❌
          </div>
        )}

        {voteCount !== undefined && voteCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-pixel-red text-pixel-white text-[8px] rounded-full w-5 h-5 flex items-center justify-center">
            {voteCount}
          </div>
        )}
      </div>

      {/* Name */}
      <div
        className={`text-[8px] text-center max-w-[60px] truncate ${
          isHuman ? 'text-pixel-cyan' : 'text-pixel-light'
        }`}
      >
        {name}
      </div>

      {/* Role label */}
      {showRole && role && (
        <div className="text-[7px] text-pixel-yellow text-center">
          {t(`roles.${role}`)}
        </div>
      )}
    </div>
  );
}
