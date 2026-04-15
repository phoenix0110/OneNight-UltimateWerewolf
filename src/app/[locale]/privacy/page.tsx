'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

const SECTIONS = [
  { titleKey: 'legal.privacyDataTitle', contentKey: 'legal.privacyDataContent' },
  { titleKey: 'legal.privacyUsageTitle', contentKey: 'legal.privacyUsageContent' },
  { titleKey: 'legal.privacyCookiesTitle', contentKey: 'legal.privacyCookiesContent' },
  { titleKey: 'legal.privacySecurityTitle', contentKey: 'legal.privacySecurityContent' },
] as const;

export default function PrivacyPage() {
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
          {t('legal.privacy')}
        </h1>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, padding: '0 4px' }}>
          {t('legal.privacyIntro')}
        </p>

        {SECTIONS.map((section) => (
          <section key={section.titleKey} className="panel" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 12 }}>
              {t(section.titleKey)}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
              {t(section.contentKey)}
            </p>
          </section>
        ))}

        <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>
          {t('legal.lastUpdated')}
        </p>
      </div>
    </div>
  );
}
