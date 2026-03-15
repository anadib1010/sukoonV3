import React from 'react';

export function Resonance({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";

  // ─── THE 4 CORE RESONANCE GAMES ───
  const resonanceGames = [
    {
      id: 'quietcorner',
      title: isHindi ? "शांत कोना" : "The Quiet Corner",
      subtitle: isHindi ? "वास्तु शास्त्र" : "Vastu Shastra",
      desc: isHindi ? "लाइव कंपास के साथ अपना ध्यान का केंद्र खोजें।" : "Find your magnetic center for meditation using the live compass.",
      icon: "🧭"
    },
    {
      id: 'soundbath',
      title: isHindi ? "ध्वनि स्नान" : "The Singing Bowl",
      subtitle: isHindi ? "नाद योग" : "Nada Yoga",
      desc: isHindi ? "गहरी आवृत्तियों के साथ अपने मन को शांत करें।" : "Wash away anxiety with deep, grounding frequencies.",
      icon: "🥣"
    },
    {
      id: 'mandala',
      title: isHindi ? "मंडला प्रवाह" : "Mandala Flow",
      subtitle: isHindi ? "पवित्र ज्यामिति" : "Sacred Geometry",
      desc: isHindi ? "ध्यान केंद्रित करें और अपनी ऊर्जा साझा करें।" : "Draw, focus, and share your unique geometry with the world.",
      icon: "✨"
    },
    {
      id: 'seedinmud', 
      title: isHindi ? "कीचड़ में बीज" : "Seed in the Mud",
      subtitle: isHindi ? "धैर्य और श्वास" : "Trust & Patience",
      desc: isHindi ? "दिव्य समय और धैर्य का अभ्यास करें।" : "A deep breathing practice to teach the concept of divine timing.",
      icon: "🌱"
    }
  ];

  return (
    <div style={{
      height: '100%', 
      width: '100%', 
      backgroundColor: '#05050a',
      color: '#fff', 
      padding: '40px 20px 80px 20px', 
      boxSizing: 'border-box',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      overflowY: 'auto', 
      overflowX: 'hidden'
    }}>
      
      {/* ─── HEADER ─── */}
      <div style={{ textAlign: 'center', marginBottom: 40, flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: '#d4af37', margin: '0 0 10px' }}>
          {isHindi ? "अनुनाद" : "Resonance"}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontStyle: 'italic', maxWidth: 300, margin: '0 auto' }}>
          {isHindi 
            ? "अपने आस-पास की दुनिया और ब्रह्मांड के साथ तालमेल बिठाएं।" 
            : "Harmonize with the world around you and the universe beyond."}
        </p>
      </div>

      {/* ─── GAME LIST ─── */}
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
        {resonanceGames.map((game) => (
          <div 
            key={game.id}
            onClick={() => setTab(game.id)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 20,
              transition: 'background 0.3s ease, transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <div style={{ fontSize: 32, background: 'rgba(0,0,0,0.3)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {game.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, margin: '0 0 4px', color: '#fff' }}>
                {game.title}
              </h3>
              <span style={{ display: 'inline-block', fontSize: 11, color: '#d4af37', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                {game.subtitle}
              </span>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                {game.desc}
              </p>
            </div>
            
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>
              ›
            </div>
          </div>
        ))}
      </div>

      {/* ─── NEXT LAYER BUTTON ─── */}
      <div style={{ marginTop: 50, marginBottom: 20, flexShrink: 0 }}>
        <button 
          onClick={() => setTab('stillness')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            color: '#d4af37',
            padding: '14px 40px',
            borderRadius: 30,
            fontSize: 18,
            fontFamily: "'Cormorant Garamond', serif",
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: 1
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {isHindi ? "अंतिम स्तर: स्थिरता की ओर बढ़ें" : "Enter the Final Layer: Stillness"}
        </button>
      </div>

    </div>
  );
}