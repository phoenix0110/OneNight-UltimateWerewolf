'use client';

import { useTranslations } from 'next-intl';
import { RoleId } from '@/engine/roles';

interface MatchSummaryCardProps {
  playerCount: number;
  requiredRoles: number;
  selectedRoles: RoleId[];
}

export default function MatchSummaryCard({
  playerCount,
  requiredRoles,
  selectedRoles,
}: MatchSummaryCardProps) {
  const t = useTranslations();
  const isComplete = selectedRoles.length === requiredRoles;

  const roleCounts: Partial<Record<RoleId, number>> = {};
  for (const role of selectedRoles) {
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  }

  return (
    <div className="panel-raised" style={{ padding: 16 }}>
      <h3 className="font-pixel" style={{ fontSize: 13, color: 'var(--accent-moon)', margin: '0 0 12px' }}>
        Match Summary
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>👥</span>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('setup.playerCount')}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{playerCount}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🃏</span>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Roles</div>
            <div style={{ fontWeight: 600, color: isComplete ? 'var(--accent-lime)' : 'var(--accent-orange)' }}>
              {selectedRoles.length}/{requiredRoles}
            </div>
          </div>
        </div>
      </div>

      {Object.keys(roleCounts).length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-default)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(roleCounts).map(([role, count]) => (
            <span
              key={role}
              style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 99,
                background: 'var(--bg-base)', border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              {t(`roles.${role}`)} {count! > 1 ? `×${count}` : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
