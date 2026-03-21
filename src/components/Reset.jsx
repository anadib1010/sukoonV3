import React, { useState, useEffect } from 'react';

export function Reset({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  
  // step 0: Blank -> 1: Pause -> 2: You're here -> 3: Tap -> 4: Regulate -> 5: Good -> 6: Now -> 7: Focus
  const [step, setStep] = useState(0);
  const [isTapped, setIsTapped] = useState(false);

  useEffect(() => {
    // The 90-Second Psychological Timeline
    const timers = [
      setTimeout(() => setStep(1), 1000),   // 1s: "Pause."
      setTimeout(() => setStep(2), 4000),   // 4s: "You're here."
      setTimeout(() => setStep(3), 7000),   // 7s: "Tap with the rhythm" (Interrupt Phase)
      setTimeout(() => setStep(4), 22000),  // 22s: "Follow this rhythm" (Regulate Phase)
      setTimeout(() => setStep(5), 62000),  // 62s: "Good." (Clarity Phase)
      setTimeout(() => setStep(6), 65000),  // 65s: "Now..."
      setTimeout(() => setStep(7), 68000),  // 68s: "What matters most right now?"
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleTap = () => {
    if (step === 3 || step === 4) {
      setIsTapped(true);
      setTimeout(() => setIsTapped(false), 150);
      // Gentle haptic feedback if the device supports it
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(40);
      }
    }
  };

  const handleFinish = () => {
    // Optional: Save completion to localStorage for subtle habit tracking later
    setTab('home');
  };

  // ─── STYLES (Rule of T) ───
  const s = {
    page: {
      position: "fixed", inset: 0, zIndex: 99999, // Covers absolutely everything
      background: "#030303", // Force deep black/dark for sensory deprivation
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 24px", overflow: "hidden",
      color: "rgba(255,255,255,0.85)", // Soft white, not harsh
      fontFamily: "'Cormorant Garamond', serif",
    },
    
    // Very faint abort button in case of extreme panic
    abortBtn: {
      position: "absolute", top: 24, right: 24,
      background: "transparent", border: "none",
      color: "rgba(255,255,255,0.2)", fontSize: "28px",
      cursor: "pointer", zIndex: 10, padding: "10px",
    },

    textWrap: {
      position: "absolute", top: "30%", width: "100%",
      textAlign: "center",
      opacity: step > 0 && step !== 3 && step !== 4 ? 1 : 0,
      transition: "opacity 1.5s ease-in-out",
    },
    
    mainText: {
      fontSize: "clamp(28px, 8vw, 36px)",
      fontWeight: 300, letterSpacing: "1px",
      margin: 0, opacity: 0.9,
    },

    // The Interactive Orb
    orbContainer: {
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      opacity: (step === 3 || step === 4) ? 1 : 0,
      transition: "opacity 2s ease",
      pointerEvents: (step === 3 || step === 4) ? "auto" : "none",
    },
    
    orbInstruction: {
      position: "absolute", top: "-80px", width: "200px",
      textAlign: "center", fontSize: "18px", fontStyle: "italic",
      color: "rgba(255,255,255,0.5)", letterSpacing: "1px",
      opacity: (step === 3 || step === 4) ? 1 : 0,
      transition: "opacity 1s ease",
    },

    // Orb changes based on phase
    orb: {
      width: "120px", height: "120px",
      borderRadius: "50%",
      background: `radial-gradient(circle, ${T.accent}40 0%, transparent 70%)`,
      border: `1px solid ${T.accent}50`,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
      // Phase 1 (step 3): Quick heartbeat pulse
      // Phase 2 (step 4): Slow inhale/exhale breath
      animation: step === 3 ? "heartbeat 1.5s infinite" : step === 4 ? "breathe 10s ease-in-out infinite" : "none",
      transform: isTapped ? "scale(0.92)" : "scale(1)",
      boxShadow: isTapped ? `0 0 40px ${T.accent}60` : `0 0 20px ${T.accent}20`,
      transition: step === 4 ? "transform 0.5s ease, box-shadow 0.5s ease" : "transform 0.1s ease, box-shadow 0.1s ease",
    },

    // Final Clarity Phase
    clarityWrap: {
      position: "absolute", top: "45%", width: "100%",
      display: "flex", flexDirection: "column", alignItems: "center",
      opacity: step === 7 ? 1 : 0,
      transform: step === 7 ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 1.5s ease, transform 1.5s ease",
      pointerEvents: step === 7 ? "auto" : "none",
    },
    
    clarityText: {
      fontSize: "clamp(24px, 6vw, 30px)",
      fontWeight: 300, marginBottom: "40px",
      textAlign: "center",
    },

    actionBtn: {
      background: "linear-gradient(180deg, #f0f0f0 0%, #a0a0a0 100%)",
      border: "none", borderRadius: "8px",
      padding: "18px 32px", color: "#111",
      fontFamily: "'DM Sans', sans-serif", fontSize: "16px",
      fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: "pointer", boxShadow: "0 4px 20px rgba(255,255,255,0.15)",
      transition: "transform 0.2s",
    }
  };

  // Determine what text to show in the center during text phases
  let centerText = "";
  if (step === 1) centerText = hi ? "ठहरें।" : "Pause.";
  if (step === 2) centerText = hi ? "आप यहाँ हैं।" : "You're here.";
  if (step === 5) centerText = hi ? "बहुत अच्छा।" : "Good.";
  if (step === 6) centerText = hi ? "अब..." : "Now...";

  return (
    <div style={s.page}>
      
      {/* CSS Animations injected directly for the orb */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(0.95); opacity: 0.6; }
          20% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 30px ${T.accent}40; }
          40% { transform: scale(0.95); opacity: 0.6; }
          60% { transform: scale(1.02); opacity: 0.9; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        @keyframes breathe {
          0% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 50px ${T.accent}50; }
          50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 50px ${T.accent}50; }
          100% { transform: scale(0.8); opacity: 0.4; }
        }
      `}</style>

      {/* Emergency Abort (Almost invisible, just for safety) */}
      <button onClick={() => setTab('home')} style={s.abortBtn}>×</button>

      {/* Text Phases (1, 2, 5, 6) */}
      <div style={s.textWrap}>
        <h2 style={s.mainText}>{centerText}</h2>
      </div>

      {/* Interactive Orb Phases (3, 4) */}
      <div style={s.orbContainer}>
        <p style={s.orbInstruction}>
          {step === 3 && (hi ? "लय के साथ टैप करें" : "Tap with the rhythm")}
          {step === 4 && (hi ? "इस लय के साथ चलें" : "Follow this rhythm")}
        </p>
        <div 
          style={s.orb} 
          onClick={handleTap}
          onTouchStart={handleTap}
        />
      </div>

      {/* Clarity Phase (7) */}
      <div style={s.clarityWrap}>
        <h2 style={s.clarityText}>
          {hi ? "अभी सबसे ज्यादा क्या मायने रखता है?" : "What matters most right now?"}
        </h2>
        <button 
          onClick={handleFinish} 
          style={s.actionBtn}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {hi ? "एक चीज़ पर ध्यान दें" : "Focus on one thing"}
        </button>
      </div>

    </div>
  );
}