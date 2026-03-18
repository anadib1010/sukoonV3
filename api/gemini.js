import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { entry, hi } = req.body;
    
    // Notice: There is no VITE_ or REACT_APP_ prefix. 
    // This ensures Vercel keeps the key strictly on the server side.
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ error: 'API key missing from server.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = hi
      ? "आप 'सुकून एआई' हैं, एक शांत, सहानुभूतिपूर्ण और बिना किसी फैसले के सुनने वाले साथी। उपयोगकर्ता अपनी भावनाओं को जर्नल में लिख रहा है। एक गहरी समझ, शांति और मान्यता के साथ उत्तर दें। उत्तर छोटा (अधिकतम 2-3 वाक्य) और बहुत ही कोमल होना चाहिए। कोई सलाह न दें, बस उन्हें सुनें।"
      : "You are Sukoon AI , a calm, empathetic, and non-judgmental companion. The user is writing their feelings in a journal. Respond with deep empathy, validation, and a gentle tone. Keep the response brief (2-3 sentences max). Do not give unsolicited advice, just hold space for them.";

    const prompt = `${systemInstruction}\n\nUser's Journal Entry: "${entry}"\n\nSukoon AI's gentle reflection:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanResponse = responseText.replace(/[*#_]/g, '').trim();

    // Send the safe response back to the frontend
    res.status(200).json({ response: cleanResponse });
  } catch (error) {
    console.error("Server API Error:", error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}