'use client';

import { Player } from '@/engine/game-state';

import DiscussionAvatarNode from './DiscussionAvatarNode';
import RoundTable from './RoundTable';

const AREA_SIZE = 380;
const CENTER = AREA_SIZE / 2;
const AVATAR_ORBIT_RADIUS = 155;
const TABLE_DIAMETER = 170;

function getPlayerPositions(players: { id: number; isHuman: boolean }[]) {
  const total = players.length;
  const nonHumans = players.filter((p) => !p.isHuman);

  return players.map((player) => {
    const slot = player.isHuman ? 0 : nonHumans.indexOf(player) + 1;
    const angle = Math.PI / 2 + (slot / total) * 2 * Math.PI;

    return {
      x: CENTER + Math.cos(angle) * AVATAR_ORBIT_RADIUS,
      y: CENTER + Math.sin(angle) * AVATAR_ORBIT_RADIUS,
      isHuman: player.isHuman,
    };
  });
}

interface DaySceneFrameProps {
  players: Player[];
  currentSpeakerId: number | null;
  thinkingPlayerId: number | null;
  currentSpeakerIndex: number;
  speakingOrder: number[];
  onPlayerClick?: (playerId: number) => void;
}

export default function DaySceneFrame({
  players,
  currentSpeakerId,
  thinkingPlayerId,
  currentSpeakerIndex,
  speakingOrder,
  onPlayerClick,
}: DaySceneFrameProps) {
  const positions = getPlayerPositions(players);

  const getAvatarState = (playerId: number) => {
    if (thinkingPlayerId === playerId) return 'thinking' as const;
    if (currentSpeakerId === playerId) return 'speaking' as const;
    const orderIndex = speakingOrder.indexOf(playerId);
    if (orderIndex !== -1 && orderIndex < currentSpeakerIndex) return 'spoke' as const;
    return 'default' as const;
  };

  return (
    <div style={{ position: 'relative', width: AREA_SIZE, height: AREA_SIZE, flexShrink: 0, margin: '0 auto' }}>
      {/* Round table at center */}
      <div
        style={{
          position: 'absolute',
          left: CENTER - TABLE_DIAMETER / 2,
          top: CENTER - TABLE_DIAMETER / 2,
          width: TABLE_DIAMETER,
          height: TABLE_DIAMETER,
        }}
      >
        <RoundTable size={TABLE_DIAMETER} centerCardsCount={3} animationDelay={0} />
      </div>

      {/* Players on the orbit circle */}
      {players.map((player, i) => {
        const pos = positions[i];
        return (
          <div
            key={player.id}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              zIndex: player.isHuman ? 3 : 1,
              cursor: onPlayerClick ? 'pointer' : undefined,
            }}
            onClick={() => onPlayerClick?.(player.id)}
          >
            <DiscussionAvatarNode
              name={player.name}
              isHuman={player.isHuman}
              state={getAvatarState(player.id)}
              index={i}
            />
          </div>
        );
      })}
    </div>
  );
}
