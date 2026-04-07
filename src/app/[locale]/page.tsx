'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LanguageToggle from '@/components/ui/LanguageToggle';

const FEATURES = [
  { icon: '🤖', titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
  { icon: '🎨', titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
  { icon: '🃏', titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
] as const;

const PHASES = [
  { icon: '⚙️', label: 'Setup' },
  { icon: '🌙', label: 'Night' },
  { icon: '☀️', label: 'Day' },
  { icon: '🗳️', label: 'Vote' },
  { icon: '🏆', label: 'Result' },
] as const;

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* ── Header ── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <span className="font-pixel text-glow-moon" style={{ color: 'var(--accent-moon)', fontSize: 13 }}>
          {t('common.appName')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageToggle />
          {user ? (
            <button onClick={signOut} className="btn btn-ghost" style={{ fontSize: 12 }} title={user.displayName || ''}>
              {user.displayName?.split(' ')[0] || t('common.logout')}
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="btn btn-ghost" style={{ fontSize: 12 }}>
              {t('common.login')}
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ marginBottom: 48, maxWidth: 520 }}>
          {/* Moon + Werewolf scene */}
          <div style={{ position: 'relative', width: 224, height: 224, margin: '0 auto 32px' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 112, height: 112, borderRadius: '50%', background: 'rgba(246,211,101,0.2)', filter: 'blur(24px)' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="anim-pulse-soft" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(246,211,101,0.3)' }} />
            </div>
            <div className="anim-float" style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', fontSize: 72 }}>
              🐺
            </div>
            <div className="anim-blink" style={{ position: 'absolute', top: 16, left: 32, fontSize: 12, color: 'rgba(246,211,101,0.6)' }}>✦</div>
            <div className="anim-blink" style={{ position: 'absolute', top: 40, right: 40, fontSize: 14, color: 'rgba(89,208,255,0.4)', animationDelay: '1s' }}>✦</div>
            <div className="anim-blink" style={{ position: 'absolute', top: 24, right: 80, fontSize: 12, color: 'rgba(246,211,101,0.4)', animationDelay: '2s' }}>✧</div>
          </div>

          <h1 className="font-pixel text-glow-moon" style={{ fontSize: 26, color: 'var(--accent-moon)', marginBottom: 16, lineHeight: 1.4 }}>
            {t('landing.heroTitle')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
            {t('landing.heroSubtitle')}
          </p>

          <button
            onClick={() => router.push(`/${locale}/game`)}
            className="btn btn-success"
            style={{ fontSize: 16, padding: '12px 40px', minHeight: 52, boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
          >
            ▶ {t('common.play')}
          </button>
        </div>

        {/* ── Feature cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 640, width: '100%', margin: '0 auto 48px' }}>
          {FEATURES.map((f) => (
            <div key={f.titleKey} className="panel" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ color: 'var(--accent-cyan)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {t(f.titleKey)}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>
                {t(f.descKey)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Phase timeline ── */}
        <div style={{ width: '100%', maxWidth: 480, margin: '0 auto 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            {PHASES.map((phase, i) => (
              <div key={phase.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 20, marginBottom: 4 }}>{phase.icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{phase.label}</span>
                </div>
                {i < PHASES.length - 1 && (
                  <div style={{ width: 32, height: 1, background: 'var(--border-default)', margin: '0 6px', marginTop: -12 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Subscription (de-prioritized) ── */}
        <section style={{ width: '100%', maxWidth: 520, margin: '0 auto 48px' }}>
          <h2 className="font-pixel" style={{ fontSize: 13, color: 'var(--accent-orange)', marginBottom: 12 }}>
            {t('landing.subscribeTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            {t('landing.subscribeDesc')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Free */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ color: 'var(--accent-lime)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('common.free')}</div>
              <div style={{ color: 'var(--accent-moon)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>$0</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
                {t('landing.freeFeatures')}
              </div>
              <button onClick={() => router.push(`/${locale}/game`)} className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }}>
                {t('landing.startFree')}
              </button>
            </div>

            {/* Premium */}
            <div className="panel" style={{ padding: 20, borderColor: 'rgba(246,211,101,0.4)', boxShadow: '0 0 0 1px rgba(246,211,101,0.2)' }}>
              <div style={{ color: 'var(--accent-moon)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('common.premium')}</div>
              <div style={{ color: 'var(--accent-moon)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                {t('landing.premiumPrice')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
                {t('landing.premiumFeatures')}
              </div>
              <button className="btn btn-success" style={{ width: '100%', fontSize: 13 }}>
                {t('common.subscribe')}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 16 }}>
        <button
          onClick={() => router.push(`/${locale}/achievements`)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {t('common.achievements')}
        </button>
        <button
          onClick={() => router.push(`/${locale}/settings`)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {t('common.settings')}
        </button>
      </footer>
    </div>
  );
}
