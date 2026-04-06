'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { saveGameResult } from '@/lib/firestore';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';

export default function ResultScreen() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const savedRef = useRef(false);

  const players = useGameStore((s) => s.players);
  const killedPlayerIds = useGameStore((s) => s.killedPlayerIds);
  const winResult = useGameStore((s) => s.winResult);
  const votes = useGameStore((s) => s.votes);
  const resetGame = useGameStore((s) => s.resetGame);
  const humanPlayerIndex = useGameStore((s) => s.humanPlayerIndex);
  const centerCards = useGameStore((s) => s.centerCards);
  const config = useGameStore((s) => s.config);

  // Save game result to Firestore
  useEffect(() => {
    if (!user || !winResult || savedRef.current) return;
    savedRef.current = true;

    const humanPlayer = players[humanPlayerIndex];
    const humanResult = winResult.playerResults.find(
      (r) => r.playerId === humanPlayerIndex
    );
    const mainWinner = winResult.winners.includes('village')
      ? 'village_win'
      : winResult.winners.includes('tanner')
        ? 'tanner_win'
        : 'werewolf_win';

    saveGameResult(user.uid, {
      playerCount: players.length,
      rolesInGame: config.roles,
      playerRole: humanPlayer.originalRole,
      finalRole: humanPlayer.currentRole,
      result: mainWinner,
      didWin: humanResult?.won ?? false,
    }).catch(console.error);
  }, [user, winResult, players, humanPlayerIndex, config]);

  if (!winResult) return null;

  const humanWon = winResult.playerResults.find(
    (r) => r.playerId === humanPlayerIndex
  )?.won;

  const voteCounts: Record<number, number> = {};
  for (const targetId of Object.values(votes)) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  const getWinMessage = () => {
    if (winResult.winners.includes('tanner') && winResult.winners.includes('village')) {
      return `${t('game.villageWins')} ${t('game.tannerWins')}`;
    }
    if (winResult.winners.includes('tanner') && winResult.winners.includes('werewolf')) {
      return `${t('game.werewolfWins')} ${t('game.tannerWins')}`;
    }
    if (winResult.winners.includes('village')) return t('game.villageWins');
    if (winResult.winners.includes('werewolf')) return t('game.werewolfWins');
    if (winResult.winners.includes('tanner')) return t('game.tannerWins');
    return '';
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
      {/* Win/Lose banner */}
      <div className="text-center mb-6 animate-fadeInUp">
        <div className="text-3xl mb-3">
          {humanWon ? '🎉' : '💀'}
        </div>
        <h2
          className={`text-lg pixel-text mb-2 ${
            humanWon ? 'text-pixel-lime' : 'text-pixel-red'
          }`}
        >
          {humanWon ? t('game.youWin') : t('game.youLose')}
        </h2>
        <p className="text-[10px] text-pixel-yellow">
          {getWinMessage()}
        </p>
        <p className="text-[9px] text-pixel-light mt-1">
          {winResult.reason}
        </p>
      </div>

      {/* Killed players */}
      {killedPlayerIds.length > 0 ? (
        <div className="pixel-box p-3 rounded mb-4 w-full">
          <div className="text-[10px] text-pixel-red mb-2">
            {t('game.killed')}:
          </div>
          <div className="flex gap-3 justify-center">
            {killedPlayerIds.map((id) => {
              const player = players[id];
              return (
                <PlayerAvatar
                  key={id}
                  name={player.name}
                  isDead
                  showRole
                  role={player.currentRole}
                  size="sm"
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="pixel-box p-3 rounded mb-4">
          <div className="text-[10px] text-pixel-lime text-center">
            {t('game.noOneKilled')}
          </div>
        </div>
      )}

      {/* All players reveal */}
      <div className="w-full mb-4">
        <div className="text-[10px] text-pixel-yellow mb-2 text-center">
          {t('game.results')}
        </div>
        <div className="space-y-2">
          {players.map((player) => {
            const result = winResult.playerResults.find(
              (r) => r.playerId === player.id
            );
            const isDead = killedPlayerIds.includes(player.id);

            return (
              <div
                key={player.id}
                className={`pixel-box p-2 rounded flex items-center justify-between animate-slideIn ${
                  isDead ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${player.id * 100}ms` }}
              >
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    name={player.name}
                    isHuman={player.isHuman}
                    isDead={isDead}
                    size="sm"
                  />
                  <div>
                    <div className="text-[9px] text-pixel-white">
                      {player.name}
                      {player.isHuman && (
                        <span className="text-pixel-cyan ml-1">(You)</span>
                      )}
                    </div>
                    <div className="text-[8px] text-pixel-gray">
                      {t('game.originalRole')}:{' '}
                      <span className="text-pixel-orange">
                        {t(`roles.${player.originalRole}`)}
                      </span>
                      {player.originalRole !== player.currentRole && (
                        <>
                          {' → '}
                          {t('game.finalRole')}:{' '}
                          <span className="text-pixel-cyan">
                            {t(`roles.${player.currentRole}`)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[8px] text-pixel-gray">
                    {voteCounts[player.id] || 0} {t('game.votes')}
                  </div>
                  {result?.won ? (
                    <span className="text-pixel-lime text-[9px]">✓</span>
                  ) : (
                    <span className="text-pixel-red text-[9px]">✗</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center cards */}
      <div className="pixel-box p-3 rounded mb-6 w-full">
        <div className="text-[10px] text-pixel-yellow mb-2 text-center">
          {t('game.centerCards')}
        </div>
        <div className="flex gap-3 justify-center">
          {centerCards.map((role, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-14 pixel-box rounded flex items-center justify-center text-lg mb-1">
                {role === 'werewolf' ? '🐺' : role === 'seer' ? '🔮' : '🃏'}
              </div>
              <div className="text-[7px] text-pixel-light">
                {t(`roles.${role}`)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={resetGame}
          className="pixel-btn pixel-btn-success px-6 py-3 text-[10px] flex-1"
        >
          {t('game.playAgain')}
        </button>
        <button
          onClick={() => {
            resetGame();
            router.push(`/${locale}`);
          }}
          className="pixel-btn px-6 py-3 text-[10px] flex-1"
        >
          {t('game.backToMenu')}
        </button>
      </div>
    </div>
  );
}
