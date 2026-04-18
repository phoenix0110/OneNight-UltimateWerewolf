'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserProfile, updateNickname } from '@/lib/firestore';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, signOut } = useAuth();

  const [nickname, setNickname] = useState('');
  const [savedNickname, setSavedNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (profile?.nickname) {
        setNickname(profile.nickname);
        setSavedNickname(profile.nickname);
      }
    });
  }, [user]);

  const handleSaveNickname = async () => {
    if (!user || !nickname.trim() || nickname.trim() === savedNickname) return;
    setSaving(true);
    try {
      await updateNickname(user.uid, nickname.trim());
      setSavedNickname(nickname.trim());
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 512, margin: '0 auto', width: '100%' }}>
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
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            {t('settings.general')}
          </h2>

          {/* Account */}
          <div className="panel" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', marginBottom: 12 }}>{t('settings.account')}</div>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {user.photoURL && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.displayName}</div>
                    </div>
                  </div>
                  <button onClick={signOut} className="btn btn-danger" style={{ fontSize: 12, minHeight: 36, padding: '6px 12px' }}>
                    {t('common.logout')}
                  </button>
                </div>

                {/* Email (read-only) */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {t('settings.email')}
                  </label>
                  <div style={{
                    padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid var(--border-default)',
                  }}>
                    {user.email}
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {t('settings.nickname')}
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder={t('settings.nicknamePlaceholder')}
                      maxLength={20}
                      style={{
                        flex: 1, padding: '8px 12px', fontSize: 13, borderRadius: 6,
                        border: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)', outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleSaveNickname}
                      disabled={saving || !nickname.trim() || nickname.trim() === savedNickname}
                      className="btn btn-success"
                      style={{ fontSize: 12, minHeight: 36, padding: '6px 16px', opacity: (!nickname.trim() || nickname.trim() === savedNickname) ? 0.5 : 1 }}
                    >
                      {saving ? '...' : t('settings.saveNickname')}
                    </button>
                  </div>
                  {showSaved && (
                    <div style={{ fontSize: 11, color: 'var(--accent-lime)', marginTop: 4 }}>
                      {t('settings.nicknameSaved')}
                    </div>
                  )}
                </div>
              </>
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
