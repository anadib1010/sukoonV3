import React, { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { BrandHeader } from '../../components/BrandHeader'; 
import { BackButton } from '../../components/BackButton';   

export function MorePage({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  useEffect(() => {
    track('View Explore Page');
  }, []);

  const s = {
    page: {
      minHeight: "100dvh", width: "100%",
      background: T.bg, color: T.text, 
      padding: "2vh 24px 100px", // 100px bottom padding so content doesn't hit the bottom button
      boxSizing: "border-box",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative" // Helps keep the floating button grounded to this page
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
    cardTitle: { fontSize: "13px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }
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
      
      {/* THE BRANDING AT THE TOP */}
      <BrandHeader T={T} />

      {/* THE GRID OF TOOLS */}
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

      {/* THE BACK BUTTON AT THE BOTTOM LEFT */}
      <BackButton setTab={setTab} destination="home" T={T} lang={lang} />

    </div>
  );
}