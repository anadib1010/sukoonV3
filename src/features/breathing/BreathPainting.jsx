import React, { useState, useEffect, useRef } from 'react';
import { creditSession } from '../../utils/activity';

export function BreathPainting({ T, lang }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [going, setGoing] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [done, setDone] = useState(false);
  const animRef = useRef(null);
  const phaseRef = useRef("idle");
  const cycleRef = useRef(0);
  const hueRef = useRef(0);
  const fillRef = useRef(0);
  const TARGET_CYCLES = 5;

  const isHindi = lang === "Hindi";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const maxR = Math.min(canvas.width, canvas.height) * .42;
      
      if (phaseRef.current === "inhale") fillRef.current = Math.min(fillRef.current + .008, 1);
      else if (phaseRef.current === "exhale") {
        fillRef.current = Math.max(fillRef.current - .005, 0);
        if (fillRef.current === 0 && going) {
          cycleRef.current++; setCycles(cycleRef.current); hueRef.current = (hueRef.current + 40) % 360;
          if (cycleRef.current >= TARGET_CYCLES) { setDone(true); setGoing(false); phaseRef.current = "idle"; creditSession(3); return; }
          phaseRef.current = "inhale"; setPhase("inhale");
        }
      }
      
      const r = fillRef.current * maxR;
      if (r > 0) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const h = hueRef.current;
        grad.addColorStop(0, `hsla(${h},60%,75%,0.9)`); 
        grad.addColorStop(.5, `hsla(${h + 30}, 50%, 65%, 0.5)`); 
        grad.addColorStop(1, `hsla(${h + 60}, 40%, 55%, 0.1)`);
        
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); 
        ctx.fillStyle = grad; ctx.shadowBlur = 30; 
        ctx.shadowColor = `hsla(${h},60%,70%,0.4)`; ctx.fill(); 
        ctx.shadowBlur = 0;
        
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); 
        ctx.strokeStyle = `hsla(${h}, 50%, 70%, 0.3)`; 
        ctx.lineWidth = 1.5; ctx.stroke();
      }
      
      ctx.font = "300 11px 'DM Sans'"; ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.textAlign = "center";
      if (phaseRef.current === "inhale") ctx.fillText(isHindi ? "सांस लें" : "inhale", cx, cy + 4);
      else if (phaseRef.current === "exhale") ctx.fillText(isHindi ? "छोड़ें" : "exhale", cx, cy + 4);
      else if (!done) ctx.fillText(isHindi ? "शुरू करें" : "begin", cx, cy + 4);
      
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [going, lang]);

  const togglePhase = () => { 
    if (!going) return; 
    const next = phaseRef.current === "inhale" ? "exhale" : "inhale"; 
    phaseRef.current = next; setPhase(next); 
    if (navigator.vibrate) navigator.vibrate(20); 
  };

  const start = () => { 
    setGoing(true); setDone(false); setCycles(0); cycleRef.current = 0; 
    fillRef.current = 0; hueRef.current = 180; phaseRef.current = "inhale"; setPhase("inhale"); 
  };

  const reset = () => { 
    setGoing(false); setDone(false); setCycles(0); cycleRef.current = 0; 
    fillRef.current = 0; phaseRef.current = "idle"; setPhase("idle"); 
  };

  // Shared container style for perfect centering
  const containerStyle = {
    background: T.surface,
    border: `1px solid ${T.borderWarm}`,
    borderRadius: 20,
    padding: "24px 20px",
    maxWidth: "450px",
    margin: "0 auto",
    textAlign: "center",
    overflow: "hidden"
  };

  if (done) return (
    <div className="fade-in" style={containerStyle}>
      <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>🎨</span>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.accentSoft, fontWeight: 400, marginBottom: 8 }}>
        {isHindi ? "सुंदर।" : "Beautiful."}
      </h3>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 24 }}>
        {isHindi ? "आपकी सांस ने एक पेंटिंग बनाई। यह आप ही थे।" : "Your breath painted this. That was you."}
      </p>
      <button onClick={reset} style={{ background: `${T.accent}20`, border: `1px solid ${T.accent}40`, color: T.accent, fontSize: 13, padding: "10px 28px", borderRadius: 99 }}>
        {isHindi ? "फिर से करें" : "Begin again"}
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Instruction Box */}
      {!going && (
        <div style={{ background: `${T.accent}05`, padding: 16, borderRadius: 16, marginBottom: 20, border: `1px dashed ${T.accent}30`, textAlign: 'left' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.accent, marginBottom: 4 }}>
            {isHindi ? "निर्देश:" : "Instructions:"}
          </p>
          <p style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.5, margin: 0 }}>
            {isHindi 
              ? "सांस लेते समय बटन दबाएं। जब आप सांस छोड़ना चाहें, तो स्क्रीन पर कहीं भी टैप करें। अपनी सांस से रंगों को उभरते हुए देखें।" 
              : "Press begin to start. Tap anywhere on the canvas to switch between inhaling and exhaling. Watch your breath create art."}
          </p>
        </div>
      )}

      <div style={{ position: "relative", height: 260, borderRadius: 16, overflow: 'hidden' }} onClick={togglePhase}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, cursor: going ? 'pointer' : 'default' }} />
        
        {!going && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <button onClick={e => { e.stopPropagation(); start(); }} style={{ background: `${T.accent}22`, border: `1px solid ${T.accent}55`, color: T.accent, fontSize: 14, fontWeight: 500, padding: "12px 32px", borderRadius: 99, pointerEvents: "all" }}>
              {isHindi ? "शुरू करें" : "Begin"}
            </button>
          </div>
        )}
      </div>

      {going && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                {isHindi ? `${cycles} / ${TARGET_CYCLES} सांस` : `${cycles} of ${TARGET_CYCLES} breaths`}
              </p>
              <p style={{ fontSize: 12, color: T.accent, margin: 0, fontWeight: 500 }}>
                {phase === "inhale" 
                  ? (isHindi ? "सांस भरें" : "Inhaling...") 
                  : (isHindi ? "सांस छोड़ें" : "Exhaling...")}
              </p>
           </div>
           <p style={{ fontSize: 11, color: T.muted, fontStyle: "italic", margin: 0 }}>
              {isHindi ? "टैप करें बदलने के लिए" : "Tap the canvas to switch"}
           </p>
        </div>
      )}
    </div>
  );
}