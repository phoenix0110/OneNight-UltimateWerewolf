'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import { NightActionChoice } from '@/engine/night-actions';
import PhaseHeader from './PhaseHeader';
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
        action = actionOption === 'center'
          ? { role, centerTargets: selectedCenter, option: 'center' }
          : { role, targets: selectedTargets, option: 'player' };
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

  const canConfirm = () => {
    switch (role) {
      case 'seer': return actionOption === 'player' ? selectedTargets.length === 1 : selectedCenter.length === 2;
      case 'robber': case 'doppelganger': return selectedTargets.length === 1;
      case 'troublemaker': return selectedTargets.length === 2;
      case 'drunk': return selectedCenter.length === 1;
      default: return true;
    }
  };

  const toggleTarget = (id: number) => {
    const max = role === 'troublemaker' ? 2 : 1;
    if (selectedTargets.includes(id)) {
      setSelectedTargets(selectedTargets.filter((t) => t !== id));
    } else if (max === 1) {
      setSelectedTargets([id]);
    } else if (selectedTargets.length < max) {
      setSelectedTargets([...selectedTargets, id]);
    }
  };

  const toggleCenter = (idx: number) => {
    const max = role === 'seer' ? 2 : 1;
    if (selectedCenter.includes(idx)) setSelectedCenter(selectedCenter.filter((c) => c !== idx));
    else if (selectedCenter.length < max) setSelectedCenter([...selectedCenter, idx]);
  };

  return (
    <div className="scene-night-sky" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 512, margin: '0 auto', width: '100%' }}>
      <PhaseHeader icon="🌙" title={t('game.night')} accentColor="cyan" subtitle={t('game.nightDesc')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Your Role */}
        <div className="panel-raised" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{t('game.yourRole')}</div>
          <div className="font-pixel text-glow-cyan" style={{ fontSize: 18, color: 'var(--accent-cyan)' }}>
            {t(`roles.${role}`)}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
            {t(`roles.${role}Desc`)}
          </div>
        </div>

        {!hasNightAction ? (
          <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>😴</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t('game.noAction')}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {t('game.waitNightActions')}
            </p>
          </div>
        ) : !actionConfirmed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', margin: 0 }}>
              {t('game.yourAction')}
            </h3>

            {/* Seer toggle */}
            {role === 'seer' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setActionOption('player'); setSelectedCenter([]); }}
                  className={`btn ${actionOption === 'player' ? 'btn-success' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: 13 }}
                >
                  {t('game.viewPlayer')}
                </button>
                <button
                  onClick={() => { setActionOption('center'); setSelectedTargets([]); }}
                  className={`btn ${actionOption === 'center' ? 'btn-success' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: 13 }}
                >
                  {t('game.viewCenter')}
                </button>
              </div>
            )}

            {/* Player selection */}
            {(role !== 'seer' || actionOption === 'player') && ['seer', 'robber', 'troublemaker', 'doppelganger'].includes(role) && (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {t('game.selectPlayer')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {otherPlayers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => toggleTarget(p.id)}
                      className="panel"
                      style={{
                        padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        cursor: 'pointer', transition: 'all 0.15s',
                        borderColor: selectedTargets.includes(p.id) ? 'var(--accent-cyan)' : undefined,
                        boxShadow: selectedTargets.includes(p.id) ? '0 0 0 1px rgba(89,208,255,0.4)' : undefined,
                        background: selectedTargets.includes(p.id) ? 'rgba(89,208,255,0.05)' : undefined,
                      }}
                    >
                      <PlayerAvatar name={p.name} size="sm" isSelected={selectedTargets.includes(p.id)} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Center card selection */}
            {((role === 'seer' && actionOption === 'center') || role === 'drunk') && (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {t('game.selectCenter')}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleCenter(idx)}
                      className="panel-raised"
                      style={{
                        width: 64, height: 80, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, cursor: 'pointer', transition: 'all 0.15s',
                        borderColor: selectedCenter.includes(idx) ? 'var(--accent-cyan)' : undefined,
                        boxShadow: selectedCenter.includes(idx) ? '0 0 16px rgba(89,208,255,0.2), 0 0 0 2px rgba(89,208,255,0.4)' : undefined,
                      }}
                    >
                      ?
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Passive roles */}
            {['werewolf', 'insomniac', 'minion', 'mason'].includes(role) && (
              <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>👁️</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t(`roles.${role}Desc`)}</div>
              </div>
            )}

            {/* Selection summary */}
            {(selectedTargets.length > 0 || selectedCenter.length > 0) && (
              <div className="panel anim-fade-in-up" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('game.selectedLabel')} </span>
                <span style={{ fontSize: 14, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {selectedTargets.map((id) => players.find((p) => p.id === id)?.name).filter(Boolean).join(', ')}
                  {selectedCenter.map((idx) => t('game.centerCardN', { num: idx + 1 })).join(', ')}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Night Result */
          <div className="panel-raised anim-fade-in-up" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>✨</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-moon)', marginBottom: 12 }}>
              {t('game.nightResult')}
            </div>
            {nightRevealed && nightRevealed.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nightRevealed.map((r, i) => (
                  <div key={i} style={{ fontSize: 14, color: 'var(--accent-cyan)' }}>
                    {r.isCenterCard
                      ? `${t('game.centerCardN', { num: r.targetIndex + 1 })}: ${t(`roles.${r.role}`)}`
                      : `${players[r.targetIndex]?.name ?? '???'}: ${t(`roles.${r.role}`)}`}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {role === 'troublemaker' ? t('game.cardsSwapped') : t('game.noInfoRevealed')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="sticky-footer" style={{ padding: 16 }}>
        {!actionConfirmed && hasNightAction ? (
          <button
            onClick={handleConfirmAction}
            disabled={!canConfirm()}
            className="btn btn-success"
            style={{ width: '100%', fontSize: 14, minHeight: 48 }}
          >
            {t('game.confirmAction')}
          </button>
        ) : (
          <button
            onClick={executeNightPhase}
            className="btn btn-success"
            style={{ width: '100%', fontSize: 14, minHeight: 48 }}
          >
            {t('game.day')} →
          </button>
        )}
      </div>
    </div>
  );
}
