import React, { useState, useEffect } from 'react';
import { getReflection } from '../../utils/quoteEngine';
import { usePressable } from '../../components/SharedUI';

export function Home({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [quote] = useState(getReflection(lang));
  const [visible, setVisible] = useState(false);
  const pressable = usePressable(0.97);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const hours = new Date().getHours();
  const greeting = hi
    ? (hours < 12 ? "सुप्रभात" : hours < 17 ? "शुभ दोपहर" : "शुभ संध्या")
    : (hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening");

  // ─── THE RULE OF T: EVERY LINE RESTORED ───
  const s = {
    page: {
      position: "relative", height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", background: T.bg, color: T.text, overflowX: "hidden", 
      boxSizing: "border-box", padding: "1vh 24px 4vh",
    },
    topSection: {
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", width: "100%",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", 
      // 👇 Reduced from 48px/64px to 32px/42px 👇
      fontSize: "clamp(32px, 8vw, 42px)", 
      fontWeight: 600, 
      margin: "0 0 4px", 
      letterSpacing: "3px",
    },
    subTitle: {
      fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 500,
      letterSpacing: "4px", textTransform: "uppercase", opacity: 0.6,
      margin: "0 0 30px",
    },
    greeting: {
      fontFamily: "'DM Sans', sans-serif", fontSize: "12px", letterSpacing: "2px",
      textTransform: "uppercase", margin: "0 0 16px", opacity: 0.5,
    },
    quote: {
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: "clamp(22px, 4vw, 22px)", margin: "0", opacity: 0.9,
      maxWidth: "340px", lineHeight: 1.3, fontWeight: 300,
    },
    midSection: {
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      width: "100%", flex: 1,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
    },
    instruction: {
      fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 600,
      letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7,
      margin: "0 0 16px", textAlign: "center",
    },

    // 💖 K-HUB BUTTON (RESTORED & IMPROVED)
    kUniverseBtn: {
      width: "100%", 
      maxWidth: "340px", 
      padding: "22px 0",      // 👈 Taller than the others
      marginBottom: "16px",   // 👈 More space below it
      background: `linear-gradient(135deg, ${T.bg} 0%, #FF69B425 50%, ${T.bg} 100%)`,
      border: `2px solid #FF69B460`, // 👈 Thicker 2px border
      borderRadius: "14px",   // 👈 Slightly rounder for a premium feel
      color: "#FF69B4", 
      fontFamily: "'DM Sans', sans-serif", 
      fontWeight: 800,        // 👈 Extra Bold text
      fontSize: "16px",       // 👈 Larger text
      letterSpacing: "2.5px", 
      cursor: "pointer",
      transition: "all 0.3s ease",
      animation: "kpopSuperPulse 3s ease-in-out infinite", // 👈 Using our new Super Pulse
    },

    // 🔮 HOROSCOPE BUTTON (Vedic cosmic purple)
    horoscopeBtn: {
      width: "100%", maxWidth: "340px", padding: "18px 0", marginBottom: "24px",
      background: `linear-gradient(135deg, ${T.bg} 0%, #9B59B620 50%, ${T.bg} 100%)`,
      border: `1px solid #9B59B660`, borderRadius: "12px",
      color: "#9B59B6", // Cosmic Purple
      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
      fontSize: "14px", letterSpacing: "2px", cursor: "pointer",
      boxShadow: `0 8px 16px rgba(0, 0, 0, 0.3), 0 0 12px #9B59B630`,
      transition: "all 0.3s ease",
    },

    buttonBase: {
      background: `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}30 50%, ${T.bg} 100%)`,
      border: `1px solid ${T.accent}40`,
      borderRadius: "12px", color: T.text,
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer",
      boxShadow: `0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px ${T.accent}30`,
      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
    resetBtn: {
      width: "100%", maxWidth: "340px", 
      // 👇 CHANGE THESE TWO LINES TO MATCH 18px and 14px 👇
      padding: "18px 0",
      fontSize: "14px", 
      letterSpacing: "2px",
      marginBottom: "2px",
    },
    bottomContainer: {
      display: "flex", flexDirection: "column", alignItems: "center",
      width: "100%", maxWidth: "340px",
    },
    bottomSection: {
      display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
      gap: "16px", opacity: visible ? 1 : 0,
      transition: "opacity 0.8s ease 0.4s",
    },
    row: { display: "flex", gap: "12px", width: "100%" },
    glassBtn: {
      flex: 1, padding: "18px 0", fontSize: "14px", letterSpacing: "1.5px",
      textTransform: "uppercase",
    },
    chatBtn: {
      width: "calc(50% - 6px)", padding: "18px 0", backgroundColor: "transparent",
      color: T.text, border: `1px solid ${T.accent}50`, borderRadius: "12px",
      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
      fontWeight: 600, letterSpacing: "1.5px",
      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      transform: "translateY(0px)",
      boxShadow: `0 8px 16px rgba(0, 0, 0, 0.3), 0 0 10px ${T.accent}20`,
    },
    footerWrap: {
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "8px", opacity: visible ? 0.6 : 0,
      transition: "opacity 1s ease 0.6s", marginTop: "24px",
    },
    footerLinks: { display: "flex", gap: "24px" },
    footerLink: {
      background: "none", border: "none", color: T.textSoft,
      fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
      letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer",
      padding: "8px 12px",
    },
    disclaimer: {
      fontFamily: "'DM Sans', sans-serif", fontSize: "11px",  // slightly larger
      color: T.textSoft,  // use a muted token, not full opacity reduction
      opacity: 0.7,       // readable — WCAG recommends min 4.5:1 contrast ratio
      letterSpacing: "0.5px",
      textAlign: "center", maxWidth: "340px", margin: 0,
  },
  };

  const handleHover = (e, isEnter) => {
    if (isEnter) {
      e.currentTarget.style.background = `linear-gradient(135deg, ${T.accent}15 0%, ${T.accent}50 50%, ${T.accent}15 100%)`;
      e.currentTarget.style.border = `1px solid ${T.accent}80`;
      e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,0.5), 0 0 25px ${T.accent}60`;
    } else {
      e.currentTarget.style.background = `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}30 50%, ${T.bg} 100%)`;
      e.currentTarget.style.border = `1px solid ${T.accent}40`;
      e.currentTarget.style.boxShadow = `0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px ${T.accent}30`;
    }
  };

  return (
    <div style={s.page}>
      {/* 🌟 UPGRADED: Neon Pulse Animation */}
      <style>{`
        @keyframes kpopSuperPulse {
          0%, 100% { 
            transform: translateY(0px); 
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 12px #FF69B430;
            border-color: #FF69B460;
          }
          50% { 
            transform: translateY(-4px); 
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 25px #FF69B480;
            border-color: #FF69B4; 
          }
        }
      `}</style>
      {/* 👆 ------------------- 👆 */}

      {/* 1. TOP SECTION */}
      <div style={s.topSection}>
        <h1 style={s.title}>J Su Kun</h1>
        <p style={s.subTitle}>{hi ? "स्पष्ट दिमाग। फिर आगे।" : "CLEAR HEAD. THEN CONTINUE."}</p>
        <p style={s.greeting}>{greeting}</p>
        <p style={s.quote}>"{quote}"</p>
      </div>

      {/* 2. MIDDLE SECTION */}
      <div style={s.midSection}>

        {/* 💖 THE K-HUB PORTAL (Top) */}
        <button
          {...pressable}
          onClick={() => setTab('khub')}
          style={s.kUniverseBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, #FF69B415 0%, #FF69B450 50%, #FF69B415 100%)`;
            e.currentTarget.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.4), 0 0 18px #FF69B440`;
            // Removed manual transform so the breathing animation stays perfectly smooth!
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${T.bg} 0%, #FF69B420 50%, ${T.bg} 100%)`;
            e.currentTarget.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.3), 0 0 12px #FF69B430`;
            // Removed manual transform
          }}
        >
          {hi ? "के-पॉप और के-ड्रामा हब" : "K-POP & K-DRAMA HUB"}
        </button>

        {/* 🔮 THE HOROSCOPE PORTAL — Vedic reading via Gemini AI */}
        <button
          {...pressable}
          onClick={() => setTab('horoscope')}
          style={s.horoscopeBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, #9B59B615 0%, #9B59B650 50%, #9B59B615 100%)`;
            e.currentTarget.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.4), 0 0 18px #9B59B640`;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${T.bg} 0%, #9B59B620 50%, ${T.bg} 100%)`;
            e.currentTarget.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.3), 0 0 12px #9B59B630`;
            e.currentTarget.style.transform = "translateY(0px)";
          }}
        >
          🔮 {hi ? "आज का राशिफल" : "DAILY HOROSCOPE"}
        </button>

        <p style={s.instruction}>
          {hi ? "एक मिनट। साफ़ दिमाग।" : "ONE MINUTE. CLEAR HEAD."}
        </p>

        <button
          {...pressable}
          onClick={() => setTab('reset')}
          style={{ ...s.buttonBase, ...s.resetBtn }}
          onMouseEnter={(e) => handleHover(e, true)}
          onMouseLeave={(e) => handleHover(e, false)}
        >
          {hi
            ? <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-मिनट का रीसेट लें</>
            : <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-MINUTE RESET</>}
        </button>
      </div>

      {/* 3. BOTTOM SECTION */}
      <div style={s.bottomContainer}>
        <div style={s.bottomSection}>
          <div style={s.row}>
            <button
              {...pressable}
              onClick={() => setTab('sleep')}
              style={{ ...s.buttonBase, ...s.glassBtn, opacity: 0.7 }}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              {hi ? "नींद" : "SLEEP"}
            </button>
            <button
              {...pressable}
              onClick={() => setTab('more')}
              style={{ ...s.buttonBase, ...s.glassBtn }}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              {hi ? "खोजें" : "EXPLORE"}
            </button>
          </div>
          
          <button
            {...pressable}
            onClick={() => setTab('chat')}
            style={s.chatBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${T.accent}20`;
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.4), 0 0 18px ${T.accent}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.3), 0 0 10px ${T.accent}20`;
            }}
          >
            {hi ? "टीम चैट" : "TEAM CHAT"}
          </button>
        </div>

        {/* 4. FOOTER (Every line restored) */}
        <div style={s.footerWrap}>
          <div style={s.footerLinks}>
            <button onClick={() => setTab('terms')} style={s.footerLink}>
              {hi ? "सेवा की शर्तें" : "Terms"}
            </button>
            <button onClick={() => setTab('privacy')} style={s.footerLink}>
              {hi ? "गोपनीयता" : "Privacy"}
            </button>
            <button onClick={() => setTab('legal')} style={s.footerLink}>
              {hi ? "कानूनी" : "Legal Disclaimer"}
            </button>
          </div>
          <p style={s.disclaimer}>
            {hi
              ? "यह एक सरल निर्देशित अनुभव है, चिकित्सा सलाह नहीं।"
              : "A simple guided experience, not medical advice."}
          </p>
        </div>
      </div>
    </div>
  );
}