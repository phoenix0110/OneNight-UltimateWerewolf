'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

export default function AboutPage() {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useParams();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <button onClick={() => router.push(`/${locale}`)} className="btn btn-ghost" style={{ fontSize: 13 }}>
          ← {t('common.back')}
        </button>
        <h1 className="font-pixel text-glow-moon" style={{ fontSize: 15, color: 'var(--accent-moon)', margin: 0 }}>
          {t('legal.about')}
        </h1>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 16 }}>🐺</div>
          <h2 className="font-pixel" style={{ fontSize: 18, color: 'var(--accent-moon)', textAlign: 'center', marginBottom: 16 }}>
            {t('common.appName')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {t('legal.aboutContent')}
          </p>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 12 }}>
            {t('legal.contactTitle')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
            {t('legal.contactContent')}
          </p>
        </section>
      </div>
    </div>
  );
}
