import React, { useState } from 'react';
import { ShatteredThoughts } from './ShatteredThoughts';
import { TheStaringStar } from './TheStaringStar';
import { SandPainting } from './SandPainting';
import { TheHeavyStone } from './TheHeavyStone';

export function Stillness({ setTab, T, lang }) {
  const [activeTool, setActiveTool] = useState(null);
  const hi = lang === "Hindi";

  const TOOLS = [
    { id: "mirror", icon: "🪞", title: hi ? "बिखरे हुए विचार" : "Shattered Thoughts", desc: hi ? "अहंकार को पीछे छोड़ दें" : "Leave the ego behind" },
    { id: "star",   icon: "✨", title: hi ? "स्थिर सितारा" : "The Staring Star", desc: hi ? "बिना हिले ध्यान केंद्रित करें" : "Focus without wavering" },
    { id: "sand",   icon: "⏳", title: hi ? "रेत की पेंटिंग" : "Sand Painting", desc: hi ? "अनित्यता को स्वीकार करें" : "Accept impermanence" }
  ];

  const renderTool = () => {
    switch(activeTool) {
      case "mirror": return <ShatteredThoughts setTab={() => setActiveTool(null)} T={T} lang={lang} />;
      case "star": return <TheStaringStar setTab={() => setActiveTool(null)} T={T} lang={lang} />; 
      case "sand": return <SandPainting setTab={() => setActiveTool(null)} T={T} lang={lang} />; // ─── ADD THIS LINE ───
      default: return null;
    }
  };

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "#050508", // Almost total darkness
      overflowX: "hidden"
    }}>
      {/* ─── NAV ─── */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => activeTool ? setActiveTool(null) : setTab("resonance")} 
          style={{ background: 'none', border: 'none', fontSize: 20, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
        >
          ←
        </button>
        <span style={{ fontWeight: 300, color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', textTransform: 'uppercase', fontSize: 12 }}>
          {hi ? "निश्चलता" : "The Stillness"}
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 24px" }}>
        {activeTool ? (
          <div style={{ width: "100%", height: "100%" }}>
            {renderTool()}
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 500, marginTop: "40px" }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: "#fff", fontWeight: 200, margin: 0, letterSpacing: 1 }}>
                {hi ? "स्तर ५: निश्चलता" : "Level 5: Stillness."}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "10px",
                    display: "flex", alignItems: "center", gap: 25,
                    cursor: "pointer", textAlign: "left", width: "100%",
                  }}
                >
                  <span style={{ fontSize: 24, opacity: 0.6 }}>{tool.icon}</span>
                  <div>
                    <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "rgba(255,255,255,0.8)", margin: "0 0 2px", fontWeight: 300 }}>{tool.title}</h4>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", margin: 0 }}>{tool.desc}</p>
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