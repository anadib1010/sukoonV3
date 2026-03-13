import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PARK_BENCH_QUOTES } from '../../utils/content';
import { AUDIO_URLS } from '../../utils/constants';

const ANIMAL_TYPES = ['dog', 'cat', 'cow', 'horse'];

// Sky scenes — each is a complete sky state
const SCENES = [
  { id:'night',    dur:50, sky0:'#01020a', sky1:'#030d08', stars:1.0, moon:0.95, aurora:0,   glow:0,   glowR:255, glowG:80,  glowB:0  },
  { id:'aurora',   dur:55, sky0:'#010612', sky1:'#010c10', stars:0.7, moon:0.55, aurora:1.0, glow:0,   glowR:0,   glowG:200, glowB:120 },
  { id:'mountain', dur:45, sky0:'#010410', sky1:'#02060e', stars:0.85,moon:0.9,  aurora:0,   glow:0,   glowR:100, glowG:150, glowB:255, snow:true },
  { id:'predawn',  dur:40, sky0:'#0a0515', sky1:'#1a0820', stars:0.3, moon:0.2,  aurora:0,   glow:0.25,glowR:180, glowG:60,  glowB:120 },
  { id:'pinkdawn', dur:40, sky0:'#1a0820', sky1:'#4a1535', stars:0.1, moon:0,    aurora:0,   glow:0.7, glowR:255, glowG:80,  glowB:140 },
  { id:'sunrise',  dur:40, sky0:'#1a0a02', sky1:'#5a2008', stars:0,   moon:0,    aurora:0,   glow:1.0, glowR:255, glowG:100, glowB:10  },
];

function lerpN(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// parse '#rrggbb' safely
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

  const [quoteIdx,    setQuoteIdx]    = useState(() => PARK_BENCH_QUOTES?.length ? Math.floor(Math.random()*PARK_BENCH_QUOTES.length) : 0);
  const [quoteVisible,setQuoteVisible]= useState(true);
  const [activeSound, setActiveSound] = useState(null);

  // ── Audio ──────────────────────────────────────────────────────────
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

  // ── Quote cycle ─────────────────────────────────────────────────────
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

  // ── Cleanup ─────────────────────────────────────────────────────────
  useEffect(() => { return () => { killAudio(); cancelAnimationFrame(animRef.current); }; }, [killAudio]);

  // ── CANVAS ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Stars
    const stars = Array.from({length:180}, () => ({
      x: Math.random(), y: Math.random()*0.68,
      r: 0.4+Math.random()*1.4,
      twOff: Math.random()*Math.PI*2,
      twSpd: 0.0008+Math.random()*0.0015,
      op: 0.4+Math.random()*0.6,
    }));

    // Trees
    const trees = [
      { x:0.05, h:0.58, tw:13, layers:5, so:0,   ss:0.00085, sa:0.028, c1:'#1e2e1e', c2:'#2d4a2d' },
      { x:0.14, h:0.46, tw:9,  layers:4, so:1.2, ss:0.0011,  sa:0.022, c1:'#243824', c2:'#3a5a3a' },
      { x:0.22, h:0.38, tw:7,  layers:3, so:2.4, ss:0.0013,  sa:0.018, c1:'#263826', c2:'#4a6a4a' },
      { x:0.76, h:0.42, tw:8,  layers:3, so:0.6, ss:0.0010,  sa:0.020, c1:'#1e2e1e', c2:'#2d4a2d' },
      { x:0.84, h:0.54, tw:12, layers:5, so:1.8, ss:0.00088, sa:0.026, c1:'#243824', c2:'#3a5a3a' },
      { x:0.91, h:0.62, tw:15, layers:5, so:3.1, ss:0.00075, sa:0.030, c1:'#1e2e1e', c2:'#2d4a2d' },
      { x:0.97, h:0.40, tw:7,  layers:3, so:0.9, ss:0.0014,  sa:0.016, c1:'#263826', c2:'#4a6a4a' },
    ];

    // Aurora bands
    const aurora = Array.from({length:5}, (_,i) => ({
      off: i*(Math.PI*2/5),
      spd: 0.0003+i*0.00015,
      hue: 120+i*28,
      y: 0.08+i*0.055,
      amp: 0.025+i*0.01,
      w: 0.55+i*0.08,
    }));

    // Shooting star
    let ss = { on:false, x:0, y:0, vx:0, vy:0, life:0, tail:[] };

    // Moon
    let moonX = 0.82;

    // Birds
    const flocks = [];
    const spawnFlock = () => {
      const n = 2+Math.floor(Math.random()*5);
      const dir = Math.random()>0.5?1:-1;
      const sx  = dir>0?-0.08:1.08;
      const by  = 0.14+Math.random()*0.26;
      return {
        dir, spd: 0.00018+Math.random()*0.00018, alive:true,
        birds: Array.from({length:n},()=>({
          x: sx+(Math.random()-0.5)*0.06,
          y: by+(Math.random()-0.5)*0.05,
          wp: Math.random()*Math.PI*2,
          ws: 0.035+Math.random()*0.025,
          sz: 2.5+Math.random()*2,
        })),
      };
    };

    // Animals
    const animals = [];
    let animalTimer = 0;
    const ANIMAL_GAP = 1600+Math.random()*2400;
    const animalSizes = { horse:1.8, cow:1.6, dog:1.0, cat:0.85 };
    const spawnAnimal = () => {
      const type = ANIMAL_TYPES[Math.floor(Math.random()*4)];
      const dir  = Math.random()>0.5?1:-1;
      animals.push({ type, x:dir>0?-0.12:1.12, y:0.755+Math.random()*0.04,
        dir, spd:0.00016+Math.random()*0.00014,
        wp:0, sz:animalSizes[type]||1, alive:true });
    };

    // Waves
    let waveOp = 0, waveOn = false, waveTimer = 0;
    const WAVE_GAP = 2000+Math.random()*3000;

    // Scene state
    let scIdx  = 0;
    let scTime = 0;
    let blend  = 0;  // 0→1 into next scene
    let nextIdx = -1;
    const BLEND_DUR = 200;

    // ── Draw helpers ──────────────────────────────────────────────────

    const drawSky = (ctx, t) => {
      const sc  = SCENES[scIdx];
      const nsc = nextIdx >= 0 ? SCENES[nextIdx] : null;
      const s0  = nsc ? lerpHex(sc.sky0, nsc.sky0, blend) : sc.sky0;
      const s1  = nsc ? lerpHex(sc.sky1, nsc.sky1, blend) : sc.sky1;
      const g   = ctx.createLinearGradient(0, 0, 0, H()*0.72);
      g.addColorStop(0, s0);
      g.addColorStop(1, s1);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W(), H()*0.72);

      // Horizon glow
      const sc2  = nsc || sc;
      const glowAmt = nsc ? lerpN(sc.glow, nsc.glow, blend) : sc.glow;
      const gR   = nsc ? Math.round(lerpN(sc.glowR, nsc.glowR, blend)) : sc.glowR;
      const gG   = nsc ? Math.round(lerpN(sc.glowG, nsc.glowG, blend)) : sc.glowG;
      const gB   = nsc ? Math.round(lerpN(sc.glowB, nsc.glowB, blend)) : sc.glowB;
      if (glowAmt > 0.02) {
        const hy = H()*0.71;
        const rg = ctx.createRadialGradient(W()*0.5, hy, 0, W()*0.5, hy, W()*0.55);
        rg.addColorStop(0, `rgba(${gR},${gG},${gB},${glowAmt*0.5})`);
        rg.addColorStop(0.5,`rgba(${gR},${gG},${gB},${glowAmt*0.15})`);
        rg.addColorStop(1, `rgba(${gR},${gG},${gB},0)`);
        ctx.fillStyle = rg;
        ctx.fillRect(0, hy-H()*0.3, W(), H()*0.32);
      }
    };

    const drawStars = (ctx, time) => {
      const sc   = SCENES[scIdx];
      const nsc  = nextIdx >= 0 ? SCENES[nextIdx] : null;
      const vis  = nsc ? lerpN(sc.stars, nsc.stars, blend) : sc.stars;
      if (vis < 0.02) return;
      stars.forEach(s => {
        const tw = 0.55+0.45*Math.sin(time*s.twSpd+s.twOff);
        ctx.beginPath();
        ctx.arc(s.x*W(), s.y*H(), s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,245,${s.op*tw*vis})`;
        ctx.fill();
      });
    };

    const drawMoon = (ctx, time) => {
      const sc  = SCENES[scIdx];
      const nsc = nextIdx >= 0 ? SCENES[nextIdx] : null;
      const op  = nsc ? lerpN(sc.moon, nsc.moon, blend) : sc.moon;
      if (op < 0.02) return;
      const mx = moonX*W();
      const my = H()*(0.10+(1-moonX)*0.10);
      const r  = clamp(W()*0.018, 10, 22);
      // glow
      const mg = ctx.createRadialGradient(mx, my, r*0.5, mx, my, r*4);
      mg.addColorStop(0, `rgba(255,252,220,${op*0.22})`);
      mg.addColorStop(1, 'rgba(255,252,220,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, r*4, 0, Math.PI*2); ctx.fill();
      // disk
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,252,232,${op})`; ctx.fill();
      // crescent shadow
      ctx.beginPath(); ctx.arc(mx+r*0.32, my-r*0.1, r*0.82, 0, Math.PI*2);
      ctx.fillStyle = `rgba(2,4,14,${op*0.88})`; ctx.fill();
    };

    const drawAurora = (ctx, time) => {
      const sc  = SCENES[scIdx];
      const nsc = nextIdx >= 0 ? SCENES[nextIdx] : null;
      const vis = nsc ? lerpN(sc.aurora, nsc.aurora, blend) : sc.aurora;
      if (vis < 0.02) return;
      aurora.forEach(b => {
        const phase = time*b.spd+b.off;
        const cy  = b.y*H();
        const amp = b.amp*H();
        const bw  = b.w*W();
        const sx  = (W()-bw)/2;
        const al  = vis*(0.11+0.07*Math.sin(phase*0.7));
        const g   = ctx.createLinearGradient(0, cy-amp*2.5, 0, cy+amp*2.5);
        g.addColorStop(0,   `hsla(${b.hue},88%,55%,0)`);
        g.addColorStop(0.35,`hsla(${b.hue},88%,60%,${al})`);
        g.addColorStop(0.5, `hsla(${b.hue+18},85%,65%,${al*1.4})`);
        g.addColorStop(0.65,`hsla(${b.hue},88%,55%,${al})`);
        g.addColorStop(1,   `hsla(${b.hue},88%,50%,0)`);
        ctx.beginPath();
        const steps = 48;
        for (let i=0;i<=steps;i++) {
          const tt=i/steps;
          const x = sx+tt*bw;
          const y = cy+Math.sin(tt*Math.PI*3+phase)*amp+Math.sin(tt*Math.PI*5+phase*1.3)*amp*0.4;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        for (let i=steps;i>=0;i--) {
          const tt=i/steps;
          const x = sx+tt*bw;
          const y = cy+Math.sin(tt*Math.PI*3+phase)*amp+Math.sin(tt*Math.PI*5+phase*1.3)*amp*0.4+amp*(0.35+0.2*Math.sin(phase));
          ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.fillStyle = g; ctx.fill();
      });
    };

    const drawSnowMountain = (ctx) => {
      const sc  = SCENES[scIdx];
      const nsc = nextIdx >= 0 ? SCENES[nextIdx] : null;
      const showCurr = sc.snow || false;
      const showNext = nsc?.snow || false;
      const opacity  = showCurr ? (showNext ? 1 : clamp(1-blend*1.5,0,1)) : (showNext ? clamp(blend*1.5,0,1) : 0);
      if (opacity < 0.02) return;
      const gY = H()*0.72;
      ctx.save(); ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(0, gY);
      ctx.lineTo(W()*0.15, gY);
      ctx.lineTo(W()*0.28, gY*0.53);
      ctx.lineTo(W()*0.36, gY*0.63);
      ctx.lineTo(W()*0.42, gY*0.41);
      ctx.lineTo(W()*0.50, gY*0.59);
      ctx.lineTo(W()*0.58, gY*0.47);
      ctx.lineTo(W()*0.66, gY*0.62);
      ctx.lineTo(W()*0.78, gY);
      ctx.lineTo(W(), gY);
      ctx.fillStyle = '#0c1812'; ctx.fill();
      // snow caps
      [[W()*0.28,gY*0.53,W()*0.055],[W()*0.42,gY*0.41,W()*0.065],[W()*0.58,gY*0.47,W()*0.052]].forEach(([px,py,pr])=>{
        const sg = ctx.createRadialGradient(px,py,0,px,py,pr);
        sg.addColorStop(0,'rgba(225,238,255,0.92)');
        sg.addColorStop(0.5,'rgba(195,215,245,0.5)');
        sg.addColorStop(1,'rgba(180,200,235,0)');
        ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    };

    const drawTree = (ctx, tr, time) => {
      const x = tr.x*W(), gY = H()*0.72;
      const tH = tr.h*H();
      const sway = Math.sin(time*tr.ss+tr.so)*tr.sa;
      const sw2  = Math.sin(time*tr.ss*1.5+tr.so+1)*tr.sa*0.35;
      ctx.save(); ctx.translate(x, gY);
      // trunk
      const tkH = tH*0.22;
      ctx.fillStyle='#100806';
      ctx.beginPath();
      ctx.moveTo(-tr.tw/2,0);
      ctx.quadraticCurveTo(-tr.tw/2+sway*45,-tkH*0.5,-tr.tw/3+sway*95,-tkH);
      ctx.quadraticCurveTo( tr.tw/3+sway*95,-tkH,     tr.tw/2+sway*45,-tkH*0.5);
      ctx.quadraticCurveTo( tr.tw/2,0,-tr.tw/2,0);
      ctx.fill();
      // foliage layers
      for (let i=0;i<tr.layers;i++) {
        const ly   = -tkH-i*tH*0.17;
        const swX  = (sway+sw2*0.5)*(95+i*65);
        const lw   = (tr.tw*5.5)*(1-i*0.16);
        const lh   = tH*0.30*(1-i*0.10);
        const al   = 0.88-i*0.08;
        // dark fill
        ctx.fillStyle=tr.c1+Math.floor(al*0.75*255).toString(16).padStart(2,'0');
        ctx.beginPath();
        ctx.moveTo(swX,ly-lh);
        ctx.bezierCurveTo(swX+lw*0.7,ly-lh*0.4, swX+lw,ly+lh*0.25, swX,ly+lh*0.35);
        ctx.bezierCurveTo(swX-lw,ly+lh*0.25, swX-lw*0.7,ly-lh*0.4, swX,ly-lh);
        ctx.fill();
        // highlight
        ctx.fillStyle=tr.c2+Math.floor(al*0.38*255).toString(16).padStart(2,'0');
        ctx.beginPath();
        ctx.moveTo(swX+lw*0.1,ly-lh*0.88);
        ctx.bezierCurveTo(swX+lw*0.55,ly-lh*0.3, swX+lw*0.62,ly+lh*0.08, swX+lw*0.1,ly+lh*0.18);
        ctx.bezierCurveTo(swX-lw*0.22,ly+lh*0.12,swX-lw*0.12,ly-lh*0.22,swX+lw*0.1,ly-lh*0.88);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawBirds = (ctx, time, starVis) => {
      if (starVis > 0.55) return; // only at lower star visibility
      flocks.forEach(f => {
        f.birds.forEach(b => {
          b.x += f.dir*f.spd;
          b.wp += b.ws;
          const bx=b.x*W(), by=b.y*H();
          const wing=Math.sin(b.wp)*b.sz*1.1;
          ctx.strokeStyle='rgba(35,35,35,0.8)';
          ctx.lineWidth=1.1;
          ctx.beginPath();
          ctx.moveTo(bx,by);
          ctx.quadraticCurveTo(bx-b.sz*1.3,by-wing,bx-b.sz*2.6,by);
          ctx.moveTo(bx,by);
          ctx.quadraticCurveTo(bx+b.sz*1.3,by-wing,bx+b.sz*2.6,by);
          ctx.stroke();
        });
        if (f.birds.every(b=>f.dir>0?b.x>1.15:b.x<-0.15)) f.alive=false;
      });
      for(let i=flocks.length-1;i>=0;i--) if(!flocks[i].alive) flocks.splice(i,1);
    };

    const drawShootingStar = (ctx) => {
      if (!ss.on && Math.random()<0.0006) {
        ss={on:true,x:0.05+Math.random()*0.55,y:0.04+Math.random()*0.22,vx:3+Math.random()*2.5,vy:0.7+Math.random()*0.8,life:1,tail:[]};
      }
      if (!ss.on) return;
      ss.x+=ss.vx/W()*18; ss.y+=ss.vy/H()*18; ss.life-=0.02;
      ss.tail.unshift({x:ss.x,y:ss.y});
      if (ss.tail.length>16) ss.tail.pop();
      if (ss.life<=0||ss.x>1.12){ss.on=false;return;}
      for(let i=1;i<ss.tail.length;i++){
        const t1=ss.tail[i-1],t2=ss.tail[i];
        const al=(1-i/ss.tail.length)*ss.life*0.88;
        ctx.strokeStyle=`rgba(255,255,235,${al})`;
        ctx.lineWidth=(1-i/ss.tail.length)*2.0;
        ctx.beginPath(); ctx.moveTo(t1.x*W(),t1.y*H()); ctx.lineTo(t2.x*W(),t2.y*H()); ctx.stroke();
      }
    };

    const drawGround = (ctx) => {
      const gY=H()*0.72;
      ctx.fillStyle='#060d06';
      ctx.fillRect(0,gY,W(),H()*0.28);
      const gg=ctx.createLinearGradient(0,gY,0,H());
      gg.addColorStop(0,'rgba(14,28,14,0.5)');
      gg.addColorStop(1,'rgba(0,0,0,0.7)');
      ctx.fillStyle=gg; ctx.fillRect(0,gY,W(),H()*0.28);
    };

    const drawWaves = (ctx, time) => {
      if (waveOp<0.01) return;
      const baseY=H()*0.705;
      for(let i=0;i<4;i++){
        const al=waveOp*(0.32-i*0.06);
        if(al<0.01) continue;
        ctx.strokeStyle=`rgba(90,150,190,${al})`;
        ctx.lineWidth=1.4-i*0.22;
        ctx.beginPath();
        for(let x=0;x<=W();x+=3){
          const y=baseY+i*5+Math.sin((x/W())*Math.PI*8+time*0.0014+i*0.9)*2.5;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    };

    // ── Animal drawing ────────────────────────────────────────────────

    const drawDog = (ctx, s, leg) => {
      ctx.fillStyle='rgba(28,22,16,0.88)';
      ctx.beginPath(); ctx.ellipse(0,0,s*14,s*6.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*15,s*-3,s*7.5,s*6.5,0.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*21,s*-1,s*4,s*2.8,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*17,s*-8.8,s*2.8,s*4.2,-0.3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(28,22,16,0.88)'; ctx.lineWidth=s*2.8;
      ctx.beginPath(); ctx.moveTo(-s*14,s*-2); ctx.quadraticCurveTo(-s*22,s*-8,-s*18,s*-13); ctx.stroke();
      [[s*8,leg],[s*3,-leg],[-s*3,leg],[-s*8,-leg]].forEach(([lx,lp])=>{
        ctx.beginPath(); ctx.moveTo(lx,s*5.5); ctx.lineTo(lx+lp*s*5,s*12); ctx.lineWidth=s*3.2; ctx.stroke();
      });
    };

    const drawCat = (ctx, s, leg, wp) => {
      ctx.fillStyle='rgba(28,22,16,0.88)';
      ctx.beginPath(); ctx.ellipse(0,0,s*12,s*5.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*13,s*-3.5,s*6.2,s*5.8,0.15,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*10,s*-8.2); ctx.lineTo(s*12.2,s*-3.5); ctx.lineTo(s*7.8,s*-3.5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*16,s*-7.8); ctx.lineTo(s*17.5,s*-3.5); ctx.lineTo(s*14.2,s*-3.5); ctx.fill();
      ctx.strokeStyle='rgba(28,22,16,0.88)'; ctx.lineWidth=s*2.4;
      ctx.beginPath(); ctx.moveTo(-s*12,0); ctx.bezierCurveTo(-s*20,s*-3,-s*22,s*-10,-s*16,s*-12); ctx.stroke();
      [s*5,-s*5].forEach((lx,i)=>{
        const lp=i===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*5); ctx.lineTo(lx+lp*s*4,s*11); ctx.lineWidth=s*2.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx+s*3,s*5); ctx.lineTo(lx+s*3+lp*s*3.5,s*11); ctx.stroke();
      });
    };

    const drawCow = (ctx, s, leg) => {
      ctx.fillStyle='rgba(28,22,16,0.88)';
      ctx.beginPath(); ctx.ellipse(0,0,s*22,s*11,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*23,s*-3.5,s*10.5,s*9,0.1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*32,s*-1.5,s*5,s*3.5,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(28,22,16,0.88)'; ctx.lineWidth=s*1.8;
      ctx.beginPath(); ctx.moveTo(s*20,s*-11.5); ctx.quadraticCurveTo(s*18,s*-18,s*21,s*-17.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*26,s*-11); ctx.quadraticCurveTo(s*28,s*-17.5,s*25,s*-17); ctx.stroke();
      ctx.fillStyle='rgba(45,25,25,0.7)';
      ctx.beginPath(); ctx.ellipse(-s*3,s*9.5,s*4.5,s*2.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(28,22,16,0.88)';
      [s*13,s*4.5,-s*4.5,-s*13].forEach((lx,i)=>{
        const lp=i%2===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*10); ctx.lineTo(lx+lp*s*4,s*22); ctx.lineWidth=s*3.8; ctx.stroke();
      });
      ctx.beginPath(); ctx.moveTo(-s*22,s*-1.5); ctx.quadraticCurveTo(-s*28,s*2,-s*26,s*7); ctx.lineWidth=s*2; ctx.stroke();
    };

    const drawHorse = (ctx, s, leg) => {
      ctx.fillStyle='rgba(28,22,16,0.88)';
      ctx.beginPath(); ctx.ellipse(0,0,s*25,s*11,-0.05,0,Math.PI*2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s*17,s*-7); ctx.quadraticCurveTo(s*24,s*-16,s*21,s*-3);
      ctx.quadraticCurveTo(s*28,s*-4,s*17,s*-7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*26.5,s*-15.5,s*7.5,s*5.5,0.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(28,22,16,0.88)'; ctx.lineWidth=s*1.6;
      for(let i=0;i<5;i++){
        ctx.beginPath();
        ctx.moveTo(s*(15-i),s*(-5.5-i)); ctx.quadraticCurveTo(s*(13-i),s*(-10-i*0.5),s*(15.5-i),s*(-12-i*0.4)); ctx.stroke();
      }
      ctx.lineWidth=s*2.8;
      ctx.beginPath(); ctx.moveTo(-s*25,s*-2); ctx.quadraticCurveTo(-s*33,s*1,-s*31,s*9); ctx.stroke();
      [s*14,s*5,-s*5,-s*14].forEach((lx,i)=>{
        const lp=i%2===0?leg:-leg;
        ctx.beginPath(); ctx.moveTo(lx,s*9.5); ctx.lineTo(lx+lp*s*5.5,s*18); ctx.lineWidth=s*3.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx+lp*s*5.5,s*18); ctx.lineTo(lx+lp*s*3.5,s*26); ctx.lineWidth=s*2.8; ctx.stroke();
        ctx.fillStyle='rgba(28,22,16,0.88)';
        ctx.beginPath(); ctx.ellipse(lx+lp*s*3.5,s*26.5,s*2.5,s*1.3,0,0,Math.PI*2); ctx.fill();
      });
    };

    const drawAnimal = (ctx, a) => {
      a.x += a.dir*a.spd;
      a.wp += 0.055;
      const ax=a.x*W(), ay=a.y*H();
      const bob=Math.sin(a.wp)*1.4*a.sz;
      const leg=Math.sin(a.wp)*0.25;
      ctx.save();
      ctx.translate(ax, ay+bob*0.3);
      if (a.dir<0) ctx.scale(-1,1);
      const s=a.sz;
      switch(a.type){
        case 'dog':   drawDog(ctx,s,leg);   break;
        case 'cat':   drawCat(ctx,s,leg,a.wp); break;
        case 'cow':   drawCow(ctx,s,leg);   break;
        case 'horse': drawHorse(ctx,s,leg); break;
      }
      ctx.restore();
      if(a.x>1.2||a.x<-0.2) a.alive=false;
    };

    const drawBench = (ctx) => {
      const gY=H()*0.72, cx=W()*0.5;
      const bw=clamp(W()*0.18,80,155);
      const bh=bw*0.42;
      const sY=gY-bh*0.3;
      const lgH=bh*0.9;
      ctx.strokeStyle='rgba(32,20,10,0.92)';
      ctx.lineCap='round';
      // legs
      ctx.lineWidth=clamp(bw*0.044,3,7);
      [[-0.42,-0.18],[0.18,0.42]].forEach(([a,b])=>{
        ctx.beginPath(); ctx.moveTo(cx+a*bw,sY); ctx.lineTo(cx+a*bw,sY+lgH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+b*bw,sY); ctx.lineTo(cx+b*bw,sY+lgH); ctx.stroke();
      });
      // crossbar
      ctx.beginPath(); ctx.moveTo(cx-bw*0.42,sY+lgH*0.55); ctx.lineTo(cx+bw*0.42,sY+lgH*0.55); ctx.stroke();
      // seat planks
      const ph=clamp(bh*0.13,5,11);
      for(let i=0;i<3;i++){
        ctx.lineWidth=ph;
        ctx.strokeStyle=`rgba(32,20,10,${0.85-i*0.08})`;
        ctx.beginPath(); ctx.moveTo(cx-bw*0.48,sY-i*ph*0.35); ctx.lineTo(cx+bw*0.48,sY-i*ph*0.35); ctx.stroke();
      }
      // backrest
      ctx.lineWidth=clamp(ph*0.78,3,9);
      const bkY=sY-bh*0.55;
      for(let i=0;i<2;i++){
        ctx.strokeStyle=`rgba(32,20,10,${0.82-i*0.1})`;
        ctx.beginPath(); ctx.moveTo(cx-bw*0.44,bkY-i*ph*0.45); ctx.lineTo(cx+bw*0.44,bkY-i*ph*0.45); ctx.stroke();
      }
      // back posts
      ctx.lineWidth=clamp(bw*0.038,2.5,6);
      ctx.strokeStyle='rgba(32,20,10,0.88)';
      [-0.38,0.38].forEach(bx=>{
        ctx.beginPath(); ctx.moveTo(cx+bx*bw,sY); ctx.lineTo(cx+bx*bw,bkY-ph); ctx.stroke();
      });
    };

    // ── Main loop ─────────────────────────────────────────────────────
    const render = (time) => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,W(),H());

      // Scene advance
      scTime++;
      const dur = SCENES[scIdx].dur * 60;
      if (nextIdx<0 && scTime > dur-BLEND_DUR) {
        do { nextIdx=Math.floor(Math.random()*SCENES.length); } while(nextIdx===scIdx);
        blend=0;
      }
      if (nextIdx>=0) {
        blend=clamp(blend+1/BLEND_DUR,0,1);
        if(blend>=1){ scIdx=nextIdx; nextIdx=-1; blend=0; scTime=0; }
      }

      // Moon drift
      moonX-=0.000011;
      if(moonX<-0.04) moonX=1.04;

      // Bird spawn
      const totalB=flocks.reduce((s,f)=>s+f.birds.length,0);
      const sv = SCENES[scIdx].stars;
      if(totalB<12 && Math.random()<0.001 && sv<0.55) flocks.push(spawnFlock());

      // Animal spawn
      animalTimer++;
      if(animalTimer>ANIMAL_GAP && animals.filter(a=>a.alive).length<2){
        spawnAnimal(); animalTimer=0;
      }
      for(let i=animals.length-1;i>=0;i--) if(!animals[i].alive) animals.splice(i,1);

      // Waves
      waveTimer++;
      if(waveTimer>WAVE_GAP && !waveOn){ waveOn=true; waveTimer=0; }
      if(waveOn){ waveOp=Math.min(waveOp+0.004,0.5); if(waveOp>=0.5) setTimeout(()=>{waveOn=false;},8000); }
      else { waveOp=Math.max(waveOp-0.003,0); }

      // Draw order
      drawSky(ctx, time);
      drawStars(ctx, time);
      drawAurora(ctx, time);
      drawMoon(ctx, time);
      drawShootingStar(ctx);
      drawSnowMountain(ctx);
      drawGround(ctx);
      drawWaves(ctx, time);
      trees.forEach(t=>drawTree(ctx,t,time));
      animals.forEach(a=>drawAnimal(ctx,a));
      drawBirds(ctx, time, sv);
      drawBench(ctx);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { window.removeEventListener('resize',resize); cancelAnimationFrame(animRef.current); };
  }, []);

  const hi = lang==='Hindi';

  return (
    <div style={{position:'fixed',inset:0,zIndex:50,background:'#000',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block'}}/>

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
        position:'absolute',
        top:'clamp(118px,21%,195px)',
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
              fontStyle:'italic',
              lineHeight:1.7,
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
            <button onClick={()=>{
              const q=PARK_BENCH_QUOTES?.[quoteIdx]||'';
              const txt=`"${q}" — JSukoon\n\nfind your sukoon at sukoon-pro.vercel.app`;
              if(navigator.share) navigator.share({text:txt}).catch(()=>{});
              else navigator.clipboard?.writeText(txt).catch(()=>{});
            }} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:99,color:'rgba(255,255,255,0.65)',padding:'7px 16px',fontSize:11,cursor:'pointer',backdropFilter:'blur(4px)'}}>
              {hi?'शेयर करें':'share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bench;
