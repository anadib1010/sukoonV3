import { createClient } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

// 🎊 The Celebration Tool
export const fireConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8aaa7a', '#7A9EA8', '#FFD700'] // Sukoon Green, Blue, and Gold!
  });
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