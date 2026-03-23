import React, { useState, useEffect } from 'react';
import { BrandHeader } from './BrandHeader';
import { BackButton } from './BackButton';

export function Reset({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(false);
  // FIX: Frame 6→7 — question lands first, button appears after 4s
  const [showFocusBtn, setShowFocusBtn] = useState(false);

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

  // FIX: Frame 1 — instant start + immediate vibrate on entry
  useEffect(() => {
    if (window.navigator.vibrate) window.navigator.vibrate(30);
    const initialStart = setTimeout(() => {
      setStep(1);
      setFade(true);
    }, 60);
    return () => clearTimeout(initialStart);
  }, []);

  useEffect(() => {
    let t;
    if (step === 1) t = advance(2, 2000);
    if (step === 2) t = advance(3, 2000);
    // FIX: Frame 3 — step 3 shows "Follow this..." for 2s, THEN step 3b shows orb
    if (step === 3)  t = advance(4, 2000);   // "Follow this..." 2s intro
    if (step === 4)  t = advance(5, 21000);  // orb tapping 21s
    if (step === 5)  t = advance(6, 24000);  // breathing orb 24s
    if (step === 6)  t = advance(7, 2000);   // "Good." 2s
    if (step === 7)  t = advance(8, 2000);   // "Now..." 2s
    // FIX: Frame 6→7 — question shows at step 9, button delayed 4s
    if (step === 8) {
      setShowFocusBtn(false);
      t = advance(9, 100); // near-instant to question screen
    }
    if (step === 9) {
      // Button appears after 4s so question can land first
      t = setTimeout(() => setShowFocusBtn(true), 4000);
    }
    if (step === 10) {
      // FIX: "You're back." lingers 2.5s then goes to PostReset
      t = setTimeout(() => {
        setFade(false);
        setTimeout(() => { setTab('postreset'); }, 1000);
      }, 2500);
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleFocusClick = () => {
    setFade(false);
    setTimeout(() => { setStep(10); setFade(true); }, 1000);
  };

  const s = {
    page: {
      height: "100dvh", width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#050505", color: "#ffffff",
      fontFamily: "'Cormorant Garamond', serif",
      textAlign: "center", padding: 24, boxSizing: "border-box",
      position: "relative", overflow: "hidden",
    },
    progressBar: {
      position: "absolute", top: 0, left: 0,
      height: "2px", background: T.accent,
      opacity: 0.35,
      animation: "progressFill 62s linear forwards",
      zIndex: 50,
    },
    content: {
      opacity: fade ? 1 : 0,
      transition: "opacity 1s ease-in-out",
      display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
      zIndex: 2,
    },
    text: {
      fontSize: "clamp(28px, 8vw, 36px)", fontWeight: 300, fontStyle: "italic",
      letterSpacing: "1px", margin: 0, lineHeight: 1.4,
    },
    // FIX: Frame 2 — subtle breathing dot visible at "You're here."
    breathingDot: {
      width: 10, height: 10, borderRadius: "50%",
      background: T.accent, opacity: 0.4,
      marginTop: 32,
      animation: "breatheSoft 4s ease-in-out infinite",
    },
    orbWrap: {
      position: "relative", margin: "40px auto",
      display: "flex", justifyContent: "center", alignItems: "center",
    },
    // Per-phase progress bars — subtle, no numbers
    phaseBarWrap: {
      width: "clamp(90px, 28vw, 160px)",
      height: 2,
      background: "rgba(255,255,255,0.1)",
      borderRadius: 99,
      marginTop: 24,
      overflow: "hidden",
    },
    phaseBarTap: {
      height: "100%",
      background: T.accent,
      opacity: 0.5,
      borderRadius: 99,
      animation: "phaseFillTap 21s linear forwards",
    },
    phaseBarBreathe: {
      height: "100%",
      background: T.accent,
      opacity: 0.5,
      borderRadius: 99,
      animation: "phaseFillBreathe 24s linear forwards",
    },
    orb: {
      borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, rgba(180, 180, 185, 0.95) 0%, rgba(100, 100, 105, 0.95) 100%)",
      boxShadow: `0 0 35px ${T.accent}60, inset -8px -8px 15px rgba(0,0,0,0.2), inset 8px 8px 15px rgba(255,255,255,0.3)`,
      willChange: "transform",
    },
    focusWrap: {
      marginTop: 32, width: "100%",
      opacity: showFocusBtn ? 1 : 0,
      transition: "opacity 1s ease-in-out",
    },
    focusInputText: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 14,
      color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase", letterSpacing: "2px", marginBottom: 20,
    },
    focusBtn: {
      background: "#ffffff", color: "#000000", border: "none",
      borderRadius: 12, padding: "20px 40px", fontSize: "16px",
      fontWeight: 700, letterSpacing: "1px", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", transition: "transform 0.2s",
      width: "100%", maxWidth: "300px", boxShadow: "0 0 30px rgba(255,255,255,0.2)",
    },
    headerWrap: { position: "absolute", top: "10px", left: 0, width: "100%", zIndex: 10, opacity: 0.5 },
    backWrap: { position: "absolute", bottom: "30px", left: "24px", zIndex: 10, opacity: 0.5 },
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes progressFill {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      @keyframes heartbeat {
        0%   { transform: scale(0.8); opacity: 0.5; }
        20%  { transform: scale(1.1); opacity: 1; }
        40%  { transform: scale(0.9); opacity: 0.7; }
        60%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0.5; }
      }
      @keyframes breathe {
        0%   { transform: scale(0.5); opacity: 0.3; }
        50%  { transform: scale(1.5); opacity: 0.8; }
        100% { transform: scale(0.5); opacity: 0.3; }
      }
      @keyframes breatheSoft {
        0%   { transform: scale(0.8); opacity: 0.3; }
        50%  { transform: scale(1.4); opacity: 0.6; }
        100% { transform: scale(0.8); opacity: 0.3; }
      }
      @keyframes phaseFillTap {
        0%   { width: 0%; }
        100% { width: 100%; }
      }
      @keyframes phaseFillBreathe {
        0%   { width: 0%; }
        100% { width: 100%; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  const orbSizeSmall = "clamp(90px, 28vw, 120px)";
  const orbSizeLarge = "clamp(140px, 45vw, 200px)";

  const orbStyle = (size, animation) => ({
    ...s.orb, width: size, height: size, animation,
  });

  return (
    <div style={s.page}>

      <div style={s.progressBar} />
      <div style={s.headerWrap}><BrandHeader T={T} /></div>
      <div style={s.backWrap}><BackButton setTab={setTab} destination="home" T={T} lang={lang} /></div>

      <div style={s.content}>

        {step === 1 && <p style={s.text}>{hi ? "ठहरें।" : "Pause."}</p>}

        {/* FIX: Frame 2 — breathing dot already visible */}
        {step === 2 && (
          <>
            <p style={s.text}>{hi ? "आप यहाँ हैं।" : "You're here."}</p>
            <div style={s.breathingDot} />
          </>
        )}

        {/* FIX: Frame 3 — "Follow this..." intro for 2s before orb appears */}
        {step === 3 && (
          <p style={{ ...s.text, fontSize: "28px", opacity: 0.7 }}>
            {hi ? "इसे महसूस करें..." : "Follow this..."}
          </p>
        )}

        {step === 4 && (
          <>
            <p style={{ ...s.text, fontSize: "32px", opacity: 0.8 }}>
              {hi ? "लय के साथ टैप करें" : "Tap with the rhythm"}
            </p>
            <div
              style={{ ...s.orbWrap, width: orbSizeSmall, height: orbSizeSmall }}
              onClick={() => { if (window.navigator.vibrate) window.navigator.vibrate(50); }}
            >
              <div style={orbStyle(orbSizeSmall, "heartbeat 1s infinite")} />
            </div>
            <div style={s.phaseBarWrap}>
              <div style={s.phaseBarTap} />
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <p style={{ ...s.text, fontSize: "32px", opacity: 0.8 }}>
              {hi ? "इस लय का पालन करें" : "Follow this rhythm"}
            </p>
            <div style={{ ...s.orbWrap, width: orbSizeLarge, height: orbSizeLarge }}>
              <div style={orbStyle(orbSizeLarge, "breathe 8s infinite")} />
            </div>
            <div style={s.phaseBarWrap}>
              <div style={s.phaseBarBreathe} />
            </div>
          </>
        )}

        {step === 6 && <p style={s.text}>{hi ? "बहुत अच्छा।" : "Good."}</p>}
        {step === 7 && <p style={s.text}>{hi ? "अब..." : "Now..."}</p>}

        {/* FIX: Frame 6→7 — question lands first, button fades in after 4s */}
        {step === 9 && (
          <>
            <p style={s.text}>{hi ? "अभी सबसे ज़रूरी क्या है?" : "What matters most right now?"}</p>
            <div style={s.focusWrap}>
              <p style={s.focusInputText}>
                {hi ? "अपने मन में उत्तर सोचें" : "Hold the answer in your mind"}
              </p>
              <button
                onClick={handleFocusClick}
                style={s.focusBtn}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                onTouchStart={e => e.currentTarget.style.transform = "scale(0.95)"}
                onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {hi ? "एक चीज़ पर ध्यान दें" : "FOCUS ON ONE THING"}
              </button>
            </div>
          </>
        )}

        {/* FIX: "You're back." — stronger exit bridge than "You're ready." */}
        {step === 10 && <p style={s.text}>{hi ? "आप वापस हैं।" : "You're back."}</p>}

      </div>
    </div>
  );
}
