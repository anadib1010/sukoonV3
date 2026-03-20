import React, { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { track } from '@vercel/analytics';
import { supabase } from './supabase';
import { Login } from './components/Login';
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
import { DreamScrambler } from './features/sleep/DreamScrambler';
import { DimmingEmber } from './features/sleep/DimmingEmber';
import { HeavyScan } from './features/sleep/HeavyScan';
import { MidnightFire } from './features/sleep/MidnightFire';
import { TheDescent } from './features/games/TheDescent';
import { Vault } from './features/vault/Vault';
import { Resonance } from "./features/resonance/Resonance";
import { Stillness } from './features/games/Stillness';
import { QuietCorner } from './features/games/QuietCorner';
import { SoundBath } from './features/games/SoundBath';
import { MandalaFlow } from './features/games/MandalaFlow';
import { SeedInMud } from './features/games/SeedInMud';

// ─── YAKSHA GATE ───
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

  const ys = {
    page: {
      height: "100dvh", width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 20, boxSizing: "border-box",
      textAlign: "center", background: "#050508",
      position: "fixed", top: 0, left: 0, zIndex: 1000,
    },
    backBtn: {
      position: "absolute", top: 30, left: 30,
      background: "none", border: "none",
      color: "rgba(255,255,255,0.4)",
      cursor: "pointer", fontSize: 14,
      fontFamily: "'Cormorant Garamond', serif",
    },
    icon: { fontSize: 32, marginBottom: 20, opacity: 0.6 },
    question: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 24, color: "#fff",
      fontWeight: 300, marginBottom: 50,
      lineHeight: 1.6, maxWidth: 320,
    },
    inputWrap: {
      width: "100%",
      transform: error ? "translateX(10px)" : "none",
      transition: "transform 0.1s",
      display: "flex", flexDirection: "column", alignItems: "center",
    },
    input: {
      background: "transparent", border: "none",
      borderBottom: "1px solid rgba(212,175,55,0.4)",
      color: "#d4af37", textAlign: "center",
      fontSize: 20, letterSpacing: 6,
      outline: "none", width: "240px",
      paddingBottom: 10, marginBottom: 25, borderRadius: 0,
    },
    proceedBtn: {
      background: "transparent", border: "1px solid #d4af37",
      color: "#d4af37", padding: "12px 45px",
      borderRadius: 30, fontSize: 13,
      letterSpacing: 2, cursor: "pointer",
      transition: "background 0.2s",
    },
    devKey: {
      marginTop: 15, opacity: 0.5, fontSize: 11,
      color: "#ffffff", letterSpacing: 2, fontFamily: "monospace",
    },
  };

  return (
    <div style={ys.page}>
      <button onClick={onCancel} style={ys.backBtn}>
        ← {isHindi ? "वापस" : "Back"}
      </button>

      <div style={ys.icon}>⚖️</div>

      <h2 style={ys.question}>
        {isHindi
          ? '"क्या आपके पास अगले स्तर, शांत स्थान की कुंजी है?"'
          : '"Do you have the key to the next level, the Quieter Place?"'}
      </h2>

      <div style={ys.inputWrap}>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          placeholder={isHindi ? "कोड यहाँ लिखें" : "TYPE CODE HERE"}
          style={ys.input}
        />
        <button
          onClick={handleCheck}
          style={ys.proceedBtn}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {isHindi ? "प्रवेश करें" : "PROCEED"}
        </button>
        {import.meta.env.DEV && (
          <div style={ys.devKey}>DEV: {MASTER_KEY}</div>
        )}
      </div>
    </div>
  );
}

// ─── APP CONTENT ───
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    try { return localStorage.getItem("jsukoon_onboarded") === "true"; }
    catch { return false; }
  });

  const [lang, setLang] = useLS("jsukoon_lang", "English");
  const [themeSource, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const [themeKey, setThemeKey] = useLS("jsukoon_theme", "Void");
  const [mood, setMood] = useState(null);
  const [vaultUnlocked, setVaultUnlocked] = useLS("jsukoon_vault_unlocked", false);

  const T = themeSource === "manual"
    ? (THEMES[themeKey] || THEMES.Void)
    : (mood && THEMES[mood] ? THEMES[mood] : THEMES.Void);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsCheckingAuth(false);
      if (session?.user) {
        posthog.identify(session.user.id, { email: session.user.email });
      } else {
        posthog.reset(); // Clear identity on logout
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (hasOnboarded) track('View Feature', { featureName: location.pathname });
  }, [location, hasOnboarded]);

  useEffect(() => {
    const browseTimer = setInterval(() => creditSession(1, true), 60000);
    return () => clearInterval(browseTimer);
  }, []);

  const [selectedMood, setSelectedMood] = useState(null);

  const setTab = (newTab) => {
    if (newTab === "home") {
      posthog.capture("page_viewed", { page: "home" });
      navigate("/");
    }
    else if (newTab.startsWith("moodAction_")) {
      const moodLabel = newTab.replace("moodAction_", "");
      setSelectedMood(moodLabel);
      posthog.capture("mood_selected", { mood: moodLabel, lang });
      navigate("/moodaction");
    }
    else {
      posthog.capture("page_viewed", { page: newTab, lang });
      navigate(`/${newTab}`);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: T.bg, color: T.accent, fontFamily: "'Cormorant Garamond', serif", fontSize: "24px" }}>
        {lang === "Hindi" ? "सुकोन खुल रहा है..." : "Opening Sukoon..."}
      </div>
    );
  }

  if (!session) return <Login T={T} lang={lang} />;

  if (!hasOnboarded) {
    return (
      <Onboarding
        onComplete={() => {
          localStorage.setItem("jsukoon_onboarded", "true");
          setHasOnboarded(true);
          track('Onboarding Complete');
        }}
        setThemeKey={setThemeKey}
        setLang={setLang}
        T={T}
      />
    );
  }

  const deepLayers = ["/vault", "/resonance", "/stillness", "/quietcorner", "/soundbath", "/mandala", "/seedinmud"];
  const isProtected = deepLayers.includes(location.pathname) && !vaultUnlocked;

  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", background: "#080808", overflowX: "hidden" }}>
      <div style={{ height: "100%", width: "100%", maxWidth: 600, background: T.bg, color: T.text, transition: "background 0.8s ease, color 0.8s ease", position: "relative", boxShadow: "0 0 50px rgba(0,0,0,0.55)" }}>

        {isProtected ? (
          <YakshaGate
            lang={lang} T={T}
            onUnlock={() => setVaultUnlocked(true)}
            onCancel={() => setTab("practice")}
          />
        ) : (
          <Routes>
            <Route path="/" element={<Home setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep" element={<Sleep setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_scrambler" element={<DreamScrambler setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_ember" element={<DimmingEmber setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_scan" element={<HeavyScan setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_fire" element={<MidnightFire setTab={setTab} T={T} lang={lang} />} />
            <Route path="/sleep_beat" element={<DeepRhythm setTab={setTab} T={T} lang={lang} />} />
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
            <Route path="/moodaction" element={<MoodAction selectedMood={selectedMood} setTab={setTab} goBack={() => navigate(-1)} lang={lang} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
        <Analytics />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
