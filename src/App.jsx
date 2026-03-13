import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLS } from './hooks/useLS';
import { THEMES } from './utils/theme';
import { creditSession } from './utils/activity';

// ─── LAZY LOAD ALL ROOMS ───
// Added Onboarding to the lazy list!
const Onboarding = lazy(() => import('./features/onboarding/Onboarding').then(m => ({ default: m.Onboarding })));

const Settings = lazy(() => import('./features/settings/Settings').then(m => ({ default: m.Settings })));
const Home = lazy(() => import('./features/home/Home').then(m => ({ default: m.Home })));
const Focus = lazy(() => import('./features/focus/Focus').then(m => ({ default: m.Focus })));
const Journal = lazy(() => import('./features/journaling/Journal').then(m => ({ default: m.Journal })));
const WarmthPage = lazy(() => import('./features/warmth/WarmthPage').then(m => ({ default: m.WarmthPage })));
const Bench = lazy(() => import('./features/bench/Bench').then(m => ({ default: m.Bench })));
const MorePage = lazy(() => import('./features/more/MorePage').then(m => ({ default: m.MorePage })));
const Practice = lazy(() => import('./features/practice/Practice').then(m => ({ default: m.Practice })));
const LegalDisclaimer = lazy(() => import('./features/legal/LegalDisclaimer').then(m => ({ default: m.LegalDisclaimer })));
const Reflection = lazy(() => import('./features/reflection/Reflection').then(m => ({ default: m.Reflection })));
const Progress = lazy(() => import('./features/progress/Progress').then(m => ({ default: m.Progress })));
const AudioPage = lazy(() => import('./features/audio/AudioPage').then(m => ({ default: m.AudioPage })));
const Crisis = lazy(() => import('./features/crisis/Crisis').then(m => ({ default: m.Crisis })));
const About = lazy(() => import('./features/about/About').then(m => ({ default: m.About })));
const Privacy = lazy(() => import('./features/privacy/Privacy').then(m => ({ default: m.Privacy })));
const WishesGallery = lazy(() => import('./features/reflection/WishesGallery').then(m => ({ default: m.WishesGallery })));

export default function App() {
  // ─── ONBOARDING STATE ───
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem("jsukoon_onboarded") === "true";
  });

  // ─── STATE & SETTINGS ───
  const [lang, setLang] = useLS("jsukoon_lang", "English");
  const [themeSource, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const [themeKey, setThemeKey] = useLS("jsukoon_theme", "Void");
  
  const [ritualDone, setRitualDone] = useState(false);
  const [tab, setTab] = useState("home");
  const [mood, setMood] = useState(null);

  // ─── THEME ENGINE ───
  const getTheme = () => {
    if (themeSource === "manual") return THEMES[themeKey] || THEMES.Void;
    if (mood && THEMES[mood]) return THEMES[mood];
    return THEMES.Void; 
  };
  const T = getTheme();

  // ─── LIVE LANGUAGE LISTENER ───
  useEffect(() => {
    const handleLangUpdate = (e) => {
      setLang(e.detail); 
    };
    window.addEventListener('jsukoon_lang_updated', handleLangUpdate);
    return () => window.removeEventListener('jsukoon_lang_updated', handleLangUpdate);
  }, [setLang]);

  // ─── PASSIVE CREDITING ───
  useEffect(() => {
    const browseTimer = setInterval(() => {
      if (ritualDone) {
        creditSession(1, true); 
      }
    }, 60000);
    return () => clearInterval(browseTimer);
  }, [ritualDone]);

  // ─── ONBOARDING COMPLETION HANDLER ───
  const completeOnboarding = () => {
    localStorage.setItem("jsukoon_onboarded", "true");
    setHasOnboarded(true);
  };

  // ─── ONBOARDING GATEKEEPER ───
  // Wrapped in Suspense because it is now lazy-loaded!
  if (!hasOnboarded) {
    return (
      <Suspense fallback={<div style={{ background: "#050505", height: "100vh" }} />}>
        <Onboarding 
          onComplete={completeOnboarding} 
          setThemeKey={setThemeKey} 
          setLang={setLang}         
          T={T}                     
        />
      </Suspense>
    );
  }

  // ─── MASTER LAYOUT WRAPPER ───
  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", background: "#080808" }}>
      <div style={{ 
        height: "100%", width: "100%", maxWidth: 600, 
        background: T.bg, color: T.text, 
        transition: "background 0.8s ease, color 0.8s ease", 
        overflow: "hidden", position: "relative",
        boxShadow: "0 0 50px rgba(0,0,0,0.5)" 
      }}>
        
        {!ritualDone ? (
          <div className="fade-in" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, marginBottom: 32, fontWeight: 400 }}>
              {lang === "Hindi" ? "आप कैसा महसूस कर रहे हैं?" : "How are you feeling?"}
            </h1>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 300 }}>
              {["Void", "Twilight Blue", "Pink Champagne", "Sea Glass"].map(m => (
                <button 
                  key={m}
                  onClick={() => { setMood(m); setRitualDone(true); setTab("home"); }}
                  style={{ padding: "14px 24px", borderRadius: 99, border: `1px solid ${T.borderWarm}`, background: "transparent", color: T.textSoft, fontSize: 14, cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        ) : (
          
          <Suspense fallback={
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
              <p className="pulse" style={{ color: T.muted, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic" }}>
                {lang === "Hindi" ? "सांस लें..." : "Breathe..."}
              </p>
            </div>
          }>
            {tab === "home" && <Home setTab={setTab} T={T} lang={lang} />}
            {tab === "focus" && <Focus setTab={setTab} T={T} lang={lang} />}
            {tab === "journal" && <Journal setTab={setTab} T={T} lang={lang} />}
            {tab === "warmth" && <WarmthPage setTab={setTab} T={T} lang={lang} />}
            {tab === "bench" && <Bench setTab={setTab} T={T} lang={lang} />}
            {tab === "more" && <MorePage setTab={setTab} T={T} lang={lang} setThemeKey={setThemeKey} />}
            {tab === "practice" && <Practice setTab={setTab} T={T} lang={lang} />}
            {tab === "legal" && <LegalDisclaimer setTab={setTab} T={T} lang={lang} />}
            {tab === "reflection" && <Reflection setTab={setTab} T={T} lang={lang} />}
            {tab === "progress" && <Progress setTab={setTab} T={T} lang={lang} />}
            {tab === "settings" && (
              <Settings 
                setTab={setTab} 
                T={T} 
                lang={lang} 
                setLang={setLang} 
                setThemeKey={setThemeKey} 
                setThemeSource={setThemeSource} // This will now work!
                themeSource={themeSource} 
                themeKey={themeKey} 
              />
            )}
            {tab === "audio" && <AudioPage setTab={setTab} T={T} lang={lang} />}
            {tab === "crisis" && <Crisis setTab={setTab} T={T} lang={lang} />}
            {tab === "about" && <About setTab={setTab} T={T} lang={lang} />}
            {tab === "privacy" && <Privacy setTab={setTab} T={T} lang={lang} />}
            {tab === 'wishes' && <WishesGallery setTab={setTab} T={T} lang={lang} />}

            {/* FALLBACK */}
            {!["home", "focus", "journal", "warmth", "bench", "more", "practice", "legal", "reflection", "progress", "settings", "audio", "crisis", "about", "privacy", "wishes"].includes(tab) && (
              <div className="fade-in" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
                <span style={{ fontSize: 48, marginBottom: 16 }}>🚧</span>
                <button onClick={() => setTab("home")} style={{ padding: "12px 32px", borderRadius: 99, background: T.accent, color: T.bg, border: "none", fontSize: 14, cursor: "pointer" }}>
                  {lang === "Hindi" ? "वापस लौटें" : "Return to Home"}
                </button>
              </div>
            )}
          </Suspense>
        )}
      </div>
    </div>
  );
}