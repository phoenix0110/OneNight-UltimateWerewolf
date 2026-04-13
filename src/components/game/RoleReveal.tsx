'use client';

import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';
import TavernScene from './TavernScene';
import RoundTable from './RoundTable';
import RoleRevealCard from './RoleRevealCard';
import PhaseHeader from './PhaseHeader';
import ActionFooter from './ActionFooter';

const AREA_SIZE = 440;
const CENTER = AREA_SIZE / 2; // 220
const AVATAR_ORBIT_RADIUS = 180;
const AVATAR_BOX_HALF = 24; // SIZE_MAP.sm.box / 2
const TABLE_DIAMETER = 210;

/**
 * Place N players evenly on a circle.
 * Slot 0 (human) = bottom (6 o'clock), then clockwise.
 *
 * Each returned (x, y) is the avatar's intended visual center.
 */
function getPlayerPositions(players: { id: number; isHuman: boolean }[]) {
  const total = players.length;
  const nonHumans = players.filter((p) => !p.isHuman);

  return players.map((player) => {
    const slot = player.isHuman ? 0 : nonHumans.indexOf(player) + 1;
    // Start at PI/2 (6 o'clock in screen coords where Y points down), go clockwise
    const angle = Math.PI / 2 + (slot / total) * 2 * Math.PI;

    return {
      x: CENTER + Math.cos(angle) * AVATAR_ORBIT_RADIUS,
      y: CENTER + Math.sin(angle) * AVATAR_ORBIT_RADIUS,
      isHuman: player.isHuman,
    };
  });
}

export default function RoleReveal() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const humanPlayerIndex = useGameStore((s) => s.humanPlayerIndex);
  const proceedToNight = useGameStore((s) => s.proceedToNight);

  const humanPlayer = players[humanPlayerIndex];
  if (!humanPlayer) return null;

  const role = humanPlayer.originalRole;
  const positions = getPlayerPositions(players);

  const basePlayerDelay = 400;
  const playerStagger = 100;

  return (
    <TavernScene layout="wide">
      {/* Phase Header */}
      <div
        className="anim-fade-in-up"
        style={{
          opacity: 0,
          animationDelay: '0ms',
          animationFillMode: 'forwards',
          width: '100%',
          paddingTop: 16,
        }}
      >
        <PhaseHeader
          icon="🕯️"
          title={t('game.roleRevealTitle')}
          subtitle={t('game.roleRevealSubtitle')}
          accentColor="moon"
        />
      </div>

      {/* Main content — left-right split on desktop, stacked on mobile */}
      <div
        className="role-reveal-split"
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          gap: 24,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 0',
        }}
      >
        {/* Left: Role Reveal Card */}
        <div
          style={{
            flex: '1 1 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <RoleRevealCard role={role} animationDelay={800} />
        </div>

        {/* Right: Round table with seated players */}
        <div
          style={{
            flex: '1 1 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          {/* Square positioning area — every element uses the same CENTER point */}
          <div
            style={{
              position: 'relative',
              width: AREA_SIZE,
              height: AREA_SIZE,
              flexShrink: 0,
            }}
          >
            {/* Round table — geometrically centered with explicit offsets, no translate tricks */}
            <div
              style={{
                position: 'absolute',
                left: CENTER - TABLE_DIAMETER / 2,
                top: CENTER - TABLE_DIAMETER / 2,
                width: TABLE_DIAMETER,
                height: TABLE_DIAMETER,
              }}
            >
              <RoundTable
                size={TABLE_DIAMETER}
                centerCardsCount={3}
                animationDelay={200}
              />
            </div>

            {/* Players on the orbit circle */}
            {players.map((player, i) => {
              const pos = positions[i];
              const delay = basePlayerDelay + i * playerStagger;

              return (
                // Outer: positioning only — transform here is NOT animated
                <div
                  key={player.id}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    transform: `translate(-50%, -${AVATAR_BOX_HALF}px)`,
                    zIndex: player.isHuman ? 3 : 1,
                  }}
                >
                  {/* Inner: animation only — its transform won't conflict with positioning */}
                  <div
                    className="anim-fade-in-up"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      opacity: 0,
                      animationDelay: `${delay}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <PlayerAvatar
                      name={player.name}
                      isHuman={player.isHuman}
                      size="sm"
                    />
                    {player.isHuman && (
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--accent-cyan)',
                          fontWeight: 700,
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ⭐ {t('game.you')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div
        className="anim-fade-in-up"
        style={{
          opacity: 0,
          animationDelay: '1200ms',
          animationFillMode: 'forwards',
          width: '100%',
          marginTop: 16,
          paddingBottom: 24,
        }}
      >
        <ActionFooter>
          <button
            onClick={proceedToNight}
            className="btn btn-success"
            style={{
              fontSize: 16,
              padding: '14px 40px',
              minHeight: 48,
              width: '100%',
              maxWidth: 360,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            🌙 {t('game.night')} →
          </button>
        </ActionFooter>
      </div>
    </TavernScene>
  );
}
