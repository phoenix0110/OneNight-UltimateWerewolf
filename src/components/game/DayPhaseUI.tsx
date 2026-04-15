'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MAX_DISCUSSION_ROUNDS } from '@/engine/game-rules';
import { useGameStore } from '@/store/game-store';
import DaySceneFrame from './DaySceneFrame';
import DiscussionLogPanel from './DiscussionLogPanel';
import PhaseHeader from './PhaseHeader';

export default function DayPhaseUI() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const runAIDiscussion = useGameStore((s) => s.runAIDiscussion);
  const submitHumanSpeech = useGameStore((s) => s.submitHumanSpeech);
  const proceedToVote = useGameStore((s) => s.proceedToVote);
  const resetGame = useGameStore((s) => s.resetGame);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const speakingOrder = useGameStore((s) => s.speakingOrder);
  const currentSpeakerIndex = useGameStore((s) => s.currentSpeakerIndex);
  const thinkingPlayerId = useGameStore((s) => s.thinkingPlayerId);
  const discussionRound = useGameStore((s) => s.discussionRound);
  const getBuiltInSpeechesStore = useGameStore((s) => s.getBuiltInSpeeches);
  const getFilledSpeech = useGameStore((s) => s.getFilledSpeech);
  const nightRevealed = useGameStore((s) => s.nightRevealed);

  const [message, setMessage] = useState('');
  const [showQuickSpeech, setShowQuickSpeech] = useState(false);
  const hasStartedRef = useRef(false);

  const builtInSpeeches = getBuiltInSpeechesStore();

  const filledSpeeches = useMemo(
    () => builtInSpeeches.map((speech) => ({ speech, text: getFilledSpeech(speech) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [builtInSpeeches.length, players, nightRevealed],
  );

  const currentSpeakerId = speakingOrder[currentSpeakerIndex] ?? null;
  const currentSpeaker = currentSpeakerId !== null ? players.find((p) => p.id === currentSpeakerId) : null;
  const isHumanTurn = currentSpeaker?.isHuman === true;
  const roundComplete = currentSpeakerIndex >= speakingOrder.length;
  const thinkingPlayer = thinkingPlayerId !== null ? players.find((p) => p.id === thinkingPlayerId) ?? null : null;
  const isLastRound = discussionRound >= MAX_DISCUSSION_ROUNDS;
  const canStartNextRound = roundComplete && !isLastRound;

  // Auto-start discussion
  const startDiscussion = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    runAIDiscussion();
  }, [runAIDiscussion]);

  useEffect(() => {
    if (speakingOrder.length > 0 && !hasStartedRef.current) {
      startDiscussion();
    }
  }, [speakingOrder, startDiscussion]);

  // Auto-advance AI speakers
  useEffect(() => {
    if (isHumanTurn || roundComplete || isProcessing) return;
    if (currentSpeakerIndex > 0 && !isProcessing && currentSpeaker && !currentSpeaker.isHuman) {
      runAIDiscussion();
    }
  }, [currentSpeakerIndex, isHumanTurn, roundComplete, isProcessing, currentSpeaker, runAIDiscussion]);

  const handleSend = () => {
    if (!message.trim() || !isHumanTurn) return;
    submitHumanSpeech(message.trim(), false);
    setMessage('');
    setShowQuickSpeech(false);
  };

  const handleQuickSpeech = (filledText: string) => {
    if (!isHumanTurn) return;
    setMessage(filledText);
    setShowQuickSpeech(false);
  };

  const handleNextRound = () => {
    const state = useGameStore.getState();
    const newOrder = [...state.speakingOrder];
    useGameStore.setState({
      speakingOrder: newOrder,
      currentSpeakerIndex: 0,
      discussionRound: state.discussionRound + 1,
    });
    hasStartedRef.current = false;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto', width: '100%' }}>
      {/* Phase HUD */}
      <PhaseHeader
        icon="☀️"
        title={t('game.day')}
        accentColor="moon"
        subtitle={
          currentSpeaker && !roundComplete
            ? currentSpeaker.isHuman
              ? t('game.yourTurn')
              : `${currentSpeaker.name} ${t('game.isSpeaking')}`
            : roundComplete && isLastRound
              ? t('game.proceedToVote')
              : roundComplete
                ? t('game.nextRound')
                : undefined
        }
        badge={
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99 }}>
            {t('game.roundInfo', { current: discussionRound, max: MAX_DISCUSSION_ROUNDS })}
          </span>
        }
      />

      {/* Village Square Scene */}
      <DaySceneFrame
        players={players}
        currentSpeakerId={currentSpeakerId}
        thinkingPlayerId={thinkingPlayerId}
        currentSpeakerIndex={currentSpeakerIndex}
        speakingOrder={speakingOrder}
      />

      {/* Speaking order strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', overflowX: 'auto' }}>
        {speakingOrder.map((id, idx) => {
          const p = players.find((pl) => pl.id === id);
          if (!p) return null;
          const isCurrent = idx === currentSpeakerIndex;
          const isDone = idx < currentSpeakerIndex;
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {idx > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>}
              <span style={{
                fontSize: 12, padding: '2px 8px', borderRadius: 99, transition: 'all 0.15s',
                background: isCurrent ? 'rgba(246,211,101,0.2)' : 'transparent',
                color: isCurrent ? 'var(--accent-moon)' : isDone ? 'var(--text-muted)' : 'var(--text-secondary)',
                fontWeight: isCurrent ? 600 : 400,
                textDecoration: isDone ? 'line-through' : 'none',
                opacity: isDone ? 0.5 : 1,
              }}>
                {p.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Your Turn Banner */}
      {isHumanTurn && (
        <div style={{
          margin: '0 16px 8px', padding: '8px 16px', borderRadius: 8, textAlign: 'center',
          background: 'rgba(89,208,255,0.1)', border: '1px solid rgba(89,208,255,0.3)',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-cyan)' }}>
            🎤 {t('game.yourTurn')}
          </span>
        </div>
      )}

      {/* Discussion Log */}
      <div style={{ flex: 1, padding: '0 16px 8px', minHeight: 0, display: 'flex', flexDirection: 'column', maxHeight: 340 }}>
        <DiscussionLogPanel
          messages={chatMessages}
          players={players}
          thinkingPlayer={thinkingPlayer}
          emptyText={t('game.dayDesc')}
        />
      </div>

      {/* Human Input Area */}
      {isHumanTurn && (
        <div style={{ padding: '0 16px 8px' }}>
          {/* Quick speech drawer */}
          {showQuickSpeech && (
            <div className="panel custom-scroll" style={{ padding: 12, marginBottom: 8, maxHeight: 160, overflowY: 'auto' }}>
              <div style={{ fontSize: 12, color: 'var(--accent-moon)', fontWeight: 600, marginBottom: 8 }}>
                {t('game.quickSpeech')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filledSpeeches.map(({ speech, text }) => (
                  <button
                    key={speech.id}
                    onClick={() => handleQuickSpeech(text)}
                    className="btn btn-secondary"
                    style={{ textAlign: 'left', fontSize: 13, padding: '8px 12px', minHeight: 0 }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowQuickSpeech(!showQuickSpeech)}
              className="btn btn-secondary"
              style={{ padding: '0 12px', minHeight: 44 }}
              title={t('game.quickSpeech')}
            >
              💬
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="input"
              style={{ flex: 1 }}
              placeholder={t('game.typeMessage')}
            />
            <button onClick={handleSend} className="btn btn-success" style={{ padding: '0 16px', minHeight: 44, fontSize: 13 }}>
              {t('game.send')}
            </button>
          </div>
        </div>
      )}

      {/* Final round notice */}
      {roundComplete && isLastRound && (
        <div style={{
          margin: '0 16px 8px', padding: '8px 16px', borderRadius: 8, textAlign: 'center',
          background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-red)' }}>
            {t('game.finalRound')}
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="sticky-footer" style={{ display: 'flex', gap: 12, padding: 16 }}>
        <button
          onClick={() => { if (window.confirm(t('game.quitConfirm'))) resetGame(); }}
          className="btn btn-ghost"
          style={{ fontSize: 13, padding: '0 12px', minWidth: 0, flexShrink: 0 }}
        >
          ✕
        </button>
        {canStartNextRound && (
          <button onClick={handleNextRound} className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }}>
            🔄 {t('game.nextRound')}
          </button>
        )}
        <button
          onClick={proceedToVote}
          disabled={isProcessing}
          className="btn btn-danger"
          style={{ flex: 1, fontSize: 13 }}
        >
          {t('game.proceedToVote')} →
        </button>
      </div>
    </div>
  );
}
