import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimit } from './_rateLimit.js';

// 20 requests per minute per IP — protects Gemini 2.5-flash daily quota
const checkLimit = rateLimit({ maxRequests: 20, windowMs: 60 * 1000 });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (checkLimit(req, res)) return;

  const { entry, hi } = req.body;

  if (!entry || typeof entry !== 'string' || entry.trim().length === 0) {
    return res.status(400).json({ error: 'Journal entry is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error.' });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // gemini-2.5-flash kept intentionally — journal reflections justify the deeper model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = hi
      ? "आप 'सुकून एआई' हैं, एक शांत, सहानुभूतिपूर्ण और बिना किसी फैसले के सुनने वाले साथी। उपयोगकर्ता अपनी भावनाओं को जर्नल में लिख रहा है। एक गहरी समझ, शांति और मान्यता के साथ उत्तर दें। उत्तर छोटा (अधिकतम 2-3 वाक्य) और बहुत ही कोमल होना चाहिए। कोई सलाह न दें, बस उन्हें सुनें।"
      : "You are Sukoon AI, a calm, empathetic, and non-judgmental companion. The user is writing their feelings in a journal. Respond with deep empathy, validation, and a gentle tone. Keep the response brief (2-3 sentences max). Do not give unsolicited advice, just hold space for them.";

    // XML delimiters prevent prompt injection
    const safeEntry = entry.slice(0, 1000);
    const prompt = `${systemInstruction}

<journal_entry>
${safeEntry}
</journal_entry>

Sukoon AI's gentle reflection:`;

    const result = await model.generateContent(prompt);
    const cleanResponse = result.response.text().replace(/[*#_]/g, '').trim();
    res.status(200).json({ response: cleanResponse });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
