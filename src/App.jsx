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

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem("jsukoon_onboarded") === "true";
  });

  const [lang, setLang] = useLS("jsukoon_lang", "English");
  const [themeSource, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const [themeKey, setThemeKey] = useLS("jsukoon_theme", "Void");
  
  const [tab, setTab] = useState("home");
  const [mood, setMood] = useState(null);

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

  const completeOnboarding = () => {
    localStorage.setItem("jsukoon_onboarded", "true");
    setHasOnboarded(true);
  };

  if (!hasOnboarded) {
    return <Onboarding onComplete={completeOnboarding} setThemeKey={setThemeKey} setLang={setLang} T={T} />;
  }

  // Added all the new Resonance layer game IDs to this list
  const validTabs = [
    "home", "focus", "journal", "warmth", "bench", "more", "practice", 
    "legal", "reflection", "progress", "settings", "audio", "crisis", 
    "about", "privacy", "wishes", "descent", "vault", "resonance", "stillness",
    "quietcorner", "soundbath", "mandala", "seedinmud", "messageinbottle"
  ];

  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", background: "#080808", overflowX: "hidden" }}>
      <div style={{ 
        height: "100%", width: "100%", maxWidth: 600, 
        background: T.bg, color: T.text, 
        transition: "background 0.8s ease, color 0.8s ease", 
        overflowX: "hidden", overflowY: "hidden", position: "relative",
        boxShadow: "0 0 50px rgba(0,0,0,0.5)" 
      }}>
        
        {/* Core Navigation */}
        {tab === "home"       && <Home       setTab={setTab} T={T} lang={lang} />}
        {tab === "focus"      && <Focus      setTab={setTab} T={T} lang={lang} />}
        {tab === "journal"    && <Journal    setTab={setTab} T={T} lang={lang} />}
        {tab === "warmth"     && <WarmthPage setTab={setTab} T={T} lang={lang} />}
        {tab === "bench"      && <Bench      setTab={setTab} T={T} lang={lang} />}
        {tab === "more"       && <MorePage   setTab={setTab} T={T} lang={lang} setThemeKey={setThemeKey} />}
        {tab === "practice"   && <Practice   setTab={setTab} T={T} lang={lang} />}
        
        {/* Utilities & Info */}
        {tab === "legal"      && <LegalDisclaimer setTab={setTab} T={T} lang={lang} />}
        {tab === "reflection" && <Reflection setTab={setTab} T={T} lang={lang} />}
        {tab === "progress"   && <Progress   setTab={setTab} T={T} lang={lang} />}
        
        {/* Deep Layers */}
        {tab === "descent"    && <TheDescent setTab={setTab} T={T} lang={lang} goBack={() => setTab("vault")} />}
        {tab === "vault"      && <Vault      setTab={setTab} T={T} lang={lang} />}
        {tab === "stillness"  && <Stillness  setTab={setTab} T={T} lang={lang} />}
        {tab === "resonance"  && <Resonance  setTab={setTab} T={T} lang={lang} />}
        
        {/* ─── NEW: RESONANCE GAMES ─── */}
        {tab === "quietcorner"     && <QuietCorner     setTab={setTab} T={T} lang={lang} />}
        {tab === "soundbath"       && <SoundBath       setTab={setTab} T={T} lang={lang} />}
        {tab === "mandala"         && <MandalaFlow     setTab={setTab} T={T} lang={lang} />}
        {tab === "seedinmud"       && <SeedInMud       setTab={setTab} T={T} lang={lang} />}
        {tab === "messageinbottle" && <MessageInBottle setTab={setTab} T={T} lang={lang} />}

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

        {/* FALLBACK (Only shows if tab is truly invalid) */}
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