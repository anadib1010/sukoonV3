import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LINES = { daily: 2, weekly: 4, monthly: 6 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { rashiEn, rashiHi, period, today } = await req.json();

    if (!rashiEn || !period) {
      return new Response(
        JSON.stringify({ error: "Missing rashiEn or period" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const lines = LINES[period] ?? 2;
    const periodStr = period === "daily" ? "today" : period === "weekly" ? "this week" : "this month";

    const prompt = `You are a Vedic astrology expert. Write a horoscope for ${rashiEn} (${rashiHi}) for ${periodStr} (${today}).

Respond in EXACTLY this format with no extra text:

ENGLISH:
[${lines} sentences of horoscope in English, warm and positive tone, Vedic style]

HINDI:
[${lines} sentences of horoscope in Hindi, same meaning, warm tone]

LUCKY: [single lucky number 1-9]
COLOR: [one lucky color word]
PLANET: [ruling planet for this period]
MOOD: [one relevant emoji]

Rules:
- Exactly ${lines} sentences per language
- No bullet points, no headings inside the text
- Warm, encouraging, practical advice
- Based on Vedic Jyotish traditions
- Do not add anything outside this format`;

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not set");

    const MODELS = ["gemini-2.5-flash-preview-04-17", "gemini-1.5-flash"];

    let text = "";
    let lastError = "";

    for (const model of MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.8, maxOutputTokens: 600, topP: 0.9 },
            }),
          }
        );

        if (!res.ok) { lastError = `${model} returned ${res.status}`; continue; }

        const data = await res.json();
        text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text.length > 20) break;
        lastError = `${model} returned empty text`;
      } catch (e) {
        lastError = String(e);
        continue;
      }
    }

    if (!text || text.length < 20) throw new Error(`All models failed. Last: ${lastError}`);

    const parsed = {
      english: (text.match(/ENGLISH:\s*([\s\S]*?)(?=HINDI:|LUCKY:|COLOR:|PLANET:|MOOD:|$)/)?.[1] ?? "").trim(),
      hindi:   (text.match(/HINDI:\s*([\s\S]*?)(?=ENGLISH:|LUCKY:|COLOR:|PLANET:|MOOD:|$)/)?.[1] ?? "").trim(),
      lucky:   (text.match(/LUCKY[^\d]*(\d+)/)?.[1] ?? "7").trim(),
      color:   (text.match(/COLOR:\s*([^\n]+)/)?.[1] ?? "Gold").trim(),
      planet:  (text.match(/PLANET:\s*([^\n]+)/)?.[1] ?? "").trim(),
      mood:    (text.match(/MOOD:\s*([^\n]+)/)?.[1] ?? "✨").trim(),
    };

    if (!parsed.english && !parsed.hindi && text.length > 20) parsed.english = text.trim();
    if (!parsed.english && !parsed.hindi) throw new Error("Could not parse horoscope");

    return new Response(
      JSON.stringify({ text, ...parsed }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[horoscope]", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});