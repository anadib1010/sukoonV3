import React, { useState, useEffect, useRef } from 'react';

export function ZenBox({ T, lang }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const wavesRef = useRef([]);
  const animRef = useRef(null);
  const audioCtxRef = useRef(null);
  const [count, setCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const countRef = useRef(0);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playTone = (x, canvasW) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      const freq = 180 + (x / canvasW) * 320;
      osc.type = ["sine","triangle","sine","sine"][Math.floor(Math.random()*4)];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      pan.pan.setValueAtTime((x / canvasW) * 2 - 1, ctx.currentTime);
      osc.connect(gain); gain.connect(pan); pan.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    } catch(e) {}
  };

  const WAVE_SHAPES = ["circle", "hex", "star", "square", "ripple"];

  const addWave = (x, y, canvasW, canvasH, fingerIdx) => {
    const shape = WAVE_SHAPES[Math.floor(Math.random() * WAVE_SHAPES.length)];
    const hue = (fingerIdx * 60 + Math.random() * 40) % 360;
    const color = `hsla(${hue}, 70%, 70%,`;
    wavesRef.current.push({
      x, y, r: 0,
      maxR: Math.max(canvasW, canvasH) * (0.5 + Math.random() * 0.6),
      speed: 2.5 + Math.random() * 2.5,
      shape, color, rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      life: 1, decay: 0.008 + Math.random() * 0.006,
      lineWidth: 1.5 + Math.random() * 2, born: Date.now(),
    });
    playTone(x, canvasW);
    if (navigator.vibrate) navigator.vibrate(fingerIdx > 0 ? [15, 10, 15] : 20);
    countRef.current += 1;
    setCount(countRef.current);
  };

  const drawWaveShape = (ctx, w) => {
    const { x, y, r, shape, rotation } = w;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    } else if (shape === "hex") {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        i === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      }
      ctx.closePath();
    } else if (shape === "star") {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.45;
        i === 0 ? ctx.moveTo(Math.cos(a)*rad, Math.sin(a)*rad) : ctx.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
      }
      ctx.closePath();
    } else if (shape === "square") {
      ctx.rect(-r, -r, r*2, r*2);
    } else if (shape === "ripple") {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.moveTo(r*0.65, 0); ctx.arc(0, 0, r*0.65, 0, Math.PI*2);
      ctx.moveTo(r*0.32, 0); ctx.arc(0, 0, r*0.32, 0, Math.PI*2);
    }
    ctx.strokeStyle = `${w.color}${w.life.toFixed(2)})`;
    ctx.lineWidth = w.lineWidth;
    ctx.stroke();
    ctx.restore();
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wavesRef.current = wavesRef.current.filter(w => w.life > 0);
    wavesRef.current.forEach(w => {
      w.r += w.speed; w.rotation += w.rotSpeed; w.life -= w.decay;
      if (w.r < w.maxR) drawWaveShape(ctx, w);
      else w.life = 0;
    });
    animRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, [fullscreen]);

  const handleTouch = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touches = e.changedTouches || e.touches;
    if ((e.touches?.length || 1) >= 2 && !fullscreen) setFullscreen(true);
    Array.from(touches).forEach((t, i) => {
      addWave(t.clientX - rect.left, t.clientY - rect.top, canvas.width, canvas.height, i);
    });
  };

  const handleMouse = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    addWave(e.clientX - rect.left, e.clientY - rect.top, canvas.width, canvas.height, 0);
  };

  return (
    <div ref={containerRef} style={{ position: fullscreen ? "fixed" : "relative", inset: fullscreen ? 0 : "auto", zIndex: fullscreen ? 9999 : 1, width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : 80, background: fullscreen ? "#000" : T.surface, border: fullscreen ? "none" : `1px solid ${T.borderWarm}`, borderRadius: fullscreen ? 0 : 18, overflow: "hidden", cursor: "crosshair", touchAction: "none", transition: "height 0.3s ease" }}>
      <canvas ref={canvasRef} onMouseDown={handleMouse} onTouchStart={handleTouch} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", opacity: count > 0 ? 0.25 : 0.8, transition:"opacity 0.8s ease" }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color: fullscreen ? "#fff" : T.accent, letterSpacing:3, textAlign:"center" }}>
          {lang==="Hindi"?"छुएं — महसूस करें":"TOUCH  ·  FEEL"}
        </p>
        {!fullscreen && <p style={{ fontSize:12, color: T.textSoft, letterSpacing:1, marginTop:4 }}>{lang==="Hindi"?"दो उंगली = पूर्ण स्क्रीन":"two fingers = full screen"}</p>}
      </div>
      {fullscreen && (
        <button onClick={() => { setFullscreen(false); wavesRef.current = []; }} style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:99, color:"#fff", fontSize:12, padding:"8px 16px", letterSpacing:1, zIndex:10 }}>
          ✕ {lang==="Hindi"?"बंद करें":"close"}
        </button>
      )}
    </div>
  );
}