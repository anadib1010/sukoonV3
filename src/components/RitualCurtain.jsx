import React, { useState, useEffect } from 'react';

export function RitualCurtain({ T, onDone }) {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 3100);
    const t3 = setTimeout(() => setPhase(3), 6100);
    const t4 = setTimeout(() => { setVisible(false); setTimeout(onDone, 400); }, 9000);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [onDone]);

  if (!visible) return null;

  const s = {
    page: {
      position: "fixed", inset: 0, zIndex: 99999, background: "#050505",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: phase >= 3 ? "curtainFade 2s ease forwards" : "none",
    },
    phase1: {
      position: "absolute", textAlign: "center", padding: "0 30px",
      opacity: phase === 1 ? 1 : 0, transition: "opacity 1.5s ease",
    },
    phase1Title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300,
      color: "#e0e0e0", letterSpacing: 4, marginBottom: 16,
    },
    phase1Sub: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 14,
      color: "rgba(255,255,255,0.4)", letterSpacing: 2,
    },
    phase2: {
      position: "absolute", display: "flex", flexDirection: "column", alignItems: "center",
      opacity: phase === 2 ? 1 : 0, transition: "opacity 1.5s ease",
    },
    orb: {
      width: 70, height: 70, borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent)",
      animation: "orbFloat 5s ease-in-out infinite", marginBottom: 28,
    },
    phase2Text: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300,
      letterSpacing: 3, color: "#e0e0e0", textAlign: "center",
    },
    phase2Sub: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
      color: "rgba(255,255,255,0.4)", letterSpacing: 2,
      marginTop: 12, textTransform: "uppercase",
    },
    phase3: {
      position: "absolute", textAlign: "center",
      opacity: phase === 3 ? 1 : 0, transition: "opacity 1.5s ease",
    },
    phase3Text: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: 300,
      color: "#e0e0e0", letterSpacing: 5, textTransform: "uppercase",
    },
    skipBtn: {
      position: "absolute", bottom: 90, background: "none", border: "none",
      color: "rgba(255,255,255,0.35)", fontSize: 13, letterSpacing: 2,
      cursor: "pointer", padding: "10px 20px",
    },
  };

  return (
    <div style={s.page}>
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", top: `${10 + i * 8}%`, left: `${5 + i * 10}%`,
          width: i % 3 === 0 ? 2 : 1.5, height: i % 3 === 0 ? 2 : 1.5,
          borderRadius: "50%", background: "#ffffff",
          animation: `twinkle ${3 + i * .6}s infinite alternate ease-in-out`,
          animationDelay: `${i * .35}s`, opacity: .4,
        }} />
      ))}

      <div style={s.phase1}>
        <p style={s.phase1Title}>You have arrived.</p>
        <p style={s.phase1Sub}>Nothing is required here.</p>
      </div>

      <div style={s.phase2}>
        <div style={s.orb} />
        <p style={s.phase2Text}>Take one slow breath.</p>
        <p style={s.phase2Sub}>INHALE 4 · HOLD 2 · EXHALE 6</p>
      </div>

      <div style={s.phase3}>
        <p style={s.phase3Text}>Enter JSukoon Sanctuary</p>
      </div>

      <button onClick={() => { setVisible(false); setTimeout(onDone, 400); }} style={s.skipBtn}>
        (skip)
      </button>
    </div>
  );
}
