'use client';

import { ReactNode } from 'react';

interface ActionFooterProps {
  children: ReactNode;
}

export default function ActionFooter({ children }: ActionFooterProps) {
  return (
    <div className="sticky-footer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
      {children}
    </div>
  );
}
