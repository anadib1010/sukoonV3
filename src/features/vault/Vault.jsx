import React, { useState, useEffect, useRef } from 'react';
import { StoneDrop }        from '../games/StoneDrop';
import { BilateralTapping } from '../games/BilateralTapping';
import { UnsentLetter }     from '../games/UnsentLetter';
import { NadiShodhana }     from '../breathing/NadiShodhana';

// ─── AMBIENT PARTICLE CANVAS ──────────────────────────────────────────
function MysticParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const colors = ["#ff4d00", "#cc1100", "#ffdb58", "#ffffff"];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseAlpha = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.vx += (Math.random() - 0.5) * 0.02;
        this.vy += (Math.random() - 0.5) * 0.02;
        this.vx *= 0.99; this.vy *= 0.99;
        this.x += this.vx; this.y += this.vy;
        if (this.x < -10) this.x = canvas.width + 10;
        else if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        else if (this.y > canvas.height + 10) this.y = -10;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.baseAlpha;
        const og = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 5);
        og.addColorStop(0, this.color);
        og.addColorStop(1, "transparent");
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 45 }, () => new Particle());
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ─── GLASS BUTTON ─────────────────────────────────────────────────────
const GlassButton = ({ emoji, label, onClick, isVisible }) => {
  const s = {
    btn: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "12px 18px",
      marginBottom: 10,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      cursor: isVisible ? "pointer" : "default",
      textAlign: "left",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      position: "relative",
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(15px)",
      transition: "opacity 0.8s ease, transform 0.8s ease, background 0.3s ease",
    },
    iconBox: {
      width: 40, height: 40,
      borderRadius: 12,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
    },
    label: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 18, fontWeight: 400,
      color: "#ffffff", margin: 0,
      letterSpacing: 0.5,
      flex: 1,
    },
    arrow: { fontSize: 14, color: "rgba(255,255,255,0.2)" },
  };

  return (
    <button
      onClick={onClick}
      style={s.btn}
      onMouseEnter={e => { if (isVisible) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
      onTouchStart={e => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.transition = "transform 0.1s ease"; }}
      onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.transition = "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"; }}
    >
      <div style={s.iconBox}>{emoji}</div>
      <p style={s.label}>{label}</p>
      <span style={s.arrow}>→</span>
    </button>
  );
};

// ─── DATA ─────────────────────────────────────────────────────────────
const VAULT_TOOLS = [
  { id: "reflection", en: "Write it. Then release it.",             hi: "लिखें। फिर जाने दें।",                tab: "reflection", emoji: "🪞" },
  { id: "descent",    en: "Let go of the day completely.",          hi: "दिन को पूरी तरह छोड़ दें।",           tab: "descent",    emoji: "🍂" },
  { id: "bilateral",  en: "When the body needs to help the mind.",hi: "जब मन अकेला काफ़ी नहीं होता।",         tab: null,         emoji: "⚖️" },
  { id: "nadi",       en: "Balance what words cannot reach.",       hi: "जहाँ शब्द नहीं पहुँचते, वहाँ जाएं।",  tab: null,         emoji: "🌬️" },
  { id: "letter",     en: "The words you never sent.",              hi: "वो शब्द जो भेजे न गए।",            tab: null,         emoji: "✉️" },
  { id: "stone",      en: "Drop the weight. Walk lighter.",                hi: "बोझ छोड़ें। हल्के चलें।",             tab: null,         emoji: "🪨" },
];

const RETURN_GREETINGS = [
  null, null,
  { en: "You came back. That means something.",       hi: "आप फिर आए — इसका मतलब है।"               },
  { en: "This is becoming a practice.",               hi: "यह अब एक अभ्यास बन रहा है।"              },
  { en: "The ones who return here are rare.",         hi: "यहाँ लौटने वाले कम होते हैं।"             },
  { en: "You keep showing up. That is everything.",  hi: "आप बार-बार आते हैं — यही सब कुछ है।"     },
];
const REGULAR_RETURN = { en: "Welcome back to the quieter place.", hi: "अंतर्मन में फिर से स्वागत है।" };
const LS_KEY = "jsukoon_vault_visits";

// ─── VAULT ────────────────────────────────────────────────────────────
export function Vault({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [activeTool, setActiveTool] = useState(null);
  const [visits,     setVisits]     = useState(0);
  const [revealed,   setRevealed]   = useState([]);
  const [showGreet,  setShowGreet]  = useState(true);

  useEffect(() => {
    const prev = parseInt(localStorage.getItem(LS_KEY) || "0", 10);
    const next = prev + 1;
    localStorage.setItem(LS_KEY, String(next));
    setVisits(next);

    if (next === 1) {
      VAULT_TOOLS.forEach((_, i) => {
        setTimeout(() => setRevealed(r => [...r, i]), 600 + i * 350);
      });
    } else {
      setRevealed(VAULT_TOOLS.map((_, i) => i));
    }

    const t = setTimeout(() => setShowGreet(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const greeting = visits === 1
    ? { en: "You found this place. Not everyone does.\nThis is for the ones who look deeper.",
        hi: "आप यहाँ तक आए — यह सब नहीं कर पाते।\nयह जगह उनके लिए है जो और गहरे जाना चाहते हैं।" }
    : visits <= 5 ? RETURN_GREETINGS[visits] : REGULAR_RETURN;

  // ─── STYLES ───
  const s = {
    toolPage: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      overflow: "hidden",
    },

    toolNav: {
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    toolNavBtn: {
      background: "none", border: "none",
      fontSize: 20, color: T.text,
      cursor: "pointer", transition: "opacity 0.2s",
    },

    toolScroll: {
      flex: 1, overflowY: "auto",
      padding: "0 24px 40px",
    },

    // Main vault page
    page: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "radial-gradient(circle at center 30%, #2a0a00 0%, #050201 100%)",
      overflow: "hidden",
      position: "relative",
    },

    nav: {
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      zIndex: 2,
      position: "relative",
    },

    backBtn: {
      background: "none", border: "none",
      fontSize: 20, color: "#fff",
      cursor: "pointer", opacity: 0.6,
      transition: "opacity 0.2s",
    },

    scrollArea: {
      flex: 1, overflowY: "auto",
      padding: "0 24px 40px",
      display: "flex", flexDirection: "column",
      zIndex: 2, position: "relative",
    },

    titleWrap: { textAlign: "center", marginBottom: 4, marginTop: 4 },

    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(20px, 6vw, 26px)",
      textTransform: "uppercase",
      letterSpacing: 4,
      fontWeight: 400,
      color: "#ffffff",
      margin: "0 0 4px",
      lineHeight: 1.2,
    },

    subtitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 16, color: "rgba(255,255,255,0.6)",
      margin: 0, letterSpacing: 2,
    },

    divider: {
      width: 28, height: 1,
      background: "#ff7e00",
      margin: "12px auto 16px",
      opacity: 0.5,
    },

    greeting: (show) => ({
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
      fontSize: 15,
      color: "rgba(255,255,255,0.7)",
      textAlign: "center",
      lineHeight: 1.6,
      marginBottom: 20,
      whiteSpace: "pre-line",
      opacity: show ? 1 : 0,
      transition: "opacity 1.5s ease",
      minHeight: 48,
    }),

    toolList: { display: "flex", flexDirection: "column", gap: 0 },

    descendWrap: { marginTop: 24, textAlign: "center", paddingBottom: 20 },

    descendBtn: {
      background: "none", border: "none",
      color: "rgba(255,255,255,0.4)",
      fontSize: 11, letterSpacing: 4,
      textTransform: "uppercase",
      cursor: "pointer", padding: 16,
      transition: "color 0.3s ease",
      fontFamily: "'Cormorant Garamond', serif",
    },
  };

  // ── Active tool view ──
  if (activeTool) {
    return (
      <div style={s.toolPage}>
        <div style={s.toolNav}>
          <button
            onClick={() => setActiveTool(null)}
            style={s.toolNavBtn}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
          >←</button>
          <button
            onClick={() => setTab("home")}
            style={{ ...s.toolNavBtn, opacity: 0.6 }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
          >🏠</button>
        </div>
        <div style={s.toolScroll}>
          {activeTool === "bilateral" && <BilateralTapping T={T} lang={lang} />}
          {activeTool === "nadi"      && <NadiShodhana     T={T} lang={lang} />}
          {activeTool === "letter"    && <UnsentLetter      T={T} lang={lang} />}
          {activeTool === "stone"     && <StoneDrop         T={T} lang={lang} />}
        </div>
      </div>
    );
  }

  // ── Main vault view ──
  return (
    <div style={s.page}>
      <MysticParticleCanvas />

      <div style={s.nav}>
        <button
          onClick={() => setTab("more")}
          style={s.backBtn}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
        >←</button>
      </div>

      <div style={s.scrollArea}>

        <div style={s.titleWrap}>
          <h1 style={s.title}>THE QUIETER PLACE</h1>
          <p style={s.subtitle}>अंतर्मन</p>
        </div>

        <div style={s.divider} />

        {greeting && (
          <p style={s.greeting(showGreet)}>
            {hi ? greeting.hi : greeting.en}
          </p>
        )}

        <div style={s.toolList}>
          {VAULT_TOOLS.map((tool, i) => {
            const isVisible = revealed.includes(i);
            return (
              <GlassButton
                key={tool.id}
                emoji={tool.emoji}
                label={hi ? tool.hi : tool.en}
                isVisible={isVisible}
                onClick={() => {
                  if (!isVisible) return;
                  if (tool.tab) setTab(tool.tab);
                  else setActiveTool(tool.id);
                }}
              />
            );
          })}
        </div>

        <div style={s.descendWrap}>
          <button
            onClick={() => setTab("resonance")}
            style={s.descendBtn}
            onMouseEnter={e => e.currentTarget.style.color = "#ffdb58"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            {hi ? "गहरा उतरें" : "Descend Further"}
          </button>
        </div>

      </div>
    </div>
  );
}
