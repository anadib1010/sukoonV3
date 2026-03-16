import React, { useState, useEffect, useRef } from 'react';
import { StoneDrop }        from '../games/StoneDrop';
import { BilateralTapping } from '../games/BilateralTapping';
import { UnsentLetter }     from '../games/UnsentLetter';
import { NadiShodhana }     from '../breathing/NadiShodhana';

// ─── AMBIENT BACKGROUND CANVAS (Red/Amber Hue) ───
function MysticParticleCanvas() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth; 
      canvas.height = window.innerHeight; 
    };
    window.addEventListener("resize", resize); resize();
    
    // Mystic Vault Colors: Deep Red, Amber, Soft Gold
    const colors = ["#ff4d00", "#cc1100", "#ffdb58", "#ffffff"]; 
    
    class Particle {
      constructor() { 
        this.x = Math.random() * canvas.width; 
        this.y = Math.random() * canvas.height; 
        this.vx = (Math.random() - 0.5) * 0.3; // Very slow, floaty movement
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5; 
        this.color = colors[Math.floor(Math.random() * colors.length)]; 
        this.baseAlpha = Math.random() * 0.4 + 0.1; 
      }
      
      update() { 
        this.vx += (Math.random() - 0.5) * 0.02;
        this.vy += (Math.random() - 0.5) * 0.02;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.x += this.vx; 
        this.y += this.vy;
        
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
    
    const particles = []; 
    for (let i = 0; i < 45; i++) particles.push(new Particle());
    
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

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

// ─── GLASSMORPHISM BUTTON ───
const GlassButton = ({ emoji, label, onClick, isVisible }) => (
  <button 
    onClick={onClick}
    style={{ 
      width: "100%", 
      display: 'flex', 
      alignItems: 'center', 
      gap: '18px',
      padding: '20px 24px',
      marginBottom: '16px',
      background: 'rgba(255, 255, 255, 0.04)', 
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)', 
      borderRadius: '24px',
      cursor: isVisible ? 'pointer' : 'default',
      textAlign: 'left',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      position: 'relative',
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(15px)",
      transition: "opacity 0.8s ease, transform 0.8s ease, background 0.3s ease",
    }}
  >
    <div style={{ 
      width: '50px', height: '50px', borderRadius: '16px', 
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
    }}>
      {emoji}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '400', color: '#ffffff', margin: '0', letterSpacing: '0.5px' }}>
        {label}
      </p>
    </div>
    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.2)' }}>→</span>
  </button>
);

// ── The 6 Vault tools ──────────
const VAULT_TOOLS = [
  { id: "reflection", en: "Write it. Then release it.", hi: "लिखें। फिर जाने दें।", tab: "reflection", emoji: "🪞" },
  { id: "descent", en: "Let go of the day completely.", hi: "दिन को पूरी तरह छोड़ दें।", tab: "descent", emoji: "🍂" },
  { id: "bilateral", en: "For what the mind cannot release alone.", hi: "जो मन अकेले नहीं छोड़ पाता।", tab: null, emoji: "⚖️" },
  { id: "nadi", en: "Balance what words cannot reach.", hi: "जहाँ शब्द नहीं पहुँचते, वहाँ जाएं।", tab: null, emoji: "🌬️" },
  { id: "letter", en: "Say what you never could.", hi: "वो कहें जो कभी कह न सके।", tab: null, emoji: "✉️" },
  { id: "stone", en: "Let it sink. Let it go.", hi: "डूब जाने दें। जाने दें।", tab: null, emoji: "🪨" },
];

// ── Return visit greetings ───────────────────────────────────────────
const RETURN_GREETINGS = [
  null,
  null, 
  { en: "You came back. That means something.",        hi: "आप फिर आए — इसका मतलब है।"                },
  { en: "This is becoming a practice.",                hi: "यह अब एक अभ्यास बन रहा है।"               },
  { en: "The ones who return here are rare.",          hi: "यहाँ लौटने वाले कम होते हैं।"              },
  { en: "You keep showing up. That is everything.",   hi: "आप बार-बार आते हैं — यही सब कुछ है।"      },
];
const REGULAR_RETURN = { en: "Welcome back to the quieter place.", hi: "अंतर्मन में फिर से स्वागत है।" };
const LS_KEY = "jsukoon_vault_visits";

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

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      // Deep mystic amber-black gradient background
      background: "radial-gradient(circle at center 30%, #2a0a00 0%, #050201 100%)",
      overflow: "hidden", position: "relative"
    }}>
      
      {/* Floating Particles Background */}
      <MysticParticleCanvas />

      {/* Nav */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, zIndex: 2, position: 'relative' }}>
        <button onClick={() => setTab("more")} style={{ background: "none", border: "none", fontSize: 20, color: "#fff", cursor: "pointer", opacity: 0.6 }}>←</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 60px", display: "flex", flexDirection: "column", zIndex: 2, position: 'relative' }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 8, marginTop: 8 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 10vw, 52px)", fontWeight: 300, color: "#ffffff", margin: "0 0 4px", letterSpacing: 2, lineHeight: 1 }}>
            The quieter place
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(18px, 5vw, 22px)", color: "rgba(255,255,255,0.6)", margin: 0, letterSpacing: 1 }}>
            अंतर्मन
          </p>
        </div>

        <div style={{ width: 28, height: 1, background: "#ff7e00", margin: "20px auto 32px", opacity: 0.5 }} />

        {/* Greeting */}
        {greeting && (
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(15px, 4vw, 18px)", color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.75, marginBottom: 36, whiteSpace: "pre-line", opacity: showGreet ? 1 : 0, transition: "opacity 1.5s ease", minHeight: 60 }}>
            {hi ? greeting.hi : greeting.en}
          </p>
        )}

        {/* Glassmorphism Tools */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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

        {/* The Door to Resonance */}
        <div style={{ marginTop: "40px", textAlign: "center", paddingBottom: "30px" }}>
          <button 
            onClick={() => setTab("resonance")}
            style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.5)", 
              fontSize: 12, letterSpacing: "4px", textTransform: "uppercase", 
              cursor: "pointer", padding: "20px", transition: "color 0.3s ease"
            }}
            onMouseOver={(e) => e.target.style.color = "#ffdb58"}
            onMouseOut={(e) => e.target.style.color = "rgba(255,255,255,0.5)"}
          >
            {hi ? "गहरा उतरें" : "Descend Further"}
          </button>
        </div>

      </div>
    </div>
  );
}