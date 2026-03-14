import React, { useState } from 'react';
import { SeedInMud } from '../games/SeedInMud';
// We will import the others here as we build them!
// import { SingingBowl } from '../games/SingingBowl'; 
// import { QuietCorner } from '../games/QuietCorner';

export function Resonance({ setTab, T, lang }) {
  const [activeTool, setActiveTool] = useState(null);
  const isHindi = lang === "Hindi";

  const TOOLS = [
    { id: "seed", icon: "🌰", title: isHindi ? "कीचड़ में बीज" : "Seed in the Mud", desc: isHindi ? "धैर्य और समय का अभ्यास" : "A practice in patience and time" },
    { id: "bowl", icon: "🥣", title: isHindi ? "ध्वनि स्नान" : "Sound Bath", desc: isHindi ? "आवृत्ति के साथ ऊर्जा को ट्यून करें" : "Tune your energy with frequency" },
    { id: "vastu", icon: "🧭", title: isHindi ? "शांत कोना" : "The Quiet Corner", desc: isHindi ? "अपने स्थान को संरेखित करें" : "Align your physical space" }
  ];

  const renderTool = () => {
    switch(activeTool) {
      case "seed": return <SeedInMud setTab={() => setActiveTool(null)} T={T} lang={lang} />;
      default: return null;
    }
  };

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "linear-gradient(180deg, #1a1a24 0%, #0d0d14 100%)", // Deep, quiet background
      overflowX: "hidden"
    }}>
      {/* ─── NAV ─── */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          // If a tool is open, go back to Resonance Menu. If Menu is open, go back to Layer 3 Vault.
          onClick={() => activeTool ? setActiveTool(null) : setTab("vault")} 
          style={{ background: 'none', border: 'none', fontSize: 20, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
        >
          ←
        </button>
        <span style={{ fontWeight: 300, color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: 14 }}>
          {isHindi ? "अनुनाद" : "Resonance"}
        </span>
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 24px" }}>
        {activeTool ? (
          <div style={{ width: "100%", height: "100%" }}>
            {renderTool()}
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 500, marginTop: "20px" }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: "#fff", fontWeight: 300, margin: 0 }}>
                {isHindi ? "स्तर ४: अनुनाद" : "Level 4: Resonance."}
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontStyle: 'italic' }}>
                {isHindi ? "अपनी आवृत्ति को ट्यून करें।" : "Tune your frequency."}
              </p>
            </div>

            {/* Menu Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "20px",
                    display: "flex", alignItems: "center", gap: 20,
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "background 0.2s ease"
                  }}
                >
                  <span style={{ fontSize: 28 }}>{tool.icon}</span>
                  <div>
                    <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#fff", margin: "0 0 4px", fontWeight: 400 }}>{tool.title}</h4>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>{tool.desc}</p>
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