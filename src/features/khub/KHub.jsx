import React, { useState, useEffect } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 K-HUB — Room Selection
// 5 rooms: Lavender Lounge, General K-Pop, K-Drama,
//          Purple Lounge (BTS fans), Blink Lounge (BP fans)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function KHub({ setTab, T, lang, setChatRoom }) {
  const hi = lang === 'Hindi';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ─── THE SMART DOOR LOGIC ───
  const enterRoom = (roomName) => {
    if (roomName === 'Lavender Lounge') {
      setTab('chat_lavender');
    } else if (roomName === 'General K-Pop') {
      setTab('chat_kpop');
    } else if (roomName === 'K-Drama Room') {
      setTab('chat_kdrama');
    } else if (roomName === 'Purple Lounge') {
      setTab('chat_purple');
    } else if (roomName === 'Blink Lounge') {
      setTab('chat_blink');
    } else if (roomName === 'Purple Sanctuary') {
      // 🌟 NEW: The secret door to our sanctuary!
      setTab('purple_sanctuary');
    } else {
      if (setChatRoom) setChatRoom(roomName);
      setTab('chat');
    }
  };

  // ─── THE RULE OF T: STYLES INSIDE ───
  const s = {
    page: {
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', background: T.bg, color: T.text,
      padding: '8vh 24px 4vh', boxSizing: 'border-box', textAlign: 'center',
      overflowY: 'auto',
    },
    header: {
      marginBottom: '32px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.8s ease',
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: '42px',
      fontWeight: 600, margin: '0 0 8px', color: T.accent,
    },
    subTitle: {
      fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
      letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.6,
    },
    disclaimer: {
      fontSize: '10px', opacity: 0.4, lineHeight: 1.6,
      maxWidth: '320px', margin: '8px auto 0',
      fontFamily: "'DM Sans', sans-serif",
    },
    buttonContainer: {
      width: '100%', maxWidth: '360px', display: 'flex',
      flexDirection: 'column', gap: '16px',
      opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.2s',
    },
    // ─── Section label ───
    sectionLabel: {
      fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
      opacity: 0.4, textAlign: 'left', paddingLeft: '4px',
      fontFamily: "'DM Sans', sans-serif", marginBottom: '-6px',
    },
    roomBtn: (col) => ({
      width: '100%', padding: '18px 20px', borderRadius: '18px',
      background: `linear-gradient(135deg, ${T.bg} 0%, ${col}20 50%, ${T.bg} 100%)`,
      border: `1px solid ${col}40`, color: T.text,
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '15px',
      cursor: 'pointer', textAlign: 'left', display: 'flex',
      alignItems: 'center', gap: '16px',
      boxShadow: `0 6px 18px rgba(0,0,0,0.25), 0 0 10px ${col}12`,
      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    }),
    icon: (col) => ({
      width: '42px', height: '42px', borderRadius: '12px',
      background: `${col}18`, border: `1px solid ${col}35`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '20px', flexShrink: 0,
    }),
    btnText: {
      display: 'flex', flexDirection: 'column', gap: '2px',
    },
    btnSub: {
      fontSize: '10px', opacity: 0.45, fontWeight: 400,
      letterSpacing: '0.5px',
    },
    backBtn: {
      marginTop: 'auto', paddingTop: '24px',
      background: 'none', border: 'none', color: T.textSoft,
      fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px',
      cursor: 'pointer', opacity: 0.5,
    },
  };

  const rooms = [
    { name: 'Purple Lounge',  icon: '💜', col: '#9B59B6', label: hi ? 'पर्पल लाउंज'      : 'PURPLE LOUNGE',    sub: hi ? 'BTS fans • अनधिकृत'       : 'BTS fans · Unofficial'       },
    { name: 'Blink Lounge',   icon: '🌸', col: '#E91E8C', label: hi ? 'ब्लिंक लाउंज'     : 'BLINK LOUNGE',     sub: hi ? 'BLACKPINK fans • अनधिकृत' : 'BLACKPINK fans · Unofficial'  },
    { name: 'Lavender Lounge',icon: '🪻', col: '#A18CD1', label: hi ? 'के-लैवेंडर लाउंज' : 'LAVENDER LOUNGE',  sub: hi ? 'Multi-fandom chill space'  : 'Multi-fandom chill space'    },
    { name: 'General K-Pop',  icon: '🎤', col: '#FF69B4', label: hi ? 'के-पॉप रूम'       : 'GENERAL K-POP',    sub: hi ? 'सभी K-Pop fans के लिए'    : 'All K-Pop fans welcome'      },
  ];

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
    maxWidth: '360px',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.8s ease 0.2s',
  };

  const gridBtn = (col) => ({
    padding: '16px 12px',
    borderRadius: '18px',
    background: `linear-gradient(135deg, ${T.bg} 0%, ${col}22 100%)`,
    border: `1px solid ${col}40`,
    color: T.text,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    boxShadow: `0 4px 14px rgba(0,0,0,0.2), 0 0 8px ${col}12`,
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  });

  const gridIcon = (col) => ({
    width: '40px', height: '40px', borderRadius: '12px',
    background: `${col}20`, border: `1px solid ${col}35`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px',
  });

  const gridSub = {
    fontSize: '9px', opacity: 0.4, fontWeight: 400, letterSpacing: '0.3px',
  };

  const dramaBtn = {
    width: '100%',
    maxWidth: '360px',
    marginTop: '12px',
    padding: '18px 20px',
    borderRadius: '18px',
    background: `linear-gradient(135deg, ${T.bg} 0%, #FAD0C422 50%, ${T.bg} 100%)`,
    border: '1px solid #FAD0C440',
    color: T.text,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.8s ease 0.3s, transform 0.3s ease',
  };

  // 🌟 NEW: The styling for our Purple Sanctuary button
  const sanctuaryBtn = {
    width: '100%',
    maxWidth: '360px',
    marginTop: '12px',
    padding: '18px 20px',
    borderRadius: '18px',
    background: `linear-gradient(135deg, ${T.bg} 0%, #9B59B622 50%, ${T.bg} 100%)`,
    border: '1px solid #9B59B640',
    color: T.text,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.8s ease 0.4s, transform 0.3s ease',
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>{hi ? 'के-यूनिवर्स' : 'K-Universe'}</h1>
        <p style={s.subTitle}>{hi ? 'अपने समुदाय को खोजें' : 'FIND YOUR COMMUNITY'}</p>
        <p style={s.disclaimer}>
          {hi
            ? 'ये सभी rooms अनधिकृत fan spaces हैं। HYBE, YG, SM, JYP से कोई संबंध नहीं।'
            : 'All rooms are unofficial fan spaces. Not affiliated with HYBE, YG, SM, or JYP.'}
        </p>
      </div>

      {/* 2x2 Grid */}
      <div style={gridStyle}>
        {rooms.map((room) => (
          <button
            key={room.name}
            style={gridBtn(room.col)}
            onClick={() => enterRoom(room.name)}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={gridIcon(room.col)}>{room.icon}</div>
            <span>{room.label}</span>
            <span style={gridSub}>{room.sub}</span>
          </button>
        ))}
      </div>

      {/* Full-width K-Drama bar */}
      <button
        style={dramaBtn}
        onClick={() => enterRoom('K-Drama Room')}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FAD0C420', border: '1px solid #FAD0C440', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🎬</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span>{hi ? 'के-ड्रामा लाउंज' : 'K-DRAMA LOUNGE'}</span>
          <span style={{ fontSize: '10px', opacity: 0.4, fontWeight: 400 }}>{hi ? 'Latest dramas discuss करें' : 'Discuss the latest dramas'}</span>
        </div>
      </button>

      {/* 🌟 NEW: The Purple Sanctuary Button */}
      <button
        style={sanctuaryBtn}
        onClick={() => enterRoom('Purple Sanctuary')}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#9B59B620', border: '1px solid #9B59B640', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🌌</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span>{hi ? 'पर्पल सैंक्चुअरी' : 'PURPLE SANCTUARY'}</span>
          <span style={{ fontSize: '10px', opacity: 0.4, fontWeight: 400 }}>{hi ? 'आराम करें और सांस लें' : 'A quiet place to rest and breathe'}</span>
        </div>
      </button>

      <button style={s.backBtn} onClick={() => setTab('home')}>
        ← {hi ? 'वापस' : 'BACK HOME'}
      </button>
    </div>
  );
}