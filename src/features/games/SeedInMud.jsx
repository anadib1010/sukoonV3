import React, { useState } from 'react';

export function SeedInMud({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  const [growth, setGrowth] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [isRushing, setIsRushing] = useState(false);

  const PATIENCE_THRESHOLD_MS = 3000;

  const handleTap = () => {
    if (growth >= 100) return;
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;
    if (lastTapTime !== 0 && timeSinceLastTap < PATIENCE_THRESHOLD_MS) {
      setIsRushing(true);
      setGrowth((prev) => Math.max(0, prev - 5));
      setTimeout(() => setIsRushing(false), 1000);
    } else {
      setIsRushing(false);
      setGrowth((prev) => Math.min(100, prev + 15));
    }
    setLastTapTime(now);
  };

  let stageIcon = "🌱";
  let stageSize = `min(calc(40px + (100vw - 70px) * (${growth} / 100)), 400px)`;
  let stageGlow = `0 0 ${growth / 2}px rgba(100, 200, 150, 0.4)`;

  if (growth >= 100) {
    stageIcon = "🪷";
    stageGlow = "0 0 60px rgba(255, 150, 200, 0.8)";
    stageSize = `min(calc(100vw - 30px), 400px)`;
  } else if (growth > 60) {
    stageIcon = "🌿";
  } else if (growth === 0) {
    stageIcon = "🌰";
  }

  const bgDarkness = Math.max(10 - (growth * 0.05), 2);
  const backgroundColor = `hsl(30, 20%, ${bgDarkness}%)`;

  const s = {
    page: {
      height: "100%", width: "100%", backgroundColor,
      transition: "background-color 2s ease", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative",
      userSelect: "none", cursor: "pointer", overflow: "hidden",
    },
    backWrap: { position: "absolute", top: 20, left: 20, zIndex: 10 },
    backBtn: { background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14 },
    titleWrap: {
      position: "absolute", top: "20%", textAlign: "center",
      opacity: growth >= 100 ? 0 : 1, transition: "opacity 2s ease",
      pointerEvents: "none", padding: "0 20px",
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300,
      color: isRushing ? "#ff8888" : "rgba(255,255,255,0.8)",
      transition: "color 0.5s ease", margin: "0 0 10px 0",
    },
    subtitle: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "16px",
      color: "rgba(255,255,255,0.5)", fontStyle: "italic",
    },
    plant: {
      fontSize: stageSize, textShadow: stageGlow,
      transition: "all 1s cubic-bezier(0.25, 0.8, 0.25, 1)",
      transform: isRushing ? "scale(0.9) translateY(10px)" : "scale(1) translateY(0px)",
      pointerEvents: "none", lineHeight: 1,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    bloom: {
      position: "absolute", bottom: "15%",
      opacity: growth >= 100 ? 1 : 0, transition: "opacity 3s ease",
      pointerEvents: "none", textAlign: "center", padding: "0 20px",
    },
    bloomText: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "20px",
      color: "rgba(255, 200, 220, 0.9)", fontStyle: "italic",
    },
  };

  return (
    <div onClick={handleTap} style={s.page}>
      <div style={s.backWrap}>
        <button onClick={(e) => { e.stopPropagation(); setTab("resonance"); }} style={s.backBtn}>
          ← {isHindi ? "वापस" : "Back"}
        </button>
      </div>

      <div style={s.titleWrap}>
        <h2 style={s.title}>{isHindi ? "कीचड़ में बीज" : "Seed in the Mud"}</h2>
        <p style={s.subtitle}>
          {isRushing
            ? (isHindi ? "जल्दबाजी न करें। इसे समय दें।" : "Do not rush. Give it time.")
            : (isHindi ? "दिल की धड़कन की तरह, धीरे-धीरे टैप करें।" : "Tap slowly, like a resting heartbeat.")}
        </p>
      </div>

      <div style={s.plant}>{stageIcon}</div>

      <div style={s.bloom}>
        <p style={s.bloomText}>
          {isHindi ? "धैर्य से ही सुंदर चीजें बढ़ती हैं।" : "Beautiful things require patience."}
        </p>
      </div>
    </div>
  );
}
