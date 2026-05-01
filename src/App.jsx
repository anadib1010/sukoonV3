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

import { Onboarding }     from './features/onboarding/Onboarding';
import { Settings }       from './features/settings/Settings';
import { Home }           from './features/home/Home';
import { Focus }          from './features/focus/Focus';
import { Journal }        from './features/journaling/Journal';
import { WarmthPage }     from './features/warmth/WarmthPage';
import { Bench }          from './features/bench/Bench';
import { MorePage }       from './features/more/MorePage';
import { ExploreMore }    from './features/more/ExploreMore';
import { Practice }       from './features/practice/Practice';
import { LegalDisclaimer }from './features/legal/LegalDisclaimer';
import { Reflection }     from './features/reflection/Reflection';
import { Progress }       from './features/progress/Progress';
import { AudioPage }      from './features/audio/AudioPage';
import { Crisis }         from './features/crisis/Crisis';
import { About }          from './features/about/About';
import { Privacy }        from './features/privacy/Privacy';
import { Terms }          from './features/privacy/Terms';
import { WishesGallery }  from './features/reflection/WishesGallery';
import MoodAction         from './MoodAction';
import { CommunityRoom }  from './features/games/CommunityRoom';
import { Sleep }          from './features/sleep/Sleep';
import { DeepRhythm }     from './features/sleep/DeepRhythm';
import { DreamScrambler } from './features/sleep/DreamScrambler';
import { DimmingEmber }   from './features/sleep/DimmingEmber';
import { HeavyScan }      from './features/sleep/HeavyScan';
import { MidnightFire }   from './features/sleep/MidnightFire';
import { TheDescent }     from './features/games/TheDescent';
import { Vault }          from './features/vault/Vault';
import { Resonance }      from './features/resonance/Resonance';
import { Stillness }      from './features/games/Stillness';
import { QuietCorner }    from './features/games/QuietCorner';
import { SoundBath }      from './features/games/SoundBath';
import { MandalaFlow }    from './features/games/MandalaFlow';
import { SeedInMud }      from './features/games/SeedInMud';
import { PostReset }      from './components/PostReset';
import { Reset }          from './components/Reset';
import { DeepDoor }       from './components/DeepDoor';
import SukoonChat         from './components/SukoonChat';
import { PinkSanctuary }  from './features/khub/PinkSanctuary';

// ─── K-UNIVERSE IMPORTS ───────────────────────────────────────────────────────
import { KHub }                from './features/khub/KHub';
import { KLavenderLoungeChat } from './features/khub/KLavenderLoungeChat';
import { KPopGeneralRoom }     from './features/khub/KPopGeneralRoom';
import { KDramaRoom }          from './features/khub/KDramaRoom';
import { PurpleLounge }        from './features/khub/PurpleLounge';
import { BlinkLounge }         from './features/khub/BlinkLounge';
import { Horoscope }           from './features/horoscope/Horoscope';
import { PurpleSanctuary }     from './features/khub/PurpleSanctuary';
import { UsernameSetup }       from './components/UsernameSetup';

// ─── AUTH SHEET ──────────────────────────────────────────────────────────────
function AuthSheet({ T, lang, onLogin, onDismiss, reason }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  const s = {
    overlay: {
      position: "fixed", inset: 0, zIndex: 99995,
      background: "rgba(0,0,0,0.6)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.4s ease",
    },
    sheet: {
      position: "fixed", bottom: 0, left: "50%",
      transform: visible ? "translate(-50%, 0)" : "translate(-50%, 100%)",
      transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
      width: "100%", maxWidth: 600,
      background: T.bg,
      borderRadius: "24px 24px 0 0",
      padding: "24px 24px 48px",
      boxSizing: "border-box",
      maxHeight: "90dvh",
      overflowY: "auto",
      zIndex: 99996,
    },
    handle: {
      width: 40, height: 4, borderRadius: 99,
      background: "rgba(255,255,255,0.2)",
      margin: "0 auto 20px",
    },
    reason: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(18px, 5vw, 22px)",
      fontWeight: 300, fontStyle: "italic",
      color: T.text, textAlign: "center",
      margin: "0 0 24px", lineHeight: 1.4,
    },
    dismissBtn: {
      background: "none", border: "none",
      color: "rgba(255,255,255,0.35)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12, letterSpacing: "1px",
      textTransform: "uppercase",
      cursor: "pointer", width: "100%",
      textAlign: "center", marginTop: 16,
      padding: "8px",
    },
  };

  return (
    <>
      <div style={s.overlay} onClick={dismiss} />
      <div style={s.sheet}>
        <div style={s.handle} />
        <p style={s.reason}>{reason}</p>
        <Login
          T={T} lang={lang}
          onLogin={() => { setVisible(false); setTimeout(onLogin, 400); }}
          embedded={true}
        />
        <button style={s.dismissBtn} onClick={dismiss}>
          Continue without saving
        </button>
      </div>
    </>
  );
}

// ─── INCOMING CALL OVERLAY ────────────────────────────────────────────────────
function IncomingCallOverlay({ T, lang, callerEmail, callType, onAccept, onDecline }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const s = {
    overlay: {
      position: "fixed", inset: 0, zIndex: 99997,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.3s ease",
    },
    card: {
      background: T.bg, borderRadius: 24,
      padding: "36px 28px", textAlign: "center",
      width: "85%", maxWidth: 340,
      border: `1px solid ${T.accent}40`,
      boxShadow: `0 0 40px ${T.accent}30`,
      transform: visible ? "scale(1)" : "scale(0.92)",
      transition: "transform 0.3s ease",
    },
    icon:   { fontSize: 52, marginBottom: 12 },
    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 22, color: T.text, fontWeight: 500,
      marginBottom: 6,
    },
    caller: {
      fontSize: 14, color: T.text, opacity: 0.6,
      marginBottom: 28, fontFamily: "'DM Sans', sans-serif",
    },
    btnRow:     { display: "flex", gap: 12, justifyContent: "center" },
    acceptBtn: {
      padding: "12px 28px", borderRadius: 25, border: "none",
      cursor: "pointer", fontWeight: "bold", fontSize: 14,
      backgroundColor: "#2ecc71", color: "#fff",
      fontFamily: "'DM Sans', sans-serif", letterSpacing: "1px",
    },
    declineBtn: {
      padding: "12px 28px", borderRadius: 25, border: "none",
      cursor: "pointer", fontWeight: "bold", fontSize: 14,
      backgroundColor: "#e74c3c", color: "#fff",
      fontFamily: "'DM Sans', sans-serif", letterSpacing: "1px",
    },
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.icon}>{callType === "video" ? "🎥" : "📞"}</div>
        <div style={s.title}>
          {callType === "video"
            ? (hi ? "वीडियो कॉल आ रही है..." : "Incoming Video Call...")
            : (hi ? "वॉइस कॉल आ रही है..." : "Incoming Secure Call...")}
        </div>
        <div style={s.caller}>{callerEmail}</div>
        <div style={s.btnRow}>
          <button style={s.acceptBtn} onClick={onAccept}>
            {hi ? "उठाएं" : "Accept"}
          </button>
          <button style={s.declineBtn} onClick={onDecline}>
            {hi ? "काटें" : "Decline"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP CONTENT ─────────────────────────────────────────────────────────────
function AppContent() {
  const navigate  = useNavigate();
  
  const location  = useLocation();
  const [chatRoom, setChatRoom] = useState('General');

  const [session,        setSession]        = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasOnboarded,   setHasOnboarded]   = useState(() => {
    try { return localStorage.getItem("jsukoon_onboarded") === "true"; }
    catch { return false; }
  });

  const [authSheet,      setAuthSheet]      = useState(null);
  const [pendingTab,     setPendingTab]      = useState(null);

  // ─── INCOMING CALL STATE ───
  const [incomingCall,   setIncomingCall]   = useState(null);

  // ─── USERNAME STATE ───
  const [needsUsername,  setNeedsUsername]  = useState(false);
  const [username,       setUsername]       = useState(null);

  const [lang,        setLang]        = useLS("jsukoon_lang", "English");
  const [themeSource, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const [themeKey,    setThemeKey]    = useLS("jsukoon_theme", "Void");
  const [mood,        setMood]        = useState(null);
  const [selectedMood,setSelectedMood] = useState(null);

  const T = themeSource === "manual"
    ? (THEMES[themeKey] || THEMES.Void)
    : (mood && THEMES[mood] ? THEMES[mood] : THEMES.Void);

  // ─── THEME COLOR SYNC ───
  useEffect(() => {
    document.body.style.backgroundColor = T.bg;
    document.documentElement.style.backgroundColor = T.bg;
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", T.bg);
  }, [T.bg]);

  // ─── AUTH STATE WATCHER ───
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setIsCheckingAuth(false);
      
      if (session?.user) {
        // Check localStorage first — if we already know the username, use it
        const cachedUsername = localStorage.getItem(`jsukoon_username_${session.user.id}`);
        if (cachedUsername) {
          setUsername(cachedUsername);
          setNeedsUsername(false);
          return;
        }
        
        // First time: fetch from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.username) {
          localStorage.setItem(`jsukoon_username_${session.user.id}`, profile.username);
          setUsername(profile.username);
          setNeedsUsername(false);
        } else {
          setNeedsUsername(true);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setIsCheckingAuth(false);

      if (session?.user) {
        posthog.identify(session.user.id, { email: session.user.email });

        // Only check username on first sign-in (NEVER on token refresh)
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          const cachedUsername = localStorage.getItem(`jsukoon_username_${session.user.id}`);
          if (cachedUsername) {
            setUsername(cachedUsername);
            setNeedsUsername(false);
            return;
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (profile?.username) {
            localStorage.setItem(`jsukoon_username_${session.user.id}`, profile.username);
            setUsername(profile.username);
            setNeedsUsername(false);
          } else {
            setNeedsUsername(true);
          }
        }
      } else {
        // User signed out
        posthog.reset();
        setNeedsUsername(false);
        setUsername(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── SESSION REFRESH — keeps token alive every 10 minutes ───
  //useEffect(() => {
    //if (!session) return;  // Don't try to refresh if we don't have a session yet

    //const refreshSession = async () => {
      // Check if session still exists before trying to refresh
      //const { data: { session: current } } = await supabase.auth.getSession();
      //if (!current) return;  // No session to refresh, skip silently

      //const { data, error } = await supabase.auth.refreshSession();
      //if (error) {
        //console.warn('Session refresh failed:', error.message);
      //} else if (data?.session) {
        //setSession(data.session);
      //}
    //};
    //const interval = setInterval(refreshSession, 10 * 60 * 1000);
    //const handleVisibility = () => {
      //if (document.visibilityState === 'visible') refreshSession();
    //};
    //document.addEventListener('visibilitychange', handleVisibility);
    //return () => {
      //clearInterval(interval);
      //document.removeEventListener('visibilitychange', handleVisibility);
    //};
  //}, [session?.user?.id]);  // Re-run when user changes

  // ─── TRACK PAGE VIEWS ───
  useEffect(() => {
    if (hasOnboarded) track('View Feature', { featureName: location.pathname });
  }, [location, hasOnboarded]);

  // ─── THE TWO-HEADED DRAGON WATCHER 🐉 ───
  useEffect(() => {
    if (!session?.user) return;
    const userId = session.user.id;

    const callRadar = supabase.channel('global-call-radar', { config: { broadcast: { ack: false } } });

    callRadar.on('broadcast', { event: 'global-ring' }, (payload) => {
      const data = payload.payload;

      if (data.participants && data.participants.includes(userId) && data.callerId !== userId) {
        if (data.action === 'start') {
          setIncomingCall({
            roomId:      data.roomId,
            callType:    'voice',
            callerEmail: data.callerEmail,
            roomDetails: data.roomDetails,
          });
          const ringtone = document.getElementById('global-ringtone');
          if (ringtone) ringtone.play().catch(e => console.log("Ringtone blocked"));
        } else if (data.action === 'cancel') {
          setIncomingCall(prev => {
            if (prev?.roomId === data.roomId) {
              const ringtone = document.getElementById('global-ringtone');
              if (ringtone) ringtone.pause();
              return null;
            }
            return prev;
          });
        }
      }
    }).subscribe();

    return () => { supabase.removeChannel(callRadar); };
  }, [session?.user?.id]);

  // ─── BROWSE CREDIT TIMER ───
  useEffect(() => {
    const browseTimer = setInterval(() => creditSession(1, true), 60000);
    return () => clearInterval(browseTimer);
  }, []);

  // ─── PAGE TITLES ───
  const PAGE_TITLES_EN = {
    home: "J Su Kun — Home", reset: "J Su Kun — Reset", postreset: "J Su Kun — Ready",
    more: "J Su Kun — More", vaultdoor: "J Su Kun — The Quieter Place",
    exploremore: "J Su Kun — Explore More", bench: "J Su Kun — The Bench",
    journal: "J Su Kun — Journal", audio: "J Su Kun — Audio", focus: "J Su Kun — Focus",
    practice: "J Su Kun — Practice", warmth: "J Su Kun — Warmth",
    progress: "J Su Kun — Progress", settings: "J Su Kun — Settings",
    reflection: "J Su Kun — Reflection", vault: "J Su Kun — The Vault",
    resonance: "J Su Kun — Resonance", stillness: "J Su Kun — Stillness",
    sleep: "J Su Kun — Sleep", crisis: "J Su Kun — Crisis Support",
    about: "J Su Kun — About", privacy: "J Su Kun — Privacy",
    terms: "J Su Kun — Terms", legal: "J Su Kun — Legal",
    moodaction: "J Su Kun — Mood Response", community: "J Su Kun — Community",
    quietcorner: "J Su Kun — Quiet Corner", soundbath: "J Su Kun — Sound Bath",
    mandala: "J Su Kun — Mandala Flow", seedinmud: "J Su Kun — Seed in the Mud",
    chat: "J Su Kun — Secure Chat",
    khub:         "J Su Kun — K-Universe",
    chat_lavender:"J Su Kun — Lavender Lounge",
    chat_kpop:    "J Su Kun — K-Pop Room",
    chat_kdrama:  "J Su Kun — K-Drama Lounge",
    chat_purple:  "J Su Kun — Purple Lounge",
    chat_blink:   "J Su Kun — Blink Lounge",
  };

  const PAGE_TITLES_HI = {
    home: "J Su Kun — होम", reset: "J Su Kun — रीसेट", postreset: "J Su Kun — तैयार",
    more: "J Su Kun — और", vaultdoor: "J Su Kun — शांत स्थान",
    exploremore: "J Su Kun — और खोजें", bench: "J Su Kun — बेंच",
    journal: "J Su Kun — जर्नल", audio: "J Su Kun — ऑडियो", focus: "J Su Kun — फ़ोकस",
    practice: "J Su Kun — अभ्यास", warmth: "J Su Kun — गर्माहट",
    progress: "J Su Kun — प्रगति", settings: "J Su Kun — सेटिंग्स",
    reflection: "J Su Kun — चिंतन", vault: "J Su Kun — वॉल्ट",
    resonance: "J Su Kun — अनुनाद", stillness: "J Su Kun — स्थिरता",
    sleep: "J Su Kun — नींद", crisis: "J Su Kun — संकट सहायता",
    about: "J Su Kun — हमारे बारे में", privacy: "J Su Kun — गोपनीयता",
    terms: "J Su Kun — शर्तें", legal: "J Su Kun — कानूनी",
    moodaction: "J Su Kun — मूड प्रतिक्रिया", community: "J Su Kun — समुदाय",
    quietcorner: "J Su Kun — शांत कोना", soundbath: "J Su Kun — ध्वनि स्नान",
    mandala: "J Su Kun — मंडला", seedinmud: "J Su Kun — कीचड़ में बीज",
    chat: "J Su Kun — सुरक्षित चैट",
    khub:         "J Su Kun — के-यूनिवर्स",
    chat_lavender:"J Su Kun — लैवेंडर लाउंज",
    chat_kpop:    "J Su Kun — के-पॉप रूम",
    chat_kdrama:  "J Su Kun — के-ड्रामा लाउंज",
    chat_purple:  "J Su Kun — पर्पल लाउंज",
    chat_blink:   "J Su Kun — ब्लिंक लाउंज",
  };

  const setPageTitle = (page) => {
    const titles = lang === "Hindi" ? PAGE_TITLES_HI : PAGE_TITLES_EN;
    document.title = titles[page] || "J Su Kun";
  };

  const PROTECTED_REASONS = {
    journal:        "Save your thoughts — create a free account.",
    progress:       "Track your journey — create a free account.",
    wishes:         "Share and see wishes — create a free account.",
    community:      "Join the community — create a free account.",
    warmth:         "Save your warmth — create a free account.",
    chat:           "Join the secure conversation — create a free account.",
    chat_lavender:  "Join the Lavender Lounge — login with Google to chat.",
    chat_kpop:      "Join the K-Pop Room — login with Google to chat.",
    chat_kdrama:    "Join the K-Drama Lounge — login with Google to chat.",
    chat_purple:    "Join the Purple Lounge — login with Google to chat. 💜",
    chat_blink:     "Join the Blink Lounge — login with Google to chat. 🌸",
  };

  const setTab = (newTab) => {
    if (!session && PROTECTED_REASONS[newTab]) {
      setPendingTab(newTab);
      setAuthSheet({ reason: PROTECTED_REASONS[newTab] });
      return;
    }
    if (newTab === "home") {
      posthog.capture("page_viewed", { page: "home" });
      setPageTitle("home");
      navigate("/");
    } else if (newTab.startsWith("moodAction_")) {
      const moodLabel = newTab.replace("moodAction_", "");
      setSelectedMood(moodLabel);
      posthog.capture("mood_selected", { mood: moodLabel, lang });
      setPageTitle("moodaction");
      navigate("/moodaction");
    } else {
      posthog.capture("page_viewed", { page: newTab, lang });
      setPageTitle(newTab);
      navigate(`/${newTab}`);
    }
  };

  // ─── LOADING SCREEN ───
  if (isCheckingAuth) {
    return (
      <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: T.bg, color: T.accent, fontFamily: "'Cormorant Garamond', serif", fontSize: "24px" }}>
        {lang === "Hindi" ? "सुकून खुल रहा है..." : "Opening Sukoon...."}
      </div>
    );
  }

  // ─── USERNAME SETUP SCREEN ───
  if (needsUsername && session?.user) {
    return (
      <UsernameSetup
        user={session.user}
        T={T}
        lang={lang}
        onComplete={(name) => {
          setUsername(name);
          setNeedsUsername(false);
        }}
      />
    );
  }

  // ─── ONBOARDING ───
  if (!hasOnboarded) {
    if (location.pathname === '/purple_sanctuary' || location.pathname === '/pink_sanctuary') {
      localStorage.setItem("jsukoon_onboarded", "true");
      setHasOnboarded(true);
    } else {
      return (
        <Onboarding
          onComplete={(destination) => {
            localStorage.setItem("jsukoon_onboarded", "true");
            track('Onboarding Complete');
            setHasOnboarded(true);
            if (destination === 'kpop') {
              setTab('khub');
            } else {
              setTab(destination);
            }
          }}
          setThemeKey={setThemeKey}
          setLang={setLang}
          lang={lang}
          T={T}
        />
      );
    }
  }

  // ─── MAIN APP ───
  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", background: "#080808", overflowX: "hidden" }}>
      <div style={{ height: "100%", width: "100%", maxWidth: 600, background: T.bg, color: T.text, transition: "background 0.8s ease, color 0.8s ease", position: "relative", boxShadow: "0 0 50px rgba(0,0,0,0.55)" }}>

        {/* 🌟 The Global Ringtone Player */}
        <audio id="global-ringtone" src="/ringtone.mp3" loop style={{ display: 'none' }} />

        <Routes>
          {/* ─── WELLNESS ROUTES ─── */}
          <Route path="/"                element={<Home           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/reset"           element={<Reset           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/postreset"       element={<PostReset       setTab={setTab} T={T} lang={lang} />} />
          <Route path="/sleep"           element={<Sleep           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/sleep_scrambler" element={<DreamScrambler  setTab={setTab} T={T} lang={lang} />} />
          <Route path="/sleep_ember"     element={<DimmingEmber    setTab={setTab} T={T} lang={lang} />} />
          <Route path="/sleep_scan"      element={<HeavyScan       setTab={setTab} T={T} lang={lang} />} />
          <Route path="/sleep_fire"      element={<MidnightFire    setTab={setTab} T={T} lang={lang} />} />
          <Route path="/sleep_beat"      element={<DeepRhythm      setTab={setTab} T={T} lang={lang} />} />
          <Route path="/focus"           element={<Focus           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/journal"         element={<Journal         setTab={setTab} T={T} lang={lang} />} />
          <Route path="/warmth"          element={<WarmthPage      setTab={setTab} T={T} lang={lang} />} />
          <Route path="/bench"           element={<Bench           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/more"            element={<MorePage        setTab={setTab} T={T} lang={lang} setThemeKey={setThemeKey} />} />
          <Route path="/vaultdoor"       element={<DeepDoor        setTab={setTab} T={T} lang={lang} destination="vault" />} />
          <Route path="/exploremore"     element={<ExploreMore     setTab={setTab} T={T} lang={lang} setThemeKey={setThemeKey} />} />
          <Route path="/practice"        element={<Practice        setTab={setTab} T={T} lang={lang} />} />
          <Route path="/community"       element={<CommunityRoom   setTab={setTab} T={T} lang={lang} />} />
          <Route path="/legal"           element={<LegalDisclaimer setTab={setTab} T={T} lang={lang} />} />
          <Route path="/reflection"      element={<Reflection      setTab={setTab} T={T} lang={lang} />} />
          <Route path="/progress"        element={<Progress        setTab={setTab} T={T} lang={lang} />} />
          <Route path="/descent"         element={<TheDescent      setTab={setTab} T={T} lang={lang} goBack={() => setTab("vault")} />} />
          <Route path="/vault"           element={<Vault           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/stillness"       element={<Stillness       setTab={setTab} T={T} lang={lang} />} />
          <Route path="/resonance"       element={<Resonance       setTab={setTab} T={T} lang={lang} />} />
          <Route path="/quietcorner"     element={<QuietCorner     setTab={setTab} T={T} lang={lang} />} />
          <Route path="/soundbath"       element={<SoundBath       setTab={setTab} T={T} lang={lang} />} />
          <Route path="/mandala"         element={<MandalaFlow     setTab={setTab} T={T} lang={lang} />} />
          <Route path="/seedinmud"       element={<SeedInMud       setTab={setTab} T={T} lang={lang} />} />
          <Route path="/settings"        element={<Settings        setTab={setTab} T={T} lang={lang} setLang={setLang} setThemeKey={setThemeKey} setThemeSource={setThemeSource} themeSource={themeSource} themeKey={themeKey} />} />
          <Route path="/audio"           element={<AudioPage       setTab={setTab} T={T} lang={lang} />} />
          <Route path="/crisis"          element={<Crisis          setTab={setTab} T={T} lang={lang} />} />
          <Route path="/about"           element={<About           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/privacy"         element={<Privacy         setTab={setTab} T={T} lang={lang} />} />
          <Route path="/terms"           element={<Terms           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/wishes"          element={<WishesGallery   setTab={setTab} T={T} lang={lang} />} />
          <Route path="/moodaction"      element={<MoodAction      selectedMood={selectedMood} setTab={setTab} goBack={() => navigate(-1)} lang={lang} />} />
          <Route path="/chat"            element={<SukoonChat      room={chatRoom} setTab={setTab} T={T} lang={lang} />} />

          {/* ─── K-UNIVERSE ROUTES ─── */}
          <Route path="/khub"            element={<KHub                setTab={setTab} T={T} lang={lang} setChatRoom={setChatRoom} />} />
          <Route path="/chat_lavender"   element={<KLavenderLoungeChat setTab={setTab} T={T} lang={lang} />} />
          <Route path="/chat_kpop"       element={<KPopGeneralRoom     setTab={setTab} T={T} lang={lang} />} />
          <Route path="/chat_kdrama"     element={<KDramaRoom          setTab={setTab} T={T} lang={lang} />} />
          <Route path="/chat_purple"     element={<PurpleLounge        setTab={setTab} T={T} lang={lang} />} />
          <Route path="/chat_blink"      element={<BlinkLounge         setTab={setTab} T={T} lang={lang} />} />
          <Route path="/horoscope"       element={<Horoscope           setTab={setTab} T={T} lang={lang} />} />
          <Route path="/pink_sanctuary"  element={<PinkSanctuary       T={T} lang={lang} setTab={setTab} goBack={() => setTab('khub')} />} />
          <Route path="/purple_sanctuary" element={<PurpleSanctuary    T={T} lang={lang} setTab={setTab} goBack={() => setTab('khub')} fromDirect={!localStorage.getItem('jsukoon_sanctuary_visited')} />} />

          {/* ─── CATCH-ALL (must be last) ─── */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* ─── INCOMING CALL OVERLAY ─── */}
        {incomingCall && (
          <IncomingCallOverlay
            T={T}
            lang={lang}
            callerEmail={incomingCall.callerEmail}
            callType={incomingCall.callType}
            onAccept={() => {
              const ringtone = document.getElementById('global-ringtone');
              if (ringtone) ringtone.pause();
              const roomToJoin = incomingCall.roomDetails;
              setIncomingCall(null);
              navigate("/chat", { state: { incomingCallRoom: roomToJoin } });
            }}
            onDecline={() => {
              const ringtone = document.getElementById('global-ringtone');
              if (ringtone) ringtone.pause();
              setIncomingCall(null);
            }}
          />
        )}

        {authSheet && (
          <AuthSheet
            T={T}
            lang={lang}
            reason={authSheet.reason}
            onLogin={() => {
              setAuthSheet(null);
              if (pendingTab) {
                setTab(pendingTab);
                setPendingTab(null);
              }
            }}
            onDismiss={() => {
              setAuthSheet(null);
              setPendingTab(null);
            }}
          />
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
