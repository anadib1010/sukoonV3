import React, { useState, useEffect, useRef } from 'react';
import { PARK_BENCH_QUOTES } from '../../utils/content';
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

// Sky scenes — cycle every ~4 seconds (240 frames)
const SCENES = [
  { id:'night',    top:'#01020a', bot:'#030d08', stars:1.0, moon:1.0, aurora:0,   glow:0,   gR:0,   gG:0,   gB:0   },
  { id:'deep',     top:'#010612', bot:'#020a18', stars:0.9, moon:0.9, aurora:0,   glow:0,   gR:0,   gG:0,   gB:0   },
  { id:'aurora',   top:'#010814', bot:'#011210', stars:0.7, moon:0.6, aurora:1.0, glow:0,   gR:0,   gG:180, gB:100 },
  { id:'aurora2',  top:'#010612', bot:'#010e08', stars:0.6, moon:0.5, aurora:0.8, glow:0,   gR:0,   gG:160, gB:80  },
  { id:'predawn',  top:'#0a0515', bot:'#180820', stars:0.3, moon:0.2, aurora:0,   glow:0.2, gR:180, gG:60,  gB:120 },
  { id:'pinkdawn', top:'#1a0820', bot:'#3a1030', stars:0.1, moon:0,   aurora:0,   glow:0.6, gR:240, gG:80,  gB:140 },
  { id:'sunrise',  top:'#1a0a02', bot:'#5a2008', stars:0,   moon:0,   aurora:0,   glow:1.0, gR:255, gG:100, gB:10  },
  { id:'morning',  top:'#080402', bot:'#3a1a08', stars:0,   moon:0,   aurora:0,   glow:0.7, gR:255, gG:140, gB:40  },
];
const SCENE_DUR = 240; // frames per scene (~4s at 60fps)
const BLEND_DUR = 60;  // frames to crossfade

export function Bench({ T, lang, setTab, goBack }) {
  const canvasRef     = useRef(null);
  const animRef       = useRef(null);
  const timeRef       = useRef(0);
  const [quoteIdx,     setQuoteIdx]     = useState(() => PARK_BENCH_QUOTES?.length ? Math.floor(Math.random()*PARK_BENCH_QUOTES.length) : 0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [activeSound,  setActiveSound]  = useState(null);
  const benchAudioRef = useRef(null);

  useEffect(() => {
    if (!PARK_BENCH_QUOTES?.length) return;
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(p => { let n; do { n = Math.floor(Math.random()*PARK_BENCH_QUOTES.length); } while(n===p); return n; });
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

  // ── CANVAS ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setSize();
    window.addEventListener('resize', setSize);
    const W = () => canvas.width;
    const H = () => canvas.height;

    // ── Scene state ───────────────────────────────────────────────────
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

    // ── Stars ─────────────────────────────────────────────────────────
    const stars = Array.from({length:160}, () => ({
      x: Math.random(), y: Math.random()*0.65,
      r: 0.4+Math.random()*1.3,
      twOff: Math.random()*Math.PI*2,
      twSpd: 0.0007+Math.random()*0.001,
      op:    0.4+Math.random()*0.6,
    }));

    // ── Moon ──────────────────────────────────────────────────────────
    let moonX = 0.82; // drifts right→left

    // ── Aurora bands ──────────────────────────────────────────────────
    const auroraBands = Array.from({length:5}, (_,i) => ({
      off:  i*(Math.PI*2/5),
      spd:  0.0003+i*0.00015,
      hue:  120+i*28,
      y:    0.08+i*0.055,
      amp:  0.025+i*0.01,
      w:    0.55+i*0.08,
    }));

    // ── Shooting star ─────────────────────────────────────────────────
    let ss = { active:false, x:0, y:0, vx:0, vy:0, life:0, tail:[] };
    let wishAlpha = 0;

    // ── Trees ─────────────────────────────────────────────────────────
    const trees = [
      { x:0.06, baseH:0.52, trunkW:13, layers:4, swayOffset:0,   swaySpeed:0.0008, swayAmt:0.022, col:'#2d4a2d' },
      { x:0.16, baseH:0.42, trunkW:9,  layers:3, swayOffset:1.2, swaySpeed:0.001,  swayAmt:0.018, col:'#3a5a3a' },
      { x:0.78, baseH:0.48, trunkW:10, layers:3, swayOffset:0.5, swaySpeed:0.0009, swayAmt:0.020, col:'#2d4a2d' },
      { x:0.87, baseH:0.58, trunkW:14, layers:4, swayOffset:2.1, swaySpeed:0.0007, swayAmt:0.025, col:'#3a5a3a' },
      { x:0.94, baseH:0.36, trunkW:7,  layers:3, swayOffset:0.8, swaySpeed:0.0012, swayAmt:0.015, col:'#4a6a4a' },
    ];

    // ── Animals ───────────────────────────────────────────────────────
    const TYPES = ['dog','cat','horse','cow'];
    const SIZES = { dog:1.0, cat:0.82, horse:1.75, cow:1.5 };
    const animals = [];
    let animalTimer = 0;
    const ANIMAL_GAP = 1500 + Math.random()*2000;

    const spawnAnimal = () => {
      const type = TYPES[Math.floor(Math.random()*TYPES.length)];
      const dir  = Math.random() > 0.5 ? 1 : -1;
      animals.push({ type, dir, x: dir>0 ? -0.12 : 1.12, y: 0.0, spd: 0.00014+Math.random()*0.00012, wp: 0, sz: SIZES[type]||1, alive:true });
    };

    // ── Draw: Sky ─────────────────────────────────────────────────────
    const drawSky = (ctx) => {
      const { top, bot } = getCol('top','bot');
      const g = ctx.createLinearGradient(0, 0, 0, H()*0.88);
      g.addColorStop(0, top);
      g.addColorStop(1, bot);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W(), H()*0.88);

      // Horizon glow (sunrise/dawn)
      const glowAmt = getVal('glow');
      if (glowAmt > 0.02) {
        const sc = SCENES[scIdx], nx = nextIdx>=0 ? SCENES[nextIdx] : null;
        const gR = nx ? Math.round(lerpN(sc.gR, nx.gR, blend)) : sc.gR;
        const gG = nx ? Math.round(lerpN(sc.gG, nx.gG, blend)) : sc.gG;
        const gB = nx ? Math.round(lerpN(sc.gB, nx.gB, blend)) : sc.gB;
        const hy = H()*0.87;
        const rg = ctx.createRadialGradient(W()*0.5, hy, 0, W()*0.5, hy, W()*0.6);
        rg.addColorStop(0,   `rgba(${gR},${gG},${gB},${glowAmt*0.55})`);
        rg.addColorStop(0.5, `rgba(${gR},${gG},${gB},${glowAmt*0.18})`);
        rg.addColorStop(1,   `rgba(${gR},${gG},${gB},0)`);
        ctx.fillStyle = rg;
        ctx.fillRect(0, hy-H()*0.25, W(), H()*0.28);
      }
    };

    // ── Draw: Stars ───────────────────────────────────────────────────
    const drawStars = (ctx, time) => {
      const vis = getVal('stars');
      if (vis < 0.02) return;
      stars.forEach(s => {
        const tw = 0.55+0.45*Math.sin(time*s.twSpd+s.twOff);
        ctx.beginPath();
        ctx.arc(s.x*W(), s.y*H()*0.85, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,245,${s.op*tw*vis})`;
        ctx.fill();
      });
    };

    // ── Draw: Moon ────────────────────────────────────────────────────
    const drawMoon = (ctx) => {
      const op = getVal('moon');
      if (op < 0.02) return;
      const mx = moonX * W();
      const my = H() * (0.08 + (1-moonX)*0.08);
      const r  = clamp(W()*0.018, 10, 22);
      // glow
      const mg = ctx.createRadialGradient(mx, my, r*0.4, mx, my, r*4.5);
      mg.addColorStop(0, `rgba(255,252,220,${op*0.25})`);
      mg.addColorStop(1, 'rgba(255,252,220,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, r*4.5, 0, Math.PI*2); ctx.fill();
      // disk
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,252,232,${op})`; ctx.fill();
      // crescent shadow
      ctx.beginPath(); ctx.arc(mx+r*0.3, my-r*0.1, r*0.82, 0, Math.PI*2);
      ctx.fillStyle = `rgba(2,4,14,${op*0.88})`; ctx.fill();
    };

    // ── Draw: Aurora ──────────────────────────────────────────────────
    const drawAurora = (ctx, time) => {
      const vis = getVal('aurora');
      if (vis < 0.02) return;
      auroraBands.forEach(b => {
        const phase = time*b.spd + b.off;
        const cy  = b.y * H()*0.85;
        const amp = b.amp * H();
        const bw  = b.w * W();
        const sx  = (W()-bw)/2;
        const al  = vis*(0.11+0.07*Math.sin(phase*0.7));
        const g   = ctx.createLinearGradient(0, cy-amp*2.5, 0, cy+amp*2.5);
        g.addColorStop(0,    `hsla(${b.hue},88%,55%,0)`);
        g.addColorStop(0.35, `hsla(${b.hue},88%,60%,${al})`);
        g.addColorStop(0.5,  `hsla(${b.hue+18},85%,65%,${al*1.4})`);
        g.addColorStop(0.65, `hsla(${b.hue},88%,55%,${al})`);
        g.addColorStop(1,    `hsla(${b.hue},88%,50%,0)`);
        ctx.beginPath();
        for (let i=0; i<=48; i++) {
          const tt = i/48, x = sx+tt*bw;
          const y  = cy + Math.sin(tt*Math.PI*3+phase)*amp + Math.sin(tt*Math.PI*5+phase*1.3)*amp*0.4;
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        for (let i=48; i>=0; i--) {
          const tt = i/48, x = sx+tt*bw;
          const y  = cy + Math.sin(tt*Math.PI*3+phase)*amp + Math.sin(tt*Math.PI*5+phase*1.3)*amp*0.4 + amp*(0.35+0.2*Math.sin(phase));
          ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.fillStyle=g; ctx.fill();
      });
    };

    // ── Draw: Shooting star ───────────────────────────────────────────
    const drawShootingStar = (ctx) => {
      if (!ss.active && Math.random() < 0.00035) {
        ss = { active:true, x:0.05+Math.random()*0.5, y:0.03+Math.random()*0.18,
               vx:1.1+Math.random()*0.9, vy:0.3+Math.random()*0.4,
               life:1, tail:[] };
        wishAlpha = 0;
      }
      // "make a wish" text on canvas
      if (ss.active || wishAlpha > 0) {
        wishAlpha = ss.active ? Math.min(wishAlpha+0.045, 1) : Math.max(wishAlpha-0.02, 0);
        if (wishAlpha > 0.01) {
          const fs = clamp(W()*0.045, 16, 28);
          ctx.save();
          ctx.font = `300 ${fs}px Georgia,serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.shadowColor = `rgba(255,220,80,${wishAlpha*0.55})`;
          ctx.shadowBlur = 16;
          ctx.fillStyle = `rgba(255,248,200,${wishAlpha*0.88})`;
          ctx.fillText('✨ make a wish…', W()*0.5, H()*0.24);
          ctx.restore();
        }
      }
      if (!ss.active) return;
      ss.x += ss.vx/W()*8; ss.y += ss.vy/H()*8; ss.life -= 0.008;
      ss.tail.unshift({x:ss.x, y:ss.y});
      if (ss.tail.length > 22) ss.tail.pop();
      if (ss.life <= 0 || ss.x > 1.1) { ss.active=false; return; }
      for (let i=1; i<ss.tail.length; i++) {
        const t1=ss.tail[i-1], t2=ss.tail[i];
        const al = (1-i/ss.tail.length)*ss.life*0.9;
        ctx.strokeStyle = `rgba(255,255,235,${al})`;
        ctx.lineWidth   = (1-i/ss.tail.length)*2.2;
        ctx.beginPath(); ctx.moveTo(t1.x*W(),t1.y*H()*0.85); ctx.lineTo(t2.x*W(),t2.y*H()*0.85); ctx.stroke();
      }
    };

    // ── Draw: Ground — slim strip ─────────────────────────────────────
    const drawGround = (ctx) => {
      // Ground is only 12% of screen height — just enough for animals to walk on
      const gY = H()*0.88;
      ctx.fillStyle = '#060d06';
      ctx.fillRect(0, gY, W(), H()*0.12);
      const gg = ctx.createLinearGradient(0, gY, 0, H());
      gg.addColorStop(0, 'rgba(12,22,12,0.7)');
      gg.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = gg; ctx.fillRect(0, gY, W(), H()*0.12);
    };

    // ── Draw: Tree ────────────────────────────────────────────────────
    const drawTree = (ctx, t, time) => {
      const x       = t.x * W();
      const groundY = H() * 0.88; // matches new ground level
      const treeH   = t.baseH * H();
      const sway    = Math.sin(time*t.swaySpeed+t.swayOffset)*t.swayAmt;
      ctx.save(); ctx.translate(x, groundY);
      const trunkH = treeH*0.28;
      ctx.fillStyle = '#1a0f08';
      ctx.beginPath();
      ctx.moveTo(-t.trunkW/2, 0);
      ctx.quadraticCurveTo(-t.trunkW/2+sway*40, -trunkH*0.5, -t.trunkW/3+sway*80, -trunkH);
      ctx.quadraticCurveTo( t.trunkW/3+sway*80, -trunkH,      t.trunkW/2+sway*40, -trunkH*0.5);
      ctx.quadraticCurveTo( t.trunkW/2, 0, -t.trunkW/2, 0);
      ctx.fill();
      for (let i=0; i<t.layers; i++) {
        const layerY    = -trunkH - (i*treeH*0.18);
        const layerSway = sway*(80+i*60);
        const layerW    = (t.trunkW*4.5)*(1-i*0.18);
        const layerH    = treeH*0.28*(1-i*0.12);
        const alpha     = 0.8 - i*0.1;
        ctx.fillStyle   = t.col + Math.floor(alpha*255).toString(16).padStart(2,'0');
        ctx.beginPath();
        ctx.moveTo(layerSway, layerY-layerH);
        ctx.bezierCurveTo(layerSway+layerW*0.6, layerY-layerH*0.5, layerSway+layerW, layerY+layerH*0.2, layerSway, layerY+layerH*0.3);
        ctx.bezierCurveTo(layerSway-layerW, layerY+layerH*0.2, layerSway-layerW*0.6, layerY-layerH*0.5, layerSway, layerY-layerH);
        ctx.fill();
      }
      ctx.restore();
    };

    // ── Draw: Animals — silhouettes only, no glow ─────────────────────
    const drawDog = (ctx, s, leg) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*14,s*6.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*15,s*-3,s*7.5,s*6.5,0.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*21,s*-1,s*4,s*2.8,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*17,s*-8.8,s*2.8,s*4.2,-0.3,0,Math.PI*2); ctx.fill();
      ctx.lineWidth = s*2.8;
      ctx.beginPath(); ctx.moveTo(-s*14,s*-2); ctx.quadraticCurveTo(-s*22,s*-8,-s*18,s*-13); ctx.stroke();
      [[s*8,leg],[s*3,-leg],[-s*3,leg],[-s*8,-leg]].forEach(([lx,lp])=>{
        ctx.beginPath(); ctx.moveTo(lx,s*5.5); ctx.lineTo(lx+lp*s*5,s*12); ctx.lineWidth=s*3.2; ctx.stroke();
      });
    };

    const drawCat = (ctx, s, leg) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*12,s*5.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*13,s*-3.5,s*6.2,s*5.8,0.15,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*10,s*-8.2); ctx.lineTo(s*12.2,s*-3.5); ctx.lineTo(s*7.8,s*-3.5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*16,s*-7.8); ctx.lineTo(s*17.5,s*-3.5); ctx.lineTo(s*14.2,s*-3.5); ctx.fill();
      ctx.lineWidth = s*2.4;
      ctx.beginPath(); ctx.moveTo(-s*12,0); ctx.bezierCurveTo(-s*20,s*-3,-s*22,s*-10,-s*16,s*-12); ctx.stroke();
      [s*5,-s*5].forEach((lx,i)=>{
        const lp = i===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*5); ctx.lineTo(lx+lp*s*4,s*11); ctx.lineWidth=s*2.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx+s*3,s*5); ctx.lineTo(lx+s*3+lp*s*3.5,s*11); ctx.stroke();
      });
    };

    const drawCow = (ctx, s, leg) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*22,s*11,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*23,s*-3.5,s*10.5,s*9,0.1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*32,s*-1.5,s*5,s*3.5,0,0,Math.PI*2); ctx.fill();
      ctx.lineWidth = s*1.8;
      ctx.beginPath(); ctx.moveTo(s*20,s*-11.5); ctx.quadraticCurveTo(s*18,s*-18,s*21,s*-17.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*26,s*-11); ctx.quadraticCurveTo(s*28,s*-17.5,s*25,s*-17); ctx.stroke();
      [s*13,s*4.5,-s*4.5,-s*13].forEach((lx,i)=>{
        const lp = i%2===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*10); ctx.lineTo(lx+lp*s*4,s*22); ctx.lineWidth=s*3.8; ctx.stroke();
      });
      ctx.beginPath(); ctx.moveTo(-s*22,s*-1.5); ctx.quadraticCurveTo(-s*28,s*2,-s*26,s*7); ctx.lineWidth=s*2; ctx.stroke();
    };

    const drawHorse = (ctx, s, leg) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*25,s*11,-0.05,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*17,s*-7); ctx.quadraticCurveTo(s*24,s*-16,s*21,s*-3); ctx.quadraticCurveTo(s*28,s*-4,s*17,s*-7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*26.5,s*-15.5,s*7.5,s*5.5,0.5,0,Math.PI*2); ctx.fill();
      ctx.lineWidth = s*1.6;
      for (let i=0;i<5;i++) {
        ctx.beginPath(); ctx.moveTo(s*(15-i),s*(-5.5-i)); ctx.quadraticCurveTo(s*(13-i),s*(-10-i*0.5),s*(15.5-i),s*(-12-i*0.4)); ctx.stroke();
      }
      ctx.lineWidth = s*2.8;
      ctx.beginPath(); ctx.moveTo(-s*25,s*-2); ctx.quadraticCurveTo(-s*33,s*1,-s*31,s*9); ctx.stroke();
      [s*14,s*5,-s*5,-s*14].forEach((lx,i)=>{
        const lp = i%2===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*9.5); ctx.lineTo(lx+lp*s*5.5,s*18); ctx.lineWidth=s*3.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx+lp*s*5.5,s*18); ctx.lineTo(lx+lp*s*3.5,s*26); ctx.lineWidth=s*2.8; ctx.stroke();
      });
    };

    const drawAnimal = (ctx, a) => {
      a.x  += a.dir * a.spd;
      a.wp += 0.055;
      const groundY = H() * 0.88;
      const ax = a.x * W();
      const ay = groundY + a.y; // y is offset from ground line
      const bob = Math.sin(a.wp)*1.4*a.sz;
      const leg = Math.sin(a.wp)*0.25;
      ctx.save();
      ctx.translate(ax, ay + bob*0.3);
      if (a.dir < 0) ctx.scale(-1,1);
      ctx.fillStyle   = 'rgba(28,22,16,0.92)';
      ctx.strokeStyle = 'rgba(28,22,16,0.92)';
      switch(a.type) {
        case 'dog':   drawDog(ctx,   a.sz, leg); break;
        case 'cat':   drawCat(ctx,   a.sz, leg); break;
        case 'cow':   drawCow(ctx,   a.sz, leg); break;
        case 'horse': drawHorse(ctx, a.sz, leg); break;
      }
      ctx.restore();
      if (a.x > 1.2 || a.x < -0.2) a.alive = false;
    };

    // ── RENDER LOOP ───────────────────────────────────────────────────
    const render = (time) => {
      timeRef.current = time;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W(), H());

      // Scene advance
      scTime++;
      if (nextIdx < 0 && scTime >= SCENE_DUR - BLEND_DUR) {
        nextIdx = (scIdx + 1) % SCENES.length;
        blend   = 0;
      }
      if (nextIdx >= 0) {
        blend = clamp(blend + 1/BLEND_DUR, 0, 1);
        if (blend >= 1) { scIdx = nextIdx; nextIdx = -1; blend = 0; scTime = 0; }
      }

      // Moon drifts right → left
      moonX -= 0.000012;
      if (moonX < -0.04) moonX = 1.04;

      // Animal spawn
      animalTimer++;
      if (animalTimer > ANIMAL_GAP && animals.filter(a=>a.alive).length < 2) {
        spawnAnimal(); animalTimer = 0;
      }
      for (let i=animals.length-1; i>=0; i--) if (!animals[i].alive) animals.splice(i,1);

      // Draw order
      drawSky(ctx);
      drawStars(ctx, time);
      drawAurora(ctx, time);
      drawMoon(ctx);
      drawShootingStar(ctx);
      drawGround(ctx);
      trees.forEach(t => drawTree(ctx, t, time));
      animals.forEach(a => drawAnimal(ctx, a));

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { window.removeEventListener('resize', setSize); cancelAnimationFrame(animRef.current); };
  }, []);

  const hi = lang === 'Hindi';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'#000', overflow:'hidden' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />

      {/* Back */}
      <button onClick={() => { killAudio(); if(goBack) goBack(); else setTab('home'); }}
        style={{ position:'absolute', top:16, left:16, zIndex:10, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:99, color:'#fff', padding:'8px 16px', fontSize:13, cursor:'pointer' }}>
        ← {hi?'वापस':'Back'}
      </button>

      {/* Home */}
      <button onClick={() => { killAudio(); setTab('home'); }}
        style={{ position:'absolute', top:16, right:16, zIndex:10, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:99, padding:'8px 14px', fontSize:16, cursor:'pointer' }}>
        🏠
      </button>

      {/* Quote */}
      <div style={{ position:'absolute', top:'28%', left:0, right:0, textAlign:'center', padding:'0 24px', zIndex:10, pointerEvents:'none' }}>
        <div style={{ opacity:quoteVisible?1:0, transition:'opacity 0.8s ease', maxWidth:400, margin:'0 auto' }}>
          {PARK_BENCH_QUOTES?.[quoteIdx] && (
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(16px,4.5vw,26px)', color:'rgba(255,252,238,0.92)', fontStyle:'italic', lineHeight:1.7, textShadow:'0 2px 12px rgba(0,0,0,0.95)', margin:'0 0 18px' }}>
              "{PARK_BENCH_QUOTES[quoteIdx]}"
            </p>
          )}
          <button onClick={() => {
            setQuoteVisible(false);
            setTimeout(() => { setQuoteIdx(p=>(p+1)%PARK_BENCH_QUOTES.length); setQuoteVisible(true); }, 600);
          }} style={{ background:'rgba(255,255,255,0.09)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:99, color:'rgba(255,255,255,0.82)', padding:'7px 22px', fontSize:11, cursor:'pointer', pointerEvents:'auto', letterSpacing:'0.04em' }}>
            {hi?'थोड़ा और बैठें':'sit a little longer'}
          </button>
        </div>
      </div>

      {/* Sound buttons — bottom, thumb-friendly */}
      <div style={{ position:'absolute', bottom:24, left:0, right:0, zIndex:10, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:8, padding:'0 12px' }}>
        {[
          { key:'birds.mp3',  icon:'🐦', en:'Birds',  hi:'पक्षी'    },
          { key:'wind.mp3',   icon:'💨', en:'Wind',   hi:'हवा'      },
          { key:'forest.mp3', icon:'🌲', en:'Forest', hi:'जंगल'     },
          { key:'flute.mp3',  icon:'🪈', en:'Flute',  hi:'बांसुरी'  },
          { key:'waves.mp3',  icon:'🌊', en:'Waves',  hi:'लहरें'    },
        ].map(s => (
          <button key={s.key} onClick={() => playBenchSound(s.key)} style={{
            background: activeSound===s.key ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.55)',
            border:     `1px solid ${activeSound===s.key ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)'}`,
            borderRadius:99, color:'#fff', padding:'10px 14px',
            display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer',
            transition:'all 0.2s', backdropFilter:'blur(6px)',
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
