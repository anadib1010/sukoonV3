import React, { useState, useEffect, useRef } from 'react';

export function ShatteredThoughts({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [phase, setPhase] = useState('compose');
  const [text, setText] = useState("");
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => { return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }; }, []);

  const handleShatter = () => {
    if (!text.trim() || phase !== 'compose') return;
    setPhase('shattering');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = window.innerWidth, height = window.innerHeight;
    canvas.width = width; canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff'; ctx.font = "40px 'Cormorant Garamond', serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newParticles = [];
    for (let y = 0; y < height; y += 3) {
      for (let x = 0; x < width; x += 3) {
        if (data[(y * width + x) * 4 + 3] > 128) {
          const dx = x - width / 2, dy = y - height / 2;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          newParticles.push({ x, y, vx: (dx / distance) * (Math.random() * 3) + (Math.random() - 0.5) * 2, vy: (dy / distance) * (Math.random() * 3) + (Math.random() - 0.5) * 2 - 1, size: Math.random() * 1.5 + 0.5, alpha: 1, decay: Math.random() * 0.015 + 0.005 });
        }
      }
    }
    particlesRef.current = newParticles;
    ctx.clearRect(0, 0, width, height);
    const animate = () => {
      const c = canvasRef.current; if (!c) return;
      const cx = c.getContext('2d'); cx.clearRect(0, 0, c.width, c.height);
      let active = 0;
      particlesRef.current.forEach(p => {
        if (p.alpha <= 0) return; active++;
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
        cx.beginPath(); cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`; cx.shadowBlur = 8; cx.shadowColor = `rgba(212, 175, 55, ${p.alpha})`; cx.fill();
      });
      if (active > 0) animationRef.current = requestAnimationFrame(animate);
      else setPhase('resolved');
    };
    animate();
  };

  const resetFlow = () => {
    setPhase('compose'); setText("");
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const s = {
    page:        { height: "100%", width: "100%", backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
    canvas:      { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 },
    backWrap:    { position: "absolute", top: 20, left: 20, zIndex: 20 },
    backBtn:     { background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 },
    composeWrap: { textAlign: "center", width: "80%", maxWidth: 400, zIndex: 20 },
    preamble:    { color: "rgba(255,255,255,0.6)", marginBottom: 40, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 },
    input:       { background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 28, textAlign: "center", width: "100%", outline: "none", fontFamily: "'Cormorant Garamond', serif", paddingBottom: 10 },
    confrontBtn: (active) => ({ marginTop: 60, background: "none", border: active ? "1px solid rgba(212,175,55,0.5)" : "1px solid rgba(255,255,255,0.1)", color: active ? "#d4af37" : "rgba(255,255,255,0.2)", padding: "12px 40px", borderRadius: 30, cursor: active ? "pointer" : "default", fontSize: 14, letterSpacing: 2, transition: "all 0.3s ease" }),
    resolvedWrap:{ width: "100%", height: "100%", display: "flex", zIndex: 20, flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    resolvedText:{ color: "#d4af37", fontSize: 22, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", letterSpacing: 1, textAlign: "center" },
    resolvedSub:   { color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 20, letterSpacing: 1, textAlign: "center" },
    resolvedInner: { textAlign: "center", animation: "fadeIn 3s ease" },
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />
      <div style={s.backWrap}><button onClick={() => setTab('stillness')} style={s.backBtn}>← {hi ? "वापस" : "Back"}</button></div>
      {phase === 'compose' && (
        <div style={s.composeWrap}>
          <p style={s.preamble}>{hi ? "उस विचार को लिखें जो आपको बांधता है..." : "Type the thought that binds you..."}</p>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="..." style={s.input} />
          <button onClick={handleShatter} disabled={!text.trim()} style={s.confrontBtn(!!text.trim())}>{hi ? "सामना करें" : "CONFRONT"}</button>
        </div>
      )}
      {phase === 'resolved' && (
        <div onClick={resetFlow} style={s.resolvedWrap}>
          <div style={s.resolvedInner}>
            <p style={s.resolvedText}>{hi ? "यह सिर्फ एक भ्रम था।" : "It was only an illusion."}</p>
            <p style={s.resolvedSub}>{hi ? "(जारी रखने के लिए टैप करें)" : "(Tap anywhere to continue)"}</p>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
