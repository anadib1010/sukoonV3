import React, { useState } from 'react';
import { PageNav } from '../../components/SharedUI';
import { useLS } from '../../hooks/useLS';
// ⚠️ Adjust this path to point exactly to your context file!
import { writeEmotionalCtx } from '../../utils/context'; 

export function Reflection({ setTab, T, lang }) {
  const [thought, setThought] = useState("");
  const [animating, setAnimating] = useState(null); 
  const [particles, setParticles] = useState([]);
  const [history, setHistory] = useLS("jsukoon_master_history", []);
  const [saveMsg, setSaveMsg] = useState("");
  
  const hi = lang === "Hindi";

  // ─── PARTICLE ENGINE & CONTEXT WRITER ───
  const triggerAnimation = (type) => {
    if (!thought.trim()) return;
    setAnimating(type);

    // 1. Write to your custom context file!
    writeEmotionalCtx(type, thought, { timestamp: Date.now() });

    // 2. Generate physics particles
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      delay: Math.random() * 0.2 + "s",
      duration: Math.random() * 1.5 + 1 + "s",
      size: Math.random() * 6 + 4 + "px",
      xDrift: (Math.random() - 0.5) * 100 + "px" 
    }));
    setParticles(newParticles);

    // 3. Clear UI after animation completes
    setTimeout(() => {
      setAnimating(null);
      setThought("");
      setParticles([]);
    }, 2500);
  };

  const handleSave = () => {
    if (!thought.trim()) return;
    const newRecord = {
      id: Date.now(),
      type: "Reflection",
      text: thought,
      date: new Date().toLocaleDateString(hi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setHistory([newRecord, ...history]);
    setSaveMsg(hi ? "इतिहास में सहेजा गया" : "Saved to history");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, color: T.text, position: "relative", overflow: "hidden" }}>
      
      {/* ─── INJECTED PHYSICS CSS ─── */}
      <style>{`
        @keyframes burnDrop {
          0% { transform: translate(0, 0) scale(1.5); opacity: 1; background: #ff4e00; border-radius: 50% 0 50% 50%; }
          50% { background: #ff9d00; border-radius: 50%; }
          100% { transform: translate(var(--xDrift), 250px) scale(0); opacity: 0; background: #333; }
        }
        @keyframes starRise {
          0% { transform: translate(0, 0) scale(1) rotate(45deg); opacity: 1; background: #fff; box-shadow: 0 0 10px #fff; }
          100% { transform: translate(var(--xDrift), -300px) scale(0.1) rotate(180deg); opacity: 0; background: #ffd700; box-shadow: 0 0 20px #ffd700; }
        }
        .text-dissolve { animation: dissolveOut 2s forwards; }
        @keyframes dissolveOut {
          0% { filter: blur(0px); opacity: 1; }
          50% { filter: blur(4px); opacity: 0.5; transform: scale(0.98); }
          100% { filter: blur(10px); opacity: 0; transform: scale(0.95); }
        }
      `}</style>

      <PageNav onBack={() => setTab("home")} onHome={() => setTab("home")} T={T} lang={lang} />
      
      <div style={{ flex: 1, padding: "30px", display: "flex", flexDirection: "column", position: "relative" }}>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 300, margin: "0 0 8px" }}>
            {hi ? "पवित्र स्थान" : "Sacred Space"}
          </h2>
          <p style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.6 }}>
            {hi ? "लिखें, सहेजें, या जाने दें" : "Record, Save, or Release"}
          </p>
        </div>

        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <textarea
            className={animating ? "text-dissolve" : ""}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            disabled={!!animating}
            placeholder={hi ? "अपने विचार या इच्छा यहाँ लिखें..." : "Record your thought or wish here..."}
            style={{ width: "100%", height: "250px", background: "transparent", border: "none", color: T.text, fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", textAlign: "center", outline: "none", resize: "none", lineHeight: "1.4" }}
          />

          {animating && particles.map(p => (
            <div key={p.id} style={{
              position: "absolute", top: animating === 'burn' ? "40%" : "60%", left: p.left, width: p.size, height: p.size,
              animationName: animating === 'burn' ? 'burnDrop' : 'starRise', animationDuration: p.duration, animationDelay: p.delay, animationFillMode: "forwards",
              animationTimingFunction: animating === 'burn' ? "cubic-bezier(0.4, 0, 1, 1)" : "ease-out", '--xDrift': p.xDrift 
            }} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => triggerAnimation('burn')} disabled={!thought.trim() || !!animating} style={{ flex: 1, padding: "18px", borderRadius: "16px", background: "rgba(255, 78, 0, 0.08)", border: "1px solid rgba(255, 78, 0, 0.3)", color: "#ff7333", cursor: "pointer", opacity: thought.trim() && !animating ? 1 : 0.4, transition: "all 0.3s" }}>
              <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>🔥</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600 }}>{hi ? "जलाएं" : "Burn"}</span>
            </button>
            <button onClick={() => triggerAnimation('wish')} disabled={!thought.trim() || !!animating} style={{ flex: 1, padding: "18px", borderRadius: "16px", background: `${T.accent}15`, border: `1px solid ${T.accent}50`, color: T.accent, cursor: "pointer", opacity: thought.trim() && !animating ? 1 : 0.4, transition: "all 0.3s" }}>
              <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>✨</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600 }}>{hi ? "शांत इच्छा" : "Quiet Wish"}</span>
            </button>
          </div>
          <button onClick={handleSave} disabled={!thought.trim() || !!animating} style={{ width: "100%", padding: "16px", borderRadius: "16px", background: "transparent", border: `1px solid ${T.borderWarm}`, color: T.textSoft, cursor: "pointer", opacity: thought.trim() && !animating ? 1 : 0.4, transition: "all 0.3s", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}>
            {saveMsg ? saveMsg : (hi ? "सहेजें" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}