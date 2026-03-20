import { createClient } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

// ─── CONFETTI ───
export const fireGrandConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── ATOMIC CREDIT INCREMENT ───
// Uses a Postgres RPC to avoid read-modify-write race conditions.
// Run supabase/migrations.sql once in your Supabase SQL Editor first.
export const addCredits = async (amount) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.rpc('increment_credits', { uid: user.id, amount });
    if (error) throw error;
  } catch (err) {
    // Silently fail — credits are a reward, not a critical path
  }
};
