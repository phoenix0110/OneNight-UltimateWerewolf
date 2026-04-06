'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import { NightActionChoice } from '@/engine/night-actions';
import PlayerAvatar from './PlayerAvatar';

export default function NightPhaseUI() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const humanPlayerIndex = useGameStore((s) => s.humanPlayerIndex);
  const setHumanNightAction = useGameStore((s) => s.setHumanNightAction);
  const executeNightPhase = useGameStore((s) => s.executeNightPhase);
  const nightRevealed = useGameStore((s) => s.nightRevealed);

  const humanPlayer = players[humanPlayerIndex];
  const role = humanPlayer?.originalRole;

  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number[]>([]);
  const [actionOption, setActionOption] = useState<'player' | 'center'>('player');
  const [actionConfirmed, setActionConfirmed] = useState(false);

  if (!humanPlayer) return null;

  const otherPlayers = players.filter((p) => p.id !== humanPlayerIndex);
  const hasNightAction = ['werewolf', 'seer', 'robber', 'troublemaker', 'insomniac', 'drunk', 'minion', 'mason', 'doppelganger'].includes(role);

  const handleConfirmAction = () => {
    let action: NightActionChoice;

    switch (role) {
      case 'seer':
        if (actionOption === 'center') {
          action = { role, centerTargets: selectedCenter, option: 'center' };
        } else {
          action = { role, targets: selectedTargets, option: 'player' };
        }
        break;
      case 'robber':
        action = { role, targets: selectedTargets };
        break;
      case 'troublemaker':
        action = { role, targets: selectedTargets };
        break;
      case 'drunk':
        action = { role, centerTargets: selectedCenter };
        break;
      case 'doppelganger':
        action = { role, targets: selectedTargets };
        break;
      default:
        action = { role };
        break;
    }

    setHumanNightAction(action);
    setActionConfirmed(true);
  };

  const handleProceed = () => {
    executeNightPhase();
  };

  const canConfirm = () => {
    switch (role) {
      case 'seer':
        return actionOption === 'player' ? selectedTargets.length === 1 : selectedCenter.length === 2;
      case 'robber':
      case 'doppelganger':
        return selectedTargets.length === 1;
      case 'troublemaker':
        return selectedTargets.length === 2;
      case 'drunk':
        return selectedCenter.length === 1;
      default:
        return true;
    }
  };

  const toggleTarget = (id: number) => {
    const maxTargets = role === 'troublemaker' ? 2 : 1;
    if (selectedTargets.includes(id)) {
      setSelectedTargets(selectedTargets.filter((t) => t !== id));
    } else if (selectedTargets.length < maxTargets) {
      setSelectedTargets([...selectedTargets, id]);
    }
  };

  const toggleCenter = (idx: number) => {
    const maxCenter = role === 'seer' ? 2 : 1;
    if (selectedCenter.includes(idx)) {
      setSelectedCenter(selectedCenter.filter((c) => c !== idx));
    } else if (selectedCenter.length < maxCenter) {
      setSelectedCenter([...selectedCenter, idx]);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4">
      {/* Night sky effect */}
      <div className="text-center mb-6">
        <div className="text-2xl mb-2">🌙</div>
        <h2 className="text-sm pixel-text text-pixel-blue mb-1">
          {t('game.night')}
        </h2>
        <p className="text-[9px] text-pixel-gray">{t('game.nightDesc')}</p>
      </div>

      {/* Your role reminder */}
      <div className="pixel-box p-3 rounded text-center mb-4 w-full max-w-sm">
        <div className="text-[9px] text-pixel-light">{t('game.yourRole')}</div>
        <div className="text-xs pixel-text text-pixel-cyan">
          {t(`roles.${role}`)}
        </div>
      </div>

      {!hasNightAction ? (
        <div className="pixel-box p-4 rounded text-center mb-6">
          <p className="text-[10px] text-pixel-light">{t('game.noAction')}</p>
        </div>
      ) : !actionConfirmed ? (
        <div className="w-full max-w-sm">
          <h3 className="text-[10px] text-pixel-yellow mb-3">
            {t('game.yourAction')}
          </h3>

          {/* Seer option toggle */}
          {role === 'seer' && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setActionOption('player'); setSelectedCenter([]); }}
                className={`pixel-btn px-3 py-1 text-[9px] flex-1 ${
                  actionOption === 'player' ? 'pixel-btn-success' : ''
                }`}
              >
                {t('game.viewPlayer')}
              </button>
              <button
                onClick={() => { setActionOption('center'); setSelectedTargets([]); }}
                className={`pixel-btn px-3 py-1 text-[9px] flex-1 ${
                  actionOption === 'center' ? 'pixel-btn-success' : ''
                }`}
              >
                {t('game.viewCenter')}
              </button>
            </div>
          )}

          {/* Player selection */}
          {(role !== 'seer' || actionOption === 'player') &&
            ['seer', 'robber', 'troublemaker', 'doppelganger'].includes(role) && (
              <div className="mb-3">
                <div className="text-[9px] text-pixel-light mb-2">
                  {t('game.selectPlayer')}
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {otherPlayers.map((p) => (
                    <PlayerAvatar
                      key={p.id}
                      name={p.name}
                      size="sm"
                      isSelected={selectedTargets.includes(p.id)}
                      onClick={() => toggleTarget(p.id)}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Center card selection */}
          {((role === 'seer' && actionOption === 'center') || role === 'drunk') && (
            <div className="mb-3">
              <div className="text-[9px] text-pixel-light mb-2">
                {t('game.selectCenter')}
              </div>
              <div className="flex gap-3 justify-center">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleCenter(idx)}
                    className={`w-14 h-18 pixel-box rounded flex items-center justify-center text-sm transition-all ${
                      selectedCenter.includes(idx)
                        ? 'ring-2 ring-pixel-yellow animate-glow'
                        : ''
                    }`}
                  >
                    ?
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Passive roles */}
          {['werewolf', 'insomniac', 'minion', 'mason'].includes(role) && (
            <div className="text-[9px] text-pixel-light text-center mb-3">
              {role === 'werewolf' && 'Look for other werewolves...'}
              {role === 'insomniac' && 'Check your card at the end of the night...'}
              {role === 'minion' && 'See who the werewolves are...'}
              {role === 'mason' && 'See the other mason...'}
            </div>
          )}

          <button
            onClick={handleConfirmAction}
            disabled={!canConfirm()}
            className={`pixel-btn px-6 py-2 text-[10px] w-full ${
              canConfirm() ? 'pixel-btn-success' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {t('game.confirmAction')}
          </button>
        </div>
      ) : (
        /* Show night result */
        <div className="pixel-box p-4 rounded text-center mb-6 w-full max-w-sm animate-fadeInUp">
          <div className="text-[10px] text-pixel-yellow mb-2">
            {t('game.nightResult')}
          </div>
          {nightRevealed && nightRevealed.length > 0 ? (
            <div className="space-y-2">
              {nightRevealed.map((r, i) => (
                <div key={i} className="text-[10px] text-pixel-cyan">
                  {typeof r.targetIndex === 'number' && players[r.targetIndex]
                    ? `${players[r.targetIndex].name}: ${t(`roles.${r.role}`)}`
                    : `Center card: ${t(`roles.${r.role}`)}`}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-pixel-light">
              {role === 'troublemaker' ? 'Cards swapped!' : 'No information revealed.'}
            </div>
          )}
        </div>
      )}

      {/* Proceed button */}
      {(actionConfirmed || !hasNightAction) && (
        <button
          onClick={handleProceed}
          className="pixel-btn pixel-btn-success px-8 py-3 text-[11px]"
        >
          {t('game.day')} →
        </button>
      )}
    </div>
  );
}
