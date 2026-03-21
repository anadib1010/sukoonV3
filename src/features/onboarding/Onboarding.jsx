import React, { useState, useEffect } from 'react';

export function Onboarding({ onComplete, setThemeKey, setLang, T }) {
  const [screen, setScreen]   = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [mood, setMood]       = useState(null);
  const [lang, setLocalLang]  = useState(null);

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#050505";
    return () => { document.body.style.background = prev; };
  }, []);

  const hi    = lang === "Hindi";
  const serif = "'Cormorant Garamond', serif";

  const SCREENS = [
    { splash: true },
    { langPick: true },
    { features: true },
    {
      line1:  hi ? "न लक्ष्य।" : "No goals.",
      line2:  hi ? "यहाँ कोई दबाव नहीं है। आप जब चाहें आएं, जितना चाहें रुकें।"
                 : "No pressure here. Come when you need to. Stay as long as you like.",
      sub:    hi ? "यह जगह हमेशा आपके लिए है।" : "This space is always here for you.",
      button: hi ? "आगे" : "Continue",
    },
    {
      line1: hi ? "आज आप कैसे आए हैं?" : "How are you arriving today?",
      mood:  true,
    },
    {
      line1:   hi ? "एक धीमी सांस लें." : "Take one slow breath.",
      line2:   hi ? "नाक से धीरे सांस लें — रोकें — और धीरे छोड़ें।"
                  : "Breathe in slowly through your nose — hold — and breathe out.",
      sub:     hi ? "जब तैयार हों, शुरू करें।" : "When you are ready, begin.",
      button:  hi ? "JSukoon में प्रवेश करें" : "Enter JSukoon",
      breathe: true,
      last:    true,
    },
  ];

  const ONBOARD_MOODS = [
    { emoji: "😔", label: hi ? "भारी"     : "Heavy",     theme: "Void"          },
    { emoji: "😤", label: hi ? "बेचैन"   : "Restless",  theme: "TwilightBlue"  },
    { emoji: "😩", label: hi ? "थका हुआ" : "Exhausted", theme: "SageSanctuary" },
    { emoji: "🙂", label: hi ? "ठीक"      : "Okay",      theme: "FirstLight"    },
    { emoji: "😊", label: hi ? "गर्म"     : "Warm",      theme: "PinkChampagne" },
    { emoji: "😢", label: hi ? "उदास"     : "Sad",       theme: "SeaGlass"      },
  ];

  const FEATURES = [
    { emoji: "🌀", title: hi ? "दौड़ते विचार" : "Racing Thoughts",
      desc: hi ? "श्वास और ग्राउंडिंग अभ्यास — मन में ठहराव लाने के लिए।"
               : "Breathing and grounding tools to bring stillness." },
    { emoji: "🧘", title: hi ? "ध्यान" : "Meditation",
      desc: hi ? "12 गाइडेड सत्र — नींद, सुबह, करुणा, और अधिक के लिए।"
               : "Guided sessions — for sleep, mornings, compassion, and more." },
    { emoji: "📖", title: hi ? "जर्नल" : "Journal",
      desc: hi ? "लिखें, बोलें, जलाएं। AI आपके विचारों पर एक सौम्य दृष्टि देगा।"
               : "Write, speak, burn. AI offers a gentle reflection on what you share." },
    { emoji: "🌿", title: hi ? "अभयारण्य" : "Sanctuary",
      desc: hi ? "एक शांत कोना — परिवेश ध्वनि, उद्धरण, और बस बैठने की जगह।"
               : "A quiet corner — ambient sound, quotes, and a place to just sit." },
  ];

  const go = (next) => {
    setLeaving(true);
    setTimeout(() => { setScreen(next); setLeaving(false); }, 380);
  };

  const chooseLang = (l) => {
    setLocalLang(l);
    setLang(l);
    go(screen + 1);
  };

  const handleMood = (m) => {
    setMood(m);
    setThemeKey(m.theme);
    setTimeout(() => go(screen + 1), 500);
  };

  const handleComplete = () => {
    setLeaving(true);
    setTimeout(() => { document.body.style.background = "#050505"; onComplete(); }, 450);
  };

  const s        = SCREENS[screen];
  const showDots = screen >= 2;
  const dotCount = SCREENS.length - 2;
  const dotCurrent = screen - 2;

  // ─── STYLES ───────────────────────────────────────────────────────
  const st = {
    page: {
      position: "fixed", inset: 0, zIndex: 99998,
      background: "#050505",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px",
      overflowX: "hidden",
    },
    wrapper: {
      width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: leaving ? 0 : 1,
      transition: "opacity 0.35s ease",
      willChange: "opacity",
    },
    star: (i) => ({
      position: "absolute",
      top: `${8 + i * 11}%`, left: `${5 + i * 12}%`,
      width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1,
      borderRadius: "50%", background: "#ffffff",
      opacity: 0.25, pointerEvents: "none",
    }),
    dots: { position: "absolute", top: 52, display: "flex", gap: 8 },
    dot: (i) => ({
      width: i === dotCurrent ? 20 : 6, height: 6,
      borderRadius: 99,
      background: i <= dotCurrent ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)",
      transition: "all 0.4s ease",
    }),

    // Splash
    splashWrap:  { width: "100%", maxWidth: 340, textAlign: "center" },
    splashTitle: { fontFamily: serif, fontSize: "clamp(52px,14vw,72px)", fontWeight: 300, color: "#e8e8e8", margin: "0 0 6px", letterSpacing: "4px", lineHeight: 1 },
    splashRule:  { width: 28, height: 1, background: "rgba(255,255,255,0.2)", margin: "8px auto 28px" },
    splashBody:  { fontFamily: serif, fontSize: "clamp(18px,5vw,22px)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: "0 0 10px" },
    splashHindi: { fontFamily: serif, fontSize: "clamp(15px,4vw,17px)", color: "rgba(255,255,255,0.28)", fontStyle: "italic", lineHeight: 1.7, margin: "0 0 48px" },

    // Lang pick
    langWrap:    { width: "100%", maxWidth: 320, textAlign: "center" },
    langTitle:   { fontFamily: serif, fontSize: "clamp(26px,7vw,32px)", fontWeight: 300, color: "#e8e8e8", lineHeight: 1.4, marginBottom: 8, letterSpacing: 0.5 },
    langSub:     { fontFamily: serif, fontSize: "clamp(20px,5.5vw,24px)", fontWeight: 300, color: "rgba(255,255,255,0.42)", lineHeight: 1.4, marginBottom: 44 },
    langBtns:    { display: "flex", flexDirection: "column", gap: 14 },
    langBtn:     { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: "18px 24px", color: "#e8e8e8", fontSize: 20, fontFamily: serif, letterSpacing: 2, cursor: "pointer", transition: "all 0.3s ease" },

    // Features
    featWrap:    { width: "100%", maxWidth: 360, padding: "0 4px" },
    featLabel:   { fontFamily: serif, fontSize: 13, color: "rgba(255,255,255,0.38)", letterSpacing: 4, textTransform: "uppercase", textAlign: "center", marginBottom: 20 },
    featRow:     { display: "flex", gap: 14, padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" },
    featEmoji:   { fontSize: 26, flexShrink: 0, lineHeight: "1.6" },
    featTitle:   { fontFamily: serif, fontSize: 19, color: "rgba(255,255,255,0.85)", margin: "0 0 3px", fontWeight: 400 },
    featDesc:    { fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6, margin: 0 },
    featBtns:    { marginTop: 28, display: "flex", flexDirection: "column", gap: 12 },

    // Text screens
    textWrap:    { width: "100%", maxWidth: 340, textAlign: "center" },
    line1: (len) => ({ fontFamily: serif, fontSize: len > 20 ? "clamp(24px,6.5vw,30px)" : "clamp(28px,8vw,38px)", fontWeight: 300, color: "#e8e8e8", lineHeight: 1.3, marginBottom: 18, letterSpacing: 0.5 }),
    line2:       { fontFamily: serif, fontStyle: "italic", fontSize: "clamp(17px,4.5vw,21px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 28 },
    sub:         { fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 44, lineHeight: 1.8 },

    // Mood grid
    moodGrid:    { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, marginBottom: 32 },
    moodBtn: (sel) => ({
      background: sel ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${sel ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16, padding: "14px 6px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
      cursor: "pointer", transition: "all 0.3s ease",
    }),
    moodEmoji:   { fontSize: 26 },
    moodLabel:   { fontSize: 12, color: "rgba(255,255,255,0.58)", letterSpacing: 0.5 },

    // Breathing orb
    orbWrap:     { display: "flex", justifyContent: "center", marginBottom: 36 },
    orbOuter:    { position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" },
    orbRing:     { position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", animation: "orbBreathe 5.5s ease-in-out infinite" },
    orbInner:    { width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.18), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.15)", animation: "orbBreathe 5.5s ease-in-out infinite", animationDelay: "0.3s", boxShadow: "0 0 20px rgba(255,255,255,0.06)" },

    // Buttons
    btnWrap:     { display: "flex", flexDirection: "column", gap: 12 },
    btnBase:     { background: "transparent", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 99, padding: "15px 48px", color: "#e8e8e8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, cursor: "pointer", transition: "all 0.3s ease", width: "100%" },
    skipBtn:     { background: "none", border: "none", color: "rgba(255,255,255,0.32)", fontSize: 12, letterSpacing: 2, cursor: "pointer", padding: "10px 0", width: "100%" },
    legal:       { marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.28)", textAlign: "center", lineHeight: 1.7 },
  };

  return (
    <div style={st.page}>

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: scale(1) translateY(0);       opacity: 0.75; }
          50%       { transform: scale(1.18) translateY(-6px); opacity: 1;    }
        }
        @keyframes orbBreathe {
          0%   { transform: scale(0.82); opacity: 0.55; box-shadow: 0 0 0px rgba(255,255,255,0); }
          40%  { transform: scale(1.22); opacity: 1;    box-shadow: 0 0 32px rgba(255,255,255,0.12); }
          60%  { transform: scale(1.22); opacity: 1;    box-shadow: 0 0 32px rgba(255,255,255,0.12); }
          100% { transform: scale(0.82); opacity: 0.55; box-shadow: 0 0 0px rgba(255,255,255,0); }
        }
        .onboard-btn:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.32) !important; }
        .lang-btn:hover    { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.22) !important; }
        .mood-btn:hover    { background: rgba(255,255,255,0.09) !important; border-color: rgba(255,255,255,0.22) !important; transform: translateY(-2px); }
        .mood-btn          { transition: transform 0.15s ease; }
        .mood-btn:active   { transform: scale(0.96); }
        .onboard-btn:active, .lang-btn:active { transform: scale(0.97); }
      `}</style>

      <div style={st.wrapper}>

        {/* Stars */}
        {[...Array(8)].map((_, i) => <div key={i} style={st.star(i)} />)}

        {/* Progress dots */}
        {showDots && (
          <div style={st.dots}>
            {Array.from({ length: dotCount }).map((_, i) => (
              <div key={i} style={st.dot(i)} />
            ))}
          </div>
        )}

        {/* ── SCREEN 0: Splash ── */}
        {s.splash && (
          <div style={st.splashWrap}>
            <h1 style={st.splashTitle}>JSukoon</h1>
            <div style={st.splashRule} />
            <p style={st.splashBody}>
              A space for your mind —<br />
              when thoughts race,<br />
              when you feel heavy,<br />
              or when you need<br />
              one quiet moment.
            </p>
            <p style={st.splashHindi}>
              जब मन भारी हो —<br />
              एक शांत पल के लिए।
            </p>
            <button className="onboard-btn" onClick={() => go(1)} style={st.btnBase}>Begin</button>
          </div>
        )}

        {/* ── SCREEN 1: Language ── */}
        {s.langPick && (
          <div style={st.langWrap}>
            <h2 style={st.langTitle}>Choose your language</h2>
            <p style={st.langSub}>अपनी भाषा चुनें</p>
            <div style={st.langBtns}>
              {[["English", "English"], ["हिंदी", "Hindi"]].map(([label, val]) => (
                <button key={val} className="lang-btn" onClick={() => chooseLang(val)} style={st.langBtn}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SCREEN 2: Features ── */}
        {s.features && (
          <div style={st.featWrap}>
            <p style={st.featLabel}>{hi ? "यहाँ क्या है" : "What's inside"}</p>
            {FEATURES.map((f, i) => (
              <div key={i} style={st.featRow}>
                <span style={st.featEmoji}>{f.emoji}</span>
                <div>
                  <p style={st.featTitle}>{f.title}</p>
                  <p style={st.featDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
            <div style={st.featBtns}>
              <button className="onboard-btn" onClick={() => go(screen + 1)} style={st.btnBase}>
                {hi ? "आगे" : "Continue"}
              </button>
              <button onClick={handleComplete} style={st.skipBtn}>{hi ? "छोड़ें" : "skip"}</button>
            </div>
          </div>
        )}

        {/* ── SCREENS 3–5: Text / mood / breathe ── */}
        {!s.splash && !s.langPick && !s.features && (
          <div style={st.textWrap}>

            {s.line1 && <h1 style={st.line1(s.line1.length)}>{s.line1}</h1>}
            {s.line2 && <p style={st.line2}>{s.line2}</p>}
            {s.sub   && <p style={st.sub}>{s.sub}</p>}

            {/* Mood grid */}
            {s.mood && (
              <div style={st.moodGrid}>
                {ONBOARD_MOODS.map(m => (
                  <button
                    key={m.label}
                    className="mood-btn"
                    onClick={() => handleMood(m)}
                    style={st.moodBtn(mood?.label === m.label)}
                  >
                    <span style={st.moodEmoji}>{m.emoji}</span>
                    <span style={st.moodLabel}>{m.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Breathing orb */}
            {s.breathe && (
              <div style={st.orbWrap}>
                <div style={st.orbOuter}>
                  <div style={st.orbRing} />
                  <div style={st.orbInner} />
                </div>
              </div>
            )}

            {/* Primary button */}
            {s.button && (
              <div style={st.btnWrap}>
                <button
                  className="onboard-btn"
                  onClick={() => s.last ? handleComplete() : go(screen + 1)}
                  style={st.btnBase}
                >
                  {s.button}
                </button>
                {!s.last && (
                  <button onClick={handleComplete} style={st.skipBtn}>
                    {hi ? "छोड़ें" : "skip"}
                  </button>
                )}
              </div>
            )}

            {/* Legal note on screen 3 */}
            {screen === 3 && (
              <p style={st.legal}>
                {hi
                  ? "यह ऐप चिकित्सा, मनोवैज्ञानिक या धार्मिक सलाह नहीं देता। उपयोग स्वैच्छिक है।"
                  : "This app does not provide medical, psychological, or therapeutic advice. Use is voluntary."}
              </p>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
