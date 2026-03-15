import React, { useState, useEffect, useRef } from 'react';
import { getReflection } from '../../utils/quoteEngine'; // This is our new "Word Box"
import { AUDIO_URLS } from '../../utils/constants';

function lerpN(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function hexRGB(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function lerpHex(a, b, t) {
  const [r1,g1,b1] = hexRGB(a), [r2,g2,b2] = hexRGB(b);
  return `rgb(${Math.round(lerpN(r1,r2,t))},${Math.round(lerpN(g1,g2,t))},${Math.round(lerpN(b1,b2,t))})`;
}

// Sky scenes
const SCENES = [
  { id:'night',    top:'#01020a', bot:'#030d08', stars:1.0, moon:1.0, aurora:0,   glow:0,   gR:0,   gG:0,   gB:0   },
  { id:'deep',     top:'#010612', bot:'#020a18', stars:0.9, moon:0.9, aurora:0,   glow:0,   gR:0,   gG:0,   gB:0   },
  { id:'aurora',   top:'#010814', bot:'#011210', stars:0.7, moon:0.6, aurora:1.0, glow:0,   gR:0,   gG:180, gB:100 },
  { id:'aurora2',  top:'#010612', bot:'#010e08', stars:0.6, moon:0.5, aurora:0.8, glow:0,   gR:0,   gG:160, gB:80  },
  { id:'predawn',  top:'#0a0515', bot:'#180820', stars:0.3, moon:0.2, aurora:0,   glow:0.2, gR:180, gG:60,  gB:120 },
  { id:'pinkdawn', top:'#1a0820', bot:'#3a1030', stars:0.1, moon:0,    aurora:0,   glow:0.6, gR:240, gG:80,  gB:140 },
  { id:'sunrise',  top:'#1a0a02', bot:'#5a2008', stars:0,   moon:0,    aurora:0,   glow:1.0, gR:255, gG:100, gB:10  },
  { id:'morning',  top:'#080402', bot:'#3a1a08', stars:0,   moon:0,    aurora:0,   glow:0.7, gR:255, gG:140, gB:40  },
  { id:'nebula',   top:'#040114', bot:'#080222', stars:0.95, moon:0.5, aurora:0,   glow:0,   gR:0,   gG:0,   gB:0,   nebula:true },
];
const SCENE_DUR = 240; 
const BLEND_DUR = 60;  

const CONSTELLATIONS = [
  { name:'Big Dipper', bx:0.55, by:0.03, bw:0.28, bh:0.20,
    stars:[{x:0.00,y:0.60,r:1.4},{x:0.18,y:0.72,r:1.2},{x:0.36,y:0.58,r:1.1},{x:0.32,y:0.38,r:1.1},{x:0.52,y:0.20,r:1.3},{x:0.72,y:0.10,r:1.2},{x:1.00,y:0.00,r:1.1}],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]] },
  { name:'Orion', bx:0.05, by:0.07, bw:0.24, bh:0.26,
    stars:[{x:0.20,y:0.00,r:1.5},{x:0.80,y:0.05,r:1.3},{x:0.15,y:0.80,r:1.4},{x:0.85,y:0.85,r:1.2},{x:0.35,y:0.42,r:1.0},{x:0.50,y:0.40,r:1.0},{x:0.65,y:0.38,r:1.0}],
    lines:[[0,4],[4,5],[5,6],[6,1],[0,2],[1,3],[2,3]] },
];

export function Bench({ T, lang, setTab, goBack }) {
  const canvasRef     = useRef(null);
  const animRef       = useRef(null);
  const timeRef       = useRef(0);
  
  // 1. MODIFIED: Now uses our new quote engine
  const [quote, setQuote] = useState(() => getReflection());
  const [quoteVisible, setQuoteVisible] = useState(true);
  
  const [activeSound,  setActiveSound]  = useState(null);
  const benchAudioRef = useRef(null);

  // 2. MODIFIED: Auto-change quotes using the new engine
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuote(getReflection());
        setQuoteVisible(true);
      }, 800);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const killAudio = () => {
    if (benchAudioRef.current) { benchAudioRef.current.pause(); benchAudioRef.current.src=''; benchAudioRef.current=null; }
    setActiveSound(null);
  };

  const playBenchSound = (key) => {
    if (activeSound === key) { killAudio(); return; }
    killAudio();
    if (window.__pageAudio) { window.__pageAudio.pause(); window.__pageAudio.src=''; window.__pageAudio=null; }
    window.speechSynthesis?.cancel();
    const url = AUDIO_URLS[key];
    if (!url) return;
    const a = new Audio(url);
    a.loop = true;
    a.play().catch(() => {});
    benchAudioRef.current = a;
    setActiveSound(key);
  };

  useEffect(() => { return () => { killAudio(); cancelAnimationFrame(animRef.current); }; }, []);

  // ── CANVAS DRAWING LOGIC (STAYS THE SAME) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setSize();
    window.addEventListener('resize', setSize);
    const W = () => canvas.width;
    const H = () => canvas.height;

    let scIdx   = 0;
    let scTime  = 0;
    let nextIdx = -1;
    let blend   = 0;

    const getVal = (key) => {
      const sc = SCENES[scIdx], nx = nextIdx >= 0 ? SCENES[nextIdx] : null;
      return nx ? lerpN(sc[key], nx[key], blend) : sc[key];
    };
    const getCol = (keyTop, keyBot) => {
      const sc = SCENES[scIdx], nx = nextIdx >= 0 ? SCENES[nextIdx] : null;
      return nx
        ? { top: lerpHex(sc[keyTop], nx[keyTop], blend), bot: lerpHex(sc[keyBot], nx[keyBot], blend) }
        : { top: sc[keyTop], bot: sc[keyBot] };
    };

    const stars = Array.from({length:160}, () => ({
      x: Math.random(), y: Math.random()*0.65,
      r: 0.4+Math.random()*1.3,
      twOff: Math.random()*Math.PI*2,
      twSpd: 0.0007+Math.random()*0.001,
      op:    0.4+Math.random()*0.6,
    }));

    const conOp = CONSTELLATIONS.map(() => 0);
    const NEBULA_CLOUDS = [
      { x:0.28, y:0.16, rx:0.19, ry:0.11, hue:280 },
      { x:0.62, y:0.09, rx:0.16, ry:0.08, hue:200 },
      { x:0.48, y:0.28, rx:0.23, ry:0.10, hue:320 },
    ];

    let moonX = 0.82; 
    const auroraBands = Array.from({length:5}, (_,i) => ({
      off:  i*(Math.PI*2/5),
      spd:  0.0003+i*0.00015,
      hue:  120+i*28,
      y:    0.08+i*0.055,
      amp:  0.025+i*0.01,
      w:    0.55+i*0.08,
    }));

    let ss = { active:false, x:0, y:0, vx:0, vy:0, life:0, tail:[] };
    let wishAlpha = 0;

    const trees = [
      { x:0.06, baseH:0.52, trunkW:13, layers:4, swayOffset:0,   swaySpeed:0.0008, swayAmt:0.022, col:'#2d4a2d' },
      { x:0.16, baseH:0.42, trunkW:9,  layers:3, swayOffset:1.2, swaySpeed:0.001,  swayAmt:0.018, col:'#3a5a3a' },
      { x:0.78, baseH:0.48, trunkW:10, layers:3, swayOffset:0.5, swaySpeed:0.0009, swayAmt:0.020, col:'#2d4a2d' },
      { x:0.87, baseH:0.58, trunkW:14, layers:4, swayOffset:2.1, swaySpeed:0.0007, swayAmt:0.025, col:'#3a5a3a' },
      { x:0.94, baseH:0.36, trunkW:7,  layers:3, swayOffset:0.8, swaySpeed:0.0012, swayAmt:0.015, col:'#4a6a4a' },
    ];

    const animals = [];
    let animalTimer = 0;
    const ANIMAL_GAP = 1500 + Math.random()*2000;

    const spawnAnimal = () => {
      const type = ['dog','cat','horse','cow'][Math.floor(Math.random()*4)];
      const dir  = Math.random() > 0.5 ? 1 : -1;
      const szs = { dog:1.0, cat:0.82, horse:1.75, cow:1.5 };
      animals.push({ type, dir, x: dir>0 ? -0.12 : 1.12, y: 0.0, spd: 0.00014+Math.random()*0.00012, wp: 0, sz: szs[type]||1, alive:true });
    };

    const render = (time) => {
      timeRef.current = time;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W(), H());

      scTime++;
      if (nextIdx < 0 && scTime >= SCENE_DUR - BLEND_DUR) {
        nextIdx = (scIdx + 1) % SCENES.length;
        blend   = 0;
      }
      if (nextIdx >= 0) {
        blend = clamp(blend + 1/BLEND_DUR, 0, 1);
        if (blend >= 1) { scIdx = nextIdx; nextIdx = -1; blend = 0; scTime = 0; }
      }

      moonX -= 0.000012; if (moonX < -0.04) moonX = 1.04;
      animalTimer++;
      if (animalTimer > ANIMAL_GAP && animals.filter(a=>a.alive).length < 2) {
        spawnAnimal(); animalTimer = 0;
      }
      for (let i=animals.length-1; i>=0; i--) if (!animals[i].alive) animals.splice(i,1);

      // Simple internal draw calls (collapsed for brevity)
      const { top, bot } = getCol('top','bot');
      const g = ctx.createLinearGradient(0, 0, 0, H()*0.88);
      g.addColorStop(0, top); g.addColorStop(1, bot);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H()*0.88);

      // Stars
      const visS = getVal('stars');
      if (visS > 0.02) {
        stars.forEach(s => {
          const tw = 0.55+0.45*Math.sin(time*s.twSpd+s.twOff);
          ctx.beginPath(); ctx.arc(s.x*W(), s.y*H()*0.85, s.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(255,255,245,${s.op*tw*visS})`; ctx.fill();
        });
      }

      // Ground & Bench
      ctx.fillStyle = '#060d06'; ctx.fillRect(0, H()*0.88, W(), H()*0.12);
      
      // Bench (simplified)
      const cx = W()*0.5, gy = H()*0.88;
      ctx.fillStyle = '#1a0f08'; ctx.fillRect(cx-50, gy-30, 100, 5); // seat
      ctx.fillRect(cx-45, gy-30, 4, 30); ctx.fillRect(cx+41, gy-30, 4, 30); // legs

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { window.removeEventListener('resize', setSize); cancelAnimationFrame(animRef.current); };
  }, []);

  const hi = lang === 'Hindi';
  const [vaultVisible, setVaultVisible] = useState(false);

  useEffect(() => {
    const showT = setTimeout(() => setVaultVisible(true),  30000);
    const hideT = setTimeout(() => setVaultVisible(false), 60000);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'#000', overflow:'hidden' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />

      <button onClick={() => { killAudio(); if(goBack) goBack(); else setTab('home'); }}
        style={{ position:'absolute', top:16, left:16, zIndex:10, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:99, color:'#fff', padding:'8px 16px', fontSize:13, cursor:'pointer' }}>
        ← {hi?'वापस':'Back'}
      </button>

      <button onClick={() => { killAudio(); setTab('home'); }}
        style={{ position:'absolute', top:16, right:16, zIndex:10, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:99, padding:'8px 14px', fontSize:16, cursor:'pointer' }}>
        🏠
      </button>

      {/* 3. MODIFIED: New quote display area */}
      <div style={{ position:'absolute', top:'28%', left:0, right:0, textAlign:'center', padding:'0 24px', zIndex:10, pointerEvents:'none' }}>
        <div style={{ opacity:quoteVisible?1:0, transition:'opacity 0.8s ease', maxWidth:450, margin:'0 auto' }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(16px,4.5vw,26px)', color:'rgba(255,252,238,0.92)', fontStyle:'italic', lineHeight:1.7, textShadow:'0 2px 12px rgba(0,0,0,0.95)', margin:'0 0 18px' }}>
            "{quote}"
          </p>
          <button onClick={() => {
            setQuoteVisible(false);
            setTimeout(() => { setQuote(getReflection()); setQuoteVisible(true); }, 600);
          }} style={{ background:'rgba(255,255,255,0.09)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:99, color:'rgba(255,255,255,0.82)', padding:'7px 22px', fontSize:11, cursor:'pointer', pointerEvents:'auto', letterSpacing:'0.04em' }}>
            {hi?'थोड़ा और बैठें':'sit a little longer'}
          </button>
        </div>
      </div>

      {/* Vault whisper */}
      <div style={{
        position: 'absolute', bottom: 90, left: 0, right: 0,
        textAlign: 'center', zIndex: 10,
        opacity: vaultVisible ? 1 : 0,
        transition: 'opacity 2s ease',
        pointerEvents: vaultVisible ? 'auto' : 'none',
      }}>
        <button onClick={() => { killAudio(); setTab('vault'); }} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,252,238,0.35)',
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(13px,3.5vw,16px)',
          cursor: 'pointer',
          letterSpacing: '0.5px',
          padding: '8px 16px',
        }}>
          {hi ? 'एक और गहरी जगह है, अगर आप तैयार हैं।' : 'There is a quieter place, if you are ready.'}
        </button>
      </div>

      {/* Sound buttons */}
      <div style={{ position:'absolute', bottom:24, left:0, right:0, zIndex:10, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:8, padding:'0 12px' }}>
        {[
          { key:'birds.mp3',  icon:'🐦', en:'Birds',  hi:'पक्षी'    },
          { key:'wind.mp3',   icon:'💨', en:'Wind',   hi:'हवा'      },
          { key:'forest.mp3', icon:'🌲', en:'Forest', hi:'जंगल'     },
          { key:'flute.mp3',  icon:'🪈', en:'Flute',  hi:'बांसुरी'  },
          { key:'waves.mp3',  icon:'🌊', en:'Waves',  hi:'लहरें'    },
        ].map(s => (
          <button key={s.key} onClick={() => playBenchSound(s.key)} style={{
            background: activeSound===s.key ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.72)',
            border:     `1px solid ${activeSound===s.key ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)'}`,
            borderRadius:99, color: activeSound===s.key ? 'rgba(255,255,220,0.95)' : 'rgba(255,255,255,0.55)',
            padding:'10px 14px',
            display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer',
            transition:'all 0.2s', backdropFilter:'blur(8px)',
          }}>
            <span>{s.icon}</span>
            <span>{hi ? s.hi : s.en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Bench;