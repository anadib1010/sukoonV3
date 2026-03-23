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
import { ExploreMore } from './features/more/ExploreMore'; 
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
import { PostReset } from './components/PostReset';
import { Reset } from "./components/Reset";
import { DeepDoor } from './components/DeepDoor';

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

  const [nextRoute, setNextRoute] = useState(null);

  const [lang, setLang] = useLS("jsukoon_lang", "English");
  const [themeSource, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const [themeKey, setThemeKey] = useLS("jsukoon_theme", "Void");
  const [mood, setMood] = useState(null);

  const T = themeSource === "manual" ? (THEMES[themeKey] || THEMES.Void) : (mood && THEMES[mood] ? THEMES[mood] : THEMES.Void);

  // ─── 📱 MOBILE BROWSER CAMOUFLAGE ENGINE ───
  useEffect(() => {
    // 1. Paint the floor AND the sub-floor so no white peeks through!
    document.body.style.backgroundColor = T.bg;
    document.documentElement.style.backgroundColor = T.bg; // 🌟 THE FIX: The HTML Sub-floor!

    // 2. Paint the top "ceiling" (battery/clock area)
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", T.bg);
  }, [T.bg]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsCheckingAuth(false);
      if (session?.user) { posthog.identify(session.user.id, { email: session.user.email }); } 
      else { posthog.reset(); }
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

  useEffect(() => {
    if (hasOnboarded && nextRoute) {
      if (nextRoute === "reset") {
        navigate("/reset", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      setNextRoute(null);
    }
  }, [hasOnboarded, nextRoute, navigate]);

  const [selectedMood, setSelectedMood] = useState(null);

  const PAGE_TITLES_EN = { home: "JSukoon — Home", reset: "JSukoon — Reset", postreset: "JSukoon — Ready", more: "JSukoon — More", vaultdoor: "JSukoon — The Quieter Place", exploremore: "JSukoon — Explore More", bench: "JSukoon — The Bench", journal: "JSukoon — Journal", audio: "JSukoon — Audio", focus: "JSukoon — Focus", practice: "JSukoon — Practice", warmth: "JSukoon — Warmth", progress: "JSukoon — Progress", settings: "JSukoon — Settings", reflection: "JSukoon — Reflection", vault: "JSukoon — The Vault", resonance: "JSukoon — Resonance", stillness: "JSukoon — Stillness", sleep: "JSukoon — Sleep", crisis: "JSukoon — Crisis Support", about: "JSukoon — About", privacy: "JSukoon — Privacy", legal: "JSukoon — Legal", moodaction: "JSukoon — Mood Response", community: "JSukoon — Community", quietcorner: "JSukoon — Quiet Corner", soundbath: "JSukoon — Sound Bath", mandala: "JSukoon — Mandala Flow", seedinmud: "JSukoon — Seed in the Mud" };
  const PAGE_TITLES_HI = { home: "JSukoon — होम", reset: "JSukoon — रीसेट", postreset: "JSukoon — तैयार", more: "JSukoon — और", vaultdoor: "JSukoon — शांत स्थान", exploremore: "JSukoon — और खोजें", bench: "JSukoon — बेंच", journal: "JSukoon — जर्नल", audio: "JSukoon — ऑडियो", focus: "JSukoon — फ़ोकस", practice: "JSukoon — अभ्यास", warmth: "JSukoon — गर्माहट", progress: "JSukoon — प्रगति", settings: "JSukoon — सेटिंग्स", reflection: "JSukoon — चिंतन", vault: "JSukoon — वॉल्ट", resonance: "JSukoon — अनुनाद", stillness: "JSukoon — स्थिरता", sleep: "JSukoon — नींद", crisis: "JSukoon — संकट सहायता", about: "JSukoon — हमारे बारे में", privacy: "JSukoon — गोपनीयता", legal: "JSukoon — कानूनी", moodaction: "JSukoon — मूड प्रतिक्रिया", community: "JSukoon — समुदाय", quietcorner: "JSukoon — शांत कोना", soundbath: "JSukoon — ध्वनि स्नान", mandala: "JSukoon — मंडला", seedinmud: "JSukoon — कीचड़ में बीज" };

  const setPageTitle = (page) => {
    const titles = lang === "Hindi" ? PAGE_TITLES_HI : PAGE_TITLES_EN;
    document.title = titles[page] || "JSukoon";
  };

  const setTab = (newTab) => {
    if (newTab === "home") {
      posthog.capture("page_viewed", { page: "home" });
      setPageTitle("home");
      navigate("/");
    }
    else if (newTab.startsWith("moodAction_")) {
      const moodLabel = newTab.replace("moodAction_", "");
      setSelectedMood(moodLabel);
      posthog.capture("mood_selected", { mood: moodLabel, lang });
      setPageTitle("moodaction");
      navigate("/moodaction");
    }
    else {
      posthog.capture("page_viewed", { page: newTab, lang });
      setPageTitle(newTab);
      navigate(`/${newTab}`);
    }
  };

  if (isCheckingAuth) {
    return <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: T.bg, color: T.accent, fontFamily: "'Cormorant Garamond', serif", fontSize: "24px" }}>{lang === "Hindi" ? "सुकून खुल रहा है..." : "Opening Sukoon..."}</div>;
  }

  if (!session) return <Login T={T} lang={lang} />;

  if (!hasOnboarded) {
    return (
      <Onboarding
        onComplete={(destination) => {
          localStorage.setItem("jsukoon_onboarded", "true");
          track('Onboarding Complete');

          setNextRoute(destination); 
          setHasOnboarded(true);    
        }}
        setThemeKey={setThemeKey}
        setLang={setLang}
        T={T}
      />
    );
  }

  const deepLayers = ["/vault", "/resonance", "/stillness", "/quietcorner", "/soundbath", "/mandala", "/seedinmud"];

  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", background: "#080808", overflowX: "hidden" }}>
      <div style={{ height: "100%", width: "100%", maxWidth: 600, background: T.bg, color: T.text, transition: "background 0.8s ease, color 0.8s ease", position: "relative", boxShadow: "0 0 50px rgba(0,0,0,0.55)" }}>
        <Routes>
            <Route path="/" element={<Home setTab={setTab} T={T} lang={lang} />} />
            <Route path="/reset" element={<Reset setTab={setTab} T={T} lang={lang} />} />
            <Route path="/postreset" element={<PostReset setTab={setTab} T={T} lang={lang} />} />
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
            <Route path="/vaultdoor" element={<DeepDoor setTab={setTab} T={T} lang={lang} destination="vault" />} />
            <Route path="/exploremore" element={<ExploreMore setTab={setTab} T={T} lang={lang} setThemeKey={setThemeKey} />} />
            
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