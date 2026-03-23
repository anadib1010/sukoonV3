import React, { useState, useEffect } from 'react';

const trueBlack = "#000000";
const dimAmber  = "rgba(184, 93, 25, 0.85)";

export function DimmingEmber({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [phase, setPhase] = useState("intro");
  const [breathState, setBreathState] = useState("inhale");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (phase !== "breathe") return;
    let timer;
    if (breathState === "inhale")  timer = setTimeout(() => setBreathState("hold"),   4000);
    if (breathState === "hold")    timer = setTimeout(() => setBreathState("exhale"),  7000);
    if (breathState === "exhale")  timer = setTimeout(() => { setCycle(c => c + 1); setBreathState("inhale"); }, 8000);
    return () => clearTimeout(timer);
  }, [breathState, phase]);

  const getInstruction = () => {
    if (breathState === "inhale") return hi ? "सांस लें (4)"  : "Inhale (4)";
    if (breathState === "hold")   return hi ? "रोकें (7)"     : "Hold (7)";
    if (breathState === "exhale") return hi ? "छोड़ें (8)"    : "Exhale (8)";
  };

  const emberOpacity = Math.max(0.1, 0.85 - (cycle * 0.1));

  const s = {
    page: {
      height: "100%", width: "100%", backgroundColor: trueBlack,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative",
    },
    backWrap: { position: "absolute", top: 20, left: 20 },
    backBtn: { background: "none", border: "none", color: dimAmber, opacity: 0.6, cursor: "pointer", fontSize: 16 },
    introWrap: { textAlign: "center", padding: 40 },
    introTitle: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber,
      marginBottom: 20, fontWeight: 300,
    },
    introBody: { color: dimAmber, opacity: 0.7, fontSize: 16, lineHeight: 1.6, marginBottom: 40 },
    beginBtn: {
      background: "transparent", border: `1px solid ${dimAmber}`,
      color: dimAmber, padding: "12px 40px", borderRadius: 30,
      fontSize: 16, cursor: "pointer", opacity: 0.8,
    },
    breathWrap: { display: "flex", flexDirection: "column", alignItems: "center" },
    ember: {
      width: 100, height: 100, borderRadius: "50%",
      backgroundColor: dimAmber, opacity: emberOpacity,
      boxShadow: `0 0 40px 10px rgba(184, 93, 25, ${emberOpacity * 0.5})`,
      transform: (breathState === "inhale" || breathState === "hold") ? "scale(1.5)" : "scale(0.8)",
      transition: breathState === "inhale" ? "transform 4s ease-out"
        : breathState === "hold" ? "transform 7s linear"
        : "transform 8s ease-in-out",
      marginBottom: 60,
    },
    instruction: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 24,
      color: dimAmber, letterSpacing: 2, transition: "opacity 0.5s",
    },
    disclaimer: {
      position: "absolute", bottom: 20, width: "100%", textAlign: "center",
      opacity: 0.6, fontSize: "11px", color: dimAmber,
    },
  };

  return (
    <div style={s.page}>
      <div style={s.backWrap}>
        <button onClick={() => setTab("sleep")} style={s.backBtn}>
          ← {hi ? "वापस" : "Back"}
        </button>
      </div>

      {phase === "intro" ? (
        <div style={s.introWrap}>
          <h2 style={s.introTitle}>{hi ? "बुझता हुआ अंगारा" : "Dimming Ember"}</h2>
          <p style={s.introBody}>
            {hi
              ? "4-7-8 श्वास अभ्यास। अंगारे की चमक के साथ सांस लें। जैसे-जैसे आप शांत होंगे, यह बुझता जाएगा।"
              : "The 4-7-8 breathing technique. Breathe with the glow. As you calm down, the ember will slowly fade to black."}
          </p>
          <button onClick={() => setPhase("breathe")} style={s.beginBtn}>
            {hi ? "शुरू करें" : "BEGIN"}
          </button>
        </div>
      ) : (
        <div style={s.breathWrap}>
          <div style={s.ember} />
          <p style={s.instruction}>{getInstruction()}</p>
        </div>
      )}

      <div style={s.disclaimer}>
        {hi
          ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।"
          : "This is a simple app and not a medical or psychological advice app."}
      </div>
    </div>
  );
}
