import React, { useState } from 'react';
import { PageNav } from '../../components/SharedUI';
import { THEMES } from '../../utils/theme';

export function Settings({ 
  setTab, goBack, T, lang, 
  setThemeKey, setThemeSource, setLang, 
  themeSource, themeKey 
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [prevThemeKey, setPrevThemeKey] = useState(null);
  const hi = lang === "Hindi";

  const handleThemeChange = (key) => {
    setPrevThemeKey(themeKey); // Store current as "previous" for the toggle
    setThemeKey(key);
  };

  const toggleComparison = () => {
    if (prevThemeKey) {
      const current = themeKey;
      setThemeKey(prevThemeKey);
      setPrevThemeKey(current);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, color: T.text, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} T={T} lang={lang} />
      
      <div className="scroll-area fade-up" style={{ flex: 1, overflowY: "auto", padding: "10px 24px 80px" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>
            {hi ? "सेटिंग्स" : "Settings"}
          </h1>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6 }}>
            {hi ? "अपने अनुभव को अपनी पसंद के अनुसार ढालें।" : "Shape this space to feel like yours."}
          </p>
        </div>

        {/* 1. PWA INSTALLATION */}
        <div style={{ marginBottom: 32, padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: `1px solid ${T.accent}40` }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📱</span> {hi ? "JSukoon इंस्टॉल करें" : "Install JSukoon"}
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: T.textSoft, lineHeight: 1.8 }}>
            <li>{hi ? "Safari या Chrome में 'Share' आइकन दबाएं" : "Tap Share in Safari or Chrome"}</li>
            <li>{hi ? "'Add to Home Screen' चुनें" : "Select 'Add to Home Screen'"}</li>
          </ol>
        </div>

        {/* 2. LANGUAGE TOGGLE */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{hi ? "भाषा" : "Language"}</p>
          <div style={{ display: "flex", gap: 12 }}>
            {["English", "Hindi"].map(l => (
              <button key={l} onClick={() => setLang(l)} 
                style={{ flex: 1, padding: "14px", borderRadius: 16, background: lang === l ? `${T.accent}20` : "rgba(255,255,255,0.03)", border: `1px solid ${lang === l ? T.accent : "transparent"}`, color: lang === l ? T.accent : T.textSoft }}>
                {l === "Hindi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>
        </div>

        {/* 3. THEME BEHAVIOR */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{hi ? "थीम मोड" : "Theme Mode"}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setThemeSource("auto")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: themeSource === "auto" ? `${T.accent}15` : "rgba(255,255,255,0.03)", border: `1px solid ${themeSource === "auto" ? T.accent : "transparent"}`, textAlign: "left" }}>
              <span style={{ fontSize: 24 }}>🌤️</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: themeSource === "auto" ? T.accent : T.text }}>{hi ? "ऑटो (मूड)" : "Auto (Mood)"}</p>
                <p style={{ margin: 0, fontSize: 11, color: T.textSoft }}>{hi ? "मूड के साथ रंग बदलें" : "Colors shift with your mood"}</p>
              </div>
            </button>
            <button onClick={() => setThemeSource("manual")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: themeSource === "manual" ? `${T.accent}15` : "rgba(255,255,255,0.03)", border: `1px solid ${themeSource === "manual" ? T.accent : "transparent"}`, textAlign: "left" }}>
              <span style={{ fontSize: 24 }}>🎨</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: themeSource === "manual" ? T.accent : T.text }}>{hi ? "मैनुअल (स्थिर)" : "Manual (Fixed)"}</p>
                <p style={{ margin: 0, fontSize: 11, color: T.textSoft }}>{hi ? "अपना पसंदीदा रंग चुनें" : "Pick a permanent color"}</p>
              </div>
            </button>
          </div>
        </div>

        {/* 4. THE 12 THEME GRID & COMPARISON */}
        {themeSource === "manual" && (
          <div style={{ marginBottom: 40 }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{hi ? "रंग चुनें" : "Select Palette"}</p>
              {prevThemeKey && (
                <button onClick={toggleComparison} style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}40`, padding: "4px 10px", borderRadius: 8, fontSize: 10, color: T.accent, cursor: "pointer" }}>
                  {hi ? "पिछली थीम देखें" : "Toggle Previous"}
                </button>
              )}
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {Object.keys(THEMES).map(key => {
                const theme = THEMES[key];
                const isSelected = themeKey === key;
                return (
                  <button key={key} onClick={() => handleThemeChange(key)} 
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer" }}>
                    <div style={{ 
                      width: 52, height: 52, borderRadius: "14px", 
                      background: theme.bg, 
                      border: `2.5px solid ${isSelected ? theme.accent : "rgba(255,255,255,0.1)"}`, 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: isSelected ? `0 0 15px ${theme.accent}40` : "none",
                      transition: "all 0.3s ease"
                    }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: theme.accent }} />
                    </div>
                    <span style={{ fontSize: 10, color: isSelected ? T.accent : T.textSoft, textAlign: "center", fontWeight: isSelected ? 600 : 400 }}>
                      {hi ? (theme.nameH || key) : (theme.name || key)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. DATA MANAGEMENT */}
        <div style={{ borderTop: `1px solid ${T.borderWarm}`, paddingTop: 32, marginBottom: 40 }}>
           <button onClick={() => {
             if(confirmClear) { localStorage.clear(); window.location.reload(); }
             else setConfirmClear(true);
           }} 
            style={{ width: "100%", padding: "16px", borderRadius: 16, background: "rgba(224, 102, 102, 0.08)", border: "1px solid rgba(224, 102, 102, 0.3)", color: "#e06666", fontSize: 14, fontWeight: 500 }}>
            {confirmClear ? (hi ? "निश्चित? सब कुछ मिटाएं" : "Sure? Erase Everything") : (hi ? "सारा डेटा मिटाएं" : "Clear All App Data")}
          </button>
        </div>

        {/* 6. LEGAL & INFO FOOTER */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", paddingBottom: 40 }}>
          <button onClick={() => setTab("about")} style={{ background: "none", border: "none", color: T.textSoft, fontSize: 13, textDecoration: "underline" }}>{hi ? "JSukoon के बारे में" : "About JSukoon"}</button>
          <button onClick={() => setTab("privacy")} style={{ background: "none", border: "none", color: T.textSoft, fontSize: 13, textDecoration: "underline" }}>{hi ? "गोपनीयता नीति" : "Privacy Policy"}</button>
          <button onClick={() => setTab("legal")} style={{ background: "none", border: "none", color: T.textSoft, fontSize: 11, opacity: 0.5, textAlign: "center", maxWidth: "80%" }}>
            {hi ? "कानूनी अस्वीकरण और शर्तें" : "Long Detailed Legal Disclaimer"}
          </button>
        </div>

      </div>
    </div>
  );
}