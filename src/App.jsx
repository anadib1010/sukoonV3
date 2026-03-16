import React, { useState, useEffect } from 'react';
import { useLS } from './hooks/useLS';
import { THEMES } from './utils/theme';
import { creditSession } from './utils/activity';

// ─── INSTANT LOAD ALL ROOMS ───
import { Onboarding } from './features/onboarding/Onboarding';
import { Settings } from './features/settings/Settings';
import { Home } from './features/home/Home';
import { Focus } from './features/focus/Focus';
import { Journal } from './features/journaling/Journal';
import { WarmthPage } from './features/warmth/WarmthPage';
import { Bench } from './features/bench/Bench';
import { MorePage } from './features/more/MorePage';
import { Practice } from './features/practice/Practice';
import { LegalDisclaimer } from './features/legal/LegalDisclaimer';
import { Reflection } from './features/reflection/Reflection';
import { Progress } from './features/progress/Progress';
import { AudioPage } from './features/audio/AudioPage';
import { Crisis } from './features/crisis/Crisis';
import { About } from './features/about/About';
import { Privacy } from './features/privacy/Privacy';
import { WishesGallery } from './features/reflection/WishesGallery';
import MoodAction from './MoodAction';
import { CommunityRoom } from './features/games/CommunityRoom'; 

// ─── GAMES & LAYERS ───
import { TheDescent } from './features/games/TheDescent';
import { Vault } from './features/vault/Vault';
import { Resonance } from "./features/resonance/Resonance";
import { Stillness } from './features/games/Stillness'; 

// ─── RESONANCE LAYER GAMES ───
import { QuietCorner } from './features/games/QuietCorner';
import { SoundBath } from './features/games/SoundBath';
import { MandalaFlow } from './features/games/MandalaFlow';
import { SeedInMud } from './features/games/SeedInMud';

// ─── YAKSHA GATE COMPONENT (CENTERED & REFINED) ───
function YakshaGate({ lang, T, onUnlock, onCancel }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const MASTER_KEY = "SUKOON2026";
  const isHindi = lang === "Hindi";

  const handleCheck = () => {
    if (input.toUpperCase() === MASTER_KEY) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div style={{ 
      height: "100%", width: "100%", 
      display: "flex", flexDirection: "column", 
      alignItems: "center", justifyContent: "center", 
      padding: 40, textAlign: "center", 
      background: "#050508",
      position: "relative"
    }}>
      {/* Back Button */}
      <button 
        onClick={onCancel} 
        style={{ 
          position: 'absolute', top: 30, left: 30, 
          background: 'none', border: 'none', 
          color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          fontSize: 14, fontFamily: "'Cormorant Garamond', serif"
        }}
      >
        ← {isHindi ? "वापस" : "Back"}
      </button>
      
      {/* Icon */}
      <div style={{ fontSize: 32, marginBottom: 20, opacity: 0.6 }}>⚖️</div>
      
      {/* Question */}
      <h2 style={{ 
        fontFamily: "'Cormorant Garamond', serif", 
        fontSize: 24, color: '#fff', 
        fontWeight: 300, marginBottom: 50, 
        lineHeight: 1.6, maxWidth: 320 
      }}>
        {isHindi 
          ? '"क्या आपके पास अगले स्तर, शांत स्थान की कुंजी है?"' 
          : '"Do you have the key to the next level, the Quieter Place?"'}
      </h2>

      {/* Input Group */}
      <div style={{ 
        width: '100%',
        transform: error ? 'translateX(10px)' : 'none', 
        transition: 'transform 0.1s',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isHindi ? "कोड यहाँ लिखें" : "TYPE CODE HERE"}
          style={{ 
            background: 'transparent', border: 'none', 
            borderBottom: '1px solid rgba(212, 175, 55, 0.4)', 
            color: '#d4af37', textAlign: 'center', 
            fontSize: 20, letterSpacing: 6, 
            outline: 'none', width: '240px', 
            paddingBottom: 10, marginBottom: 25
          }}
        />

        {/* Proceed Button */}
        <button 
          onClick={handleCheck} 
          style={{ 
            background: 'transparent', border: '1px solid #d4af37', 
            color: '#d4af37', padding: '12px 45px', 
            borderRadius: 30, fontSize: 13, 
            letterSpacing: 2, cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {isHindi ? "प्रवेश करें" : "PROCEED"}
        </button>

        {/* Debug Key - Directly below Proceed with 0.8 opacity */}
        <div style={{ 
          marginTop: 15, 
          opacity: 0.8, 
          fontSize: 12, 
          color: '#ffffff', 
          letterSpacing: 2,
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}>
          {MASTER_KEY}
        </div>
      </div>

      <style>{`
        input::placeholder {
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}

export default function App() {
  // --- BUG FIX: Added try/catch safety net for initial load ---
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    try {
      return localStorage.getItem("jsukoon_onboarded") === "true";
    } catch (error) {
      console.warn("Storage blocked by browser, defaulting to onboarding");
      return false; // If WhatsApp blocks storage, just show them the welcome screen
    }
  });

  const [lang, setLang] = useLS("jsukoon_lang", "English");
  const [themeSource, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const [themeKey, setThemeKey] = useLS("jsukoon_theme", "Void");
  
  const [tab, setTab] = useState("home");
  const [mood, setMood] = useState(null);
  const [vaultUnlocked, setVaultUnlocked] = useLS("jsukoon_vault_unlocked", false);

  const getTheme = () => {
    if (themeSource === "manual") return THEMES[themeKey] || THEMES.Void;
    if (mood && THEMES[mood]) return THEMES[mood];
    return THEMES.Void; 
  };
  const T = getTheme();

  useEffect(() => {
    const handleLangUpdate = (e) => setLang(e.detail); 
    window.addEventListener('jsukoon_lang_updated', handleLangUpdate);
    return () => window.removeEventListener('jsukoon_lang_updated', handleLangUpdate);
  }, [setLang]);

  useEffect(() => {
    const browseTimer = setInterval(() => creditSession(1, true), 60000);
    return () => clearInterval(browseTimer);
  }, []);

  // --- BUG FIX: Added try/catch safety net for saving onboarding state ---
  const completeOnboarding = () => {
    try {
      localStorage.setItem("jsukoon_onboarded", "true");
    } catch (error) {
      console.warn("Could not save onboarding state due to browser privacy settings.");
    }
    setHasOnboarded(true);
  };

  if (!hasOnboarded) {
    return <Onboarding onComplete={completeOnboarding} setThemeKey={setThemeKey} setLang={setLang} T={T} />;
  }

  const validTabs = [
    "home", "focus", "journal", "warmth", "bench", "more", "practice", 
    "legal", "reflection", "progress", "settings", "audio", "crisis", 
    "about", "privacy", "wishes", "descent", "vault", "resonance", "stillness",
    "quietcorner", "soundbath", "mandala", "seedinmud", "community"
  ];

  // ─── GATE LOGIC ───
  const deepLayers = ["vault", "resonance", "stillness", "quietcorner", "soundbath", "mandala", "seedinmud"];
  const isTryingToEnterDeepLayer = deepLayers.includes(tab);

  return (
    <div 
      style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", background: "#080808", overflowX: "hidden" }}
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          const activeScrollContainer = document.querySelector('[data-scrollable="true"]');
          if (activeScrollContainer) activeScrollContainer.scrollTop += e.deltaY;
        }
      }}
    >
      <div style={{ 
        height: "100%", width: "100%", maxWidth: 600, 
        background: T.bg, color: T.text, 
        transition: "background 0.8s ease, color 0.8s ease", 
        overflowX: "hidden", overflowY: "hidden", position: "relative",
        boxShadow: "0 0 50px rgba(0,0,0,0.55)" 
      }}>
        
        {/* Check if user needs to face the Yaksha Gate first */}
        {isTryingToEnterDeepLayer && !vaultUnlocked ? (
          <YakshaGate 
            lang={lang} 
            T={T} 
            onUnlock={() => setVaultUnlocked(true)} 
            onCancel={() => setTab("practice")} 
          />
        ) : (
          <>
            {/* Core Navigation */}
            {tab === "home"       && <Home      setTab={setTab} T={T} lang={lang} />}
            {tab === "focus"      && <Focus     setTab={setTab} T={T} lang={lang} />}
            {tab === "journal"    && <Journal   setTab={setTab} T={T} lang={lang} />}
            {tab === "warmth"     && <WarmthPage setTab={setTab} T={T} lang={lang} />}
            {tab === "bench"      && <Bench     setTab={setTab} T={T} lang={lang} />}
            {tab === "more"       && <MorePage  setTab={setTab} T={T} lang={lang} setThemeKey={setThemeKey} />}
            {tab === "practice"   && <Practice  setTab={setTab} T={T} lang={lang} />}
            {tab === "community" && <CommunityRoom setTab={setTab} T={T} lang={lang} />}
            
            {/* Utilities & Info */}
            {tab === "legal"      && <LegalDisclaimer setTab={setTab} T={T} lang={lang} />}
            {tab === "reflection" && <Reflection setTab={setTab} T={T} lang={lang} />}
            {tab === "progress"   && <Progress  setTab={setTab} T={T} lang={lang} />}
            
            {/* Deep Layers */}
            {tab === "descent"    && <TheDescent setTab={setTab} T={T} lang={lang} goBack={() => setTab("vault")} />}
            {tab === "vault"      && <Vault     setTab={setTab} T={T} lang={lang} />}
            {tab === "stillness"  && <Stillness setTab={setTab} T={T} lang={lang} />}
            {tab === "resonance"  && <Resonance setTab={setTab} T={T} lang={lang} />}
            
            {/* RESONANCE GAMES */}
            {tab === "quietcorner"  && <QuietCorner   setTab={setTab} T={T} lang={lang} />}
            {tab === "soundbath"    && <SoundBath     setTab={setTab} T={T} lang={lang} />}
            {tab === "mandala"      && <MandalaFlow   setTab={setTab} T={T} lang={lang} />}
            {tab === "seedinmud"    && <SeedInMud     setTab={setTab} T={T} lang={lang} />}

            {/* Dynamic / Mood */}
            {tab && tab.startsWith("moodAction_") && (
              <MoodAction selectedMood={tab.split("_")[1]} goBack={() => setTab("more")} setTab={setTab} T={T} lang={lang} />
            )}
            
            {tab === "settings" && (
              <Settings setTab={setTab} T={T} lang={lang} setLang={setLang} setThemeKey={setThemeKey} setThemeSource={setThemeSource} themeSource={themeSource} themeKey={themeKey} />
            )}
            {tab === "audio"   && <AudioPage     setTab={setTab} T={T} lang={lang} />}
            {tab === "crisis"  && <Crisis        setTab={setTab} T={T} lang={lang} />}
            {tab === "about"   && <About         setTab={setTab} T={T} lang={lang} />}
            {tab === "privacy" && <Privacy       setTab={setTab} T={T} lang={lang} />}
            {tab === "wishes"  && <WishesGallery setTab={setTab} T={T} lang={lang} />}
          </>
        )}

        {/* FALLBACK */}
        {!validTabs.includes(tab) && !tab.startsWith("moodAction_") && (
          <div className="fade-in" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <span style={{ fontSize: 48, marginBottom: 16 }}>🚧</span>
            <button onClick={() => setTab("home")} style={{ padding: "12px 32px", borderRadius: 99, background: T.accent, color: T.bg, border: "none", fontSize: 14, cursor: "pointer" }}>
              {lang === "Hindi" ? "वापस लौटें" : "Return to Home"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}