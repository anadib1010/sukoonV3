import React, { useState, useEffect, useRef } from 'react';
import { TwoChartRow } from './VedicCharts';

const API = 'https://jsukoon-api.duckdns.org/horoscope';

const TOPICS = [
  { id: 'career',       en: 'Career & Work',      hi: 'करियर और काम',     emoji: '💼', house: '10th' },
  { id: 'relationship', en: 'Love & Relations',   hi: 'प्रेम और रिश्ते',  emoji: '💕', house: '7th'  },
  { id: 'health',       en: 'Health & Body',       hi: 'स्वास्थ्य',        emoji: '🌿', house: '1st/6th' },
  { id: 'finance',      en: 'Money & Finance',     hi: 'धन और वित्त',      emoji: '💰', house: '2nd/11th' },
  { id: 'travel',       en: 'Travel & Move',       hi: 'यात्रा',           emoji: '✈️', house: '9th/12th' },
  { id: 'general',      en: 'General Question',    hi: 'सामान्य प्रश्न',   emoji: '🔮', house: 'all'  },
];

const STEPS = ['topic', 'question', 'reading'];

export function Horary({ setTab, T, lang }) {
  const hi = lang === 'Hindi';
  const [step,        setStep]        = useState('topic');
  const [topic,       setTopic]       = useState(null);
  const [question,    setQuestion]    = useState('');
  const [city,        setCity]        = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [coords,      setCoords]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [reading,     setReading]     = useState(null);
  const [error,       setError]       = useState('');
  const [visible,     setVisible]     = useState(false);
  const [chartStyle,  setChartStyle]  = useState('north');
  const cityTimer = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // City autocomplete
  const handleCityInput = (val) => {
    setCity(val);
    setCoords(null);
    clearTimeout(cityTimer.current);
    if (val.length < 2) { setCityOptions([]); return; }
    cityTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&featuretype=city`);
        const d = await r.json();
        setCityOptions(d.map(p => ({ label: p.display_name.split(',').slice(0,2).join(','), lat: +p.lat, lon: +p.lon })));
      } catch (_) {}
    }, 400);
  };

  const selectCity = (opt) => {
    setCity(opt.label);
    setCoords({ lat: opt.lat, lon: opt.lon });
    setCityOptions([]);
  };

  const askQuestion = async () => {
    if (!topic)   { setError(hi ? 'विषय चुनें' : 'Please select a topic'); return; }
    if (!coords)  { setError(hi ? 'शहर चुनें सूची से' : 'Please select a city from the list'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/horary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic:    topic.id,
          question: question.trim(),
          lat:      coords.lat,
          lon:      coords.lon,
          language: hi ? 'Hindi' : 'English',
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Reading failed');
      setReading(data.reading);
      setStep('reading');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const reset = () => {
    setStep('topic'); setTopic(null); setQuestion('');
    setCity(''); setCoords(null); setReading(null); setError('');
  };

  // ── Styles ──────────────────────────────────────────────
  const PURPLE = '#9B59B6';
  const s = {
    page: {
      minHeight: '100dvh', background: T.bg, color: T.text,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    },
    scroll: {
      flex: 1, overflowY: 'auto', padding: '0 0 40px',
    },
    header: {
      padding: '16px 20px 12px',
      display: 'flex', alignItems: 'center', gap: '12px',
      borderBottom: `1px solid ${PURPLE}20`,
    },
    backBtn: {
      background: 'none', border: 'none', color: PURPLE,
      fontSize: '20px', cursor: 'pointer', padding: '4px',
    },
    headerTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px', fontWeight: 600, color: T.text,
      margin: 0, letterSpacing: '1px',
    },
    hero: {
      textAlign: 'center', padding: '28px 24px 20px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    },
    heroEmoji: { fontSize: '48px', display: 'block', marginBottom: '12px' },
    heroTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 'clamp(24px, 6vw, 30px)', fontWeight: 300,
      fontStyle: 'italic', color: T.text, margin: '0 0 8px',
      letterSpacing: '0.5px',
    },
    heroSub: {
      fontSize: '12px', color: PURPLE, opacity: 0.7,
      letterSpacing: '1px', margin: 0, textTransform: 'uppercase',
    },
    section: { padding: '0 20px 20px' },
    label: {
      fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
      color: PURPLE, opacity: 0.8, marginBottom: '12px', display: 'block',
    },
    topicGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
      marginBottom: '24px',
    },
    topicCard: (selected) => ({
      padding: '16px 12px', borderRadius: '14px', cursor: 'pointer',
      border: `1px solid ${selected ? PURPLE : PURPLE + '30'}`,
      background: selected ? `${PURPLE}15` : 'transparent',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      transition: 'all 0.2s ease',
    }),
    topicEmoji: { fontSize: '24px', lineHeight: 1 },
    topicLabel: (selected) => ({
      fontSize: '12px', fontWeight: selected ? 700 : 500,
      color: selected ? PURPLE : T.text, textAlign: 'center',
      opacity: selected ? 1 : 0.7,
    }),
    input: {
      width: '100%', padding: '13px 16px', borderRadius: '12px',
      border: `1px solid ${PURPLE}30`, background: T.bg,
      color: T.text, fontSize: '14px', outline: 'none',
      fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
      marginBottom: '8px',
    },
    textarea: {
      width: '100%', padding: '13px 16px', borderRadius: '12px',
      border: `1px solid ${PURPLE}30`, background: T.bg,
      color: T.text, fontSize: '14px', outline: 'none', resize: 'none',
      fontFamily: "'Cormorant Garamond', serif", fontSize: '16px',
      fontStyle: 'italic', boxSizing: 'border-box', lineHeight: 1.6,
      minHeight: '100px', marginBottom: '8px',
    },
    dropdown: {
      position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 100,
      background: T.bg, border: `1px solid ${PURPLE}30`,
      borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
    dropItem: {
      padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
      borderBottom: `1px solid ${PURPLE}15`,
      transition: 'background 0.15s',
    },
    hint: {
      fontSize: '11px', color: PURPLE, opacity: 0.6,
      letterSpacing: '0.5px', marginBottom: '20px', display: 'block',
    },
    askBtn: {
      width: '100%', padding: '16px', borderRadius: '14px',
      border: 'none', background: loading ? `${PURPLE}80` : PURPLE,
      color: '#fff', fontSize: '15px', fontWeight: 700,
      letterSpacing: '1.5px', cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.3s ease',
      opacity: loading ? 0.8 : 1,
    },
    error: {
      background: '#FF6B6B15', border: '1px solid #FF6B6B40',
      borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
      fontSize: '13px', color: '#FF6B6B',
    },
    readingCard: {
      margin: '0 20px 16px', padding: '20px',
      background: `${PURPLE}08`, border: `1px solid ${PURPLE}20`,
      borderRadius: '16px',
    },
    readingMeta: {
      display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px',
    },
    metaPill: (color) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
      fontWeight: 700, letterSpacing: '0.5px',
      background: `${color}15`, color: color,
      border: `1px solid ${color}30`,
    }),
    readingText: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '17px', lineHeight: 1.8, color: T.text,
      whiteSpace: 'pre-wrap',
    },
    chartInfo: {
      margin: '0 20px 20px', padding: '14px 16px',
      background: `${PURPLE}06`, border: `1px solid ${PURPLE}15`,
      borderRadius: '12px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
    },
    chartInfoItem: {
      fontSize: '11px', color: T.text, opacity: 0.6, letterSpacing: '0.3px',
    },
    resetBtn: {
      width: 'calc(100% - 40px)', margin: '0 20px', padding: '14px',
      borderRadius: '12px', border: `1px solid ${PURPLE}40`,
      background: 'transparent', color: PURPLE, fontSize: '13px',
      fontWeight: 700, letterSpacing: '1px', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    disclaimer: {
      textAlign: 'center', fontSize: '11px', opacity: 0.4,
      padding: '16px 24px 0', lineHeight: 1.6,
    },
    loadingWrap: {
      textAlign: 'center', padding: '40px 24px',
    },
    loadingOrb: {
      width: '60px', height: '60px', borderRadius: '50%',
      background: `radial-gradient(circle, ${PURPLE}40, transparent)`,
      margin: '0 auto 20px',
      animation: 'horaryPulse 1.5s ease-in-out infinite',
    },
    loadingText: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '18px', fontStyle: 'italic', color: PURPLE,
      opacity: 0.8,
    },
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{`
        @keyframes horaryPulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.2); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setTab('home')}>←</button>
        <p style={s.headerTitle}>
          {hi ? 'प्रश्न कुंडली' : 'Prashna · Ask A Question'}
        </p>
      </div>

      <div style={s.scroll}>
        {/* ── LOADING ── */}
        {loading && (
          <div style={s.loadingWrap}>
            <div style={s.loadingOrb} />
            <p style={s.loadingText}>
              {hi ? 'तारे आपका उत्तर ढूंढ रहे हैं…' : 'The stars are consulting…'}
            </p>
          </div>
        )}

        {/* ── TOPIC SELECTION ── */}
        {!loading && step === 'topic' && (
          <>
            <div style={s.hero}>
              <span style={s.heroEmoji}>🪬</span>
              <p style={s.heroTitle}>
                {hi ? 'क्या जानना चाहते हैं?' : 'What do you seek to know?'}
              </p>
              <p style={s.heroSub}>
                {hi ? 'प्रश्न ज्योतिष · इस क्षण का सत्य' : 'Prashna Jyotish · Truth of this moment'}
              </p>
            </div>

            <div style={s.section}>
              <span style={s.label}>{hi ? 'विषय चुनें' : 'Choose your topic'}</span>
              <div style={s.topicGrid}>
                {TOPICS.map(t => (
                  <div key={t.id}
                    style={s.topicCard(topic?.id === t.id)}
                    onClick={() => setTopic(t)}>
                    <span style={s.topicEmoji}>{t.emoji}</span>
                    <span style={s.topicLabel(topic?.id === t.id)}>
                      {hi ? t.hi : t.en}
                    </span>
                  </div>
                ))}
              </div>

              {error && <div style={s.error}>{error}</div>}

              <button
                style={s.askBtn}
                disabled={!topic}
                onClick={() => topic && setStep('question')}
              >
                {hi ? 'आगे बढ़ें →' : 'CONTINUE →'}
              </button>
            </div>
          </>
        )}

        {/* ── QUESTION + CITY ── */}
        {!loading && step === 'question' && (
          <>
            <div style={{ ...s.hero, paddingBottom: '12px' }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>
                {topic.emoji}
              </span>
              <p style={{ ...s.heroTitle, fontSize: '20px' }}>
                {hi ? topic.hi : topic.en}
              </p>
            </div>

            <div style={s.section}>
              <span style={s.label}>{hi ? 'आपका प्रश्न' : 'Your question'}</span>
              <textarea
                style={s.textarea}
                placeholder={hi
                  ? 'अपना प्रश्न यहाँ लिखें… (वैकल्पिक)'
                  : 'Write your question here… (optional)'}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={3}
              />
              <span style={s.hint}>
                {hi
                  ? 'प्रश्न जितना स्पष्ट, उत्तर उतना सटीक'
                  : 'The clearer the question, the more precise the answer'}
              </span>

              <span style={s.label}>{hi ? 'आप अभी कहाँ हैं?' : 'Where are you right now?'}</span>
              <div style={{ position: 'relative', marginBottom: '4px' }}>
                <input
                  style={s.input}
                  placeholder={hi ? 'शहर का नाम लिखें…' : 'Type your current city…'}
                  value={city}
                  onChange={e => handleCityInput(e.target.value)}
                />
                {cityOptions.length > 0 && (
                  <div style={s.dropdown}>
                    {cityOptions.map((opt, i) => (
                      <div key={i} style={s.dropItem}
                        onClick={() => selectCity(opt)}
                        onMouseEnter={e => e.currentTarget.style.background = `${PURPLE}15`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        📍 {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span style={s.hint}>
                {coords
                  ? `✓ ${hi ? 'स्थान चुना गया' : 'Location selected'}`
                  : (hi ? 'सूची से शहर चुनें' : 'Select from the dropdown list')}
              </span>

              {error && <div style={s.error}>{error}</div>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={{ ...s.askBtn, flex: 1, background: 'transparent', color: PURPLE, border: `1px solid ${PURPLE}40` }}
                  onClick={() => setStep('topic')}
                >
                  ←
                </button>
                <button
                  style={{ ...s.askBtn, flex: 4 }}
                  disabled={!coords}
                  onClick={askQuestion}
                >
                  {hi ? '🪬 उत्तर पाएं' : '🪬 GET ANSWER'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── READING ── */}
        {!loading && step === 'reading' && reading && (
          <>
            <div style={{ ...s.hero, paddingBottom: '16px' }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>
                {topic.emoji}
              </span>
              <p style={{ ...s.heroTitle, fontSize: '18px' }}>
                {hi ? 'आपका प्रश्न उत्तर' : 'Your Prashna Reading'}
              </p>
              <p style={s.heroSub}>
                {hi ? 'इस क्षण के ग्रहों के अनुसार' : 'Based on planets at the moment of asking'}
              </p>
            </div>

            {/* Charts: D1 + D9 side by side */}
            {reading.prashna_chart && (
              <div style={{ padding: '0 20px 4px' }}>
                <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'12px' }}>
                  {['north','south'].map(v => (
                    <button key={v} onClick={() => setChartStyle(v)}
                      style={{ padding:'4px 14px', borderRadius:'20px', border:`1px solid ${PURPLE}${chartStyle===v?'':'30'}`, background: chartStyle===v ? PURPLE : 'transparent', color: chartStyle===v ? '#fff' : PURPLE, fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                      {v === 'north' ? (hi ? 'उत्तर' : 'North') : (hi ? 'दक्षिण' : 'South')}
                    </button>
                  ))}
                </div>
                <TwoChartRow
                  chart={reading.prashna_chart}
                  navamsa={reading.navamsa_chart}
                  style={chartStyle}
                  hi={hi}
                />
              </div>
            )}

            {/* Chart snapshot */}
            {reading.chart_snapshot && (
              <div style={s.chartInfo}>
                {[
                  ['Lagna', reading.chart_snapshot.ascendant],
                  ['Moon', reading.chart_snapshot.moon],
                  ['Lagna Lord', reading.chart_snapshot.lagna_lord],
                  ['Moon Nakshatra', reading.chart_snapshot.moon_nakshatra],
                ].map(([k, v]) => v && (
                  <div key={k} style={s.chartInfoItem}>
                    <strong style={{ color: PURPLE }}>{k}:</strong> {v}
                  </div>
                ))}
              </div>
            )}

            {/* Reading */}
            <div style={s.readingCard}>
              <div style={s.readingMeta}>
                <span style={s.metaPill(PURPLE)}>
                  {hi ? topic.hi : topic.en}
                </span>
                {reading.void_of_course && (
                  <span style={s.metaPill('#FF6B6B')}>
                    {hi ? 'चंद्र शून्य' : 'Void of Course Moon'}
                  </span>
                )}
                {reading.outcome && (
                  <span style={s.metaPill(reading.outcome === 'favourable' ? '#4A9B6F' : reading.outcome === 'unfavourable' ? '#FF6B6B' : '#C17B2B')}>
                    {reading.outcome === 'favourable'
                      ? (hi ? 'अनुकूल' : 'Favourable')
                      : reading.outcome === 'unfavourable'
                      ? (hi ? 'प्रतिकूल' : 'Unfavourable')
                      : (hi ? 'मिश्रित' : 'Mixed')}
                  </span>
                )}
              </div>
              <p style={s.readingText}>{reading.text}</p>
            </div>

            <button style={s.resetBtn} onClick={reset}>
              {hi ? '↩ नया प्रश्न पूछें' : '↩ Ask Another Question'}
            </button>

            <p style={s.disclaimer}>
              {hi
                ? 'प्रश्न ज्योतिष आध्यात्मिक मार्गदर्शन के लिए है। पेशेवर सलाह का विकल्प नहीं।'
                : 'Prashna Jyotish is for spiritual guidance only, not a substitute for professional advice.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
