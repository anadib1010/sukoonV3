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

  const st = {
    page: {
      position: "fixed", inset: 0, zIndex: 99998, background: "#050505",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 32px", overflowX: "hidden",
    },
    wrapper: {
      width: "100%", maxWidth: 360, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      opacity: leaving ? 0 : 1, transition: "opacity 0.35s ease",
    },
    title: {
      fontFamily: serif, fontSize: "clamp(42px,10vw,52px)", fontWeight: 300,
      color: "#e8e8e8", margin: "0 0 40px", letterSpacing: "2px",
    },
    langBtns: { display: "flex", gap: 16, width: "100%", justifyContent: "center" },
    langBtn: (active) => ({
      background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 99, padding: "12px 32px", color: "#e8e8e8", fontSize: 16,
      fontFamily: serif, cursor: "pointer", transition: "all 0.3s ease",
    }),
    bodyText: {
      fontFamily: serif, fontSize: "clamp(24px, 6.5vw, 28px)",
      color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: 40,
    },
    subText: {
      fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.4)",
      letterSpacing: "1px", textTransform: "uppercase", marginBottom: 30,
    },
    ghostBtn: {
      background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 99, padding: "16px 32px", color: "#e8e8e8", width: "100%",
      fontSize: 16, fontFamily: serif, cursor: "pointer", transition: "background 0.3s",
    },
    glassResetBtn: {
      background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "16px",
      padding: "24px 20px", width: "100%",
      color: "#ffffff", fontFamily: sans, fontSize: "clamp(18px, 5vw, 22px)",
      fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: "pointer", transition: "all 0.3s ease",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", marginBottom: "16px",
    },
    disclaimerText: {
      fontFamily: sans, fontSize: "11px", color: "rgba(255, 255, 255, 0.4)",
      letterSpacing: "0.5px", marginTop: "4px", width: "100%", textAlign: "center",
    },
    // FIX: skip button tap target enlarged for mobile
    skipBtn: {
      position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
      background: "transparent", border: "none", color: "rgba(255,255,255,0.4)",
      fontFamily: sans, fontSize: "14px", letterSpacing: "1px",
      textTransform: "uppercase", cursor: "pointer",
      textDecoration: "underline", textUnderlineOffset: "4px",
      transition: "color 0.2s", padding: "12px 24px",
    },
  };

  return (
    <div style={st.page}>
      <div style={st.wrapper}>
        {screen === 0 && (
          <>
            <h1 style={st.title}>JSukoon</h1>
            <div style={st.langBtns}>
              <button onClick={() => chooseLang("English")} style={st.langBtn(lang === "English")}>English</button>
              <button onClick={() => chooseLang("Hindi")} style={st.langBtn(lang === "Hindi")}>हिंदी</button>
            </div>
          </>
        )}
        {screen === 1 && (
          <>
            <p style={st.bodyText}>
              {hi
                ? "यह आपकी जगह है। कोई दबाव नहीं। कोई शोर नहीं। बस आपके लिए एक पल।"
                : "This is your space. No pressure. No noise. Just a moment for you."}
            </p>
            <button onClick={() => go(2)} style={st.ghostBtn}>{hi ? "आगे" : "Continue"}</button>
          </>
        )}
        {screen === 2 && (
          <>
            {/* FIX: "बहुत भारी" is warmer/more natural than "बहुत अधिक" */}
            <p style={st.bodyText}>
              {hi
                ? <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-मिनट का रीसेट लें — जब सब कुछ भारी लगने लगे।</>
                : <>When things feel like too much, take a <span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-minute reset.</>}
            </p>
            <p style={st.subText}>
              {hi ? "एक बार आज़माएं। किसी सेटअप की आवश्यकता नहीं है।" : "Try it once. No setup needed."}
            </p>
            <button onClick={() => go(3)} style={st.ghostBtn}>{hi ? "आगे" : "Continue"}</button>
          </>
        )}
        {screen === 3 && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => handleComplete('reset')}
              style={st.glassResetBtn}
            >
              {hi
                ? <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-मिनट का रीसेट लें</>
                : <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-MINUTE RESET</>}
            </button>
            <p style={st.disclaimerText}>
              {hi
                ? "यह एक सरल निर्देशित अनुभव है, चिकित्सा सलाह नहीं।"
                : "This is a simple guided experience, not medical advice."}
            </p>
          </div>
        )}
      </div>

      {screen === 3 && (
        <button onClick={() => handleComplete('home')} style={st.skipBtn}>
          {hi ? "स्किप करें" : "Skip"}
        </button>
      )}
    </div>
  );
}
