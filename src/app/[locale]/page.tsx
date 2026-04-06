'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="text-pixel-yellow pixel-text text-xs sm:text-sm">
          {t('common.appName')}
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {user ? (
            <button
              onClick={signOut}
              className="pixel-btn px-2 py-1 text-[9px]"
              title={user.displayName || ''}
            >
              {user.displayName?.split(' ')[0] || t('common.logout')}
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="pixel-btn px-2 py-1 text-[9px]"
            >
              {t('common.login')}
            </button>
          )}
          <button
            onClick={() => router.push(`/${locale}/game`)}
            className="pixel-btn pixel-btn-success px-3 py-1.5 text-[10px]"
          >
            {t('common.play')}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-8">
          {/* Pixel art moon and werewolf scene */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-pixel-yellow opacity-80 animate-glow" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-6xl animate-float">
              🐺
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl pixel-text text-pixel-yellow mb-4">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-pixel-light text-[10px] sm:text-xs max-w-md mx-auto mb-8">
            {t('landing.heroSubtitle')}
          </p>

          <button
            onClick={() => router.push(`/${locale}/game`)}
            className="pixel-btn pixel-btn-success px-8 py-3 text-xs sm:text-sm"
          >
            ▶ {t('common.play')}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          {[
            { icon: '🤖', title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
            { icon: '🎨', title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
            { icon: '🃏', title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
          ].map((f) => (
            <div key={f.title} className="pixel-box p-4 rounded">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-pixel-cyan text-[10px] mb-1">{f.title}</div>
              <div className="text-pixel-light text-[8px]">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Subscription Section */}
        <section className="w-full max-w-xl mx-auto mb-12">
          <h2 className="text-sm pixel-text text-pixel-orange mb-4">
            {t('landing.subscribeTitle')}
          </h2>
          <p className="text-pixel-light text-[9px] mb-6">
            {t('landing.subscribeDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free */}
            <div className="pixel-box p-4 rounded">
              <div className="text-pixel-lime text-xs mb-2">{t('common.free')}</div>
              <div className="text-pixel-yellow text-lg mb-2">$0</div>
              <div className="text-pixel-light text-[8px] mb-4">
                {t('landing.freeFeatures')}
              </div>
              <button
                onClick={() => router.push(`/${locale}/game`)}
                className="pixel-btn w-full py-2 text-[10px]"
              >
                {t('landing.startFree')}
              </button>
            </div>

            {/* Premium */}
            <div className="pixel-box p-4 rounded border-2 border-pixel-yellow">
              <div className="text-pixel-yellow text-xs mb-2">{t('common.premium')}</div>
              <div className="text-pixel-yellow text-lg mb-2">
                {t('landing.premiumPrice')}
              </div>
              <div className="text-pixel-light text-[8px] mb-4">
                {t('landing.premiumFeatures')}
              </div>
              <button className="pixel-btn pixel-btn-success w-full py-2 text-[10px]">
                {t('common.subscribe')}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push(`/${locale}/achievements`)}
            className="text-pixel-light text-[9px] hover:text-pixel-cyan"
          >
            {t('common.achievements')}
          </button>
          <button
            onClick={() => router.push(`/${locale}/settings`)}
            className="text-pixel-light text-[9px] hover:text-pixel-cyan"
          >
            {t('common.settings')}
          </button>
        </div>
      </footer>
    </div>
  );
}
