import posthog from 'posthog-js';
import React, { useState, useEffect } from "react";
import { PageNav, usePressable } from "../../components/SharedUI";
import { ParticleCanvas } from "../../components/ParticleCanvas";
import { SensoryAnchor }  from "../games/SensoryAnchor";
import { BreathPainting } from "../breathing/BreathPainting";
import { BloomGame }      from "../games/BloomGame";
import { useLS } from "../../hooks/useLS";
import { ZenBox } from "../zen-box/ZenBox";

export function Focus({ setTab, goBack, T, lang }) {
  const [activeGame, setActiveGame] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [focusDone, setFocusDone] = useLS("jsukoon_focus_done", {});
  const [visible, setVisible] = useState(false);
  const hi = lang === "Hindi";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const markComplete = (id) => {
    const today = new Date().toDateString();
    setFocusDone(prev => ({ ...prev, [id]: today }));
    setGameComplete(true);
    posthog.capture('focus_game_completed', { game: id, lang });
  };

  const GAMES = [
    {
      id: "anchor",
      label: hi ? "5-4-3-2-1 वापसी" : "5-4-3-2-1 Return",
      emoji: "👁️",
      featured: true,
      shortDesc: hi ? "अस्थिर महसूस कर रहे हैं?" : "Feeling unsteady?",
      instruction: hi
        ? "5 चीज़ें देखें · 4 को छुएं · 3 सुनें · 2 सूंघें · 1 चखें। यह आपको अभी इस पल में वापस लाएगा।"
        : "Name 5 things you can see · 4 you can touch · 3 you hear · 2 you smell · 1 you taste. This brings you back to right now.",
    },
    {
      id: "breath",
      label: hi ? "सांस लें" : "Breathing",
      emoji: "🌬️",
      shortDesc: hi ? "मन शांत करना है?" : "Need to calm down?",
      instruction: hi
        ? "सांस लें और कैनवास पर रंग भरें। सांस छोड़ने के लिए टैप करें। बस इतना ही।"
        : "Breathe in and watch the canvas fill with colour. Tap to breathe out. That is all you need to do.",
    },
    {
      id: "bloom",
      label: hi ? "फूल खिलाएं" : "Bloom",
      emoji: "🌸",
      shortDesc: hi ? "धीमे होना है?" : "Need to slow down?",
      instruction: hi
        ? "धीरे-धीरे टैप करें — एक-एक पंखुड़ी खिलेगी। जल्दबाजी नहीं। छह टैप में पूरा फूल।"
        : "Tap slowly — one petal opens with each touch. No hurry. Six gentle taps to complete the bloom.",
    },
    {
      id: "particles",
      label: hi ? "ध्यान पैड" : "Focus Pad",
      emoji: "✨",
      shortDesc: hi ? "मन बिखरा हुआ है?" : "Mind feels scattered?",
      instruction: hi
        ? "दबाकर रखें — कण आपकी ओर आएंगे। ध्यान केंद्रित करें।"
        : "Press and hold — watch the particles gather toward you. Just focus on that one thing.",
    },
  ];

  const GAME_DESC = {
    anchor:    hi ? "अपनी इंद्रियों के माध्यम से इस पल में वापस आएं।" : "Name what you can see · touch · hear · smell · taste.",
    breath:    hi ? "सांस लें — कैनवास भरता है।" : "Breathe in to fill the canvas. Tap to breathe out.",
    bloom:     hi ? "धीरे से छुएं। छह बार में पूर्ण।" : "Tap slowly — six gentle touches to bloom.",
    particles: hi ? "दबाकर रखें — कणों को अपनी ओर खींचें।" : "Press and hold to gather the particles.",
  };

  const DONE_MESSAGES = {
    anchor:    { en: "You just brought yourself back to the present moment. That is real.", hi: "आप अभी इस पल में वापस आए। यही सबसे ज़रूरी था।" },
    breath:    { en: "You breathed through it. That is all it ever takes.", hi: "आपने सांस ली। बस यही काफी था।" },
    bloom:     { en: "Six gentle touches. That slowness was the practice.", hi: "छह धीमे स्पर्श। वह धीमापन ही अभ्यास था।" },
    particles: { en: "Focus is a muscle. You just used it.", hi: "ध्यान एक शक्ति है। आपने उसे इस्तेमाल किया।" },
  };

  const featured = GAMES.find(g => g.featured);
  const rest = GAMES.filter(g => !g.featured);
  const today = new Date().toDateString();

  // ─── STYLES ───
  const s = {
    page: { height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" },

    scrollArea: { flex: 1, overflowY: "auto", padding: "0 0 40px" },

    // Done screen
    doneScreen: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 32px",
      background: T.bg,
      textAlign: "center",
    },

    doneEmoji: { fontSize: 56, marginBottom: 20 },

    doneTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 28,
      color: T.text,
      fontWeight: 300,
      lineHeight: 1.4,
      marginBottom: 12,
    },

    doneMsg: {
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
      fontSize: 18,
      color: T.textSoft,
      lineHeight: 1.7,
      marginBottom: 32,
      maxWidth: 280,
    },

    doneBadge: {
      background: `${T.accent}10`,
      border: `1px solid ${T.accent}20`,
      borderRadius: 14,
      padding: "10px 20px",
      marginBottom: 24,
    },

    doneBadgeText: { fontSize: 13, color: T.accent, margin: 0 },

    doneBtnGroup: { display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 },

    doneBtnPrimary: {
      background: `${T.accent}18`,
      border: `1px solid ${T.accent}40`,
      borderRadius: 16,
      padding: "14px",
      color: T.accent,
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      transition: "transform 0.2s",
    },

    doneBtnSecondary: {
      background: "none",
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: "14px",
      color: T.muted,
      fontSize: 14,
      cursor: "pointer",
    },

    // Active game screen
    gameHeader: {
      background: `${T.accent}12`,
      border: `1px solid ${T.accent}30`,
      borderRadius: 18,
      padding: "16px 18px",
      marginBottom: 20,
    },

    gameEmoji: { fontSize: 22, margin: "0 0 6px" },

    gameTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 22,
      color: T.text,
      fontWeight: 400,
      margin: "0 0 10px",
      lineHeight: 1.3,
    },

    gameDesc: { fontSize: 15, color: T.textSoft, lineHeight: 1.8, margin: 0 },

    particleWrapper: {
      position: "relative",
      height: 300,
      width: "100%",
      background: T.surface,
      borderRadius: 20,
      border: `1px solid ${T.borderWarm}`,
      overflow: "hidden",
    },

    particleLabel: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      zIndex: 10,
    },

    particleLabelText: {
      color: T.muted,
      fontSize: 14,
      letterSpacing: 2,
      textTransform: "uppercase",
    },

    doneBtn: {
      width: "100%",
      marginTop: 24,
      background: `${T.accent}15`,
      border: `1px solid ${T.accent}35`,
      borderRadius: 16,
      padding: "16px",
      color: T.accent,
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      transition: "transform 0.2s, background 0.2s",
    },

    // Main grid
    gridPad: {
      padding: "20px 18px 0",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },

    heading: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 32,
      color: T.text,
      fontWeight: 400,
      marginBottom: 4,
    },

    subheading: { fontSize: 14, color: T.muted, marginBottom: 22, lineHeight: 1.6 },

    // Featured card
    featuredCard: {
      width: "100%",
      background: `${T.accent}18`,
      border: `2px solid ${T.accent}55`,
      borderRadius: 22,
      padding: "22px 20px",
      textAlign: "left",
      marginBottom: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      transition: "all 0.25s ease",
      cursor: "pointer",
    },

    featuredTop: { display: "flex", alignItems: "center", gap: 12 },
    featuredEmoji: { fontSize: 36 },

    featuredTag: {
      fontSize: 11,
      color: T.accent,
      letterSpacing: 2,
      textTransform: "uppercase",
      margin: "0 0 3px",
      fontWeight: 600,
    },

    featuredTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 24,
      color: T.text,
      fontWeight: 400,
      margin: 0,
      lineHeight: 1.2,
    },

    featuredInstruction: { fontSize: 14, color: T.textSoft, lineHeight: 1.75, margin: 0 },

    featuredCta: {
      alignSelf: "flex-start",
      background: `${T.accent}25`,
      border: `1px solid ${T.accent}50`,
      borderRadius: 99,
      padding: "8px 20px",
    },

    featuredCtaText: { fontSize: 13, color: T.accent, fontWeight: 500 },

    dividerLabel: {
      fontSize: 11,
      color: T.muted,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 12,
      marginTop: 8,
    },

    gameGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },

    gameCard: (done) => ({
      background: T.surface,
      border: `1px solid ${done ? T.accent + "55" : T.borderWarm}`,
      borderRadius: 18,
      padding: "18px 14px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
      backdropFilter: "blur(8px)",
      transition: "all 0.2s ease",
      textAlign: "left",
      position: "relative",
      cursor: "pointer",
    }),

    gameCardCheck: { position: "absolute", top: 10, right: 10, fontSize: 12, color: T.accent },
    gameCardEmoji: { fontSize: 30 },
    gameCardLabel: { fontSize: 15, color: T.accent, fontWeight: 600, margin: 0, lineHeight: 1.3 },
    gameCardDesc: { fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.55 },

    zenLabel: {
      fontSize: 11,
      color: T.muted,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 10,
    },
  };

  // ── Done screen ──
  if (activeGame && gameComplete) {
    const g = GAMES.find(x => x.id === activeGame);
    const msg = DONE_MESSAGES[activeGame] || { en: "You showed up. That is what matters.", hi: "आप आए। यही मायने रखता है।" };
    const totalDone = Object.keys(focusDone).length;

    return (
      <div className="fade-in" style={s.doneScreen}>
        <div style={s.doneEmoji}>{g.emoji}</div>
        <p style={s.doneTitle}>{hi ? "हो गया।" : "Done."}</p>
        <p style={s.doneMsg}>{hi ? msg.hi : msg.en}</p>
        {totalDone > 1 && (
          <div style={s.doneBadge}>
            <p style={s.doneBadgeText}>
              {hi ? `आपने अब तक ${totalDone} अभ्यास किए हैं 🌟` : `${totalDone} practices completed so far 🌟`}
            </p>
          </div>
        )}
        <div style={s.doneBtnGroup}>
          <button
            onClick={() => { setGameComplete(false); setActiveGame(null); }}
            style={s.doneBtnPrimary}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {hi ? "अभ्यास पर वापस जाएं →" : "Back to practices →"}
          </button>
          <button onClick={() => setTab("home")} style={s.doneBtnSecondary}>
            🏡 {hi ? "होम" : "Home"}
          </button>
        </div>
      </div>
    );
  }

  // ── Active game screen ──
  if (activeGame) {
    const g = GAMES.find(x => x.id === activeGame);
    return (
      <div style={s.page}>
        <PageNav
          onBack={() => { setActiveGame(null); setGameComplete(false); }}
          onHome={() => setTab("home")}
          backLabel={hi ? "वापस" : "Back"}
          T={T} lang={lang}
        />
        <div className="scroll-area fade-up" style={s.scrollArea}>
          <div style={{ padding: "0 18px" }}>

            <div style={s.gameHeader}>
              <p style={s.gameEmoji}>{g.emoji}</p>
              <p style={s.gameTitle}>{g.label}</p>
              <p style={s.gameDesc}>{GAME_DESC[activeGame]}</p>
            </div>

            {activeGame === "anchor"    && <SensoryAnchor T={T} lang={lang} />}
            {activeGame === "breath"    && <BreathPainting T={T} lang={lang} />}
            {activeGame === "bloom"     && <BloomGame T={T} lang={lang} />}
            {activeGame === "particles" && (
              <div style={s.particleWrapper}>
                <ParticleCanvas mode="idle" T={T} />
                <div style={s.particleLabel}>
                  <p style={s.particleLabelText}>{hi ? "दबाकर रखें" : "Press & Hold"}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => markComplete(activeGame)}
              style={s.doneBtn}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = `${T.accent}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = `${T.accent}15`; }}
            >
              {hi ? "✓ हो गया — मैंने यह किया" : "✓ I'm done — mark complete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main grid ──
  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("home"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={s.scrollArea}>
        <div style={s.gridPad}>

          <h1 style={s.heading}>{hi ? "ध्यान केंद्र" : "Focus"}</h1>
          <p style={s.subheading}>
            {hi ? "जब मन अस्थिर हो — कोई एक चुनें और बस शुरू करें।" : "When your mind feels unsteady — pick one and just begin."}
          </p>

          {/* Featured card */}
          <button
            onClick={() => { setGameComplete(false); setActiveGame(featured.id); }}
            style={s.featuredCard}
            {...usePressable(0.97)}
          >
            <div style={s.featuredTop}>
              <span style={s.featuredEmoji}>{featured.emoji}</span>
              <div>
                <p style={s.featuredTag}>{hi ? "▶ यहाँ से शुरू करें" : "▶ start here"}</p>
                <p style={s.featuredTitle}>{featured.label}</p>
              </div>
            </div>
            <p style={s.featuredInstruction}>{featured.instruction}</p>
            <div style={s.featuredCta}>
              <span style={s.featuredCtaText}>{hi ? "खेलें →" : "Begin →"}</span>
            </div>
          </button>

          {/* Divider */}
          <p style={s.dividerLabel}>{hi ? "या कोई और चुनें" : "or choose another"}</p>

          {/* Game grid */}
          <div style={s.gameGrid}>
            {rest.map(g => (
              <button
                key={g.id}
                onClick={() => { setGameComplete(false); setActiveGame(g.id); }}
                style={s.gameCard(focusDone[g.id] === today)}
                {...usePressable(0.95)}
              >
                {focusDone[g.id] === today && <span style={s.gameCardCheck}>✓</span>}
                <span style={s.gameCardEmoji}>{g.emoji}</span>
                <p style={s.gameCardLabel}>{g.label}</p>
                <p style={s.gameCardDesc}>{g.shortDesc}</p>
              </button>
            ))}
          </div>

          {/* ZenBox */}
          <p style={s.zenLabel}>{hi ? "या बस छुएं और महसूस करें" : "or just touch and feel"}</p>
          <ZenBox T={T} lang={lang} />

        </div>
      </div>
    </div>
  );
}

export default Focus;
