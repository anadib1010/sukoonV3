import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getReflection, getReflectionHindi } from '../../utils/quoteEngine';
import { AUDIO_URLS } from '../../utils/constants';
import { supabase } from '../../supabase';

// ── MATH HELPERS ──
function lerpN(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function hexRGB(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
function lerpHex(a, b, t) {
  const [r1, g1, b1] = hexRGB(a);
  const [r2, g2, b2] = hexRGB(b);
  return `rgb(${Math.round(lerpN(r1,r2,t))},${Math.round(lerpN(g1,g2,t))},${Math.round(lerpN(b1,b2,t))})`;
}

// ── SKY SCENES (deep rose, magenta, pink nights) ──
const SCENES = [
  { id: 'roseNight',   top: '#1a0410', bot: '#3d0d28', stars: 1.0, moon: 0.9, aurora: 0.2 },
  { id: 'deepMagenta', top: '#0f0212', bot: '#2a0630', stars: 0.9, moon: 0.8, aurora: 0.6 },
  { id: 'blushDusk',   top: '#1e0818', bot: '#4a1035', stars: 0.7, moon: 0.5, aurora: 0.9 },
  { id: 'pinkStarlight', top: '#120308', bot: '#280818', stars: 1.0, moon: 1.0, aurora: 0.3 },
];
const SCENE_DUR = 300;
const BLEND_DUR = 80;

// ── CONSTELLATIONS (4 stars = BLACKPINK members) ──
const CONSTELLATIONS = [
  {
    name: 'Four Stars',
    bx: 0.10, by: 0.08, bw: 0.35, bh: 0.20,
    stars: [
      { x: 0.0,  y: 0.5,  r: 2.0 },
      { x: 0.33, y: 0.1,  r: 1.8 },
      { x: 0.67, y: 0.6,  r: 1.8 },
      { x: 1.0,  y: 0.1,  r: 2.0 },
    ],
    lines: [[0,1],[1,2],[2,3],[0,2],[1,3]],
  },
  {
    name: 'Pink Heart',
    bx: 0.62, by: 0.08, bw: 0.22, bh: 0.22,
    stars: [
      { x: 0.5,  y: 0.95, r: 1.5 },
      { x: 0.05, y: 0.4,  r: 1.3 },
      { x: 0.2,  y: 0.05, r: 1.1 },
      { x: 0.5,  y: 0.2,  r: 1.5 },
      { x: 0.8,  y: 0.05, r: 1.1 },
      { x: 0.95, y: 0.4,  r: 1.3 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],
  },
];

// ── MOODS ──
const MOODS = {
  peace:    { id: 'peace',    color: '255, 182, 215', icon: '🕊️', en: 'Peace',    hi: 'शांति'   },
  sad:      { id: 'sad',      color: '180, 130, 200', icon: '💧', en: 'Sad',      hi: 'उदास'    },
  hopeful:  { id: 'hopeful',  color: '255, 150, 180', icon: '🌱', en: 'Hopeful',  hi: 'उम्मीद'  },
  dreamy:   { id: 'dreamy',   color: '220, 100, 180', icon: '🌸', en: 'Dreamy',   hi: 'ख्वाब'   },
  grateful: { id: 'grateful', color: '255, 180, 120', icon: '✨', en: 'Grateful', hi: 'आभारी'   },
  happy:    { id: 'happy',    color: '255, 100, 150', icon: '💗', en: 'Happy',    hi: 'खुश'     },
  fierce:   { id: 'fierce',   color: '200, 50,  120', icon: '🔥', en: 'Fierce',   hi: 'जोशीला'  },
};

// ── LIGHTSTICK COLORS (Blink light stick — pink/rose palette) ──
const LIGHTSTICK_COLORS = [
  'rgba(255,100,160,',
  'rgba(255,150,190,',
  'rgba(220,60,130,',
  'rgba(255,180,210,',
  'rgba(200,40,110,',
  'rgba(255,120,170,',
  'rgba(255,200,220,',
];

// ── MUSIC NOTE CHARACTERS ──
const MUSIC_CHARS = [
  '🎵', '🎶', '🎼', '🎹', '🎸', '🎷', '🎺',
  '🥁', '🎻', '🪗', '🎤', '🎧', '♩', '♪',
  '♫', '♬', '✨', '🌸', '🌟', '💫', '⭐', '💗', '🪄',
];

// ── DANCER COLORS (4 members, 4 pinks/blacks) ──
const DANCER_COLORS = [
  '#e91e8c', '#ff4da6', '#ff80bf',
  '#cc0066',
];

export function PinkSanctuary({ T, lang, setTab, goBack }) {
  const canvasRef     = useRef(null);
  const animRef       = useRef(null);
  const soundBarRef   = useRef(null);
  const soundBarHRef  = useRef(80);
  const quoteWrapRef  = useRef(null);
  const quoteTextRef  = useRef(null);
  const langRef       = useRef(lang);
  const activeMoodRef = useRef('peace');
  const userStarsRef  = useRef([]);

  const hi = lang === 'Hindi';

  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── FETCH STARS FROM SUPABASE (pink_sanctuary_stars table) ──
  useEffect(() => {
    const fetchStars = async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('pink_sanctuary_stars')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(80);
        if (error) throw error;
        if (data) {
          userStarsRef.current = data.map(star => ({
            x:      star.x,
            y:      star.y,
            mood:   star.mood,
            size:   star.size,
            twSpd:  star.tw_spd,
            offset: star.tw_offset,
          }));
        }
      } catch (err) {
        console.error('Error loading pink stars:', err);
      }
    };
    fetchStars();
  }, []);

  // ── QUOTE CYCLING ──
  useEffect(() => {
    const getQ = () =>
      langRef.current === 'Hindi' ? getReflectionHindi() : getReflection();

    const setQuote = (q) => {
      if (quoteTextRef.current) quoteTextRef.current.textContent = `"${q}"`;
    };

    setQuote(getQ());

    const fadeToNext = () => {
      const wrap = quoteWrapRef.current;
      if (!wrap) return;
      wrap.style.opacity   = '0';
      wrap.style.transform = 'translateY(10px)';
      setTimeout(() => {
        setQuote(getQ());
        wrap.style.opacity   = '1';
        wrap.style.transform = 'translateY(0)';
      }, 700);
    };

    const intervalId = setInterval(fadeToNext, 12000);
    return () => clearInterval(intervalId);
  }, []);

  const refreshQuote = useCallback(() => {
    const wrap = quoteWrapRef.current;
    const txt  = quoteTextRef.current;
    if (!wrap || !txt) return;
    wrap.style.opacity   = '0';
    wrap.style.transform = 'translateY(10px)';
    setTimeout(() => {
      const q = langRef.current === 'Hindi' ? getReflectionHindi() : getReflection();
      txt.textContent      = `"${q}"`;
      wrap.style.opacity   = '1';
      wrap.style.transform = 'translateY(0)';
    }, 500);
  }, []);

  // ── AUDIO ENGINE ──
  const [activeSound, setActiveSound] = useState(null);
  const audioRef = useRef(null);
  const sanctuaryAudioRef = useRef(null);
  const [sanctuaryPlaying, setSanctuaryPlaying] = useState(false);

  const killAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setActiveSound(null);
  }, []);

  const playSound = useCallback((key) => {
    if (sanctuaryPlaying) return; // sanctuary song has priority
    if (key === activeSound) { killAudio(); return; }
    killAudio();
    const url = AUDIO_URLS[key];
    if (!url) return;
    const a = new Audio(url);
    a.loop = true;
    a.play().catch(() => {});
    audioRef.current = a;
    setActiveSound(key);
  }, [activeSound, killAudio, sanctuaryPlaying]);

  useEffect(() => {
    return () => {
      killAudio();
      cancelAnimationFrame(animRef.current);
      if (sanctuaryAudioRef.current) {
        sanctuaryAudioRef.current.pause();
        sanctuaryAudioRef.current.src = '';
      }
    };
  }, [killAudio]);

  // ── AUTO-PLAY SANCTUARY SONG — fires on first interaction ──
  useEffect(() => {
    const song = new Audio('/sanctuary-song.mp3');
    song.loop   = true;
    song.volume = 0.5;
    sanctuaryAudioRef.current = song;

    let unlockFn = null;

    song.play().then(() => {
      setSanctuaryPlaying(true);
    }).catch(() => {
      unlockFn = () => {
        song.play().then(() => {
          setSanctuaryPlaying(true);
        }).catch(() => {});
        window.removeEventListener('pointerdown', unlockFn);
        window.removeEventListener('keydown', unlockFn);
      };
      window.addEventListener('pointerdown', unlockFn);
      window.addEventListener('keydown', unlockFn);
    });

    return () => {
      song.pause();
      song.src = '';
      if (unlockFn) {
        window.removeEventListener('pointerdown', unlockFn);
        window.removeEventListener('keydown', unlockFn);
      }
    };
  }, []);

  // ── INTERCEPT BROWSER / MOBILE BACK → K-Hub ──
  useEffect(() => {
    window.history.pushState({ sanctuary: true }, '');
    const handlePop = (e) => {
      e.preventDefault();
      killAudio();
      setTab('khub');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [killAudio, setTab]);

  useEffect(() => {
    const measure = () => {
      if (soundBarRef.current) soundBarHRef.current = soundBarRef.current.offsetHeight;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── SAVE STAR ON CLICK ──
  const handleCanvasClick = async (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top)  / canvas.height;
    const groundFrac = (canvas.height - soundBarHRef.current - 16) / canvas.height;
    if (y >= groundFrac) return;

    const newStar = {
      x,
      y,
      mood:      activeMoodRef.current,
      size:      1.5 + Math.random() * 2.0,
      tw_spd:    0.002 + Math.random() * 0.003,
      tw_offset: Math.random() * Math.PI * 2,
    };

    userStarsRef.current.push({
      x:      newStar.x,
      y:      newStar.y,
      mood:   newStar.mood,
      size:   newStar.size,
      twSpd:  newStar.tw_spd,
      offset: newStar.tw_offset,
    });

    try {
      const { error } = await supabase.from('pink_sanctuary_stars').insert([newStar]);
      if (error) throw error;
    } catch (err) {
      console.error('Error saving pink star:', err);
    }
  };

  // ── CANVAS DRAWING ENGINE ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const W  = () => canvas.width;
    const H  = () => canvas.height;
    const GY = () => H() - soundBarHRef.current - 16;

    let scIdx = 0, scTime = 0, nextIdx = -1, blend = 0;

    const getVal = (key) => {
      const sc = SCENES[scIdx];
      const nx = nextIdx >= 0 ? SCENES[nextIdx] : null;
      return nx ? lerpN(sc[key], nx[key], blend) : sc[key];
    };

    const getCol = (keyTop, keyBot) => {
      const sc = SCENES[scIdx];
      const nx = nextIdx >= 0 ? SCENES[nextIdx] : null;
      return nx
        ? { top: lerpHex(sc[keyTop], nx[keyTop], blend), bot: lerpHex(sc[keyBot], nx[keyBot], blend) }
        : { top: sc[keyTop], bot: sc[keyBot] };
    };

    // 240 background stars — pink/rose hues
    const bgStars = Array.from({ length: 240 }, () => {
      const hue = 320 + Math.random() * 40; // pink/rose range
      return {
        x:          Math.random(),
        y:          Math.random() * 0.78,
        r:          0.3 + Math.random() * 1.9,
        twOff:      Math.random() * Math.PI * 2,
        twSpd:      0.0003 + Math.random() * 0.0015,
        op:         0.3 + Math.random() * 0.7,
        hue,
        solidColor: `hsl(${hue}, 80%, 95%)`,
        glowCenter: `hsla(${hue}, 90%, 85%, 0.6)`,
        glowEdge:   `hsla(${hue}, 90%, 85%, 0)`,
      };
    });

    // Shooting stars
    const shootingStars = [];
    let shootTimer = 0;
    const spawnShootingStar = () => {
      shootingStars.push({
        x:      Math.random() * 0.8 + 0.1,
        y:      Math.random() * 0.3,
        angle:  Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        speed:  0.003 + Math.random() * 0.005,
        length: 0.08 + Math.random() * 0.12,
        life:   1.0,
        decay:  0.014 + Math.random() * 0.018,
      });
    };

    // 35 floating music notes
    const musicNotes = Array.from({ length: 35 }, () => ({
      x:            Math.random(),
      y:            Math.random() * 1.5,
      speedY:       0.00018 + Math.random() * 0.00045,
      wobbleSpeed:  0.0006  + Math.random() * 0.0018,
      wobbleOffset: Math.random() * Math.PI * 2,
      char:         MUSIC_CHARS[Math.floor(Math.random() * MUSIC_CHARS.length)],
      size:         11 + Math.random() * 16,
      opacity:      0.22 + Math.random() * 0.52,
      rotation:     Math.random() * Math.PI * 2,
      rotSpeed:     (Math.random() - 0.5) * 0.003,
    }));

    // 44 lightstick crowd — pink Blink lightsticks
    const STICK_COUNT = 44;
    const lightsticks = Array.from({ length: STICK_COUNT }, (_, i) => ({
      x:        i / STICK_COUNT + (Math.random() - 0.5) * 0.018,
      phase:    Math.random() * Math.PI * 2,
      waveSpd:  0.0013 + Math.random() * 0.002,
      swayAmp:  0.014  + Math.random() * 0.024,
      colorIdx: Math.floor(Math.random() * LIGHTSTICK_COLORS.length),
      pulseFq:  0.003  + Math.random() * 0.002,
      baseH:    0.10   + Math.random() * 0.04,
    }));

    const STICK_COLORS_CACHED = LIGHTSTICK_COLORS.map(prefix => ({
      core:  prefix + '1)',
      glow0: prefix + '1)',
      glow3: prefix + '0.5)',
      glow1: prefix + '0)',
      spec:  'rgba(255,240,248,0.8)',
    }));

    // Aurora bands — pink/rose hues
    const auroraBands = Array.from({ length: 5 }, (_, i) => ({
      off: i * (Math.PI * 2 / 5),
      spd: 0.00015 + i * 0.00008,
      hue: 320 + i * 12, // pink range
      y:   0.08 + i * 0.055,
      amp: 0.025 + i * 0.012,
      w:   0.65 + i * 0.08,
    }));

    const conOp = CONSTELLATIONS.map(() => 0);

    // Nebula clouds — pink hues
    const nebulae = Array.from({ length: 5 }, () => ({
      x:   Math.random(),
      y:   Math.random() * 0.55,
      rx:  0.12 + Math.random() * 0.18,
      ry:  0.06 + Math.random() * 0.10,
      hue: 310 + Math.random() * 40,
      op:  0.02 + Math.random() * 0.04,
    }));

    let moonX = 0.82;

    // ── DRAW: SKY GRADIENT ──
    const drawSky = (ctx) => {
      const { top, bot } = getCol('top', 'bot');
      const g = ctx.createLinearGradient(0, 0, 0, GY());
      g.addColorStop(0,    top);
      g.addColorStop(0.65, lerpHex(top, bot, 0.65));
      g.addColorStop(1,    bot);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W(), GY());
    };

    // ── DRAW: NEBULAE ──
    const drawNebulae = (ctx) => {
      nebulae.forEach(n => {
        const grd = ctx.createRadialGradient(n.x * W(), n.y * GY(), 0, n.x * W(), n.y * GY(), n.rx * W());
        grd.addColorStop(0, `hsla(${n.hue},70%,60%,${n.op})`);
        grd.addColorStop(1, `hsla(${n.hue},70%,60%,0)`);
        ctx.save();
        const scaleY = (n.ry / n.rx) * (GY() / W());
        const safeY  = scaleY > 0 ? scaleY : 1;
        ctx.scale(1, safeY);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x * W(), (n.y * GY()) / safeY, n.rx * W(), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    // ── DRAW: BACKGROUND STARS ──
    const drawBgStars = (ctx, time) => {
      const vis  = getVal('stars');
      if (vis < 0.02) return;
      const skyH = GY();
      bgStars.forEach(s => {
        const tw    = 0.5 + 0.5 * Math.sin(time * s.twSpd + s.twOff);
        const alpha = s.op * tw * vis;
        const sx    = s.x * W();
        const sy    = s.y * skyH;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (s.r > 1.2) {
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 4);
          sg.addColorStop(0, s.glowCenter);
          sg.addColorStop(1, s.glowEdge);
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.solidColor;
        ctx.fill();
        ctx.restore();
      });
    };

    // ── DRAW: SHOOTING STARS (pink trail) ──
    const drawShootingStars = (ctx) => {
      shootTimer++;
      if (shootTimer > 160 + Math.random() * 280) { spawnShootingStar(); shootTimer = 0; }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life -= ss.decay;
        if (ss.life <= 0 || ss.x > 1.2 || ss.y > 0.9) { shootingStars.splice(i, 1); continue; }
        const tx   = ss.x - Math.cos(ss.angle) * ss.length;
        const ty   = ss.y - Math.sin(ss.angle) * ss.length;
        const grad = ctx.createLinearGradient(tx * W(), ty * H(), ss.x * W(), ss.y * H());
        grad.addColorStop(0,   'rgba(255,150,200,0)');
        grad.addColorStop(0.7, `rgba(255,180,210,${ss.life * 0.6})`);
        grad.addColorStop(1,   `rgba(255,240,248,${ss.life})`);
        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx * W(), ty * H());
        ctx.lineTo(ss.x * W(), ss.y * H());
        ctx.stroke();
        const hg = ctx.createRadialGradient(ss.x * W(), ss.y * H(), 0, ss.x * W(), ss.y * H(), 4);
        hg.addColorStop(0, `rgba(255,200,220,${ss.life})`);
        hg.addColorStop(1, 'rgba(255,200,220,0)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(ss.x * W(), ss.y * H(), 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    // ── DRAW: MOON (rose-tinted) ──
    const drawMoon = (ctx) => {
      const op = getVal('moon');
      if (op < 0.02) return;
      moonX -= 0.00002;
      if (moonX < -0.1) moonX = 1.1;
      const mx = moonX * W();
      const my = H() * 0.12;
      const r  = clamp(W() * 0.022, 14, 28);

      const outerGlow = ctx.createRadialGradient(mx, my, r, mx, my, r * 7);
      outerGlow.addColorStop(0,   `rgba(255,140,180,${op * 0.18})`);
      outerGlow.addColorStop(0.4, `rgba(220,80,140,${op * 0.08})`);
      outerGlow.addColorStop(1,   'rgba(220,80,140,0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(mx, my, r * 7, 0, Math.PI * 2);
      ctx.fill();

      const corona = ctx.createRadialGradient(mx, my, r * 0.5, mx, my, r * 3);
      corona.addColorStop(0, `rgba(255,180,210,${op * 0.45})`);
      corona.addColorStop(1, 'rgba(255,180,210,0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(mx, my, r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(mx, my, r, 0, Math.PI * 2);
      const moonBody = ctx.createRadialGradient(mx - r * 0.3, my - r * 0.3, 0, mx, my, r);
      moonBody.addColorStop(0, `rgba(255,240,248,${op})`);
      moonBody.addColorStop(1, `rgba(235,170,200,${op})`);
      ctx.fillStyle = moonBody;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(mx + r * 0.28, my - r * 0.15, r * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(18,4,14,${op * 0.9})`;
      ctx.fill();

      ctx.fillStyle = `rgba(255,220,235,${op * 0.8})`;
      ctx.beginPath();
      ctx.arc(mx + r * 2.2, my - r * 0.6, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    // ── DRAW: AURORA (pink/rose) ──
    const drawAurora = (ctx, time) => {
      const vis = getVal('aurora');
      if (vis < 0.02) return;
      auroraBands.forEach(b => {
        const phase = time * b.spd + b.off;
        const cy    = b.y * GY() * 0.88;
        const amp   = b.amp * H();
        const bw    = b.w * W();
        const sx    = (W() - bw) / 2;
        const al    = vis * (0.12 + 0.06 * Math.sin(phase * 0.7));
        const g     = ctx.createLinearGradient(0, cy - amp * 4, 0, cy + amp * 4);
        g.addColorStop(0,   `hsla(${b.hue},80%,68%,0)`);
        g.addColorStop(0.4, `hsla(${b.hue},90%,75%,${al * 0.5})`);
        g.addColorStop(0.5, `hsla(${b.hue},95%,78%,${al})`);
        g.addColorStop(0.6, `hsla(${b.hue},90%,75%,${al * 0.5})`);
        g.addColorStop(1,   `hsla(${b.hue},80%,68%,0)`);
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const tt = i / 60;
          const x  = sx + tt * bw;
          const y  = cy + Math.sin(tt * Math.PI * 2.5 + phase) * amp + Math.sin(tt * Math.PI * 1.3 + phase * 0.7) * amp * 0.4;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        for (let i = 60; i >= 0; i--) {
          const tt = i / 60;
          const x  = sx + tt * bw;
          const y  = cy + Math.sin(tt * Math.PI * 2.5 + phase) * amp + Math.sin(tt * Math.PI * 1.3 + phase * 0.7) * amp * 0.4 + amp * 1.2;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
      });
    };

    // ── DRAW: CONSTELLATIONS ──
    const drawConstellations = (ctx, time) => {
      const vis = getVal('stars');
      CONSTELLATIONS.forEach((con, ci) => {
        const t      = Math.floor(time / 1000 + ci * 250) % 500;
        const target = (t > 20 && t < 350) ? vis * 0.9 : 0;
        conOp[ci]    = lerpN(conOp[ci], target, 0.004);
        const op     = conOp[ci];
        if (op < 0.02) return;
        const bx = con.bx * W();
        const by = con.by * GY();
        const bw = con.bw * W();
        const bh = con.bh * H();
        ctx.save();
        ctx.strokeStyle = `rgba(255,170,200,${op * 0.5})`;
        ctx.lineWidth   = 1.2;
        con.lines.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(bx + con.stars[a].x * bw, by + con.stars[a].y * bh);
          ctx.lineTo(bx + con.stars[b].x * bw, by + con.stars[b].y * bh);
          ctx.stroke();
        });
        con.stars.forEach((s, si) => {
          const sx    = bx + s.x * bw;
          const sy    = by + s.y * bh;
          const pulse = 0.7 + 0.3 * Math.sin(time * 0.002 + si * 0.9);
          const sg    = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 6);
          sg.addColorStop(0, `rgba(255,200,220,${op * pulse})`);
          sg.addColorStop(1, 'rgba(220,80,140,0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,240,248,${op * pulse})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 1.8, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });
    };

    // ── DRAW: USER PLANTED STARS ──
    const drawUserStars = (ctx, time) => {
      userStarsRef.current.forEach(star => {
        const md = MOODS[star.mood];
        if (!md) return;
        const twinkle = 0.6 + 0.4 * Math.sin(time * star.twSpd + star.offset);
        const cx      = star.x * W();
        const cy      = star.y * H();
        const glow    = ctx.createRadialGradient(cx, cy, 0, cx, cy, star.size * 8);
        glow.addColorStop(0,   `rgba(${md.color},${0.9 * twinkle})`);
        glow.addColorStop(0.4, `rgba(${md.color},${0.3 * twinkle})`);
        glow.addColorStop(1,   `rgba(${md.color},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, star.size * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(cx, cy, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.globalAlpha  = twinkle * 0.5;
        ctx.strokeStyle  = `rgba(${md.color},0.8)`;
        ctx.lineWidth    = 0.8;
        const arm = star.size * 3;
        ctx.beginPath(); ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy + arm); ctx.stroke();
        ctx.restore();
      });
    };

    // ── DRAW: FLOATING MUSIC NOTES ──
    const drawMusicNotes = (ctx, time) => {
      ctx.save();
      ctx.textAlign = 'center';
      musicNotes.forEach(n => {
        n.y        -= n.speedY;
        n.rotation += n.rotSpeed;
        if (n.y < -0.08) {
          n.y    = 1.05 + Math.random() * 0.15;
          n.x    = Math.random();
          n.char = MUSIC_CHARS[Math.floor(Math.random() * MUSIC_CHARS.length)];
        }
        const wigX  = Math.sin(time * n.wobbleSpeed + n.wobbleOffset) * 0.028;
        const drawX = (n.x + wigX) * W();
        const drawY = n.y * H();
        const fadeY = n.y < 0.06 ? n.y / 0.06 : n.y > 0.78 ? (0.88 - n.y) / 0.10 : 1;
        const alpha = n.opacity * Math.max(0, fadeY);
        if (alpha < 0.01) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font        = `${n.size}px Arial`;
        ctx.translate(drawX, drawY);
        ctx.rotate(n.rotation);
        ctx.fillText(n.char, 0, 0);
        ctx.restore();
      });
      ctx.restore();
    };

    // ── DRAW: GROUND (dark rose) ──
    const drawGround = (ctx) => {
      const gY = GY();
      const gg = ctx.createLinearGradient(0, gY, 0, H());
      gg.addColorStop(0, '#140208');
      gg.addColorStop(1, '#080004');
      ctx.fillStyle = gg;
      ctx.fillRect(0, gY, W(), H() - gY);
      const shimmer = ctx.createLinearGradient(0, gY, W(), gY);
      shimmer.addColorStop(0,   'rgba(180,20,80,0)');
      shimmer.addColorStop(0.3, 'rgba(220,60,120,0.15)');
      shimmer.addColorStop(0.5, 'rgba(255,80,160,0.25)');
      shimmer.addColorStop(0.7, 'rgba(220,60,120,0.15)');
      shimmer.addColorStop(1,   'rgba(180,20,80,0)');
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, gY - 1, W(), 2);
    };

    // ── DRAW: BLINK HAMMER LIGHTSTICK CROWD ──
    // BLACKPINK fans pump their hammer lightsticks up and down energetically
    const drawLightstickCrowd = (ctx, time) => {
      const groundY = GY();

      lightsticks.forEach(stick => {
        // Pump motion: sharp up-down (not gentle sway like Army)
        const pump    = Math.abs(Math.sin(time * stick.pulseFq * 2.2 + stick.phase));
        const pumpY   = pump * stick.baseH * H() * 0.35; // how high they pump it
        const pulse   = 0.5 + 0.5 * pump;
        const baseX   = stick.x * W();
        const stickH  = stick.baseH * H();
        const tipX    = baseX; // no sway — straight up and down
        const tipY    = groundY - stickH - pumpY;
        const cObj    = STICK_COLORS_CACHED[stick.colorIdx];

        ctx.save();
        ctx.globalAlpha = 0.85;

        // ── Handle (straight black stick) ──
        ctx.strokeStyle = 'rgba(20,2,10,0.95)';
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.moveTo(baseX, groundY);
        ctx.lineTo(tipX, tipY + 10);
        ctx.stroke();

        // ── Hammer head (horizontal rectangle — BPTINY shape) ──
        const hamW = clamp(W() * 0.018, 7, 16); // hammer width
        const hamH = clamp(H() * 0.008, 4, 8);  // hammer height
        ctx.globalAlpha = pulse;

        // Glow behind hammer
        const grd = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, hamW * 2.5);
        grd.addColorStop(0,   cObj.glow0);
        grd.addColorStop(0.4, cObj.glow3);
        grd.addColorStop(1,   cObj.glow1);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(tipX, tipY, hamW * 2.5, hamW * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hammer body — alternates pink and black like real BPTINY
        const isBlack = Math.floor(time * 0.001 + stick.phase) % 2 === 0;
        ctx.fillStyle = isBlack ? 'rgba(15,5,10,0.95)' : cObj.core;
        ctx.beginPath();
        ctx.roundRect(tipX - hamW, tipY - hamH / 2, hamW * 2, hamH, 3);
        ctx.fill();

        // Specular highlight on hammer
        ctx.fillStyle = 'rgba(255,220,235,0.6)';
        ctx.beginPath();
        ctx.ellipse(tipX - hamW * 0.3, tipY - hamH * 0.15, hamW * 0.35, hamH * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    };

    // ── DRAW: STAGE & 4 DANCERS (BLACKPINK members) ──
    const drawStageAndDancers = (ctx, time) => {
      const groundY = GY();
      const cx      = W() * 0.5;
      const cy      = groundY;
      const stageW  = W() * 0.45;

      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, stageW * 0.6);
      sg.addColorStop(0,   'rgba(220,60,130,0.30)');
      sg.addColorStop(0.5, 'rgba(160,30,90,0.12)');
      sg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, stageW * 0.6, H() * 0.022, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spotlight beams — pink
      for (let b = 0; b < 3; b++) {
        const bx     = cx + (b - 1) * W() * 0.12;
        const beamG  = ctx.createLinearGradient(bx, cy - H() * 0.28, bx, cy);
        beamG.addColorStop(0, 'rgba(255,80,160,0)');
        beamG.addColorStop(1, 'rgba(255,80,160,0.04)');
        ctx.save();
        ctx.fillStyle = beamG;
        ctx.beginPath();
        ctx.moveTo(bx - 3, cy);
        ctx.lineTo(bx + 3, cy);
        ctx.lineTo(bx + W() * 0.03, cy - H() * 0.28);
        ctx.lineTo(bx - W() * 0.03, cy - H() * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 4 dancing figures
      const spacing = clamp(W() * 0.05, 18, 42);
      const startX  = cx - spacing * 1.5;

      for (let i = 0; i < 4; i++) {
        const dx       = startX + i * spacing;
        const beat     = time * 0.003;
        const bodyBob  = Math.sin(beat + i * 0.9) * 3.5;
        const armSwing = Math.cos(beat * 1.1 + i * 0.8) * 5;
        const headTilt = Math.sin(beat * 0.7 + i * 1.1) * 2;
        const legL     = Math.sin(beat * 1.2 + i) * 3;
        const legR     = Math.sin(beat * 1.2 + i + Math.PI) * 3;
        const mc       = DANCER_COLORS[i];

        ctx.save();
        const aura = ctx.createRadialGradient(dx, cy - 12 + bodyBob, 0, dx, cy - 12 + bodyBob, 20);
        aura.addColorStop(0, `${mc}22`);
        aura.addColorStop(1, `${mc}00`);
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(dx, cy - 12 + bodyBob, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle   = mc;
        ctx.strokeStyle = mc;
        ctx.lineWidth   = 2.2;

        ctx.save();
        ctx.translate(dx + headTilt, cy - 22 + bodyBob);
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.ellipse(dx, cy - 8 + bodyBob, 3.5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(dx, cy - 16 + bodyBob);
        ctx.lineTo(dx - 7, cy - 11 + bodyBob + armSwing);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dx, cy - 16 + bodyBob);
        ctx.lineTo(dx + 7, cy - 11 + bodyBob - armSwing);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(dx, cy - 1 + bodyBob);
        ctx.lineTo(dx - 3, cy + 8 + legL);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dx, cy - 1 + bodyBob);
        ctx.lineTo(dx + 3, cy + 8 + legR);
        ctx.stroke();

        ctx.restore();
      }
    };

    // ── RENDER LOOP ──
    const render = (time) => {
      animRef.current = requestAnimationFrame(render);
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, W(), H());
        scTime++;
        if (nextIdx < 0 && scTime >= SCENE_DUR - BLEND_DUR) { nextIdx = (scIdx + 1) % SCENES.length; blend = 0; }
        if (nextIdx >= 0) {
          blend = clamp(blend + 1 / BLEND_DUR, 0, 1);
          if (blend >= 1) { scIdx = nextIdx; nextIdx = -1; blend = 0; scTime = 0; }
        }
        drawSky(ctx);
        drawNebulae(ctx);
        drawBgStars(ctx, time);
        drawShootingStars(ctx);
        drawAurora(ctx, time);
        drawConstellations(ctx, time);
        drawMoon(ctx);
        drawUserStars(ctx, time);
        drawMusicNotes(ctx, time);
        drawGround(ctx);
        drawLightstickCrowd(ctx, time);
        drawStageAndDancers(ctx, time);
      } catch (e) {
        console.warn('Render error (non-fatal):', e);
      }
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  // ── REACT STATE ──
  const [activeMood, setActiveMood] = useState('peace');
  const [shared, setShared]         = useState(false);

  const setMood = (id) => {
    activeMoodRef.current = id;
    setActiveMood(id);
  };

  const toggleSanctuarySong = () => {
    const song = sanctuaryAudioRef.current;
    if (!song) return;
    if (sanctuaryPlaying) {
      song.pause();
      setSanctuaryPlaying(false);
    } else {
      song.play().catch(() => {});
      setSanctuaryPlaying(true);
    }
  };

  const handleShare = async () => {
    const txt  = quoteTextRef.current?.textContent || '';
    const text = `${txt}\n\n— Finding comfort in the Pink Sanctuary 🌸`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {}
  };

  const SOUNDS = [
    { key: 'flute.mp3',  icon: '🪈', en: 'Bamboo Flute', hiL: 'बांसुरी' },
    { key: 'birds.mp3',  icon: '🐦', en: 'Birds',        hiL: 'पक्षी'   },
    { key: 'forest.mp3', icon: '🌲', en: 'Forest',       hiL: 'जंगल'    },
    { key: 'wind.mp3',   icon: '💨', en: 'Wind',         hiL: 'हवा'     },
    { key: 'waves.mp3',  icon: '💦', en: 'Waves',        hiL: 'लहरें'   },
  ];

  // ── STYLES (pink palette) ──
  const glassBtn = {
    backdropFilter:       'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    background:           'rgba(28,4,14,0.48)',
    border:               '1px solid rgba(255,100,160,0.22)',
  };

  const s = {
    page: {
      position:        'fixed',
      inset:           0,
      zIndex:          50,
      backgroundColor: '#180208',
      overflow:        'hidden',
      fontFamily:      "'Palatino Linotype','Book Antiqua',Palatino,serif",
    },
    canvas: {
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      display: 'block', cursor: 'crosshair',
    },
    backBtn: {
      position:      'absolute',
      top:           16,
      left:          16,
      zIndex:        20,
      ...glassBtn,
      borderRadius:  99,
      color:         'rgba(255,180,210,0.9)',
      padding:       '9px 20px',
      fontSize:      13,
      cursor:        'pointer',
      letterSpacing: '0.04em',
      transition:    'all 0.2s',
    },
    hintText: {
      position:      'absolute',
      top:           10,
      right:         16,
      zIndex:        10,
      color:         'rgba(255,130,180,0.4)',
      fontSize:      10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      textAlign:     'right',
      pointerEvents: 'none',
    },
    moodBarWrap: {
      position:       'absolute',
      top:            28,
      right:          16,
      zIndex:         10,
      display:        'flex',
      gap:            6,
      flexWrap:       'wrap',
      justifyContent: 'flex-end',
      ...glassBtn,
      padding:        '7px 10px',
      borderRadius:   18,
      maxWidth:       360,
    },
    moodBtn: (active, color) => ({
      background:   active ? `rgba(${color},0.25)` : 'transparent',
      border:       `1px solid ${active ? `rgba(${color},0.7)` : 'rgba(255,100,160,0.18)'}`,
      borderRadius: 99,
      padding:      '5px 12px',
      color:        active ? '#fff' : 'rgba(255,160,200,0.7)',
      fontSize:     12,
      cursor:       'pointer',
      display:      'flex',
      alignItems:   'center',
      gap:          4,
      transition:   'all 0.25s',
      boxShadow:    active ? `0 0 12px rgba(${color},0.35)` : 'none',
    }),
    quoteWrap: {
      position:      'absolute',
      top:           '28%',
      left:          0,
      right:         0,
      textAlign:     'center',
      padding:       '0 28px',
      zIndex:        10,
      pointerEvents: 'none',
    },
    quoteFadeBase: {
      transition: 'opacity 0.7s ease, transform 0.7s ease',
      maxWidth:   540,
      margin:     '0 auto',
    },
    quoteOrb: {
      fontSize:     18,
      marginBottom: 4,
      display:      'block',
    },
    quoteText: {
      fontFamily:    "'Palatino Linotype','Book Antiqua',Georgia,serif",
      fontSize:      'clamp(15px,4vw,23px)',
      color:         'rgba(255,230,240,0.98)',
      fontStyle:     'italic',
      lineHeight:    1.72,
      textShadow:    [
        '0 0 40px rgba(255,80,160,0.95)',
        '0 0 20px rgba(200,40,120,0.80)',
        '0 2px 8px rgba(0,0,0,0.90)',
      ].join(','),
      margin:        '0 0 16px',
      letterSpacing: '0.01em',
      background:    'none',
    },
    btnRow: {
      display:        'flex',
      gap:            10,
      justifyContent: 'center',
      flexWrap:       'wrap',
      pointerEvents:  'auto',
    },
    sitBtn: {
      background:    'linear-gradient(135deg,rgba(200,40,100,0.82),rgba(160,20,80,0.82))',
      border:        '1px solid rgba(255,120,180,0.32)',
      boxShadow:     '0 0 16px rgba(220,60,130,0.32)',
      borderRadius:  99,
      color:         'rgba(255,210,230,0.95)',
      padding:       '9px 24px',
      fontSize:      12,
      cursor:        'pointer',
      letterSpacing: '0.08em',
      fontFamily:    'inherit',
      transition:    'all 0.2s',
    },
    shareBtn: {
      background:    'rgba(60,8,28,0.42)',
      border:        '1px solid rgba(255,100,160,0.2)',
      borderRadius:  99,
      color:         'rgba(255,160,200,0.8)',
      padding:       '7px 18px',
      fontSize:      11,
      cursor:        'pointer',
      fontFamily:    'inherit',
      letterSpacing: '0.06em',
      transition:    'all 0.2s',
    },
    khubBtn: {
      background:    'rgba(160,20,80,0.55)',
      border:        '1px solid rgba(255,120,180,0.35)',
      boxShadow:     '0 0 18px rgba(220,60,130,0.25)',
      borderRadius:  99,
      color:         'rgba(255,210,230,0.95)',
      padding:       '10px 28px',
      fontSize:      12,
      cursor:        'pointer',
      fontFamily:    'inherit',
      letterSpacing: '0.08em',
      transition:    'all 0.2s',
      marginTop:     '10px',
    },
    clickHint: {
      position:      'absolute',
      bottom:        90,
      left:          0,
      right:         0,
      zIndex:        10,
      textAlign:     'center',
      pointerEvents: 'none',
      color:         'rgba(255,110,170,0.38)',
      fontSize:      11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
    soundBar: {
      position:       'absolute',
      bottom:         18,
      left:           0,
      right:          0,
      zIndex:         10,
      display:        'flex',
      justifyContent: 'center',
      flexWrap:       'wrap',
      gap:            8,
      padding:        '0 14px',
    },
    soundBtn: (active) => ({
      ...glassBtn,
      background:    active
        ? 'linear-gradient(135deg,rgba(180,40,100,0.82),rgba(140,20,70,0.82))'
        : 'rgba(22,2,10,0.52)',
      border:        `1px solid ${active ? 'rgba(255,120,180,0.48)' : 'rgba(180,60,110,0.18)'}`,
      boxShadow:     active ? '0 0 14px rgba(255,80,160,0.38)' : 'none',
      borderRadius:  99,
      color:         active ? 'rgba(255,210,230,0.95)' : 'rgba(220,110,160,0.7)',
      padding:       '9px 16px',
      display:       'flex',
      alignItems:    'center',
      gap:           7,
      fontSize:      12,
      cursor:        'pointer',
      letterSpacing: '0.04em',
      fontFamily:    'inherit',
      transition:    'all 0.25s',
    }),
  };

  // ── JSX ──
  return (
    <div style={s.page}>

      <canvas ref={canvasRef} style={s.canvas} onClick={handleCanvasClick} />

      {/* Back button */}
      <button
        onClick={() => { killAudio(); if (goBack) goBack(); else setTab('khub'); }}
        style={s.backBtn}
      >
        ← {hi ? 'वापस' : 'Back'}
      </button>

      {/* Mood hint */}
      <div style={s.hintText}>
        {hi ? 'अभी आप कैसा महसूस कर रहे हैं?' : 'how do you feel right now?'}
      </div>

      {/* Mood selector */}
      <div style={s.moodBarWrap}>
        {Object.values(MOODS).map(mood => (
          <button
            key={mood.id}
            onClick={() => setMood(mood.id)}
            style={s.moodBtn(activeMood === mood.id, mood.color)}
            title={hi ? mood.hi : mood.en}
          >
            <span>{mood.icon}</span>
            <span style={{ display: window.innerWidth > 560 ? 'inline' : 'none' }}>
              {hi ? mood.hi : mood.en}
            </span>
          </button>
        ))}
      </div>

      {/* Quote display */}
      <div style={s.quoteWrap}>
        <div ref={quoteWrapRef} style={s.quoteFadeBase}>
          <span style={s.quoteOrb}>🌸</span>
          <p ref={quoteTextRef} style={s.quoteText} />
          <div style={s.btnRow}>
            <button onClick={refreshQuote} style={s.sitBtn}>
              {hi ? 'यहाँ आराम करें' : 'rest here a while'}
            </button>
            <button onClick={handleShare} style={s.shareBtn}>
              {shared
                ? (hi ? '✓ कॉपी हो गया' : '✓ copied')
                : (hi ? 'शेयर करें' : 'share this feeling')}
            </button>
          </div>
          {/* Enter Blink Lounge button */}
          <div style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
            <button
              onClick={() => { killAudio(); setTab('chat_blink'); }}
              style={s.khubBtn}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(255,80,160,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 18px rgba(220,60,130,0.25)'}
            >
              🌸 {hi ? 'ब्लिंक लाउंज में जाएं' : 'Enter Blink Lounge'}
            </button>
          </div>
        </div>
      </div>

      {/* Sky click hint */}
      <div style={s.clickHint}>
        {hi
          ? '✦ अपना सितारा लगाने के लिए आकाश पर क्लिक करें ✦'
          : '✦ click the sky to plant your star ✦'}
      </div>

      {/* Sound bar */}
      <div ref={soundBarRef} style={s.soundBar}>
        {SOUNDS.map(snd => (
          <button
            key={snd.key}
            onClick={() => playSound(snd.key)}
            style={{
              ...s.soundBtn(activeSound === snd.key),
              opacity: sanctuaryPlaying ? 0.3 : 1,
              cursor: sanctuaryPlaying ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{snd.icon}</span>
            <span>{hi ? snd.hiL : snd.en}</span>
          </button>
        ))}
        <button
          onClick={toggleSanctuarySong}
          style={s.soundBtn(sanctuaryPlaying)}
        >
          <span>🌸</span>
          <span>{sanctuaryPlaying ? (hi ? 'गीत बंद' : 'Song Off') : (hi ? 'सैंक्चुअरी गीत' : 'Sanctuary Song')}</span>
        </button>
      </div>

    </div>
  );
}

export default PinkSanctuary;
