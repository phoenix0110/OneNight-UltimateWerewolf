'use client';

import PlayerAvatar from './PlayerAvatar';

type AvatarState = 'default' | 'speaking' | 'spoke' | 'thinking' | 'waiting';

interface DiscussionAvatarNodeProps {
  name: string;
  isHuman: boolean;
  state: AvatarState;
  index: number;
}

export default function DiscussionAvatarNode({ name, isHuman, state }: DiscussionAvatarNodeProps) {
  const ringStyle = (): React.CSSProperties => {
    switch (state) {
      case 'speaking':
        return { boxShadow: '0 0 0 2px var(--accent-moon), 0 0 16px rgba(246,211,101,0.4)', transform: 'scale(1.1)' };
      case 'thinking':
        return { boxShadow: '0 0 0 2px rgba(255,180,84,0.6)' };
      case 'spoke':
        return { opacity: 0.5 };
      default:
        return {};
    }
  };

  return (
    <div style={{ transition: 'all 0.3s', ...ringStyle(), position: 'relative' }}>
      <PlayerAvatar name={name} isHuman={isHuman} size="sm" />

      {state === 'thinking' && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-orange)',
                animation: 'thinking-dots 1.2s ease-in-out infinite', animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </div>
      )}

      {state === 'speaking' && (
        <div style={{
          position: 'absolute', top: -4, right: 4, width: 16, height: 16, borderRadius: '50%',
          background: 'var(--accent-moon)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 8 }}>💬</span>
        </div>
      )}
    </div>
  );
}
