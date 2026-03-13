import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with your existing Vercel environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({ error: 'Mood is required' });
  }

  try {
    // IMPORTANT: We explicitly call the "flash" model here to save your Pro quota!
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Strict instructions to keep it short, non-clinical, and safe
    const prompt = `
      You are a gentle mindfulness companion. The user has indicated they are feeling "${mood}".
      Provide exactly ONE short, comforting sentence to acknowledge this feeling.
      Do not give medical advice. Do not be overly dramatic. Keep it poetic, grounding, and safe.
      Do not use quotes around your response.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Send the tip back to the frontend
    res.status(200).json({ tip: responseText });

  } catch (error) {
    console.error('Lightweight AI Error:', error);
    res.status(500).json({ error: 'Failed to generate mood reflection' });
  }
}