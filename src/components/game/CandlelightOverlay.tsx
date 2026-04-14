'use client';

/**
 * Atmospheric candlelight overlay.
 * Renders an absolutely-positioned warm glow layer that subtly flickers,
 * simulating the ambience of candlelight in the tavern scene.
 * pointer-events: none so it doesn't block interactions.
 */
export default function CandlelightOverlay() {
  return (
    <div
      className="anim-candle-flicker"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(246, 211, 101, 0.10) 0%, transparent 70%)',
      }}
    />
  );
}
