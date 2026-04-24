import React, { useState, useEffect, useRef } from 'react';
import { getReflection, getReflectionHindi } from '../../utils/quoteEngine';
import { AUDIO_URLS } from '../../utils/constants';

// Math functions to help us smoothly blend colors and move things
function lerpN(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function hexRGB(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function lerpHex(a, b, t) {
  const [r1,g1,b1] = hexRGB(a), [r2,g2,b2] = hexRGB(b);
  return `rgb(${Math.round(lerpN(r1,r2,t))},${Math.round(lerpN(g1,g2,t))},${Math.round(lerpN(b1,b2,t))})`;
}

// ── PURPLE SKY SCENES ──
const SCENES = [
  { id:'boraNight',  top:'#1a0b2e', bot:'#2d1b4e', stars:1.0, moon:0.9, aurora:0,   glow:0.1, gR:150, gG:100, gB:255 },
  { id:'deepViolet', top:'#0f0518', bot:'#1f0b38', stars:0.9, moon:0.8, aurora:0.4, glow:0,   gR:120, gG:80,  gB:220 },
  { id:'lavender',   top:'#23153c', bot:'#4a2569', stars:0.6, moon:0.5, aurora:0.8, glow:0.3, gR:200, gG:150, gB:255 },
  { id:'starlight',  top:'#120822', bot:'#281142', stars:0.9, moon:1.0, aurora:0.2, glow:0.2, gR:180, gG:120, gB:240 },
];
const SCENE_DUR = 300; 
const BLEND_DUR = 80;  

// ── CONSTELLATIONS ──
const CONSTELLATIONS = [
  { name:'Purple Heart', bx:0.65, by:0.10, bw:0.15, bh:0.18,
    stars:[{x:0.5,y:0.9,r:1.5}, {x:0.1,y:0.4,r:1.2}, {x:0.2,y:0.1,r:1.1}, {x:0.5,y:0.2,r:1.3}, {x:0.8,y:0.1,r:1.1}, {x:0.9,y:0.4,r:1.2}],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]] },
  { name:'Ocean Whale', bx:0.15, by:0.15, bw:0.30, bh:0.20,
    stars:[{x:0.1,y:0.5,r:1.2}, {x:0.3,y:0.3,r:1.4}, {x:0.7,y:0.3,r:1.2}, {x:0.9,y:0.6,r:1.1}, {x:0.8,y:0.8,r:1.1}, {x:0.4,y:0.8,r:1.3}, {x:0.0,y:0.7,r:1.0}],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,5]] },
];

// 🌟 NEW: The Mood Dictionary
// These are the colors and icons for the interactive stars
// 🌟 NEW: The Mood Dictionary
// These are the colors and icons for the interactive stars
const MOODS = {
  peace:    { id: 'peace',    color: '180, 255, 255', icon: '🕊️', en: 'Peace',    hi: 'शांति' },
  sad:      { id: 'sad',      color: '100, 150, 255', icon: '💧', en: 'Sad',      hi: 'उदास' },
  hopeful:  { id: 'hopeful',  color: '150, 255, 180', icon: '🌱', en: 'Hopeful',  hi: 'उम्मीद' },
  dreamy:   { id: 'dreamy',   color: '200, 150, 255', icon: '🌌', en: 'Dreamy',   hi: 'ख्वाब' },
  grateful: { id: 'grateful', color: '255, 200, 150', icon: '🌸', en: 'Grateful', hi: 'आभारी' },
  happy:    { id: 'happy',    color: '255, 230, 100', icon: '✨', en: 'Happy',    hi: 'खुश' },
  tired:    { id: 'tired',    color: '150, 130, 200', icon: '💤', en: 'Tired',    hi: 'थका हुआ' }
};

export function PurpleSanctuary({ T, lang, setTab, goBack }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timeRef   = useRef(0);
  const hi = lang === 'Hindi';

  // 🌟 NEW: State to remember the active mood and the stars users click
  const [activeMood, setActiveMood] = useState('peace');
  // We use useRef for the stars so our fast canvas loop can always see the newest stars without getting confused
  const userStarsRef = useRef([]); 

  // ── YOUR ADVANCED QUOTE ENGINE ──
  const getQuote = () => lang === 'Hindi' ? getReflectionHindi() : getReflection();
  const [currentQuote, setCurrentQuote] = useState(() => getQuote());
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setCurrentQuote(getQuote());
        setQuoteVisible(true);
      }, 800);
    }, 14000);
    return () => clearInterval(t);
  }, [lang]);

  // Audio Engine
  const [activeSound, setActiveSound] = useState(null);
  const audioRef = useRef(null);

  const killAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src=''; audioRef.current=null; }
    setActiveSound(null);
  };

  const playSound = (key) => {
    if (activeSound === key) { killAudio(); return; }
    killAudio();
    const url = AUDIO_URLS[key];
    if (!url) return;
    const a = new Audio(url);
    a.loop = true;
    a.play().catch(() => {});
    audioRef.current = a;
    setActiveSound(key);
  };

  useEffect(() => { return () => { killAudio(); cancelAnimationFrame(animRef.current); }; }, []);

  // 🌟 NEW: The Click Listener for the Sky
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Find exactly where the mouse clicked relative to the screen
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Turn it into a percentage (0.0 to 1.0) so it works on any size phone or computer
    const x = clickX / canvas.width;
    const y = clickY / canvas.height;

    // Only allow placing a star in the sky (the top 85% of the screen)
    if (y < 0.85) {
      userStarsRef.current.push({
        x: x, 
        y: y,
        mood: activeMood, // The mood they selected from the menu
        size: 1.5 + Math.random() * 2.0, // Random star size
        twSpd: 0.002 + Math.random() * 0.003, // Random twinkle speed
        offset: Math.random() * Math.PI * 2 // Random start time for twinkle
      });
    }
  };

  // ── CANVAS DRAWING ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setSize();
    window.addEventListener('resize', setSize);
    const W = () => canvas.width;
    const H = () => canvas.height;

    let scIdx = 0, scTime = 0, nextIdx = -1, blend = 0;

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

    // Background Stars
    const stars = Array.from({length:150}, () => ({
      x: Math.random(), y: Math.random()*0.7,
      r: 0.5+Math.random()*1.5,
      twOff: Math.random()*Math.PI*2,
      twSpd: 0.0005+Math.random()*0.001,
      op: 0.4+Math.random()*0.6,
    }));

    // Floating Music Notes
    const musicNotes = Array.from({length: 12}, () => ({
      x: Math.random(), 
      y: Math.random() * 1.5, 
      speedY: 0.0003 + Math.random() * 0.0005,
      wobbleSpeed: 0.001 + Math.random() * 0.002,
      wobbleOffset: Math.random() * Math.PI * 2,
      char: ['🎵', '🎶', '🎼', '✨', '💜'][Math.floor(Math.random() * 5)],
      size: 14 + Math.random() * 12,
      opacity: 0.2 + Math.random() * 0.4
    }));

    const conOp = CONSTELLATIONS.map(() => 0);
    let moonX = 0.85;

    // Aurora (Purple/Pink tinted)
    const auroraBands = Array.from({length:4}, (_,i) => ({
      off: i*(Math.PI*2/4), spd: 0.0002+i*0.0001, hue: 260+i*20, y: 0.1+i*0.06, amp: 0.03+i*0.01, w: 0.6+i*0.1,
    }));

    // Animals (Bunny, Cat, Bear, Puppy)
    const TYPES = ['bunny','cat','bear','puppy'];
    const SIZES = { bunny:0.7, cat:0.8, bear:1.3, puppy:0.85 };
    const animals = [];
    let animalTimer = 0;
    const ANIMAL_GAP = 2000 + Math.random()*1500;

    const spawnAnimal = () => {
      const type = TYPES[Math.floor(Math.random()*TYPES.length)];
      const dir  = Math.random() > 0.5 ? 1 : -1;
      animals.push({ type, dir, x: dir>0 ? -0.1 : 1.1, y: 0, spd: 0.0001+Math.random()*0.0001, wp: 0, sz: SIZES[type], alive:true });
    };

    // Draw Sky
    const drawSky = (ctx) => {
      const { top, bot } = getCol('top','bot');
      const g = ctx.createLinearGradient(0, 0, 0, H()*0.88);
      g.addColorStop(0, top); g.addColorStop(1, bot);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H()*0.88);
    };

    // Draw Background Stars
    const drawStars = (ctx, time) => {
      const vis = getVal('stars');
      if (vis < 0.02) return;
      stars.forEach(s => {
        const tw = 0.5+0.5*Math.sin(time*s.twSpd+s.twOff);
        ctx.beginPath(); ctx.arc(s.x*W(), s.y*H()*0.88, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(235,215,255,${s.op*tw*vis})`; ctx.fill();
      });
    };

    // 🌟 NEW: Draw the custom user stars!
    const drawUserStars = (ctx, time) => {
      userStarsRef.current.forEach(star => {
        const moodData = MOODS[star.mood];
        // Math magic to make the star pulse gently
        const twinkle = 0.6 + 0.4 * Math.sin(time * star.twSpd + star.offset);
        const cx = star.x * W();
        const cy = star.y * H();

        // Draw the glowing aura around the star
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, star.size * 5);
        glow.addColorStop(0, `rgba(${moodData.color}, ${0.8 * twinkle})`);
        glow.addColorStop(1, `rgba(${moodData.color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath(); 
        ctx.arc(cx, cy, star.size * 5, 0, Math.PI*2); 
        ctx.fill();

        // Draw the solid bright center of the star
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * twinkle})`;
        ctx.beginPath(); 
        ctx.arc(cx, cy, star.size, 0, Math.PI*2); 
        ctx.fill();
      });
    };

    // Draw Moon
    const drawMoon = (ctx) => {
      const op = getVal('moon');
      if (op < 0.02) return;
      const mx = moonX * W(), my = H() * 0.15, r = clamp(W()*0.02, 12, 25);
      const mg = ctx.createRadialGradient(mx, my, r*0.5, mx, my, r*4);
      mg.addColorStop(0, `rgba(216,180,255,${op*0.3})`);
      mg.addColorStop(1, 'rgba(216,180,255,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, r*4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(245,235,255,${op})`; ctx.fill();
      ctx.beginPath(); ctx.arc(mx+r*0.25, my-r*0.15, r*0.85, 0, Math.PI*2);
      ctx.fillStyle = `rgba(26,11,46,${op*0.9})`; ctx.fill();
    };

    // Draw Aurora
    const drawAurora = (ctx, time) => {
      const vis = getVal('aurora');
      if (vis < 0.02) return;
      auroraBands.forEach(b => {
        const phase = time*b.spd + b.off, cy = b.y * H()*0.8, amp = b.amp * H(), bw = b.w * W(), sx = (W()-bw)/2;
        const al = vis*(0.15+0.05*Math.sin(phase*0.8));
        const g = ctx.createLinearGradient(0, cy-amp*3, 0, cy+amp*3);
        g.addColorStop(0, `hsla(${b.hue},70%,65%,0)`);
        g.addColorStop(0.5, `hsla(${b.hue},80%,75%,${al})`);
        g.addColorStop(1, `hsla(${b.hue},70%,65%,0)`);
        ctx.beginPath();
        for (let i=0; i<=40; i++) {
          const tt = i/40, x = sx+tt*bw;
          const y = cy + Math.sin(tt*Math.PI*2+phase)*amp;
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        for (let i=40; i>=0; i--) {
          const tt = i/40, x = sx+tt*bw;
          const y = cy + Math.sin(tt*Math.PI*2+phase)*amp + amp*0.8;
          ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.fillStyle=g; ctx.fill();
      });
    };

    // Draw Constellations
    const drawConstellations = (ctx, time) => {
      const vis = getVal('stars');
      CONSTELLATIONS.forEach((con, ci) => {
        const cycle = 400, off = ci * 200;
        const t = (Math.floor(time / 1000 + off) % cycle);
        const target = (t > 20 && t < 280) ? vis * 0.8 : 0;
        conOp[ci] = lerpN(conOp[ci], target, 0.005);
        const op = conOp[ci];
        if (op < 0.02) return;
        
        const bx = con.bx * W(), by = con.by * H() * 0.8;
        const bw = con.bw * W(), bh = con.bh * H();
        ctx.save();
        ctx.strokeStyle = `rgba(220,180,255,${op * 0.4})`;
        ctx.lineWidth = 1.0;
        con.lines.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(bx + con.stars[a].x * bw, by + con.stars[a].y * bh);
          ctx.lineTo(bx + con.stars[b].x * bw, by + con.stars[b].y * bh);
          ctx.stroke();
        });
        con.stars.forEach(s => {
          const sx = bx + s.x * bw, sy = by + s.y * bh;
          ctx.fillStyle = `rgba(240,220,255,${op})`;
          ctx.beginPath(); ctx.arc(sx, sy, s.r*1.5, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
      });
    };

    // Draw 7 Shadow Dancers
    const drawStageAndDancers = (ctx, time) => {
      const cx = W() * 0.5; 
      const cy = H() * 0.86; 
      
      const stageW = W() * 0.4;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, stageW/2);
      sg.addColorStop(0, 'rgba(155, 89, 182, 0.35)'); 
      sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, stageW/2, H()*0.02, 0, 0, Math.PI*2);
      ctx.fill();

      const spacing = clamp(W() * 0.03, 12, 30); 
      const startX = cx - (spacing * 3); 

      ctx.fillStyle = '#05010a'; 
      ctx.strokeStyle = '#05010a';
      ctx.lineWidth = 2.5;

      for(let i = 0; i < 7; i++) {
        const dx = startX + (i * spacing);
        const bodyBob = Math.sin(time * 0.003 + i) * 3;
        const armBob = Math.cos(time * 0.004 + i) * 4;

        ctx.beginPath(); ctx.arc(dx, cy - 22 + bodyBob, 3.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(dx, cy - 8 + bodyBob, 4, 11, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(dx, cy - 15 + bodyBob); ctx.lineTo(dx - 6, cy - 10 + bodyBob + armBob); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(dx, cy - 15 + bodyBob); ctx.lineTo(dx + 6, cy - 10 + bodyBob - armBob); ctx.stroke();
      }
    };

    // Draw Floating Music Notes
    const drawFloatingNotes = (ctx, time) => {
      ctx.save();
      ctx.textAlign = 'center';
      
      musicNotes.forEach(note => {
        note.y -= note.speedY;
        const wiggleX = Math.sin(time * note.wobbleSpeed + note.wobbleOffset) * 0.02;
        const drawX = (note.x + wiggleX) * W();
        const drawY = note.y * H();

        if (note.y < -0.1) {
          note.y = 1.1; 
          note.x = Math.random(); 
        }

        ctx.font = `${note.size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${note.opacity})`;
        ctx.fillText(note.char, drawX, drawY);
      });
      ctx.restore();
    };

    // Draw Ground
    const drawGround = (ctx) => {
      const gY = H()*0.88;
      const gg = ctx.createLinearGradient(0, gY, 0, H());
      gg.addColorStop(0, '#10061c');
      gg.addColorStop(1, '#05010a');
      ctx.fillStyle = gg; ctx.fillRect(0, gY, W(), H()*0.12);
    };

    // Animal Drawing Logic
    const drawBunny = (ctx, s) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*10,s*7,0,0,Math.PI*2); ctx.fill(); 
      ctx.beginPath(); ctx.arc(s*9,s*-4,s*5,0,Math.PI*2); ctx.fill(); 
      ctx.beginPath(); ctx.ellipse(s*7,s*-11,s*2,s*6,0.3,0,Math.PI*2); ctx.fill(); 
      ctx.beginPath(); ctx.ellipse(s*11,s*-10,s*2,s*6,-0.1,0,Math.PI*2); ctx.fill(); 
      ctx.beginPath(); ctx.arc(-s*9,s*-1,s*3,0,Math.PI*2); ctx.fill(); 
    };

    const drawBear = (ctx, s) => {
      ctx.beginPath(); ctx.ellipse(0,0,s*16,s*10,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*14,s*-6,s*7,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*11,s*-12,s*2.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*17,s*-12,s*2.5,0,Math.PI*2); ctx.fill();
    };

    const drawAnimal = (ctx, a) => {
      a.x += a.dir * a.spd; a.wp += 0.06;
      const ax = a.x * W(), ay = H() * 0.88 + a.y;
      const bob = Math.sin(a.wp)*1.5*a.sz;
      ctx.save();
      ctx.translate(ax, ay - 10 + bob);
      if (a.dir < 0) ctx.scale(-1,1);
      ctx.fillStyle = '#0a0312';
      if (a.type === 'bunny') drawBunny(ctx, a.sz);
      else if (a.type === 'bear') drawBear(ctx, a.sz);
      else drawBunny(ctx, a.sz); 
      ctx.restore();
      if (a.x > 1.2 || a.x < -0.2) a.alive = false;
    };

    // Render Loop
    const render = (time) => {
      timeRef.current = time;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W(), H());

      scTime++;
      if (nextIdx < 0 && scTime >= SCENE_DUR - BLEND_DUR) {
        nextIdx = (scIdx + 1) % SCENES.length; blend = 0;
      }
      if (nextIdx >= 0) {
        blend = clamp(blend + 1/BLEND_DUR, 0, 1);
        if (blend >= 1) { scIdx = nextIdx; nextIdx = -1; blend = 0; scTime = 0; }
      }

      moonX -= 0.00002; if (moonX < -0.1) moonX = 1.1;

      animalTimer++;
      if (animalTimer > ANIMAL_GAP && animals.filter(a=>a.alive).length < 2) {
        spawnAnimal(); animalTimer = 0;
      }
      for (let i=animals.length-1; i>=0; i--) if (!animals[i].alive) animals.splice(i,1);

      drawSky(ctx);
      drawStars(ctx, time);
      drawAurora(ctx, time);
      drawConstellations(ctx, time);
      drawMoon(ctx);
      
      // 🌟 NEW: Draw the stars the user clicked!
      drawUserStars(ctx, time);

      drawStageAndDancers(ctx, time);
      drawFloatingNotes(ctx, time);
      
      drawGround(ctx);
      animals.forEach(a => drawAnimal(ctx, a));

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { window.removeEventListener('resize', setSize); cancelAnimationFrame(animRef.current); };
  }, []);

  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const text = `"${currentQuote}"\n\n— Finding comfort in the Purple Sanctuary.`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setShared(true); setTimeout(() => setShared(false), 2500);
      }
    } catch {}
  };

  // ── SOUNDS SETUP ──
  const SOUNDS = [
    { key:'flute.mp3',  icon:'🪈', en:'Bamboo Flute', hiL:'बांसुरी' },
    { key:'birds.mp3',  icon:'🐦', en:'Birds',        hiL:'पक्षी' },
    { key:'forest.mp3', icon:'🌲', en:'Forest',       hiL:'जंगल' },
    { key:'wind.mp3',   icon:'💨', en:'Wind',         hiL:'हवा' },
    { key:'waves.mp3',  icon:'💦', en:'Waves',        hiL:'लहरें' },
  ];

  // ── DYNAMIC STYLES USING 'T' ──
  const s = {
    page:      { position:'fixed', inset:0, zIndex:50, backgroundColor: T?.bg || '#1a0b2e', overflow:'hidden' },
    canvas:    { position:'absolute', inset:0, width:'100%', height:'100%', display:'block', cursor:'crosshair' }, // Added crosshair so they know they can click!
    backBtn:   { position:'absolute', top:16, left:16, zIndex:10, backgroundColor: T?.cardBg || 'rgba(255,255,255,0.1)', border:`1px solid ${T?.border || 'rgba(255,255,255,0.2)'}`, borderRadius:99, color: T?.text || '#fff', padding:'8px 16px', fontSize:13, cursor:'pointer' },
    
    // 🌟 NEW: Styles for our Mood Toolbar
    moodBarWrap: { position:'absolute', top:16, right:16, zIndex:10, display:'flex', gap:'8px', background: T?.cardBg || 'rgba(0,0,0,0.3)', padding:'6px', borderRadius:'99px', border:`1px solid ${T?.border || 'rgba(255,255,255,0.1)'}`, backdropFilter:'blur(8px)' },
    moodBtn: (isActive, moodColor) => ({
      background: isActive ? `rgba(${moodColor}, 0.3)` : 'transparent',
      border: `1px solid ${isActive ? `rgba(${moodColor}, 0.8)` : 'transparent'}`,
      borderRadius: '99px',
      padding: '6px 12px',
      color: '#fff',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s ease'
    }),

    quoteWrap: { position:'absolute', top:'35%', left:0, right:0, textAlign:'center', padding:'0 24px', zIndex:10, pointerEvents:'none' },
    quoteFade: { opacity:quoteVisible?1:0, transition:'opacity 0.8s ease', maxWidth:500, margin:'0 auto' },
    quoteText: { fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(18px, 5vw, 28px)', color: T?.text || 'rgba(240,230,255,0.95)', fontStyle:'italic', lineHeight:1.6, textShadow:'0 2px 8px rgba(0,0,0,0.8)', margin:'0 0 20px' },
    sitBtn:    { backgroundColor: T?.accent || '#8a2be2', border:'none', borderRadius:99, color:'#fff', padding:'8px 24px', fontSize:12, cursor:'pointer', pointerEvents:'auto', letterSpacing:'0.05em' },
    shareBtn:  { backgroundColor:'transparent', border:`1px solid ${T?.border || 'rgba(255,255,255,0.3)'}`, borderRadius:99, color: T?.textMuted || 'rgba(255,255,255,0.7)', padding:'6px 18px', fontSize:11, cursor:'pointer', pointerEvents:'auto', marginTop:12 },
    soundBar:  { position:'absolute', bottom:30, left:0, right:0, zIndex:10, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:10, padding:'0 16px' },
    soundBtn: (active) => ({
      backgroundColor: active ? (T?.accent || 'rgba(138,43,226,0.6)') : (T?.cardBg || 'rgba(0,0,0,0.5)'),
      border: `1px solid ${active ? (T?.accent || 'rgba(200,150,255,0.5)') : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 99,
      color: active ? '#fff' : (T?.textMuted || 'rgba(255,255,255,0.6)'),
      padding: '10px 16px',
      display: 'flex', alignItems:'center', gap:8,
      fontSize: 13, cursor:'pointer', backdropFilter:'blur(4px)'
    }),
  };

  return (
    <div style={s.page}>
      {/* 🌟 NEW: Added onClick handler to the canvas */}
      <canvas ref={canvasRef} style={s.canvas} onClick={handleCanvasClick} />

      <button onClick={() => { killAudio(); if(goBack) goBack(); else setTab('home'); }} style={s.backBtn}>
        ← {hi ? 'वापस' : 'Back'}
      </button>

      {/* 🌟 NEW: The Mood Selection Toolbar */}
      <div style={s.moodBarWrap}>
        {Object.values(MOODS).map(mood => (
          <button 
            key={mood.id}
            onClick={() => setActiveMood(mood.id)}
            style={s.moodBtn(activeMood === mood.id, mood.color)}
            title={hi ? mood.hi : mood.en}
          >
            <span>{mood.icon}</span>
            <span style={{ display: window.innerWidth > 600 ? 'inline' : 'none' }}>
              {hi ? mood.hi : mood.en}
            </span>
          </button>
        ))}
      </div>

      <div style={s.quoteWrap}>
        <div style={s.quoteFade}>
          {currentQuote && <p style={s.quoteText}>"{currentQuote}"</p>}
          <button onClick={() => { setQuoteVisible(false); setTimeout(() => { setCurrentQuote(getQuote()); setQuoteVisible(true); }, 600); }} style={s.sitBtn}>
            {hi ? 'यहाँ आराम करें' : 'rest here a while'}
          </button>
          <br />
          <button onClick={handleShare} style={s.shareBtn}>
            {shared ? (hi ? '✓ कॉपी हो गया' : '✓ copied') : (hi ? 'शेयर करें' : 'share this feeling')}
          </button>
        </div>
      </div>

      <div style={s.soundBar}>
        {SOUNDS.map(snd => (
          <button key={snd.key} onClick={() => playSound(snd.key)} style={s.soundBtn(activeSound === snd.key)}>
            <span>{snd.icon}</span>
            <span>{hi ? snd.hiL : snd.en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PurpleSanctuary;