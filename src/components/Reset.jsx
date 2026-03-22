import React, { useState, useEffect } from 'react';

export function Reset({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);

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

  useEffect(() => {
    let t;
    if (step === 1) t = advance(2, 3000); // "Pause."
    if (step === 2) t = advance(3, 3000); // "You're here."
    if (step === 3) t = advance(4, 12000); // "Tap with the rhythm"
    if (step === 4) t = advance(5, 20000); // "Follow this rhythm"
    if (step === 5) t = advance(6, 3000); // "Good."
    if (step === 6) t = advance(7, 3000); // "Now..."
    
    // NOTE: Step 7 has NO automatic timer. The user MUST click the button to proceed.

    // The Final Handoff to the Post-Reset page
    if (step === 8) {
      t = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setTab('postreset'); // Hand the keys directly to the router!
        }, 1000);
      }, 3000); 
    }
    
    // Cleanup function to stop memory leaks
    return () => clearTimeout(t);
    
    // 🛡️ THE SECURITY FIX: We removed 'setTab' from this list below so React 
    // stops accidentally resetting your timers!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); 

  // Manual click overrides
  const handleStart = () => {
    setFade(false);
    setTimeout(() => { setStep(1); setFade(true); }, 1000);
  };

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
      display: "flex", flexDirection: "column", alignItems: "center", width: "100%"
    },
    title: { fontSize: "16px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", opacity: 0.5, marginBottom: 40 },
    text: { fontSize: "clamp(28px, 8vw, 36px)", fontWeight: 300, fontStyle: "italic", letterSpacing: "1px", margin: 0, lineHeight: 1.4 },
    
    startBtn: {
      background: "transparent", border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: 99, padding: "20px 60px", color: "#fff",
      fontSize: "18px", letterSpacing: "2px", textTransform: "uppercase",
      cursor: "pointer", transition: "all 0.3s", marginTop: 40, fontFamily: "'DM Sans', sans-serif"
    },

    orbWrap: { position: "relative", width: 120, height: 120, margin: "40px auto" },
    orb: {
      width: "100%", height: "100%", borderRadius: "50%",
      background: `radial-gradient(circle, ${T.accent}80 0%, transparent 70%)`,
      animation: step === 3 ? "heartbeat 1s infinite" : step === 4 ? "breathe 8s infinite" : "none",
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
    }
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
      <div style={s.content}>
        
        {step === 0 && (
          <>
            <div style={s.title}>90-Second Reset</div>
            <button onClick={handleStart} style={s.startBtn}>{hi ? "टैप करें" : "Tap"}</button>
          </>
        )}

        {step === 1 && <p style={s.text}>{hi ? "ठहरें।" : "Pause."}</p>}
        {step === 2 && <p style={s.text}>{hi ? "आप यहाँ हैं।" : "You're here."}</p>}

        {step === 3 && (
          <>
            <p style={{...s.text, fontSize: 24, opacity: 0.7}}>{hi ? "लय के साथ टैप करें" : "Tap with the rhythm"}</p>
            <div style={s.orbWrap} onClick={() => { if(window.navigator.vibrate) window.navigator.vibrate(50); }}>
              <div style={s.orb} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p style={{...s.text, fontSize: 24, opacity: 0.7}}>{hi ? "इस लय का पालन करें" : "Follow this rhythm"}</p>
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