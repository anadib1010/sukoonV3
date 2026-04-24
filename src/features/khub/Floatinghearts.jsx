// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/features/khub/FloatingHearts.jsx
// Tap the heart button → hearts float upward and fade
// Each room gets its own heart color/emoji
//
// Usage:
//   import { FloatingHearts, useHearts } from './FloatingHearts';
//
//   const { hearts, spawnHeart } = useHearts();
//
//   <FloatingHearts hearts={hearts} />
//   <button onClick={spawnHeart}>💜</button>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useCallback, useRef } from 'react';

// ── Heart configs per room ──────────────────────────
export const HEART_CONFIGS = {
  purple:   { emoji: '💜', color: '#9B59B6', glow: '#9B59B680' },
  lavender: { emoji: '💜', color: '#A18CD1', glow: '#A18CD180' },
  blink:    { emoji: '🩷', color: '#E91E8C', glow: '#E91E8C80' },
  kpop:     { emoji: '❤️', color: '#FF4444', glow: '#FF444480' },
  kdrama:   { emoji: '🧡', color: '#FAD0C4', glow: '#FAD0C480' },
  default:  { emoji: '❤️', color: '#FF4444', glow: '#FF444480' },
};

// ── useHearts hook ──────────────────────────────────
export function useHearts() {
  const [hearts, setHearts] = useState([]);
  const counter = useRef(0);

  const spawnHeart = useCallback(() => {
    const id  = counter.current++;
    // Random horizontal drift so hearts spread out
    const x   = 40 + Math.random() * 20 - 10; // percent from right
    const dur  = 1800 + Math.random() * 600;   // animation duration ms
    const size = 18 + Math.random() * 14;       // heart size px

    setHearts(prev => [...prev, { id, x, dur, size }]);

    // Remove after animation completes
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, dur + 100);
  }, []);

  return { hearts, spawnHeart };
}

// ── FloatingHearts renderer ─────────────────────────
export function FloatingHearts({ hearts, roomType = 'default' }) {
  const config = HEART_CONFIGS[roomType] || HEART_CONFIGS.default;

  if (!hearts.length) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '60px',
      height: '300px',
      pointerEvents: 'none',
      zIndex: 50,
      overflow: 'visible',
    }}>
      {hearts.map(h => (
        <Heart key={h.id} heart={h} config={config} />
      ))}
    </div>
  );
}

// ── Single heart particle ───────────────────────────
function Heart({ heart, config }) {
  const keyframes = `
    @keyframes floatUp_${heart.id} {
      0%   { transform: translateY(0)   scale(1);    opacity: 1; }
      50%  { transform: translateY(-120px) scale(1.15); opacity: 0.9; }
      100% { transform: translateY(-280px) scale(0.6);  opacity: 0; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: `${heart.x}%`,
        fontSize: `${heart.size}px`,
        animation: `floatUp_${heart.id} ${heart.dur}ms ease-out forwards`,
        filter: `drop-shadow(0 0 6px ${config.glow})`,
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {config.emoji}
      </div>
    </>
  );
}

// ── HeartButton ─────────────────────────────────────
// Drop-in button that triggers hearts + syncs to Supabase
// Props:
//   spawnHeart   — from useHearts()
//   onPress      — optional extra callback (e.g. Supabase sync)
//   color        — accent color of the room
//   emoji        — heart emoji for this room
//   count        — total heart count to display (optional)

export function HeartButton({ spawnHeart, onPress, color, emoji, count }) {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    spawnHeart();
    if (onPress) onPress();

    // Button pulse animation
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'none',
        border: `1px solid ${color}40`,
        borderRadius: '20px',
        padding: '6px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '16px',
        color,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        fontWeight: 600,
        transform: pressed ? 'scale(1.25)' : 'scale(1)',
        transition: 'transform 0.15s ease',
        backdropFilter: 'blur(4px)',
      }}
      title="Send love"
    >
      <span style={{ fontSize: '16px' }}>{emoji}</span>
      {count > 0 && <span style={{ opacity: 0.7 }}>{count > 999 ? '999+' : count}</span>}
    </button>
  );
}