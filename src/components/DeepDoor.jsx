import React, { useState, useEffect } from 'react';

// ─── THE TRANSITION DOOR ──────────────────────────────────────────────
// Appears when user taps "There is a quieter place" in ExploreMore.
// Three warm lines → Enter button → Vault (The Quieter Place)
// No skip, no auto-advance, no mystery. Just a gentle breath before
// stepping deeper.

export function DeepDoor({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [phase, setPhase] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [showBtn, setShowBtn] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 60);
    return () => clearTimeout(t);
  }, []);

  // Three lines appear one by one, then Enter button
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 3400);
    const t3 = setTimeout(() => setPhase(3), 6400);
    const t4 = setTimeout(() => setShowBtn(true), 9000);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const handleEnter = () => {
    setOpacity(0);
    setTimeout(() => setTab('vault'), 1000);
  };

  const s = {
    page: {
      position: "fixed", inset: 0, zIndex: 99990,
      background: T.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 40px", boxSizing: "border-box",
      opacity, transition: "opacity 1.2s ease-in-out",
      textAlign: "center",
    },
    line: (visible) => ({
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(26px, 7vw, 34px)",
      fontWeight: 300, fontStyle: "italic",
      color: T.text, letterSpacing: "1px",
      lineHeight: 1.5, margin: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 1s ease, transform 1s ease",
      position: "absolute",
    }),
    enterBtn: {
      position: "absolute",
      bottom: "15%",
      background: "transparent",
      border: `1px solid ${T.accent}60`,
      borderRadius: 99,
      color: T.text,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13, letterSpacing: "3px",
      textTransform: "uppercase",
      padding: "14px 40px",
      cursor: "pointer",
      opacity: showBtn ? 0.85 : 0,
      transform: showBtn ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 1s ease 0.3s, transform 1s ease 0.3s",
    },
    dots: {
      position: "absolute", bottom: "60px",
      display: "flex", gap: 8, alignItems: "center",
      opacity: showBtn ? 0 : 1,
      transition: "opacity 0.5s ease",
    },
    dot: (active) => ({
      width: active ? 6 : 4,
      height: active ? 6 : 4,
      borderRadius: "50%",
      background: T.accent,
      opacity: active ? 0.7 : 0.2,
      transition: "all 0.6s ease",
    }),
  };

  return (
    <div style={s.page}>

      <p style={s.line(phase === 1)}>
        {hi ? "यहाँ कोई जल्दी नहीं है।" : "There's no hurry here."}
      </p>

      <p style={s.line(phase === 2)}>
        {hi ? "यह जगह आपके लिए है।" : "This place is yours."}
      </p>

      <p style={s.line(phase === 3)}>
        {hi ? "जब तैयार हों, अंदर आएं।" : "Enter when you're ready."}
      </p>

      <button style={s.enterBtn} onClick={handleEnter}>
        {hi ? "प्रवेश करें" : "Enter"}
      </button>

      <div style={s.dots}>
        <div style={s.dot(phase === 1)} />
        <div style={s.dot(phase === 2)} />
        <div style={s.dot(phase === 3)} />
      </div>

    </div>
  );
}
