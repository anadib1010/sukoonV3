import React, { useState, useEffect } from 'react';

const PROMPTS = [
  { en: "A heavy stone",         hi: "एक भारी पत्थर" },
  { en: "Soft moss",             hi: "मुलायम काई" },
  { en: "A drifting cloud",      hi: "उड़ता हुआ बादल" },
  { en: "A warm cup",            hi: "एक गर्म प्याला" },
  { en: "Quiet rain",            hi: "शांत बारिश" },
  { en: "A deep forest",         hi: "एक घना जंगल" },
  { en: "A sleeping cat",        hi: "एक सोती हुई बिल्ली" },
  { en: "A wooden boat",         hi: "एक लकड़ी की नाव" },
  { en: "Fallen leaves",         hi: "गिरे हुए पत्ते" },
  { en: "A smooth river pebble", hi: "नदी का एक चिकना कंकड़" },
];

// Sleep screens intentionally stay true-black regardless of theme
const trueBlack = "#000000";
const dimAmber  = "rgba(184, 93, 25, 0.8)";

export function DreamScrambler({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(Math.floor(Math.random() * PROMPTS.length));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const s = {
    page: {
      height: "100%", width: "100%", backgroundColor: trueBlack,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    },
    backWrap: { position: "absolute", top: 20, left: 20 },
    backBtn: { background: "none", border: "none", color: dimAmber, opacity: 0.6, cursor: "pointer", fontSize: 16 },
    content: { textAlign: "center", padding: "0 40px" },
    prompt: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: dimAmber,
      opacity: 0.7, marginBottom: 40, letterSpacing: 1,
    },
    word: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: dimAmber,
      fontWeight: 300, margin: 0, animation: "scrambleFade 8s ease-in-out infinite",
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

      <div style={s.content}>
        <p style={s.prompt}>
          {hi ? "इस छवि की कल्पना करें। फिर इसे जाने दें।" : "Picture this image. Then let it go."}
        </p>
        <h2 key={index} style={s.word}>
          {hi ? PROMPTS[index].hi : PROMPTS[index].en}
        </h2>
      </div>

      <div style={s.disclaimer}>
        {hi
          ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।"
          : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes scrambleFade {
          0%   { opacity: 0; filter: blur(4px); transform: scale(0.95); }
          30%  { opacity: 1; filter: blur(0px); transform: scale(1); }
          70%  { opacity: 1; filter: blur(0px); transform: scale(1); }
          100% { opacity: 0; filter: blur(4px); transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
