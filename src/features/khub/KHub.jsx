import React, { useState, useEffect } from 'react';

export function KHub({ setTab, T, lang, setChatRoom }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);

  // 🛡️ The "Entrance Animation": Makes the page fade in smoothly
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // 🛡️ THE SMART DOOR LOGIC: One function to rule them all!
  const enterRoom = (roomName) => {
  if (roomName === 'Lavender Lounge') {
    setTab('chat_lavender');
  } else if (roomName === 'General K-Pop') {
    setTab('chat_kpop');
  } else if (roomName === 'K-Drama Room') {
    setTab('chat_kdrama'); // 🚀 Lead to the Peach room!
  } else {
    if (setChatRoom) setChatRoom(roomName);
    setTab('chat');
  }
};

  // ─── THE RULE OF T: STYLES INSIDE ───
  const s = {
    page: {
      height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", background: T.bg, color: T.text,
      padding: "8vh 24px 4vh", boxSizing: "border-box", textAlign: "center",
    },
    header: {
      marginBottom: "40px",
      opacity: visible ? 1 : 0, 
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.8s ease",
    },
    title: { 
      fontFamily: "'Cormorant Garamond', serif", fontSize: "42px", 
      fontWeight: 600, margin: "0 0 8px", color: T.accent 
    },
    subTitle: { 
      fontFamily: "'DM Sans', sans-serif", fontSize: "11px", 
      letterSpacing: "3px", textTransform: "uppercase", opacity: 0.6 
    },
    buttonContainer: {
      width: "100%", maxWidth: "360px", display: "flex", 
      flexDirection: "column", gap: "20px",
      opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.2s",
    },
    roomBtn: (col) => ({
      width: "100%", padding: "22px 20px", borderRadius: "18px",
      background: `linear-gradient(135deg, ${T.bg} 0%, ${col}25 50%, ${T.bg} 100%)`,
      border: `1px solid ${col}45`, color: T.text,
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "16px",
      cursor: "pointer", textAlign: "left", display: "flex", 
      alignItems: "center", gap: "18px",
      boxShadow: `0 8px 20px rgba(0, 0, 0, 0.3), 0 0 12px ${col}15`,
      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
    }),
    icon: (col) => ({
      width: "44px", height: "44px", borderRadius: "12px",
      background: `${col}20`, border: `1px solid ${col}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "22px"
    }),
    backBtn: {
      marginTop: "auto", background: "none", border: "none", color: T.textSoft,
      fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", 
      cursor: "pointer", opacity: 0.6,
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>{hi ? "के-यूनिवर्स" : "K-Universe"}</h1>
        <p style={s.subTitle}>{hi ? "अपने समुदाय को खोजें" : "FIND YOUR COMMUNITY"}</p>
      </div>

      <div style={s.buttonContainer}>
        {/* Door 1: Lavender Lounge */}
        <button 
          style={s.roomBtn("#A18CD1")} 
          onClick={() => enterRoom('Lavender Lounge')}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <div style={s.icon("#A18CD1")}>🪻</div>
          {hi ? "के-लैवेंडर लाउंज" : "K-LAVENDER LOUNGE"}
        </button>

        {/* Door 2: General K-Pop */}
        <button 
          style={s.roomBtn("#FF69B4")} 
          onClick={() => enterRoom('General K-Pop')}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <div style={s.icon("#FF69B4")}>🎤</div>
          {hi ? "सामान्य के-पॉप रूम" : "GENERAL K-POP ROOM"}
        </button>

        {/* Door 3: K-Drama Room */}
        <button 
          style={s.roomBtn("#FAD0C4")} 
          onClick={() => enterRoom('K-Drama Room')}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <div style={s.icon("#FAD0C4")}>🎬</div>
          {hi ? "के-ड्रामा रूम" : "K-DRAMA ROOM"}
        </button>
      </div>

      <button style={s.backBtn} onClick={() => setTab('home')}>
        ← {hi ? "वापस" : "BACK HOME"}
      </button>
    </div>
  );
}