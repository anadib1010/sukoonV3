import React, { useState } from 'react';

import { BreathPainting } from '../breathing/BreathPainting';
import { NadiShodhana } from '../breathing/NadiShodhana';
import { StoneDrop } from '../games/StoneDrop';
import { BloomGame } from '../games/BloomGame';
import { BilateralTapping } from '../games/BilateralTapping';
import { SensoryAnchor } from '../games/SensoryAnchor';
import { HeavyThought } from '../games/HeavyThought'; 
import { UnsentLetter } from '../games/UnsentLetter';

export function Focus({ setTab, T, lang }) {
  const [activeTool, setActiveTool] = useState(null);
  const isHindi = lang === "Hindi";

  const TOOLS = [
    { id: "breath", icon: "🎨", title: isHindi ? "सांसों की चित्रकारी" : "Breath Painting", desc: isHindi ? "रंगों के साथ अपनी सांस देखें" : "Watch your breath fill with color" },
    { id: "nadi", icon: "🌬️", title: isHindi ? "नाड़ी शोधन" : "Nadi Shodhana", desc: isHindi ? "मस्तिष्क के दोनों हिस्सों को संतुलित करें" : "Balance both sides of the brain" },
    { id: "stone", icon: "🌊", title: isHindi ? "पत्थर छोड़ें" : "Stone Drop", desc: isHindi ? "भारी विचारों को पानी में डूबने दें" : "Let heavy thoughts sink in deep water" },
    { id: "bloom", icon: "🌸", title: isHindi ? "खिलना" : "Lotus Bloom", desc: isHindi ? "लयबद्ध टैपिंग से खुद को स्थिर करें" : "Steady yourself with rhythmic tapping" },
    { id: "tap", icon: "🧠", title: isHindi ? "द्विपक्षीय टैपिंग" : "Bilateral Tapping", desc: isHindi ? "EMDR आधारित स्पर्श और ध्वनि" : "EMDR-inspired touch and panning sound" },
    { id: "sense", icon: "🌿", title: isHindi ? "इंद्रिय एंकर" : "Sensory Anchor", desc: isHindi ? "5-4-3-2-1 ग्राउंडिंग तकनीक" : "5-4-3-2-1 grounding technique" },
    { id: "heavy", icon: "🎈", title: isHindi ? "भारी विचार" : "Heavy Thought", desc: isHindi ? "विचारों को गुब्बारे में भरें और छोड़ें" : "Fill a balloon with worries and let it go" },
    { id: "unsent", icon: "✉️", title: isHindi ? "बिना भेजा पत्र" : "Unsent Letter", desc: isHindi ? "वो सब कहें जिसे कहना मुश्किल है" : "Say everything that is hard to speak" }
  ];

  const renderTool = () => {
    switch(activeTool) {
      case "breath": return <BreathPainting T={T} lang={lang} />;
      case "nadi":   return <NadiShodhana T={T} lang={lang} />;
      case "stone":  return <StoneDrop T={T} lang={lang} />;
      case "bloom":  return <BloomGame T={T} lang={lang} />;
      case "tap":    return <BilateralTapping T={T} lang={lang} />;
      case "sense":  return <SensoryAnchor T={T} lang={lang} />;
      case "heavy":  return <HeavyThought T={T} lang={lang} />;
      case "unsent": return <UnsentLetter T={T} lang={lang} />;
      default: return null;
    }
  };

  return (
    <div className="scroll-area" style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: T.background,
      overflowX: "hidden" // Prevents horizontal scrolling
    }}>

      {/* Nav */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => activeTool ? setActiveTool(null) : setTab("home")}
          style={{ background: 'none', border: 'none', fontSize: 20, color: T.text, cursor: 'pointer' }}
        >
          ←
        </button>
        <span style={{ fontWeight: 500, color: T.text }}>{isHindi ? "सुकून" : "Sukoon"}</span>
      </div>

      {/* Outer shell */}
      <div className="fade-up" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 24px 60px",
        boxSizing: "border-box",
        width: "100%",
      }}>
        {activeTool ? (
          <div style={{ width: "100%", maxWidth: 450 }}>
            {renderTool()}
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 600 }}>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: T.text, fontWeight: 400, marginBottom: 8 }}>
                {isHindi ? "केंद्रित हों" : "Find your center."}
              </p>
              <p style={{ fontSize: 14, color: T.textSoft, margin: 0, lineHeight: 1.6 }}>
                {isHindi ? "आपके शरीर को अभी क्या चाहिए? एक उपकरण चुनें।" : "What does your nervous system need right now? Choose a tool."}
              </p>
            </div>

            <div style={{
              display: "grid",
              /* ─── THE MAGIC FIX: Auto-stacking grid ─── */
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 16,
              width: "100%",
              boxSizing: "border-box"
            }}>
              
              {/* THE DESCENT (PREMIUM SLEEP EXPERIENCE) */}
              <div
                onClick={() => setTab("descent")} 
                style={{
                  gridColumn: "1 / -1", // Always spans the full width
                  background: "linear-gradient(135deg, #111118 0%, #050508 100%)", 
                  border: "1px solid rgba(255, 120, 50, 0.15)",
                  borderRadius: 24,
                  padding: "20px",
                  cursor: "pointer",
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  boxShadow: "0 8px 30px rgba(255, 120, 50, 0.08)",
                  transition: "transform 0.2s ease",
                  boxSizing: "border-box"
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,180,100,0.8) 0%, rgba(255,100,50,0.2) 70%, transparent 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 15px rgba(255, 120, 50, 0.3)",
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: 22, opacity: 0.9 }}>👆</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: "rgba(255, 240, 220, 0.95)", margin: "0 0 4px", letterSpacing: "0.5px" }}>
                    {isHindi ? "गहराई (नींद के लिए)" : "The Descent (For Sleep)"}
                  </h4>
                  <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.4, fontStyle: "italic" }}>
                    {isHindi ? "एक शारीरिक एंकर। तब तक पकड़ें जब तक नींद न आ जाए।" : "A physical anchor. Hold until you sleep."}
                  </p>
                </div>
              </div>

              {/* NORMAL GAMES LIST */}
              {TOOLS.map(tool => (
                <div
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.borderWarm}`,
                    borderRadius: 20,
                    padding: 16,
                    cursor: "pointer",
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    transition: "all 0.2s ease",
                    boxShadow: `0 4px 12px ${T.accent}05`,
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: `${T.accent}12`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, flexShrink: 0
                  }}>
                    {tool.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>
                      {tool.title}
                    </h4>
                    <p style={{ fontSize: 12, color: T.textSoft, margin: 0, lineHeight: 1.4 }}>
                      {tool.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}