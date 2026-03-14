// ─── ONBOARDING ──────────────────────────────────────────────────────
import React, { useState } from 'react';

export function Onboarding({ onComplete, setThemeKey, setLang, T }) {
  const [screen, setScreen]     = useState(0);
  const [leaving, setLeaving]   = useState(false);
  const [mood, setMood]         = useState(null);
  const [lang, setLocalLang]    = useState(null);

  const hi = lang === "Hindi";

  // ── Screen order ──────────────────────────────────────────────────
  // 0 → Beautiful welcome / value prop  (no lang needed, English + Hindi together)
  // 1 → Language pick
  // 2 → What's inside (features)
  // 3 → No goals / no pressure
  // 4 → How are you arriving? (mood pick)
  // 5 → One slow breath → Enter

  const SCREENS = [
    { splash: true },
    { langPick: true },
    { features: true },
    {
      line1:   hi ? "न लक्ष्य।"         : "No goals.",
      line2:   hi ? "यहाँ कोई दबाव नहीं है। आप जब चाहें आएं, जितना चाहें रुकें।"
                  : "No pressure here. Come when you need to. Stay as long as you like.",
      sub:     hi ? "यह जगह हमेशा आपके लिए है।" : "This space is always here for you.",
      button:  hi ? "आगे" : "Continue",
    },
    {
      line1:   hi ? "आज आप कैसे आए हैं?" : "How are you arriving today?",
      mood:    true,
    },
    {
      line1:   hi ? "एक धीमी सांस लें।"  : "Take one slow breath.",
      line2:   hi ? "नाक से धीरे सांस लें — रोकें — और धीरे छोड़ें।"
                  : "Breathe in slowly through your nose — hold — and breathe out.",
      sub:     hi ? "जब तैयार हों, शुरू करें।" : "When you are ready, begin.",
      button:  hi ? "JSukoon में प्रवेश करें" : "Enter JSukoon",
      breathe: true,
      last:    true,
    },
  ];

  const ONBOARD_MOODS = [
    { emoji:"😔", label: hi ? "भारी"     : "Heavy",     theme:"Void"          },
    { emoji:"😤", label: hi ? "बेचैन"   : "Restless",  theme:"TwilightBlue"  },
    { emoji:"😩", label: hi ? "थका हुआ" : "Exhausted", theme:"SageSanctuary" },
    { emoji:"🙂", label: hi ? "ठीक"      : "Okay",      theme:"FirstLight"    },
    { emoji:"😊", label: hi ? "गर्म"     : "Warm",      theme:"PinkChampagne" },
    { emoji:"😢", label: hi ? "उदास"     : "Sad",       theme:"SeaGlass"      },
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

  const s = SCREENS[screen];
  // progress dots only after splash + lang screens
  const showDots   = screen >= 2;
  const dotCount   = SCREENS.length - 2; // screens 2–5
  const dotCurrent = screen - 2;

  // ── shared text styles ────────────────────────────────────────────
  const serif = "'Cormorant Garamond', serif";
  const btnBase = {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 99,
    padding: "15px 48px",
    color: "#e8e8e8",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: 2,
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
  };
  const skipBtn = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.32)",
    fontSize: 12,
    letterSpacing: 2,
    cursor: "pointer",
    padding: "10px 0",
    width: "100%",
    textTransform: "uppercase",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "#050505",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px",
      opacity: leaving ? 0 : 1,
      transition: "opacity 0.4s ease",
      overflowX: "hidden",
    }}>

      {/* Subtle star dots */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${8 + i * 11}%`, left: `${5 + i * 12}%`,
          width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1,
          borderRadius: "50%", background: "#ffffff",
          opacity: 0.25, pointerEvents: "none",
        }} />
      ))}

      {/* Progress dots */}
      {showDots && (
        <div style={{ position: "absolute", top: 52, display: "flex", gap: 8 }}>
          {Array.from({ length: dotCount }).map((_, i) => (
            <div key={i} style={{
              width: i === dotCurrent ? 20 : 6, height: 6,
              borderRadius: 99,
              background: i <= dotCurrent ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)",
              transition: "all 0.4s ease",
            }} />
          ))}
        </div>
      )}

      {/* ── SCREEN 0: Splash / value prop ── */}
      {s.splash && (
        <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>

          {/* JSukoon — the hero mark */}
          <h1 style={{
            fontFamily: serif,
            fontSize: "clamp(52px, 14vw, 72px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#e8e8e8",
            margin: "0 0 6px",
            letterSpacing: "4px",
            lineHeight: 1,
          }}>
            JSukoon
          </h1>

          {/* Urdu mark */}
          <p style={{
            fontFamily: serif,
            fontSize: 18,
            color: "rgba(255,255,255,0.35)",
            margin: "0 0 20px",
            letterSpacing: 1,
            fontStyle: "italic",
          }}>سکون</p>

          <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.2)", margin: "0 auto 28px" }} />

          {/* Value proposition — bilingual, feels universal */}
          <p style={{
            fontFamily: serif,
            fontSize: "clamp(18px, 5vw, 22px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.65,
            margin: "0 0 10px",
          }}>
            A space for your mind —<br />
            when thoughts race,<br />
            when you feel heavy,<br />
            or when you need<br />
            one quiet moment.
          </p>

          <p style={{
            fontFamily: serif,
            fontSize: "clamp(15px, 4vw, 17px)",
            color: "rgba(255,255,255,0.28)",
            fontStyle: "italic",
            lineHeight: 1.7,
            margin: "0 0 48px",
          }}>
            जब मन भारी हो —<br />
            एक शांत पल के लिए।
          </p>

          <button onClick={() => go(1)} style={btnBase}>
            Begin
          </button>
        </div>
      )}

      {/* ── SCREEN 1: Language pick ── */}
      {s.langPick && (
        <div style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: "clamp(26px, 7vw, 32px)",
            fontWeight: 300,
            color: "#e8e8e8",
            lineHeight: 1.4,
            marginBottom: 8,
            letterSpacing: 0.5,
          }}>
            Choose your language
          </h2>
          <p style={{
            fontFamily: serif,
            fontSize: "clamp(20px, 5.5vw, 24px)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.42)",
            lineHeight: 1.4,
            marginBottom: 44,
          }}>
            अपनी भाषा चुनें
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["English","English"],["हिंदी","Hindi"]].map(([label, val]) => (
              <button key={val} onClick={() => chooseLang(val)} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 18,
                padding: "18px 24px",
                color: "#e8e8e8",
                fontSize: 20,
                fontFamily: serif,
                letterSpacing: 2,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SCREEN 2: Features ── */}
      {s.features && (
        <div style={{ width: "100%", maxWidth: 360, padding: "0 4px" }}>
          <p style={{
            fontFamily: serif,
            fontSize: 13,
            color: "rgba(255,255,255,0.38)",
            letterSpacing: 4,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 20,
          }}>
            {hi ? "यहाँ क्या है" : "What's inside"}
          </p>

          {[
            { emoji:"🌀", title: hi?"दौड़ते विचार":"Racing Thoughts",
              desc: hi?"श्वास और ग्राउंडिंग अभ्यास — मन को अभी शांत करने के लिए।"
                      :"Breathing and grounding tools — to calm your mind right now." },
            { emoji:"🧘", title: hi?"ध्यान":"Meditation",
              desc: hi?"12 गाइडेड सत्र — नींद, सुबह, करुणा, और अधिक के लिए।"
                      :"Guided sessions — for sleep, mornings, compassion, and more." },
            { emoji:"📖", title: hi?"जर्नल":"Journal",
              desc: hi?"लिखें, बोलें, जलाएं। AI आपके विचारों पर शांत प्रतिबिंब देगा।"
                      :"Write, speak, burn. AI offers a calm reflection on what you share." },
            { emoji:"🌿", title: hi?"अभयारण्य":"Sanctuary",
              desc: hi?"एक शांत कोना — परिवेश ध्वनि, उद्धरण, और बस बैठने की जगह।"
                      :"A quiet corner — ambient sound, quotes, and a place to just sit." },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, padding: "13px 0",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}>
              <span style={{ fontSize: 26, flexShrink: 0, lineHeight: "1.6" }}>{f.emoji}</span>
              <div>
                <p style={{ fontFamily: serif, fontSize: 19, color: "rgba(255,255,255,0.85)", margin: "0 0 3px", fontWeight: 400 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => go(screen + 1)} style={btnBase}>
              {hi ? "आगे" : "Continue"}
            </button>
            <button onClick={handleComplete} style={skipBtn}>
              {hi ? "छोड़ें" : "skip"}
            </button>
          </div>
        </div>
      )}

      {/* ── SCREENS 3–5: Text / mood / breathe ── */}
      {!s.splash && !s.langPick && !s.features && (
        <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>

          {s.line1 && (
            <h1 style={{
              fontFamily: serif,
              fontSize: s.line1.length > 20 ? "clamp(24px,6.5vw,30px)" : "clamp(28px,8vw,38px)",
              fontWeight: 300,
              color: "#e8e8e8",
              lineHeight: 1.3,
              marginBottom: s.line2 ? 18 : 32,
              letterSpacing: 0.5,
            }}>
              {s.line1}
            </h1>
          )}

          {s.line2 && (
            <p style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: "clamp(17px,4.5vw,21px)",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.65,
              marginBottom: 28,
            }}>
              {s.line2}
            </p>
          )}

          {s.sub && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 44,
              lineHeight: 1.8,
            }}>
              {s.sub}
            </p>
          )}

          {/* Mood grid — 6 moods, 3 cols */}
          {s.mood && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 10,
              marginBottom: 32,
            }}>
              {ONBOARD_MOODS.map(m => (
                <button key={m.label} onClick={() => handleMood(m)} style={{
                  background: mood?.label === m.label ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${mood?.label === m.label ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16,
                  padding: "14px 6px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 7,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}>
                  <span style={{ fontSize: 26 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", letterSpacing: 0.5 }}>{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Breathing orb */}
          {s.breathe && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent)",
                animation: "orbFloat 5s ease-in-out infinite",
              }} />
            </div>
          )}

          {/* Primary button */}
          {s.button && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => s.last ? handleComplete() : go(screen + 1)}
                style={btnBase}
              >
                {s.button}
              </button>
              {/* skip only on non-last screens */}
              {!s.last && (
                <button onClick={handleComplete} style={skipBtn}>
                  {hi ? "छोड़ें" : "skip"}
                </button>
              )}
            </div>
          )}

          {/* Legal — only on welcome/no-goals screen, inline not absolute */}
          {screen === 3 && (
            <p style={{
              marginTop: 40,
              fontSize: 11,
              color: "rgba(255,255,255,0.28)",
              textAlign: "center",
              lineHeight: 1.7,
            }}>
              {hi
                ? "यह ऐप चिकित्सा, मनोवैज्ञानिक या धार्मिक सलाह नहीं देता। उपयोग स्वैच्छिक है।"
                : "This app does not provide medical, psychological, or therapeutic advice. Use is voluntary."}
            </p>
          )}

        </div>
      )}

    </div>
  );
}
