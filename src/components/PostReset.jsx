import React, { useState, useEffect } from 'react';

export function PostReset({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);

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
    title: {
      fontSize: "clamp(32px, 8vw, 42px)",
      fontWeight: 300, fontStyle: "italic",
      marginBottom: 60, letterSpacing: "1px"
    },
    btnContainer: {
      display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 300
    },
    primaryBtn: {
      background: "transparent", border: `1px solid ${T.accent}`,
      borderRadius: 16, padding: "20px", color: T.text,
      fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
      letterSpacing: "1px", cursor: "pointer", transition: "all 0.3s"
    },
    secondaryBtn: {
      background: "transparent", border: "none", color: T.textSoft,
      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
      letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: "pointer", transition: "color 0.3s", padding: "10px",
      textDecoration: "underline", textUnderlineOffset: "4px"
    }
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>{hi ? "आइए इसे सरल रखें।" : "Let's keep it simple."}</h1>
      
      <div style={s.btnContainer}>
        <button 
          onClick={() => setTab('bench')} 
          style={s.primaryBtn}
          onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {hi ? "यहाँ थोड़ी देर और रुकें" : "Stay here a little longer"}
        </button>
        
        <button 
          onClick={() => setTab('home')} 
          style={s.secondaryBtn}
          onMouseEnter={e => e.currentTarget.style.color = T.text}
          onMouseLeave={e => e.currentTarget.style.color = T.textSoft}
        >
          {hi ? "अपने दिन के साथ आगे बढ़ें" : "Continue with your day"}
        </button>
      </div>
    </div>
  );
}