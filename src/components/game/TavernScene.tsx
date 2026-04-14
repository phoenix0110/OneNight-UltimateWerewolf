'use client';

import { ReactNode } from 'react';
import CandlelightOverlay from './CandlelightOverlay';

interface TavernSceneProps {
  children: ReactNode;
  className?: string;
  /** Use "wide" for left-right split layouts (e.g. Role Reveal) */
  layout?: 'default' | 'wide';
}

/**
 * Full-screen tavern scene container.
 * Provides the multi-layer CSS background (dark wood walls, candle glow, sconce lights)
 * and decorative wall sconces for atmosphere.
 */
export default function TavernScene({ children, className = '', layout = 'default' }: TavernSceneProps) {
  return (
    <div
      className={`scene-tavern-room ${className}`}
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Wall sconces (decorative pixel torches) */}
      <WallSconce side="left" />
      <WallSconce side="right" />

      {/* Atmospheric candlelight overlay */}
      <CandlelightOverlay />

      {/* Scene content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: layout === 'wide' ? 900 : 600,
          padding: '0 16px',
        }}
      >
        {children}
      </div>

      {/* Responsive CSS for role-reveal-split */}
      <style>{`
        .role-reveal-split {
          flex-direction: row !important;
        }
        @media (max-width: 768px) {
          .role-reveal-split {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}

function WallSconce({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        [isLeft ? 'left' : 'right']: 24,
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Flame */}
      <div
        className="anim-sconce-flame"
        style={{
          width: 10,
          height: 14,
          borderRadius: '50% 50% 40% 40%',
          background: 'radial-gradient(ellipse at 50% 70%, #FFB454 0%, #FF8C00 50%, rgba(255,107,50,0.4) 100%)',
          boxShadow: '0 0 12px 4px rgba(255, 180, 84, 0.4), 0 0 24px 8px rgba(255, 140, 0, 0.15)',
          animationDelay: isLeft ? '0s' : '0.7s',
        }}
      />
      {/* Bracket */}
      <div
        style={{
          width: 6,
          height: 18,
          background: 'linear-gradient(180deg, #8B7355 0%, #6B5340 100%)',
          borderRadius: 2,
        }}
      />
      {/* Wall plate */}
      <div
        style={{
          width: 14,
          height: 6,
          background: '#5C4A3A',
          borderRadius: 2,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      />
    </div>
  );
}
