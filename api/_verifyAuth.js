import { createClient } from '@supabase/supabase-js';

// Verifies a Supabase JWT token using only the anon key
// Safe to use server-side — does not require service role key
export async function verifyAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorised.' });
    return null;
  }

  try {
    // Use anon key + token — Supabase validates the JWT server-side
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      res.status(401).json({ error: 'Invalid session.' });
      return null;
    }

    return user;
  } catch {
    res.status(401).json({ error: 'Auth verification failed.' });
    return null;
  }
}
