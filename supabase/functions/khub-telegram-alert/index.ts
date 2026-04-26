// ============================================================================
// khub-telegram-alert  —  Supabase Edge Function
// ============================================================================
// Sends a Telegram message when a K-Hub message is auto-hidden after 3 reports.
//
// Deploy:
//   supabase functions deploy khub-telegram-alert --no-verify-jwt
//
// Required secrets:
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
// ============================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const CHAT_ID   = Deno.env.get("TELEGRAM_CHAT_ID")!;

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  let body: any;
  try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }

  const { room_name, user_email, message_text, report_count } = body;

  const text =
    `🚨 <b>JSukoon Auto-Hide Alert</b>\n` +
    `📍 Room: ${room_name ?? "Unknown"}\n` +
    `👤 User: ${user_email ?? "Unknown"}\n` +
    `💬 Message: ${message_text ? message_text.slice(0, 100) : "[image]"}\n` +
    `🚩 Reports: ${report_count ?? 3} — <b>Auto-hidden</b>`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    });
    const data = await r.json();
    return new Response(JSON.stringify({ ok: data.ok }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
