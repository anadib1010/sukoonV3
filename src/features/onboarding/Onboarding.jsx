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

  const handleComplete = () => {
    setLeaving(true);
    // Default to a calming dark theme since we removed mood selection
    if (setThemeKey) setThemeKey("Void"); 
    setTimeout(() => { document.body.style.background = "#050505"; onComplete(); }, 450);
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
    primaryBtn: { 
      background: "linear-gradient(180deg, #f0f0f0 0%, #a0a0a0 100%)", 
      border: "none", borderRadius: 8, padding: "18px 24px", width: "100%",
      color: "#111", fontSize: 16, fontFamily: sans, fontWeight: 700, 
      letterSpacing: "1.5px", cursor: "pointer", boxShadow: "0 4px 20px rgba(255,255,255,0.15)",
      transition: "transform 0.2s"
    },
    ghostBtn: {
      background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 99, padding: "16px 32px", color: "#e8e8e8", width: "100%",
      fontSize: 16, fontFamily: serif, cursor: "pointer", transition: "background 0.3s"
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

        {/* SCREEN 2: Expectation & Action */}
        {screen === 2 && (
          <>
            <p style={st.bodyText}>
              {hi ? "जब सब कुछ भारी लगने लगे, तो आप एक मिनट से भी कम समय में रीसेट कर सकते हैं।" 
                  : "When things feel overwhelming, you can reset in under a minute."}
            </p>
            <p style={st.subText}>
              {hi ? "एक बार आज़माएं। किसी सेटअप की आवश्यकता नहीं है।" : "Try it once. No setup needed."}
            </p>
            <button 
              onClick={handleComplete} 
              style={st.primaryBtn}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {hi ? "90-सेकंड का रीसेट शुरू करें" : "START 90 SECOND RESET"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}