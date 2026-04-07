'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserProfile, UserProfile, getLeaderboard } from '@/lib/firestore';
import { getRankInfo, getRankProgress, RANKS } from '@/lib/rank';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function AchievementsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, signInWithGoogle, loading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ displayName: string; rankPoints: number; rank: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'leaderboard'>('stats');

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
      getLeaderboard(20).then(setLeaderboard);
    }
  }, [user]);

  const rankInfo = profile ? getRankInfo(profile.rank) : RANKS[0];
  const progress = profile ? getRankProgress(profile.rankPoints) : 0;

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
            <div style={{ fontSize: 40, marginBottom: 12 }}>{rankInfo.emoji}</div>
            <div className="font-pixel" style={{ fontSize: 16, marginBottom: 4, color: rankInfo.color }}>
              {t(rankInfo.nameKey)}
              {rankInfo.tier ? ` ${rankInfo.tier}` : ''}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              {profile?.rankPoints || 0} pts
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: 12, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', borderRadius: 99, transition: 'width 0.5s',
                  width: `${progress}%`, backgroundColor: rankInfo.color,
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {progress}%
            </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StatCard label={t('achievements.gamesPlayed')} value={profile?.stats.gamesPlayed || 0} color="var(--accent-cyan)" />
              <StatCard label={t('achievements.wins')} value={profile?.stats.wins || 0} color="var(--accent-lime)" />
              <StatCard label={t('achievements.losses')} value={profile?.stats.losses || 0} color="var(--accent-red)" />
              <StatCard label={t('achievements.winRate')} value={`${profile?.stats.winRate || 0}%`} color="var(--accent-moon)" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.length === 0 ? (
                <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t('achievements.comingSoon')}</span>
                </div>
              ) : (
                leaderboard.map((entry, i) => {
                  const entryRank = getRankInfo(entry.rank);
                  return (
                    <div key={i} className="panel" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, color: 'var(--accent-moon)', width: 28, fontWeight: 600 }}>#{i + 1}</span>
                        <span style={{ fontSize: 14 }}>{entryRank.emoji}</span>
                        <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{entry.displayName}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: entryRank.color }}>
                        {entry.rankPoints} pts
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
