'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { ROLES, RoleId } from '@/engine/roles';
import {
  ALL_ROLE_OPTIONS,
  calculateRequiredRoles,
  DEFAULT_ROLE_CONFIGS,
  PLAYER_COUNT_OPTIONS,
} from '@/engine/game-rules';
import { useAuth } from '@/lib/auth-context';
import { canStartGame, consumeGame } from '@/lib/firestore';
import LanguageToggle from '@/components/ui/LanguageToggle';
import MatchSummaryCard from './MatchSummaryCard';

/** Preset player name lists — 10 per locale. */
const PRESET_NAMES: Record<string, string[]> = {
  zh: ['云中君', '夜未央', '风临尘', '月无痕', '星落辰', '霜凝雪', '墨飞白', '烟如织', '雨听禅', '花照影'],
  en: ['Sam', 'Max', 'Charlie', 'Jamie', 'Robin', 'Avery', 'Taylor', 'Kai', 'Skyler', 'River'],
};

/** Sentinel value indicating "custom name" mode. */
const CUSTOM_KEY = '__custom__';

export default function GameSetup() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { user } = useAuth();
  const startGame = useGameStore((s) => s.startGame);
  const setLocale = useGameStore((s) => s.setLocale);

  const [gamesRemaining, setGamesRemaining] = useState<number | null>(null);
  const [noGames, setNoGames] = useState(false);

  useEffect(() => {
    if (!user) return;
    canStartGame(user.uid).then(({ allowed, gamesRemaining: remaining }) => {
      setGamesRemaining(remaining);
      setNoGames(!allowed);
    });
  }, [user]);

  const nameList = PRESET_NAMES[locale] ?? PRESET_NAMES.en;
  const [selectedNameKey, setSelectedNameKey] = useState(nameList[0]); // default = first preset name
  const [customName, setCustomName] = useState('');
  const isCustom = selectedNameKey === CUSTOM_KEY;
  const playerName = isCustom ? customName : selectedNameKey;

  const [playerCount, setPlayerCount] = useState<number>(PLAYER_COUNT_OPTIONS[0]);
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>([...DEFAULT_ROLE_CONFIGS[PLAYER_COUNT_OPTIONS[0]]]);

  const requiredRoles = calculateRequiredRoles(playerCount);

  const getRoleCount = (roleId: RoleId) => selectedRoles.filter((r) => r === roleId).length;

  const increaseRole = (roleId: RoleId) => {
    if (getRoleCount(roleId) >= ROLES[roleId].maxCount) return;
    if (selectedRoles.length >= requiredRoles) return;
    setSelectedRoles([...selectedRoles, roleId]);
  };

  const decreaseRole = (roleId: RoleId) => {
    const current = getRoleCount(roleId);
    if (current <= ROLES[roleId].minCount || current <= 0) return;
    const idx = selectedRoles.lastIndexOf(roleId);
    setSelectedRoles(selectedRoles.filter((_, i) => i !== idx));
  };

  const handlePlayerCountChange = (n: number) => {
    setPlayerCount(n);
    setSelectedRoles([...DEFAULT_ROLE_CONFIGS[n]]);
  };

  const canStart = selectedRoles.length === requiredRoles && playerName.trim();

  const handleStart = async () => {
    if (user) {
      const consumed = await consumeGame(user.uid);
      if (!consumed) {
        setNoGames(true);
        return;
      }
      setGamesRemaining((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
    }
    setLocale(locale);
    startGame({ playerCount, playerName: playerName.trim() || t('setup.defaultPlayerName'), roles: selectedRoles });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 512, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <button onClick={() => router.push(`/${locale}`)} className="btn btn-ghost" style={{ fontSize: 13 }}>
          ← {t('common.back')}
        </button>
        <h1 className="font-pixel text-glow-moon" style={{ fontSize: 15, color: 'var(--accent-moon)', margin: 0 }}>
          {t('setup.title')}
        </h1>
        <LanguageToggle />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Player Name */}
        <section>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {t('setup.playerName')}
          </label>

          {/* Preset name grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {nameList.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedNameKey(name)}
                className={`btn ${selectedNameKey === name ? 'btn-success' : 'btn-secondary'}`}
                style={{ fontSize: 13, padding: '6px 14px', minHeight: 36 }}
              >
                {name}
              </button>
            ))}
            <button
              onClick={() => setSelectedNameKey(CUSTOM_KEY)}
              className={`btn ${isCustom ? 'btn-success' : 'btn-secondary'}`}
              style={{ fontSize: 13, padding: '6px 14px', minHeight: 36 }}
            >
              ✏️ {t('setup.customName')}
            </button>
          </div>

          {/* Custom name input — only shown when "custom" is selected */}
          {isCustom && (
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="input"
              placeholder={t('setup.namePlaceholder')}
              autoFocus
            />
          )}
        </section>

        {/* Player Count */}
        <section>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {t('setup.playerCount')}: <span style={{ color: 'var(--accent-moon)' }}>{playerCount}</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PLAYER_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => handlePlayerCountChange(n)}
                className={`btn ${playerCount === n ? 'btn-success' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: 14 }}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* Role Selection */}
        <section>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {t('setup.selectRoles')}
          </label>
          <div style={{ fontSize: 13, color: 'var(--accent-orange)', marginBottom: 12 }}>
            {t('setup.rolesNeeded', { count: requiredRoles, players: playerCount })}
            {' — '}
            <span style={{ color: selectedRoles.length === requiredRoles ? 'var(--accent-lime)' : undefined }}>
              {t('setup.selected', { count: selectedRoles.length })}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                  className="panel"
                  style={{
                    padding: 12,
                    transition: 'all 0.15s',
                    borderColor: currentCount > 0 ? 'rgba(125,255,152,0.4)' : undefined,
                    boxShadow: currentCount > 0 ? '0 0 0 1px rgba(125,255,152,0.15)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {t(`roles.${id}`)}
                      {isRequired && <span style={{ color: 'var(--accent-moon)', fontSize: 11, marginLeft: 4 }}>*</span>}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => decreaseRole(id)}
                        disabled={!canDecrease}
                        style={{
                          width: 28, height: 28, borderRadius: 6, fontSize: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-base)', border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)', cursor: canDecrease ? 'pointer' : 'not-allowed',
                          opacity: canDecrease ? 1 : 0.2,
                        }}
                      >
                        −
                      </button>
                      <span style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--accent-moon)' }}>
                        {currentCount}
                      </span>
                      <button
                        onClick={() => increaseRole(id)}
                        disabled={!canIncrease}
                        style={{
                          width: 28, height: 28, borderRadius: 6, fontSize: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-base)', border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)', cursor: canIncrease ? 'pointer' : 'not-allowed',
                          opacity: canIncrease ? 1 : 0.2,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t(`roles.${id}Desc`)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Match Summary */}
        <MatchSummaryCard
          playerCount={playerCount}
          requiredRoles={requiredRoles}
          selectedRoles={selectedRoles}
        />
      </div>

      {/* Sticky Start Button */}
      <div className="sticky-footer" style={{ padding: 16 }}>
        {user && gamesRemaining !== null && !noGames && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 6 }}>
            {t('setup.gamesRemaining', { count: gamesRemaining })}
          </p>
        )}
        {noGames && (
          <p style={{ fontSize: 12, color: 'var(--accent-red)', textAlign: 'center', marginBottom: 8 }}>
            {t('setup.noGamesRemaining')}
          </p>
        )}
        {!canStart && !noGames && (
          <p style={{ fontSize: 12, color: 'var(--accent-orange)', textAlign: 'center', marginBottom: 8 }}>
            {!playerName.trim()
              ? t('setup.nameRequired')
              : selectedRoles.length !== requiredRoles
                ? t('setup.rolesRemaining', { count: requiredRoles - selectedRoles.length })
                : ''}
          </p>
        )}
        <button
          onClick={handleStart}
          disabled={!canStart || noGames}
          className="btn btn-success"
          style={{ width: '100%', fontSize: 15, minHeight: 48 }}
        >
          {t('setup.startGame')}
        </button>
      </div>
    </div>
  );
}
