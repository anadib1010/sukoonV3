import React, { useState, useEffect } from 'react';

export function Onboarding({ onComplete, setThemeKey, setLang, T }) {
  const [screen, setScreen]     = useState(0);
  const [opacity, setOpacity]   = useState(1);
  const [lang, setLocalLang]    = useState("Hindi"); // Hindi first

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#050505";
    return () => { document.body.style.background = prev; };
  }, []);

  const hi    = lang === "Hindi";
  const serif = "'Cormorant Garamond', serif";
  const sans  = "'DM Sans', sans-serif";

  // Smooth crossfade between screens
  const fadeTo = (next, delay = 0) => {
    setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        setScreen(next);
        setOpacity(1);
      }, 700); // fade out 700ms, then swap content, fade in
    }, delay);
  };

  const chooseLang = (l) => {
    setLocalLang(l);
    setLang(l);
    fadeTo(1);
  };

  // Auto-advance screens 1→2→3→4 every 2s after language chosen
  useEffect(() => {
    if (screen === 1) { const t = setTimeout(() => fadeTo(2), 2000); return () => clearTimeout(t); }
    if (screen === 2) { const t = setTimeout(() => fadeTo(3), 2000); return () => clearTimeout(t); }
    if (screen === 3) { const t = setTimeout(() => fadeTo(4), 2000); return () => clearTimeout(t); }
  }, [screen]);

  const handleComplete = (destination) => {
    setOpacity(0);
    if (setThemeKey) setThemeKey("Void");
    setTimeout(() => {
      document.body.style.background = "#050505";
      onComplete(destination);
    }, 600);
  };

  const st = {
    page: {
      position: "fixed", inset: 0, zIndex: 99998, background: "#050505",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 32px", overflowX: "hidden",
    },
    wrapper: {
      width: "100%", maxWidth: 360,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      opacity, transition: "opacity 0.7s ease",
    },
    title: {
      fontFamily: serif, fontSize: "clamp(42px,10vw,52px)", fontWeight: 300,
      color: "#e8e8e8", margin: "0 0 48px", letterSpacing: "2px",
    },
    langBtns: { display: "flex", gap: 16, width: "100%", justifyContent: "center" },
    langBtn: (active) => ({
      background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 99, padding: "12px 32px", color: "#e8e8e8", fontSize: 16,
      fontFamily: serif, cursor: "pointer", transition: "all 0.3s ease",
    }),
    // Auto-advance screen text — larger, softer, no button
    driftText: {
      fontFamily: serif, fontSize: "clamp(26px, 7vw, 32px)",
      color: "rgba(255,255,255,0.85)", lineHeight: 1.5,
      margin: 0, fontWeight: 300, fontStyle: "italic",
    },
    // CTA screen
    ctaWrap: { width: "100%", display: "flex", flexDirection: "column", alignItems: "center" },
    glassResetBtn: {
      background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.2)", borderRadius: "16px",
      padding: "24px 20px", width: "100%",
      color: "#ffffff", fontFamily: sans, fontSize: "clamp(18px,5vw,22px)",
      fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: "pointer", transition: "all 0.3s ease",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)", marginBottom: "16px",
    },
    disclaimer: {
      fontFamily: sans, fontSize: "11px", color: "rgba(255,255,255,0.4)",
      letterSpacing: "0.5px", textAlign: "center",
    },
    skipBtn: {
      position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
      background: "transparent", border: "none", color: "rgba(255,255,255,0.4)",
      fontFamily: sans, fontSize: "14px", letterSpacing: "1px",
      textTransform: "uppercase", cursor: "pointer",
      textDecoration: "underline", textUnderlineOffset: "4px",
      transition: "color 0.2s", padding: "12px 24px",
    },
    // Dot indicators for screens 1-3
    dots: {
      display: "flex", gap: 8, marginTop: 40, alignItems: "center",
    },
    dot: (active) => ({
      width: active ? 6 : 4, height: active ? 6 : 4,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.5)",
      opacity: active ? 0.8 : 0.25,
      transition: "all 0.4s ease",
    }),
  };

  return (
    <div style={st.page}>
      <div style={st.wrapper}>

        {/* SCREEN 0 — Language picker (stays until tapped) */}
        {screen === 0 && (
          <>
            <h1 style={st.title}>JSukoon</h1>
            <div style={st.langBtns}>
              {/* Hindi first */}
              <button onClick={() => chooseLang("Hindi")} style={st.langBtn(lang === "Hindi")}>हिंदी</button>
              <button onClick={() => chooseLang("English")} style={st.langBtn(lang === "English")}>English</button>
            </div>
          </>
        )}

        {/* SCREEN 1 — auto-advances */}
        {screen === 1 && (
          <>
            <p style={st.driftText}>
              {hi ? "यह आपकी जगह है।" : "This is your space."}
            </p>
            <div style={st.dots}>
              <div style={st.dot(true)} />
              <div style={st.dot(false)} />
              <div style={st.dot(false)} />
            </div>
          </>
        )}

        {/* SCREEN 2 — auto-advances */}
        {screen === 2 && (
          <>
            <p style={st.driftText}>
              {hi ? "कोई दबाव नहीं। कोई शोर नहीं।" : "No pressure. No noise."}
            </p>
            <div style={st.dots}>
              <div style={st.dot(false)} />
              <div style={st.dot(true)} />
              <div style={st.dot(false)} />
            </div>
          </>
        )}

        {/* SCREEN 3 — auto-advances */}
        {screen === 3 && (
          <>
            <p style={st.driftText}>
              {hi ? "बस एक मिनट।" : "Just one minute."}
            </p>
            <div style={st.dots}>
              <div style={st.dot(false)} />
              <div style={st.dot(false)} />
              <div style={st.dot(true)} />
            </div>
          </>
        )}

        {/* SCREEN 4 — CTA, stays until tapped */}
        {screen === 4 && (
          <div style={st.ctaWrap}>
            <button onClick={() => handleComplete('reset')} style={st.glassResetBtn}>
              {hi
                ? <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-मिनट का रीसेट लें</>
                : <><span style={{fontFamily:"'DM Sans',sans-serif"}}>1</span>-MINUTE RESET</>}
            </button>
            <p style={st.disclaimer}>
              {hi
                ? "यह एक सरल निर्देशित अनुभव है, चिकित्सा सलाह नहीं।"
                : "A simple guided experience, not medical advice."}
            </p>
          </div>
        )}

      </div>

      {/* Skip — only visible on CTA screen */}
      {screen === 4 && (
        <button onClick={() => handleComplete('home')} style={st.skipBtn}>
          {hi ? "स्किप करें" : "Skip"}
        </button>
      )}
    </div>
  );
}
