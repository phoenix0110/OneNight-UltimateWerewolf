'use client';

import { useTranslations } from 'next-intl';

import { Player } from '@/engine/game-state';

import DiscussionAvatarNode from './DiscussionAvatarNode';

interface DaySceneFrameProps {
  players: Player[];
  currentSpeakerId: number | null;
  thinkingPlayerId: number | null;
  currentSpeakerIndex: number;
  speakingOrder: number[];
}

export default function DaySceneFrame({
  players,
  currentSpeakerId,
  thinkingPlayerId,
  currentSpeakerIndex,
  speakingOrder,
}: DaySceneFrameProps) {
  const t = useTranslations();

  const getAvatarState = (playerId: number) => {
    if (thinkingPlayerId === playerId) return 'thinking' as const;
    if (currentSpeakerId === playerId) return 'speaking' as const;
    const orderIndex = speakingOrder.indexOf(playerId);
    if (orderIndex !== -1 && orderIndex < currentSpeakerIndex) return 'spoke' as const;
    return 'default' as const;
  };

  return (
    <div className="scene-village-square" style={{ position: 'relative', width: '100%', padding: '16px 8px' }}>
      {/* Player ring */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {players.map((player, i) => (
          <DiscussionAvatarNode
            key={player.id}
            name={player.name}
            isHuman={player.isHuman}
            state={getAvatarState(player.id)}
            index={i}
          />
        ))}
      </div>

      {/* Center firepit marker */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          borderRadius: 99, background: 'rgba(19,26,46,0.6)', border: '1px solid rgba(49,65,95,0.4)',
        }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span className="font-pixel" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t('game.villageSquare')}</span>
        </div>
      </div>
    </div>
  );
}
