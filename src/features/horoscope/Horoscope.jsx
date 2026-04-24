import React, { useState } from 'react';
import { supabase } from '../../supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔮 HOROSCOPE — Vedic Jyotish powered by Gemini AI
// Path: src/features/horoscope/Horoscope.jsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RASHIS = [
  { id: 'mesh',       en: 'Aries',       hi: 'मेष',      emoji: '♈', dates: 'Mar 21 – Apr 19', planet: 'Mars'    },
  { id: 'vrishabh',  en: 'Taurus',      hi: 'वृषभ',     emoji: '♉', dates: 'Apr 20 – May 20', planet: 'Venus'   },
  { id: 'mithun',    en: 'Gemini',      hi: 'मिथुन',    emoji: '♊', dates: 'May 21 – Jun 20', planet: 'Mercury' },
  { id: 'kark',      en: 'Cancer',      hi: 'कर्क',     emoji: '♋', dates: 'Jun 21 – Jul 22', planet: 'Moon'    },
  { id: 'singh',     en: 'Leo',         hi: 'सिंह',     emoji: '♌', dates: 'Jul 23 – Aug 22', planet: 'Sun'     },
  { id: 'kanya',     en: 'Virgo',       hi: 'कन्या',    emoji: '♍', dates: 'Aug 23 – Sep 22', planet: 'Mercury' },
  { id: 'tula',      en: 'Libra',       hi: 'तुला',     emoji: '♎', dates: 'Sep 23 – Oct 22', planet: 'Venus'   },
  { id: 'vrishchik', en: 'Scorpio',     hi: 'वृश्चिक',  emoji: '♏', dates: 'Oct 23 – Nov 21', planet: 'Mars'    },
  { id: 'dhanu',     en: 'Sagittarius', hi: 'धनु',      emoji: '♐', dates: 'Nov 22 – Dec 21', planet: 'Jupiter' },
  { id: 'makar',     en: 'Capricorn',   hi: 'मकर',      emoji: '♑', dates: 'Dec 22 – Jan 19', planet: 'Saturn'  },
  { id: 'kumbh',     en: 'Aquarius',    hi: 'कुम्भ',    emoji: '♒', dates: 'Jan 20 – Feb 18', planet: 'Saturn'  },
  { id: 'meen',      en: 'Pisces',      hi: 'मीन',      emoji: '♓', dates: 'Feb 19 – Mar 20', planet: 'Jupiter' },
];

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://khpxgfadnnwycdhnyxye.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Fetch horoscope with daily caching ──────────────────────────────────────
async function fetchHoroscope(rashi, period) {
  const today    = new Date().toISOString().split('T')[0];
  const cacheKey = `${rashi.id}_${period}_${today}`;

  // Check Supabase cache first
  try {
    const { data } = await supabase
      .from('horoscopes')
      .select('content')
      .eq('cache_key', cacheKey)
      .limit(1);

    if (data?.[0]?.content) {
      const cached = JSON.parse(data[0].content);
      if (cached.english || cached.hindi) return cached;
    }
  } catch (_) {}

  // Call the Edge Function
  const todayFmt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const res = await fetch(`${SUPABASE_URL}/functions/v1/horoscope`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'apikey':        SUPABASE_ANON,
    },
    body: JSON.stringify({
      rashiEn: rashi.en,
      rashiHi: rashi.hi,
      period,
      today:   todayFmt,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Edge function ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Robust field extraction
  const raw = data.text || data.horoscope || data.content
    || data.result || data.response || data.message || '';

  const extract = (pattern, fallback = '') =>
    (raw.match(pattern)?.[1] ?? data[pattern?.source] ?? fallback).trim();

  const parsed = {
    english: (raw.match(/ENGLISH:\s*([\s\S]*?)(?=HINDI:|LUCKY:|COLOR:|PLANET:|MOOD:|$)/)?.[1] ?? data.english ?? '').trim(),
    hindi:   (raw.match(/HINDI:\s*([\s\S]*?)(?=ENGLISH:|LUCKY:|COLOR:|PLANET:|MOOD:|$)/)?.[1] ?? data.hindi   ?? '').trim(),
    lucky:   (raw.match(/LUCKY[^\d]*(\d+)/)?.[1]        ?? data.lucky  ?? '7').trim(),
    color:   (raw.match(/COLOR:\s*([^\n]+)/)?.[1]        ?? data.color  ?? 'Gold').trim(),
    planet:  (raw.match(/PLANET:\s*([^\n]+)/)?.[1]       ?? data.planet ?? rashi.planet).trim(),
    mood:    (raw.match(/MOOD:\s*([^\n]+)/)?.[1]         ?? data.mood   ?? '✨').trim(),
  };

  // Fallback: raw as english if structured parse failed
  if (!parsed.english && !parsed.hindi && raw.length > 20) {
    parsed.english = raw.trim();
  }

  if (!parsed.english && !parsed.hindi) {
    throw new Error('Empty horoscope response');
  }

  // Cache result
  try {
    await supabase.from('horoscopes').upsert({
      cache_key: cacheKey,
      rashi_id:  rashi.id,
      period,
      date:      today,
      content:   JSON.stringify(parsed),
    });
  } catch (_) {}

  return parsed;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function Horoscope({ setTab, T, lang = 'English' }) {
  const hi = lang === 'Hindi';

  const [selectedRashi, setSelectedRashi] = useState(null);
  const [period,        setPeriod]        = useState('daily');
  const [horoscope,     setHoroscope]     = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  const ACCENT = '#9B59B6'; // cosmic purple — consistent across all periods

  const loadHoroscope = async (rashi, p) => {
    setHoroscope(null);
    setError('');
    setLoading(true);
    try {
      const result = await fetchHoroscope(rashi, p);
      setHoroscope(result);
    } catch (e) {
      console.error('[Horoscope]', e);
      setError(
        hi ? '✨ अभी उपलब्ध नहीं। कृपया दोबारा कोशिश करें।'
           : '✨ Could not load reading. Please try again in a moment.'
      );
    }
    setLoading(false);
  };

  const handleRashiClick = (rashi) => {
    setSelectedRashi(rashi);
    setHoroscope(null);
    setError('');
    loadHoroscope(rashi, period);
  };

  const handlePeriodChange = (p) => {
    setPeriod(p);
    if (selectedRashi) loadHoroscope(selectedRashi, p);
  };

  // ── STYLES (Rule of T) ────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: '100dvh', background: T.bg, color: T.text,
      display: 'flex', flexDirection: 'column',
    },
    header: {
      padding: '52px 20px 16px',
      borderBottom: `1px solid ${ACCENT}22`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative',
    },
    backBtn: {
      background: 'none', border: 'none', color: T.accent,
      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    headerCenter: { textAlign: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
    headerTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px', fontWeight: 700, color: T.text, margin: 0,
    },
    headerSub: {
      fontSize: '10px', opacity: 0.45, marginTop: '2px',
      fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.5px',
    },
    scroll: { padding: '16px 16px 48px', flex: 1, overflowY: 'auto' },

    // Period tabs
    periodRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
    periodTab: (active) => ({
      flex: 1, padding: '10px 0', borderRadius: '12px',
      border: `1px solid ${ACCENT}${active ? 'AA' : '33'}`,
      background: active ? `${ACCENT}22` : 'transparent',
      color: active ? ACCENT : T.text,
      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.2s ease',
    }),

    // Instruction
    instruction: {
      fontSize: '13px', opacity: 0.5, textAlign: 'center',
      marginBottom: '14px', letterSpacing: '0.5px',
      fontFamily: "'DM Sans', sans-serif",
    },

    // Rashi grid — 4 columns
    rashiGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px', marginBottom: '16px',
    },
    rashiCard: (selected) => ({
      border: `1px solid ${selected ? ACCENT : T.accent + '33'}`,
      background: selected ? `${ACCENT}22` : `${T.accent}08`,
      borderRadius: '12px', padding: '8px 4px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      cursor: 'pointer', transition: 'all 0.2s ease',
    }),
    rashiEmoji:  { fontSize: '22px', marginBottom: '3px' },
    rashiName:   (selected) => ({
      fontSize: '10px', fontWeight: 700, textAlign: 'center',
      color: selected ? ACCENT : T.text,
      fontFamily: "'DM Sans', sans-serif",
    }),
    rashiDates:  {
      fontSize: '7px', opacity: 0.35, textAlign: 'center',
      marginTop: '1px', fontFamily: "'DM Sans', sans-serif",
    },
    rashiPlanet: {
      fontSize: '7px', opacity: 0.35, textAlign: 'center',
      marginTop: '1px', fontFamily: "'DM Sans', sans-serif",
    },

    // Result card
    horoCard: {
      border: `1px solid ${ACCENT}55`,
      background: `${ACCENT}0A`,
      borderRadius: '16px', padding: '16px', marginBottom: '16px',
    },
    horoHeader: {
      display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
    },
    horoEmoji:    { fontSize: '36px' },
    horoRashiName: {
      fontSize: '18px', fontWeight: 700, color: ACCENT,
      fontFamily: "'Cormorant Garamond', serif", margin: 0,
    },
    horoPeriod: {
      fontSize: '11px', opacity: 0.5, marginTop: '2px',
      fontFamily: "'DM Sans', sans-serif",
    },

    // Loading
    horoLoading: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '10px', padding: '24px 0',
    },
    spinner: {
      width: '24px', height: '24px', borderRadius: '50%',
      border: `2px solid ${ACCENT}33`,
      borderTop: `2px solid ${ACCENT}`,
      animation: 'spin 0.8s linear infinite',
    },
    horoLoadingText: {
      fontSize: '13px', opacity: 0.5, letterSpacing: '0.5px',
      fontFamily: "'DM Sans', sans-serif",
    },

    // Error
    horoError: {
      color: '#e74c3c', fontSize: '13px', textAlign: 'center',
      padding: '16px 0', opacity: 0.7,
      fontFamily: "'DM Sans', sans-serif",
    },

    // Meta chips
    horoMeta: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' },
    metaChip: {
      background: `${ACCENT}22`, borderRadius: '20px',
      padding: '5px 10px', fontSize: '11px', fontWeight: 600,
      color: ACCENT, fontFamily: "'DM Sans', sans-serif",
    },

    // Prediction text
    horoText: {
      fontSize: '15px', lineHeight: '1.7', opacity: 0.9,
      fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif",
      color: T.text,
    },

    // Hindi box
    hindiBox: {
      marginTop: '14px', padding: '12px',
      borderRadius: '10px', border: `0.5px solid ${ACCENT}33`,
      background: `${ACCENT}0A`,
    },
    hindiLabel: {
      fontSize: '9px', fontWeight: 700, letterSpacing: '1px',
      textTransform: 'uppercase', marginBottom: '6px',
      opacity: 0.7, color: ACCENT, fontFamily: "'DM Sans', sans-serif",
    },
    hindiText: {
      fontSize: '14px', lineHeight: '1.6', opacity: 0.85,
      fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif",
      color: T.text,
    },

    // Footer notes
    vedicNote: {
      fontSize: '10px', opacity: 0.3, textAlign: 'center',
      lineHeight: '1.6', padding: '0 20px', marginBottom: '12px',
      fontFamily: "'DM Sans', sans-serif",
    },
    disclaimerBox: {
      marginTop: '16px', marginBottom: '8px', padding: '14px',
      borderRadius: '12px',
      border: `1px solid ${T.accent}22`,
      background: `${T.accent}08`,
    },
    disclaimerTitle: {
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
      marginBottom: '6px', textTransform: 'uppercase',
      color: T.accent, fontFamily: "'DM Sans', sans-serif",
    },
    disclaimerText: {
      fontSize: '11px', lineHeight: '1.6', opacity: 0.6,
      color: T.text, fontFamily: "'DM Sans', sans-serif",
    },
  };

  return (
    <div style={s.page}>

      {/* CSS for spinner animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setTab('home')}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
        <div style={s.headerCenter}>
          <p style={s.headerTitle}>🔮 {hi ? 'आपका राशिफल' : 'Your Horoscope'}</p>
          <p style={{ ...s.headerSub, color: T.text }}>
            {hi ? 'वैदिक ज्योतिष · सूर्य और चंद्र राशि' : 'Vedic Jyotish · Sun & Moon signs'}
          </p>
        </div>
        <div style={{ width: '50px' }} />
      </div>

      {/* ── SCROLL CONTENT ── */}
      <div style={s.scroll}>

        {/* Period tabs */}
        <div style={s.periodRow}>
          {['daily', 'weekly', 'monthly'].map(p => (
            <button
              key={p}
              style={s.periodTab(period === p)}
              onClick={() => handlePeriodChange(p)}
            >
              {p === 'daily'   ? (hi ? '📅 आज'    : '📅 Today') :
               p === 'weekly'  ? (hi ? '🗓 सप्ताह' : '🗓 Week')  :
                                  (hi ? '🌙 माह'    : '🌙 Month')}
            </button>
          ))}
        </div>

        {/* Instruction */}
        <p style={{ ...s.instruction, color: T.text }}>
          {hi ? 'अपनी राशि चुनें 👇' : 'Tap your Rashi sign below 👇'}
        </p>

        {/* 12 Rashi Grid */}
        <div style={s.rashiGrid}>
          {RASHIS.map(rashi => {
            const selected = selectedRashi?.id === rashi.id;
            return (
              <div
                key={rashi.id}
                style={s.rashiCard(selected)}
                onClick={() => handleRashiClick(rashi)}
              >
                <span style={s.rashiEmoji}>{rashi.emoji}</span>
                <span style={s.rashiName(selected)}>
                  {hi ? rashi.hi : rashi.en}
                </span>
                <span style={s.rashiDates}>
                  {rashi.dates.split('–')[0].trim()}
                </span>
                <span style={s.rashiPlanet}>{rashi.planet}</span>
              </div>
            );
          })}
        </div>

        {/* Horoscope Result Card */}
        {selectedRashi && (
          <div style={s.horoCard}>

            {/* Selected rashi header */}
            <div style={s.horoHeader}>
              <span style={s.horoEmoji}>{selectedRashi.emoji}</span>
              <div>
                <p style={s.horoRashiName}>
                  {hi ? selectedRashi.hi : selectedRashi.en}
                </p>
                <p style={{ ...s.horoPeriod, color: T.text }}>
                  {period === 'daily'  ? (hi ? 'आज का राशिफल'     : "Today's reading")  :
                   period === 'weekly' ? (hi ? 'साप्ताहिक राशिफल' : 'Weekly reading')   :
                                          (hi ? 'मासिक राशिफल'     : 'Monthly reading')}
                </p>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={s.horoLoading}>
                <div style={s.spinner} />
                <span style={{ ...s.horoLoadingText, color: T.text }}>
                  {hi ? '✨ तारे बात कर रहे हैं...' : '✨ Reading the stars...'}
                </span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <p style={s.horoError}>{error}</p>
            )}

            {/* Result */}
            {!loading && !error && horoscope && (
              <div>
                {/* Meta chips */}
                <div style={s.horoMeta}>
                  <span style={s.metaChip}>{horoscope.mood} {hi ? 'ऊर्जा' : 'Energy'}</span>
                  <span style={s.metaChip}>🍀 {hi ? 'अंक' : 'Lucky'}: {horoscope.lucky}</span>
                  <span style={s.metaChip}>🎨 {horoscope.color}</span>
                  {horoscope.planet && (
                    <span style={s.metaChip}>🪐 {horoscope.planet}</span>
                  )}
                </div>

                {/* Prediction text */}
                <p style={s.horoText}>
                  {hi ? horoscope.hindi : horoscope.english}
                </p>

                {/* Show Hindi when in English mode */}
                {!hi && horoscope.hindi && (
                  <div style={s.hindiBox}>
                    <p style={s.hindiLabel}>हिंदी में</p>
                    <p style={s.hindiText}>{horoscope.hindi}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vedic note */}
        <p style={{ ...s.vedicNote, color: T.text }}>
          {hi
            ? '🙏 यह राशिफल वैदिक ज्योतिष पर आधारित है। सूर्य, चंद्र और ग्रहों की स्थिति के अनुसार।'
            : '🙏 Readings based on Vedic Jyotish — positions of Surya, Chandra & planetary transits.'}
        </p>

        {/* AI disclaimer */}
        <div style={s.disclaimerBox}>
          <p style={s.disclaimerTitle}>🤖 {hi ? 'AI द्वारा निर्मित' : 'AI Generated'}</p>
          <p style={s.disclaimerText}>
            {hi
              ? 'यह राशिफल कृत्रिम बुद्धिमत्ता (AI) द्वारा बनाया गया है। यह एक सामान्य राशिफल है। AI गलतियाँ कर सकता है। इसे मनोरंजन के रूप में लें, किसी महत्वपूर्ण निर्णय के लिए इस पर निर्भर न रहें।'
              : 'This horoscope is generated by Artificial Intelligence. It is a general reading and may be similar for everyone with the same sign. Please treat this as entertainment only — do not rely on it for important life decisions.'}
          </p>
        </div>

      </div>
    </div>
  );
}
