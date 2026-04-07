'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const toggleLocale = () => {
    const newLocale = currentLocale === 'en' ? 'zh' : 'en';
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLocale}
      className="btn btn-ghost"
      style={{ fontSize: 12, minHeight: 32, padding: '4px 10px' }}
      title={currentLocale === 'en' ? '切换中文' : 'Switch to English'}
    >
      {currentLocale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
