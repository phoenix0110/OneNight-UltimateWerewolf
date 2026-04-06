'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { ROLES, RoleId } from '@/engine/roles';
import { DEFAULT_ROLE_CONFIGS } from '@/engine/role-presets';
import { BUILT_IN_PROVIDERS } from '@/ai/providers';
import LanguageToggle from '@/components/ui/LanguageToggle';

const ALL_ROLE_OPTIONS: RoleId[] = [
  'werewolf', 'seer', 'robber', 'troublemaker', 'villager',
  'insomniac', 'drunk', 'hunter', 'tanner', 'minion', 'mason', 'doppelganger',
];

export default function GameSetup() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const startGame = useGameStore((s) => s.startGame);
  const setProvider = useGameStore((s) => s.setProvider);
  const setLocale = useGameStore((s) => s.setLocale);
  const providerConfig = useGameStore((s) => s.providerConfig);

  const [playerName, setPlayerName] = useState('');
  const [playerCount, setPlayerCount] = useState(5);
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>(
    [...DEFAULT_ROLE_CONFIGS[5]]
  );
  const [selectedProvider, setSelectedProvider] = useState(providerConfig.id);
  const [apiKey, setApiKey] = useState(providerConfig.apiKey);

  const requiredRoles = playerCount + 3;

  const getRoleCount = (roleId: RoleId) =>
    selectedRoles.filter((r) => r === roleId).length;

  const increaseRole = (roleId: RoleId) => {
    const current = getRoleCount(roleId);
    if (current >= ROLES[roleId].maxCount) return;
    if (selectedRoles.length >= requiredRoles) return;
    setSelectedRoles([...selectedRoles, roleId]);
  };

  const decreaseRole = (roleId: RoleId) => {
    const current = getRoleCount(roleId);
    if (current <= ROLES[roleId].minCount) return;
    if (current <= 0) return;
    const idx = selectedRoles.lastIndexOf(roleId);
    setSelectedRoles(selectedRoles.filter((_, i) => i !== idx));
  };

  const handlePlayerCountChange = (n: number) => {
    setPlayerCount(n);
    setSelectedRoles([...DEFAULT_ROLE_CONFIGS[n]]);
  };

  const canStart = selectedRoles.length === requiredRoles && playerName.trim();

  const handleStart = () => {
    const provider = BUILT_IN_PROVIDERS.find((p) => p.id === selectedProvider)!;
    setProvider({ ...provider, apiKey: apiKey.trim() });
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
          {[5, 6, 7, 8].map((n) => (
            <button
              key={n}
              onClick={() => handlePlayerCountChange(n)}
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
          {ALL_ROLE_OPTIONS.map((id) => {
            const currentCount = getRoleCount(id);
            const maxCount = ROLES[id].maxCount;
            const minCount = ROLES[id].minCount;
            const isRequired = minCount > 0;
            const canDecrease = currentCount > minCount;
            const canIncrease = currentCount < maxCount && selectedRoles.length < requiredRoles;

            return (
              <div
                key={id}
                className={`pixel-box p-2 rounded transition-colors ${
                  currentCount > 0
                    ? 'border-pixel-lime border-2'
                    : 'border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-pixel-cyan">
                    {t(`roles.${id}`)}
                    {isRequired && (
                      <span className="text-pixel-yellow text-[7px] ml-1">*</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => decreaseRole(id)}
                      disabled={!canDecrease}
                      className={`w-5 h-5 pixel-btn text-[10px] flex items-center justify-center ${
                        !canDecrease ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                    >
                      -
                    </button>
                    <span className="text-[9px] text-pixel-yellow w-5 text-center">
                      {currentCount}
                    </span>
                    <button
                      onClick={() => increaseRole(id)}
                      disabled={!canIncrease}
                      className={`w-5 h-5 pixel-btn text-[10px] flex items-center justify-center ${
                        !canIncrease ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-[7px] text-pixel-light">
                  {t(`roles.${id}Desc`)}
                </div>
              </div>
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
