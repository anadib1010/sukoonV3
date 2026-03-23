import React, { useState, useEffect } from 'react';

export function DeepDoor({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [opacity, setOpacity] = useState(0);
  const [line1, setLine1] = useState(false);
  const [line2, setLine2] = useState(false);
  const [line3, setLine3] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  // Page fades in, then lines stagger in quickly, then button appears
  useEffect(() => {
    const t0 = setTimeout(() => setOpacity(1),   60);
    const t1 = setTimeout(() => setLine1(true),  300);
    const t2 = setTimeout(() => setLine2(true),  700);
    const t3 = setTimeout(() => setLine3(true),  1100);
    const t4 = setTimeout(() => setShowBtn(true), 1600);
    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const handleEnter = () => {
    setOpacity(0);
    setTimeout(() => setTab('vault'), 800);
  };

  const s = {
    page: {
      position: "fixed", inset: 0, zIndex: 99990,
      background: T.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 40px", boxSizing: "border-box",
      textAlign: "center",
      opacity, transition: "opacity 0.8s ease-in-out",
    },
    linesWrap: {
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 20, marginBottom: 56,
    },
    line: (visible) => ({
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(24px, 6.5vw, 32px)",
      fontWeight: 300, fontStyle: "italic",
      color: T.text, letterSpacing: "1px",
      lineHeight: 1.5, margin: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    }),
    enterBtn: {
      background: "transparent",
      border: `1px solid ${T.accent}60`,
      borderRadius: 99,
      color: T.text,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13, letterSpacing: "3px",
      textTransform: "uppercase",
      padding: "14px 48px",
      cursor: "pointer",
      opacity: showBtn ? 0.9 : 0,
      transform: showBtn ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
    },
  };

  return (
    <div style={s.page}>
      <div style={s.linesWrap}>
        <p style={s.line(line1)}>
          {hi ? "यहाँ कोई जल्दी नहीं है।" : "There's no hurry here."}
        </p>
        <p style={s.line(line2)}>
          {hi ? "यह जगह आपके लिए है।" : "This place is yours."}
        </p>
        <p style={s.line(line3)}>
          {hi ? "जब तैयार हों, अंदर आएं।" : "Enter when you're ready."}
        </p>
      </div>

      <button style={s.enterBtn} onClick={handleEnter}>
        {hi ? "प्रवेश करें" : "Enter"}
      </button>
    </div>
  );
}
