'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BUILT_IN_PROVIDERS } from '@/ai/providers';
import { useGameStore } from '@/store/game-store';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, signOut } = useAuth();
  const providerConfig = useGameStore((s) => s.providerConfig);
  const setProvider = useGameStore((s) => s.setProvider);

  const [selectedProvider, setSelectedProvider] = useState(providerConfig.id);
  const [apiKey, setApiKey] = useState(providerConfig.apiKey);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (selectedProvider === 'custom') {
      setProvider({
        id: 'custom',
        name: 'Custom',
        baseUrl: customBaseUrl,
        model: customModel,
        apiKey,
      });
    } else {
      const builtIn = BUILT_IN_PROVIDERS.find((p) => p.id === selectedProvider)!;
      setProvider({ ...builtIn, apiKey });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="pixel-btn px-2 py-1 text-[9px]"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-sm pixel-text text-pixel-yellow">
          {t('settings.title')}
        </h1>
        <LanguageToggle />
      </div>

      {/* Account Section */}
      <div className="pixel-box p-4 rounded mb-4">
        <div className="text-[10px] text-pixel-yellow mb-3">Account</div>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user.photoURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-8 h-8 rounded"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
              <div>
                <div className="text-[10px] text-pixel-white">
                  {user.displayName}
                </div>
                <div className="text-[8px] text-pixel-gray">{user.email}</div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="pixel-btn pixel-btn-danger px-3 py-1 text-[9px]"
            >
              {t('common.logout')}
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="pixel-btn pixel-btn-success px-4 py-2 text-[9px] w-full"
          >
            {t('common.loginWithGoogle')}
          </button>
        )}
      </div>

      {/* Language */}
      <div className="pixel-box p-4 rounded mb-4">
        <div className="text-[10px] text-pixel-yellow mb-3">
          {t('settings.language')}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/en/settings`)}
            className={`pixel-btn px-4 py-1 text-[9px] flex-1 ${
              locale === 'en' ? 'pixel-btn-success' : ''
            }`}
          >
            English
          </button>
          <button
            onClick={() => router.push(`/zh/settings`)}
            className={`pixel-btn px-4 py-1 text-[9px] flex-1 ${
              locale === 'zh' ? 'pixel-btn-success' : ''
            }`}
          >
            中文
          </button>
        </div>
      </div>

      {/* AI Provider */}
      <div className="pixel-box p-4 rounded mb-4">
        <div className="text-[10px] text-pixel-yellow mb-3">
          {t('settings.aiProvider')}
        </div>

        <div className="text-[9px] text-pixel-light mb-2">
          {t('settings.selectProvider')}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {BUILT_IN_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={`pixel-btn px-3 py-1 text-[9px] ${
                selectedProvider === p.id ? 'pixel-btn-success' : ''
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={() => setSelectedProvider('custom')}
            className={`pixel-btn px-3 py-1 text-[9px] ${
              selectedProvider === 'custom' ? 'pixel-btn-success' : ''
            }`}
          >
            {t('settings.customProvider')}
          </button>
        </div>

        {selectedProvider === 'custom' && (
          <>
            <div className="mb-2">
              <label className="text-[9px] text-pixel-gray block mb-1">
                {t('settings.baseUrl')}
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                className="w-full pixel-box px-3 py-1.5 text-[10px] text-pixel-white bg-pixel-dark outline-none"
                placeholder="https://api.example.com/v1"
              />
            </div>
            <div className="mb-2">
              <label className="text-[9px] text-pixel-gray block mb-1">
                {t('settings.model')}
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="w-full pixel-box px-3 py-1.5 text-[10px] text-pixel-white bg-pixel-dark outline-none"
                placeholder="gpt-4o-mini"
              />
            </div>
          </>
        )}

        <div className="mb-3">
          <label className="text-[9px] text-pixel-gray block mb-1">
            {t('settings.apiKey')}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full pixel-box px-3 py-1.5 text-[10px] text-pixel-white bg-pixel-dark outline-none"
            placeholder="sk-..."
          />
        </div>

        <button
          onClick={handleSave}
          className="pixel-btn pixel-btn-success px-6 py-2 text-[9px] w-full"
        >
          {saved ? `✓ ${t('settings.saved')}` : t('settings.save')}
        </button>
      </div>
    </div>
  );
}
