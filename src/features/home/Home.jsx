import React, { useState, useEffect } from 'react';
import { getReflection } from '../../utils/quoteEngine';

export function Home({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [quote] = useState(getReflection(lang));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const hours = new Date().getHours();
  const greeting = hi
    ? (hours < 12 ? "सुप्रभात" : hours < 17 ? "शुभ दोपहर" : "शुभ संध्या")
    : (hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening");

  // ─── STYLES (Rule of T) ───
  const s = {
    page: {
      position: "relative", height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", 
      background: T.bg, color: T.text, overflowX: "hidden", boxSizing: "border-box",
      padding: "8vh 24px 4vh", // Padding at top and bottom
    },

    topSection: {
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", width: "100%",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(42px, 12vw, 56px)",
      fontWeight: 600, margin: "0 0 16px", letterSpacing: "2px",
    },
    greeting: {
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: "clamp(18px, 5vw, 22px)", margin: "0 0 32px", opacity: 0.9,
    },
    quote: {
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: "clamp(16px, 4.5vw, 18px)", margin: "0", opacity: 0.75,
      maxWidth: "300px", lineHeight: 1.4,
    },

    // 🎈 THE INVISIBLE BALLOON (flex: 1)
    midSection: {
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      width: "100%", flex: 1, 
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
    },
    instruction: {
      fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600,
      letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.8,
      margin: "0 0 16px", textAlign: "center",
    },
    
    resetBtn: {
      width: "100%", maxWidth: "340px", padding: "20px 0",
      background: "linear-gradient(180deg, #f0f0f0 0%, #a0a0a0 100%)",
      border: "none", borderRadius: "12px", 
      color: "#111111", 
      fontFamily: "'DM Sans', sans-serif", fontSize: "18px",
      fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer",
      boxShadow: "0 0 30px rgba(255, 255, 255, 0.2)", 
      transition: "all 0.2s ease",
    },

    // 🧲 THE FLOOR MAGNET
    bottomContainer: {
      display: "flex", flexDirection: "column", alignItems: "center", 
      width: "100%", maxWidth: "340px",
    },

    bottomSection: {
      display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
      gap: "16px", opacity: visible ? 1 : 0,
      transition: "opacity 0.8s ease 0.4s",
    },
    
    sanctuaryBtn: {
      width: "100%", padding: "18px 0",
      background: "rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "12px", color: T.textSoft,
      fontFamily: "'DM Sans', sans-serif", fontSize: "15px", letterSpacing: "1px",
      textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    },
    row: { display: "flex", gap: "16px", width: "100%" },
    halfBtn: {
      flex: 1, padding: "18px 0",
      background: "rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "12px", color: T.textSoft,
      fontFamily: "'DM Sans', sans-serif", fontSize: "15px", letterSpacing: "1px",
      textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    },
    warmthBtn: {
      background: "none", border: "none", marginTop: "8px",
      color: T.textSoft, opacity: 0.6,
      fontFamily: "'DM Sans', sans-serif", fontSize: "13px", letterSpacing: "1px",
      textTransform: "uppercase", cursor: "pointer", transition: "opacity 0.2s ease",
    },

    footerWrap: {
      display: "flex", gap: "20px", opacity: visible ? 0.4 : 0,
      transition: "opacity 1s ease 0.6s", marginTop: "24px",
    },
    footerLink: {
      background: "none", border: "none", color: T.textSoft,
      fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
      letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer",
      textDecoration: "underline", textUnderlineOffset: "3px",
    }
  };

  return (
    <div style={s.page}>
      
      {/* 1. TOP */}
      <div style={s.topSection}>
        <h1 style={s.title}>JSukoon</h1>
        <p style={s.greeting}>{greeting}</p>
        <p style={s.quote}>"{quote}"</p>
      </div>

      {/* 2. MIDDLE */}
      <div style={s.midSection}>
        <p style={s.instruction}>
          {hi ? "आगे बढ़ने से पहले रीसेट करने के लिए एक पल लें" : "TAKE A MOMENT TO RESET BEFORE YOU CONTINUE"}
        </p>
        <button 
          onClick={() => setTab('reset')} 
          style={s.resetBtn}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 45px rgba(255, 255, 255, 0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 255, 255, 0.2)"}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {hi ? "90 सेकंड का रीसेट शुरू करें" : "START 90 SECOND RESET"}
        </button>
      </div>
      
      {/* 3. BOTTOM */}
      <div style={s.bottomContainer}>
        <div style={s.bottomSection}>
          <button onClick={() => setTab('bench')} style={s.sanctuaryBtn}>
            {hi ? "अभयारण्य में बैठें" : "SIT IN SANCTUARY"}
          </button>

          <div style={s.row}>
            <button onClick={() => setTab('sleep')} style={s.halfBtn}>
              {hi ? "नींद" : "SLEEP"}
            </button>
            <button onClick={() => setTab('more')} style={s.halfBtn}>
              {hi ? "खोजें" : "EXPLORE"}
            </button>
          </div>

          <button onClick={() => setTab('warmth')} style={s.warmthBtn}>
            {hi ? "गर्माहट भेजें" : "SEND WARMTH"}
          </button>
        </div>

        <div style={s.footerWrap}>
          <button onClick={() => setTab('privacy')} style={s.footerLink}>
            {hi ? "गोपनीयता" : "Privacy"}
          </button>
          <button onClick={() => setTab('legal')} style={s.footerLink}>
            {hi ? "कानूनी" : "Legal"}
          </button>
        </div>
      </div>

    </div>
  );
}