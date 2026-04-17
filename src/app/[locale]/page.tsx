'use client';

import { useState } from 'react';
import { CreemCheckout } from '@creem_io/nextjs';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LanguageToggle from '@/components/ui/LanguageToggle';

const PHASES = [
  { icon: '⚙️', labelKey: 'landing.phaseSetup' },
  { icon: '🌙', labelKey: 'landing.phaseNight' },
  { icon: '☀️', labelKey: 'landing.phaseDay' },
  { icon: '🗳️', labelKey: 'landing.phaseVote' },
  { icon: '🏆', labelKey: 'landing.phaseResult' },
] as const;

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

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
            <button onClick={signOut} className="btn btn-ghost" style={{ fontSize: 12, minHeight: 36, padding: '6px 12px' }} title={user.displayName || ''}>
              {user.displayName?.split(' ')[0] || t('common.logout')}
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn btn-ghost"
              style={{ fontSize: 12, minHeight: 36, padding: '6px 12px' }}
            >
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

        {/* ── Phase timeline ── */}
        <div style={{ width: '100%', maxWidth: 480, margin: '0 auto 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            {PHASES.map((phase, i) => (
              <div key={phase.labelKey} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 20, marginBottom: 4 }}>{phase.icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t(phase.labelKey)}</span>
                </div>
                {i < PHASES.length - 1 && (
                  <div style={{ width: 32, height: 1, background: 'var(--border-default)', margin: '0 6px', marginTop: -12 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Pricing ── */}
        <section style={{ width: '100%', maxWidth: 640, margin: '0 auto 48px' }}>
          <h2 className="font-pixel" style={{ fontSize: 13, color: 'var(--accent-orange)', marginBottom: 12 }}>
            {t('landing.subscribeTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            {t('landing.subscribeDesc')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {/* Free Trial */}
            <div className="panel" style={{ padding: 16 }}>
              <div style={{ color: 'var(--accent-lime)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t('common.free')}</div>
              <div style={{ color: 'var(--accent-moon)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>$0</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 16, lineHeight: 1.5 }}>
                {t('landing.freeFeatures')}
              </div>
              <button onClick={() => router.push(`/${locale}/game`)} className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }}>
                {t('landing.startFree')}
              </button>
            </div>

            {/* Pay to Go */}
            <div className="panel" style={{ padding: 16, borderColor: 'rgba(89,208,255,0.4)', boxShadow: '0 0 0 1px rgba(89,208,255,0.15)' }}>
              <div style={{ color: 'var(--accent-cyan)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t('common.starter')}</div>
              <div style={{ color: 'var(--accent-moon)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                {t('landing.starterPrice')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 16, lineHeight: 1.5 }}>
                {t('landing.starterFeatures')}
              </div>
              {user && process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID ? (
                <CreemCheckout
                  productId={process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID}
                  customer={{ email: user.email || undefined, name: user.displayName || undefined }}
                  referenceId={user.uid}
                  successUrl={`/${locale}/checkout/success`}
                >
                  <button className="btn btn-success" style={{ width: '100%', fontSize: 12 }}>
                    {t('landing.buyStarter')}
                  </button>
                </CreemCheckout>
              ) : (
                <button
                  onClick={() => !user ? setShowLoginModal(true) : alert('Payment product not configured')}
                  className="btn btn-success"
                  style={{ width: '100%', fontSize: 12 }}
                >
                  {t('landing.buyStarter')}
                </button>
              )}
            </div>

            {/* Monthly Pass */}
            <div className="panel" style={{ padding: 16, borderColor: 'rgba(246,211,101,0.4)', boxShadow: '0 0 0 1px rgba(246,211,101,0.2)' }}>
              <div style={{ color: 'var(--accent-moon)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t('common.monthly')}</div>
              <div style={{ color: 'var(--accent-moon)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                {t('landing.monthlyPrice')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 16, lineHeight: 1.5 }}>
                {t('landing.monthlyFeatures')}
              </div>
              {user && process.env.NEXT_PUBLIC_CREEM_MONTHLY_PRODUCT_ID ? (
                <CreemCheckout
                  productId={process.env.NEXT_PUBLIC_CREEM_MONTHLY_PRODUCT_ID}
                  customer={{ email: user.email || undefined, name: user.displayName || undefined }}
                  referenceId={user.uid}
                  successUrl={`/${locale}/checkout/success`}
                >
                  <button className="btn btn-success" style={{ width: '100%', fontSize: 12 }}>
                    {t('landing.subscribeMonthly')}
                  </button>
                </CreemCheckout>
              ) : (
                <button
                  onClick={() => !user ? setShowLoginModal(true) : alert('Payment product not configured')}
                  className="btn btn-success"
                  style={{ width: '100%', fontSize: 12 }}
                >
                  {t('landing.subscribeMonthly')}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16, flexWrap: 'wrap' }}>
        {[
          { label: t('common.achievements'), href: `/${locale}/achievements` },
          { label: t('legal.about'), href: `/${locale}/about` },
          { label: t('legal.privacy'), href: `/${locale}/privacy` },
          { label: t('legal.terms'), href: `/${locale}/terms` },
        ].map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {link.label}
          </button>
        ))}
      </footer>

      {/* ── Login Modal ── */}
      {showLoginModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="panel-raised"
            style={{ padding: 32, textAlign: 'center', maxWidth: 340, width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 28, marginBottom: 16 }}>🐺</div>
            <h2 className="font-pixel" style={{ fontSize: 16, color: 'var(--accent-moon)', marginBottom: 8 }}>
              {t('common.login')}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              {t('achievements.loginRequired')}
            </p>
            <button
              onClick={() => { signInWithGoogle(); setShowLoginModal(false); }}
              className="btn btn-success"
              style={{ width: '100%', fontSize: 14 }}
            >
              {t('common.loginWithGoogle')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
