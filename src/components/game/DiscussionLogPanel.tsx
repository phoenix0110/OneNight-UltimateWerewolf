'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage, Player } from '@/engine/game-state';

interface DiscussionLogPanelProps {
  messages: ChatMessage[];
  players: Player[];
  thinkingPlayer: Player | null;
  emptyText: string;
}

export default function DiscussionLogPanel({ messages, players, thinkingPlayer, emptyText }: DiscussionLogPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingPlayer]);

  const getPlayerInfo = (playerId: number) => {
    if (playerId === -1) return { isHuman: false, isSystem: true };
    const player = players.find((p) => p.id === playerId);
    return { isHuman: player?.isHuman ?? false, isSystem: false };
  };

  const getNameColor = (playerId: number) => {
    const info = getPlayerInfo(playerId);
    if (info.isSystem) return 'var(--text-muted)';
    return info.isHuman ? 'var(--accent-cyan)' : 'var(--accent-orange)';
  };

  const getBubbleStyle = (playerId: number): React.CSSProperties => {
    const info = getPlayerInfo(playerId);
    if (info.isSystem) return { background: 'rgba(11,16,32,0.5)', borderColor: 'rgba(49,65,95,0.3)' };
    return info.isHuman
      ? { background: 'rgba(89,208,255,0.05)', borderColor: 'rgba(89,208,255,0.2)' }
      : { background: 'rgba(255,180,84,0.05)', borderColor: 'rgba(255,180,84,0.15)' };
  };

  return (
    <div
      className="custom-scroll"
      style={{
        flex: 1, overflowY: 'auto', borderRadius: 8,
        background: 'rgba(19,26,46,0.6)', border: '1px solid rgba(49,65,95,0.5)', padding: 12,
      }}
    >
      {messages.length === 0 && !thinkingPlayer && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
          {emptyText}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className="anim-slide-in"
            style={{
              borderRadius: 8, border: '1px solid', padding: '8px 12px',
              animationDelay: `${Math.min(i * 30, 300)}ms`,
              ...getBubbleStyle(msg.playerId),
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: getNameColor(msg.playerId) }}>
              {msg.playerName}
            </span>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '2px 0 0', lineHeight: 1.5 }}>
              {msg.text}
            </p>
          </div>
        ))}

        {/* AI thinking */}
        {thinkingPlayer && (
          <div
            className="anim-slide-in"
            style={{
              borderRadius: 8, border: '1px solid', padding: '8px 12px',
              background: 'rgba(255,180,84,0.05)', borderColor: 'rgba(255,180,84,0.15)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-orange)' }}>
              {thinkingPlayer.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,180,84,0.6)',
                    animation: 'thinking-dots 1.2s ease-in-out infinite', animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={endRef} />
    </div>
  );
}
