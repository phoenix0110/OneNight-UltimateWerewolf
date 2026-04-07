'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 512, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <button onClick={() => router.push(`/${locale}`)} className="btn btn-ghost" style={{ fontSize: 13 }}>
          ← {t('common.back')}
        </button>
        <h1 className="font-pixel text-glow-moon" style={{ fontSize: 15, color: 'var(--accent-moon)', margin: 0 }}>
          {t('settings.title')}
        </h1>
        <LanguageToggle />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* General Settings */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            General
          </h2>

          {/* Account */}
          <div className="panel" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', marginBottom: 12 }}>Account</div>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {user.photoURL && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>
                <button onClick={signOut} className="btn btn-danger" style={{ fontSize: 12, minHeight: 36, padding: '6px 12px' }}>
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <button onClick={signInWithGoogle} className="btn btn-success" style={{ width: '100%', fontSize: 14 }}>
                {t('common.loginWithGoogle')}
              </button>
            )}
          </div>

          {/* Language */}
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', marginBottom: 12 }}>
              {t('settings.language')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => router.push('/en/settings')}
                className={`btn ${locale === 'en' ? 'btn-success' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: 14 }}
              >
                English
              </button>
              <button
                onClick={() => router.push('/zh/settings')}
                className={`btn ${locale === 'zh' ? 'btn-success' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: 14 }}
              >
                中文
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
