import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PARK_BENCH_QUOTES } from '../../utils/content';
import { AUDIO_URLS } from '../../utils/constants';

const ANIMAL_TYPES = ['dog', 'cat', 'cow', 'horse'];

const SCENES = [
  { id:'night',    dur:60, sky0:'#01020a', sky1:'#030d08', stars:1.0, moon:0.95, aurora:0,   glow:0,   glowR:255, glowG:80,  glowB:0   },
  { id:'aurora',   dur:65, sky0:'#010612', sky1:'#010c10', stars:0.7, moon:0.55, aurora:1.0, glow:0,   glowR:0,   glowG:200, glowB:120 },
  { id:'mountain', dur:55, sky0:'#010410', sky1:'#02060e', stars:0.85,moon:0.9,  aurora:0,   glow:0,   glowR:100, glowG:150, glowB:255, snow:true },
  { id:'nebula',   dur:60, sky0:'#040214', sky1:'#0a0418', stars:0.9, moon:0.4,  aurora:0,   glow:0,   glowR:160, glowG:60,  glowB:220, nebula:true },
  { id:'predawn',  dur:45, sky0:'#0a0515', sky1:'#1a0820', stars:0.3, moon:0.2,  aurora:0,   glow:0.25,glowR:180, glowG:60,  glowB:120 },
  { id:'pinkdawn', dur:45, sky0:'#1a0820', sky1:'#4a1535', stars:0.1, moon:0,    aurora:0,   glow:0.7, glowR:255, glowG:80,  glowB:140 },
  { id:'sunrise',  dur:45, sky0:'#1a0a02', sky1:'#5a2008', stars:0,   moon:0,    aurora:0,   glow:1.0, glowR:255, glowG:100, glowB:10  },
];

// Ursa Major — Big Dipper relative coords (normalised 0-1 in a box)
const URSA_MAJOR = [
  {x:0.00, y:0.60, r:1.4}, // Dubhe
  {x:0.18, y:0.72, r:1.2}, // Merak
  {x:0.36, y:0.58, r:1.1}, // Phecda
  {x:0.32, y:0.38, r:1.1}, // Megrez
  {x:0.52, y:0.20, r:1.3}, // Alioth
  {x:0.72, y:0.10, r:1.2}, // Mizar
  {x:1.00, y:0.00, r:1.1}, // Alkaid
];
const URSA_MAJOR_LINES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]];

// Ursa Minor — Little Dipper
const URSA_MINOR = [
  {x:0.00, y:0.00, r:1.6}, // Polaris
  {x:0.22, y:0.18, r:0.9},
  {x:0.40, y:0.30, r:0.8},
  {x:0.55, y:0.15, r:0.9},
  {x:0.70, y:0.35, r:0.8},
  {x:0.85, y:0.55, r:0.9},
  {x:1.00, y:0.60, r:1.0},
];
const URSA_MINOR_LINES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]];

// Orion (appears during clear night)
const ORION = [
  {x:0.20, y:0.00, r:1.5}, // Betelgeuse
  {x:0.80, y:0.05, r:1.3}, // Bellatrix
  {x:0.15, y:0.80, r:1.4}, // Rigel
  {x:0.85, y:0.85, r:1.2}, // Saiph
  {x:0.35, y:0.42, r:1.0}, // Belt star 1
  {x:0.50, y:0.40, r:1.0}, // Belt star 2
  {x:0.65, y:0.38, r:1.0}, // Belt star 3
];
const ORION_LINES = [[0,4],[4,5],[5,6],[6,1],[0,2],[1,3],[2,3]];

function lerpN(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function hexRGB(hex) {
  if (!hex || hex.length < 7) return [0,0,0];
  return [parseInt(hex.slice(1,3),16)||0, parseInt(hex.slice(3,5),16)||0, parseInt(hex.slice(5,7),16)||0];
}
function lerpHex(a, b, t) {
  const [r1,g1,b1]=hexRGB(a), [r2,g2,b2]=hexRGB(b);
  return `rgb(${Math.round(lerpN(r1,r2,t))},${Math.round(lerpN(g1,g2,t))},${Math.round(lerpN(b1,b2,t))})`;
}

export function Bench({ T, lang, setTab, goBack }) {
  const canvasRef     = useRef(null);
  const animRef       = useRef(null);
  const benchAudioRef = useRef(null);

  const [quoteIdx,     setQuoteIdx]     = useState(() => PARK_BENCH_QUOTES?.length ? Math.floor(Math.random()*PARK_BENCH_QUOTES.length) : 0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [activeSound,  setActiveSound]  = useState(null);
  const [makeWish,     setMakeWish]     = useState(false);

  const killAudio = useCallback(() => {
    if (benchAudioRef.current) { benchAudioRef.current.pause(); benchAudioRef.current.src=''; benchAudioRef.current=null; }
    setActiveSound(null);
  }, []);

  const playBenchSound = useCallback((key) => {
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
  }, [activeSound, killAudio]);

  useEffect(() => {
    if (!PARK_BENCH_QUOTES?.length) return;
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(p => { let n; do { n = Math.floor(Math.random()*PARK_BENCH_QUOTES.length); } while(n===p); return n; });
        setQuoteVisible(true);
      }, 900);
    }, 13000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { return () => { killAudio(); cancelAnimationFrame(animRef.current); }; }, [killAudio]);

  // ── CANVAS ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // ── Stars (more, varied) ─────────────────────────────────────────
    const stars = Array.from({length:220}, () => ({
      x: Math.random(), y: Math.random()*0.68,
      r: 0.3+Math.random()*1.6,
      twOff: Math.random()*Math.PI*2,
      twSpd: 0.0005+Math.random()*0.0012,
      op: 0.35+Math.random()*0.65,
      col: Math.random()<0.08 ? '#ffd8a0' : Math.random()<0.06 ? '#a0c8ff' : '#fffff5',
    }));

    // ── Constellation placement (fixed screen positions) ─────────────
    // Each constellation has a bounding box (normalised) in sky area
    const constellations = [
      { def:URSA_MAJOR, lines:URSA_MAJOR_LINES, bx:0.58, by:0.04, bw:0.30, bh:0.22, name:'Ursa Major',  op:0, targetOp:0 },
      { def:URSA_MINOR, lines:URSA_MINOR_LINES, bx:0.72, by:0.02, bw:0.18, bh:0.16, name:'Ursa Minor',  op:0, targetOp:0 },
      { def:ORION,      lines:ORION_LINES,       bx:0.04, by:0.08, bw:0.28, bh:0.30, name:'Orion',       op:0, targetOp:0 },
    ];

    // ── Aurora bands ────────────────────────────────────────────────
    // Moving bands + static standing-wave bands
    const auroraMoving = Array.from({length:5}, (_,i) => ({
      off: i*(Math.PI*2/5), spd:0.0003+i*0.00015,
      hue:120+i*28, y:0.06+i*0.05, amp:0.022+i*0.008, w:0.55+i*0.08,
    }));
    // Standing wave bands — sine-shaped curtains that barely move
    const auroraStanding = Array.from({length:4}, (_,i) => ({
      hue: 140+i*35, y: 0.04+i*0.06, amp:0.018+i*0.006, w:0.7+i*0.06,
      breathOff: i*0.8, breathSpd: 0.00018+i*0.00008,
    }));

    // ── Nebula clouds ────────────────────────────────────────────────
    const nebulaClouds = [
      { x:0.30, y:0.18, rx:0.22, ry:0.14, hue:280, op:0 },
      { x:0.62, y:0.10, rx:0.18, ry:0.10, hue:200, op:0 },
      { x:0.50, y:0.30, rx:0.28, ry:0.12, hue:320, op:0 },
    ];

    // ── Shooting star ────────────────────────────────────────────────
    let ss = { on:false, x:0, y:0, vx:0, vy:0, life:0, tail:[], wishShown:false };

    // ── Moon ─────────────────────────────────────────────────────────
    let moonX = 0.82;

    // ── Birds ─────────────────────────────────────────────────────────
    const flocks = [];
    const spawnFlock = () => {
      const n=2+Math.floor(Math.random()*5), dir=Math.random()>0.5?1:-1;
      return {
        dir, spd:0.00018+Math.random()*0.00018, alive:true,
        birds: Array.from({length:n},()=>({
          x:(dir>0?-0.08:1.08)+(Math.random()-0.5)*0.06,
          y:0.14+Math.random()*0.26,
          wp:Math.random()*Math.PI*2, ws:0.035+Math.random()*0.025, sz:2.5+Math.random()*2,
        })),
      };
    };

    // ── Animals ───────────────────────────────────────────────────────
    const animals = [];
    let animalTimer = 0;
    const ANIMAL_GAP = 1800+Math.random()*2400;
    const animalSizes = { horse:1.8, cow:1.6, dog:1.0, cat:0.85 };
    const animalGlowCols = { horse:'rgba(255,200,120', cow:'rgba(200,220,160', dog:'rgba(255,220,150', cat:'rgba(220,200,255' };
    const spawnAnimal = () => {
      const type=ANIMAL_TYPES[Math.floor(Math.random()*4)], dir=Math.random()>0.5?1:-1;
      animals.push({ type, x:dir>0?-0.12:1.12, y:0.755+Math.random()*0.04,
        dir, spd:0.00016+Math.random()*0.00014, wp:0, sz:animalSizes[type]||1, alive:true });
    };

    // ── Waves ─────────────────────────────────────────────────────────
    let waveOp=0, waveOn=false, waveTimer=0;
    const WAVE_GAP=2200+Math.random()*3000;

    // ── Scene state ───────────────────────────────────────────────────
    let scIdx=0, scTime=0, blend=0, nextIdx=-1;
    const BLEND_DUR=240; // slower crossfade — 4s

    // ── Slow breathing pulse for sky (always active) ──────────────────
    // Sky brightness pulses very gently — like the universe breathing
    let skyBreath = 0;

    // ── DRAW: Sky ─────────────────────────────────────────────────────
    const drawSky = (ctx, time) => {
      const sc=SCENES[scIdx], nsc=nextIdx>=0?SCENES[nextIdx]:null;
      const s0=nsc?lerpHex(sc.sky0,nsc.sky0,blend):sc.sky0;
      const s1=nsc?lerpHex(sc.sky1,nsc.sky1,blend):sc.sky1;
      // Sky breathing — very subtle luminosity pulse
      skyBreath = Math.sin(time*0.00018)*0.018;
      const g=ctx.createLinearGradient(0,0,0,H()*0.72);
      g.addColorStop(0,s0); g.addColorStop(1,s1);
      ctx.fillStyle=g; ctx.fillRect(0,0,W(),H()*0.72);
      // breathing overlay
      if (skyBreath>0) {
        ctx.fillStyle=`rgba(255,255,255,${skyBreath})`;
        ctx.fillRect(0,0,W(),H()*0.72);
      }
      // Horizon glow
      const glowAmt=nsc?lerpN(sc.glow,nsc.glow,blend):sc.glow;
      const gR=nsc?Math.round(lerpN(sc.glowR,nsc.glowR,blend)):sc.glowR;
      const gG=nsc?Math.round(lerpN(sc.glowG,nsc.glowG,blend)):sc.glowG;
      const gB=nsc?Math.round(lerpN(sc.glowB,nsc.glowB,blend)):sc.glowB;
      if (glowAmt>0.02) {
        const hy=H()*0.71;
        const rg=ctx.createRadialGradient(W()*0.5,hy,0,W()*0.5,hy,W()*0.55);
        rg.addColorStop(0,`rgba(${gR},${gG},${gB},${glowAmt*0.5})`);
        rg.addColorStop(0.5,`rgba(${gR},${gG},${gB},${glowAmt*0.15})`);
        rg.addColorStop(1,`rgba(${gR},${gG},${gB},0)`);
        ctx.fillStyle=rg; ctx.fillRect(0,hy-H()*0.3,W(),H()*0.32);
      }
    };

    // ── DRAW: Stars ───────────────────────────────────────────────────
    const drawStars = (ctx, time) => {
      const sc=SCENES[scIdx], nsc=nextIdx>=0?SCENES[nextIdx]:null;
      const vis=nsc?lerpN(sc.stars,nsc.stars,blend):sc.stars;
      if (vis<0.02) return;
      stars.forEach(s => {
        const tw=0.5+0.5*Math.sin(time*s.twSpd+s.twOff);
        const alpha=s.op*tw*vis;
        // tiny glow for brighter stars
        if (s.r>1.2 && alpha>0.5) {
          const sg=ctx.createRadialGradient(s.x*W(),s.y*H(),0,s.x*W(),s.y*H(),s.r*3.5);
          sg.addColorStop(0,s.col.replace(')',`,${alpha*0.3})`).replace('rgba','rgba').replace('#','rgba(').replace(/^rgba\(#/,'rgba('));
          // simpler:
          sg.addColorStop(0,`rgba(255,255,240,${alpha*0.25})`);
          sg.addColorStop(1,'rgba(255,255,240,0)');
          ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(s.x*W(),s.y*H(),s.r*3.5,0,Math.PI*2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(s.x*W(),s.y*H(),s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,245,${alpha})`; ctx.fill();
      });
    };

    // ── DRAW: Constellations ──────────────────────────────────────────
    const drawConstellations = (ctx, time) => {
      const sc=SCENES[scIdx], nsc=nextIdx>=0?SCENES[nextIdx]:null;
      const vis=nsc?lerpN(sc.stars,nsc.stars,blend):sc.stars;
      if (vis<0.4) {
        constellations.forEach(c=>{ c.targetOp=0; c.op=lerpN(c.op,0,0.01); });
        return;
      }
      // slowly fade constellations in/out
      constellations.forEach((con,ci) => {
        // rotate which constellation is visible — each visible for ~120s
        const cycleLen=360, offset=ci*120;
        const t=(Math.floor(time/1000+offset)%cycleLen);
        con.targetOp = (t<80 || t>300) ? 0 : vis*0.72;
        con.op=lerpN(con.op,con.targetOp,0.003);
        if (con.op<0.02) return;

        const bx=con.bx*W(), by=con.by*H(), bw=con.bw*W(), bh=con.bh*H();

        // connecting lines
        ctx.strokeStyle=`rgba(180,210,255,${con.op*0.35})`;
        ctx.lineWidth=0.8; ctx.lineCap='round';
        con.lines.forEach(([a,b])=>{
          const sa=con.def[a], sb=con.def[b];
          ctx.beginPath();
          ctx.moveTo(bx+sa.x*bw, by+sa.y*bh);
          ctx.lineTo(bx+sb.x*bw, by+sb.y*bh);
          ctx.stroke();
        });

        // stars
        con.def.forEach(star=>{
          const sx=bx+star.x*bw, sy=by+star.y*bh;
          const r=star.r*1.1;
          // glow
          const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,r*4);
          sg.addColorStop(0,`rgba(200,225,255,${con.op*0.45})`);
          sg.addColorStop(1,'rgba(200,225,255,0)');
          ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,r*4,0,Math.PI*2); ctx.fill();
          // dot
          ctx.fillStyle=`rgba(230,242,255,${con.op*0.95})`;
          ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        });

        // constellation name — faint, serif
        if (con.op>0.35) {
          ctx.fillStyle=`rgba(160,195,240,${(con.op-0.35)*0.8})`;
          ctx.font=`${clamp(W()*0.018,10,14)}px Georgia,serif`;
          ctx.textAlign='left'; ctx.textBaseline='top';
          ctx.fillText(con.name, bx, by+bh+4);
        }
      });
    };

    // ── DRAW: Moon ────────────────────────────────────────────────────
    const drawMoon = (ctx) => {
      const sc=SCENES[scIdx], nsc=nextIdx>=0?SCENES[nextIdx]:null;
      const op=nsc?lerpN(sc.moon,nsc.moon,blend):sc.moon;
      if (op<0.02) return;
      const mx=moonX*W(), my=H()*(0.10+(1-moonX)*0.10);
      const r=clamp(W()*0.018,10,22);
      const mg=ctx.createRadialGradient(mx,my,r*0.5,mx,my,r*4);
      mg.addColorStop(0,`rgba(255,252,220,${op*0.22})`); mg.addColorStop(1,'rgba(255,252,220,0)');
      ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(mx,my,r*4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(mx,my,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,252,232,${op})`; ctx.fill();
      ctx.beginPath(); ctx.arc(mx+r*0.32,my-r*0.1,r*0.82,0,Math.PI*2);
      ctx.fillStyle=`rgba(2,4,14,${op*0.88})`; ctx.fill();
    };

    // ── DRAW: Aurora — moving + standing waves ────────────────────────
    const drawAurora = (ctx, time) => {
      const sc=SCENES[scIdx], nsc=nextIdx>=0?SCENES[nextIdx]:null;
      const vis=nsc?lerpN(sc.aurora,nsc.aurora,blend):sc.aurora;
      if (vis<0.02) return;

      // Moving curtain bands (as before)
      auroraMoving.forEach(b=>{
        const phase=time*b.spd+b.off;
        const cy=b.y*H(), amp=b.amp*H(), bw=b.w*W(), sx=(W()-bw)/2;
        const al=vis*(0.10+0.06*Math.sin(phase*0.7));
        const g=ctx.createLinearGradient(0,cy-amp*2.5,0,cy+amp*2.5);
        g.addColorStop(0,`hsla(${b.hue},88%,55%,0)`);
        g.addColorStop(0.35,`hsla(${b.hue},88%,60%,${al})`);
        g.addColorStop(0.5,`hsla(${b.hue+18},85%,65%,${al*1.35})`);
        g.addColorStop(0.65,`hsla(${b.hue},88%,55%,${al})`);
        g.addColorStop(1,`hsla(${b.hue},88%,50%,0)`);
        ctx.beginPath();
        const steps=52;
        for(let i=0;i<=steps;i++){
          const tt=i/steps, x=sx+tt*bw;
          const y=cy+Math.sin(tt*Math.PI*3+phase)*amp+Math.sin(tt*Math.PI*5+phase*1.3)*amp*0.4;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        for(let i=steps;i>=0;i--){
          const tt=i/steps, x=sx+tt*bw;
          const y=cy+Math.sin(tt*Math.PI*3+phase)*amp+Math.sin(tt*Math.PI*5+phase*1.3)*amp*0.4+amp*(0.32+0.18*Math.sin(phase));
          ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.fillStyle=g; ctx.fill();
      });

      // Standing wave bands — barely move, just breathe in opacity
      // These look like frozen curtains of colour hanging in the sky
      auroraStanding.forEach(b=>{
        const breath=Math.sin(time*b.breathSpd+b.breathOff);
        const al=vis*(0.055+0.035*breath); // very faint, slow pulse
        const cy=b.y*H(), amp=b.amp*H(), bw=b.w*W(), sx=(W()-bw)/2;
        const g=ctx.createLinearGradient(0,cy-amp*3,0,cy+amp*3);
        g.addColorStop(0,`hsla(${b.hue},75%,60%,0)`);
        g.addColorStop(0.4,`hsla(${b.hue},75%,65%,${al})`);
        g.addColorStop(0.6,`hsla(${b.hue+15},70%,68%,${al*1.2})`);
        g.addColorStop(1,`hsla(${b.hue},75%,58%,0)`);
        // fixed sine shape — frozen wave
        ctx.beginPath();
        const steps=60;
        for(let i=0;i<=steps;i++){
          const tt=i/steps, x=sx+tt*bw;
          // standing wave: no time term, just spatial sine
          const y=cy+Math.sin(tt*Math.PI*4)*amp+Math.sin(tt*Math.PI*7)*amp*0.3;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        for(let i=steps;i>=0;i--){
          const tt=i/steps, x=sx+tt*bw;
          const y=cy+Math.sin(tt*Math.PI*4)*amp+Math.sin(tt*Math.PI*7)*amp*0.3+amp*(0.4+0.2*breath);
          ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.fillStyle=g; ctx.fill();
      });
    };

    // ── DRAW: Nebula ──────────────────────────────────────────────────
    const drawNebula = (ctx, time) => {
      const sc=SCENES[scIdx], nsc=nextIdx>=0?SCENES[nextIdx]:null;
      const isNebula=sc.nebula||false, isNebulaNext=nsc?.nebula||false;
      const vis=isNebula?(isNebulaNext?1:clamp(1-blend*1.2,0,1)):(isNebulaNext?clamp(blend*1.2,0,1):0);
      if (vis<0.02) return;

      nebulaClouds.forEach((nc,i)=>{
        const breath=0.7+0.3*Math.sin(time*0.00012+i*1.4);
        const opacity=vis*breath*0.18;
        const cx=nc.x*W(), cy=nc.y*H(), rx=nc.rx*W(), ry=nc.ry*H();
        // multi-layer radial gradient cloud
        for(let layer=0;layer<3;layer++){
          const lop=opacity*(1-layer*0.28);
          const lrx=rx*(1+layer*0.35), lry=ry*(1+layer*0.4);
          const dx=(layer-1)*rx*0.12, dy=(layer-1)*ry*0.08;
          const ng=ctx.createRadialGradient(cx+dx,cy+dy,0,cx+dx,cy+dy,Math.max(lrx,lry));
          ng.addColorStop(0,`hsla(${nc.hue},80%,65%,${lop})`);
          ng.addColorStop(0.4,`hsla(${nc.hue+20},70%,55%,${lop*0.6})`);
          ng.addColorStop(1,`hsla(${nc.hue+40},60%,45%,0)`);
          ctx.save();
          ctx.scale(lrx/Math.max(lrx,lry),lry/Math.max(lrx,lry));
          ctx.fillStyle=ng;
          ctx.beginPath();
          ctx.arc((cx+dx)*(Math.max(lrx,lry)/lrx),(cy+dy)*(Math.max(lrx,lry)/lry),Math.max(lrx,lry),0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Nebula dust specks — tiny coloured star-like particles
      // Use a seeded-ish pattern (fixed positions)
      for(let i=0;i<60;i++){
        const fx=((i*137.5)%1), fy=((i*97.3)%0.45);
        const fcol=`hsla(${(nc => nc.hue)(nebulaClouds[i%3])},80%,75%,${vis*0.55*(0.4+0.6*((i*53)%100)/100)})`;
        ctx.beginPath(); ctx.arc(fx*W(),fy*H(),0.8,0,Math.PI*2);
        ctx.fillStyle=fcol; ctx.fill();
      }
    };

    // ── DRAW: Snow Mountain ───────────────────────────────────────────
    const drawSnowMountain = (ctx) => {
      const sc=SCENES[scIdx], nsc=nextIdx>=0?SCENES[nextIdx]:null;
      const showC=sc.snow||false, showN=nsc?.snow||false;
      const op=showC?(showN?1:clamp(1-blend*1.5,0,1)):(showN?clamp(blend*1.5,0,1):0);
      if (op<0.02) return;
      const gY=H()*0.72;
      ctx.save(); ctx.globalAlpha=op;
      ctx.beginPath();
      ctx.moveTo(0,gY); ctx.lineTo(W()*0.15,gY);
      ctx.lineTo(W()*0.28,gY*0.53); ctx.lineTo(W()*0.36,gY*0.63);
      ctx.lineTo(W()*0.42,gY*0.41); ctx.lineTo(W()*0.50,gY*0.59);
      ctx.lineTo(W()*0.58,gY*0.47); ctx.lineTo(W()*0.66,gY*0.62);
      ctx.lineTo(W()*0.78,gY); ctx.lineTo(W(),gY);
      ctx.fillStyle='#0c1812'; ctx.fill();
      [[W()*0.28,gY*0.53,W()*0.055],[W()*0.42,gY*0.41,W()*0.065],[W()*0.58,gY*0.47,W()*0.052]].forEach(([px,py,pr])=>{
        const sg=ctx.createRadialGradient(px,py,0,px,py,pr);
        sg.addColorStop(0,'rgba(225,238,255,0.92)'); sg.addColorStop(0.5,'rgba(195,215,245,0.5)'); sg.addColorStop(1,'rgba(180,200,235,0)');
        ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    };

    // ── DRAW: Tree ────────────────────────────────────────────────────
    const drawTree = (ctx, tr, time) => {
      const x=tr.x*W(), gY=H()*0.72, tH=tr.h*H();
      const sway=Math.sin(time*tr.ss+tr.so)*tr.sa;
      const sw2=Math.sin(time*tr.ss*1.5+tr.so+1)*tr.sa*0.35;
      ctx.save(); ctx.translate(x,gY);
      const tkH=tH*0.22;
      ctx.fillStyle='#100806';
      ctx.beginPath();
      ctx.moveTo(-tr.tw/2,0);
      ctx.quadraticCurveTo(-tr.tw/2+sway*45,-tkH*0.5,-tr.tw/3+sway*95,-tkH);
      ctx.quadraticCurveTo(tr.tw/3+sway*95,-tkH,tr.tw/2+sway*45,-tkH*0.5);
      ctx.quadraticCurveTo(tr.tw/2,0,-tr.tw/2,0); ctx.fill();
      for(let i=0;i<tr.layers;i++){
        const ly=-tkH-i*tH*0.17, swX=(sway+sw2*0.5)*(95+i*65);
        const lw=(tr.tw*5.5)*(1-i*0.16), lh=tH*0.30*(1-i*0.10), al=0.88-i*0.08;
        ctx.fillStyle=tr.c1+Math.floor(al*0.75*255).toString(16).padStart(2,'0');
        ctx.beginPath();
        ctx.moveTo(swX,ly-lh);
        ctx.bezierCurveTo(swX+lw*0.7,ly-lh*0.4,swX+lw,ly+lh*0.25,swX,ly+lh*0.35);
        ctx.bezierCurveTo(swX-lw,ly+lh*0.25,swX-lw*0.7,ly-lh*0.4,swX,ly-lh); ctx.fill();
        ctx.fillStyle=tr.c2+Math.floor(al*0.38*255).toString(16).padStart(2,'0');
        ctx.beginPath();
        ctx.moveTo(swX+lw*0.1,ly-lh*0.88);
        ctx.bezierCurveTo(swX+lw*0.55,ly-lh*0.3,swX+lw*0.62,ly+lh*0.08,swX+lw*0.1,ly+lh*0.18);
        ctx.bezierCurveTo(swX-lw*0.22,ly+lh*0.12,swX-lw*0.12,ly-lh*0.22,swX+lw*0.1,ly-lh*0.88); ctx.fill();
      }
      ctx.restore();
    };

    const trees = [
      {x:0.05,h:0.58,tw:13,layers:5,so:0,  ss:0.00085,sa:0.028,c1:'#1e2e1e',c2:'#2d4a2d'},
      {x:0.14,h:0.46,tw:9, layers:4,so:1.2,ss:0.0011, sa:0.022,c1:'#243824',c2:'#3a5a3a'},
      {x:0.22,h:0.38,tw:7, layers:3,so:2.4,ss:0.0013, sa:0.018,c1:'#263826',c2:'#4a6a4a'},
      {x:0.76,h:0.42,tw:8, layers:3,so:0.6,ss:0.0010, sa:0.020,c1:'#1e2e1e',c2:'#2d4a2d'},
      {x:0.84,h:0.54,tw:12,layers:5,so:1.8,ss:0.00088,sa:0.026,c1:'#243824',c2:'#3a5a3a'},
      {x:0.91,h:0.62,tw:15,layers:5,so:3.1,ss:0.00075,sa:0.030,c1:'#1e2e1e',c2:'#2d4a2d'},
      {x:0.97,h:0.40,tw:7, layers:3,so:0.9,ss:0.0014, sa:0.016,c1:'#263826',c2:'#4a6a4a'},
    ];

    // ── DRAW: Birds ───────────────────────────────────────────────────
    const drawBirds = (ctx, starVis) => {
      if (starVis>0.55) return;
      flocks.forEach(f=>{
        f.birds.forEach(b=>{
          b.x+=f.dir*f.spd; b.wp+=b.ws;
          const bx=b.x*W(), by=b.y*H(), wing=Math.sin(b.wp)*b.sz*1.1;
          ctx.strokeStyle='rgba(35,35,35,0.8)'; ctx.lineWidth=1.1;
          ctx.beginPath();
          ctx.moveTo(bx,by); ctx.quadraticCurveTo(bx-b.sz*1.3,by-wing,bx-b.sz*2.6,by);
          ctx.moveTo(bx,by); ctx.quadraticCurveTo(bx+b.sz*1.3,by-wing,bx+b.sz*2.6,by);
          ctx.stroke();
        });
        if(f.birds.every(b=>f.dir>0?b.x>1.15:b.x<-0.15)) f.alive=false;
      });
      for(let i=flocks.length-1;i>=0;i--) if(!flocks[i].alive) flocks.splice(i,1);
    };

    // ── DRAW: Shooting star — slow, "Make a wish" ─────────────────────
    const drawShootingStar = (ctx, time) => {
      if (!ss.on && Math.random()<0.00035) {
        ss={
          on:true,
          x:0.04+Math.random()*0.5, y:0.03+Math.random()*0.2,
          vx:1.2+Math.random()*1.0,  // much slower
          vy:0.3+Math.random()*0.45,
          life:1.0, tail:[], wishShown:false,
        };
      }
      if (!ss.on) return;

      // slow decay
      ss.x+=ss.vx/W()*9;
      ss.y+=ss.vy/H()*9;
      ss.life-=0.008; // slower fade
      ss.tail.unshift({x:ss.x, y:ss.y});
      if(ss.tail.length>28) ss.tail.pop();
      if(ss.life<=0||ss.x>1.12){ss.on=false; return;}

      // Show "Make a wish" text when star appears and is near peak brightness
      if (!ss.wishShown && ss.life<0.88) {
        ss.wishShown=true;
        // signal React layer via a custom event
        window.dispatchEvent(new CustomEvent('benchWish'));
      }

      // Draw tail — long, tapering, sparkly
      for(let i=1;i<ss.tail.length;i++){
        const t1=ss.tail[i-1], t2=ss.tail[i];
        const progress=1-i/ss.tail.length;
        const al=progress*ss.life*0.9;
        const lw=progress*2.8;
        ctx.strokeStyle=`rgba(255,255,230,${al})`; ctx.lineWidth=lw;
        ctx.beginPath(); ctx.moveTo(t1.x*W(),t1.y*H()); ctx.lineTo(t2.x*W(),t2.y*H()); ctx.stroke();
      }
      // Head sparkle
      const hg=ctx.createRadialGradient(ss.x*W(),ss.y*H(),0,ss.x*W(),ss.y*H(),clamp(W()*0.012,6,14));
      hg.addColorStop(0,`rgba(255,255,255,${ss.life*0.95})`);
      hg.addColorStop(0.3,`rgba(255,240,180,${ss.life*0.5})`);
      hg.addColorStop(1,'rgba(255,240,180,0)');
      ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(ss.x*W(),ss.y*H(),clamp(W()*0.012,6,14),0,Math.PI*2); ctx.fill();
    };

    // ── DRAW: Ground ──────────────────────────────────────────────────
    const drawGround = (ctx) => {
      const gY=H()*0.72;
      ctx.fillStyle='#060d06'; ctx.fillRect(0,gY,W(),H()*0.28);
      const gg=ctx.createLinearGradient(0,gY,0,H());
      gg.addColorStop(0,'rgba(14,28,14,0.5)'); gg.addColorStop(1,'rgba(0,0,0,0.7)');
      ctx.fillStyle=gg; ctx.fillRect(0,gY,W(),H()*0.28);
    };

    // ── DRAW: Waves ───────────────────────────────────────────────────
    const drawWaves = (ctx, time) => {
      if(waveOp<0.01) return;
      const baseY=H()*0.705;
      for(let i=0;i<4;i++){
        const al=waveOp*(0.32-i*0.06); if(al<0.01) continue;
        ctx.strokeStyle=`rgba(90,150,190,${al})`; ctx.lineWidth=1.4-i*0.22;
        ctx.beginPath();
        for(let x=0;x<=W();x+=3){
          const y=baseY+i*5+Math.sin((x/W())*Math.PI*8+time*0.0014+i*0.9)*2.5;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    };

    // ── DRAW: Animals — with soft glow ────────────────────────────────
    const drawDog = (ctx, s, leg) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*14,s*6.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*15,s*-3,s*7.5,s*6.5,0.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*21,s*-1,s*4,s*2.8,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*17,s*-8.8,s*2.8,s*4.2,-0.3,0,Math.PI*2); ctx.fill();
      ctx.lineWidth=s*2.8;
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
      ctx.lineWidth=s*2.4;
      ctx.beginPath(); ctx.moveTo(-s*12,0); ctx.bezierCurveTo(-s*20,s*-3,-s*22,s*-10,-s*16,s*-12); ctx.stroke();
      [s*5,-s*5].forEach((lx,i)=>{
        const lp=i===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*5); ctx.lineTo(lx+lp*s*4,s*11); ctx.lineWidth=s*2.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx+s*3,s*5); ctx.lineTo(lx+s*3+lp*s*3.5,s*11); ctx.stroke();
      });
    };
    const drawCow = (ctx, s, leg) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*22,s*11,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*23,s*-3.5,s*10.5,s*9,0.1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*32,s*-1.5,s*5,s*3.5,0,0,Math.PI*2); ctx.fill();
      ctx.lineWidth=s*1.8;
      ctx.beginPath(); ctx.moveTo(s*20,s*-11.5); ctx.quadraticCurveTo(s*18,s*-18,s*21,s*-17.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*26,s*-11); ctx.quadraticCurveTo(s*28,s*-17.5,s*25,s*-17); ctx.stroke();
      [s*13,s*4.5,-s*4.5,-s*13].forEach((lx,i)=>{
        const lp=i%2===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*10); ctx.lineTo(lx+lp*s*4,s*22); ctx.lineWidth=s*3.8; ctx.stroke();
      });
      ctx.beginPath(); ctx.moveTo(-s*22,s*-1.5); ctx.quadraticCurveTo(-s*28,s*2,-s*26,s*7); ctx.lineWidth=s*2; ctx.stroke();
    };
    const drawHorse = (ctx, s, leg) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*25,s*11,-0.05,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*17,s*-7); ctx.quadraticCurveTo(s*24,s*-16,s*21,s*-3); ctx.quadraticCurveTo(s*28,s*-4,s*17,s*-7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*26.5,s*-15.5,s*7.5,s*5.5,0.5,0,Math.PI*2); ctx.fill();
      ctx.lineWidth=s*1.6;
      for(let i=0;i<5;i++){
        ctx.beginPath(); ctx.moveTo(s*(15-i),s*(-5.5-i)); ctx.quadraticCurveTo(s*(13-i),s*(-10-i*0.5),s*(15.5-i),s*(-12-i*0.4)); ctx.stroke();
      }
      ctx.lineWidth=s*2.8;
      ctx.beginPath(); ctx.moveTo(-s*25,s*-2); ctx.quadraticCurveTo(-s*33,s*1,-s*31,s*9); ctx.stroke();
      [s*14,s*5,-s*5,-s*14].forEach((lx,i)=>{
        const lp=i%2===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*9.5); ctx.lineTo(lx+lp*s*5.5,s*18); ctx.lineWidth=s*3.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx+lp*s*5.5,s*18); ctx.lineTo(lx+lp*s*3.5,s*26); ctx.lineWidth=s*2.8; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(lx+lp*s*3.5,s*26.5,s*2.5,s*1.3,0,0,Math.PI*2); ctx.fill();
      });
    };

    const drawAnimal = (ctx, a, time) => {
      a.x+=a.dir*a.spd; a.wp+=0.055;
      const ax=a.x*W(), ay=a.y*H();
      const bob=Math.sin(a.wp)*1.4*a.sz, leg=Math.sin(a.wp)*0.25;
      const glowBase=animalGlowCols[a.type]||'rgba(255,220,150';

      ctx.save();
      ctx.translate(ax,ay+bob*0.3);

      // ── Soft glow under animal ──
      // Glow is a radial gradient on the ground beneath them
      const glowR=clamp(a.sz*W()*0.055,18,55);
      const groundGlow=ctx.createRadialGradient(0,a.sz*12,0,0,a.sz*12,glowR*2.2);
      groundGlow.addColorStop(0,`${glowBase},0.18)`);
      groundGlow.addColorStop(0.5,`${glowBase},0.07)`);
      groundGlow.addColorStop(1,`${glowBase},0)`);
      ctx.fillStyle=groundGlow;
      ctx.beginPath(); ctx.ellipse(0,a.sz*12,glowR*2.2,glowR*0.7,0,0,Math.PI*2); ctx.fill();

      if(a.dir<0) ctx.scale(-1,1);
      const s=a.sz;
      const bodyCol='rgba(38,30,20,0.92)';
      ctx.fillStyle=bodyCol; ctx.strokeStyle=bodyCol;
      switch(a.type){
        case 'dog':   drawDog(ctx,s,leg);   break;
        case 'cat':   drawCat(ctx,s,leg);   break;
        case 'cow':   drawCow(ctx,s,leg);   break;
        case 'horse': drawHorse(ctx,s,leg); break;
      }

      // Subtle edge highlight — a thin lighter rim on top of body
      ctx.save();
      ctx.globalCompositeOperation='source-atop';
      const rimG=ctx.createLinearGradient(0,-s*28,0,s*5);
      rimG.addColorStop(0,`${glowBase},0.22)`);
      rimG.addColorStop(0.4,`${glowBase},0.06)`);
      rimG.addColorStop(1,`${glowBase},0)`);
      ctx.fillStyle=rimG;
      // approximate body bounding fill for the rim effect
      ctx.beginPath(); ctx.ellipse(s*8,-s*4,s*32,s*16,0,0,Math.PI*2); ctx.fill();
      ctx.restore();

      ctx.restore();
      if(a.x>1.2||a.x<-0.2) a.alive=false;
    };

    // ── DRAW: Bench ───────────────────────────────────────────────────
    const drawBench = (ctx) => {
      const gY=H()*0.72, cx=W()*0.5;
      const bw=clamp(W()*0.18,80,155), bh=bw*0.42, sY=gY-bh*0.3, lgH=bh*0.9;
      ctx.strokeStyle='rgba(32,20,10,0.92)'; ctx.lineCap='round';
      ctx.lineWidth=clamp(bw*0.044,3,7);
      [[-0.42,-0.18],[0.18,0.42]].forEach(([a,b])=>{
        ctx.beginPath(); ctx.moveTo(cx+a*bw,sY); ctx.lineTo(cx+a*bw,sY+lgH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+b*bw,sY); ctx.lineTo(cx+b*bw,sY+lgH); ctx.stroke();
      });
      ctx.beginPath(); ctx.moveTo(cx-bw*0.42,sY+lgH*0.55); ctx.lineTo(cx+bw*0.42,sY+lgH*0.55); ctx.stroke();
      const ph=clamp(bh*0.13,5,11);
      for(let i=0;i<3;i++){
        ctx.lineWidth=ph; ctx.strokeStyle=`rgba(32,20,10,${0.85-i*0.08})`;
        ctx.beginPath(); ctx.moveTo(cx-bw*0.48,sY-i*ph*0.35); ctx.lineTo(cx+bw*0.48,sY-i*ph*0.35); ctx.stroke();
      }
      ctx.lineWidth=clamp(ph*0.78,3,9);
      const bkY=sY-bh*0.55;
      for(let i=0;i<2;i++){
        ctx.strokeStyle=`rgba(32,20,10,${0.82-i*0.1})`;
        ctx.beginPath(); ctx.moveTo(cx-bw*0.44,bkY-i*ph*0.45); ctx.lineTo(cx+bw*0.44,bkY-i*ph*0.45); ctx.stroke();
      }
      ctx.lineWidth=clamp(bw*0.038,2.5,6); ctx.strokeStyle='rgba(32,20,10,0.88)';
      [-0.38,0.38].forEach(bx=>{
        ctx.beginPath(); ctx.moveTo(cx+bx*bw,sY); ctx.lineTo(cx+bx*bw,bkY-ph); ctx.stroke();
      });
    };

    // ── MAIN LOOP ─────────────────────────────────────────────────────
    const render = (time) => {
      const ctx=canvas.getContext('2d');
      ctx.clearRect(0,0,W(),H());

      // Scene advance — slower transitions
      scTime++;
      const dur=SCENES[scIdx].dur*60;
      if(nextIdx<0&&scTime>dur-BLEND_DUR){
        do{nextIdx=Math.floor(Math.random()*SCENES.length);}while(nextIdx===scIdx);
        blend=0;
      }
      if(nextIdx>=0){
        blend=clamp(blend+1/BLEND_DUR,0,1);
        if(blend>=1){scIdx=nextIdx;nextIdx=-1;blend=0;scTime=0;}
      }

      // Moon drift
      moonX-=0.000010;
      if(moonX<-0.04) moonX=1.04;

      // Bird spawn
      const sv=SCENES[scIdx].stars;
      const totalB=flocks.reduce((s,f)=>s+f.birds.length,0);
      if(totalB<12&&Math.random()<0.001&&sv<0.55) flocks.push(spawnFlock());

      // Animal spawn
      animalTimer++;
      if(animalTimer>ANIMAL_GAP&&animals.filter(a=>a.alive).length<2){spawnAnimal();animalTimer=0;}
      for(let i=animals.length-1;i>=0;i--) if(!animals[i].alive) animals.splice(i,1);

      // Waves
      waveTimer++;
      if(waveTimer>WAVE_GAP&&!waveOn){waveOn=true;waveTimer=0;}
      if(waveOn){waveOp=Math.min(waveOp+0.004,0.5); if(waveOp>=0.5) setTimeout(()=>{waveOn=false;},8000);}
      else{waveOp=Math.max(waveOp-0.003,0);}

      // Draw in correct order
      drawSky(ctx, time);
      drawNebula(ctx, time);
      drawStars(ctx, time);
      drawConstellations(ctx, time);
      drawAurora(ctx, time);
      drawMoon(ctx);
      drawShootingStar(ctx, time);
      drawSnowMountain(ctx);
      drawGround(ctx);
      drawWaves(ctx, time);
      trees.forEach(t=>drawTree(ctx,t,time));
      animals.forEach(a=>drawAnimal(ctx,a,time));
      drawBirds(ctx, sv);
      drawBench(ctx);

      animRef.current=requestAnimationFrame(render);
    };

    animRef.current=requestAnimationFrame(render);
    return ()=>{window.removeEventListener('resize',resize);cancelAnimationFrame(animRef.current);};
  }, []);

  // Listen for shooting star wish event
  useEffect(() => {
    const handler = () => {
      setMakeWish(true);
      setTimeout(()=>setMakeWish(false), 4200);
    };
    window.addEventListener('benchWish', handler);
    return ()=>window.removeEventListener('benchWish', handler);
  }, []);

  const hi = lang==='Hindi';

  return (
    <div style={{position:'fixed',inset:0,zIndex:50,background:'#000',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block'}}/>

      {/* Make a wish overlay */}
      {makeWish && (
        <div style={{
          position:'absolute', top:'18%', left:0, right:0,
          textAlign:'center', zIndex:20, pointerEvents:'none',
          animation:'wishFade 4.2s ease forwards',
        }}>
          <style>{`
            @keyframes wishFade {
              0%   { opacity:0; transform:translateY(8px) scale(0.96); }
              15%  { opacity:1; transform:translateY(0) scale(1); }
              70%  { opacity:1; }
              100% { opacity:0; transform:translateY(-6px); }
            }
          `}</style>
          <p style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:'clamp(22px,5.5vw,34px)',
            color:'rgba(255,248,210,0.96)',
            fontStyle:'italic',
            fontWeight:300,
            letterSpacing:'0.04em',
            textShadow:'0 0 30px rgba(255,220,80,0.6), 0 2px 20px rgba(0,0,0,0.9)',
            margin:0,
          }}>
            {hi?'✨ मन में एक इच्छा करें…':'✨ make a wish…'}
          </p>
        </div>
      )}

      {/* Back */}
      <button onClick={()=>{killAudio();if(goBack)goBack();else setTab('home');}}
        style={{position:'absolute',top:16,left:16,zIndex:10,background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:99,color:'#fff',padding:'7px 16px',fontSize:13,cursor:'pointer',backdropFilter:'blur(4px)'}}>
        ← {hi?'वापस':'Back'}
      </button>

      {/* Home */}
      <button onClick={()=>{killAudio();setTab('home');}}
        style={{position:'absolute',top:16,right:16,zIndex:10,background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:99,padding:'7px 14px',fontSize:16,cursor:'pointer',backdropFilter:'blur(4px)'}}>
        🏠
      </button>

      {/* Sound buttons */}
      <div style={{position:'absolute',top:62,left:0,right:0,zIndex:10,display:'flex',justifyContent:'center',flexWrap:'wrap',gap:6,padding:'0 10px'}}>
        {[
          {key:'birds.mp3', icon:'🐦',en:'Birds', hi:'पक्षी'},
          {key:'wind.mp3',  icon:'💨',en:'Wind',  hi:'हवा'},
          {key:'forest.mp3',icon:'🌲',en:'Forest',hi:'जंगल'},
          {key:'flute.mp3', icon:'🪈',en:'Flute', hi:'बांसुरी'},
          {key:'waves.mp3', icon:'🌊',en:'Waves', hi:'लहरें'},
        ].map(s=>(
          <button key={s.key} onClick={()=>playBenchSound(s.key)} style={{
            background:activeSound===s.key?'rgba(255,255,255,0.22)':'rgba(0,0,0,0.5)',
            border:`1px solid ${activeSound===s.key?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.14)'}`,
            borderRadius:99,color:'#fff',padding:'7px 12px',
            display:'flex',alignItems:'center',gap:5,fontSize:12,cursor:'pointer',
            transition:'all 0.2s',backdropFilter:'blur(5px)',
          }}>
            <span>{s.icon}</span>
            <span style={{display:typeof window!=='undefined'&&window.innerWidth<390?'none':'inline'}}>{hi?s.hi:s.en}</span>
          </button>
        ))}
      </div>

      {/* Quote */}
      <div style={{
        position:'absolute',top:'clamp(118px,21%,195px)',
        left:0,right:0,textAlign:'center',
        padding:'0 clamp(14px,5vw,44px)',
        zIndex:10,pointerEvents:'none',
      }}>
        <div style={{opacity:quoteVisible?1:0,transition:'opacity 0.9s ease',maxWidth:370,margin:'0 auto'}}>
          {PARK_BENCH_QUOTES?.[quoteIdx]&&(
            <p style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:'clamp(15px,4.2vw,23px)',
              color:'rgba(255,252,238,0.92)',
              fontStyle:'italic',lineHeight:1.7,
              textShadow:'0 2px 18px rgba(0,0,0,0.95),0 0 40px rgba(0,0,0,0.6)',
              margin:'0 0 16px',
            }}>
              "{PARK_BENCH_QUOTES[quoteIdx]}"
            </p>
          )}
          <div style={{pointerEvents:'auto',display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>{
              setQuoteVisible(false);
              setTimeout(()=>{
                setQuoteIdx(p=>{let n;do{n=Math.floor(Math.random()*PARK_BENCH_QUOTES.length);}while(n===p);return n;});
                setQuoteVisible(true);
              },600);
            }} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:99,color:'rgba(255,255,255,0.85)',padding:'7px 20px',fontSize:11,cursor:'pointer',backdropFilter:'blur(4px)',letterSpacing:'0.04em'}}>
              {hi?'थोड़ा और बैठें':'sit a little longer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bench;
