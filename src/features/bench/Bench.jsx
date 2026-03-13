import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PARK_BENCH_QUOTES } from '../../utils/content';
import { AUDIO_URLS } from '../../utils/constants';

// ─── SCENE DEFINITIONS ────────────────────────────────────────────────────────
// Each scene is a sky mood. The engine blends between them over time.
const SCENES = [
  {
    id: 'deep_night',
    name: 'Deep Night',
    duration: 45,           // seconds before transitioning
    sky: ['#01020a', '#030810', '#020508'],
    groundCol: '#060d06',
    starsVisible: 1.0,
    moonOpacity: 0.95,
    auroraVisible: 0,
    sunriseGlow: 0,
    fogOpacity: 0,
    snowMountain: false,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    duration: 50,
    sky: ['#010612', '#020c18', '#010810'],
    groundCol: '#040c08',
    starsVisible: 0.7,
    moonOpacity: 0.6,
    auroraVisible: 1.0,
    sunriseGlow: 0,
    fogOpacity: 0,
    snowMountain: false,
  },
  {
    id: 'snow_mountain',
    name: 'Snow Mountain',
    duration: 40,
    sky: ['#010410', '#02060e', '#010308'],
    groundCol: '#080e0a',
    starsVisible: 0.85,
    moonOpacity: 0.9,
    auroraVisible: 0,
    sunriseGlow: 0,
    fogOpacity: 0.3,
    snowMountain: true,
  },
  {
    id: 'pre_dawn',
    name: 'Pre-Dawn',
    duration: 40,
    sky: ['#0a0515', '#1a0820', '#0d0410'],
    groundCol: '#080608',
    starsVisible: 0.4,
    moonOpacity: 0.3,
    auroraVisible: 0,
    sunriseGlow: 0.2,
    fogOpacity: 0.1,
    snowMountain: false,
  },
  {
    id: 'pink_dawn',
    name: 'Pink Dawn',
    duration: 40,
    sky: ['#1a0820', '#4a1535', '#8b2252'],
    groundCol: '#100a0c',
    starsVisible: 0.15,
    moonOpacity: 0,
    auroraVisible: 0,
    sunriseGlow: 0.6,
    fogOpacity: 0.2,
    snowMountain: false,
    sunriseColor: ['#ff6b9d', '#ff4477', '#cc2255'],
  },
  {
    id: 'orange_sunrise',
    name: 'Orange Sunrise',
    duration: 40,
    sky: ['#1a0a02', '#5a2008', '#c84010'],
    groundCol: '#180c04',
    starsVisible: 0,
    moonOpacity: 0,
    auroraVisible: 0,
    sunriseGlow: 1.0,
    fogOpacity: 0.15,
    snowMountain: false,
    sunriseColor: ['#ff8c00', '#ff4500', '#ff6600'],
  },
];

// Animal types
const ANIMAL_TYPES = ['dog', 'cat', 'cow', 'horse'];

export function Bench({ T, lang, setTab, goBack }) {
  const canvasRef   = useRef(null);
  const animRef     = useRef(null);
  const stateRef    = useRef(null); // mutable scene state, never triggers re-render
  const benchAudioRef = useRef(null);

  const [quoteIdx, setQuoteIdx]       = useState(() =>
    PARK_BENCH_QUOTES?.length ? Math.floor(Math.random() * PARK_BENCH_QUOTES.length) : 0
  );
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [activeSound,  setActiveSound]  = useState(null);
  const [sceneName,    setSceneName]    = useState('Deep Night');

  // ── Audio ──────────────────────────────────────────────────────────────────
  const killAudio = useCallback(() => {
    if (benchAudioRef.current) {
      benchAudioRef.current.pause();
      benchAudioRef.current.src = '';
      benchAudioRef.current = null;
    }
    setActiveSound(null);
  }, []);

  const playBenchSound = useCallback((key) => {
    if (activeSound === key) { killAudio(); return; }
    killAudio();
    if (window.__pageAudio) { window.__pageAudio.pause(); window.__pageAudio.src = ''; window.__pageAudio = null; }
    window.speechSynthesis?.cancel();
    const url = AUDIO_URLS[key];
    if (!url) return;
    const a = new Audio(url);
    a.loop = true;
    a.play().catch(() => {});
    benchAudioRef.current = a;
    setActiveSound(key);
  }, [activeSound, killAudio]);

  // ── Quote cycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!PARK_BENCH_QUOTES?.length) return;
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(p => { let n; do { n = Math.floor(Math.random() * PARK_BENCH_QUOTES.length); } while (n === p); return n; });
        setQuoteVisible(true);
      }, 900);
    }, 13000);
    return () => clearInterval(t);
  }, []);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { killAudio(); cancelAnimationFrame(animRef.current); };
  }, [killAudio]);

  // ── CANVAS ENGINE ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const W = () => canvas.width;
    const H = () => canvas.height;
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      return [r,g,b];
    };
    const lerpColor = (c1, c2, t) => {
      const [r1,g1,b1] = hexToRgb(c1), [r2,g2,b2] = hexToRgb(c2);
      return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`;
    };

    // ── Stars ────────────────────────────────────────────────────────────────
    const NUM_STARS = 160;
    const stars = Array.from({length: NUM_STARS}, () => ({
      x: Math.random(),
      y: Math.random() * 0.68,
      r: 0.4 + Math.random() * 1.4,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.0008 + Math.random() * 0.0015,
      opacity: 0.4 + Math.random() * 0.6,
    }));

    // ── Trees ────────────────────────────────────────────────────────────────
    const trees = [
      { x:0.05, h:0.58, trunkW:13, layers:5, so:0,    ss:0.00085, sa:0.028, col:'#223322', col2:'#2d4a2d' },
      { x:0.14, h:0.46, trunkW:9,  layers:4, so:1.2,  ss:0.0011,  sa:0.022, col:'#2a3d2a', col2:'#3a5a3a' },
      { x:0.22, h:0.38, trunkW:7,  layers:3, so:2.4,  ss:0.0013,  sa:0.018, col:'#2d452d', col2:'#4a6a4a' },
      { x:0.76, h:0.42, trunkW:8,  layers:3, so:0.6,  ss:0.0010,  sa:0.020, col:'#223322', col2:'#2d4a2d' },
      { x:0.84, h:0.54, trunkW:12, layers:5, so:1.8,  ss:0.00088, sa:0.026, col:'#2a3d2a', col2:'#3a5a3a' },
      { x:0.91, h:0.62, trunkW:15, layers:5, so:3.1,  ss:0.00075, sa:0.030, col:'#223322', col2:'#2d4a2d' },
      { x:0.97, h:0.40, trunkW:7,  layers:3, so:0.9,  ss:0.0014,  sa:0.016, col:'#2d452d', col2:'#4a6a4a' },
    ];

    // ── Birds ────────────────────────────────────────────────────────────────
    const MAX_BIRDS = 12;
    const birdFlocks = [];
    const spawnFlock = () => {
      const count = 2 + Math.floor(Math.random() * 5);
      const baseY = 0.12 + Math.random() * 0.28;
      const dir   = Math.random() > 0.5 ? 1 : -1;
      const startX = dir > 0 ? -0.1 : 1.1;
      const speed  = 0.00015 + Math.random() * 0.0002;
      const birds  = Array.from({length: count}, (_, i) => ({
        x: startX + (Math.random() - 0.5) * 0.08,
        y: baseY  + (Math.random() - 0.5) * 0.06,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.04 + Math.random() * 0.03,
        size: 2.5 + Math.random() * 2,
      }));
      return { birds, dir, speed, alive: true };
    };

    // ── Shooting star ─────────────────────────────────────────────────────────
    let sStar = { active:false, x:0, y:0, vx:0, vy:0, life:0, tail:[] };

    // ── Moon ─────────────────────────────────────────────────────────────────
    // Moon drifts from right (~0.82) to left (~0.18) over the session
    // resets after crossing left edge
    let moonX = 0.82;
    const MOON_SPEED = 0.000012; // units per frame at 60fps ≈ right→left in ~12 minutes

    // ── Aurora ────────────────────────────────────────────────────────────────
    const NUM_AURORA = 5;
    const auroraBands = Array.from({length: NUM_AURORA}, (_, i) => ({
      offset: i * (Math.PI * 2 / NUM_AURORA),
      speed: 0.0003 + i * 0.00015,
      hue: 120 + i * 30,   // green → cyan → blue
      y: 0.08 + i * 0.055,
      amplitude: 0.025 + i * 0.01,
      width: 0.6 + i * 0.08,
    }));

    // ── Snow mountain ─────────────────────────────────────────────────────────
    const snowMtnPoints = (() => {
      // A ridge of 3 peaks
      const peaks = [
        { x:0.28, y:0.48 },
        { x:0.42, y:0.38 },
        { x:0.58, y:0.44 },
      ];
      return peaks;
    })();

    // ── Animals ───────────────────────────────────────────────────────────────
    const animals = [];
    let animalTimer = 0;
    const ANIMAL_INTERVAL = 1800 + Math.random() * 2400; // frames between spawns

    const spawnAnimal = () => {
      const type  = ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)];
      const dir   = Math.random() > 0.5 ? 1 : -1;
      const startX = dir > 0 ? -0.15 : 1.15;
      const groundY = 0.74 + Math.random() * 0.06;
      const speed  = 0.00018 + Math.random() * 0.00015;
      animals.push({ type, x: startX, y: groundY, dir, speed, walkPhase: 0, size: getAnimalSize(type), alive: true });
    };

    const getAnimalSize = (type) => {
      switch(type) {
        case 'horse': return 1.8;
        case 'cow':   return 1.6;
        case 'dog':   return 1.0;
        case 'cat':   return 0.85;
        default:      return 1.0;
      }
    };

    // ── Waves (horizon effect) ────────────────────────────────────────────────
    let wavesVisible = false;
    let wavesOpacity = 0;
    let wavesTimer   = 0;
    const WAVE_INTERVAL = 2200 + Math.random() * 3000;

    // ── Scene state machine ───────────────────────────────────────────────────
    let sceneIdx  = 0;
    let sceneTime = 0;       // frames in current scene
    let blendT    = 0;       // 0→1 blend to next scene
    const BLEND_DURATION = 180; // frames for crossfade (~3s)
    let prevScene = SCENES[0];
    let currScene = SCENES[0];
    let nextScene = null;
    let totalFrames = 0;

    stateRef.current = { sceneIdx, sceneName: currScene.name };

    // ── Draw functions ────────────────────────────────────────────────────────

    const drawSky = (ctx, scene, blendFrom, bt, time) => {
      const h = H();
      const w = W();
      const grad = ctx.createLinearGradient(0, 0, 0, h * 0.72);

      if (blendFrom && bt < 1) {
        // Blend colors between scenes
        for (let i = 0; i < 3; i++) {
          const stop = i / 2;
          const colA = blendFrom.sky[Math.min(i, blendFrom.sky.length-1)];
          const colB = scene.sky[Math.min(i, scene.sky.length-1)];
          grad.addColorStop(stop, lerpColor(colA, colB, bt));
        }
      } else {
        scene.sky.forEach((c, i) => grad.addColorStop(i / (scene.sky.length - 1), c));
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h * 0.72);

      // Sunrise / dawn glow on horizon
      const glowAmt = blendFrom ? lerp(blendFrom.sunriseGlow||0, scene.sunriseGlow||0, bt) : scene.sunriseGlow||0;
      if (glowAmt > 0.01) {
        const cols = scene.sunriseColor || ['#ff8c00','#ff4500','#ff6600'];
        const horizonY = h * 0.70;
        const glowGrad = ctx.createRadialGradient(w * 0.5, horizonY, 0, w * 0.5, horizonY, w * 0.55);
        const col0 = cols[0];
        const [r,g,b] = hexToRgb(col0);
        glowGrad.addColorStop(0, `rgba(${r},${g},${b},${glowAmt * 0.55})`);
        glowGrad.addColorStop(0.5, `rgba(${r},${g},${b},${glowAmt * 0.18})`);
        glowGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, horizonY - h*0.28, w, h*0.30);
      }
    };

    const drawStars = (ctx, scene, blendFrom, bt, time) => {
      const vis = blendFrom ? lerp(blendFrom.starsVisible||0, scene.starsVisible||0, bt) : scene.starsVisible||0;
      if (vis < 0.01) return;
      stars.forEach(s => {
        const twinkle = 0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
        const alpha   = s.opacity * twinkle * vis;
        ctx.beginPath();
        ctx.arc(s.x * W(), s.y * H(), s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,245,${alpha})`;
        ctx.fill();
      });
    };

    const drawMoon = (ctx, scene, blendFrom, bt, time) => {
      const opAmt = blendFrom ? lerp(blendFrom.moonOpacity||0, scene.moonOpacity||0, bt) : scene.moonOpacity||0;
      if (opAmt < 0.02) return;
      const mx = moonX * W();
      const my = H() * clamp(0.10 + (1 - moonX) * 0.12, 0.08, 0.25); // arc path
      const r  = clamp(W() * 0.018, 10, 22);

      // Glow
      const moonGlow = ctx.createRadialGradient(mx, my, r*0.5, mx, my, r*3.5);
      moonGlow.addColorStop(0, `rgba(255,252,230,${opAmt*0.25})`);
      moonGlow.addColorStop(1, 'rgba(255,252,230,0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath(); ctx.arc(mx, my, r*3.5, 0, Math.PI*2); ctx.fill();

      // Moon disk
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,252,235,${opAmt})`;
      ctx.fill();

      // Crescent shadow
      ctx.beginPath(); ctx.arc(mx + r*0.3, my - r*0.1, r*0.82, 0, Math.PI*2);
      ctx.fillStyle = `rgba(2,4,12,${opAmt * 0.85})`;
      ctx.fill();
    };

    const drawAurora = (ctx, scene, blendFrom, bt, time) => {
      const vis = blendFrom ? lerp(blendFrom.auroraVisible||0, scene.auroraVisible||0, bt) : scene.auroraVisible||0;
      if (vis < 0.02) return;
      const w = W(), h = H();

      auroraBands.forEach((band, idx) => {
        const phase = time * band.speed + band.offset;
        const centerY = band.y * h;
        const amp     = band.amplitude * h;
        const bandW   = band.width * w;
        const startX  = (w - bandW) / 2;

        const grad = ctx.createLinearGradient(0, centerY - amp*2, 0, centerY + amp*2);
        const alpha = vis * (0.12 + 0.08 * Math.sin(phase * 0.7));
        grad.addColorStop(0,   `hsla(${band.hue},90%,55%,0)`);
        grad.addColorStop(0.3, `hsla(${band.hue},90%,60%,${alpha})`);
        grad.addColorStop(0.5, `hsla(${band.hue+20},85%,65%,${alpha*1.3})`);
        grad.addColorStop(0.7, `hsla(${band.hue},90%,55%,${alpha})`);
        grad.addColorStop(1,   `hsla(${band.hue},90%,50%,0)`);

        ctx.beginPath();
        ctx.moveTo(startX, centerY);
        // Wavy ribbon
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const t2 = i / steps;
          const x  = startX + t2 * bandW;
          const y  = centerY + Math.sin(t2 * Math.PI * 3 + phase) * amp
                             + Math.sin(t2 * Math.PI * 5 + phase * 1.3) * amp * 0.4;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const t2 = i / steps;
          const x  = startX + t2 * bandW;
          const y  = centerY + Math.sin(t2 * Math.PI * 3 + phase) * amp
                             + Math.sin(t2 * Math.PI * 5 + phase * 1.3) * amp * 0.4
                             + amp * (0.3 + 0.2 * Math.sin(phase));
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      });
    };

    const drawSnowMountain = (ctx, scene, blendFrom, bt) => {
      const show = scene.snowMountain;
      if (!show) return;
      const opacity = blendFrom?.snowMountain ? 1 : clamp(bt * 2, 0, 0.85);
      const w = W(), h = H();
      const groundY = h * 0.72;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Mountain silhouette
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w * 0.18, groundY);
      ctx.lineTo(w * 0.28, groundY * 0.52);
      ctx.lineTo(w * 0.38, groundY * 0.62);
      ctx.lineTo(w * 0.42, groundY * 0.40);
      ctx.lineTo(w * 0.50, groundY * 0.58);
      ctx.lineTo(w * 0.58, groundY * 0.46);
      ctx.lineTo(w * 0.68, groundY * 0.62);
      ctx.lineTo(w * 0.78, groundY);
      ctx.lineTo(w, groundY);
      ctx.fillStyle = '#0d1a14';
      ctx.fill();

      // Snow caps
      const peaks = [
        { x: w*0.28, y: groundY*0.52, w: w*0.055 },
        { x: w*0.42, y: groundY*0.40, w: w*0.065 },
        { x: w*0.58, y: groundY*0.46, w: w*0.052 },
      ];
      peaks.forEach(pk => {
        const snowGrad = ctx.createRadialGradient(pk.x, pk.y, 0, pk.x, pk.y, pk.w);
        snowGrad.addColorStop(0, 'rgba(230,240,255,0.92)');
        snowGrad.addColorStop(0.5, 'rgba(200,220,245,0.55)');
        snowGrad.addColorStop(1, 'rgba(180,200,230,0)');
        ctx.fillStyle = snowGrad;
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, pk.w, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const drawTree = (ctx, t, time) => {
      const x = t.x * W();
      const groundY = H() * 0.72;
      const treeH = t.h * H();
      const sway  = Math.sin(time * t.ss + t.so) * t.sa;
      const sway2 = Math.sin(time * t.ss * 1.4 + t.so + 1) * t.sa * 0.4;

      ctx.save();
      ctx.translate(x, groundY);

      // Trunk
      const trunkH = treeH * 0.22;
      ctx.fillStyle = '#120a04';
      ctx.beginPath();
      ctx.moveTo(-t.trunkW/2, 0);
      ctx.quadraticCurveTo(-t.trunkW/2 + sway*50, -trunkH*0.5, -t.trunkW/3 + sway*100, -trunkH);
      ctx.quadraticCurveTo( t.trunkW/3 + sway*100,  -trunkH,    t.trunkW/2 + sway*50, -trunkH*0.5);
      ctx.quadraticCurveTo( t.trunkW/2, 0, -t.trunkW/2, 0);
      ctx.fill();

      // Foliage layers — each layer sways MORE than the one below (top is windier)
      for (let i = 0; i < t.layers; i++) {
        const layerProgress = i / (t.layers - 1);
        const layerY   = -trunkH - i * treeH * 0.17;
        const layerSwayX = (sway + sway2 * 0.5) * (90 + i * 70);
        const layerW   = (t.trunkW * 5.5) * (1 - i * 0.16);
        const layerH   = treeH * 0.30 * (1 - i * 0.10);
        const alpha    = 0.88 - i * 0.08;

        // Two-tone foliage for depth
        // Dark base
        ctx.fillStyle = t.col + Math.floor(alpha * 0.7 * 255).toString(16).padStart(2,'0');
        ctx.beginPath();
        ctx.moveTo(layerSwayX, layerY - layerH);
        ctx.bezierCurveTo(
          layerSwayX + layerW * 0.7, layerY - layerH * 0.4,
          layerSwayX + layerW,       layerY + layerH * 0.25,
          layerSwayX,                layerY + layerH * 0.35
        );
        ctx.bezierCurveTo(
          layerSwayX - layerW,       layerY + layerH * 0.25,
          layerSwayX - layerW * 0.7, layerY - layerH * 0.4,
          layerSwayX,                layerY - layerH
        );
        ctx.fill();

        // Lighter highlight
        ctx.fillStyle = t.col2 + Math.floor(alpha * 0.4 * 255).toString(16).padStart(2,'0');
        ctx.beginPath();
        ctx.moveTo(layerSwayX + layerW * 0.1, layerY - layerH * 0.9);
        ctx.bezierCurveTo(
          layerSwayX + layerW * 0.55, layerY - layerH * 0.35,
          layerSwayX + layerW * 0.65, layerY + layerH * 0.05,
          layerSwayX + layerW * 0.1,  layerY + layerH * 0.15
        );
        ctx.bezierCurveTo(
          layerSwayX - layerW * 0.25, layerY + layerH * 0.1,
          layerSwayX - layerW * 0.15, layerY - layerH * 0.25,
          layerSwayX + layerW * 0.1,  layerY - layerH * 0.9
        );
        ctx.fill();
      }
      ctx.restore();
    };

    const drawBirds = (ctx, time, starsVis) => {
      if (starsVis > 0.5) return; // No birds in deep night
      birdFlocks.forEach(flock => {
        flock.birds.forEach(b => {
          b.x += flock.dir * flock.speed;
          b.wingPhase += b.wingSpeed;
          const bx = b.x * W();
          const by = b.y * H();
          const wing = Math.sin(b.wingPhase) * b.size * 1.2;
          const sz = b.size;

          ctx.strokeStyle = 'rgba(40,40,40,0.85)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          // Left wing
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo(bx - sz*1.4, by - wing, bx - sz*2.8, by);
          // Right wing
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo(bx + sz*1.4, by - wing, bx + sz*2.8, by);
          ctx.stroke();
        });
        // Remove flock that has left screen
        const allGone = flock.birds.every(b => flock.dir > 0 ? b.x > 1.2 : b.x < -0.2);
        if (allGone) flock.alive = false;
      });
      // Remove dead flocks
      for (let i = birdFlocks.length - 1; i >= 0; i--) {
        if (!birdFlocks[i].alive) birdFlocks.splice(i, 1);
      }
    };

    const drawShootingStar = (ctx, time) => {
      if (!sStar.active && Math.random() < 0.0006) {
        sStar = {
          active: true,
          x: 0.05 + Math.random() * 0.6,
          y: 0.04 + Math.random() * 0.25,
          vx: 3.5 + Math.random() * 2,
          vy: 0.8 + Math.random() * 0.8,
          life: 1.0,
          tail: [],
        };
      }
      if (!sStar.active) return;

      sStar.x += sStar.vx / W() * 20;
      sStar.y += sStar.vy / H() * 20;
      sStar.life -= 0.018;
      sStar.tail.unshift({ x: sStar.x, y: sStar.y });
      if (sStar.tail.length > 18) sStar.tail.pop();

      if (sStar.life <= 0 || sStar.x > 1.1) { sStar.active = false; return; }

      const tailLen = sStar.tail.length;
      for (let i = 1; i < tailLen; i++) {
        const t1 = sStar.tail[i-1], t2 = sStar.tail[i];
        const alpha = (1 - i / tailLen) * sStar.life * 0.9;
        ctx.strokeStyle = `rgba(255,255,240,${alpha})`;
        ctx.lineWidth = (1 - i / tailLen) * 2.2;
        ctx.beginPath();
        ctx.moveTo(t1.x * W(), t1.y * H());
        ctx.lineTo(t2.x * W(), t2.y * H());
        ctx.stroke();
      }
    };

    const drawGround = (ctx, scene, blendFrom, bt) => {
      const groundY = H() * 0.72;
      const groundCol = blendFrom ? lerpColor(blendFrom.groundCol, scene.groundCol, bt) : scene.groundCol;
      ctx.fillStyle = groundCol;
      ctx.fillRect(0, groundY, W(), H() * 0.28);

      // Ground gradient — slightly lighter at edge
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, H());
      groundGrad.addColorStop(0, 'rgba(20,35,20,0.4)');
      groundGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, W(), H() * 0.28);
    };

    const drawWaves = (ctx, time) => {
      if (wavesOpacity < 0.01) return;
      const w = W(), h = H();
      const baseY = h * 0.70;
      for (let i = 0; i < 4; i++) {
        const waveY = baseY + i * 6;
        const alpha = wavesOpacity * (0.35 - i * 0.07);
        ctx.strokeStyle = `rgba(100,160,200,${alpha})`;
        ctx.lineWidth = 1.5 - i * 0.25;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = waveY + Math.sin((x / w) * Math.PI * 8 + time * 0.0015 + i * 0.8) * 3;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const drawAnimal = (ctx, a, time) => {
      a.x += a.dir * a.speed;
      a.walkPhase += 0.055;
      const ax = a.x * W();
      const ay = a.y * H();
      const sz = a.size;
      const walkBob = Math.sin(a.walkPhase) * 1.5 * sz;
      const legSwing = Math.sin(a.walkPhase) * 0.25;
      const facing   = a.dir; // 1 = right, -1 = left

      ctx.save();
      ctx.translate(ax, ay + walkBob * 0.3);
      if (facing < 0) ctx.scale(-1, 1); // flip for left-walking

      const col = 'rgba(30,25,20,0.88)';

      switch (a.type) {
        case 'dog': drawDog(ctx, sz, legSwing, col); break;
        case 'cat': drawCat(ctx, sz, legSwing, a.walkPhase, col); break;
        case 'cow': drawCow(ctx, sz, legSwing, col); break;
        case 'horse': drawHorse(ctx, sz, legSwing, col); break;
      }

      ctx.restore();
      if (a.x > 1.2 || a.x < -0.2) a.alive = false;
    };

    const drawDog = (ctx, sz, leg, col) => {
      const s = sz * 10;
      ctx.fillStyle = col;
      // Body
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.4, s*0.65, 0, 0, Math.PI*2); ctx.fill();
      // Head
      ctx.beginPath(); ctx.ellipse(s*1.5, -s*0.3, s*0.75, s*0.65, 0.2, 0, Math.PI*2); ctx.fill();
      // Snout
      ctx.beginPath(); ctx.ellipse(s*2.1, -s*0.1, s*0.4, s*0.28, 0, 0, Math.PI*2); ctx.fill();
      // Ear
      ctx.beginPath(); ctx.ellipse(s*1.7, -s*0.88, s*0.28, s*0.42, -0.3, 0, Math.PI*2); ctx.fill();
      // Tail
      ctx.beginPath(); ctx.moveTo(-s*1.4, -s*0.2);
      ctx.quadraticCurveTo(-s*2.2, -s*0.8, -s*1.8, -s*1.3); ctx.lineWidth=s*0.28; ctx.strokeStyle=col; ctx.stroke();
      // Legs
      const legPairs = [[s*0.8, leg], [s*0.3, -leg], [-s*0.3, leg], [-s*0.8, -leg]];
      legPairs.forEach(([lx, lp]) => {
        ctx.beginPath(); ctx.moveTo(lx, s*0.55); ctx.lineTo(lx + lp*s*0.5, s*1.2); ctx.lineWidth=s*0.32; ctx.stroke();
      });
    };

    const drawCat = (ctx, sz, leg, phase, col) => {
      const s = sz * 9;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.2, s*0.55, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*1.3, -s*0.35, s*0.62, s*0.58, 0.15, 0, Math.PI*2); ctx.fill();
      // Ears
      ctx.beginPath(); ctx.moveTo(s*1.0, -s*0.82); ctx.lineTo(s*1.22, -s*0.35); ctx.lineTo(s*0.78, -s*0.35); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*1.6, -s*0.78); ctx.lineTo(s*1.75, -s*0.35); ctx.lineTo(s*1.42, -s*0.35); ctx.fill();
      // Curled tail
      ctx.beginPath(); ctx.moveTo(-s*1.2, 0);
      ctx.bezierCurveTo(-s*2.0, -s*0.3, -s*2.2, -s*1.0, -s*1.6, -s*1.2);
      ctx.lineWidth = s*0.24; ctx.strokeStyle = col; ctx.stroke();
      // Legs
      [s*0.5, -s*0.5].forEach((lx, i) => {
        const lp = i === 0 ? leg : -leg;
        ctx.beginPath(); ctx.moveTo(lx, s*0.5); ctx.lineTo(lx + lp*s*0.4, s*1.1); ctx.lineWidth=s*0.26; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + s*0.3, s*0.5); ctx.lineTo(lx + s*0.3 + lp*s*0.35, s*1.1); ctx.stroke();
      });
    };

    const drawCow = (ctx, sz, leg, col) => {
      const s = sz * 13;
      ctx.fillStyle = col;
      // Body — large and round
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.7, s*0.85, 0, 0, Math.PI*2); ctx.fill();
      // Head
      ctx.beginPath(); ctx.ellipse(s*1.8, -s*0.25, s*0.82, s*0.72, 0.1, 0, Math.PI*2); ctx.fill();
      // Snout
      ctx.beginPath(); ctx.ellipse(s*2.5, -s*0.1, s*0.42, s*0.32, 0, 0, Math.PI*2); ctx.fill();
      // Horns
      ctx.beginPath(); ctx.moveTo(s*1.6, -s*0.9); ctx.quadraticCurveTo(s*1.4, -s*1.4, s*1.7, -s*1.35); ctx.lineWidth=s*0.18; ctx.strokeStyle=col; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*2.0, -s*0.88); ctx.quadraticCurveTo(s*2.2, -s*1.36, s*1.9, -s*1.32); ctx.stroke();
      // Udder
      ctx.beginPath(); ctx.ellipse(-s*0.2, s*0.78, s*0.4, s*0.22, 0, 0, Math.PI*2); ctx.fillStyle='rgba(50,30,30,0.7)'; ctx.fill();
      ctx.fillStyle = col;
      // Legs
      [s*1.0, s*0.35, -s*0.35, -s*1.0].forEach((lx, i) => {
        const lp = i % 2 === 0 ? leg : -leg;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(lx, s*0.8); ctx.lineTo(lx + lp*s*0.4, s*1.8); ctx.lineWidth=s*0.38; ctx.strokeStyle=col; ctx.stroke();
      });
      // Tail
      ctx.beginPath(); ctx.moveTo(-s*1.7, -s*0.1); ctx.quadraticCurveTo(-s*2.2, s*0.2, -s*2.0, s*0.6); ctx.lineWidth=s*0.2; ctx.stroke();
    };

    const drawHorse = (ctx, sz, leg, col) => {
      const s = sz * 14;
      ctx.fillStyle = col;
      // Body
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.9, s*0.82, -0.05, 0, Math.PI*2); ctx.fill();
      // Neck
      ctx.beginPath();
      ctx.moveTo(s*1.3, -s*0.5);
      ctx.quadraticCurveTo(s*1.8, -s*1.2, s*1.6, -s*0.2);
      ctx.quadraticCurveTo(s*2.2, -s*0.3, s*1.3, -s*0.5);
      ctx.fill();
      // Head
      ctx.beginPath(); ctx.ellipse(s*2.05, -s*1.15, s*0.62, s*0.45, 0.5, 0, Math.PI*2); ctx.fill();
      // Mane
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(s*(1.5 - i*0.1), s*(-0.5 - i*0.1));
        ctx.quadraticCurveTo(s*(1.3 - i*0.1), s*(-0.95 - i*0.05), s*(1.55 - i*0.12), s*(-1.1 - i*0.04));
        ctx.lineWidth = s*0.16; ctx.strokeStyle = col; ctx.stroke();
      }
      // Tail
      ctx.beginPath(); ctx.moveTo(-s*1.9, -s*0.15);
      ctx.quadraticCurveTo(-s*2.6, s*0.1, -s*2.4, s*0.8);
      ctx.lineWidth = s*0.28; ctx.stroke();
      // Legs
      [s*1.1, s*0.45, -s*0.45, -s*1.1].forEach((lx, i) => {
        const lp = i % 2 === 0 ? leg : -leg;
        // Upper leg
        ctx.beginPath(); ctx.moveTo(lx, s*0.75); ctx.lineTo(lx + lp*s*0.5, s*1.45); ctx.lineWidth=s*0.36; ctx.strokeStyle=col; ctx.stroke();
        // Lower leg
        ctx.beginPath(); ctx.moveTo(lx + lp*s*0.5, s*1.45); ctx.lineTo(lx + lp*s*0.3, s*2.1); ctx.lineWidth=s*0.28; ctx.stroke();
        // Hoof
        ctx.beginPath(); ctx.ellipse(lx + lp*s*0.3, s*2.15, s*0.22, s*0.12, 0, 0, Math.PI*2); ctx.fillStyle=col; ctx.fill();
      });
    };

    const drawBench = (ctx) => {
      const w = W(), h = H();
      const groundY = h * 0.72;
      const cx = w * 0.5;
      const benchW = clamp(w * 0.18, 80, 160);
      const benchH = benchW * 0.42;
      const seatY  = groundY - benchH * 0.3;
      const legH   = benchH * 0.9;

      ctx.strokeStyle = 'rgba(40,28,18,0.9)';
      ctx.fillStyle   = 'rgba(30,20,12,0.88)';

      // Legs
      ctx.lineWidth = clamp(benchW * 0.045, 3, 7);
      // Left legs
      ctx.beginPath(); ctx.moveTo(cx - benchW*0.42, seatY); ctx.lineTo(cx - benchW*0.42, seatY + legH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - benchW*0.18, seatY); ctx.lineTo(cx - benchW*0.18, seatY + legH); ctx.stroke();
      // Right legs
      ctx.beginPath(); ctx.moveTo(cx + benchW*0.18, seatY); ctx.lineTo(cx + benchW*0.18, seatY + legH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + benchW*0.42, seatY); ctx.lineTo(cx + benchW*0.42, seatY + legH); ctx.stroke();
      // Crossbar
      ctx.beginPath(); ctx.moveTo(cx - benchW*0.42, seatY + legH*0.55); ctx.lineTo(cx + benchW*0.42, seatY + legH*0.55); ctx.stroke();

      // Seat planks
      const plankH = clamp(benchH * 0.13, 5, 12);
      ctx.lineWidth = plankH;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const py = seatY - i * plankH * 0.4;
        const alpha = 0.85 - i * 0.08;
        ctx.strokeStyle = `rgba(35,22,12,${alpha})`;
        ctx.beginPath(); ctx.moveTo(cx - benchW*0.48, py); ctx.lineTo(cx + benchW*0.48, py); ctx.stroke();
      }

      // Backrest
      ctx.lineWidth = clamp(plankH * 0.8, 4, 10);
      const backY = seatY - benchH * 0.55;
      for (let i = 0; i < 2; i++) {
        const by = backY - i * plankH * 0.5;
        ctx.strokeStyle = `rgba(35,22,12,${0.82 - i*0.1})`;
        ctx.beginPath(); ctx.moveTo(cx - benchW*0.44, by); ctx.lineTo(cx + benchW*0.44, by); ctx.stroke();
      }
      // Back posts
      ctx.lineWidth = clamp(benchW * 0.04, 3, 6);
      ctx.strokeStyle = 'rgba(30,20,12,0.88)';
      [-benchW*0.38, benchW*0.38].forEach(bx => {
        ctx.beginPath(); ctx.moveTo(cx + bx, seatY); ctx.lineTo(cx + bx, backY - plankH); ctx.stroke();
      });
    };

    // ── MAIN RENDER LOOP ──────────────────────────────────────────────────────
    const render = (time) => {
      timeRef.current = time;
      totalFrames++;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W(), H());

      // ── Scene transitions ──
      sceneTime++;
      const currDurationFrames = currScene.duration * 60;
      if (!nextScene && sceneTime > currDurationFrames - BLEND_DURATION) {
        // Pick next scene — avoid same
        let ni;
        do { ni = Math.floor(Math.random() * SCENES.length); } while (ni === sceneIdx);
        sceneIdx = ni;
        nextScene = SCENES[ni];
        blendT = 0;
      }
      if (nextScene) {
        blendT = clamp(blendT + 1 / BLEND_DURATION, 0, 1);
        if (blendT >= 1) {
          prevScene = currScene;
          currScene = nextScene;
          nextScene = null;
          sceneTime = 0;
          blendT = 0;
          setSceneName(currScene.name);
        }
      }

      const blendFrom = nextScene ? currScene : null;
      const targetScene = nextScene || currScene;
      const bt = nextScene ? blendT : 1;

      // ── Moon drift ──
      moonX -= MOON_SPEED;
      if (moonX < -0.05) moonX = 1.05; // reset

      // ── Bird spawning ──
      const totalBirds = birdFlocks.reduce((s, f) => s + f.birds.length, 0);
      if (totalBirds < MAX_BIRDS && Math.random() < 0.0012 && targetScene.starsVisible < 0.5) {
        birdFlocks.push(spawnFlock());
      }

      // ── Animal spawning ──
      animalTimer++;
      if (animalTimer > ANIMAL_INTERVAL && animals.length < 2) {
        spawnAnimal();
        animalTimer = 0;
      }
      for (let i = animals.length - 1; i >= 0; i--) {
        if (!animals[i].alive) animals.splice(i, 1);
      }

      // ── Waves ──
      wavesTimer++;
      if (wavesTimer > WAVE_INTERVAL && !wavesVisible) {
        wavesVisible = true;
        wavesTimer = 0;
      }
      if (wavesVisible) {
        wavesOpacity = Math.min(wavesOpacity + 0.005, 0.55);
        if (wavesOpacity >= 0.55) {
          setTimeout(() => { wavesVisible = false; }, 8000);
          wavesOpacity = 0.55;
          if (!wavesVisible) wavesOpacity = Math.max(wavesOpacity - 0.003, 0);
        }
      } else {
        wavesOpacity = Math.max(wavesOpacity - 0.003, 0);
      }

      // ── DRAW ──
      drawSky(ctx, targetScene, blendFrom, bt, time);
      drawStars(ctx, targetScene, blendFrom, bt, time);
      drawAurora(ctx, targetScene, blendFrom, bt, time);
      drawMoon(ctx, targetScene, blendFrom, bt, time);
      drawShootingStar(ctx, time);
      drawSnowMountain(ctx, targetScene, blendFrom, bt);
      drawGround(ctx, targetScene, blendFrom, bt);
      drawWaves(ctx, time);
      trees.forEach(t => drawTree(ctx, t, time));
      animals.forEach(a => drawAnimal(ctx, a, time));
      drawBirds(ctx, time, targetScene.starsVisible);
      drawBench(ctx);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const hi = lang === 'Hindi';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'#000', overflow:'hidden' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />

      {/* Back / Home */}
      <button onClick={() => { killAudio(); if(goBack) goBack(); else setTab('home'); }}
        style={{ position:'absolute', top:16, left:16, zIndex:10, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:99, color:'#fff', padding:'7px 16px', fontSize:13, cursor:'pointer', backdropFilter:'blur(4px)' }}>
        ← {hi ? 'वापस' : 'Back'}
      </button>

      <button onClick={() => { killAudio(); setTab('home'); }}
        style={{ position:'absolute', top:16, right:16, zIndex:10, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:99, padding:'7px 14px', fontSize:16, cursor:'pointer', backdropFilter:'blur(4px)' }}>
        🏠
      </button>

      {/* Sound Buttons — responsive wrap on mobile */}
      <div style={{ position:'absolute', top:62, left:0, right:0, zIndex:10, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:6, padding:'0 12px' }}>
        {[
          { key:'birds.mp3',  icon:'🐦', en:'Birds',  hi:'पक्षी'   },
          { key:'wind.mp3',   icon:'💨', en:'Wind',   hi:'हवा'     },
          { key:'forest.mp3', icon:'🌲', en:'Forest', hi:'जंगल'    },
          { key:'flute.mp3',  icon:'🪈', en:'Flute',  hi:'बांसुरी' },
          { key:'waves.mp3',  icon:'🌊', en:'Waves',  hi:'लहरें'   },
        ].map(s => (
          <button key={s.key} onClick={() => playBenchSound(s.key)}
            style={{
              background: activeSound === s.key ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.45)',
              border: `1px solid ${activeSound === s.key ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 99, color: '#fff', padding: '7px 13px',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
              backdropFilter: 'blur(6px)',
            }}>
            <span>{s.icon}</span>
            <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>{hi ? s.hi : s.en}</span>
          </button>
        ))}
      </div>

      {/* Quote — positioned in upper sky, safe on mobile */}
      <div style={{
        position: 'absolute',
        top: 'clamp(120px, 22%, 200px)',
        left: 0, right: 0,
        textAlign: 'center',
        padding: '0 clamp(16px, 6vw, 48px)',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ opacity: quoteVisible ? 1 : 0, transition: 'opacity 0.9s ease', maxWidth: 380, margin: '0 auto' }}>
          {PARK_BENCH_QUOTES?.[quoteIdx] && (
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(16px, 4.5vw, 24px)',
              color: 'rgba(255,252,240,0.92)',
              fontStyle: 'italic',
              lineHeight: 1.65,
              textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)',
              margin: '0 0 18px',
            }}>
              "{PARK_BENCH_QUOTES[quoteIdx]}"
            </p>
          )}
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setQuoteVisible(false);
                setTimeout(() => {
                  setQuoteIdx(p => { let n; do { n = Math.floor(Math.random() * PARK_BENCH_QUOTES.length); } while (n === p); return n; });
                  setQuoteVisible(true);
                }, 600);
              }}
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:99, color:'rgba(255,255,255,0.85)', padding:'7px 20px', fontSize:11, cursor:'pointer', backdropFilter:'blur(4px)', letterSpacing:'0.04em' }}>
              {hi ? 'थोड़ा और बैठें' : 'sit a little longer'}
            </button>
            <button
              onClick={() => {
                const quote = PARK_BENCH_QUOTES?.[quoteIdx] || '';
                const text = `"${quote}" — JSukoon\n\nfind your sukoon at sukoon-pro.vercel.app`;
                if (navigator.share) {
                  navigator.share({ text }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(text).then(() => {
                    // subtle feedback — could add a state flash if needed
                  }).catch(() => {});
                }
              }}
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:99, color:'rgba(255,255,255,0.65)', padding:'7px 16px', fontSize:11, cursor:'pointer', backdropFilter:'blur(4px)' }}>
              {hi ? 'शेयर करें' : 'share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bench;
