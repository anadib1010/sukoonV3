import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';

export function MorePage({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);
  const [showDeep, setShowDeep] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ─── STYLES (Rule of T) ───
  const s = {
    page: { 
      height: "100%", display: "flex", flexDirection: "column", 
      background: T.bg, overflow: "hidden" 
    },
    scrollArea: { 
      flex: 1, overflowY: "auto", padding: "10px 24px 80px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },
    
    header: { textAlign: "center", marginBottom: 40, marginTop: 10 },
    title: { 
      fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 8vw, 34px)", 
      color: T.text, fontWeight: 300, margin: "0 0 8px", letterSpacing: "1px" 
    },
    subtitle: { 
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", 
      fontSize: 16, color: T.textSoft, opacity: 0.7, margin: 0 
    },

    section: { marginBottom: 36 },
    sectionLabel: { 
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 13, color: T.accent, fontWeight: 600, 
      letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 
    },
    emoji: { fontSize: 18 },

    btnGrid: { display: "grid", gap: 12 },
    btnBase: { 
      background: `linear-gradient(135deg, ${T.accent}08 0%, transparent 100%)`, 
      border: `1px solid ${T.accent}20`, borderRadius: 16, 
      padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
      cursor: "pointer", transition: "all 0.3s ease", textAlign: "left", width: "100%"
    },
    btnIcon: { fontSize: 24, opacity: 0.9 },
    btnText: { 
      fontFamily: "'DM Sans', sans-serif", fontSize: 15, 
      color: T.text, fontWeight: 500, letterSpacing: "0.5px" 
    },
    
    expandBtn: {
      background: "transparent", border: "none", color: T.textSoft,
      fontSize: 12, textTransform: "uppercase", letterSpacing: "2px",
      cursor: "pointer", marginTop: 12, opacity: 0.6, width: "100%", textAlign: "center",
      transition: "opacity 0.3s ease"
    },

    deepSection: { 
      marginTop: 48, paddingTop: 32, borderTop: `1px solid ${T.accent}15`, textAlign: "center" 
    },
    deepNote: {
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: 14, color: T.textSoft, opacity: 0.6, marginBottom: 16
    },
    deepBtn: {
      background: "transparent", border: `1px solid ${T.accent}30`,
      borderRadius: 99, padding: "12px 32px", color: T.text,
      fontFamily: "'Cormorant Garamond', serif", fontSize: 16, cursor: "pointer",
      transition: "all 0.3s ease"
    },

    // NEW: Utility Section for Settings
    utilityWrap: {
      marginTop: 60, display: "flex", justifyContent: "center", paddingBottom: 20
    },
    settingsBtn: {
      background: "transparent", border: `1px solid rgba(255,255,255,0.1)`,
      borderRadius: 99, padding: "10px 24px", color: T.textSoft,
      fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "1.5px",
      textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease",
      display: "flex", alignItems: "center", gap: 10, opacity: 0.7
    }
  };

  return (
    <div style={s.page}>
      <PageNav onBack={() => setTab("home")} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div style={s.scrollArea}>
        
        <div style={s.header}>
          <h1 style={s.title}>{hi ? "अपनी गति से खोजें" : "Explore at your own pace"}</h1>
          <p style={s.subtitle}>{hi ? "जो चाहिए वो लें, बाकी छोड़ दें" : "Take what you need, leave the rest"}</p>
        </div>

        <div style={s.section}>
          <div style={s.sectionLabel}>
            <span style={s.emoji}>🌿</span>
            {hi ? "अगर कुछ अभी भी आपके मन में है" : "If something is still on your mind"}
          </div>
          <div style={s.btnGrid}>
            <button onClick={() => setTab('journal')} style={s.btnBase} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
              <span style={s.btnIcon}>✍️</span>
              <span style={s.btnText}>{hi ? "इसे बाहर निकालें" : "Let it out"}</span>
            </button>
            <button onClick={() => setTab('audio')} style={s.btnBase} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
              <span style={s.btnIcon}>🔊</span>
              <span style={s.btnText}>{hi ? "ज़ोर से बोलें" : "Say it out loud"}</span>
            </button>
            
            {showDeep && (
              <button onClick={() => setTab('focus')} style={{...s.btnBase, opacity: 0.8}} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
                <span style={s.btnIcon}>🧩</span>
                <span style={s.btnText}>{hi ? "इसे धीरे से सुलझाएं" : "Untangle it gently"}</span>
              </button>
            )}
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionLabel}>
            <span style={s.emoji}>🌙</span>
            {hi ? "अगर आप एक शांत जगह पर रहना चाहते हैं" : "If you want to stay in a calm space"}
          </div>
          <div style={s.btnGrid}>
            <button onClick={() => setTab('bench')} style={s.btnBase} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
              <span style={s.btnIcon}>🌿</span>
              <span style={s.btnText}>{hi ? "अभयारण्य में बैठें" : "Sit in Sanctuary"}</span>
            </button>
            <button onClick={() => setTab('quietcorner')} style={s.btnBase} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
              <span style={s.btnIcon}>🫧</span>
              <span style={s.btnText}>{hi ? "शांत कोना" : "Quiet Corner"}</span>
            </button>
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionLabel}>
            <span style={s.emoji}>🔄</span>
            {hi ? "अगर आप अपना मूड बदलना चाहते हैं" : "If you want to shift how you feel"}
          </div>
          <div style={s.btnGrid}>
            <button onClick={() => setTab('practice')} style={s.btnBase} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
              <span style={s.btnIcon}>🪶</span>
              <span style={s.btnText}>{hi ? "बोझ हल्का करें" : "Lighten the weight"}</span>
            </button>
            <button onClick={() => setTab('seedinmud')} style={s.btnBase} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
              <span style={s.btnIcon}>🌱</span>
              <span style={s.btnText}>{hi ? "नई शुरुआत करें" : "Start fresh"}</span>
            </button>
            
            {showDeep && (
              <button onClick={() => setTab('descent')} style={{...s.btnBase, opacity: 0.8}} onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}>
                <span style={s.btnIcon}>🌊</span>
                <span style={s.btnText}>{hi ? "गहराई में जाएं" : "Go deeper"}</span>
              </button>
            )}
          </div>
          
          {!showDeep && (
            <button onClick={() => setShowDeep(true)} style={s.expandBtn} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.6}>
              {hi ? "और दिखाएं" : "Show more paths"}
            </button>
          )}
        </div>

        <div style={s.deepSection}>
          <div style={{ ...s.sectionLabel, justifyContent: "center" }}>
            <span style={s.emoji}>🌌</span>
            {hi ? "अगर आप गहराई में जाने के लिए तैयार हैं" : "If you feel ready to go deeper"}
          </div>
          <p style={s.deepNote}>
            {hi ? "कुछ अनुभव समय के साथ खुद को प्रकट करते हैं।" : "Some experiences reveal themselves over time."}
          </p>
          <button 
            onClick={() => setTab('vault')} 
            style={s.deepBtn}
            onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} 
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            ✨ {hi ? "गहरी जगहें" : "Deeper spaces"}
          </button>
        </div>

        {/* SETTINGS UTILITY BUTTON */}
        <div style={s.utilityWrap}>
          <button 
            onClick={() => setTab('settings')} 
            style={s.settingsBtn}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.opacity = 1; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.opacity = 0.7; }}
          >
            <span style={{ fontSize: "16px" }}>⚙️</span> 
            {hi ? "सेटिंग्स" : "Settings"}
          </button>
        </div>

      </div>
    </div>
  );
}