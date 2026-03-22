import React, { useState, useEffect } from 'react';
// 🧱 Bringing in our LEGO bricks! (Using ./ because they are in the same folder)
import { BrandHeader } from './BrandHeader'; 
import { BackButton } from './BackButton'; 

export function Reset({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(false); 

  // Our professional-grade engine to move from screen to screen
  const advance = (nextStep, delay) => {
    const timer = setTimeout(() => {
      setFade(false); 
      setTimeout(() => {
        setStep(nextStep); 
        setFade(true);     
      }, 1000); 
    }, delay);
    return timer;
  };

  // 🚀 INSTANT START LOGIC
  useEffect(() => {
    const initialStart = setTimeout(() => {
      setStep(1); 
      setFade(true);
    }, 100); 
    
    return () => clearTimeout(initialStart);
  }, []);

  useEffect(() => {
    let t;
    if (step === 1) t = advance(2, 3000); // "Pause."
    if (step === 2) t = advance(3, 3000); // "You're here."
    if (step === 3) t = advance(4, 12000); // "Tap with the rhythm"
    if (step === 4) t = advance(5, 20000); // "Follow this rhythm"
    if (step === 5) t = advance(6, 3000); // "Good."
    if (step === 6) t = advance(7, 3000); // "Now..."
    
    // Step 7: Wait for manual "FOCUS ON ONE THING" click
    
    // The Final Handoff to the Post-Reset page
    if (step === 8) {
      t = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setTab('postreset'); 
        }, 1000);
      }, 3000); 
    }
    
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); 

  const handleFocusClick = () => {
    setFade(false);
    setTimeout(() => { setStep(8); setFade(true); }, 1000);
  };

  // ─── STYLES (Rule of T) ───
  const s = {
    page: {
      height: "100dvh", width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#050505", 
      color: "#ffffff",
      fontFamily: "'Cormorant Garamond', serif",
      textAlign: "center", padding: 24, boxSizing: "border-box",
      position: "relative"
    },
    content: {
      opacity: fade ? 1 : 0,
      transition: "opacity 1s ease-in-out",
      display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
      zIndex: 2 // Keeps content above background
    },
    text: { fontSize: "clamp(28px, 8vw, 36px)", fontWeight: 300, fontStyle: "italic", letterSpacing: "1px", margin: 0, lineHeight: 1.4 },
    
    orbWrap: { 
      position: "relative", width: 120, height: 120, margin: "40px auto",
      display: "flex", justifyContent: "center", alignItems: "center"
    },
    // 🌟 THE FIX: A razor-sharp solid core with a glowing shadow, plus hardware acceleration
    orb: {
      width: "100%", height: "100%", borderRadius: "50%",
      background: T.accent, 
      boxShadow: `0 0 40px ${T.accent}80, inset 0 0 20px rgba(255,255,255,0.3)`,
      animation: step === 3 ? "heartbeat 1s infinite" : step === 4 ? "breathe 8s infinite" : "none",
      willChange: "transform, opacity" // This makes the graphics card keep it perfectly sharp!
    },

    focusWrap: { marginTop: 60, width: "100%" },
    focusInputText: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase", letterSpacing: "2px", marginBottom: 20
    },
    focusBtn: {
      background: "#ffffff", color: "#000000", border: "none",
      borderRadius: 12, padding: "20px 40px", fontSize: "16px",
      fontWeight: 700, letterSpacing: "1px", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", transition: "transform 0.2s",
      width: "100%", maxWidth: "300px", boxShadow: "0 0 30px rgba(255,255,255,0.2)"
    },

    // ─── LEGO BRICK PLACEMENT ───
    headerWrap: { position: "absolute", top: 0, left: 0, width: "100%", zIndex: 10, opacity: 0.5 },
    backWrap: { position: "absolute", bottom: "30px", left: "24px", zIndex: 10, opacity: 0.5 }
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes heartbeat {
        0% { transform: scale(0.8); opacity: 0.5; }
        20% { transform: scale(1.1); opacity: 1; }
        40% { transform: scale(0.9); opacity: 0.7; }
        60% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0.5; }
      }
      @keyframes breathe {
        0% { transform: scale(0.5); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 0.8; }
        100% { transform: scale(0.5); opacity: 0.3; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  return (
    <div style={s.page}>

      {/* 🧱 BRANDING AND BACK BUTTON (Wrapped to control opacity so they don't distract) */}
      <div style={s.headerWrap}><BrandHeader T={T} /></div>
      <div style={s.backWrap}><BackButton setTab={setTab} destination="home" T={T} lang={lang} /></div>

      <div style={s.content}>
        
        {step === 1 && <p style={s.text}>{hi ? "ठहरें।" : "Pause."}</p>}
        {step === 2 && <p style={s.text}>{hi ? "आप यहाँ हैं।" : "You're here."}</p>}

        {step === 3 && (
          <>
            <p style={{...s.text, fontSize: "32px", opacity: 0.8}}>{hi ? "लय के साथ टैप करें" : "Tap with the rhythm"}</p>
            <div style={s.orbWrap} onClick={() => { if(window.navigator.vibrate) window.navigator.vibrate(50); }}>
              <div style={s.orb} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            {/* 🌟 THE FIX: Increased font size to 32px */}
            <p style={{...s.text, fontSize: "32px", opacity: 0.8}}>{hi ? "इस लय का पालन करें" : "Follow this rhythm"}</p>
            <div style={{...s.orbWrap, width: 200, height: 200}}>
              <div style={s.orb} />
            </div>
          </>
        )}

        {step === 5 && <p style={s.text}>{hi ? "बहुत अच्छा।" : "Good."}</p>}
        {step === 6 && <p style={s.text}>{hi ? "अब..." : "Now..."}</p>}

        {step === 7 && (
          <>
            <p style={s.text}>{hi ? "इस समय सबसे महत्वपूर्ण क्या है?" : "What matters most right now?"}</p>
            <div style={s.focusWrap}>
              <p style={s.focusInputText}>{hi ? "अपने मन में उत्तर सोचें" : "Hold the answer in your mind"}</p>
              <button 
                onClick={handleFocusClick} 
                style={s.focusBtn}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {hi ? "एक चीज़ पर ध्यान दें" : "FOCUS ON ONE THING"}
              </button>
            </div>
          </>
        )}

        {step === 8 && <p style={s.text}>{hi ? "आप तैयार हैं।" : "You're ready."}</p>}

      </div>
    </div>
  );
}