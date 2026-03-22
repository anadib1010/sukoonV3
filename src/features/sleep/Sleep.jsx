import React, { useEffect } from 'react';
import { track } from '@vercel/analytics';
// 1. Bringing in our LEGO bricks!
import { BrandHeader } from '../../components/BrandHeader'; 
import { BackButton } from '../../components/BackButton';   

export function Sleep({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  useEffect(() => {
    track('View Sleep Page');
  }, []);

  // ─── THE CHAMELEON THEME ───
  // We create a custom "Sleep Theme" to keep your Zero-Light Aesthetics.
  // We will pass this to the Header and BackButton so they match the room perfectly.
  const sleepT = {
    bg: "#000000", 
    text: "rgba(184, 93, 25, 0.85)", 
    accent: "#b85d19", // Solid amber for the button borders
    textSoft: "rgba(184, 93, 25, 0.5)"
  };

  const SLEEP_FEATURES = [
    { 
      id: 'sleep_scrambler', icon: '🌀',
      name: 'Dream Scrambler', nameH: 'सपनों का क्रम', 
      desc: 'Randomized visualization to short-circuit racing thoughts.', 
      descH: 'विचारों को शांत करने के लिए यादृच्छिक दृश्य।' 
    },
    { 
      id: 'sleep_ember', icon: '🕯️',
      name: 'Dimming Ember', nameH: 'बुझता हुआ अंगारा', 
      desc: '4-7-8 breathing with a barely visible visual anchor.', 
      descH: '4-7-8 श्वास अभ्यास।' 
    },
    { 
      id: 'sleep_scan', icon: '🧘‍♂️',
      name: 'Heavy Scan', nameH: 'गहरी शांति', 
      desc: 'Progressive muscle relaxation to release physical tension.', 
      descH: 'शारीरिक तनाव दूर करने के लिए।' 
    },
    { 
      id: 'sleep_beat', icon: '🎧',
      name: 'Deep Rhythm', nameH: 'गहरी लय', 
      desc: 'A slow, steady acoustic hum that gradually fades into the night.', 
      descH: 'एक धीमी, गहरी ध्वनि जो धीरे-धीरे रात में विलीन हो जाती है।' 
    },
    { 
      id: 'sleep_fire', icon: '🔥',
      name: 'Midnight Fire', nameH: 'देर रात तक काम करना', 
      desc: 'Whisper your worries to the dark and let them burn away.', 
      descH: 'अपनी चिंताओं को फुसफुसाएं और उन्हें जलने दें।' 
    }
  ];

  // ─── STYLES ───
  const s = {
    page: {
      minHeight: "100dvh", width: "100%",
      background: sleepT.bg, color: sleepT.text, 
      padding: "2vh 24px 100px", // 100px padding protects the bottom button from hiding text
      boxSizing: "border-box",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative" 
    },
    instruction: {
      fontSize: "14px", opacity: 0.8, margin: "0 0 32px 0", lineHeight: 1.6,
      textAlign: "center", maxWidth: "340px",
      fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px"
    },
    listWrap: {
      display: "flex", flexDirection: "column", gap: "16px",
      width: "100%", maxWidth: "340px"
    },
    sleepCard: {
      background: "transparent",
      border: `1px solid rgba(184, 93, 25, 0.25)`, // Your original faint border!
      borderRadius: "16px",
      padding: "20px 24px", 
      display: "flex", alignItems: "center", gap: "20px",
      cursor: "pointer", color: sleepT.text,
      transition: "all 0.3s ease",
      width: "100%", boxSizing: "border-box",
      textAlign: "left"
    },
    iconWrap: {
      fontSize: "24px", opacity: 0.7
    },
    cardTextWrap: { 
      display: "flex", flexDirection: "column"
    },
    cardTitle: { 
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "22px", margin: "0 0 6px 0", fontWeight: 400
    },
    cardSub: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "12px", opacity: 0.8, margin: 0, lineHeight: 1.4
    },
    disclaimer: {
      marginTop: "40px", textAlign: "center", opacity: 0.5, 
      fontSize: "10px", letterSpacing: "0.5px", maxWidth: "280px"
    }
  };

  return (
    <div style={s.page}>
      
      {/* 2. THE BRANDING LEGO BLOCK (Using the custom sleep theme!) */}
      <BrandHeader T={sleepT} />

      <p style={s.instruction}>
        {hi 
          ? "यहाँ प्रकाश न्यूनतम है। एक अभ्यास चुनें और अपने फोन की चमक कम कर दें।" 
          : "Light is strictly minimized here. Turn down your phone brightness and select a practice."}
      </p>

      {/* 3. YOUR ORIGINAL 5 SLEEP BUTTONS */}
      <div style={s.listWrap}>
        {SLEEP_FEATURES.map((feature) => (
          <button 
            key={feature.id} 
            onClick={() => setTab(feature.id)} 
            style={s.sleepCard}
            onMouseEnter={e => {
              e.currentTarget.style.background = `rgba(184, 93, 25, 0.05)`;
              e.currentTarget.style.border = `1px solid rgba(184, 93, 25, 0.5)`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.border = `1px solid rgba(184, 93, 25, 0.25)`;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={s.iconWrap}>{feature.icon}</div>
            <div style={s.cardTextWrap}>
              <h2 style={s.cardTitle}>{hi ? feature.nameH : feature.name}</h2>
              <p style={s.cardSub}>{hi ? feature.descH : feature.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* YOUR ORIGINAL DISCLAIMER */}
      <div style={s.disclaimer}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      {/* 4. THE BACK BUTTON LEGO BLOCK (Also using the custom sleep theme!) */}
      <BackButton setTab={setTab} destination="home" T={sleepT} lang={lang} />

    </div>
  );
}