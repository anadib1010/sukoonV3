import React, { useState, useEffect, useRef } from 'react';
import { creditSession } from '../../utils/activity';

export function StoneDrop({ T, lang }) {
  const canvasRef = useRef(null);
  const [thought, setThought] = useState("");
  const [dropping, setDropping] = useState(false);
  const [done, setDone] = useState(false);
  
  const animRef = useRef(null);
  const stoneY = useRef(0);
  const ripples = useRef([]);

  const drop = () => {
    if (!thought.trim()) return;
    setDropping(true); 
    stoneY.current = -20; // Start slightly above the screen
    ripples.current = [];
    if (navigator.vibrate) navigator.vibrate([20, 100, 40]);
  };

  useEffect(() => {
    if (!dropping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Set to absolute full screen dimensions
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height, cx = W / 2;
    
    // The water line is 30% down the screen
    const waterLine = H * 0.3; 
    let speed = 2; // Initial fall speed
    
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      
      // 1. Draw the Sky/Air (Background)
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, waterLine);

      // 2. Draw the Deep Water
      const waterGrad = ctx.createLinearGradient(0, waterLine, 0, H); 
      waterGrad.addColorStop(0, "rgba(30,50,80,0.8)"); // Surface
      waterGrad.addColorStop(1, "rgba(5,10,20,1)");    // Abyss
      ctx.fillStyle = waterGrad; 
      ctx.fillRect(0, waterLine, W, H - waterLine);
      
      // 3. Update & Draw Ripples at the waterline
      ripples.current = ripples.current.filter(r => r.opacity > 0);
      ripples.current.forEach(r => { 
        ctx.beginPath(); 
        ctx.ellipse(cx, waterLine, r.rx, r.ry, 0, 0, Math.PI * 2); 
        ctx.strokeStyle = `rgba(120,180,220,${r.opacity})`; 
        ctx.lineWidth = 1.5; 
        ctx.stroke(); 
        r.rx += 2; 
        r.ry += 0.5; 
        r.opacity -= 0.015; 
      });
      
      // 4. Stone Physics
      if (stoneY.current < waterLine) {
        // AIR PHASE: Accelerating freefall
        stoneY.current += speed; 
        speed += 0.5; // Gravity
        
        ctx.beginPath(); 
        ctx.ellipse(cx, stoneY.current, 16, 12, 0, 0, Math.PI * 2); 
        ctx.fillStyle = "rgba(100,100,120,0.9)"; 
        ctx.shadowBlur = 10; 
        ctx.shadowColor = "rgba(0,0,0,0.5)"; 
        ctx.fill(); 
        ctx.shadowBlur = 0;
        
        // Draw Thought Text
        ctx.font = "11px 'Cormorant Garamond', serif"; 
        ctx.fillStyle = "rgba(255,255,255,0.7)"; 
        ctx.textAlign = "center";
        const shortThought = thought.length > 15 ? thought.slice(0, 15) + "…" : thought;
        ctx.fillText(shortThought, cx, stoneY.current + 3);
        
      } else {
        // WATER PHASE: Sinking
        if (ripples.current.length === 0) { 
          // Hit the water! Spawn ripples and slow down instantly
          for (let i = 0; i < 5; i++) ripples.current.push({rx: 10 + i * 15, ry: 4 + i * 4, opacity: 0.8 - i * 0.15}); 
          if (navigator.vibrate) navigator.vibrate([40, 60, 40]); 
          speed = speed * 0.15; // Splashes and loses momentum
        }
        
        // Sinks slowly to the very bottom
        stoneY.current += speed;
        speed = Math.min(speed + 0.03, 1.5); // Terminal velocity in water
        
        // Calculate depth ratio (0 is surface, 1 is bottom of screen)
        const depth = Math.min((stoneY.current - waterLine) / (H - waterLine), 1);
        
        // Stone gets smaller and darker as it sinks
        const sizeX = 16 * (1 - depth * 0.4);
        const sizeY = 12 * (1 - depth * 0.4);
        const opacity = Math.max(0, 1 - depth * 1.2); 
        
        ctx.beginPath(); 
        ctx.ellipse(cx, stoneY.current, sizeX, sizeY, 0, 0, Math.PI * 2); 
        ctx.fillStyle = `rgba(60,60,80,${opacity})`; 
        ctx.fill();
        
        // When it reaches the bottom of the screen
        if (depth >= 1) { 
          cancelAnimationFrame(animRef.current); 
          setTimeout(() => { 
            setDropping(false); 
            setDone(true); 
            creditSession(2); 
          }, 1000); // 1 second pause in the dark before showing the success screen
          return; 
        }
      }
      
      animRef.current = requestAnimationFrame(render);
    };
    
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [dropping]);

  const reset = () => { setThought(""); setDone(false); setDropping(false); };

  // ─── THE "SUNK" SUCCESS SCREEN ───
  if (done) return (
    <div className="fade-in" style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "32px 20px", textAlign: "center" }}>
      <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>🌊</span>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.accentSoft, fontWeight: 400, marginBottom: 8 }}>
        {lang === "Hindi" ? "डूब गया।" : "It has sunk."}
      </h3>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 260, margin: "0 auto 24px" }}>
        {lang === "Hindi" ? "वह विचार अब गहरे पानी में है। यहाँ आने की ज़रूरत नहीं।" : "That thought is in deep water now. It does not need to surface."}
      </p>
      <button onClick={reset} style={{ background: `${T.accent}20`, border: `1px solid ${T.accent}40`, color: T.accent, fontSize: 13, padding: "10px 28px", borderRadius: 99, cursor: "pointer" }}>
        {lang === "Hindi" ? "एक और छोड़ें" : "Drop another"}
      </button>
    </div>
  );

  // ─── THE FULL SCREEN ANIMATION OVERLAY ───
  if (dropping) return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 9999, overflow: "hidden", backgroundColor: '#050508' }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );

  // ─── THE DEFAULT INPUT SCREEN ───
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "24px 20px" }}>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 16, color: T.textSoft, marginBottom: 20, lineHeight: 1.7, textAlign: "center" }}>
        {lang === "Hindi" ? "एक भारी विचार लिखें। उसे पत्थर बनने दें। उसे जाने दें।" : "Write a heavy thought. Let it become a stone. Let it go."}
      </p>
      <textarea 
        value={thought} 
        onChange={e => setThought(e.target.value)} 
        placeholder={lang === "Hindi" ? "यहाँ लिखें…" : "Write it here…"}
        style={{ width: "100%", minHeight: 90, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none", marginBottom: 16, boxSizing: "border-box" }} 
      />
      <button 
        onClick={drop} 
        disabled={!thought.trim()} 
        style={{ width: "100%", background: thought.trim() ? `${T.accent}22` : "transparent", border: `1px solid ${thought.trim() ? T.accent+"50" : T.border}`, color: thought.trim() ? T.accent : T.muted, fontSize: 14, fontWeight: 500, padding: "13px", borderRadius: 14, opacity: thought.trim() ? 1 : .5, cursor: thought.trim() ? "pointer" : "default" }}
      >
        {lang === "Hindi" ? "पानी में छोड़ें" : "Drop into the water"}
      </button>
    </div>
  );
}