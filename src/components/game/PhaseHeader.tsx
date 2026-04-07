'use client';

import { ReactNode } from 'react';

interface PhaseHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
  badge?: ReactNode;
  rightContent?: ReactNode;
}

const ACCENT_COLORS: Record<string, string> = {
  moon: 'var(--accent-moon)',
  cyan: 'var(--accent-cyan)',
  red: 'var(--accent-red)',
  lime: 'var(--accent-lime)',
  orange: 'var(--accent-orange)',
  purple: 'var(--accent-purple)',
};

export default function PhaseHeader({
  icon,
  title,
  subtitle,
  accentColor = 'moon',
  badge,
  rightContent,
}: PhaseHeaderProps) {
  const color = ACCENT_COLORS[accentColor] || ACCENT_COLORS.moon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              className="font-pixel"
              style={{ fontSize: 16, color, margin: 0, textShadow: `0 0 12px ${color}40` }}
            >
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}
