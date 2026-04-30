import React, { useState, useEffect } from 'react';
import { Privacy } from '../privacy/Privacy';
import { Terms } from '../privacy/Terms';

// 🌟 STEP 2: The Data List
// This holds all the info for our four shiny buttons.
const CHOICES = [
  {
    id:      'kpop',
    emoji:   '🎵',
    en:      'K-Pop &\nK-Drama',
    hi:      'K-Pop और\nK-Drama',
    sub_en:  'BTS · BLACKPINK · Fans',
    sub_hi:  'BTS · BLACKPINK · Fans',
    color:   '#FF6B9D',
    welcome_en: 'Welcome to the fandom 💜',
    welcome_hi: 'फैनडम में आपका स्वागत 💜',
    tab:     'kpop',
  },
  {
    id:      'mindfulness',
    emoji:   '🧘',
    en:      'Clear my\nmind',
    hi:      'मन शांत\nकरें',
    sub_en:  '1-Minute Reset · Sanctuary',
    sub_hi:  '१-मिनट रीसेट · अभयारण्य',
    color:   '#7B9075',
    welcome_en: "One minute. That's all we need. 🌿",
    welcome_hi: 'एक मिनट। बस इतना काफी है। 🌿',
    tab:     'reset',
  },
  {
    id:      'horoscope',
    emoji:   '🔮',
    en:      'My\nHoroscope',
    hi:      'मेरा\nराशिफल',
    sub_en:  'Vedic · Daily · Weekly',
    sub_hi:  'वैदिक · दैनिक · साप्ताहिक',
    color:   '#9B59B6',
    welcome_en: 'The stars have been waiting for you ✨',
    welcome_hi: 'तारे आपका इंतजार कर रहे थे ✨',
    tab:     'horoscope',
  },
  {
    id:      'private',
    emoji:   '🔒',
    en:      'Private\nSpace',
    hi:      'निजी\nस्थान',
    sub_en:  'Encrypted · Secure · Safe',
    sub_hi:  'एन्क्रिप्टेड · सुरक्षित',
    color:   '#5D93C4',
    welcome_en: 'Your secrets are safe here 🔒',
    welcome_hi: 'आपके राज यहाँ सुरक्षित हैं 🔒',
    tab:     'chat',
  },
];

export function Onboarding({ onComplete, setThemeKey, setLang, T, lang = 'English' }) {
  // 🌟 STEP 1: The Screen States
  const [screen, setScreen] = useState('choice'); // Can be 'choice' or 'welcome'
  const [selected, setSelected] = useState(null); // Holds the option the user clicked
  const [legalView, setLegalView] = useState(null); // 'terms', 'privacy', or null
  const [visible, setVisible] = useState(false);
  
  const isHi = lang === 'Hindi';

  // A tiny timer to fade the screen in smoothly when the app loads
  useEffect(() => {
    if (setLang) setLang("English");
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [setLang]);

  // Keep the background super dark for the onboarding experience,
  // unless they are reading the legal pages!
  useEffect(() => {
    if (legalView) return;
    const prev = document.body.style.background;
    document.body.style.background = "#050505";
    return () => { document.body.style.background = prev; };
  }, [legalView]);

  // 🌟 STEP 3: The "Click" Magic
  const handleChoice = async (choice) => {
    setSelected(choice);
    setScreen('welcome');
    if (setThemeKey) setThemeKey("Void"); // Keep the app dark going in

    // Securely save that they finished onboarding
    try { 
      localStorage.setItem('onboarded', 'true'); 
    } catch (error) {
      console.error("Storage error - unable to save onboarding state.");
    }

    // Wait exactly 2 seconds, then enter the app
    setTimeout(() => {
      onComplete(choice.tab);
    }, 2000);
  };

  // 🌟 STEP 4: Styling
  // All styles live inside so we can safely use the T object for legal pages!
  const st = {
    page: {
      position: "fixed", inset: 0, zIndex: 99998,
      background: "#050505",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      padding: "10vh 20px 4vh 20px",
      boxSizing: "border-box",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.8s ease",
      overflowY: "auto",
    },
    header: {
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 12,
      marginBottom: "6vh",
    },
    brand: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "28px", fontWeight: 300, letterSpacing: "4px",
      color: "rgba(255,255,255,0.5)",
      margin: 0,
      animation: "pulse 4s infinite ease-in-out",
    },
    headline: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(24px, 6vw, 28px)",
      fontWeight: 300, fontStyle: "italic",
      color: "rgba(255,255,255,0.88)",
      letterSpacing: "0.5px", margin: 0,
      textAlign: "center",
    },
    subheadline: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "11px", letterSpacing: "2px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.3)",
      margin: 0,
    },
    grid: {
      display: "flex", flexWrap: "wrap",
      justifyContent: "center", gap: "12px",
      maxWidth: "500px", width: "100%",
      marginBottom: "4vh",
    },
    card: (color) => ({
      width: "calc(50% - 6px)", // Splits exactly into two columns with the gap
      background: `${color}12`, // Adding '12' makes it super transparent (hex opacity)
      border: `1px solid ${color}55`,
      borderRadius: "20px",
      padding: "24px 16px",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "8px",
      cursor: "pointer",
      boxSizing: "border-box",
      transition: "transform 0.2s ease, background 0.2s ease",
    }),
    cardEmoji: {
      fontSize: "36px", margin: 0, lineHeight: 1,
    },
    cardTitle: (color) => ({
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "16px", fontWeight: 700,
      color: color, textAlign: "center",
      whiteSpace: "pre-line", // Respects the \n in our text
      margin: 0, lineHeight: 1.4,
    }),
    cardSub: (color) => ({
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "10px", color: color,
      opacity: 0.7, textAlign: "center",
      letterSpacing: "0.5px", margin: 0,
    }),
    legalWrapper: {
      marginTop: "auto",
      paddingTop: "20px",
    },
    legalText: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "12px",                      // Up from 10px — readable on mobile
      color: "rgba(255,255,255,0.65)",       // Up from 0.25 — legally visible
      textAlign: "center",
      maxWidth: "340px",
      lineHeight: 1.6,
      margin: 0,
    },
    link: {
      textDecoration: "underline",
      cursor: "pointer",
      color: "rgba(255,255,255,0.9)",        // Up from 0.5 — links must be clearly tappable
    },
    // Welcome Screen Styles
    welcomePage: (color) => ({
      position: "fixed", inset: 0, zIndex: 99998,
      background: `#050505`, // Dark base
      backgroundColor: `${color}15`, // Gentle color overlay
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.6s ease forwards",
    }),
    welcomeContent: {
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "20px",
    },
    welcomeEmoji: {
      fontSize: "72px", margin: 0,
    },
    welcomeText: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "24px", fontWeight: 300, fontStyle: "italic",
      color: "#ffffff", textAlign: "center",
      padding: "0 40px", letterSpacing: "0.5px", margin: 0,
    },
    welcomeDot: (color) => ({
      width: "8px", height: "8px",
      borderRadius: "50%", background: color,
      marginTop: "8px",
    }),
    // Legal Frame Styles
    legalOverlay: {
      position: 'fixed', inset: 0, zIndex: 99999, 
      background: "#080808", 
      display: "flex", justifyContent: "center"
    },
    legalFrame: {
      width: "100%", maxWidth: "600px", height: "100%", 
      background: T.bg, // We can safely use T here!
      boxShadow: "0 0 50px rgba(0,0,0,0.55)",
      position: "relative"
    }
  };

  // --------------------------------------------------------
  // SCREEN RENDERERS
  // --------------------------------------------------------

  // 1. If looking at legal pages, show the 600px frame
  if (legalView === 'terms') {
    return (
      <div style={st.legalOverlay}>
        <div style={st.legalFrame}>
          <Terms goBack={() => setLegalView(null)} T={T} lang={lang} setTab={() => {}} />
        </div>
      </div>
    );
  }

  if (legalView === 'privacy') {
    return (
      <div style={st.legalOverlay}>
        <div style={st.legalFrame}>
          <Privacy goBack={() => setLegalView(null)} T={T} lang={lang} setTab={() => {}} />
        </div>
      </div>
    );
  }

  // 2. If a choice was clicked, show the Welcome screen
  if (screen === 'welcome' && selected) {
    return (
      <div style={st.welcomePage(selected.color)}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
        <div style={st.welcomeContent}>
          <p style={st.welcomeEmoji}>{selected.emoji}</p>
          <p style={st.welcomeText}>{isHi ? selected.welcome_hi : selected.welcome_en}</p>
          <div style={st.welcomeDot(selected.color)} />
        </div>
      </div>
    );
  }

  // 3. Otherwise, show the normal Choices screen
  return (
    <div style={st.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        @keyframes kpopBreathe {
          0%, 100% { box-shadow: 0 0 0px #FF6B9D00, 0 0 8px #FF6B9D40; border-color: #FF6B9D55; }
          50%      { box-shadow: 0 0 10px #FF6B9D90, 0 0 20px #FF6B9D50; border-color: #FF6B9DCC; }
        }
      `}</style>

      {/* Top Text */}
      <div style={st.header}>
        <h1 style={st.brand}>J Sukoon</h1>
        <h2 style={st.headline}>
          {isHi ? 'आज क्या मन है?' : "What's calling you today?"}
        </h2>
        <p style={st.subheadline}>
          {isHi ? 'अपनी यात्रा चुनें' : 'Choose your journey'}
        </p>
      </div>

      {/* The 4 Buttons Grid */}
      <div style={st.grid}>
        {CHOICES.map((choice) => (
          <div 
            key={choice.id} 
            role="button"
            tabIndex={0}
            style={{
              ...st.card(choice.color),
              ...(choice.id === 'kpop' && {
                animation: "kpopBreathe 2s ease-in-out infinite",
                borderWidth: "2px",
              }),
            }}
            onClick={() => handleChoice(choice)}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.95)"}
            onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <p style={st.cardEmoji}>{choice.emoji}</p>
            <p style={st.cardTitle(choice.color)}>{isHi ? choice.hi : choice.en}</p>
            <p style={st.cardSub(choice.color)}>{isHi ? choice.sub_hi : choice.sub_en}</p>
          </div>
        ))}
      </div>

      {/* Legal Text at the Bottom */}
      <div style={st.legalWrapper}>
        <p style={st.legalText}>
          {isHi 
            ? "जारी रखने पर आप " 
            : "By continuing you agree to our "}
          <span 
            style={st.link} 
            onClick={() => setLegalView('terms')}
          >
            {isHi ? "सेवा शर्तों" : "Terms"}
          </span>
          {isHi ? " और " : " & "}
          <span 
            style={st.link} 
            onClick={() => setLegalView('privacy')}
          >
            {isHi ? "गोपनीयता नीति" : "Privacy Policy"}
          </span>
          {isHi 
            ? <> से सहमत हैं। <span style={{whiteSpace:"nowrap"}}>J Su Kun</span> एक स्व-सहायता उपकरण है, कोई चिकित्सा सेवा नहीं।</> 
            : <><span style={{whiteSpace:"nowrap"}}>. J Su Kun</span> is a self-help tool, not a medical service.</>}
        </p>
      </div>
    </div>
  );
}