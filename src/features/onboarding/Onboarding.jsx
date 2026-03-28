import React, { useState, useEffect, useRef } from 'react';
import { Privacy } from '../privacy/Privacy';
import { Terms } from '../privacy/Terms';

export function Onboarding({ onComplete, setThemeKey, setLang, T }) {
  const [visible, setVisible]     = useState(false);
  const [handLeft, setHandLeft]   = useState(true); // true = left hand showing
  const [handOpacity, setHandOpacity] = useState(1);
  const [legalView, setLegalView] = useState(null); // 'terms' | 'privacy' | null
  const hasSpoken = useRef(false);

  useEffect(() => {
    setLang("English");
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (legalView) return; // Don't force black background if viewing legal pages
    const prev = document.body.style.background;
    document.body.style.background = "#050505";
    return () => { document.body.style.background = prev; };
  }, [legalView]);

  // Speak "Use your other hand" once on load
  useEffect(() => {
    if (!visible || hasSpoken.current || legalView) return;
    hasSpoken.current = true;
    const t = setTimeout(() => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("Use your other hand");
      u.rate   = 0.85;   
      u.pitch  = 0.9;    
      u.volume = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
      );
      if (preferred) u.voice = preferred;
      window.speechSynthesis.speak(u);
    }, 800);
    return () => clearTimeout(t);
  }, [visible, legalView]);

  // Alternating hands
  useEffect(() => {
    if (legalView) return;
    const interval = setInterval(() => {
      setHandOpacity(0);
      setTimeout(() => {
        setHandLeft(prev => !prev);
        setHandOpacity(1);
      }, 500); 
    }, 1800);
    return () => clearInterval(interval);
  }, [legalView]);

  const handleStart = () => {
    window.speechSynthesis?.cancel();
    if (setThemeKey) setThemeKey("Void");
    document.body.style.background = "#050505";
    onComplete('reset');
  };

  const LeftHand = () => (
    <svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="32" width="40" height="28" rx="8" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="4" y="38" width="10" height="18" rx="5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="14" y="12" width="9" height="22" rx="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="25" y="8" width="9" height="26" rx="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="36" y="10" width="9" height="24" rx="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="47" y="16" width="7" height="18" rx="3.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
    </svg>
  );

  const RightHand = () => (
    <svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform:"scaleX(-1)"}}>
      <rect x="12" y="32" width="40" height="28" rx="8" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="4" y="38" width="10" height="18" rx="5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="14" y="12" width="9" height="22" rx="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="25" y="8" width="9" height="26" rx="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="36" y="10" width="9" height="24" rx="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="47" y="16" width="7" height="18" rx="3.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
    </svg>
  );

  const st = {
    page: {
      position: "fixed", inset: 0, zIndex: 99998,
      background: "#050505",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px", boxSizing: "border-box",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.8s ease",
      gap: 0,
    },
    topSection: {
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 16,
      marginBottom: 52,
    },
    otherHandLabel: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(13px, 3.5vw, 16px)",
      fontWeight: 300, letterSpacing: "3px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.5)",
      margin: 0,
    },
    handsWrap: {
      display: "flex", alignItems: "center",
      justifyContent: "center", gap: 24,
      height: 72,
    },
    handWrap: {
      opacity: handOpacity,
      transition: "opacity 0.5s ease",
    },
    middleSection: {
      display: "flex", flexDirection: "column",
      alignItems: "center", width: "100%", maxWidth: 360, gap: 12,
    },
    headline: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(26px, 7vw, 32px)",
      fontWeight: 300, fontStyle: "italic",
      color: "rgba(255,255,255,0.88)",
      letterSpacing: "1px", lineHeight: 1.4,
      margin: "0 0 24px",
      textAlign: "center",
    },
    btn: {
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "16px",
      padding: "24px 20px",
      width: "100%",
      color: "#ffffff",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "clamp(16px, 4.5vw, 20px)",
      fontWeight: 700, letterSpacing: "1.5px",
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    },
    disclaimer: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "11px",
      color: "rgba(255,255,255,0.3)",
      letterSpacing: "0.5px",
      margin: 0, textAlign: "center",
    },
    bottomSection: {
      position: "absolute",
      bottom: 24, 
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 6,
      width: "100%",
      padding: "0 24px",
      boxSizing: "border-box",
    },
    vibrationDot: {
      width: 6, height: 6, borderRadius: "50%",
      background: "rgba(255,255,255,0.25)",
      animation: "vibrPulse 1.4s ease-in-out infinite",
    },
    vibrationText: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "11px", letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.35)",
      margin: 0,
    },
    legalText: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "9px",
      color: "rgba(255,255,255,0.35)",
      textAlign: "center",
      maxWidth: "340px",
      lineHeight: 1.5,
      margin: "12px 0 0 0",
    }
  };

  // 🌟 Render Legal Screens if selected
  if (legalView === 'terms') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: T.bg }}>
        <Terms goBack={() => setLegalView(null)} T={T} lang="English" setTab={() => {}} />
      </div>
    );
  }

  if (legalView === 'privacy') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: T.bg }}>
        <Privacy goBack={() => setLegalView(null)} T={T} lang="English" setTab={() => {}} />
      </div>
    );
  }

  return (
    <div style={st.page}>
      <style>{`
        @keyframes vibrPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50%       { transform: scale(1.6); opacity: 0.6; }
        }
      `}</style>

      {/* TOP — Use your other hand + alternating hands */}
      <div style={st.topSection}>
        <p style={st.otherHandLabel}>Use your other hand</p>
        <div style={st.handsWrap}>
          <div style={st.handWrap}>
            {handLeft ? <LeftHand /> : <RightHand />}
          </div>
        </div>
      </div>

      {/* MIDDLE — hero */}
      <div style={st.middleSection}>
        <p style={st.headline}>Before your next move…</p>
        <button
          style={st.btn}
          onClick={handleStart}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          onTouchStart={e => e.currentTarget.style.transform = "scale(0.97)"}
          onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-MINUTE RESET</>
        </button>
        <p style={st.disclaimer}>A simple guided experience, not medical advice.</p>
      </div>

      {/* BOTTOM — vibration nudge & Legal Text */}
      <div style={st.bottomSection}>
        <div style={st.vibrationDot} />
        <p style={st.vibrationText}>Turn on vibration mode</p>
        
        {/* 🌟 New Clickable Legal Disclaimer */}
        <p style={st.legalText}>
          By continuing, you agree to the{" "}
          <span 
            onClick={(e) => { e.stopPropagation(); setLegalView('terms'); }} 
            style={{ textDecoration: "underline", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}
          >
            Terms of Service
          </span>{" "}
          and{" "}
          <span 
            onClick={(e) => { e.stopPropagation(); setLegalView('privacy'); }} 
            style={{ textDecoration: "underline", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}
          >
            Privacy Policy
          </span>{" "}
          and understand that JSukoon is a self-help tool and not a medical or professional service.
        </p>
      </div>

    </div>
  );
}