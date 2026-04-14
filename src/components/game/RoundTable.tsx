'use client';

import { useTranslations } from 'next-intl';

interface RoundTableProps {
  size?: number;
  centerCardsCount?: number;
  animationDelay?: number;
}

export default function RoundTable({
  size = 210,
  centerCardsCount = 3,
  animationDelay = 200,
}: RoundTableProps) {
  const t = useTranslations();

  return (
    <div
      className="anim-table-appear"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        animationDelay: `${animationDelay}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Table surface */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at 50% 50%, #3D2B1F 0%, #2A1F15 60%, #1F170F 100%)',
          border: '3px solid #4A3728',
          boxShadow:
            'inset 0 0 30px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.6), 0 0 40px rgba(246, 211, 101, 0.05)',
        }}
      />

      {/* Wood grain rings */}
      <div
        style={{
          position: 'absolute',
          inset: 14,
          borderRadius: '50%',
          border: '1px solid rgba(74, 55, 40, 0.3)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 32,
          borderRadius: '50%',
          border: '1px solid rgba(74, 55, 40, 0.2)',
          pointerEvents: 'none',
        }}
      />

      {/* Candle at center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -80%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <div
          className="anim-sconce-flame"
          style={{
            width: 7,
            height: 12,
            borderRadius: '50% 50% 40% 40%',
            background:
              'radial-gradient(ellipse at 50% 70%, #FFD700 0%, #FF8C00 60%, rgba(255,107,50,0.3) 100%)',
            boxShadow:
              '0 0 8px 3px rgba(255, 200, 50, 0.5), 0 0 20px 6px rgba(255, 160, 30, 0.2)',
            marginBottom: 1,
          }}
        />
        <div
          style={{
            width: 7,
            height: 14,
            background: 'linear-gradient(180deg, #E8D5B0 0%, #D4C098 100%)',
            borderRadius: '1px 1px 2px 2px',
          }}
        />
        <div
          style={{
            width: 16,
            height: 5,
            background: '#8B7355',
            borderRadius: 2,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />
      </div>

      {/* Center cards */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: 'var(--text-muted)',
            textAlign: 'center',
            letterSpacing: '0.5px',
            opacity: 0.7,
          }}
        >
          {t('game.centerCards')}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: centerCardsCount }).map((_, i) => (
            <div
              key={i}
              className="anim-micro-float"
              style={{
                width: 26,
                height: 34,
                borderRadius: 4,
                background:
                  'linear-gradient(135deg, #2A1F4E 0%, #1A1338 100%)',
                border: '1.5px solid #3D3066',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: 'rgba(176, 140, 255, 0.5)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                animationDelay: `${i * 0.3}s`,
              }}
            >
              ?
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
