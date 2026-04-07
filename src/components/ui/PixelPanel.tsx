'use client';

import { ReactNode } from 'react';

type PanelVariant = 'default' | 'raised' | 'overlay' | 'legacy';

interface PixelPanelProps {
  children: ReactNode;
  variant?: PanelVariant;
  className?: string;
  glow?: 'moon' | 'cyan' | 'red' | 'lime' | null;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses: Record<PanelVariant, string> = {
  default: 'panel',
  raised: 'panel-raised',
  overlay: 'panel-overlay',
  legacy: 'pixel-box rounded',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const glowClasses = {
  moon: 'ring-1 ring-accent-moon/30 shadow-[0_0_16px_rgba(246,211,101,0.15)]',
  cyan: 'ring-1 ring-accent-cyan/30 shadow-[0_0_16px_rgba(89,208,255,0.15)]',
  red: 'ring-1 ring-accent-red/30 shadow-[0_0_16px_rgba(255,107,107,0.15)]',
  lime: 'ring-1 ring-accent-lime/30 shadow-[0_0_16px_rgba(125,255,152,0.15)]',
};

export default function PixelPanel({
  children,
  variant = 'default',
  className = '',
  glow = null,
  padding = 'md',
}: PixelPanelProps) {
  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${glow ? glowClasses[glow] : ''}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
