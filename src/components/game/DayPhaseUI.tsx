'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';

export default function DayPhaseUI() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const runAIDiscussion = useGameStore((s) => s.runAIDiscussion);
  const submitHumanSpeech = useGameStore((s) => s.submitHumanSpeech);
  const proceedToVote = useGameStore((s) => s.proceedToVote);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const speakingOrder = useGameStore((s) => s.speakingOrder);
  const currentSpeakerIndex = useGameStore((s) => s.currentSpeakerIndex);
  const thinkingPlayerId = useGameStore((s) => s.thinkingPlayerId);
  const getBuiltInSpeechesStore = useGameStore((s) => s.getBuiltInSpeeches);
  const getFilledSpeech = useGameStore((s) => s.getFilledSpeech);

  const [message, setMessage] = useState('');
  const [showQuickSpeech, setShowQuickSpeech] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  const builtInSpeeches = getBuiltInSpeechesStore();

  const currentSpeakerId = speakingOrder[currentSpeakerIndex] ?? null;
  const currentSpeaker = currentSpeakerId !== null
    ? players.find((p) => p.id === currentSpeakerId)
    : null;
  const isHumanTurn = currentSpeaker?.isHuman === true;
  const roundComplete = currentSpeakerIndex >= speakingOrder.length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, thinkingPlayerId]);

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

  const handleQuickSpeech = (template: string) => {
    if (!isHumanTurn) return;
    const speeches = getBuiltInSpeechesStore();
    const speech = speeches.find((s) => s.template === template);
    if (speech) {
      const filled = getFilledSpeech(speech);
      submitHumanSpeech(filled, true);
    }
    setShowQuickSpeech(false);
  };

  const getPlayerColor = (playerId: number) => {
    if (playerId === -1) return 'text-pixel-orange';
    const player = players.find((p) => p.id === playerId);
    return player?.isHuman ? 'text-pixel-cyan' : 'text-pixel-orange';
  };

  const thinkingPlayer = thinkingPlayerId !== null
    ? players.find((p) => p.id === thinkingPlayerId)
    : null;

  return (
    <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="text-xl mb-1">☀️</div>
        <h2 className="text-sm pixel-text text-pixel-yellow">
          {t('game.day')}
        </h2>
        <p className="text-[9px] text-pixel-gray">{t('game.dayDesc')}</p>
      </div>

      {/* Speaking order */}
      <div className="flex flex-wrap gap-1.5 pb-2 mb-3 justify-center items-center">
        {speakingOrder.map((id, idx) => {
          const p = players.find((pl) => pl.id === id);
          if (!p) return null;
          const isCurrent = idx === currentSpeakerIndex;
          const isDone = idx < currentSpeakerIndex;
          return (
            <div key={id} className="flex items-center gap-1">
              {idx > 0 && <span className="text-[8px] text-pixel-gray">→</span>}
              <div className={`relative transition-all ${isCurrent ? 'scale-110' : ''} ${isDone ? 'opacity-40' : ''}`}>
                <PlayerAvatar
                  name={p.name}
                  isHuman={p.isHuman}
                  size="sm"
                  isSelected={isCurrent}
                />
                <span className="absolute -top-1 -left-1 bg-pixel-dark text-pixel-light text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-pixel-gray">
                  {idx + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current speaker indicator */}
      {currentSpeaker && !roundComplete && (
        <div className="text-center mb-2">
          <span className="text-[9px] text-pixel-yellow">
            {currentSpeaker.isHuman
              ? (t('game.yourTurn'))
              : `${currentSpeaker.name} ${t('game.isSpeaking')}`}
          </span>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 pixel-box rounded p-3 mb-3 overflow-y-auto max-h-[300px] pixel-scroll">
        {chatMessages.length === 0 && !thinkingPlayer && (
          <div className="text-pixel-gray text-[9px] text-center py-4">
            {t('game.dayDesc')}
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 animate-slideIn ${msg.playerId === -1 ? 'opacity-70' : ''}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className={`text-[9px] font-bold ${getPlayerColor(msg.playerId)}`}>
              {msg.playerName}:
            </span>{' '}
            <span className="text-[9px] text-pixel-white">{msg.text}</span>
          </div>
        ))}

        {/* Thinking bubble */}
        {thinkingPlayer && (
          <div className="mb-2 animate-slideIn">
            <span className="text-[9px] font-bold text-pixel-orange">
              {thinkingPlayer.name}:
            </span>{' '}
            <span className="text-[9px] text-pixel-gray inline-flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-pixel-gray rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="inline-block w-1.5 h-1.5 bg-pixel-gray rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="inline-block w-1.5 h-1.5 bg-pixel-gray rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Human input area - only visible on human's turn */}
      {isHumanTurn && (
        <>
          {/* Quick speech panel */}
          {showQuickSpeech && (
            <div className="pixel-box rounded p-2 mb-2 max-h-[150px] overflow-y-auto pixel-scroll">
              <div className="text-[8px] text-pixel-yellow mb-1">
                {t('game.quickSpeech')}
              </div>
              <div className="space-y-1">
                {builtInSpeeches.map((speech) => (
                  <button
                    key={speech.id}
                    onClick={() => handleQuickSpeech(speech.template)}
                    className="w-full text-left pixel-btn px-2 py-1 text-[8px]"
                  >
                    {getFilledSpeech(speech)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowQuickSpeech(!showQuickSpeech)}
              className="pixel-btn px-2 py-2 text-[9px]"
              title={t('game.quickSpeech')}
            >
              💬
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 pixel-box px-3 py-2 text-[10px] text-pixel-white bg-pixel-dark outline-none"
              placeholder={t('game.typeMessage')}
            />
            <button
              onClick={handleSend}
              className="pixel-btn pixel-btn-success px-3 py-2 text-[9px]"
            >
              {t('game.send')}
            </button>
          </div>
        </>
      )}

      {/* Actions at bottom */}
      <div className="flex gap-2">
        {roundComplete && (
          <button
            onClick={() => {
              const state = useGameStore.getState();
              const newOrder = [...state.speakingOrder];
              useGameStore.setState({
                speakingOrder: newOrder,
                currentSpeakerIndex: 0,
                discussionRound: state.discussionRound + 1,
              });
              hasStartedRef.current = false;
            }}
            className="pixel-btn px-4 py-2 text-[9px] flex-1"
          >
            🔄 {t('game.nextRound')}
          </button>
        )}
        <button
          onClick={proceedToVote}
          disabled={isProcessing}
          className={`pixel-btn pixel-btn-danger px-4 py-2 text-[9px] flex-1 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {t('game.proceedToVote')} →
        </button>
      </div>
    </div>
  );
}
