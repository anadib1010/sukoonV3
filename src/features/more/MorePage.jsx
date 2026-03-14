import React from 'react';
import { PageNav } from '../../components/SharedUI';
import { useLS } from '../../hooks/useLS';

// ─── THE 6 REFINED MOODS ───
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
  const hi = lang === "Hindi";

  // Unified Tools Grid (8 items = perfect 4x2 grid)
  const MAIN_TOOLS = [
    { id: "focus",      emoji: "🎯", label: hi ? "केंद्रित" : "Focus",       desc: hi ? "शांत खेल" : "Calm games" },
    { id: "practice",   emoji: "🧘", label: hi ? "अभ्यास" : "Practice",     desc: hi ? "सांस" : "Breathwork" },
    { id: "reflection", emoji: "🪞", label: hi ? "चिंतन" : "Reflection",   desc: hi ? "शांत विचार" : "Quiet thought" },
    { id: "journal",    emoji: "📖", label: hi ? "जर्नल" : "Journal",       desc: hi ? "लिखें, बोलें" : "Write, speak" },
    { id: "audio",      emoji: "🎵", label: hi ? "ऑडियो" : "Audio",         desc: hi ? "ध्वनि" : "Sounds" },
    { id: "wishes",     emoji: "✨", label: hi ? "इच्छा" : "Wishes",        desc: hi ? "गैलरी" : "Gallery" }, 
    { id: "progress",   emoji: "📈", label: hi ? "प्रगति" : "Progress",      desc: hi ? "आपकी यात्रा" : "Your journey" },
    { id: "settings",   emoji: "⚙️", label: hi ? "सेटिंग्स" : "Settings",    desc: hi ? "थीम, भाषा" : "Theme, lang" },
  ];

  // Original Glass Logic
  const bgM = T.bg.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const isDark = bgM ? (parseInt(bgM[1], 16) * 0.299 + parseInt(bgM[2], 16) * 0.587 + parseInt(bgM[3], 16) * 0.114) < 128 : true;
  const glass = {
    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.60)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.75)",
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
  };

  const handleMoodSelection = (m) => {
    setMood(m);
    if (setThemeKey) setThemeKey(m.theme);
    setTab(`moodAction_${m.label}`); 
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("home"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />
      
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 40px" }}>
        
        {/* SECTION: MOODS */}
        <p style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
          {hi ? "आप कैसा महसूस कर रहे हैं?" : "How are you feeling?"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 32 }}>
          {CORE_MOODS.map(m => {
            const isSelected = mood?.label === m.label;
            return (
              <button key={m.label} onClick={() => handleMoodSelection(m)}
                style={{ 
                  ...glass, 
                  borderRadius: 20, 
                  padding: "16px 8px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: 6, 
                  cursor: "pointer",
                  border: isSelected ? `1.5px solid ${T.accent}` : glass.border,
                  transition: "all 0.3s ease"
                }}>
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <span style={{ fontSize: 11, color: isSelected ? T.accent : T.text, fontWeight: isSelected ? 600 : 400 }}>
                  {hi ? m.labelH : m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* SECTION: TOOLS */}
        <p style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
          {hi ? "सभी उपकरण" : "All Tools"}
        </p>
        
        {/* Unified Tools Grid (4x2) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {MAIN_TOOLS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ ...glass, borderRadius: 18, padding: "14px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <span style={{ fontSize: 26 }}>{item.emoji}</span>
              <span style={{ fontSize: 11, color: T.text, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{item.label}</span>
              <span style={{ fontSize: 9, color: T.muted, textAlign: "center", lineHeight: 1.2, opacity: .7 }}>{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Emergency / Crisis Button - Full Width */}
        <button onClick={() => setTab("crisis")}
          style={{ 
            ...glass, 
            width: "100%", 
            borderRadius: 18, 
            padding: "16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: 12, 
            cursor: "pointer",
            border: `1px solid rgba(255, 60, 60, 0.3)`, 
            background: isDark ? "rgba(255, 60, 60, 0.05)" : "rgba(255, 60, 60, 0.1)"
          }}>
          <span style={{ fontSize: 24 }}>🆘</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 600, lineHeight: 1.2 }}>{hi ? "संकट सहायता" : "Crisis Support"}</div>
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.2, opacity: .8 }}>{hi ? "तत्काल सहायता और हेल्पलाइन" : "Immediate help & helplines"}</div>
          </div>
        </button>

      </div>
    </div>
  );
}