import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react'; 
import { track } from '@vercel/analytics'; 
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
import { Sleep } from './features/sleep/Sleep';
import { DeepRhythm } from './features/sleep/DeepRhythm'; 

// ─── SLEEP ROOM ACTIVITIES ───
import { DreamScrambler } from './features/sleep/DreamScrambler';
import { DimmingEmber } from './features/sleep/DimmingEmber';
import { HeavyScan } from './features/sleep/HeavyScan';
import { MidnightFire } from './features/sleep/MidnightFire';

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

// ─── YAKSHA GATE COMPONENT ───
function YakshaGate({ lang, T, onUnlock, onCancel }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const MASTER_KEY = "SUKOON2026";
  const isHindi = lang === "Hindi";

  useEffect(() => { track('Encountered Yaksha Gate'); }, []);

  const handleCheck = () => {
    if (input.toUpperCase() === MASTER_KEY) {
      track('Unlocked Deep Layers'); 
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", background: "#050508", position: "relative" }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 30, left: 30, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, fontFamily: "'Cormorant Garamond', serif" }}>
        ← {isHindi ? "वापस" : "Back"}
      </button>
      <div style={{ fontSize: 32, marginBottom: 20, opacity: 0.6 }}>⚖️</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#fff', fontWeight: 300, marginBottom: 50, lineHeight: 1.6, maxWidth: 320 }}>
        {isHindi ? '"क्या आपके पास अगले स्तर, शांत स्थान की कुंजी है?"' : '"Do you have the key to the next level, the Quieter Place?"'}
      </h2>
      <div style={{ width: '100%', transform: error ? 'translateX(10px)' : 'none', transition: 'transform 0.1s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder={isHindi ? "कोड यहाँ लिखें" : "TYPE CODE HERE"} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(212, 175, 55, 0.4)', color: '#d4af37', textAlign: 'center', fontSize: 20, letterSpacing: 6, outline: 'none', width: '240px', paddingBottom: 10, marginBottom: 25 }} />
        <button onClick={handleCheck} style={{ background: 'transparent', border: '1px solid #d4af37', color: '#d4af37', padding: '12px 45px', borderRadius: 30, fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>
          {isHindi ? "प्रवेश करें" : "PROCEED"}
        </button>
        <div style={{ marginTop: 15, opacity: 0.8, fontSize: 12, color: '#ffffff', letterSpacing: 2, fontFamily: 'monospace', fontWeight: 'bold' }}>{MASTER_KEY}</div>
      </div>
    </div>
  );
}

// ─── THE ROUTER WRAPPER ───
// This component handles the actual screen switching based on the URL
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    try { return localStorage.getItem("jsukoon_onboarded") === "true"; } 
    catch { return false; }
  });

  const [lang, setLang] = useLS("jsukoon_lang", "English");
  const [themeSource, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const [themeKey, setThemeKey] = useLS("jsukoon_theme", "Void");
  const [mood, setMood] = useState(null);
  const [vaultUnlocked, setVaultUnlocked] = useLS("jsukoon_vault_unlocked", false);

  // This replaces your old setTab. Now, calling setTab("journal") changes the URL!
  const setTab = (newTab) => {
    if (newTab === "home") navigate("/");
    else navigate(`/${newTab}`);
  };

  // Vercel Tracking per Page
  useEffect(() => {
    if (hasOnboarded) {
      track('View Feature', { featureName: location.pathname });
    }
  }, [location, hasOnboarded]);

  const T = themeSource === "manual" ? (THEMES[themeKey] || THEMES.Void) : (mood && THEMES[mood] ? THEMES[mood] : THEMES.Void);

  useEffect(() => {
    const browseTimer = setInterval(() => creditSession(1, true), 60000);
    return () => clearInterval(browseTimer);
  }, []);

  if (!hasOnboarded) {
    return <Onboarding onComplete={() => { localStorage.setItem("jsukoon_onboarded", "true"); setHasOnboarded(true); track('Onboarding Complete'); }} setThemeKey={setThemeKey} setLang={setLang} T={T} />;
  }

  // Helper for Yaksha Gate
  const deepLayers = ["/vault", "/resonance", "/stillness", "/quietcorner", "/soundbath", "/mandala", "/seedinmud"];
  const isProtected = deepLayers.includes(location.pathname) && !vaultUnlocked;

  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", background: "#080808", overflowX: "hidden" }}>
      <div style={{ height: "100%", width: "100%", maxWidth: 600, background: T.bg, color: T.text, transition: "background 0.8s ease, color 0.8s ease", position: "relative", boxShadow: "0 0 50px rgba(0,0,0,0.55)" }}>
        
        {isProtected ? (
          <YakshaGate lang={lang} T={T} onUnlock={() => setVaultUnlocked(true)} onCancel={() => setTab("practice")} />
        ) : (
          <Routes>
            <Route path="/" element={<Home setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep" element={<Sleep setTab={setTab} T={T} lang={lang} />} />
            
            {/* ─── NEW SLEEP ROUTES ─── */}
            <Route path="/sleep_scrambler" element={<DreamScrambler setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_ember" element={<DimmingEmber setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_scan" element={<HeavyScan setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_fire" element={<MidnightFire setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_beat" element={<DeepRhythm setTab={setTab} T={T} lang={lang} />} />
            {/* Note: /sleep_beat is omitted as you mentioned it was an audio-only tool for the future */}

            <Route path="/focus" element={<Focus setTab={setTab} T={T} lang={lang} />} />
            <Route path="/journal" element={<Journal setTab={setTab} T={T} lang={lang} />} />
            <Route path="/warmth" element={<WarmthPage setTab={setTab} T={T} lang={lang} />} />
            <Route path="/bench" element={<Bench setTab={setTab} T={T} lang={lang} />} />
            <Route path="/more" element={<MorePage setTab={setTab} T={T} lang={lang} setThemeKey={setThemeKey} />} />
            <Route path="/practice" element={<Practice setTab={setTab} T={T} lang={lang} />} />
            <Route path="/community" element={<CommunityRoom setTab={setTab} T={T} lang={lang} />} />
            <Route path="/legal" element={<LegalDisclaimer setTab={setTab} T={T} lang={lang} />} />
            <Route path="/reflection" element={<Reflection setTab={setTab} T={T} lang={lang} />} />
            <Route path="/progress" element={<Progress setTab={setTab} T={T} lang={lang} />} />
            <Route path="/descent" element={<TheDescent setTab={setTab} T={T} lang={lang} goBack={() => setTab("vault")} />} />
            <Route path="/vault" element={<Vault setTab={setTab} T={T} lang={lang} />} />
            <Route path="/stillness" element={<Stillness setTab={setTab} T={T} lang={lang} />} />
            <Route path="/resonance" element={<Resonance setTab={setTab} T={T} lang={lang} />} />
            <Route path="/quietcorner" element={<QuietCorner setTab={setTab} T={T} lang={lang} />} />
            <Route path="/soundbath" element={<SoundBath setTab={setTab} T={T} lang={lang} />} />
            <Route path="/mandala" element={<MandalaFlow setTab={setTab} T={T} lang={lang} />} />
            <Route path="/seedinmud" element={<SeedInMud setTab={setTab} T={T} lang={lang} />} />
            <Route path="/settings" element={<Settings setTab={setTab} T={T} lang={lang} setLang={setLang} setThemeKey={setThemeKey} setThemeSource={setThemeSource} themeSource={themeSource} themeKey={themeKey} />} />
            <Route path="/audio" element={<AudioPage setTab={setTab} T={T} lang={lang} />} />
            <Route path="/crisis" element={<Crisis setTab={setTab} T={T} lang={lang} />} />
            <Route path="/about" element={<About setTab={setTab} T={T} lang={lang} />} />
            <Route path="/privacy" element={<Privacy setTab={setTab} T={T} lang={lang} />} />
            <Route path="/wishes" element={<WishesGallery setTab={setTab} T={T} lang={lang} />} />
            
            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
        <Analytics />
      </div>
    </div>
  );
}

// ─── FINAL APP EXPORT ───
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}