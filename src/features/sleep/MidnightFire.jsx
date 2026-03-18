import React, { useState } from 'react';
import { supabase } from "../../supabase";

export function MidnightFire({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [thought, setThought] = useState("");
  const [isBurning, setIsBurning] = useState(false);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";
  const faintBorder = "rgba(184, 93, 25, 0.25)";

  // THE PROFESSIONAL HANDSHAKE WITH HAPTIC FEEDBACK
  const handleBurn = async () => {
    if (!thought.trim()) return;

    // A. Setup the Sound (Vite looks in the /public folder automatically)
    const audio = new Audio('/whoosh.mp3');
    audio.volume = 0.3; // A soft, gentle whisper

    // 1. Start the Magic Animation!
    setIsBurning(true);

    // 2. TOUCH: The Haptic Vibration
    if (navigator.vibrate) {
      navigator.vibrate(100); 
    }
    
    // 3. SOUND: Play the Whoosh
    // We use .catch() just in case the browser blocks it
    audio.play().catch(() => console.log("Sound ready for next time!"));

    // 4. MEMORY: The Invisible Handshake to Mumbai
    try {
      const { error } = await supabase
        .from('burnt_thoughts') 
        .insert([{ content: thought }]);

      if (error) console.error("Database Bridge Error:", error.message);
    } catch (err) {
      console.error("System Error:", err);
    }

    // 5. CLEANUP: Clear the screen after the fire finishes
    setTimeout(() => {
      setThought("");
      setIsBurning(false);
    }, 6500); 
  };

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* ─── BACK BUTTON ─── */}
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
            <p style={{ color: dimAmber, opacity: 0.6, fontSize: 15, lineHeight: 1.6, marginBottom: 30, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
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
              disabled={!thought.trim()}
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
            fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: dimAmber,
            lineHeight: 1.5, wordWrap: 'break-word'
          }}>
            {/* Particle Effect: Breaking text into characters */}
            {thought.split('').map((char, index) => {
              const randomX = (Math.random() - 0.5) * 80; 
              const randomDelay = Math.random() * 1.5; 
              
              return (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    whiteSpace: 'pre-wrap',
                    '--rx': `${randomX}px`, 
                    animation: `burnLetter 5s ease-in forwards`,
                    animationDelay: `${randomDelay}s`
                  }}
                >
                  {char}
                </span>
              );
            })}
          </p>
        )}

      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.3, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes burnLetter {
          0% { 
            opacity: 1; 
            color: ${dimAmber}; 
            transform: translate(0, 0) scale(1); 
            filter: blur(0px); 
          }
          20% { 
            color: #ff8c00; 
            transform: translate(0, -5px) scale(1.1); 
            filter: blur(1px); 
          }
          100% { 
            opacity: 0; 
            color: #2a0f05; 
            transform: translate(var(--rx), -150px) scale(0.4); 
            filter: blur(12px); 
          }
        }
      `}</style>
    </div>
  );
}