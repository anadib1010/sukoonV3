import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';
import { useLS } from '../../hooks/useLS';
import { THEMES } from '../../utils/theme';

// ─── THE 6 MOODS ──────────────────────────────────────────────────────
const CORE_MOODS = [
  { emoji: "😔", label: "Heavy",     labelH: "भारी",     theme: "Void"          },
  { emoji: "😤", label: "Restless",  labelH: "बेचैन",   theme: "TwilightBlue"  },
  { emoji: "😩", label: "Exhausted", labelH: "थका हुआ", theme: "SageSanctuary" },
  { emoji: "🙂", label: "Okay",      labelH: "ठीक",     theme: "FirstLight"    },
  { emoji: "😊", label: "Warm",      labelH: "गर्म",    theme: "PinkChampagne" },
  { emoji: "😢", label: "Sad",       labelH: "उदास",    theme: "SeaGlass"      },
];

export function MorePage({ setTab, goBack, T, lang, setThemeKey }) {
  const [mood, setMood] = useLS("jsukoon_today_mood", null);
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const hi = lang === "Hindi";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const MAIN_TOOLS = [
    { id: "focus",     emoji: "🎯", label: hi ? "केंद्रित"  : "Focus",    desc: hi ? "शांत खेल"     : "Calm games"   },
    { id: "practice",  emoji: "🧘", label: hi ? "अभ्यास"   : "Practice",  desc: hi ? "सांस"          : "Breathwork"   },
    { id: "community", emoji: "👥", label: hi ? "समुदाय"   : "Community", desc: hi ? "जुड़ें"         : "Connect"      },
    { id: "journal",   emoji: "📖", label: hi ? "जर्नल"    : "Journal",   desc: hi ? "लिखें, बोलें" : "Write, speak"  },
    { id: "audio",     emoji: "🎵", label: hi ? "ऑडियो"    : "Audio",     desc: hi ? "ध्वनि"         : "Sounds"       },
    { id: "wishes",    emoji: "✨", label: hi ? "इच्छा"    : "Wishes",    desc: hi ? "गैलरी"         : "Gallery"      },
    { id: "progress",  emoji: "📈", label: hi ? "प्रगति"   : "Progress",  desc: hi ? "आपकी यात्रा"  : "Your journey" },
    { id: "settings",  emoji: "⚙️", label: hi ? "सेटिंग्स" : "Settings",  desc: hi ? "थीम, भाषा"    : "Theme, lang"  },
  ];

  // Detect dark/light background for glass effects
  const bgM = T.bg.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const isDark = bgM
    ? (parseInt(bgM[1], 16) * 0.299 + parseInt(bgM[2], 16) * 0.587 + parseInt(bgM[3], 16) * 0.114) < 128
    : true;

  const glass = {
    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.60)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.75)",
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
  };

  const handleMoodClick = (m) => { setMood(m); setPrompt(m); };
  const handleYes = () => {
    if (setThemeKey) setThemeKey(prompt.theme);
    const m = prompt; setPrompt(null);
    setTab(`moodAction_${m.label}`);
  };
  const handleNo = () => {
    const m = prompt; setPrompt(null);
    setTab(`moodAction_${m.label}`);
  };

  // ─── STYLES ───
  const s = {
    page: { height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden", position: "relative" },

    scrollArea: { flex: 1, overflowY: "auto", padding: "16px 24px 40px" },

    sectionLabel: {
      fontSize: 10,
      color: T.muted,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 16,
    },

    // Mood grid
    moodGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 10,
      marginBottom: 32,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },

    moodCard: (isSelected, moodTheme) => {
      const mt = THEMES[moodTheme];
      return {
        ...glass,
        borderRadius: 20,
        padding: "16px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        // Show a hint of the mood's colour on the border — this is the preview
        border: isSelected
          ? `2px solid ${mt?.accent || T.accent}`
          : `1px solid ${mt?.accent || T.accent}35`,
        boxShadow: isSelected
          ? `0 0 12px ${mt?.accent || T.accent}30, inset 0 0 20px ${mt?.accent || T.accent}08`
          : glass.boxShadow,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      };
    },

    // Tiny colour bar at bottom of mood card — clear visual hint of the theme colour
    moodColorBar: (moodTheme) => {
      const mt = THEMES[moodTheme];
      return {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: mt?.accent || T.accent,
        opacity: 0.7,
        borderRadius: "0 0 20px 20px",
      };
    },

    moodEmoji: { fontSize: 28 },

    moodLabel: (isSelected, moodTheme) => {
      const mt = THEMES[moodTheme];
      return {
        fontSize: 11,
        color: isSelected ? (mt?.accent || T.accent) : T.text,
        fontWeight: isSelected ? 600 : 400,
        transition: "color 0.2s",
      };
    },

    // Tools grid
    toolsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gap: 10,
      marginBottom: 14,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
    },

    toolCard: {
      ...glass,
      borderRadius: 18,
      padding: "14px 4px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },

    toolEmoji: { fontSize: 26 },
    toolLabel: { fontSize: 11, color: T.text, fontWeight: 600, textAlign: "center", lineHeight: 1.2 },
    toolDesc:  { fontSize: 11, color: T.muted, textAlign: "center", lineHeight: 1.2, opacity: 0.7 },

    // Crisis button
    crisisBtn: {
      ...glass,
      width: "100%",
      borderRadius: 18,
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      cursor: "pointer",
      border: "1px solid rgba(255,60,60,0.3)",
      background: isDark ? "rgba(255,60,60,0.05)" : "rgba(255,60,60,0.1)",
      transition: "background 0.2s",
      opacity: visible ? 1 : 0,
      transition2: "opacity 0.6s ease 0.2s",
    },

    crisisTitle: { fontSize: 14, color: T.text, fontWeight: 600, lineHeight: 1.2 },
    crisisDesc:  { fontSize: 11, color: T.muted, lineHeight: 1.2, opacity: 0.8 },

    // Vault entry
    vaultEntry: {
      background: "none",
      border: "none",
      width: "100%",
      padding: "24px 0 8px",
      cursor: "pointer",
      color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)",
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
      fontSize: 13,
      letterSpacing: "0.3px",
      textAlign: "center",
    },

    // ── THEME PROMPT OVERLAY ──
    overlay: {
      position: "absolute",
      inset: 0,
      zIndex: 100,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      backdropFilter: "blur(4px)",
    },

    sheet: {
      width: "100%",
      maxWidth: 480,
      background: isDark ? "#1a1a22" : "#fafaf8",
      borderRadius: "24px 24px 0 0",
      padding: "28px 28px 40px",
      boxSizing: "border-box",
    },

    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 99,
      background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
      margin: "0 auto 24px",
    },

    sheetEmojiRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      marginBottom: 20,
    },

    sheetEmoji: { fontSize: 40 },

    // Theme preview swatch — this is the key new element
    themePreview: (targetTheme) => {
      const mt = THEMES[targetTheme];
      return {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      };
    },

    themePreviewSwatch: (targetTheme) => {
      const mt = THEMES[targetTheme];
      return {
        width: 48,
        height: 48,
        borderRadius: 14,
        background: mt?.bg || "#111",
        border: `2px solid ${mt?.accent || "#888"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 12px ${mt?.accent || "#888"}50`,
      };
    },

    themePreviewDot: (targetTheme) => {
      const mt = THEMES[targetTheme];
      return {
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: mt?.accent || "#888",
      };
    },

    themePreviewLabel: {
      fontSize: 10,
      color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
      textAlign: "center",
      letterSpacing: 0.5,
    },

    sheetTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 22,
      fontWeight: 300,
      color: isDark ? "#e8e8e8" : "#1a1a1a",
      textAlign: "center",
      lineHeight: 1.4,
      margin: "0 0 8px",
    },

    sheetSub: {
      fontSize: 13,
      textAlign: "center",
      color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
      margin: "0 0 28px",
      lineHeight: 1.5,
    },

    sheetBtnGroup: { display: "flex", flexDirection: "column", gap: 12 },

    yesBtn: {
      width: "100%",
      padding: "15px",
      borderRadius: 14,
      background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
      border: isDark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.12)",
      color: isDark ? "#e8e8e8" : "#1a1a1a",
      fontSize: 15,
      fontFamily: "'Cormorant Garamond', serif",
      cursor: "pointer",
      letterSpacing: 0.3,
      transition: "background 0.2s",
    },

    noBtn: {
      width: "100%",
      padding: "13px",
      borderRadius: 14,
      background: "transparent",
      border: "none",
      color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)",
      fontSize: 14,
      fontFamily: "'Cormorant Garamond', serif",
      cursor: "pointer",
      textDecoration: "underline",
    },
  };

  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("home"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div style={s.scrollArea}>

        {/* ── MOOD SECTION ── */}
        <p style={s.sectionLabel}>{hi ? "आप कैसा महसूस कर रहे हैं?" : "How are you feeling?"}</p>

        <div style={s.moodGrid}>
          {CORE_MOODS.map(m => {
            const isSelected = mood?.label === m.label;
            return (
              <button
                key={m.label}
                onClick={() => handleMoodClick(m)}
                style={s.moodCard(isSelected, m.theme)}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={s.moodEmoji}>{m.emoji}</span>
                <span style={s.moodLabel(isSelected, m.theme)}>
                  {hi ? m.labelH : m.label}
                </span>
                {/* Colour bar at bottom — always visible hint of theme colour */}
                <div style={s.moodColorBar(m.theme)} />
              </button>
            );
          })}
        </div>

        {/* ── TOOLS SECTION ── */}
        <p style={s.sectionLabel}>{hi ? "सभी उपकरण" : "All Tools"}</p>

        <div style={s.toolsGrid}>
          {MAIN_TOOLS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={s.toolCard}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = glass.boxShadow; }}
            >
              <span style={s.toolEmoji}>{item.emoji}</span>
              <span style={s.toolLabel}>{item.label}</span>
              <span style={s.toolDesc}>{item.desc}</span>
            </button>
          ))}
        </div>

        {/* ── CRISIS ── */}
        <button
          onClick={() => setTab("crisis")}
          style={s.crisisBtn}
          onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,60,60,0.1)" : "rgba(255,60,60,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(255,60,60,0.05)" : "rgba(255,60,60,0.1)"}
        >
          <span style={{ fontSize: 24 }}>🆘</span>
          <div style={{ textAlign: "left" }}>
            <div style={s.crisisTitle}>{hi ? "संकट सहायता" : "Crisis Support"}</div>
            <div style={s.crisisDesc}>{hi ? "तत्काल सहायता और हेल्पलाइन" : "Immediate help & helplines"}</div>
          </div>
        </button>

        {/* ── VAULT ENTRY ── */}
        <button onClick={() => setTab("vault")} style={s.vaultEntry}>
          {hi ? "एक और गहरी जगह है, अगर आप तैयार हैं।" : "There is a quieter place, if you are ready."}
        </button>

      </div>

      {/* ── THEME PROMPT OVERLAY ── */}
      {prompt && (() => {
        const targetTheme = THEMES[prompt.theme];
        return (
          <div onClick={handleNo} style={s.overlay}>
            <div onClick={e => e.stopPropagation()} style={s.sheet}>

              <div style={s.sheetHandle} />

              {/* Mood emoji + arrow + theme preview swatch */}
              <div style={s.sheetEmojiRow}>
                <div style={{ textAlign: "center" }}>
                  <span style={s.sheetEmoji}>{prompt.emoji}</span>
                  <p style={{ ...s.themePreviewLabel, marginTop: 4 }}>{hi ? prompt.labelH : prompt.label}</p>
                </div>

                <span style={{ fontSize: 20, opacity: 0.4, color: isDark ? "#fff" : "#000" }}>→</span>

                {/* THIS IS THE KEY NEW ELEMENT — shows the target theme */}
                <div style={s.themePreview(prompt.theme)}>
                  <div style={s.themePreviewSwatch(prompt.theme)}>
                    <div style={s.themePreviewDot(prompt.theme)} />
                  </div>
                  <p style={s.themePreviewLabel}>
                    {hi ? (targetTheme?.nameH || prompt.theme) : (targetTheme?.name || prompt.theme)}
                  </p>
                </div>
              </div>

              <p style={s.sheetTitle}>
                {hi ? "क्या थीम बदलें?" : "Change theme to match your mood?"}
              </p>

              <p style={s.sheetSub}>
                {hi ? "आप इसे बाद में सेटिंग्स से बदल सकते हैं।" : "You can always change it later in Settings."}
              </p>

              <div style={s.sheetBtnGroup}>
                <button
                  onClick={handleYes}
                  style={s.yesBtn}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.13)"}
                  onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
                >
                  {hi ? "हाँ, थीम बदलें" : "Yes, change theme"}
                </button>
                <button onClick={handleNo} style={s.noBtn}>
                  {hi ? "नहीं, वर्तमान थीम रखें" : "No, keep current theme"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
