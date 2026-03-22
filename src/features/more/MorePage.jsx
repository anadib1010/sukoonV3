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
    
    header: { textAlign: "center", marginBottom: 30, marginTop: 10 },
    title: { 
      fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 8vw, 34px)", 
      color: T.text, fontWeight: 300, margin: "0 0 8px", letterSpacing: "1px" 
    },
    subtitle: { 
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", 
      fontSize: 16, color: T.textSoft, opacity: 0.7, margin: 0 
    },

    // THE NEW MOSAIC GRID LAYOUT
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr", // 2 columns
      gap: "16px",
      marginBottom: "30px"
    },

    // GLASS CARD BASE
    glassCard: {
      background: "rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "20px", padding: "24px",
      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px",
      cursor: "pointer", transition: "all 0.3s ease",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      textAlign: "left"
    },

    cardIcon: { fontSize: "28px", opacity: 0.9 },
    cardTitle: {
      fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 600,
      color: T.text, margin: 0, letterSpacing: "0.5px"
    },
    cardDesc: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontStyle: "italic",
      color: T.textSoft, margin: 0, opacity: 0.8, lineHeight: 1.4
    },

    // LARGE HIGHLIGHT CARD (Takes up full width)
    heroCard: { gridColumn: "1 / -1" },

    sectionDivider: {
      display: "flex", alignItems: "center", gap: "10px", margin: "40px 0 20px",
      opacity: 0.6
    },
    line: { flex: 1, height: "1px", background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)` },
    dividerText: { fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: T.text },

    expandBtn: {
      background: "transparent", border: "none", color: T.textSoft,
      fontSize: 12, textTransform: "uppercase", letterSpacing: "2px",
      cursor: "pointer", margin: "10px auto 30px", opacity: 0.6, width: "100%", textAlign: "center",
      transition: "opacity 0.3s ease", display: "block"
    },

    deepBtn: {
      background: "transparent", border: `1px solid ${T.accent}30`,
      borderRadius: 99, padding: "14px 40px", color: T.text,
      fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer",
      transition: "all 0.3s ease", display: "flex", margin: "0 auto", gap: "10px"
    },

    utilityWrap: { marginTop: 60, display: "flex", justifyContent: "center", paddingBottom: 20 },
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

        {/* TOP LAYER: The "Mind" Grid */}
        <div style={s.grid}>
          
          {/* THE HERO CARD: Merged Journal & Audio */}
          <button 
            onClick={() => setTab('journal')} 
            style={{...s.glassCard, ...s.heroCard}} 
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"} 
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"}
          >
            <div style={s.cardIcon}>✍️</div>
            <div>
              <p style={s.cardTitle}>{hi ? "इसे बाहर निकालें" : "Let it out"}</p>
              <p style={s.cardDesc}>{hi ? "अपने विचार स्वतंत्र रूप से लिखें या बोलें।" : "Write or speak your thoughts freely."}</p>
            </div>
          </button>

          {/* TWO COLUMN GRID FOR REST/SHIFT */}
          <button onClick={() => setTab('bench')} style={s.glassCard} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
            <div style={s.cardIcon}>🌿</div>
            <div>
              <p style={s.cardTitle}>{hi ? "अभयारण्य" : "Sanctuary"}</p>
              <p style={s.cardDesc}>{hi ? "बस बैठें और सुनें।" : "Just sit and listen."}</p>
            </div>
          </button>

          <button onClick={() => setTab('quietcorner')} style={s.glassCard} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
            <div style={s.cardIcon}>🫧</div>
            <div>
              <p style={s.cardTitle}>{hi ? "शांत कोना" : "Quiet Corner"}</p>
              <p style={s.cardDesc}>{hi ? "शांत दृश्य।" : "Calming visuals."}</p>
            </div>
          </button>

          <button onClick={() => setTab('practice')} style={s.glassCard} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
            <div style={s.cardIcon}>🪶</div>
            <div>
              <p style={s.cardTitle}>{hi ? "बोझ हल्का करें" : "Lighten weight"}</p>
              <p style={s.cardDesc}>{hi ? "मार्गदर्शित राहत।" : "Guided relief."}</p>
            </div>
          </button>

          <button onClick={() => setTab('seedinmud')} style={s.glassCard} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
            <div style={s.cardIcon}>🌱</div>
            <div>
              <p style={s.cardTitle}>{hi ? "नई शुरुआत" : "Start fresh"}</p>
              <p style={s.cardDesc}>{hi ? "कीचड़ में बीज।" : "Seed in the mud."}</p>
            </div>
          </button>

          {/* HIDDEN DEEPER PATHS */}
          {showDeep && (
            <>
              <button onClick={() => setTab('focus')} style={s.glassCard} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                <div style={s.cardIcon}>🧩</div>
                <div>
                  <p style={s.cardTitle}>{hi ? "सुलझाएं" : "Untangle"}</p>
                  <p style={s.cardDesc}>{hi ? "गहराई से सोचें।" : "Think it through."}</p>
                </div>
              </button>
              
              <button onClick={() => setTab('descent')} style={s.glassCard} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                <div style={s.cardIcon}>🌊</div>
                <div>
                  <p style={s.cardTitle}>{hi ? "गहराई में" : "The Descent"}</p>
                  <p style={s.cardDesc}>{hi ? "भावनाओं से गुजरें।" : "Move through it."}</p>
                </div>
              </button>
            </>
          )}
        </div>

        {!showDeep && (
          <button onClick={() => setShowDeep(true)} style={s.expandBtn} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.6}>
            {hi ? "और रास्ते दिखाएं" : "Show more paths"}
          </button>
        )}

        {/* VAULT SECTION */}
        <div style={s.sectionDivider}>
          <div style={s.line} />
          <span style={s.dividerText}>{hi ? "गहरी जगहें" : "Deeper Spaces"}</span>
          <div style={s.line} />
        </div>

        <button 
          onClick={() => setTab('vault')} 
          style={s.deepBtn}
          onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`} 
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span>✨</span>
          {hi ? "वॉल्ट में प्रवेश करें" : "Enter the Vault"}
        </button>

        {/* SETTINGS */}
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