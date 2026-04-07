'use client';

type AvatarState = 'default' | 'speaking' | 'spoke' | 'thinking' | 'waiting';

interface DiscussionAvatarNodeProps {
  name: string;
  isHuman: boolean;
  state: AvatarState;
  index: number;
}

const BG_COLORS = [
  '#1d4ed8', '#be123c', '#047857', '#b45309',
  '#7e22ce', '#0f766e', '#4338ca', '#0369a1',
];

export default function DiscussionAvatarNode({ name, isHuman, state, index }: DiscussionAvatarNodeProps) {
  const bgColor = BG_COLORS[index % BG_COLORS.length];

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.3s' }}>
      <div
        style={{
          width: 48, height: 48, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', background: bgColor,
          boxShadow: isHuman ? '0 0 0 2px var(--accent-cyan)' : undefined,
          transition: 'all 0.3s',
          ...ringStyle(),
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>
          {isHuman ? '🧑' : '🤖'}
        </span>

        {state === 'thinking' && (
          <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
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
            position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent-moon)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 8 }}>💬</span>
          </div>
        )}
      </div>

      <span style={{
        fontSize: 11, textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontWeight: state === 'speaking' ? 700 : 500,
        color: state === 'speaking' ? 'var(--accent-moon)' : isHuman ? 'var(--accent-cyan)' : 'var(--text-secondary)',
        opacity: state === 'spoke' ? 0.5 : 1,
      }}>
        {name}
      </span>
    </div>
  );
}
