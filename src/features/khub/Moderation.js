// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/features/khub/moderation.js
// Shared moderation system for all 5 K-Hub chat rooms
// Import what you need in each room file
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { supabase } from '../../supabase';

// ══════════════════════════════════════════════════════
// 1. COMPLETE BANNED WORD LIST
//    English + Hindi + Roman Hindi (Hinglish)
//    covers: slurs, fandom attacks, obscenity,
//            violence, comparison wars
// ══════════════════════════════════════════════════════

export const BANNED_FRAGMENTS = [

  // ── FANDOM WARS (the #1 cause of K-pop fights) ──
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

  // ── OBSCENITY (keeping it clean for 18-35 Indian audience) ──
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
// 2. TOXICITY CHECKER
//    Returns { toxic: bool, reason: string }
// ══════════════════════════════════════════════════════

export function checkToxicity(text) {
  if (!text || typeof text !== 'string') return { toxic: false };
  const lower = text.toLowerCase();
  for (const frag of BANNED_FRAGMENTS) {
    if (lower.includes(frag.toLowerCase())) {
      return { toxic: true, reason: frag };
    }
  }
  return { toxic: false };
}

// ══════════════════════════════════════════════════════
// 3. SPAM RATE LIMITER
//    Use one instance per chat room component
//    const limiter = new SpamLimiter(5, 10)
// ══════════════════════════════════════════════════════

export class SpamLimiter {
  constructor(maxMessages = 5, windowSeconds = 10) {
    this.max    = maxMessages;
    this.window = windowSeconds * 1000;
    this.times  = [];
    // escalation tracking
    this.warnings = 0;
    this.lastWarn = 0;
  }

  // Returns { allowed: bool, warning: string|null, muted: bool }
  check(hi = false) {
    const now = Date.now();
    this.times = this.times.filter(t => now - t < this.window);

    if (this.times.length >= this.max) {
      this.warnings++;
      this.lastWarn = now;

      // After 3 spam attempts in a session → temporary local mute (60s)
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
// 4. REPUTATION SYSTEM
//    Call these after key events to update rep score
// ══════════════════════════════════════════════════════

// Points awarded/deducted for actions
export const REP_POINTS = {
  GOOD_MESSAGE:    +1,   // every clean message sent
  VALID_REPORT:    +5,   // report was acted on (auto-hide triggered)
  DAILY_ACTIVE:    +2,   // first message of the day
  TOXIC_MESSAGE:  -10,   // message blocked by toxicity filter
  REPORTED:        -5,   // someone reported their message
  SPAM_WARNED:    -3,    // spam warning received
};

// Trust levels based on rep score
export function getTrustLevel(score) {
  if (score < 0)   return 0;  // restricted — slow mode only
  if (score < 50)  return 1;  // new user — normal access
  if (score < 200) return 2;  // trusted — full access
  return 3;                   // elite — can help moderate
}

export function getTrustLabel(level, hi = false) {
  const labels = hi
    ? ['🔴 प्रतिबंधित', '⚪ नया', '🟢 विश्वसनीय', '⭐ एलीट']
    : ['🔴 Restricted',  '⚪ New', '🟢 Trusted',    '⭐ Elite'];
  return labels[level] ?? labels[1];
}

// Update rep score in Supabase
export async function updateRepScore(userId, points) {
  if (!userId) return;
  try {
    // Get current score
    const { data } = await supabase
      .from('profiles')
      .select('rep_score')
      .eq('id', userId)
      .single();

    const current  = data?.rep_score ?? 0;
    const newScore = Math.max(-100, current + points); // floor at -100
    const newLevel = getTrustLevel(newScore);

    await supabase
      .from('profiles')
      .update({ rep_score: newScore, trust_level: newLevel })
      .eq('id', userId);
  } catch (_) {}
}

// ══════════════════════════════════════════════════════
// 5. REPORT HANDLER
//    Call this when user submits a report
//    Returns { reported: bool, autoHidden: bool }
// ══════════════════════════════════════════════════════

export async function submitReport(messageId, reportedBy, reason, messageUserId) {
  if (!messageId || !reportedBy) return { reported: false, autoHidden: false };

  try {
    // Insert report
    await supabase.from('message_reports').insert({
      message_id:  messageId,
      reported_by: reportedBy,
      reason,
    });

    // Deduct rep from reported user
    if (messageUserId) await updateRepScore(messageUserId, REP_POINTS.REPORTED);

    // Count total reports on this message
    const { count } = await supabase
      .from('message_reports')
      .select('*', { count: 'exact', head: true })
      .eq('message_id', messageId);

    // 3+ reports → auto hide
    if (count >= 3) {
      await supabase
        .from('khub_messages')
        .update({ status: 'hidden' })
        .eq('id', messageId);

      // Extra rep hit for the reported user (message was auto-hidden)
      if (messageUserId) await updateRepScore(messageUserId, REP_POINTS.TOXIC_MESSAGE);

      return { reported: true, autoHidden: true };
    }

    return { reported: true, autoHidden: false };
  } catch (_) {
    return { reported: false, autoHidden: false };
  }
}

// ══════════════════════════════════════════════════════
// 6. MUTE CHECKER
//    Call on mount to check if this user is muted
//    Returns { muted: bool, expiresAt: Date|null }
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
