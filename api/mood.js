import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimit } from './_rateLimit.js';
import { verifyAuth } from './_verifyAuth.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const checkLimit = rateLimit({ maxRequests: 60, windowMs: 60 * 1000 });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (checkLimit(req, res)) return;

  // Verify user is logged in — uses only anon key, safe
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { mood } = req.body;

  if (!mood || typeof mood !== 'string' || mood.trim().length === 0 || mood.length > 200) {
    return res.status(400).json({ error: 'Valid mood is required.' });
  }

  try {
    // gemini-1.5-flash kept intentionally — 1500/day free quota vs 20/day on 2.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a gentle mindfulness companion. The user has indicated they are feeling as described below.
Provide exactly ONE short, comforting sentence to acknowledge this feeling.
Do not give medical advice. Do not be overly dramatic. Keep it poetic, grounding, and safe.
Do not use quotes around your response.

<user_mood>
${mood.slice(0, 200)}
</user_mood>`;

    const result = await model.generateContent(prompt);
    res.status(200).json({ tip: result.response.text().trim() });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate mood reflection' });
  }
}
