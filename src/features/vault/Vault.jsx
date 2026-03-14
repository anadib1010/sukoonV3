import React, { useState, useEffect } from 'react';
import { StoneDrop }        from '../games/StoneDrop';
import { BilateralTapping } from '../games/BilateralTapping';
import { UnsentLetter }     from '../games/UnsentLetter';
import { NadiShodhana }     from '../breathing/NadiShodhana';

// ── The 6 Vault tools — removed from Focus, live only here ──────────

const VAULT_TOOLS = [
  {
    id:         "reflection",
    en:         "Write it. Then release it.",
    hi:         "लिखें। फिर जाने दें।",
    tab:        "reflection",
  },
  { id:"descent", en:"Let go of the day completely.", hi:"दिन को पूरी तरह छोड़ दें।", tab:"descent" },
  {
    id:         "bilateral",
    en:         "For what the mind cannot release alone.",
    hi:         "जो मन अकेले नहीं छोड़ पाता।",
    tab:        null, // rendered inline
  },
  {
    id:         "nadi",
    en:         "Balance what words cannot reach.",
    hi:         "जहाँ शब्द नहीं पहुँचते, वहाँ जाएं।",
    tab:        null,
  },
  {
    id:         "letter",
    en:         "Say what you never could.",
    hi:         "वो कहें जो कभी कह न सके।",
    tab:        null,
  },
  {
    id:         "stone",
    en:         "Let it sink. Let it go.",
    hi:         "डूब जाने दें। जाने दें।",
    tab:        null,
  },
];

// ── Return visit greetings ───────────────────────────────────────────
const RETURN_GREETINGS = [
  null, // 0 — unused
  null, // 1 — first visit, handled separately
  { en: "You came back. That means something.",        hi: "आप फिर आए — इसका मतलब है।"                },
  { en: "This is becoming a practice.",                hi: "यह अब एक अभ्यास बन रहा है।"               },
  { en: "The ones who return here are rare.",          hi: "यहाँ लौटने वाले कम होते हैं।"              },
  { en: "You keep showing up. That is everything.",   hi: "आप बार-बार आते हैं — यही सब कुछ है।"      },
];
const REGULAR_RETURN = {
  en: "Welcome back to the quieter place.",
  hi: "अंतर्मन में फिर से स्वागत है।",
};

const LS_KEY = "jsukoon_vault_visits";

export function Vault({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [activeTool, setActiveTool] = useState(null);
  const [visits,     setVisits]     = useState(0);
  const [revealed,   setRevealed]   = useState([]);
  const [showGreet,  setShowGreet]  = useState(true);

  // ── Count this visit ─────────────────────────────────────────────
  useEffect(() => {
    const prev = parseInt(localStorage.getItem(LS_KEY) || "0", 10);
    const next = prev + 1;
    localStorage.setItem(LS_KEY, String(next));
    setVisits(next);

    if (next === 1) {
      // First visit — stagger tools one by one after a short delay
      VAULT_TOOLS.forEach((_, i) => {
        setTimeout(() => {
          setRevealed(r => [...r, i]);
        }, 600 + i * 350);
      });
    } else {
      // Return visit — show all immediately
      setRevealed(VAULT_TOOLS.map((_, i) => i));
    }

    // Greeting fades after 4 seconds
    const t = setTimeout(() => setShowGreet(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // ── Greeting text ────────────────────────────────────────────────
  const greeting = visits === 1
    ? { en: "You found this place. Not everyone does.\nThis is for the ones who look deeper.",
        hi: "आप यहाँ तक आए — यह सब नहीं कर पाते।\nयह जगह उनके लिए है जो और गहरे जाना चाहते हैं।" }
    : visits <= 5
      ? RETURN_GREETINGS[visits]
      : REGULAR_RETURN;

  // ── If a tool is active inline ───────────────────────────────────
  if (activeTool) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
      <div style={{ padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => setActiveTool(null)} style={{ background:"none", border:"none", fontSize:20, color:T.text, cursor:"pointer" }}>←</button>
        <button onClick={() => setTab("home")} style={{ background:"none", border:"none", fontSize:20, color:T.text, cursor:"pointer", opacity:0.6 }}>🏠</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 24px 40px" }}>
        {activeTool==="bilateral" && <BilateralTapping T={T} lang={lang} />}
        {activeTool==="nadi"      && <NadiShodhana     T={T} lang={lang} />}
        {activeTool==="letter"    && <UnsentLetter      T={T} lang={lang} />}
        {activeTool==="stone"     && <StoneDrop         T={T} lang={lang} />}
      </div>
    </div>
  );
}

  // ── Main Vault screen ────────────────────────────────────────────
  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      overflow: "hidden",
    }}>

      {/* Nav — minimal, no title */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setTab("more")} style={{ background: "none", border: "none", fontSize: 20, color: T.text, cursor: "pointer", opacity: 0.6 }}>←</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 60px", display: "flex", flexDirection: "column" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 8, marginTop: 8 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(36px, 10vw, 52px)",
            fontWeight: 300,
            color: T.text,
            margin: "0 0 4px",
            letterSpacing: 2,
            lineHeight: 1,
          }}>
            The quieter place
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(18px, 5vw, 22px)",
            color: T.textSoft,
            margin: 0,
            opacity: 0.55,
            letterSpacing: 1,
          }}>
            अंतर्मन
          </p>
        </div>

        {/* Thin rule */}
        <div style={{ width: 28, height: 1, background: T.accent, margin: "20px auto 32px", opacity: 0.3 }} />

        {/* Greeting */}
        {greeting && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(15px, 4vw, 18px)",
            color: T.textSoft,
            textAlign: "center",
            lineHeight: 1.75,
            marginBottom: 36,
            whiteSpace: "pre-line",
            opacity: showGreet ? 0.85 : 0,
            transition: "opacity 1.2s ease",
            minHeight: 60,
          }}>
            {hi ? greeting.hi : greeting.en}
          </p>
        )}

        {/* Tools — staggered reveal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {VAULT_TOOLS.map((tool, i) => {
            const isVisible = revealed.includes(i);
            return (
              <div
                key={tool.id}
                onClick={() => {
                  if (!isVisible) return;
                  if (tool.tab) setTab(tool.tab);
                  else setActiveTool(tool.id);
                }}
                style={{
                  padding: "22px 0",
                  borderBottom: `1px solid ${T.border || "rgba(255,255,255,0.07)"}`,
                  cursor: isVisible ? "pointer" : "default",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                }}
              >
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(18px, 5vw, 22px)",
                  fontWeight: 300,
                  color: T.text,
                  margin: "0 0 4px",
                  lineHeight: 1.3,
                }}>
                  {hi ? tool.hi : tool.en}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
{/* ─── THE DOOR TO LAYER 4 ─── */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button 
          onClick={() => setTab("resonance")}
          style={{
            background: "none", 
            border: "none", 
            color: "rgba(255,255,255,0.2)", // Very faint text
            fontSize: 12, 
            letterSpacing: "4px", 
            textTransform: "uppercase", 
            cursor: "pointer",
            padding: "20px"
          }}
        >
          {isHindi ? "गहरा उतरें" : "Descend Further"}
        </button>
        {/* ─── THE DOOR TO LAYER 4 ─── */}
      <div style={{ marginTop: "40px", textAlign: "center", paddingBottom: "30px" }}>
        <button 
          onClick={() => setTab("resonance")}
          style={{
            background: "none", 
            border: "none", 
            color: "rgba(255,255,255,0.15)", // Very faint, almost invisible
            fontSize: 12, 
            letterSpacing: "4px", 
            textTransform: "uppercase", 
            cursor: "pointer",
            padding: "20px"
          }}
        >
          {lang === "Hindi" ? "गहरा उतरें" : "Descend Further"}
        </button>
      </div>
      