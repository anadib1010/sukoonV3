// ============================================================================
// khub-message-check  —  Supabase Edge Function (V2: Oracle-backed)
// ============================================================================
// Server-side gate for K-Hub messages. For image messages, this no longer
// scores the image — that already happened on the Oracle VM. Instead, we
// HMAC-verify that the VM actually issued the upload token.
//
// Deploy:
//   supabase functions deploy khub-message-check --no-verify-jwt
//
// Required Supabase secrets:
//   SUPABASE_URL                (auto)
//   SUPABASE_SERVICE_ROLE_KEY   (auto)
//   SUPABASE_ANON_KEY           (auto)
//   VM_HMAC_SECRET              <-- ADD THIS, must match VM's hmac_secret
// ============================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY      = Deno.env.get("SUPABASE_ANON_KEY")!;
const HMAC_SECRET   = Deno.env.get("VM_HMAC_SECRET")!;

// Accept either short keys ('lavender') or full names ('Lavender Lounge').
// Map short key → full name (used for DB insert).
// IMPORTANT: full names must match exactly what khub_messages.room_name stores.
const ROOM_NAME_MAP: Record<string, string> = {
  lavender: "Lavender Lounge",
  kpop:     "General K-Pop",
  kdrama:   "K-Drama Room",
  purple:   "Purple Lounge",
  blink:    "Blink Lounge",
};
const VALID_ROOM_NAMES = new Set(Object.values(ROOM_NAME_MAP));
const VALID_ROOM_KEYS  = new Set(Object.keys(ROOM_NAME_MAP));
const MAX_TEXT_LEN = 500;
const TOKEN_MAX_AGE = 5 * 60;   // 5 minutes — uploads must be claimed quickly

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });

// --- Toxicity (mirrors moderation.js) -------------------------------------
const BANNED_PHRASES = [
  "kill yourself", "kys", "kms", "go die", "should die",
  "vs bts", "vs blackpink", "blink trash", "army trash",
  "flop group", "flop song", "no talent",
  "trash", "garbage", "loser", "ugly face", "cant sing", "can't sing",
  "fuck", "fck", "f*ck", "bitch", "b*tch", "asshole", "a**hole",
  "मादरचोद", "हरामी", "साला", "कुत्ता", "रंडी", "भोसड़ी", "चूतिया",
  "madarchod", "behenchod", "chutiya", "kamina", "harami", "randi", "bhosdi",
  "mc", "bc",
];

function normalize(input: string): string {
  let s = input.toLowerCase();
  const map: Record<string, string> = {
    "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t",
    "@": "a", "$": "s", "!": "i", "|": "i",
  };
  s = s.replace(/[0134578@$!|]/g, (c) => map[c] ?? c);
  s = s.replace(/[^a-z\u0900-\u097F\s]/g, "");
  s = s.replace(/(.)\1{2,}/g, "$1");
  s = s.replace(/\s+/g, " ");
  return s + " ||| " + s.replace(/\s/g, "");
}

function isToxic(text: string): boolean {
  // Strip URLs before checking — Spotify/YouTube links should never be blocked
  const stripped = text.replace(/https?:\/\/\S+/g, "");
  if (!stripped.trim()) return false;
  const n = normalize(stripped);
  return BANNED_PHRASES.some((p) => n.includes(p.toLowerCase()));
}

// --- HMAC verification (matches VM's _sign function) ----------------------
async function hmacSha256Hex(key: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw", enc.encode(key),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifyVmSignature(
  fileId: string, userId: string, nsfwState: string,
  ts: number, signature: string,
): Promise<boolean> {
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age < 0 || age > TOKEN_MAX_AGE) return false;
  const expected = await hmacSha256Hex(
    HMAC_SECRET, `${fileId}|${userId}|${nsfwState}|${ts}`,
  );
  return timingSafeEqual(expected, signature);
}

// --- Main handler ---------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")    return json(405, { error: "POST only" });

  // 1. Verify JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json(401, { error: "missing_auth" });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json(401, { error: "invalid_token" });
  const user = userData.user;

  // 2. Parse body
  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  const room: string = String(body?.room ?? "");
  const roomName: string = String(body?.roomName ?? "");
  const msgType: string = body?.msg_type === "image" ? "image" : "text";
  const text: string = String(body?.text ?? "").slice(0, MAX_TEXT_LEN + 1);
  const avatarEmoji: string = String(body?.avatar_emoji ?? "🌸").slice(0, 8);

  // Resolve room → full name used by khub_messages.room_name
  let resolvedRoomName: string;
  if (roomName && VALID_ROOM_NAMES.has(roomName)) {
    resolvedRoomName = roomName;
  } else if (room && VALID_ROOM_KEYS.has(room)) {
    resolvedRoomName = ROOM_NAME_MAP[room];
  } else {
    return json(400, { error: "invalid_room" });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // 3. Rate limit
  const { data: limited } = await admin.rpc("khub_is_rate_limited", { p_user_id: user.id });
  if (limited === true) {
    return json(429, { error: "rate_limited", message: "Slow down — 5 messages per 10 seconds." });
  }

  // 4. TEXT branch
  if (msgType === "text") {
    if (!text || text.trim().length === 0) return json(400, { error: "empty_text" });
    if (text.length > MAX_TEXT_LEN)         return json(400, { error: "text_too_long" });

    if (isToxic(text)) {
      await admin.rpc("khub_adjust_rep", { p_user_id: user.id, p_delta: -10 });
      const strike = await admin.rpc("khub_issue_strike", {
        p_target_user_id: user.id,
        p_reason:         "toxic_text",
        p_issued_by:      user.id,
        p_room_id:        null,
      });
      return json(403, {
        error:      "toxic",
        message:    "Message blocked. -10 reputation.",
        strike:     strike.data,
      });
    }

    const { error: insErr } = await admin.from("khub_messages").insert({
      room_name: resolvedRoomName,
      user_id: user.id,
      user_email: user.email ?? null,
      text,
      msg_type: "text",
      status: "visible",
      avatar_emoji: avatarEmoji,
      nsfw_state: "safe",
    });
    if (insErr) return json(500, { error: "insert_failed", detail: insErr.message });

    await admin.rpc("khub_adjust_rep", { p_user_id: user.id, p_delta: 1 });
    return json(200, { ok: true, nsfw_state: "safe" });
  }

  // 5. IMAGE branch — verify the VM's HMAC token
  const fileId: string = String(body?.file_id ?? "");
  const objectPath: string = String(body?.object_path ?? "");
  const nsfwState: string = body?.nsfw_state === "blurred" ? "blurred" : "safe";
  const nsfwScore: number = Number(body?.nsfw_score ?? 0);
  const ts: number = Number(body?.ts ?? 0);
  const signature: string = String(body?.signature ?? "");

  if (!fileId || !objectPath || !signature || !ts) {
    return json(400, { error: "missing_upload_token" });
  }

  // Object path must be inside the user's own folder
  if (!objectPath.startsWith(`${user.id}/`)) {
    return json(403, { error: "path_mismatch" });
  }

  const valid = await verifyVmSignature(fileId, user.id, nsfwState, ts, signature);
  if (!valid) return json(403, { error: "invalid_signature" });

  // (No need to re-check 15-min new account here — the VM already enforces.
  //  Belt-and-suspenders: do it anyway in case VM drifts.)
  const { data: tooNew } = await admin.rpc("khub_is_new_account", { p_user_id: user.id });
  if (tooNew === true) {
    return json(403, { error: "new_account_no_images" });
  }

  // Optional caption — toxicity check
  if (text && isToxic(text)) {
    await admin.rpc("khub_adjust_rep", { p_user_id: user.id, p_delta: -10 });
    return json(403, { error: "toxic_caption", message: "Caption blocked." });
  }

  const { error: insErr } = await admin.from("khub_messages").insert({
    room_name: resolvedRoomName,
    user_id: user.id,
    user_email: user.email ?? null,
    text: text || null,
    msg_type: "image",
    status: "visible",
    avatar_emoji: avatarEmoji,
    file_id: fileId,
    object_path: objectPath,
    nsfw_score: nsfwScore,
    nsfw_state: nsfwState,
  });
  if (insErr) return json(500, { error: "insert_failed", detail: insErr.message });

  if (nsfwState === "safe") {
    await admin.rpc("khub_adjust_rep", { p_user_id: user.id, p_delta: 1 });
  }

  return json(200, { ok: true, nsfw_state: nsfwState });
});
