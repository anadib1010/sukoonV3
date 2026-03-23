import React, { useState } from 'react';
import { ShatteredThoughts } from './ShatteredThoughts';
import { TheStaringStar } from './TheStaringStar';
import { SandPainting } from './SandPainting';
import { TheHeavyStone } from './TheHeavyStone';
import { TheUnsentLetter } from './TheUnsentLetter';

export function Stillness({ setTab, T, lang }) {
  const [activeTool, setActiveTool] = useState(null);
  const hi = lang === "Hindi";

  const TOOLS = [
    { id: "mirror",     icon: "🪞", title: hi ? "बिखरे हुए विचार" : "Shattered Thoughts",  desc: hi ? "अहंकार को पीछे छोड़ दें" : "Leave the ego behind" },
    { id: "star",       icon: "✨", title: hi ? "स्थिर सितारा"     : "The Staring Star",     desc: hi ? "बिना हिले ध्यान केंद्रित करें" : "Focus without wavering" },
    { id: "heavystone", icon: "🪨", title: hi ? "भारी पत्थर"       : "The Heavy Stone",      desc: hi ? "नियंत्रण को जाने दें" : "Surrender your burdens" },
    { id: "letter",     icon: "✉️", title: hi ? "अनभेजा पत्र"      : "The Unsent Letter",    desc: hi ? "कर्म के तारों को काटें" : "Sever karmic cords" },
    { id: "sand",       icon: "⏳", title: hi ? "रेत की पेंटिंग"   : "Sand Painting",        desc: hi ? "अनित्यता को स्वीकार करें" : "Accept impermanence" },
  ];

  const renderTool = () => {
    switch (activeTool) {
      case "mirror":     return <ShatteredThoughts setTab={() => setActiveTool(null)} T={T} lang={lang} />;
      case "star":       return <TheStaringStar    setTab={() => setActiveTool(null)} T={T} lang={lang} />;
      case "heavystone": return <TheHeavyStone     setTab={() => setActiveTool(null)} T={T} lang={lang} />;
      case "letter":     return <TheUnsentLetter   setTab={() => setActiveTool(null)} T={T} lang={lang} />;
      case "sand":       return <SandPainting      setTab={() => setActiveTool(null)} T={T} lang={lang} />;
      default: return null;
    }
  };

  const s = {
    page: {
      height: "100%", display: "flex", flexDirection: "column",
      background: "#050508", overflowX: "hidden",
    },
    nav: { padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 },
    navBtn: {
      background: "none", border: "none", fontSize: 20,
      color: "rgba(255,255,255,0.4)", cursor: "pointer",
    },
    navLabel: {
      fontWeight: 300, color: "rgba(255,255,255,0.3)",
      letterSpacing: "3px", textTransform: "uppercase", fontSize: 12,
    },
    body: {
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "10px 24px",
    },
    toolWrap: { width: "100%", height: "100%" },
    listWrap: { width: "100%", maxWidth: 500, marginTop: "40px" },
    heading: {
      textAlign: "center", marginBottom: 60,
    },
    headingText: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 32,
      color: "#fff", fontWeight: 200, margin: 0, letterSpacing: 1,
    },
    toolList: { display: "flex", flexDirection: "column", gap: 24 },
    toolBtn: {
      background: "none", border: "none", padding: "10px",
      display: "flex", alignItems: "center", gap: 25,
      cursor: "pointer", textAlign: "left", width: "100%",
    },
    toolIcon: { fontSize: 24, opacity: 0.6 },
    toolTitle: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 20,
      color: "rgba(255,255,255,0.8)", margin: "0 0 2px", fontWeight: 300,
    },
    toolDesc: { fontSize: 12, color: "rgba(255,255,255,0.9)", margin: 0 },
  };

  return (
    <div style={s.page}>
      <div style={s.nav}>
        <button
          onClick={() => activeTool ? setActiveTool(null) : setTab("resonance")}
          style={s.navBtn}
        >
          ←
        </button>
        <span style={s.navLabel}>{hi ? "निश्चलता" : "The Stillness"}</span>
      </div>

      <div style={s.body}>
        {activeTool ? (
          <div style={s.toolWrap}>{renderTool()}</div>
        ) : (
          <div style={s.listWrap}>
            <div style={s.heading}>
              <p style={s.headingText}>{hi ? "स्तर ५: निश्चलता" : "Level 5: Stillness."}</p>
            </div>
            <div style={s.toolList}>
              {TOOLS.map(tool => (
                <button key={tool.id} onClick={() => setActiveTool(tool.id)} style={s.toolBtn}>
                  <span style={s.toolIcon}>{tool.icon}</span>
                  <div>
                    <h4 style={s.toolTitle}>{tool.title}</h4>
                    <p style={s.toolDesc}>{tool.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
