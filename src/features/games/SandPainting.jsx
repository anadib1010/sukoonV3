import React, { useState, useEffect, useRef } from 'react';

export function SandPainting({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  const [phase, setPhase] = useState('draw');
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);

  const startDrawing = (e) => { if (phase !== 'draw') return; isDrawing.current = true; if (!hasDrawn) setHasDrawn(true); dropSand(e); };
  const stopDrawing = () => { isDrawing.current = false; };
  const draw = (e) => { if (!isDrawing.current || phase !== 'draw') return; dropSand(e); };

  const dropSand = (e) => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const clientX = e.touches?.[0]?.clientX ?? e.clientX, clientY = e.touches?.[0]?.clientY ?? e.clientY;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    const colors = ['#d4af37', '#e6c27a', '#c5a059'];
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath(); ctx.arc(x + (Math.random() - 0.5) * 16, y + (Math.random() - 0.5) * 16, Math.random() * 1.5 + 0.5, 0, Math.PI * 2); ctx.fill();
    }
  };

  const releaseToTheWind = () => {
    if (phase !== 'draw') return; setPhase('wind');
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas; const imageData = ctx.getImageData(0, 0, width, height); const data = imageData.data;
    const newParticles = [];
    for (let y = 0; y < height; y += 3) for (let x = 0; x < width; x += 3) if (data[(y * width + x) * 4 + 3] > 50) newParticles.push({ x, y, vx: Math.random() * 4 + 2, vy: (Math.random() - 0.5) * 2, size: Math.random() * 1.5 + 0.5, alpha: 1, decay: Math.random() * 0.01 + 0.005 });
    particlesRef.current = newParticles; ctx.clearRect(0, 0, width, height);
    const animateWind = () => {
      const c = canvasRef.current; if (!c) return; const cx = c.getContext('2d'); cx.clearRect(0, 0, c.width, c.height); let active = 0;
      particlesRef.current.forEach(p => { if (p.alpha <= 0) return; active++; p.x += p.vx; p.y += p.vy; p.alpha -= p.decay; p.vy += (Math.random() - 0.5) * 0.2; cx.beginPath(); cx.arc(p.x, p.y, p.size, 0, Math.PI * 2); cx.fillStyle = `rgba(212,175,55,${p.alpha})`; cx.fill(); });
      if (active > 0) animationRef.current = requestAnimationFrame(animateWind); else setPhase('empty');
    };
    animateWind();
  };

  const s = {
    page:      { height: "100%", width: "100%", backgroundColor: "#000", position: "relative", overflow: "hidden", touchAction: "none" },
    canvas:    (ph) => ({ position: "absolute", top: 0, left: 0, zIndex: 10, cursor: "crosshair", pointerEvents: ph === "draw" ? "auto" : "none" }),
    backWrap:  { position: "absolute", top: 20, left: 20, zIndex: 30 },
    backBtn:   { background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 },
    instr:     (drawn) => ({ position: "absolute", top: 80, left: 0, width: "100%", textAlign: "center", zIndex: 5, opacity: drawn ? 0 : 1, transition: "opacity 2s ease", pointerEvents: "none" }),
    instrTitle:{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#fff", fontWeight: 300, margin: "0 0 10px" },
    instrSub:  { color: "rgba(255,255,255,0.4)", fontSize: 16, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" },
    windWrap:  { position: "absolute", bottom: 40, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 20, animation: "fadeIn 2s ease" },
    windBtn:   { background: "rgba(0,0,0,0.5)", border: "1px solid rgba(212,175,55,0.5)", color: "#d4af37", padding: "12px 40px", borderRadius: 30, fontSize: 16, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", letterSpacing: 2, backdropFilter: "blur(4px)" },
    emptyWrap: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, animation: "fadeIn 3s ease" },
    emptyText: { color: "#d4af37", fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", letterSpacing: 1 },
    againBtn:  { marginTop: 30, background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 2, fontSize: 14 },
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerOut={stopDrawing} style={s.canvas(phase)} />
      <div style={s.backWrap}><button onClick={() => setTab(null)} style={s.backBtn}>← {isHindi ? "वापस" : "Back"}</button></div>
      {phase === 'draw' && <div style={s.instr(hasDrawn)}><h2 style={s.instrTitle}>{isHindi ? "रेत की चित्रकारी" : "Sand Painting"}</h2><p style={s.instrSub}>{isHindi ? "कुछ सुंदर बनाएं..." : "Create something beautiful..."}</p></div>}
      {phase === 'draw' && hasDrawn && <div style={s.windWrap}><button onClick={releaseToTheWind} style={s.windBtn}>{isHindi ? "हवा को बहने दें" : "Let the Wind Blow!"}</button></div>}
      {phase === 'empty' && <div style={s.emptyWrap}><p style={s.emptyText}>{isHindi ? "कुछ भी हमेशा के लिए नहीं रहता।" : "Nothing lasts forever."}</p><button onClick={() => { particlesRef.current = []; setPhase('draw'); setHasDrawn(false); }} style={s.againBtn}>{isHindi ? "पुनः आरंभ करें" : "Begin Again"}</button></div>}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
