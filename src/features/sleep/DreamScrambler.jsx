import React, { useState, useEffect } from 'react';

const PROMPTS = [
  { en: "A heavy stone", hi: "एक भारी पत्थर" },
  { en: "Soft moss", hi: "मुलायम काई" },
  { en: "A drifting cloud", hi: "उड़ता हुआ बादल" },
  { en: "A warm cup", hi: "एक गर्म प्याला" },
  { en: "Quiet rain", hi: "शांत बारिश" },
  { en: "A deep forest", hi: "एक घना जंगल" },
  { en: "A sleeping cat", hi: "एक सोती हुई बिल्ली" },
  { en: "A wooden boat", hi: "एक लकड़ी की नाव" },
  { en: "Fallen leaves", hi: "गिरे हुए पत्ते" },
  { en: "A smooth river pebble", hi: "नदी का एक चिकना कंकड़" }
];

export function DreamScrambler({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [index, setIndex] = useState(0);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.7)";

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(Math.floor(Math.random() * PROMPTS.length));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '0 40px' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: dimAmber, opacity: 0.4, marginBottom: 40, letterSpacing: 1 }}>
          {hi ? "इस छवि की कल्पना करें। फिर इसे जाने दें।" : "Picture this image. Then let it go."}
        </p>
        
        <h2 
          key={index} 
          style={{ 
            fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: dimAmber, 
            fontWeight: 300, margin: 0,
            animation: 'scrambleFade 8s ease-in-out infinite'
          }}
        >
          {hi ? PROMPTS[index].hi : PROMPTS[index].en}
        </h2>
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.6, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes scrambleFade {
          0% { opacity: 0; filter: blur(4px); transform: scale(0.95); }
          30% { opacity: 1; filter: blur(0px); transform: scale(1); }
          70% { opacity: 1; filter: blur(0px); transform: scale(1); }
          100% { opacity: 0; filter: blur(4px); transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}