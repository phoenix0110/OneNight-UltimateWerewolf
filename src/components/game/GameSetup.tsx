'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { ROLES, RoleId } from '@/engine/roles';
import { BUILT_IN_PROVIDERS } from '@/ai/providers';
import LanguageToggle from '@/components/ui/LanguageToggle';

const ALL_ROLE_OPTIONS: { id: RoleId; count: number }[] = [
  { id: 'werewolf', count: 2 },
  { id: 'seer', count: 1 },
  { id: 'robber', count: 1 },
  { id: 'troublemaker', count: 1 },
  { id: 'villager', count: 3 },
  { id: 'insomniac', count: 1 },
  { id: 'drunk', count: 1 },
  { id: 'hunter', count: 1 },
  { id: 'tanner', count: 1 },
  { id: 'minion', count: 1 },
  { id: 'mason', count: 2 },
  { id: 'doppelganger', count: 1 },
];

export default function GameSetup() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const startGame = useGameStore((s) => s.startGame);
  const setProvider = useGameStore((s) => s.setProvider);
  const setLocale = useGameStore((s) => s.setLocale);

  const [playerName, setPlayerName] = useState('');
  const [playerCount, setPlayerCount] = useState(5);
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>([
    'werewolf', 'werewolf', 'seer', 'robber', 'troublemaker',
    'villager', 'villager', 'insomniac',
  ]);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');

  const requiredRoles = playerCount + 3;

  const toggleRole = (roleId: RoleId) => {
    const currentCount = selectedRoles.filter((r) => r === roleId).length;
    const maxCount = ROLES[roleId].maxCount;

    if (currentCount < maxCount && selectedRoles.length < requiredRoles) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else if (currentCount > 0) {
      const idx = selectedRoles.lastIndexOf(roleId);
      setSelectedRoles(selectedRoles.filter((_, i) => i !== idx));
    }
  };

  const canStart = selectedRoles.length === requiredRoles && playerName.trim();

  const handleStart = () => {
    const provider = BUILT_IN_PROVIDERS.find((p) => p.id === selectedProvider)!;
    setProvider({ ...provider, apiKey });
    setLocale(locale);

    startGame({
      playerCount,
      playerName: playerName.trim() || 'Player',
      roles: selectedRoles,
      aiProvider: selectedProvider,
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="pixel-btn px-2 py-1 text-[9px]"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-sm pixel-text text-pixel-yellow">
          {t('setup.title')}
        </h1>
        <LanguageToggle />
      </div>

      {/* Player Name */}
      <div className="w-full mb-4">
        <label className="text-pixel-light text-[10px] mb-1 block">
          {t('setup.playerName')}
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full pixel-box px-3 py-2 text-[11px] text-pixel-white bg-pixel-dark outline-none"
          placeholder="Enter your name..."
        />
      </div>

      {/* Player Count */}
      <div className="w-full mb-4">
        <label className="text-pixel-light text-[10px] mb-1 block">
          {t('setup.playerCount')}: {playerCount}
        </label>
        <div className="flex gap-2">
          {[3, 4, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              onClick={() => {
                setPlayerCount(n);
                setSelectedRoles([]);
              }}
              className={`pixel-btn px-3 py-1 text-[10px] ${
                playerCount === n ? 'pixel-btn-success' : ''
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Role Selection */}
      <div className="w-full mb-4">
        <label className="text-pixel-light text-[10px] mb-1 block">
          {t('setup.selectRoles')}
        </label>
        <div className="text-pixel-orange text-[9px] mb-2">
          {t('setup.rolesNeeded', { count: requiredRoles, players: playerCount })}
          {' — '}
          {t('setup.selected', { count: selectedRoles.length })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ALL_ROLE_OPTIONS.map(({ id }) => {
            const currentCount = selectedRoles.filter((r) => r === id).length;
            const maxCount = ROLES[id].maxCount;

            return (
              <button
                key={id}
                onClick={() => toggleRole(id)}
                className={`pixel-box p-2 text-left rounded transition-colors ${
                  currentCount > 0
                    ? 'border-pixel-lime border-2'
                    : 'hover:border-pixel-gray border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-pixel-cyan">
                    {t(`roles.${id}`)}
                  </span>
                  <span className="text-[8px] text-pixel-yellow">
                    {currentCount}/{maxCount}
                  </span>
                </div>
                <div className="text-[7px] text-pixel-light mt-0.5">
                  {t(`roles.${id}Desc`)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Provider */}
      <div className="w-full mb-4">
        <label className="text-pixel-light text-[10px] mb-1 block">
          {t('setup.aiProvider')}
        </label>
        <div className="flex gap-2 mb-2">
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
        </div>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full pixel-box px-3 py-2 text-[10px] text-pixel-white bg-pixel-dark outline-none"
          placeholder={t('setup.apiKey')}
        />
        <div className="text-[8px] text-pixel-gray mt-1">
          {t('setup.apiKeyHint')}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        className={`pixel-btn px-8 py-3 text-xs w-full ${
          canStart ? 'pixel-btn-success' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        {t('setup.startGame')}
      </button>
    </div>
  );
}
