'use client';

import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';

export default function RoleReveal() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const humanPlayerIndex = useGameStore((s) => s.humanPlayerIndex);
  const proceedToNight = useGameStore((s) => s.proceedToNight);

  const humanPlayer = players[humanPlayerIndex];
  if (!humanPlayer) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <h2 className="text-sm pixel-text text-pixel-yellow mb-6">
        {t('game.yourRole')}
      </h2>

      {/* Players circle */}
      <div className="relative w-72 h-72 mb-6">
        {players.map((player, i) => {
          const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 110;
          const x = 50 + (Math.cos(angle) * radius) / 2.88;
          const y = 50 + (Math.sin(angle) * radius) / 2.88;

          return (
            <div
              key={player.id}
              className="absolute animate-fadeInUp"
              style={{
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

        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-[9px] text-pixel-gray">
            {t('game.centerCards')}
          </div>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-8 h-10 pixel-box rounded flex items-center justify-center text-[10px]"
              >
                ?
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role card */}
      <div className="pixel-box p-6 rounded text-center animate-fadeInUp mb-6">
        <div className="text-[10px] text-pixel-light mb-2">
          {t('game.youAre')}
        </div>
        <div className="text-lg pixel-text text-pixel-cyan mb-2">
          {t(`roles.${humanPlayer.originalRole}`)}
        </div>
        <div className="text-[9px] text-pixel-light">
          {t(`roles.${humanPlayer.originalRole}Desc`)}
        </div>
      </div>

      <button
        onClick={proceedToNight}
        className="pixel-btn pixel-btn-success px-8 py-3 text-[11px]"
      >
        {t('game.night')} →
      </button>
    </div>
  );
}
