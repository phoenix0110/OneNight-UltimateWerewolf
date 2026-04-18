'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { canStartGame, getUserProfile } from '@/lib/firestore';

export default function UserDropdown() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [gamesRemaining, setGamesRemaining] = useState<number | null>(null);
  const [displayLabel, setDisplayLabel] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    getUserProfile(user.uid).then((profile) => {
      setDisplayLabel(profile?.nickname || user.displayName?.split(' ')[0] || '');
    });

    canStartGame(user.uid)
      .then(({ gamesRemaining: remaining }) => setGamesRemaining(remaining))
      .catch(() => setGamesRemaining(null));
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) return null;

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost"
        style={{ fontSize: 12, minHeight: 36, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {user.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            style={{ width: 22, height: 22, borderRadius: 6 }}
          />
        )}
        {displayLabel || user.displayName?.split(' ')[0] || t('common.account')}
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          className="panel-raised"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            minWidth: 200,
            padding: '8px 0',
            zIndex: 200,
          }}
        >
          {gamesRemaining !== null && gamesRemaining !== Infinity && (
            <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--accent-lime)', fontWeight: 600 }}>
              🎮 {t('common.gamesRemainingShort', { count: gamesRemaining })}
            </div>
          )}

          <button
            onClick={() => navigate(`/${locale}/settings`)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '10px 16px', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            ⚙️ {t('common.account')}
          </button>

          <button
            onClick={() => navigate(`/${locale}/achievements`)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '10px 16px', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            🏆 {t('common.achievements')}
          </button>

          <div style={{ height: 1, background: 'var(--border-default)', margin: '4px 0' }} />

          <button
            onClick={() => { setOpen(false); signOut(); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '10px 16px', fontSize: 13, color: 'var(--accent-red)', cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            🚪 {t('common.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
