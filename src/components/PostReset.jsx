import React, { useState, useEffect } from 'react';
import { usePressable } from './SharedUI';

export function PostReset({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);
  const pressable = usePressable(0.97);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const s = {
    page: {
      height: "100dvh", width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: T.bg,
      color: T.text,
      fontFamily: "'Cormorant Garamond', serif",
      textAlign: "center", padding: 32, boxSizing: "border-box",
      opacity: visible ? 1 : 0,
      transition: "opacity 1.5s ease-in-out",
    },
    // FIX: acknowledgement line — warm, earned, before the choices
    acknowledgement: {
      fontSize: "clamp(14px, 3.5vw, 16px)",
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 400, letterSpacing: "1.5px",
      textTransform: "uppercase",
      opacity: 0.5, marginBottom: 16,
    },
    title: {
      fontSize: "clamp(32px, 8vw, 42px)",
      fontWeight: 300, fontStyle: "italic",
      marginBottom: 60, letterSpacing: "1px",
    },
    btnContainer: {
      display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 300,
    },
    primaryBtn: {
      background: "transparent", border: `1px solid ${T.accent}`,
      borderRadius: 16, padding: "20px",
      color: T.text,
      fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
      letterSpacing: "1px", cursor: "pointer", transition: "all 0.3s",
    },
    secondaryBtn: {
      background: "transparent", border: "none", color: T.textSoft,
      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
      letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: "pointer", transition: "color 0.3s", padding: "10px",
      textDecoration: "underline", textUnderlineOffset: "4px",
    },
    // FIX: gentle breadcrumb to deeper layers — doesn't push, just opens a door
    breadcrumb: {
      marginTop: 48,
      fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
      letterSpacing: "1.5px", textTransform: "uppercase",
      opacity: 0.35, cursor: "pointer", border: "none",
      background: "none", color: T.text, padding: "8px 0",
      transition: "opacity 0.3s",
    },
  };

  return (
    <div style={s.page}>
      {/* FIX: warm acknowledgement before presenting options */}
      <p style={s.acknowledgement}>
        {hi ? "आपने अभी खुद के लिए कुछ किया।" : "You did something for yourself just now."}
      </p>
      <h1 style={s.title}>{hi ? "बस सरल रहें।" : "Let's keep it simple."}</h1>

      <div style={s.btnContainer}>
        <button
          onClick={() => setTab('bench')}
          style={s.primaryBtn}
          onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          {...pressable}
        >
          {hi ? "यहाँ थोड़ी देर और रुकें" : "Stay here a little longer"}
        </button>

        <button
          onClick={() => setTab('home')}
          style={s.secondaryBtn}
          onMouseEnter={e => e.currentTarget.style.color = T.text}
          onMouseLeave={e => e.currentTarget.style.color = T.textSoft}
          {...pressable}
        >
          {hi ? "अपने दिन के साथ आगे बढ़ें" : "Continue with your day"}
        </button>
      </div>

      {/* FIX: soft breadcrumb — plants seed for deeper exploration, no pressure */}
      <button
        style={s.breadcrumb}
        onClick={() => setTab('more')}
        onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.35}
      >
        {hi ? "और भी है, जब आप तैयार हों →" : "There's more, when you're ready →"}
      </button>
    </div>
  );
}
