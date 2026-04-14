'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GameRecord, getGameHistory, getLeaderboard, getUserProfile, UserProfile } from '@/lib/firestore';
import { getSubRankLabel, getRankPosition } from '@/lib/rank';
import { RoleId } from '@/engine/roles';
import LanguageToggle from '@/components/ui/LanguageToggle';

const ROLE_EMOJI: Record<RoleId, string> = {
  werewolf: '🐺', seer: '🔮', robber: '🦹', troublemaker: '🔀',
  villager: '🧑‍🌾', insomniac: '😵', drunk: '🍺', hunter: '🏹',
  tanner: '🪶', minion: '👹', mason: '🤝', doppelganger: '🪞',
};

interface RoleStat {
  role: RoleId;
  played: number;
  wins: number;
  losses: number;
  winRate: number;
}

function computeRoleStats(history: GameRecord[]): RoleStat[] {
  const map = new Map<RoleId, { played: number; wins: number }>();

  for (const game of history) {
    const entry = map.get(game.playerRole) || { played: 0, wins: 0 };
    entry.played++;
    if (game.didWin) entry.wins++;
    map.set(game.playerRole, entry);
  }

  return Array.from(map.entries())
    .map(([role, { played, wins }]) => ({
      role,
      played,
      wins,
      losses: played - wins,
      winRate: played > 0 ? Math.round((wins / played) * 100) : 0,
    }))
    .sort((a, b) => b.played - a.played);
}

function StarDisplay({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: 22,
            color: i < filled ? color : 'var(--bg-base)',
            textShadow: i < filled ? `0 0 8px ${color}40` : 'none',
            transition: 'color 0.3s, text-shadow 0.3s',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function AchievementsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, loading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ displayName: string; stars: number; rank: string }[]>([]);
  const [roleStats, setRoleStats] = useState<RoleStat[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'leaderboard'>('stats');

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
      getLeaderboard(20).then(setLeaderboard);
      getGameHistory(user.uid, 200).then((history) => {
        setRoleStats(computeRoleStats(history));
      });
    }
  }, [user]);

  const totalStars = profile?.stars ?? 0;
  const position = getRankPosition(totalStars);
  const isKing = position.subLevel.id === 'king';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 512, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <button onClick={() => router.push(`/${locale}`)} className="btn btn-ghost" style={{ fontSize: 13 }}>
          ← {t('common.back')}
        </button>
        <h1 className="font-pixel text-glow-moon" style={{ fontSize: 15, color: 'var(--accent-moon)', margin: 0 }}>
          {t('achievements.title')}
        </h1>
        <LanguageToggle />
      </div>

      {!user && !loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="panel-raised" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>🔒</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {t('achievements.loginRequired')}
            </p>
            <button onClick={signInWithGoogle} className="btn btn-success" style={{ fontSize: 14 }}>
              {t('common.loginWithGoogle')}
            </button>
          </div>
        </div>
      ) : loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="anim-pulse-soft" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {t('common.loading')}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Rank Display */}
          <div className="panel-raised" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{position.subLevel.tier.emoji}</div>
            <div className="font-pixel" style={{ fontSize: 18, marginBottom: 4, color: position.subLevel.tier.color }}>
              {t(position.subLevel.tier.nameKey)}
              {!isKing && ` ${getSubRankLabel(position.subLevel.subRank)}`}
            </div>

            {isKing ? (
              <div style={{ marginTop: 12 }}>
                <div className="font-pixel" style={{ fontSize: 28, color: position.subLevel.tier.color }}>
                  ★ {position.currentStars}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {t('achievements.stars')}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <StarDisplay
                  filled={position.currentStars}
                  total={position.subLevel.starsToPromote}
                  color={position.subLevel.tier.color}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  {position.currentStars} / {position.subLevel.starsToPromote} {t('achievements.stars')}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('stats')}
              className={`btn ${activeTab === 'stats' ? 'btn-success' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: 14 }}
            >
              {t('achievements.stats')}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`btn ${activeTab === 'leaderboard' ? 'btn-success' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: 14 }}
            >
              {t('achievements.leaderboard')}
            </button>
          </div>

          {activeTab === 'stats' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Overall stats */}
              <div>
                <div className="font-pixel" style={{ fontSize: 12, color: 'var(--accent-moon)', marginBottom: 10, letterSpacing: '1px' }}>
                  {t('achievements.overallStats')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <StatCard label={t('achievements.gamesPlayed')} value={profile?.stats.gamesPlayed || 0} color="var(--accent-cyan)" />
                  <StatCard label={t('achievements.wins')} value={profile?.stats.wins || 0} color="var(--accent-lime)" />
                  <StatCard label={t('achievements.losses')} value={profile?.stats.losses || 0} color="var(--accent-red)" />
                  <StatCard label={t('achievements.winRate')} value={`${profile?.stats.winRate || 0}%`} color="var(--accent-moon)" />
                </div>
              </div>

              {/* Per-role stats */}
              <div>
                <div className="font-pixel" style={{ fontSize: 12, color: 'var(--accent-moon)', marginBottom: 10, letterSpacing: '1px' }}>
                  {t('achievements.roleStats')}
                </div>
                {roleStats.length === 0 ? (
                  <div className="panel" style={{ padding: 20, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {t('achievements.noRoleData')}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {roleStats.map((stat) => (
                      <RoleStatRow key={stat.role} stat={stat} t={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.length === 0 ? (
                <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t('achievements.comingSoon')}</span>
                </div>
              ) : (
                leaderboard.map((entry, i) => {
                  const entryPos = getRankPosition(entry.stars);
                  const entryIsKing = entryPos.subLevel.id === 'king';
                  return (
                    <div key={i} className="panel" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, color: 'var(--accent-moon)', width: 28, fontWeight: 600 }}>#{i + 1}</span>
                        <span style={{ fontSize: 14 }}>{entryPos.subLevel.tier.emoji}</span>
                        <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{entry.displayName}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: entryPos.subLevel.tier.color }}>
                        {entryIsKing
                          ? `★${entryPos.currentStars}`
                          : `${getSubRankLabel(entryPos.subLevel.subRank)} ★${entryPos.currentStars}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
      <div className="font-pixel" style={{ fontSize: 20, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

function RoleStatRow({ stat, t }: { stat: RoleStat; t: ReturnType<typeof useTranslations> }) {
  const winRateColor = stat.winRate >= 60 ? 'var(--accent-lime)' : stat.winRate >= 40 ? 'var(--accent-moon)' : 'var(--accent-red)';

  return (
    <div className="panel" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 0', minWidth: 0 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{ROLE_EMOJI[stat.role]}</span>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
          {t(`roles.${stat.role}`)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>
          {stat.played}{t('achievements.played')}
        </span>
        <span style={{ color: 'var(--accent-lime)' }}>
          {stat.wins}W
        </span>
        <span style={{ color: 'var(--accent-red)' }}>
          {stat.losses}L
        </span>
      </div>

      <div style={{ width: 56, flexShrink: 0, textAlign: 'right' }}>
        <span className="font-pixel" style={{ fontSize: 13, color: winRateColor }}>
          {stat.winRate}%
        </span>
      </div>
    </div>
  );
}
