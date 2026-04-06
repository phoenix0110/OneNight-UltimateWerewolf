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
  const [leaderboard, setLeaderboard] = useState<
    { displayName: string; rankPoints: number; rank: string }[]
  >([]);
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
          {t('achievements.title')}
        </h1>
        <LanguageToggle />
      </div>

      {!user && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="pixel-box p-6 rounded text-center">
            <div className="text-2xl mb-4">🔒</div>
            <p className="text-[10px] text-pixel-light mb-4">
              {t('achievements.loginRequired')}
            </p>
            <button
              onClick={signInWithGoogle}
              className="pixel-btn pixel-btn-success px-6 py-2 text-[10px]"
            >
              {t('common.loginWithGoogle')}
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-pixel-gray text-[10px] animate-blink">
            {t('common.loading')}
          </div>
        </div>
      ) : (
        <>
          {/* Rank Display */}
          <div className="pixel-box p-4 rounded mb-4 text-center">
            <div className="text-3xl mb-2">{rankInfo.emoji}</div>
            <div
              className="text-sm pixel-text mb-1"
              style={{ color: rankInfo.color }}
            >
              {t(rankInfo.nameKey)}
              {rankInfo.tier ? ` ${rankInfo.tier}` : ''}
            </div>
            <div className="text-[9px] text-pixel-gray mb-3">
              {profile?.rankPoints || 0} pts
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-pixel-dark rounded overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: rankInfo.color,
                }}
              />
            </div>
            <div className="text-[8px] text-pixel-gray mt-1">
              {progress}%
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('stats')}
              className={`pixel-btn px-4 py-1 text-[9px] flex-1 ${
                activeTab === 'stats' ? 'pixel-btn-success' : ''
              }`}
            >
              {t('achievements.stats')}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pixel-btn px-4 py-1 text-[9px] flex-1 ${
                activeTab === 'leaderboard' ? 'pixel-btn-success' : ''
              }`}
            >
              {t('achievements.leaderboard')}
            </button>
          </div>

          {activeTab === 'stats' ? (
            /* Stats Grid */
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label={t('achievements.gamesPlayed')}
                value={profile?.stats.gamesPlayed || 0}
                color="text-pixel-cyan"
              />
              <StatCard
                label={t('achievements.wins')}
                value={profile?.stats.wins || 0}
                color="text-pixel-lime"
              />
              <StatCard
                label={t('achievements.losses')}
                value={profile?.stats.losses || 0}
                color="text-pixel-red"
              />
              <StatCard
                label={t('achievements.winRate')}
                value={`${profile?.stats.winRate || 0}%`}
                color="text-pixel-yellow"
              />
            </div>
          ) : (
            /* Leaderboard */
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="pixel-box p-4 rounded text-center">
                  <div className="text-[10px] text-pixel-gray">
                    {t('achievements.comingSoon')}
                  </div>
                </div>
              ) : (
                leaderboard.map((entry, i) => {
                  const entryRank = getRankInfo(entry.rank);
                  return (
                    <div
                      key={i}
                      className="pixel-box p-2 rounded flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-pixel-yellow w-6">
                          #{i + 1}
                        </span>
                        <span className="text-[9px]">{entryRank.emoji}</span>
                        <span className="text-[10px] text-pixel-white">
                          {entry.displayName}
                        </span>
                      </div>
                      <span
                        className="text-[9px]"
                        style={{ color: entryRank.color }}
                      >
                        {entry.rankPoints} pts
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="pixel-box p-3 rounded text-center">
      <div className={`text-lg pixel-text ${color}`}>{value}</div>
      <div className="text-[8px] text-pixel-gray mt-1">{label}</div>
    </div>
  );
}
