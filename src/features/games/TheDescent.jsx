import React, { useState, useEffect, useRef } from 'react';

export function TheDescent({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [phase, setPhase] = useState('intro');
  const [depth, setDepth] = useState(0);
  const requestRef = useRef();
  const holdStartTime = useRef(0);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const startSound = () => {
    if (audioCtxRef.current) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContext();
    oscillatorRef.current = audioCtxRef.current.createOscillator();
    oscillatorRef.current.type = 'sine';
    oscillatorRef.current.frequency.setValueAtTime(60, audioCtxRef.current.currentTime);
    gainNodeRef.current = audioCtxRef.current.createGain();
    gainNodeRef.current.gain.setValueAtTime(0.01, audioCtxRef.current.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0.2, audioCtxRef.current.currentTime + 5);
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioCtxRef.current.destination);
    oscillatorRef.current.start();
  };

  const stopSound = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 3);
      setTimeout(() => {
        if (oscillatorRef.current) { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); oscillatorRef.current = null; }
        if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
      }, 3000);
    }
  };

  const updateDescent = () => {
    setDepth(prev => prev + 0.005);
    requestRef.current = requestAnimationFrame(updateDescent);
  };

  const handleTouchStart = (e) => {
    if (e.cancelable) e.preventDefault();
    if (phase === 'slipping') return;
    setPhase('descending');
    holdStartTime.current = Date.now();
    requestRef.current = requestAnimationFrame(updateDescent);
    startSound();
  };

  const handleTouchEnd = () => {
    if (phase === 'slipping') return;
    cancelAnimationFrame(requestRef.current);
    const holdDuration = Date.now() - holdStartTime.current;
    if (holdDuration < 5000) { setPhase('intro'); setDepth(0); }
    else { setPhase('slipping'); stopSound(); }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const currentPulseDuration = Math.min(3 + (depth * 0.1), 12);
  const translateY = Math.min(depth * 3, window.innerHeight * 0.4);
  const orbOpacity = Math.max(1 - (depth * 0.015), 0);
  const bgLightness = Math.max(8 - (depth * 0.2), 0);

  const s = {
    page: {
      height: "100%", width: "100%",
      backgroundColor: phase === 'slipping' ? '#000000' : `hsl(220, 20%, ${bgLightness}%)`,
      transition: phase === 'slipping' ? 'background-color 15s ease-out' : 'background-color 0.5s ease',
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      userSelect: "none", WebkitUserSelect: "none", cursor: "pointer",
    },
    nav: {
      position: "absolute", top: 20, left: 20, right: 20, zIndex: 10,
      display: "flex", justifyContent: "space-between",
      opacity: phase === 'intro' ? 1 : 0, transition: "opacity 1s ease",
      pointerEvents: phase === 'intro' ? 'auto' : 'none',
    },
    backBtn: {
      background: "transparent", border: "none", color: "#fff",
      fontSize: 14, opacity: 0.6, cursor: "pointer", zIndex: 9999, pointerEvents: "all",
    },
    instrWrap: {
      position: "absolute", top: "25%", textAlign: "center",
      opacity: phase === 'intro' ? 1 : Math.max(1 - (depth * 0.1), 0),
      transition: phase === 'slipping' ? 'opacity 15s ease' : 'opacity 1s ease',
      pointerEvents: "none", padding: "0 30px",
    },
    instrTitle: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 6vw, 36px)",
      fontWeight: 300, color: "rgba(255,255,255,0.9)", margin: "0 0 16px 0", letterSpacing: "1px",
    },
    instrBody: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "18px",
      color: "rgba(255,255,255,0.6)", fontStyle: "italic", lineHeight: 1.5,
    },
    orb: {
      width: "120px", height: "120px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,180,100,0.8) 0%, rgba(255,100,50,0.2) 70%, transparent 100%)",
      animation: `heartbeatPulse ${currentPulseDuration}s ease-in-out infinite`,
      opacity: phase === 'slipping' ? 0 : orbOpacity,
      transition: phase === 'slipping' ? 'opacity 15s ease-out' : 'opacity 0.2s',
      pointerEvents: "none", marginTop: "15vh",
    },
    goodnightWrap: {
      position: "absolute", bottom: "20%",
      opacity: phase === 'slipping' ? 1 : 0, transition: "opacity 4s ease",
      pointerEvents: "none",
    },
    goodnightText: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "18px",
      color: "rgba(255,255,255,0.3)", fontStyle: "italic",
    },
  };

  return (
    <div
      onMouseDown={handleTouchStart} onMouseUp={handleTouchEnd} onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      style={s.page}
    >
      <style>{`
        @keyframes heartbeatPulse {
          0%   { transform: scale(0.95) translateY(${translateY}px); box-shadow: 0 0 20px 5px rgba(255,120,50,0.2); }
          50%  { transform: scale(1.05) translateY(${translateY}px); box-shadow: 0 0 60px 20px rgba(255,120,50,0.6); }
          100% { transform: scale(0.95) translateY(${translateY}px); box-shadow: 0 0 20px 5px rgba(255,120,50,0.2); }
        }
      `}</style>

      <div style={s.nav}>
        <button onClick={(e) => { e.stopPropagation(); setTab('vault'); }} style={s.backBtn}>
          ← {hi ? "वापस" : "Back"}
        </button>
      </div>

      <div style={s.instrWrap}>
        <h2 style={s.instrTitle}>{hi ? "गहराई" : "The Descent"}</h2>
        <p style={s.instrBody}>
          {hi
            ? "स्क्रीन पर अपना अंगूठा रखें।\nजब नींद आए, तो इसे फिसलने दें।"
            : "Rest your thumb on the light.\nWhen sleep comes, let it slip away."}
        </p>
      </div>

      <div style={s.orb} />

      <div style={s.goodnightWrap}>
        <p style={s.goodnightText}>{hi ? "शुभ रात्रि।" : "Goodnight."}</p>
      </div>
    </div>
  );
}

export default TheDescent;
