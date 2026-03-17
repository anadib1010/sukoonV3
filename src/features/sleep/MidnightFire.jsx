import React, { useState } from 'react';

export function MidnightFire({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [thought, setThought] = useState("");
  const [isBurning, setIsBurning] = useState(false);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";
  const faintBorder = "rgba(184, 93, 25, 0.25)";

  const handleBurn = () => {
    if (!thought.trim()) return;
    setIsBurning(true);
    setTimeout(() => {
      setThought("");
      setIsBurning(false);
    }, 6000); 
  };

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      <div style={{ width: '85%', maxWidth: 400, textAlign: 'center' }}>
        {!isBurning ? (
          <div style={{ animation: 'fadeIn 2s ease' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 16 }}>
              {hi ? "आधी रात की आग" : "Midnight Fire"}
            </h2>
            <p style={{ color: dimAmber, opacity: 0.9, fontSize: 18, lineHeight: 1.6, marginBottom: 30, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              {hi 
                ? "जो विचार आपको जगाए हुए हैं, उन्हें यहां रखें। फिर उन्हें अंधेरे में जलने दें।" 
                : "Leave the thoughts keeping you awake here. Then let them burn away in the dark."}
            </p>

            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder={hi ? "मुझे चिंता है..." : "I am holding onto..."}
              style={{
                width: '100%', height: '120px', backgroundColor: 'transparent',
                border: `1px solid ${faintBorder}`, borderRadius: '12px',
                color: dimAmber, padding: '16px', fontSize: '16px',
                fontFamily: 'inherit', resize: 'none', outline: 'none',
                opacity: 0.8
              }}
            />

            <button 
              onClick={handleBurn}
              style={{
                marginTop: 24, background: 'transparent', border: `1px solid ${dimAmber}`,
                color: dimAmber, padding: '10px 40px', borderRadius: 30,
                fontSize: 16, cursor: 'pointer', letterSpacing: 2, opacity: thought ? 1 : 0.3,
                transition: 'opacity 0.3s'
              }}
            >
              {hi ? "छोड़ दें" : "RELEASE"}
            </button>
          </div>
        ) : (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: dimAmber,
            animation: 'burnAway 6s forwards', lineHeight: 1.5, wordWrap: 'break-word'
          }}>
            {thought}
          </p>
        )}
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.6, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes burnAway {
          0% { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); color: ${dimAmber}; }
          20% { opacity: 0.8; filter: blur(2px); color: #ff3300; }
          60% { opacity: 0.3; filter: blur(8px); transform: translateY(-20px) scale(1.05); color: #4a1c0b; }
          100% { opacity: 0; filter: blur(12px); transform: translateY(-40px) scale(1.1); color: #000000; }
        }
      `}</style>
    </div>
  );
}