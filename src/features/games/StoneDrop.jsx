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
  const hi = lang === "Hindi";

  const drop = () => {
    if (!thought.trim()) return;
    setDropping(true);
    stoneY.current = -20;
    ripples.current = [];
    if (navigator.vibrate) navigator.vibrate([20, 100, 40]);
  };

  useEffect(() => {
    if (!dropping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height, cx = W / 2;
    const waterLine = H * 0.3;
    let speed = 2;
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, waterLine);
      const waterGrad = ctx.createLinearGradient(0, waterLine, 0, H);
      waterGrad.addColorStop(0, "rgba(30,50,80,0.8)");
      waterGrad.addColorStop(1, "rgba(5,10,20,1)");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterLine, W, H - waterLine);
      ripples.current = ripples.current.filter(r => r.opacity > 0);
      ripples.current.forEach(r => {
        ctx.beginPath(); ctx.ellipse(cx, waterLine, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(120,180,220,${r.opacity})`; ctx.lineWidth = 1.5; ctx.stroke();
        r.rx += 2; r.ry += 0.5; r.opacity -= 0.015;
      });
      if (stoneY.current < waterLine) {
        stoneY.current += speed; speed += 0.5;
        ctx.beginPath(); ctx.ellipse(cx, stoneY.current, 16, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100,100,120,0.9)"; ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.fill(); ctx.shadowBlur = 0;
        ctx.font = "11px 'Cormorant Garamond', serif"; ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.textAlign = "center";
        ctx.fillText(thought.length > 15 ? thought.slice(0, 15) + "…" : thought, cx, stoneY.current + 3);
      } else {
        if (ripples.current.length === 0) {
          for (let i = 0; i < 5; i++) ripples.current.push({ rx: 10 + i * 15, ry: 4 + i * 4, opacity: 0.8 - i * 0.15 });
          if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
          speed = speed * 0.15;
        }
        stoneY.current += speed; speed = Math.min(speed + 0.03, 1.5);
        const depth = Math.min((stoneY.current - waterLine) / (H - waterLine), 1);
        ctx.beginPath(); ctx.ellipse(cx, stoneY.current, 16 * (1 - depth * 0.4), 12 * (1 - depth * 0.4), 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60,60,80,${Math.max(0, 1 - depth * 1.2)})`; ctx.fill();
        if (depth >= 1) { cancelAnimationFrame(animRef.current); setTimeout(() => { setDropping(false); setDone(true); creditSession(2); }, 1000); return; }
      }
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [dropping]);

  const reset = () => { setThought(""); setDone(false); setDropping(false); };

  const s = {
    doneWrap: { background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "32px 20px", textAlign: "center" },
    doneIcon: { fontSize: 48, display: "block", marginBottom: 16 },
    doneTitle:{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.accentSoft, fontWeight: 400, marginBottom: 8 },
    doneBody: { fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 260, margin: "0 auto 24px" },
    againBtn: { background: `${T.accent}20`, border: `1px solid ${T.accent}40`, color: T.accent, fontSize: 13, padding: "10px 28px", borderRadius: 99, cursor: "pointer" },
    overlay:  { position: "fixed", top: 0, left: 0, width: "100vw", height: "100dvh", zIndex: 9999, overflow: "hidden", backgroundColor: "#050508" },
    canvas:   { width: "100%", height: "100%", display: "block" },
    inputWrap:{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "24px 20px" },
    prompt:   { fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 16, color: T.textSoft, marginBottom: 20, lineHeight: 1.7, textAlign: "center" },
    textarea: { width: "100%", minHeight: 90, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none", marginBottom: 16, boxSizing: "border-box" },
    dropBtn:  (active) => ({ width: "100%", background: active ? `${T.accent}22` : "transparent", border: `1px solid ${active ? T.accent + "50" : T.border}`, color: active ? T.accent : T.muted, fontSize: 14, fontWeight: 500, padding: "13px", borderRadius: 14, opacity: active ? 1 : .5, cursor: active ? "pointer" : "default" }),
  };

  if (done) return (
    <div className="fade-in" style={s.doneWrap}>
      <span style={s.doneIcon}>🌊</span>
      <h3 style={s.doneTitle}>{hi ? "डूब गया।" : "It has sunk."}</h3>
      <p style={s.doneBody}>{hi ? "वह विचार अब गहरे पानी में है।" : "That thought is in deep water now. It does not need to surface."}</p>
      <button onClick={reset} style={s.againBtn}>{hi ? "एक और छोड़ें" : "Drop another"}</button>
    </div>
  );

  if (dropping) return (
    <div style={s.overlay}><canvas ref={canvasRef} style={s.canvas} /></div>
  );

  return (
    <div style={s.inputWrap}>
      <p style={s.prompt}>{hi ? "एक भारी विचार लिखें। उसे पत्थर बनने दें। उसे जाने दें।" : "Write a heavy thought. Let it become a stone. Let it go."}</p>
      <textarea value={thought} onChange={e => setThought(e.target.value)} placeholder={hi ? "यहाँ लिखें…" : "Write it here…"} style={s.textarea} />
      <button onClick={drop} disabled={!thought.trim()} style={s.dropBtn(!!thought.trim())}>
        {hi ? "पानी में छोड़ें" : "Drop into the water"}
      </button>
    </div>
  );
}
