import React, { useEffect } from 'react';
import { track } from '@vercel/analytics';

export function MorePage({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  useEffect(() => {
    track('View Explore Page');
  }, []);

  // ─── STYLES (The Architect's Precision) ───
  const s = {
    page: {
      minHeight: "100dvh", 
      width: "100%",
      background: T.bg, 
      color: T.text, 
      padding: "6vh 24px",
      boxSizing: "border-box",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "40px",
    },
    backBtn: {
      background: "transparent",
      border: `1px solid ${T.accent}40`,
      borderRadius: "50%",
      width: "44px", height: "44px",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: T.text,
      fontSize: "20px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "32px",
      fontWeight: 400,
      margin: 0,
      letterSpacing: "2px",
    },
    spacer: {
      width: "44px", // To perfectly center the title between the back button and the right edge
    },
    
    // The beautiful grid layout
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr", // Two columns side-by-side
      gap: "16px",
      width: "100%",
    },
    
    // The Glassmorphism Tiles
    card: {
      background: `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}15 100%)`,
      border: `1px solid ${T.accent}30`,
      borderRadius: "16px",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      cursor: "pointer",
      color: T.text,
      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    },
    icon: {
      fontSize: "32px",
      marginBottom: "12px",
      opacity: 0.9,
    },
    cardTitle: {
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      margin: 0,
    }
  };

  // Helper function for the premium hover lift
  const handleHover = (e, isEnter) => {
    if (isEnter) {
      e.currentTarget.style.background = `linear-gradient(135deg, ${T.accent}20 0%, ${T.accent}40 100%)`;
      e.currentTarget.style.border = `1px solid ${T.accent}80`;
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
    } else {
      e.currentTarget.style.background = `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}15 100%)`;
      e.currentTarget.style.border = `1px solid ${T.accent}30`;
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    }
  };

  // A list of all our rooms so we can easily map them into beautiful cards
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
      
      {/* 1. THE TOP NAVIGATION BAR */}
      <div style={s.header}>
        <button 
          onClick={() => setTab('home')} 
          style={s.backBtn}
          onMouseEnter={e => e.currentTarget.style.background = `${T.accent}20`}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          ←
        </button>
        <h1 style={s.title}>{hi ? "खोजें" : "Explore"}</h1>
        <div style={s.spacer}></div>
      </div>

      {/* 2. THE BEAUTIFUL GRID OF TOOLS */}
      <div style={s.grid}>
        {features.map((feature) => (
          <div 
            key={feature.id}
            onClick={() => setTab(feature.id)}
            style={s.card}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            <div style={s.icon}>{feature.icon}</div>
            <h2 style={s.cardTitle}>{hi ? feature.nameHi : feature.nameEn}</h2>
          </div>
        ))}
      </div>

    </div>
  );
}