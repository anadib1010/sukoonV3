import React, { useState, useEffect, useRef } from 'react';
import { PARK_BENCH_QUOTES } from '../../utils/content';
import { AUDIO_URLS } from '../../utils/constants';

export function Bench({ T, lang, setTab, goBack }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  
  const [quoteIdx, setQuoteIdx] = useState(() => 
    PARK_BENCH_QUOTES && PARK_BENCH_QUOTES.length > 0 
      ? Math.floor(Math.random() * PARK_BENCH_QUOTES.length) 
      : 0
  );
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [activeSound, setActiveSound] = useState(null);
  
  // Using a ref to track the HTMLAudioElement globally within the component
  const benchAudioRef = useRef(null);

  // ── Auto-cycle quotes every 12s ──
  useEffect(() => {
    if (!PARK_BENCH_QUOTES || PARK_BENCH_QUOTES.length === 0) return;
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(prev => { 
          let n; 
          do { n = Math.floor(Math.random() * PARK_BENCH_QUOTES.length); } while(n === prev); 
          return n; 
        });
        setQuoteVisible(true);
      }, 800);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // ── SOUND ENGINE ──
  const killAudio = () => {
    if (benchAudioRef.current) {
      benchAudioRef.current.pause();
      benchAudioRef.current.currentTime = 0; // Reset to start
      benchAudioRef.current.src = "";
      benchAudioRef.current = null;
    }
    setActiveSound(null);
  };

  const playBenchSound = (key) => {
    // 1. If the SAME button is clicked, stop everything and exit
    if (activeSound === key) {
      killAudio();
      return;
    }

    // 2. If a DIFFERENT button is clicked, kill the previous one first
    killAudio();

    // 3. Clear any global app audio (if exists)
    if (window.__pageAudio) { 
      window.__pageAudio.pause(); 
      window.__pageAudio.src=""; 
      window.__pageAudio=null; 
    }
    window.speechSynthesis?.cancel();
    
    // 4. Play the new sound
    const url = AUDIO_URLS[key];
    if (!url) return;
    
    const a = new Audio(url);
    a.loop = true;
    a.play().catch(err => console.warn("Bench audio playback error:", key, err));
    
    // Store in ref so we can stop it later
    benchAudioRef.current = a;
    setActiveSound(key);
  };

  // ── CLEANUP ON UNMOUNT (Leaving the page) ──
  useEffect(() => {
    return () => {
      killAudio(); // This ensures sound stops when the user leaves the Bench
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // ── CANVAS ANIMATION ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    const trees = [
      { x: 0.08, baseH: 0.55, trunkW: 14, layers: 4, swayOffset: 0, swaySpeed: 0.0008, swayAmt: 0.022, col: "#2d4a2d" },
      { x: 0.18, baseH: 0.45, trunkW: 10, layers: 3, swayOffset: 1.2, swaySpeed: 0.001,  swayAmt: 0.018, col: "#3a5a3a" },
      { x: 0.78, baseH: 0.50, trunkW: 11, layers: 3, swayOffset: 0.5, swaySpeed: 0.0009, swayAmt: 0.020, col: "#2d4a2d" },
      { x: 0.88, baseH: 0.60, trunkW: 15, layers: 4, swayOffset: 2.1, swaySpeed: 0.0007, swayAmt: 0.025, col: "#3a5a3a" },
      { x: 0.93, baseH: 0.38, trunkW: 8,  layers: 3, swayOffset: 0.8, swaySpeed: 0.0012, swayAmt: 0.015, col: "#4a6a4a" },
    ];

    const drops = Array.from({length: 100}, () => ({
      x: Math.random(), y: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      len: 0.015 + Math.random() * 0.025,
      opacity: 0.12 + Math.random() * 0.20,
    }));

    let moonProgress = 0.75;
    let sStar = { active: false, x: 0, y: 0, life: 0 };

    const drawTree = (ctx, t, time) => {
      const x = t.x * W();
      const groundY = H() * 0.72;
      const treeH = t.baseH * H();
      const sway = Math.sin(time * t.swaySpeed + t.swayOffset) * t.swayAmt;
      ctx.save();
      ctx.translate(x, groundY);
      const trunkH = treeH * 0.28;
      ctx.fillStyle = "#1a0f08";
      ctx.beginPath();
      ctx.moveTo(-t.trunkW/2, 0);
      ctx.quadraticCurveTo(-t.trunkW/2 + sway*40, -trunkH*0.5, -t.trunkW/3 + sway*80, -trunkH);
      ctx.quadraticCurveTo(t.trunkW/3 + sway*80, -trunkH, t.trunkW/2 + sway*40, -trunkH*0.5);
      ctx.quadraticCurveTo(t.trunkW/2, 0, -t.trunkW/2, 0);
      ctx.fill();
      for (let i = 0; i < t.layers; i++) {
        const layerY = -trunkH - (i * treeH * 0.18);
        const layerSway = sway * (80 + i * 60);
        const layerW = (t.trunkW * 4.5) * (1 - i * 0.18);
        const layerH = treeH * 0.28 * (1 - i * 0.12);
        const alpha = 0.8 - i * 0.1;
        ctx.fillStyle = t.col + Math.floor(alpha * 255).toString(16).padStart(2,"0");
        ctx.beginPath();
        ctx.moveTo(layerSway, layerY - layerH);
        ctx.bezierCurveTo(layerSway + layerW*0.6, layerY - layerH*0.5, layerSway + layerW, layerY + layerH*0.2, layerSway, layerY + layerH*0.3);
        ctx.bezierCurveTo(layerSway - layerW, layerY + layerH*0.2, layerSway - layerW*0.6, layerY - layerH*0.5, layerSway, layerY - layerH);
        ctx.fill();
      }
      ctx.restore();
    };

    const render = (time) => {
      timeRef.current = time;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W(), H());

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H() * 0.7);
      grad.addColorStop(0, "#02040a");
      grad.addColorStop(1, "#0a1a0a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H() * 0.72);

      // Moon
      moonProgress -= 0.00002;
      const mx = moonProgress * W();
      const my = H() * 0.15;
      ctx.fillStyle = "rgba(255,252,240,0.8)";
      ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI*2); ctx.fill();

      // Shooting Star
      if (!sStar.active && Math.random() < 0.0008) {
          sStar = { active: true, x: Math.random() * W() * 0.5, y: Math.random() * H() * 0.3, life: 1 };
      }
      if (sStar.active) {
          sStar.x += 3; sStar.y += 0.5; sStar.life -= 0.008;
          ctx.strokeStyle = `rgba(255,255,255,${sStar.life})`;
          ctx.beginPath(); ctx.moveTo(sStar.x, sStar.y); ctx.lineTo(sStar.x - 30, sStar.y - 5); ctx.stroke();
          if (sStar.life <= 0) sStar.active = false;
      }

      // Ground
      ctx.fillStyle = "#0a140a";
      ctx.fillRect(0, H()*0.72, W(), H()*0.28);

      trees.forEach(t => drawTree(ctx, t, time));

      // Rain
      ctx.strokeStyle = "rgba(180,210,240,0.2)";
      drops.forEach(d => {
        d.y += d.speed;
        if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
        ctx.beginPath(); ctx.moveTo(d.x * W(), d.y * H()); ctx.lineTo(d.x * W(), (d.y + d.len) * H()); ctx.stroke();
      });

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:"#000", display:"flex", flexDirection:"column" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />

      {/* Nav Buttons (Includes killAudio on exit) */}
      <button onClick={() => { killAudio(); if(goBack) goBack(); else setTab("home"); }} style={{ position:"absolute", top:16, left:16, zIndex:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:99, color:"#fff", padding:"8px 16px", cursor:"pointer" }}>
        ← {lang==="Hindi"?"वापस":"Back"}
      </button>
      
      <button onClick={() => { killAudio(); setTab("home"); }} style={{ position:"absolute", top:16, right:16, zIndex:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:99, padding:"8px 14px", cursor:"pointer" }}>
        🏠
      </button>

      {/* Sound Buttons */}
      <div style={{ position:"absolute", top:70, left:0, right:0, zIndex:10, display:"flex", justifyContent:"center", gap:8 }}>
        {[
          { key:"birds.mp3",  icon:"🐦", label:lang==="Hindi"?"पक्षी":"Birds"  },
          { key:"wind.mp3",   icon:"💨", label:lang==="Hindi"?"हवा":"Wind"     },
          { key:"forest.mp3", icon:"🌲", label:lang==="Hindi"?"जंगल":"Forest"  },
          { key:"flute.mp3",  icon:"🪈", label:lang==="Hindi"?"बांसुरी":"Flute" },
          { key:"waves.mp3",  icon:"🌊", label:lang==="Hindi"?"लहरें":"Waves"  },
        ].map(s => (
          <button key={s.key} onClick={() => playBenchSound(s.key)}
            style={{ 
              background: activeSound === s.key ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)", 
              border: `1px solid ${activeSound === s.key ? "#fff" : "rgba(255,255,255,0.2)"}`, 
              borderRadius:99, color:"#fff", padding:"8px 12px", display:"flex", alignItems:"center", gap:5, fontSize:12, cursor:"pointer", transition:"0.2s" 
            }}>
            <span>{s.icon}</span> <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Quote Area */}
      <div style={{ position:"absolute", top:"30%", left:0, right:0, textAlign:"center", padding:"0 20px", zIndex:10, pointerEvents:"none" }}>
        <div style={{ opacity: quoteVisible ? 1 : 0, transition:"0.8s", maxWidth:400, margin:"0 auto" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:"#fff", fontStyle:"italic", textShadow:"0 2px 10px #000" }}>
            "{PARK_BENCH_QUOTES[quoteIdx]}"
          </p>
          <button onClick={() => { setQuoteVisible(false); setTimeout(() => { setQuoteIdx(p => (p+1)%PARK_BENCH_QUOTES.length); setQuoteVisible(true); }, 600); }} 
            style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:99, color:"#fff", padding:"6px 20px", marginTop:20, fontSize:11, pointerEvents:"auto", cursor:"pointer" }}>
            {lang==="Hindi"?"थोड़ा और बैठें":"sit a little longer"}
          </button>
        </div>
      </div>
    </div>
  );
}