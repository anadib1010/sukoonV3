import React, { useState, useEffect } from 'react';

export function Resonance({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const GAMES = [
    {
      id: 'quietcorner',
      title:    hi ? "शांत कोना"          : "The Quiet Corner",
      subtitle: hi ? "वास्तु शास्त्र"     : "Vastu Shastra",
      desc:     hi ? "लाइव कंपास के साथ अपना ध्यान का केंद्र खोजें।" : "Find your magnetic center for meditation using the live compass.",
      icon: "🧭",
    },
    {
      id: 'soundbath',
      title:    hi ? "ध्वनि स्नान"        : "The Singing Bowl",
      subtitle: hi ? "नाद योग"            : "Nada Yoga",
      desc:     hi ? "गहरी आवृत्तियों के साथ अपने मन को शांत करें।" : "Wash away anxiety with deep, grounding frequencies.",
      icon: "🥣",
    },
    {
      id: 'mandala',
      title:    hi ? "मंडला प्रवाह"       : "Mandala Flow",
      subtitle: hi ? "पवित्र ज्यामिति"   : "Sacred Geometry",
      desc:     hi ? "ध्यान केंद्रित करें और अपनी ऊर्जा साझा करें।" : "Draw, focus, and share your unique geometry with the world.",
      icon: "✨",
    },
    {
      id: 'seedinmud',
      title:    hi ? "कीचड़ में बीज"      : "Seed in the Mud",
      subtitle: hi ? "धैर्य और श्वास"    : "Trust & Patience",
      desc:     hi ? "दिव्य समय और धैर्य का अभ्यास करें।" : "A deep breathing practice to teach the concept of divine timing.",
      icon: "🌱",
    },
  ];

  const accent = "#376ed4";

  // ─── STYLES ───
  const s = {
    page: {
      height: "100%",
      width: "100%",
      backgroundColor: "#05050a",
      color: "#fff",
      padding: "70px 20px 80px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
      overflowX: "hidden",
      position: "relative",
    },

    nav: {
      position: "absolute",
      top: 20, left: 20, right: 20,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 20,
    },

    navBtn: {
      background: "none", border: "none",
      color: "rgba(255,255,255,0.5)",
      fontSize: 14, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 6,
      transition: "color 0.2s",
    },

    header: {
      textAlign: "center",
      marginBottom: 40,
      flexShrink: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },

    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 36, fontWeight: 300,
      color: accent, margin: "0 0 10px",
    },

    subtitle: {
      color: "rgba(255,255,255,0.6)",
      fontSize: 16, fontStyle: "italic",
      maxWidth: 300, margin: "0 auto",
    },

    list: {
      width: "100%",
      maxWidth: 500,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      flexShrink: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
    },

    card: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 16,
      padding: 20,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 20,
      transition: "background 0.3s ease, transform 0.2s ease",
    },

    iconCircle: {
      fontSize: 32,
      background: "rgba(0,0,0,0.3)",
      width: 60, height: 60,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    cardInfo: { flex: 1 },

    cardTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 20, margin: "0 0 4px",
      color: "#fff",
    },

    cardSubtitle: {
      display: "inline-block",
      fontSize: 11,
      color: "#d4af37",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
    },

    cardDesc: {
      margin: 0,
      fontSize: 13,
      color: "rgba(255,255,255,0.5)",
      lineHeight: 1.4,
    },

    cardArrow: { color: "rgba(255,255,255,0.2)", fontSize: 20 },

    descendWrap: {
      marginTop: 50,
      marginBottom: 20,
      flexShrink: 0,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.6s ease 0.2s",
    },

    descendBtn: {
      background: "transparent",
      border: `1px solid ${accent}80`,
      color: accent,
      padding: "14px 40px",
      borderRadius: 30,
      fontSize: 18,
      fontFamily: "'Cormorant Garamond', serif",
      cursor: "pointer",
      transition: "all 0.3s ease",
      letterSpacing: 1,
    },
  };

  return (
    <div style={s.page}>

      {/* Nav */}
      <div style={s.nav}>
        <button
          onClick={() => setTab("vault")}
          style={s.navBtn}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.9)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
        >
          ← {hi ? "वापस" : "Back"}
        </button>
        <button
          onClick={() => setTab("home")}
          style={s.navBtn}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.9)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
        >
          {hi ? "होम" : "Home"} 🏠
        </button>
      </div>

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>{hi ? "अनुनाद" : "Resonance"}</h1>
        <p style={s.subtitle}>
          {hi
            ? "अपने आस-पास की दुनिया और ब्रह्मांड के साथ तालमेल बिठाएं।"
            : "Harmonize with the world around you and the universe beyond."}
        </p>
      </div>

      {/* Game list */}
      <div style={s.list}>
        {GAMES.map(game => (
          <div
            key={game.id}
            onClick={() => setTab(game.id)}
            style={s.card}
            onMouseEnter={e => { e.currentTarget.style.background = `rgba(55,160,212,0.1)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}
            onTouchStart={e => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.transition = "transform 0.1s ease"; }}
            onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.transition = "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"; }}
          >
            <div style={s.iconCircle}>{game.icon}</div>
            <div style={s.cardInfo}>
              <h3 style={s.cardTitle}>{game.title}</h3>
              <span style={s.cardSubtitle}>{game.subtitle}</span>
              <p style={s.cardDesc}>{game.desc}</p>
            </div>
            <div style={s.cardArrow}>›</div>
          </div>
        ))}
      </div>

      {/* Descend to Stillness */}
      <div style={s.descendWrap}>
        <button
          onClick={() => setTab("stillness")}
          style={s.descendBtn}
          onMouseEnter={e => e.currentTarget.style.background = `rgba(55,153,223,0.1)`}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {hi ? "अंतिम स्तर: स्थिरता की ओर बढ़ें" : "Enter the Final Layer: Stillness"}
        </button>
      </div>

    </div>
  );
}
