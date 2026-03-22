import React, { useState, useEffect } from 'react';

export function Onboarding({ onComplete, setThemeKey, setLang, T }) {
  const [screen, setScreen]   = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [lang, setLocalLang]  = useState("English");

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#050505";
    return () => { document.body.style.background = prev; };
  }, []);

  const hi    = lang === "Hindi";
  const serif = "'Cormorant Garamond', serif";
  const sans  = "'DM Sans', sans-serif";

  const go = (next) => {
    setLeaving(true);
    setTimeout(() => { setScreen(next); setLeaving(false); }, 380);
  };

  const chooseLang = (l) => {
    setLocalLang(l);
    setLang(l);
    go(1);
  };

  const handleComplete = (destination) => {
    setLeaving(true);
    if (setThemeKey) setThemeKey("Void"); 
    setTimeout(() => { 
      document.body.style.background = "#050505"; 
      onComplete(destination); 
    }, 450);
  };

  // ─── STYLES (Rule of T) ───
  const st = {
    page: {
      position: "fixed", inset: 0, zIndex: 99998,
      background: "#050505",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px",
      overflowX: "hidden",
    },
    wrapper: {
      width: "100%", maxWidth: 360,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
      opacity: leaving ? 0 : 1,
      transition: "opacity 0.35s ease",
      willChange: "opacity",
    },
    title: { 
      fontFamily: serif, fontSize: "clamp(42px,10vw,52px)", 
      fontWeight: 300, color: "#e8e8e8", margin: "0 0 40px", letterSpacing: "2px" 
    },
    langBtns: { display: "flex", gap: 16, width: "100%", justifyContent: "center" },
    langBtn: (active) => ({
      background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 99, padding: "12px 32px", color: "#e8e8e8", 
      fontSize: 16, fontFamily: serif, cursor: "pointer", transition: "all 0.3s ease"
    }),
    bodyText: { 
      fontFamily: serif, fontSize: "clamp(24px, 6.5vw, 28px)", 
      color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: 40 
    },
    subText: {
      fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.4)", 
      letterSpacing: "1px", textTransform: "uppercase", marginBottom: 30
    },
    ghostBtn: {
      background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 99, padding: "16px 32px", color: "#e8e8e8", width: "100%",
      fontSize: 16, fontFamily: serif, cursor: "pointer", transition: "background 0.3s"
    },
    
    glassResetBtn: {
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "16px",
      padding: "24px 20px", 
      width: "100%",
      color: "#ffffff", 
      fontFamily: sans, fontSize: "clamp(18px, 5vw, 22px)", 
      fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: "pointer", transition: "all 0.3s ease",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      marginBottom: "0px" // Removed margin because Skip is now absolute
    },
    
    // 📌 THE PINNED SKIP BUTTON
    skipBtn: {
      position: "absolute", // Rips it out of the center block
      bottom: "40px",       // Pins it 40px from the bottom edge of the screen
      left: "50%",
      transform: "translateX(-50%)", // Keeps it perfectly centered horizontally
      background: "transparent", border: "none",
      color: "rgba(255,255,255,0.4)", 
      fontFamily: sans, fontSize: "14px", letterSpacing: "1px",
      textTransform: "uppercase", cursor: "pointer",
      textDecoration: "underline", textUnderlineOffset: "4px",
      transition: "color 0.2s"
    }
  };

  return (
    <div style={st.page}>
      <div style={st.wrapper}>

        {/* SCREEN 0: Language */}
        {screen === 0 && (
          <>
            <h1 style={st.title}>JSukoon</h1>
            <div style={st.langBtns}>
              <button onClick={() => chooseLang("English")} style={st.langBtn(lang === "English")}>English</button>
              <button onClick={() => chooseLang("Hindi")} style={st.langBtn(lang === "Hindi")}>हिंदी</button>
            </div>
          </>
        )}

        {/* SCREEN 1: Safety */}
        {screen === 1 && (
          <>
            <p style={st.bodyText}>
              {hi ? "यह आपकी जगह है। कोई दबाव नहीं। कोई शोर नहीं। बस आपके लिए एक पल।" 
                  : "This is your space. No pressure. No noise. Just a moment for you."}
            </p>
            <button onClick={() => go(2)} style={st.ghostBtn}>
              {hi ? "आगे" : "Continue"}
            </button>
          </>
        )}

        {/* SCREEN 2: The Pitch */}
        {screen === 2 && (
          <>
            <p style={st.bodyText}>
              {hi ? "जब सब कुछ भारी लगने लगे, तो आप केवल 90 सेकंड में रीसेट कर सकते हैं।" 
                  : "When things feel overwhelming, you can reset in just 90 seconds."}
            </p>
            <p style={st.subText}>
              {hi ? "एक बार आज़माएं। किसी सेटअप की आवश्यकता नहीं है।" : "Try it once. No setup needed."}
            </p>
            <button onClick={() => go(3)} style={st.ghostBtn}>
              {hi ? "आगे" : "Continue"}
            </button>
          </>
        )}

        {/* SCREEN 3: The Choice */}
        {screen === 3 && (
          <>
            <button 
              onClick={() => handleComplete('reset')} 
              style={st.glassResetBtn}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.boxShadow = "0 8px 40px rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {hi ? "90 सेकंड का रीसेट शुरू करें" : "START 90 SECOND RESET"}
            </button>
          </>
        )}

      </div>

      {/* The Skip button lives OUTSIDE the center wrapper, pinned to the bottom */}
      {screen === 3 && (
        <button 
          onClick={() => handleComplete('home')} 
          style={st.skipBtn}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          {hi ? "स्किप करें" : "Skip"}
        </button>
      )}
    </div>
  );
}