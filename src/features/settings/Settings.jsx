import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { PageNav } from '../../components/SharedUI';
import { THEMES } from '../../utils/theme';

export function Settings({
  setTab, goBack, T, lang,
  setThemeKey, setThemeSource, setLang,
  themeSource, themeKey
}) {
  const [confirmClear, setConfirmClear]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [prevThemeKey, setPrevThemeKey] = useState(null);
  const [visible, setVisible] = useState(false);
  const hi = lang === "Hindi";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleThemeChange = (key) => {
    setPrevThemeKey(themeKey);
    setThemeKey(key);
  };

  const toggleComparison = () => {
    if (prevThemeKey) {
      const current = themeKey;
      setThemeKey(prevThemeKey);
      setPrevThemeKey(current);
    }
  };

  // ─── STYLES ───
  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      // Delete all user data from Supabase then sign out
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Delete journal entries
        await supabase.from('journal_entries').delete().eq('user_id', user.id);
        // Delete user row if exists
        await supabase.from('users').delete().eq('id', user.id);
      }
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.reload();
    } catch (err) {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const s = {
    page: { height: "100%", display: "flex", flexDirection: "column", background: T.bg, color: T.text, overflow: "hidden" },

    scrollArea: { flex: 1, overflowY: "auto", padding: "10px 24px 80px" },

    // Entrance animation wrapper
    content: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },

    header: { marginBottom: 32 },

    heading: { fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, marginBottom: 8, color: T.text },

    subheading: { fontSize: 13, color: T.textSoft, lineHeight: 1.6, margin: 0 },

    sectionLabel: { fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },

    // PWA install card
    pwaCard: {
      marginBottom: 32,
      padding: "20px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      border: `1px solid ${T.accent}40`,
    },

    pwaTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 10, color: T.text },

    pwaList: { margin: 0, paddingLeft: 20, fontSize: 12, color: T.textSoft, lineHeight: 1.8 },

    // Language
    langSection: { marginBottom: 32 },

    langRow: { display: "flex", gap: 12 },

    langBtn: (active) => ({
      flex: 1,
      padding: "14px",
      borderRadius: 16,
      background: active ? `${T.accent}20` : "rgba(255,255,255,0.03)",
      border: `1px solid ${active ? T.accent : "transparent"}`,
      color: active ? T.accent : T.textSoft,
      fontSize: 14,
      cursor: "pointer",
      transition: "all 0.2s",
      fontFamily: "'Cormorant Garamond', serif",
    }),

    // Theme mode
    themeModeSection: { marginBottom: 32 },

    themeModeList: { display: "flex", flexDirection: "column", gap: 10 },

    themeModeBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px",
      borderRadius: 16,
      background: active ? `${T.accent}15` : "rgba(255,255,255,0.03)",
      border: `1px solid ${active ? T.accent : "transparent"}`,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.2s",
      width: "100%",
    }),

    themeModeEmoji: { fontSize: 24 },
    themeModeTitle: (active) => ({ margin: 0, fontSize: 14, color: active ? T.accent : T.text }),
    themeModeSub: { margin: 0, fontSize: 11, color: T.textSoft },

    // Palette grid
    paletteSection: { marginBottom: 40 },

    paletteHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },

    togglePrevBtn: {
      background: `${T.accent}15`,
      border: `1px solid ${T.accent}40`,
      padding: "4px 10px",
      borderRadius: 8,
      fontSize: 10,
      color: T.accent,
      cursor: "pointer",
      transition: "background 0.2s",
    },

    paletteGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },

    paletteBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer" },

    paletteSwatch: (theme, isSelected) => ({
      width: 52,
      height: 52,
      borderRadius: 14,
      background: theme.bg,
      border: `2.5px solid ${isSelected ? theme.accent : "rgba(255,255,255,0.1)"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: isSelected ? `0 0 15px ${theme.accent}40` : "none",
      transition: "all 0.3s ease",
    }),

    paletteDot: (theme) => ({ width: 16, height: 16, borderRadius: "50%", background: theme.accent }),

    paletteLabel: (isSelected) => ({
      fontSize: 10,
      color: isSelected ? T.accent : T.textSoft,
      textAlign: "center",
      fontWeight: isSelected ? 600 : 400,
      transition: "color 0.2s",
    }),

    // Data management
    dataSection: { borderTop: `1px solid ${T.borderWarm}`, paddingTop: 32, marginBottom: 40 },

    clearBtn: {
      width: "100%",
      padding: "16px",
      borderRadius: 16,
      background: "rgba(224,102,102,0.08)",
      border: "1px solid rgba(224,102,102,0.3)",
      color: "#e06666",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      transition: "background 0.2s",
    },

    // Footer links
    deleteBtn: {
      width: "100%", padding: "14px", borderRadius: 12,
      background: "rgba(180,30,30,0.08)",
      border: "1px solid rgba(180,30,30,0.25)",
      color: "rgba(220,80,80,0.9)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13, letterSpacing: "0.5px",
      cursor: "pointer", transition: "background 0.2s",
      marginTop: 8,
    },
    footer: { display: "flex", flexDirection: "column", gap: 14, alignItems: "center", paddingBottom: 40 },

    footerLink: { background: "none", border: "none", color: T.textSoft, fontSize: 13, textDecoration: "underline", cursor: "pointer" },

    footerLinkSmall: { background: "none", border: "none", color: T.textSoft, fontSize: 11, opacity: 0.5, textAlign: "center", maxWidth: "80%", cursor: "pointer" },
  };

  const THEME_MODES = [
    { id: "auto",   emoji: "🌤️", en: "Auto (Mood)",      hi: "ऑटो (मूड)",        subEn: "Colors shift with your mood",   subHi: "मूड के साथ रंग बदलें" },
    { id: "manual", emoji: "🎨", en: "Manual (Fixed)",   hi: "मैनुअल (स्थिर)",   subEn: "Pick a permanent color",        subHi: "अपना पसंदीदा रंग चुनें" },
  ];

  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} T={T} lang={lang} />

      <div className="scroll-area fade-up" style={s.scrollArea}>
        <div style={s.content}>

          {/* Header */}
          <div style={s.header}>
            <h1 style={s.heading}>{hi ? "सेटिंग्स" : "Settings"}</h1>
            <p style={s.subheading}>
              {hi ? "अपने अनुभव को अपनी पसंद के अनुसार ढालें।" : "Shape this space to feel like yours."}
            </p>
          </div>

          {/* 1. PWA Install */}
          <div style={s.pwaCard}>
            <p style={s.pwaTitle}>
              <span>📱</span> {hi ? "JSukoon इंस्टॉल करें" : "Install JSukoon"}
            </p>
            <ol style={s.pwaList}>
              <li>{hi ? "Safari या Chrome में 'Share' आइकन दबाएं" : "Tap Share in Safari or Chrome"}</li>
              <li>{hi ? "'Add to Home Screen' चुनें" : "Select 'Add to Home Screen'"}</li>
            </ol>
          </div>

          {/* 2. Language */}
          <div style={s.langSection}>
            <p style={s.sectionLabel}>{hi ? "भाषा" : "Language"}</p>
            <div style={s.langRow}>
              {["English", "Hindi"].map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={s.langBtn(lang === l)}
                  onMouseEnter={e => { if (lang !== l) e.currentTarget.style.background = `${T.accent}08`; }}
                  onMouseLeave={e => { if (lang !== l) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  {l === "Hindi" ? "हिंदी" : "English"}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme Mode */}
          <div style={s.themeModeSection}>
            <p style={s.sectionLabel}>{hi ? "थीम मोड" : "Theme Mode"}</p>
            <div style={s.themeModeList}>
              {THEME_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setThemeSource(mode.id)}
                  style={s.themeModeBtn(themeSource === mode.id)}
                  onMouseEnter={e => { if (themeSource !== mode.id) e.currentTarget.style.background = `${T.accent}08`; }}
                  onMouseLeave={e => { if (themeSource !== mode.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <span style={s.themeModeEmoji}>{mode.emoji}</span>
                  <div>
                    <p style={s.themeModeTitle(themeSource === mode.id)}>{hi ? mode.hi : mode.en}</p>
                    <p style={s.themeModeSub}>{hi ? mode.subHi : mode.subEn}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Palette Grid */}
          {themeSource === "manual" && (
            <div style={s.paletteSection} className="fade-in">
              <div style={s.paletteHeader}>
                <p style={{ ...s.sectionLabel, margin: 0 }}>{hi ? "रंग चुनें" : "Select Palette"}</p>
                {prevThemeKey && (
                  <button
                    onClick={toggleComparison}
                    style={s.togglePrevBtn}
                    onMouseEnter={e => e.currentTarget.style.background = `${T.accent}25`}
                    onMouseLeave={e => e.currentTarget.style.background = `${T.accent}15`}
                  >
                    {hi ? "पिछली थीम देखें" : "Toggle Previous"}
                  </button>
                )}
              </div>

              <div style={s.paletteGrid}>
                {Object.keys(THEMES).map(key => {
                  const theme = THEMES[key];
                  const isSelected = themeKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      style={s.paletteBtn}
                    >
                      <div style={s.paletteSwatch(theme, isSelected)}>
                        <div style={s.paletteDot(theme)} />
                      </div>
                      <span style={s.paletteLabel(isSelected)}>
                        {hi ? (theme.nameH || key) : (theme.name || key)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Data Management */}
          <div style={s.dataSection}>
            <button
              onClick={() => {
                if (confirmClear) { localStorage.clear(); window.location.reload(); }
                else setConfirmClear(true);
              }}
              style={s.clearBtn}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(224,102,102,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(224,102,102,0.08)"}
            >
              {confirmClear
                ? (hi ? "निश्चित? सब कुछ मिटाएं" : "Sure? Erase Everything")
                : (hi ? "सारा डेटा मिटाएं" : "Clear All App Data")}
            </button>

            {/* Delete Account */}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              style={s.deleteBtn}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(180,30,30,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(180,30,30,0.08)"}
            >
              {deleting
                ? "Deleting..."
                : confirmDelete
                  ? "Tap again to permanently delete account & all data"
                  : "Delete My Account & All Data"}
            </button>
          </div>

          {/* 6. Footer Links */}
          <div style={s.footer}>
            <button onClick={() => setTab("about")} style={s.footerLink}>
              {hi ? "JSukoon के बारे में" : "About JSukoon"}
            </button>
            <button onClick={() => setTab("privacy")} style={s.footerLink}>
              {hi ? "गोपनीयता नीति" : "Privacy Policy"}
            </button>
            <button onClick={() => setTab("terms")} style={s.footerLink}>
              {hi ? "सेवा की शर्तें" : "Terms of Service"}
            </button>
            <button onClick={() => setTab("legal")} style={s.footerLinkSmall}>
              {hi ? "कानूनी अस्वीकरण और शर्तें" : "Long Detailed Legal Disclaimer"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}