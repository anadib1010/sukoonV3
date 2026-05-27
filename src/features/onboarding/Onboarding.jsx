import React, { useState, useEffect } from 'react';
import { Privacy } from '../privacy/Privacy';
import { Terms } from '../privacy/Terms';

export function Onboarding({ onComplete, setThemeKey, setLang, T, lang = 'English' }) {
  const [visible,   setVisible]   = useState(false);
  const [leaving,   setLeaving]   = useState(false);
  const [legalView, setLegalView] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (legalView) return;
    const prev = document.body.style.background;
    document.body.style.background = '#050505';
    return () => { document.body.style.background = prev; };
  }, [legalView]);

  const handleLanguage = (chosenLang) => {
    if (leaving) return;
    setLeaving(true);
    if (setLang) setLang(chosenLang);
    if (setThemeKey) setThemeKey('Void');
    try { localStorage.setItem('onboarded', 'true'); } catch (_) {}
    setTimeout(() => onComplete('horoscope'), 600);
  };

  // ── Legal overlays ────────────────────────────────────────
  if (legalView === 'terms') {
    return (
      <div style={st.legalOverlay}>
        <div style={{ ...st.legalFrame, background: T.bg }}>
          <Terms goBack={() => setLegalView(null)} T={T} lang={lang} setTab={() => {}} />
        </div>
      </div>
    );
  }
  if (legalView === 'privacy') {
    return (
      <div style={st.legalOverlay}>
        <div style={{ ...st.legalFrame, background: T.bg }}>
          <Privacy goBack={() => setLegalView(null)} T={T} lang={lang} setTab={() => {}} />
        </div>
      </div>
    );
  }

  // ── Main screen ───────────────────────────────────────────
  return (
    <div style={{
      ...st.page,
      opacity:   visible && !leaving ? 1 : 0,
      transform: leaving ? 'scale(1.04)' : 'scale(1)',
    }}>
      <style>{`
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1;   }
        }
        .lang-btn:active { transform: scale(0.96) !important; }
      `}</style>

      {/* ── Stars / ambient dots ── */}
      <div style={st.stars} aria-hidden>
        {DOTS.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: d.s, height: d.s,
            top: d.t, left: d.l,
            background: d.c,
            animation: `shimmer ${d.dur}s ${d.delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* ── Branding ── */}
      <div style={st.brand} aria-label="J Su Kun">
        <p style={st.appName}>J Su Kun</p>
        <p style={st.tagline}>आपकी अपनी जगह · Your own space</p>
      </div>

      {/* ── Central glow orb ── */}
      <div style={st.orb} aria-hidden />

      {/* ── Language prompt ── */}
      <div style={st.prompt}>
        <p style={st.promptLine1}>Choose your language</p>
        <p style={st.promptLine2}>अपनी भाषा चुनें</p>
      </div>

      {/* ── Language buttons ── */}
      <div style={st.btnRow}>
        <button
          className="lang-btn"
          onClick={() => handleLanguage('English')}
          style={{ ...st.btn, ...st.btnEn }}
        >
          <span style={st.btnEmoji}>🇬🇧</span>
          <span style={st.btnLabel}>English</span>
          <span style={st.btnSub}>Continue in English</span>
        </button>

        <button
          className="lang-btn"
          onClick={() => handleLanguage('Hindi')}
          style={{ ...st.btn, ...st.btnHi }}
        >
          <span style={st.btnEmoji}>🇮🇳</span>
          <span style={st.btnLabel}>हिंदी</span>
          <span style={st.btnSub}>हिंदी में जारी रखें</span>
        </button>
      </div>

      {/* ── Legal ── */}
      <div style={st.legal}>
        <p style={st.legalText}>
          By continuing you agree to our{' '}
          <span style={st.legalLink} onClick={() => setLegalView('terms')}>Terms</span>
          {' & '}
          <span style={st.legalLink} onClick={() => setLegalView('privacy')}>Privacy Policy</span>
          {'. '}
          <span style={{ whiteSpace: 'nowrap' }}>J Su Kun</span> is a self-help tool, not a medical service.
        </p>
      </div>
    </div>
  );
}

// ── Ambient dots data ────────────────────────────────────────
const DOTS = [
  { s:'2px', t:'12%', l:'18%', c:'#9B59B6', dur:3.2, delay:0   },
  { s:'3px', t:'22%', l:'75%', c:'#C17B2B', dur:4.1, delay:0.5 },
  { s:'2px', t:'60%', l:'8%',  c:'#FF6B9D', dur:2.8, delay:1   },
  { s:'2px', t:'75%', l:'88%', c:'#9B59B6', dur:3.7, delay:0.2 },
  { s:'3px', t:'40%', l:'92%', c:'#5D93C4', dur:4.5, delay:1.5 },
  { s:'2px', t:'85%', l:'30%', c:'#7B9075', dur:3.0, delay:0.8 },
  { s:'2px', t:'10%', l:'55%', c:'#C17B2B', dur:5.0, delay:2.0 },
  { s:'3px', t:'50%', l:'48%', c:'#9B59B6', dur:3.5, delay:0.3 },
];

// ── Styles ───────────────────────────────────────────────────
const st = {
  page: {
    position: 'fixed', inset: 0, zIndex: 99998,
    background: '#050505',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '24px 24px 20px',
    boxSizing: 'border-box',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
    overflowY: 'auto',
    gap: '0px',
  },
  stars: {
    position: 'absolute', inset: 0,
    pointerEvents: 'none', overflow: 'hidden',
  },
  brand: {
    textAlign: 'center', marginBottom: '32px',
    animation: 'floatUp 0.9s 0.1s both ease-out',
  },
  appName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(32px, 8vw, 42px)',
    fontWeight: 300, letterSpacing: '6px',
    color: 'rgba(255,255,255,0.88)',
    margin: '0 0 8px',
  },
  tagline: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.28)',
    margin: 0, textTransform: 'uppercase',
  },
  orb: {
    width: '180px', height: '180px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #9B59B620 0%, #C17B2B10 50%, transparent 70%)',
    filter: 'blur(30px)',
    marginBottom: '32px',
    animation: 'floatUp 1s 0.3s both ease-out',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  prompt: {
    textAlign: 'center', marginBottom: '28px',
    animation: 'floatUp 0.9s 0.4s both ease-out',
  },
  promptLine1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(20px, 5vw, 24px)',
    fontWeight: 300, fontStyle: 'italic',
    color: 'rgba(255,255,255,0.75)',
    margin: '0 0 6px', letterSpacing: '0.5px',
  },
  promptLine2: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(16px, 4vw, 19px)',
    fontWeight: 300, fontStyle: 'italic',
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
  },
  btnRow: {
    display: 'flex', gap: '14px',
    width: '100%', maxWidth: '420px',
    marginBottom: '32px',
    animation: 'floatUp 0.9s 0.55s both ease-out',
  },
  btn: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px',
    padding: '22px 16px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  btnEn: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: '1px solid rgba(93,147,196,0.4)',
    boxShadow: '0 4px 24px rgba(93,147,196,0.15)',
  },
  btnHi: {
    background: 'linear-gradient(135deg, #1a1208, #2a1f0a)',
    border: '1px solid rgba(193,123,43,0.4)',
    boxShadow: '0 4px 24px rgba(193,123,43,0.15)',
  },
  btnEmoji: {
    fontSize: '28px', lineHeight: 1,
  },
  btnLabel: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '22px', fontWeight: 500,
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: '1px',
  },
  btnSub: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px', letterSpacing: '0.5px',
    color: 'rgba(255,255,255,0.35)',
  },
  legal: {
    animation: 'floatUp 0.9s 0.7s both ease-out',
    maxWidth: '340px', textAlign: 'center',
  },
  legalText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', lineHeight: 1.7,
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  legalLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  legalOverlay: {
    position: 'fixed', inset: 0, zIndex: 99999,
    background: '#080808',
    display: 'flex', justifyContent: 'center',
  },
  legalFrame: {
    width: '100%', maxWidth: '600px', height: '100%',
    position: 'relative',
  },
};
