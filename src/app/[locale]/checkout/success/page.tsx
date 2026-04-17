'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';

const REDIRECT_SECONDS = 5;

export default function CheckoutSuccessPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/${locale}/game`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [locale, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 16, textAlign: 'center' }}>
      <div className="anim-pulse-soft" style={{ fontSize: 64, marginBottom: 24 }}>
        🎉
      </div>

      <h1 className="font-pixel text-glow-moon" style={{ fontSize: 20, color: 'var(--accent-moon)', marginBottom: 12 }}>
        {t('checkout.successTitle')}
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 400, marginBottom: 32, lineHeight: 1.6 }}>
        {t('checkout.successDesc')}
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 24 }}>
        {t('checkout.redirecting', { seconds: countdown })}
      </p>

      <button
        onClick={() => router.push(`/${locale}/game`)}
        className="btn btn-success"
        style={{ fontSize: 14, padding: '10px 32px' }}
      >
        ▶ {t('common.play')}
      </button>
    </div>
  );
}
