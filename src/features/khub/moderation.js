// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/features/khub/moderation.js
// Shared moderation system for all 5 K-Hub chat rooms
// V3 — original functions + meme upload (Oracle VM-backed)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { supabase } from '../../supabase';

// VM API URL (override in .env via VITE_JSUKOON_API_URL if needed)
const VM_API_URL = import.meta.env.VITE_JSUKOON_API_URL
  || 'https://jsukoon-api.duckdns.org';

// ══════════════════════════════════════════════════════
// 1. COMPLETE BANNED WORD LIST
//    English + Hindi + Roman Hindi (Hinglish)
// ══════════════════════════════════════════════════════

export const BANNED_FRAGMENTS = [

  // ── FANDOM WARS ──
  'better than',    'worse than',     'vs bts',        'vs blackpink',
  'bts vs',         'blackpink vs',   'army vs',        'blink vs',
  'army trash',     'blink trash',    'bts trash',      'bp trash',
  'flop group',     'flop era',       'flop album',     'overrated',
  'flop',           'charted flop',   'nobody streams',

  // ── HATE / VIOLENCE ──
  'kill',           'die',            'kys',            'kms',
  'murder',         'beat up',        'fight me',       'i will find you',
  'harm',           'hurt yourself',  'end yourself',

  // ── GENERAL TOXICITY (English) ──
  'trash',          'garbage',        'disgusting',     'pathetic',
  'loser',          'worthless',      'ugly',           'fat',
  'stupid',         'idiot',          'moron',          'dumb',
  'shut up',        'go away',        'nobody cares',   'no one asked',
  'cringe',         'flop',           'irrelevant',     'delete this',

  // ── OBSCENITY ──
  'f**k',           'fk',             'fck',            'wtf',
  'bs',             'bullsh',         'sh*t',           'sht',
  'b*tch',          'btch',           'a**hole',        'asshole',
  'porn',           'nsfw',           'nude',           'naked',
  'sex',            'sexy',           'hot body',

  // ── HINDI BANNED WORDS (Devanagari) ──
  'मादरचोद',        'बहनचोद',         'रंडी',           'कमीना',
  'कुत्ता',         'कुत्ती',         'हरामी',          'हरामज़ादा',
  'साला',           'साली',           'गधा',            'बेशर्म',
  'बेवकूफ',         'मूर्ख',          'निकम्मा',        'बकवास',
  'चुप कर',         'बंद कर',         'मर जा',          'भाड़ में जा',
  'गंदा',           'घटिया',

  // ── ROMAN HINDI / HINGLISH ──
  'madarchod',      'bhadwa',         'randi',          'kamina',
  'haramzada',      'harami',         'kutte',          'kamine',
  'chutiya',        'bevkoof',        'gadha',          'bakwaas',
  'mar ja',         'besharam',       'ganda',          'ghatiya',
  'nikaalo',        'bhad mein ja',

  // ── SPAM PATTERNS ──
  'aaaaaaa',        'hahahahaha',     '!!!!!!',         '??????',
  'spamming',       'copy paste',

  // ── PERSONAL ATTACKS ON ARTISTS ──
  'ugly face',      'can not sing',   'cant sing',      'bad dancer',
  'no talent',      'plastic surgery', 'plastic face',
];

// ══════════════════════════════════════════════════════
// 1b. LEETSPEAK NORMALIZER (NEW — catches tr@sh, f.l.o.p, etc.)
// ══════════════════════════════════════════════════════

const LOOKALIKE = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't',
  '@': 'a', '$': 's', '!': 'i', '|': 'i',
};

function _normalize(input) {
  let s = String(input || '').toLowerCase();
  s = s.replace(/[0134578@$!|]/g, (c) => LOOKALIKE[c] ?? c);
  // keep latin + devanagari + spaces
  s = s.replace(/[^a-z\u0900-\u097F\s]/g, '');
  // collapse triple+ repeats: fuuuck -> fuck
  s = s.replace(/(.)\1{2,}/g, '$1');
  s = s.replace(/\s+/g, ' ').trim();
  // also produce a no-space variant so "f u c k" matches "fuck"
  return s + ' ||| ' + s.replace(/\s/g, '');
}

// ══════════════════════════════════════════════════════
// 2. TOXICITY CHECKER
//    Returns { toxic: bool, reason: string }
//    Now with leetspeak normalization for harder bypass detection.
// ══════════════════════════════════════════════════════

export function checkToxicity(text) {
  if (!text || typeof text !== 'string') return { toxic: false };
  // Strip URLs before checking — Spotify/YouTube links should never be blocked
  const stripped = text.replace(/https?:\/\/\S+/g, '');
  if (!stripped.trim()) return { toxic: false };
  const lower = stripped.toLowerCase();
  const norm  = _normalize(stripped);
  for (const frag of BANNED_FRAGMENTS) {
    const f = frag.toLowerCase();
    if (lower.includes(f)) return { toxic: true, reason: frag };
    // also check the normalized form for sneaky variants like tr@sh, fuuuck
    if (norm.includes(f.replace(/\s/g, ''))) return { toxic: true, reason: frag };
  }
  return { toxic: false };
}

// ══════════════════════════════════════════════════════
// 3. SPAM RATE LIMITER
// ══════════════════════════════════════════════════════

export class SpamLimiter {
  constructor(maxMessages = 5, windowSeconds = 10) {
    this.max    = maxMessages;
    this.window = windowSeconds * 1000;
    this.times  = [];
    this.warnings = 0;
    this.lastWarn = 0;
  }

  check(hi = false) {
    const now = Date.now();
    this.times = this.times.filter(t => now - t < this.window);

    if (this.times.length >= this.max) {
      this.warnings++;
      this.lastWarn = now;

      if (this.warnings >= 3) {
        return {
          allowed: false,
          muted:   true,
          warning: hi
            ? '🚫 आप 60 सेकंड के लिए म्यूट हो गए हैं। Spam बंद करें।'
            : '🚫 You are muted for 60 seconds. Stop spamming.',
        };
      }

      return {
        allowed: false,
        muted:   false,
        warning: hi
          ? `⚡ बहुत तेज़! ${this.max} messages per ${this.window/1000}s तक सीमित हैं। (चेतावनी ${this.warnings}/3)`
          : `⚡ Slow down! Max ${this.max} messages per ${this.window/1000}s. (Warning ${this.warnings}/3)`,
      };
    }

    this.times.push(now);
    return { allowed: true, muted: false, warning: null };
  }

  reset() { this.times = []; this.warnings = 0; }
}

// ══════════════════════════════════════════════════════
// 3b. DUPLICATE MESSAGE DETECTOR
//     Same message sent 3+ times within 5 minutes = auto-mute
// ══════════════════════════════════════════════════════

export class DuplicateDetector {
  constructor(maxRepeats = 3, windowSeconds = 300) {
    this.maxRepeats = maxRepeats;
    this.window     = windowSeconds * 1000;
    this.history    = [];
  }

  check(text, hi = false) {
    if (!text || !text.trim()) return { allowed: true };

    const now        = Date.now();
    const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');

    this.history = this.history.filter(e => now - e.ts < this.window);

    const count = this.history.filter(e => e.normalized === normalized).length;

    if (count >= this.maxRepeats) {
      return {
        allowed: false,
        muted:   true,
        warning: hi
          ? `🚫 एक ही message बार-बार मत भेजें। Spam के लिए mute किया जा रहा है।`
          : `🚫 Stop sending the same message repeatedly. You've been muted for spam.`,
      };
    }

    if (count === this.maxRepeats - 1) {
      this.history.push({ normalized, ts: now });
      return {
        allowed: false,
        muted:   false,
        warning: hi
          ? `⚠️ यह message आप पहले भेज चुके हैं। अगली बार mute होगा।`
          : `⚠️ You've already sent this message. One more repeat = mute.`,
      };
    }

    this.history.push({ normalized, ts: now });
    return { allowed: true };
  }

  reset() { this.history = []; }
}

// ══════════════════════════════════════════════════════
// 3c. SHADOW RESTRICT
//     Users with strike_count >= 3 OR rep_score < -15
//     are silently throttled. They don't know.
// ══════════════════════════════════════════════════════

export function isShadowRestricted(profile) {
  if (!profile) return false;
  return (profile.strike_count >= 3) || (profile.rep_score < -15);
}

export class ShadowThrottle {
  constructor(cooldownSeconds = 8) {
    this.cooldown = cooldownSeconds * 1000;
    this.lastSent = 0;
  }

  check() {
    const now = Date.now();
    if (now - this.lastSent < this.cooldown) {
      return { allowed: false };
    }
    this.lastSent = now;
    return { allowed: true };
  }
}

// ══════════════════════════════════════════════════════
// 3d. PER-ROOM SLOW MODE
//     Fetches slow mode config from Supabase on mount.
//     Subscribes to realtime changes — no deploy needed to toggle.
// ══════════════════════════════════════════════════════

export async function fetchSlowMode(roomName) {
  try {
    const { data, error } = await supabase
      .from('khub_slow_mode')
      .select('enabled, cooldown_seconds')
      .eq('room_name', roomName)
      .single();
    if (error || !data) return { enabled: false, cooldown_seconds: 30 };
    return data;
  } catch (_) {
    return { enabled: false, cooldown_seconds: 30 };
  }
}

// ══════════════════════════════════════════════════════
// 3e. USER BLOCK LIST
// ══════════════════════════════════════════════════════

export async function blockUser(blockerId, blockedId) {
  if (!blockerId || !blockedId || blockerId === blockedId) return;
  try {
    await supabase.from('khub_user_blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  } catch (_) {}
}

export async function fetchBlockedIds(userId) {
  if (!userId) return [];
  try {
    const { data } = await supabase
      .from('khub_user_blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);
    return data?.map(r => r.blocked_id) ?? [];
  } catch (_) {
    return [];
  }
}

// ══════════════════════════════════════════════════════
// 4. REPUTATION SYSTEM
// ══════════════════════════════════════════════════════

export const REP_POINTS = {
  GOOD_MESSAGE:    +1,
  VALID_REPORT:    +5,
  DAILY_ACTIVE:    +2,
  TOXIC_MESSAGE:  -10,
  REPORTED:        -5,
  SPAM_WARNED:    -3,
  NSFW_BLOCKED:   -20,   // NEW — for blocked NSFW image uploads
};

export function getTrustLevel(score) {
  if (score < -20) return 0;
  if (score < 50)  return 1;
  if (score < 200) return 2;
  return 3;
}

export function getTrustLabel(level, hi = false) {
  const labels = hi
    ? ['🔴 प्रतिबंधित', '⚪ नया', '🟢 विश्वसनीय', '⭐ एलीट']
    : ['🔴 Restricted',  '⚪ New', '🟢 Trusted',    '⭐ Elite'];
  return labels[level] ?? labels[1];
}

export async function updateRepScore(userId, points) {
  if (!userId) return;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('rep_score')
      .eq('id', userId)
      .single();

    const current  = data?.rep_score ?? 0;
    const newScore = Math.max(-100, current + points);
    const newLevel = getTrustLevel(newScore);

    await supabase
      .from('profiles')
      .update({ rep_score: newScore, trust_level: newLevel })
      .eq('id', userId);
  } catch (_) {}
}

// ══════════════════════════════════════════════════════
// 5. REPORT HANDLER
// ══════════════════════════════════════════════════════

export async function submitReport(messageId, reportedBy, reason, messageUserId) {
  if (!messageId || !reportedBy) return { reported: false, autoHidden: false };

  try {
    await supabase.from('message_reports').insert({
      message_id:  messageId,
      reported_by: reportedBy,
      reason,
    });

    if (messageUserId) await updateRepScore(messageUserId, REP_POINTS.REPORTED);

    const { count } = await supabase
      .from('message_reports')
      .select('*', { count: 'exact', head: true })
      .eq('message_id', messageId);

    if (count >= 3) {
  await supabase
    .from('khub_messages')
    .update({ status: 'hidden' })
    .eq('id', messageId);

  if (messageUserId) await updateRepScore(messageUserId, REP_POINTS.TOXIC_MESSAGE);

  // Send Telegram alert
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const msgData = await supabase
      .from('khub_messages')
      .select('room_name, user_email, text')
      .eq('id', messageId)
      .single();
    if (session && msgData.data) {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/khub-telegram-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          room_name:    msgData.data.room_name,
          user_email:   msgData.data.user_email,
          message_text: msgData.data.text,
          report_count: count,
        }),
      });
    }
  } catch (_) {}

  return { reported: true, autoHidden: true };
}

    return { reported: true, autoHidden: false };
  } catch (_) {
    return { reported: false, autoHidden: false };
  }
}

// ══════════════════════════════════════════════════════
// 6. MUTE CHECKER
// ══════════════════════════════════════════════════════

export async function checkIfMuted(userId) {
  if (!userId) return { muted: false, expiresAt: null };
  try {
    const { data } = await supabase
      .from('mod_actions')
      .select('expires_at')
      .eq('user_id', userId)
      .eq('action', 'mute')
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (data?.[0]) {
      return { muted: true, expiresAt: new Date(data[0].expires_at) };
    }
    return { muted: false, expiresAt: null };
  } catch (_) {
    return { muted: false, expiresAt: null };
  }
}

// ══════════════════════════════════════════════════════
// 7. MEME UPLOAD (NEW — Oracle VM-backed)
//    Browser → VM (NSFW check + Oracle upload) → Supabase Edge Function
// ══════════════════════════════════════════════════════

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/khub-message-check`;

async function _callEdgeFunction(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw Object.assign(new Error('not_authenticated'), { code: 'not_authenticated' });

  const r = await fetch(FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(data?.message || data?.error || `HTTP ${r.status}`);
    err.code = data?.error;
    err.status = r.status;
    throw err;
  }
  return data;
}

/**
 * Uploads a meme: browser → VM (scores + Oracle upload) → Supabase (records msg).
 * Returns { ok, nsfw_state }.
 *
 * room       — 'lavender' | 'kpop' | 'kdrama' | 'purple' | 'blink'
 * roomName   — full room name as it appears in khub_messages.room_name
 *              (passed because legacy rooms use 'Lavender Lounge' etc, not 'lavender')
 * blob       — image Blob (already compressed)
 * caption    — optional text caption
 * avatarEmoji — emoji for the user's avatar in this room
 */
export async function uploadAndSendMeme({ room, roomName, blob, caption, avatarEmoji }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw Object.assign(new Error('not_authenticated'), { code: 'not_authenticated' });

  // 1. Upload to VM
  const form = new FormData();
  form.append('file', blob, 'meme.jpg');

  const vmRes = await fetch(`${VM_API_URL}/meme-upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: form,
  });
  const vmData = await vmRes.json().catch(() => ({}));
  if (!vmRes.ok) {
    const err = new Error(vmData?.message || vmData?.error || `HTTP ${vmRes.status}`);
    err.code = vmData?.error;
    err.status = vmRes.status;
    err.score = vmData?.score;
    throw err;
  }

  // 2. Tell Edge Function to insert the message row
  return _callEdgeFunction({
    room,
    roomName,
    msg_type: 'image',
    text: caption || '',
    avatar_emoji: avatarEmoji,
    file_id:     vmData.file_id,
    object_path: vmData.object_name,
    nsfw_state:  vmData.nsfw_state,
    nsfw_score:  vmData.nsfw_score,
    ts:          vmData.ts,
    signature:   vmData.signature,
  });
}

// ══════════════════════════════════════════════════════
// 8. AUTH-GATED IMAGE FETCH (NEW)
//    For rendering meme images. Bucket is private; we proxy
//    through the VM with the user's JWT.
// ══════════════════════════════════════════════════════

const _imageCache = new Map();   // object_path -> { url, expiresAt }
const CACHE_TTL_MS = 30 * 60 * 1000;

export async function fetchAuthedImage(object_path) {
  const cached = _imageCache.get(object_path);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('not_authenticated');

  const r = await fetch(`${VM_API_URL}/meme/${object_path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!r.ok) throw new Error(`image_fetch_${r.status}`);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);

  if (cached?.url) URL.revokeObjectURL(cached.url);
  _imageCache.set(object_path, { url, expiresAt: Date.now() + CACHE_TTL_MS });
  return url;
}

export function clearImageCache() {
  for (const { url } of _imageCache.values()) URL.revokeObjectURL(url);
  _imageCache.clear();
}
