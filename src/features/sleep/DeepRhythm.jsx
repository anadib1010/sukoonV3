import React, { useState } from 'react';

export function DeepRhythm({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [isPlaying, setIsPlaying] = useState(false);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      <div style={{ textAlign: 'center', zIndex: 2 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 16 }}>
          {hi ? "गहरी लय" : "Deep Rhythm"}
        </h2>
        <p style={{ color: dimAmber, opacity: 0.5, fontSize: 16, marginBottom: 60, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", padding: '0 20px' }}>
          {hi ? "एक धीमी गूंज जो रात में घुल जाती है।" : "A slow, steady hum that fades into the night."}
        </p>

        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Visual Slow Pulse */}
          {isPlaying && (
            <>
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px solid ${dimAmber}`, animation: 'ripple 6s infinite linear' }} />
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px solid ${dimAmber}`, animation: 'ripple 6s infinite linear 3s' }} />
            </>
          )}
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'transparent', border: `1px solid ${dimAmber}`, color: dimAmber,
              fontSize: 14, letterSpacing: 2, cursor: 'pointer', zIndex: 10, transition: 'all 0.3s',
              boxShadow: isPlaying ? `0 0 30px rgba(184, 93, 25, 0.2)` : 'none'
            }}
          >
            {isPlaying ? (hi ? "रोकें" : "PAUSE") : (hi ? "सुनें" : "PLAY")}
          </button>
        </div>
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.3, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}