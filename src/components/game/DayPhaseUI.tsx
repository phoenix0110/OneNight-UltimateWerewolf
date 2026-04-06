'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/game-store';
import PlayerAvatar from './PlayerAvatar';

export default function DayPhaseUI() {
  const t = useTranslations();
  const players = useGameStore((s) => s.players);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const addChatMessage = useGameStore((s) => s.addChatMessage);
  const runAIDiscussion = useGameStore((s) => s.runAIDiscussion);
  const proceedToVote = useGameStore((s) => s.proceedToVote);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const getBuiltInSpeechesStore = useGameStore((s) => s.getBuiltInSpeeches);
  const getFilledSpeech = useGameStore((s) => s.getFilledSpeech);

  const [message, setMessage] = useState('');
  const [showQuickSpeech, setShowQuickSpeech] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const builtInSpeeches = getBuiltInSpeechesStore();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    addChatMessage(message.trim(), false);
    setMessage('');
  };

  const handleQuickSpeech = (template: string) => {
    const speeches = getBuiltInSpeechesStore();
    const speech = speeches.find((s) => s.template === template);
    if (speech) {
      const filled = getFilledSpeech(speech);
      addChatMessage(filled, true);
    }
    setShowQuickSpeech(false);
  };

  const handleAIDiscussion = async () => {
    await runAIDiscussion();
  };

  const getPlayerColor = (playerId: number) => {
    const player = players.find((p) => p.id === playerId);
    return player?.isHuman ? 'text-pixel-cyan' : 'text-pixel-orange';
  };

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

      {/* Players bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 justify-center">
        {players.map((p) => (
          <PlayerAvatar key={p.id} name={p.name} isHuman={p.isHuman} size="sm" />
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 pixel-box rounded p-3 mb-3 overflow-y-auto max-h-[300px] pixel-scroll">
        {chatMessages.length === 0 && (
          <div className="text-pixel-gray text-[9px] text-center py-4">
            {t('game.dayDesc')}
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className="mb-2 animate-slideIn"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className={`text-[9px] font-bold ${getPlayerColor(msg.playerId)}`}>
              {msg.playerName}:
            </span>{' '}
            <span className="text-[9px] text-pixel-white">{msg.text}</span>
          </div>
        ))}
        {isProcessing && (
          <div className="text-pixel-gray text-[9px] animate-blink">
            {t('game.aiThinking')}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

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

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAIDiscussion}
          disabled={isProcessing}
          className={`pixel-btn px-4 py-2 text-[9px] flex-1 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          🤖 {isProcessing ? t('game.aiThinking') : 'AI Discussion'}
        </button>
        <button
          onClick={proceedToVote}
          className="pixel-btn pixel-btn-danger px-4 py-2 text-[9px] flex-1"
        >
          {t('game.proceedToVote')} →
        </button>
      </div>
    </div>
  );
}
