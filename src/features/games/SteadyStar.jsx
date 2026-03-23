import React, { useState, useEffect } from 'react';

export function SteadyStar({ setTab, T, lang }) {
  const [stillness, setStillness] = useState(0);
  const hi = lang === "Hindi";

  useEffect(() => {
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const movement = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z - 9.81);
      if (movement < 0.6) {
        setStillness(prev => Math.min(100, prev + 1));
      } else {
        setStillness(prev => Math.max(0, prev - movement * 3));
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const starSize = 2 + (stillness / 15);
  const starGlow = stillness > 30 ? (stillness - 30) * 1.5 : 0;

  const s = {
    page: {
      height: "100%", width: "100%", backgroundColor: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    },
    backWrap: { position: "absolute", top: 20, left: 20 },
    backBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" },
    star: {
      width: starSize, height: starSize, backgroundColor: "#fff",
      borderRadius: "50%",
      boxShadow: `0 0 ${starGlow}px #fff, 0 0 ${starGlow * 2}px rgba(255,255,255,0.6)`,
      transition: "all 0.1s ease",
    },
    label: {
      position: "absolute", bottom: "20%",
      color: "rgba(255,255,255,0.3)",
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 16, letterSpacing: 3, textTransform: "uppercase",
      opacity: stillness > 80 ? 1 : 0.4,
      transition: "opacity 1s ease",
    },
  };

  return (
    <div style={s.page}>
      <div style={s.backWrap}>
        <button onClick={() => setTab('stillness')} style={s.backBtn}>
          ← {hi ? "वापस" : "Back"}
        </button>
      </div>
      <div style={s.star} />
      <p style={s.label}>{hi ? "पूरी तरह स्थिर रहें" : "Be perfectly still"}</p>
    </div>
  );
}
