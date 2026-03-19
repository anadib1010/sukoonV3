import { createClient } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

// 🎊 THE GRAND FINALE TOOL
export const fireGrandConfetti = () => {
  const duration = 3 * 1000; // 3 seconds of party!
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // 🚀 Shoot from the left
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    // 🚀 Shoot from the right
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 💎 THE GLOBAL REWARDER
export const addCredits = async (amount) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch current stats (Try to find the existing row)
    const { data: stats, error: fetchError } = await supabase
      .from('progress_user_stats')
      .select('credits, total_sessions')
      .eq('user_id', user.id)
      .maybeSingle();

    // If stats don't exist, we start at 0
    const currentCredits = stats?.credits || 0;
    const currentSessions = stats?.total_sessions || 0;

    // 2. UPSERT: Update if exists, Insert if new
    // We removed the onConflict since user_id is now your Primary Key
    const { error } = await supabase
      .from('progress_user_stats')
      .upsert({
        user_id: user.id,
        credits: currentCredits + amount,
        total_sessions: currentSessions
      });

    if (error) throw error;
    console.log(`💎 Sukoon Reward: +${amount} credits (Total: ${currentCredits + amount})`);

  } catch (err) {
    console.error("Credit Error:", err.message);
  }
};