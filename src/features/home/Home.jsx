import React, { useRef, useState, useEffect } from 'react';
import { getReflection } from '../../utils/quoteEngine';

export function Home({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const pressTimer = useRef(null);
  const [quote] = useState(getReflection());
  const [visible, setVisible] = useState(false);

  // Staggered entrance — triggers after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setTab('vault'), 1500);
  };
  const handlePressEnd = () => clearTimeout(pressTimer.current);

  const hours = new Date().getHours();
  const greeting = hi
    ? (hours < 12 ? "सुप्रभात" : hours < 17 ? "शुभ दोपहर" : "शुभ संध्या")
    : (hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening");

  // ─── STYLES ───
  const s = {
    page: {
      position: "relative",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      background: T.bg,
      overflowX: "hidden",
      boxSizing: "border-box",
    },

    // Ambient glow behind title — responds to theme accent
    ambientGlow: {
      position: "absolute",
      top: "6vh",
      left: "50%",
      transform: "translateX(-50%)",
      width: "280px",
      height: "280px",
      borderRadius: "50%",
      background: `radial-gradient(circle, ${T.accent}18 0%, transparent 70%)`,
      pointerEvents: "none",
      zIndex: 0,
      transition: "background 0.8s ease",
    },

    header: {
      padding: "6vh 0 2vh",
      textAlign: "center",
      width: "100%",
      boxSizing: "border-box",
      position: "relative",
      zIndex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    },

    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(40px, 10vw, 56px)",
      color: T.text,
      fontWeight: 300,
      margin: "0 0 2px",
      letterSpacing: "4px",
      lineHeight: 1,
      userSelect: "none",
      cursor: "default",
    },

    subtitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(12px, 3vw, 15px)",
      color: T.textSoft,
      margin: "4px 0 0",
      opacity: 0.5,
      letterSpacing: "1px",
      fontStyle: "italic",
    },

    divider: {
      width: "24px",
      height: "1px",
      background: T.accent,
      margin: "12px auto",
      opacity: 0.4,
    },

    greeting: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(14px, 3.5vw, 18px)",
      color: T.textSoft,
      letterSpacing: "2px",
      textTransform: "uppercase",
      margin: 0,
      opacity: 0.85,
      fontWeight: 300,
    },

    quoteBox: {
      marginTop: "20px",
      padding: "0 40px",
    },

    quote: {
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
      fontSize: "18px",
      opacity: 0.7,
      color: T.accent,
      lineHeight: 1.4,
      margin: 0,
    },

    gridWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      padding: "0 20px",
      boxSizing: "border-box",
      position: "relative",
      zIndex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      gap: "12px",
      width: "100%",
      maxWidth: "380px",
      boxSizing: "border-box",
    },

    // Base glass card — used for all 4 buttons
    card: {
      background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      backdropFilter: "blur(25px)",
      WebkitBackdropFilter: "blur(25px)",
      border: `1px solid ${T.accent}25`,
      borderRadius: "32px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: "1 / 1",
      cursor: "pointer",
      transition: "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      padding: "16px",
      boxShadow: `0 10px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)`,
      textAlign: "center",
      boxSizing: "border-box",
      width: "100%",
      minWidth: 0,
    },

    emoji: {
      fontSize: "clamp(22px, 6vw, 28px)",
      marginBottom: "6px",
      opacity: 0.9,
    },

    cardTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(14px, 3.5vw, 18px)",
      fontWeight: 500,
      marginBottom: "4px",
      letterSpacing: "0.4px",
      lineHeight: 1.2,
      wordBreak: "break-word",
    },

    cardSub: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(11px, 2.5vw, 13px)",
      opacity: 0.72,
      lineHeight: 1.3,
      letterSpacing: "0.5px",
      fontWeight: 400,
      marginTop: "2px",
      fontStyle: "italic",
      wordBreak: "break-word",
    },

    footer: {
      padding: "4vh 20px",
      textAlign: "center",
      width: "100%",
      boxSizing: "border-box",
      position: "relative",
      zIndex: 1,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.7s ease 0.4s",
    },

    footerText: {
      margin: 0,
      fontSize: "12px",
      color: T.muted,
      opacity: 0.6,
      lineHeight: 1.4,
      fontFamily: "'Cormorant Garamond', serif",
      letterSpacing: "0.5px",
    },

    legalBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      margin: 0,
      color: T.textSoft,
      textDecoration: "underline",
      fontSize: "inherit",
      fontFamily: "inherit",
    },

    // Invisible sleep gateway — intentionally opacity 0.05
    sleepGateway: {
      position: "absolute",
      bottom: 24,
      left: 24,
      background: "transparent",
      border: "none",
      color: T.text,
      opacity: 0.9, // raised for testing — lower to 0.05 before public launch
      fontSize: 13,
      fontFamily: "'Cormorant Garamond', serif",
      display: "flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      zIndex: 10,
    },
  };

  // Hover handlers — subtle lift and border glow
  const onCardEnter = (e, accentColor) => {
    e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
    e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px ${accentColor}40, inset 0 1px 0 rgba(255,255,255,0.1)`;
    e.currentTarget.style.border = `1px solid ${accentColor}50`;
  };
  const onCardLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)`;
    e.currentTarget.style.border = `1px solid ${T.accent}25`;
  };

  return (
    <div style={s.page}>

      {/* Ambient theme glow */}
      <div style={s.ambientGlow} />

      {/* ─── HEADER ─── */}
      <div style={s.header}>
        <h1
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          style={s.title}
        >
          JSukoon
        </h1>

        <p style={s.subtitle}>Discover Stillness</p>

        <div style={s.divider} />

        <p style={s.greeting}>{greeting}</p>

        <div style={s.quoteBox}>
          <p style={s.quote}>"{quote}"</p>
        </div>
      </div>

      {/* ─── 2×2 GRID ─── */}
      <div style={s.gridWrapper}>
        <div style={s.grid}>

          <button
            onClick={() => { sessionStorage.setItem("jsukoon_context", "racing"); setTab("practice"); }}
            style={s.card}
            onMouseEnter={(e) => onCardEnter(e, "#a090d0")}
            onMouseLeave={onCardLeave}
            onTouchStart={(e) => onCardEnter(e, "#a090d0")}
            onTouchEnd={onCardLeave}
          >
            <span style={s.emoji}>🌀</span>
            <span style={{ ...s.cardTitle, color: "#a090d0" }}>
              {hi ? "दौड़ते विचार" : "Racing Thoughts"}
            </span>
            <span style={{ ...s.cardSub, color: "#a090d0" }}>
              {hi ? "सांस लें और वापस आएं" : "Breathe & Return"}
            </span>
          </button>

          <button
            onClick={() => setTab("bench")}
            style={s.card}
            onMouseEnter={(e) => onCardEnter(e, T.accent)}
            onMouseLeave={onCardLeave}
            onTouchStart={(e) => onCardEnter(e, T.accent)}
            onTouchEnd={onCardLeave}
          >
            <span style={s.emoji}>🌿</span>
            <span style={{ ...s.cardTitle, color: T.text }}>
              {hi ? "अभयारण्य" : "Sanctuary"}
            </span>
            <span style={{ ...s.cardSub, color: T.textSoft }}>
              {hi ? "शांति और सुकून" : "Quiet & Calm"}
            </span>
          </button>

          <button
            onClick={() => setTab("warmth")}
            style={s.card}
            onMouseEnter={(e) => onCardEnter(e, "#C88A8E")}
            onMouseLeave={onCardLeave}
            onTouchStart={(e) => onCardEnter(e, "#C88A8E")}
            onTouchEnd={onCardLeave}
          >
            <span style={s.emoji}>❤️</span>
            <span style={{ ...s.cardTitle, color: "#C88A8E" }}>
              {hi ? "गर्माहट भेजें" : "Send Warmth"}
            </span>
            <span style={{ ...s.cardSub, color: "#C88A8E" }}>
              {hi ? "दयालुता साझा करें" : "Share Kindness"}
            </span>
          </button>

          <button
            onClick={() => setTab("more")}
            style={s.card}
            onMouseEnter={(e) => onCardEnter(e, T.accent)}
            onMouseLeave={onCardLeave}
            onTouchStart={(e) => onCardEnter(e, T.accent)}
            onTouchEnd={onCardLeave}
          >
            <span style={s.emoji}>✨</span>
            <span style={{ ...s.cardTitle, color: T.accent }}>
              {hi ? "और खोजें" : "Explore More"}
            </span>
            <span style={{ ...s.cardSub, color: T.textSoft }}>
              {hi ? "उपकरण और अभ्यास" : "Tools & Practice"}
            </span>
          </button>

        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div style={s.footer}>
        <p style={s.footerText}>
          <button onClick={() => setTab("legal")} style={s.legalBtn}>
            {hi ? "कानूनी अस्वीकरण" : "Legal Disclaimer"}
          </button>
          {" - "}
          {hi
            ? "यह कोई चिकित्सा या मनोवैज्ञानिक सहायता ऐप नहीं है।"
            : "This is not a medical or psychological help app."}
        </p>
      </div>

      {/* ─── INVISIBLE SLEEP GATEWAY ─── */}
      <button onClick={() => setTab("sleep")} style={s.sleepGateway}>
        <span>🌙</span> {hi ? "नींद" : "Sleep"}
      </button>

    </div>
  );
}
