import React, { useState, useEffect, useRef } from 'react';
import { BrandHeader } from './BrandHeader';
import { BackButton } from './BackButton';

// ─── WEB SURROUND SOUND ENGINE ──────────────────────────────────────────
// Simulates 8-channel surround using the Web Audio API StereoPannerNode
class WebSurroundEngine {
  constructor() {
    this.ctx = null;
    this.tracks = []; // Will hold { audio, panner }
    this.panTimer = null;
    this.panAngle = 0;
    this.ready = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    const loadTrack = (src, defaultPan, defaultVol) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      audio.volume = defaultVol;

      // Create panning node
      const source = this.ctx.createMediaElementSource(audio);
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = defaultPan;

      source.connect(panner);
      panner.connect(this.ctx.destination);

      this.tracks.push({ audio, panner });
    };

    // 0: birds (left ear), 1: waves (right ear), 2: flute/bowl (center)
    loadTrack('/birds.mp3', -0.8, 0.72);
    loadTrack('/waves.mp3', 0.8, 0.72);
    loadTrack('/flute.mp3', 0.0, 0.45);

    this.ready = true;
  }

  async play(idx) {
    if (!this.ready) this.init();
    // Browsers suspend audio context until user interaction. 
    // Since the user clicked a button to open this page, resume() will work!
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    
    const track = this.tracks[idx];
    if (track) {
      track.audio.play().catch(e => console.log('Audio autoplay blocked by browser:', e));
    }
  }

  stop(idx) {
    const track = this.tracks[idx];
    if (track) {
      track.audio.pause();
      // Keep it ready to play from the start if needed again
    }
  }

  startSurroundSweep(speedMs = 8000) {
    if (this.panTimer) clearInterval(this.panTimer);
    this.panTimer = setInterval(() => {
      this.panAngle += (2 * Math.PI) / (speedMs / 100);
      const pan = Math.sin(this.panAngle); // Sweeps smoothly from -1 to 1
      this.tracks.forEach(t => {
        if (t.panner) t.panner.pan.value = pan;
      });
    }, 100);
  }

  stopAll() {
    this.tracks.forEach(t => {
      t.audio.pause();
      t.audio.currentTime = 0;
    });
    if (this.panTimer) clearInterval(this.panTimer);
    this.panTimer = null;
  }
}

// ─── HAPTIC PATTERNS ───────────────────────────────────────────────────
const HAPTIC_TAP_PATTERN    = [0, 40, 200, 40];          // double pulse
const HAPTIC_HEARTBEAT      = [0, 30, 100, 30, 400];     // heartbeat
const HAPTIC_BREATH_IN      = [0, 20];                   // soft single
const HAPTIC_BREATH_OUT     = [0, 60];                   // slightly stronger

// ─── SESSION-BASED MICROCOPY ───────────────────────────────────────────
function getResetCount() {
  try { return parseInt(localStorage.getItem("jsukoon_reset_count") || "0", 10); }
  catch { return 0; }
}
function incrementResetCount() {
  try {
    const n = getResetCount() + 1;
    localStorage.setItem("jsukoon_reset_count", String(n));
    return n;
  } catch { return 1; }
}

function getClosingLine(count) {
  if (count <= 1) return "You're back.";
  if (count <= 3) return "This is here when you need it.";
  if (count <= 6) {
    const lines = ["That's enough for now.", "You're back.", "Take what you needed."];
    return lines[count % lines.length];
  }
  if (count <= 10) return "You came back.";
  const deepLines = ["You know this place.", "Stay as long as you need.", "You found your way back."];
  return deepLines[count % deepLines.length];
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────
export function Reset({ setTab, T, lang }) {
  const [step, setStep]               = useState(0);
  const [fade, setFade]               = useState(false);
  const [showFocusBtn, setShowFocusBtn] = useState(false);
  const [showAnchor, setShowAnchor]   = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [line1, setLine1]             = useState(false);
  const [line2, setLine2]             = useState(false);
  const [resetCount]                  = useState(() => getResetCount());
  
  const closingLine = getClosingLine(resetCount + 1);
  
  // 🌟 Audio Engine and Timers Memory
  const engine = useRef(new WebSurroundEngine());
  const hapticInterval = useRef(null);
  const breathHapticInterval = useRef(null);

  const advance = (nextStep, delay) => {
    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => { setStep(nextStep); setFade(true); }, 1000);
    }, delay);
    return timer;
  };

  // 1. Initialize Audio Engine & Vibrate on Mount
  useEffect(() => {
    engine.current.init();
    if (window.navigator.vibrate) window.navigator.vibrate(30);
    const t = setTimeout(() => { setStep(1); setFade(true); }, 60);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(t);
      engine.current.stopAll();
      clearInterval(hapticInterval.current);
      clearInterval(breathHapticInterval.current);
    };
  }, []);

  // "Stay with this" anchor text logic
  useEffect(() => {
    if (step !== 5) { setShowAnchor(false); return; }
    const show = setTimeout(() => setShowAnchor(true), 10000);
    const hide = setTimeout(() => setShowAnchor(false), 11500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [step]);

  // ─── STEP MACHINE LOGIC ────────────────────────────────────────────────
  useEffect(() => {
    let t;

    if (step === 1) {
      // Start Tibetan bowl (flute) center channel immediately as ambient
      setTimeout(() => engine.current.play(2), 800); 
      t = advance(2, 2500);
    }
    if (step === 2) t = advance(3, 2000);
    if (step === 3) t = advance(4, 2000);
    if (step === 4) t = advance(5, 2000);
    
    if (step === 5) {
      // Start ambient surround: birds left, waves right
      engine.current.play(0);
      engine.current.play(1);
      engine.current.startSurroundSweep(12000);

      // Start Web Haptic Heartbeat
      if (window.navigator.vibrate) {
        hapticInterval.current = setInterval(() => {
          window.navigator.vibrate(HAPTIC_HEARTBEAT);
        }, 1000);
      }

      t = advance(6, 21000);
    }
    
    if (step === 6) {
      clearInterval(hapticInterval.current);
      
      // Start Web Haptic Breath Cues
      if (window.navigator.vibrate) {
        let breathPhase = 0;
        breathHapticInterval.current = setInterval(() => {
          breathPhase++;
          if (breathPhase % 10 < 5) {
            window.navigator.vibrate(HAPTIC_BREATH_IN);
          } else {
            window.navigator.vibrate(HAPTIC_BREATH_OUT);
          }
        }, 2000);
      }

      t = advance(7, 24000);
    }
    
    if (step === 7) {
      clearInterval(breathHapticInterval.current);
      // Stop birds and waves, but leave the flute/bowl playing softly
      engine.current.stop(0);
      engine.current.stop(1);
      t = advance(8, 2000);
    }
    
    if (step === 8) t = advance(9, 2000);
    if (step === 9) { setShowFocusBtn(false); t = advance(10, 100); }
    if (step === 10) { t = setTimeout(() => setShowFocusBtn(true), 4000); }

    if (step === 12) {
      setShowClosing(false);
      const showT = setTimeout(() => setShowClosing(true), 1000);
      t = setTimeout(() => {
        setFade(false);
        setTimeout(() => { setStep(13); setFade(true); }, 1000);
      }, 4000);
      return () => { clearTimeout(t); clearTimeout(showT); };
    }

    if (step === 13) {
      setLine1(false); setLine2(false);
      const t1 = setTimeout(() => setLine1(true), 300);
      const t2 = setTimeout(() => setLine2(true), 900);
      
      t = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          engine.current.stopAll(); // Silence all audio before leaving
          incrementResetCount();
          setTab('postreset');
        }, 1000);
      }, 4500);
      return () => { clearTimeout(t); clearTimeout(t1); clearTimeout(t2); };
    }

    return () => clearTimeout(t);
  }, [step, setTab]);

  const handleFocusClick = () => {
    setFade(false);
    setTimeout(() => { setStep(12); setFade(true); }, 1000);
  };

  // ─── STYLES ─────────────────────────────────────────────────────────────
  const s = {
    page: {
      height: "100dvh", width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#050505", color: "#ffffff",
      fontFamily: "'Cormorant Garamond', serif",
      textAlign: "center", padding: 24, boxSizing: "border-box",
      position: "relative", overflow: "hidden",
    },
    progressBar: {
      position: "absolute", top: 0, left: 0,
      height: "2px", background: T.accent, opacity: 0.35,
      animation: "progressFill 64s linear forwards", zIndex: 50,
    },
    content: {
      opacity: fade ? 1 : 0,
      transition: "opacity 1s ease-in-out",
      display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
      zIndex: 2,
    },
    text: {
      fontSize: "clamp(28px, 8vw, 36px)", fontWeight: 300, fontStyle: "italic",
      letterSpacing: "1px", margin: 0, lineHeight: 1.4,
    },
    text: {
      fontSize: "clamp(28px, 8vw, 36px)", fontWeight: 300, fontStyle: "italic",
      letterSpacing: "1px", margin: 0, lineHeight: 1.4,
    },
    // 👇 ADD THIS NEW STYLE HERE 👇
    earphoneText: {
      fontFamily: "'DM Sans', sans-serif", 
      fontSize: "12px",
      letterSpacing: "2.5px", 
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.4)", 
      margin: "0 0 16px 0",
    },
    // 👆 ---------------------- 👆
    breathingDot: {
      width: 10, height: 10, borderRadius: "50%",
      background: T.accent, opacity: 0.4, marginTop: 32,
      animation: "breatheSoft 4s ease-in-out infinite",
    },
    anchorText: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 12,
      letterSpacing: "2px", textTransform: "uppercase",
      color: "rgba(255,255,255,0.4)", marginTop: 16,
      opacity: showAnchor ? 1 : 0,
      transition: "opacity 0.8s ease-in-out",
    },
    orbWrap: {
      position: "relative",
      display: "flex", justifyContent: "center", alignItems: "center",
      flexShrink: 0,
    },
    phaseBarWrap: {
      width: "clamp(90px, 28vw, 160px)", height: 2,
      background: "rgba(255,255,255,0.1)", borderRadius: 99,
      marginTop: 24, overflow: "hidden",
    },
    phaseBarTap: {
      height: "100%", background: T.accent, opacity: 0.5,
      borderRadius: 99, animation: "phaseFillTap 21s linear forwards",
    },
    phaseBarBreathe: {
      height: "100%", background: T.accent, opacity: 0.5,
      borderRadius: 99, animation: "phaseFillBreathe 24s linear forwards",
    },
    orb: {
      borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, rgba(180,180,185,0.95) 0%, rgba(100,100,105,0.95) 100%)",
      boxShadow: `0 0 35px ${T.accent}60, inset -8px -8px 15px rgba(0,0,0,0.2), inset 8px 8px 15px rgba(255,255,255,0.3)`,
      willChange: "transform",
      transformOrigin: "center",
      flexShrink: 0,
    },
    focusWrap: {
      marginTop: 32, width: "100%",
      opacity: showFocusBtn ? 1 : 0,
      transition: "opacity 1s ease-in-out",
    },
    focusInputText: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 14,
      color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase", letterSpacing: "2px", marginBottom: 20,
    },
    focusBtn: {
      background: "#ffffff", color: "#000000", border: "none",
      borderRadius: 12, padding: "20px 40px", fontSize: "16px",
      fontWeight: 700, letterSpacing: "1px", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", transition: "transform 0.2s",
      width: "100%", maxWidth: "300px", boxShadow: "0 0 30px rgba(255,255,255,0.2)",
    },
    closingText: {
      fontSize: "clamp(22px, 6vw, 28px)", fontWeight: 300, fontStyle: "italic",
      letterSpacing: "1px", margin: 0, lineHeight: 1.4,
      opacity: showClosing ? 1 : 0,
      transition: "opacity 1.2s ease-in-out",
    },
    sessionLine: {
      fontFamily: "'DM Sans', sans-serif", fontSize: 11,
      letterSpacing: "2px", textTransform: "uppercase",
      color: "rgba(255,255,255,0.3)", marginTop: 20,
      opacity: showClosing ? 1 : 0,
      transition: "opacity 1.5s ease-in-out 0.5s",
    },
    linesWrap: {
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 20,
    },
    line: (visible) => ({
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(22px, 6vw, 28px)",
      fontWeight: 300, fontStyle: "italic",
      color: "rgba(255,255,255,0.85)",
      letterSpacing: "1px", lineHeight: 1.5, margin: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    }),
    headerWrap: { position: "absolute", top: "10px", left: 0, width: "100%", zIndex: 10, opacity: 0.5 },
    backWrap:   { position: "absolute", bottom: "30px", left: "24px", zIndex: 10, opacity: 0.5 },
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes progressFill { 0% { width: 0%; } 100% { width: 100%; } }
      @keyframes heartbeat {
        0%  { transform: scale(0.8); opacity: 0.5; }
        20% { transform: scale(1.1); opacity: 1; }
        40% { transform: scale(0.9); opacity: 0.7; }
        60% { transform: scale(1.15); opacity: 1; }
        100%{ transform: scale(0.8); opacity: 0.5; }
      }
      @keyframes breathe {
        0%   { transform: scale(0.5); opacity: 0.3; }
        45%  { transform: scale(1.5); opacity: 0.8; }
        55%  { transform: scale(1.5); opacity: 0.8; }
        100% { transform: scale(0.5); opacity: 0.3; }
      }
      @keyframes breatheSoft {
        0%   { transform: scale(0.8); opacity: 0.3; }
        50%  { transform: scale(1.4); opacity: 0.6; }
        100% { transform: scale(0.8); opacity: 0.3; }
      }
      @keyframes phaseFillTap     { 0% { width: 0%; } 100% { width: 100%; } }
      @keyframes phaseFillBreathe { 0% { width: 0%; } 100% { width: 100%; } }
    `;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  const orbSizeSmall = "clamp(90px, 28vw, 120px)";
  const orbSizeLarge = "clamp(140px, 45vw, 200px)";
  const orbStyle = (size, animation) => ({ ...s.orb, width: size, height: size, animation });

  return (
    <div style={s.page}>
      <div style={s.progressBar} />
      <div style={s.headerWrap}><BrandHeader T={T} /></div>
      <div style={s.backWrap}><BackButton setTab={setTab} destination="home" T={T} lang={lang} /></div>

      <div style={s.content}>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={s.earphoneText}>🎧 Best with earphones</p>
            <p style={s.text}>Use your non-dominant hand.</p>
          </div>
        )}

        {step === 2 && <p style={s.text}>Pause.</p>}

        {step === 3 && (
          <>
            <p style={s.text}>You're here.</p>
            <div style={s.breathingDot} />
          </>
        )}

        {step === 4 && (
          <p style={{ ...s.text, fontSize: "28px", opacity: 0.7 }}>Follow this...</p>
        )}

        {step === 5 && (
          <>
            <p style={{ ...s.text, fontSize: "32px", opacity: 0.8 }}>Tap with the rhythm</p>
            <div
              style={{
                ...s.orbWrap,
                width: "clamp(144px, 45vw, 192px)",
                height: "clamp(144px, 45vw, 192px)",
                margin: "32px auto",
              }}
              onClick={() => { if (window.navigator.vibrate) window.navigator.vibrate(50); }}
            >
              <div style={orbStyle(orbSizeSmall, "heartbeat 1s infinite")} />
            </div>
            <div style={s.phaseBarWrap}><div style={s.phaseBarTap} /></div>
            <p style={s.anchorText}>Stay with this</p>
          </>
        )}

        {step === 6 && (
          <>
            <p style={{ ...s.text, fontSize: "32px", opacity: 0.8 }}>Follow this rhythm</p>
            <div style={{
              ...s.orbWrap,
              width: "clamp(224px, 72vw, 320px)",
              height: "clamp(224px, 72vw, 320px)",
              margin: "24px auto",
            }}>
              <div style={orbStyle(orbSizeLarge, "breathe 8s ease-in-out infinite")} />
            </div>
            <div style={s.phaseBarWrap}><div style={s.phaseBarBreathe} /></div>
          </>
        )}

        {step === 7 && <p style={s.text}>Good.</p>}
        {step === 8 && <p style={s.text}>Now...</p>}

        {step === 10 && (
          <>
            <p style={s.text}>What matters most right now?</p>
            <div style={s.focusWrap}>
              <p style={s.focusInputText}>Hold the answer in your mind</p>
              <button
                onClick={handleFocusClick}
                style={s.focusBtn}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                onTouchStart={e => e.currentTarget.style.transform = "scale(0.95)"}
                onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
              >
                FOCUS ON ONE THING
              </button>
            </div>
          </>
        )}

        {step === 12 && (
          <>
            <p style={s.closingText}>{closingLine}</p>
            {resetCount >= 1 && (
              <p style={s.sessionLine}>This is here.</p>
            )}
          </>
        )}

        {step === 13 && (
          <div style={s.linesWrap}>
            <p style={s.line(line1)}>This is your space.</p>
            <p style={s.line(line2)}>No pressure. No noise.</p>
          </div>
        )}

      </div>
    </div>
  );
}