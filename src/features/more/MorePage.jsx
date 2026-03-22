import React, { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { BrandHeader } from '../../components/BrandHeader'; 

export function MorePage({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  useEffect(() => {
    track('View Explore Page');
  }, []);

  // ─── STYLES (Rule of T) ───
  const s = {
    page: {
      minHeight: "100dvh", width: "100%",
      background: T.bg, color: T.text, 
      padding: "2vh 24px 120px", 
      boxSizing: "border-box",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative" // This keeps all absolute elements locked inside the 600px center!
    },

    // ─── 🏠 TOP RIGHT HOME BUTTON ───
    homeBtn: {
      position: "absolute",
      top: "3vh", // Aligns beautifully with the BrandHeader
      right: "24px",
      background: "none",
      border: "none",
      color: T.text,
      fontSize: "22px",
      cursor: "pointer",
      opacity: 0.8,
      zIndex: 10,
      transition: "opacity 0.2s ease"
    },

    // ─── ⬅️ BOTTOM LEFT BACK BUTTON ───
    backBtn: {
      position: "absolute",
      bottom: "30px", // Keeps it safely above the bottom edge of the 600px container
      left: "24px",
      background: "none",
      border: "none",
      color: T.text,
      fontSize: "14px",
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: "1px",
      textTransform: "uppercase",
      cursor: "pointer",
      opacity: 0.6,
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "opacity 0.2s ease"
    },

    grid: {
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
      width: "100%", maxWidth: "340px",
    },
    card: {
      background: `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}15 100%)`,
      border: `1px solid ${T.accent}30`, borderRadius: "16px",
      padding: "24px 16px", display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center", cursor: "pointer", color: T.text,
      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    },
    icon: { fontSize: "32px", marginBottom: "12px", opacity: 0.9 },
    cardTitle: { fontSize: "13px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 },

    footerLink: {
      marginTop: "auto", 
      paddingTop: "60px",
      textAlign: "center", 
      cursor: "pointer",
      background: "none",
      border: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    footerMain: { 
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "24px", 
      letterSpacing: "4px", 
      textTransform: "uppercase", 
      fontWeight: 500, 
      color: T.text,
      margin: 0,
      opacity: 0.9,
      transition: "opacity 0.3s ease"
    },
    footerSub: {
      fontSize: "12px",
      letterSpacing: "1px",
      opacity: 0.6,
      marginTop: "4px",
      color: T.text
    }
  };

  const features = [
    { id: 'bench', icon: '🪑', nameEn: 'Sanctuary', nameHi: 'अभयारण्य' },
    { id: 'warmth', icon: '🕯️', nameEn: 'Warmth', nameHi: 'गर्माहट' },
    { id: 'focus', icon: '⏳', nameEn: 'Focus', nameHi: 'फ़ोकस' },
    { id: 'journal', icon: '✍️', nameEn: 'Journal', nameHi: 'जर्नल' },
    { id: 'audio', icon: '🎧', nameEn: 'Audio', nameHi: 'ऑडियो' },
    { id: 'settings', icon: '⚙️', nameEn: 'Settings', nameHi: 'सेटिंग्स' },
  ];

  return (
    <div style={s.page}>
      
      {/* 🏠 NEW HOME BUTTON */}
      <button 
        style={s.homeBtn} 
        onClick={() => setTab('home')}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
      >
        🏠
      </button>

      <BrandHeader T={T} />

      <div style={s.grid}>
        {features.map((feature) => (
          <div 
            key={feature.id} onClick={() => setTab(feature.id)} style={s.card}
            onMouseEnter={e => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${T.accent}20 0%, ${T.accent}40 100%)`;
              e.currentTarget.style.border = `1px solid ${T.accent}80`;
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}15 100%)`;
              e.currentTarget.style.border = `1px solid ${T.accent}30`;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={s.icon}>{feature.icon}</div>
            <h2 style={s.cardTitle}>{hi ? feature.nameHi : feature.nameEn}</h2>
          </div>
        ))}
      </div>

      <button 
        style={s.footerLink} 
        onClick={() => setTab('exploremore')}
        onMouseEnter={e => e.currentTarget.firstChild.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.firstChild.style.opacity = 0.9}
      >
        <h2 style={s.footerMain}>{hi ? "और अधिक खोजें" : "EXPLORE MORE"}</h2>
      </button>

      {/* ⬅️ INLINE BACK BUTTON (Locked perfectly inside the 600px center) */}
      <button 
        style={s.backBtn} 
        onClick={() => setTab('home')}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        ← {hi ? "वापस" : "Back"}
      </button>

    </div>
  );
}