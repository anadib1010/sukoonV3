import React, { useState, useEffect, useRef } from 'react';

const trueBlack = "#000000";
const dimAmber  = "rgba(184, 93, 25, 0.85)";

export function DeepRhythm({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if (isPlaying && "wakeLock" in navigator) {
        try { wakeLockRef.current = await navigator.wakeLock.request("screen"); } catch (err) {}
      }
    };
    if (isPlaying) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; }
    }
    return () => {
      if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; }
    };
  }, [isPlaying]);

  useEffect(() => {
    let timeoutId;
    if (isPlaying) {
      timeoutId = setTimeout(() => {
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 5);
          setTimeout(() => {
            if (audioCtxRef.current) audioCtxRef.current.suspend();
            setIsPlaying(false);
          }, 10000);
        }
      }, 1800000);
    }
    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  const toggleAudio = () => {
    if (!isPlaying) {
      if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 85;
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0;
        gainNodeRef.current = gainNode;
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.4;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        lfo.start();
      }
      audioCtxRef.current.resume();
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 2);
      }
      setIsPlaying(true);
    } else {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        setTimeout(() => { if (audioCtxRef.current) audioCtxRef.current.suspend(); }, 500);
      }
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => { if (audioCtxRef.current) audioCtxRef.current.close(); };
  }, []);

  const s = {
    page: {
      height: "100%", width: "100%", backgroundColor: trueBlack,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    },
    backWrap: { position: "absolute", top: 20, left: 20 },
    backBtn: { background: "none", border: "none", color: dimAmber, opacity: 0.6, cursor: "pointer", fontSize: 16 },
    content: { textAlign: "center", zIndex: 2 },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 28,
      color: dimAmber, fontWeight: 300, marginBottom: 16,
    },
    subtitle: {
      color: dimAmber, opacity: 0.5, fontSize: 16, marginBottom: 12,
      fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", padding: "0 20px",
    },
    autoFade: { color: dimAmber, opacity: 0.6, fontSize: 13, marginBottom: 50, letterSpacing: 1 },
    orbWrap: {
      position: "relative", width: 120, height: 120,
      margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center",
    },
    ripple: (delay) => ({
      position: "absolute", width: "100%", height: "100%",
      borderRadius: "50%", border: `1px solid ${dimAmber}`,
      animation: `ripple 6.6s infinite linear ${delay}`,
    }),
    playBtn: {
      width: 80, height: 80, borderRadius: "50%",
      background: "transparent", border: `1px solid ${dimAmber}`, color: dimAmber,
      fontSize: 14, letterSpacing: 2, cursor: "pointer", zIndex: 10, transition: "all 0.3s",
      boxShadow: isPlaying ? `0 0 30px rgba(184, 93, 25, 0.2)` : "none",
    },
    disclaimer: {
      position: "absolute", bottom: 20, width: "100%", textAlign: "center",
      opacity: 0.3, fontSize: "11px", color: dimAmber,
    },
  };

  return (
    <div style={s.page}>
      <div style={s.backWrap}>
        <button onClick={() => setTab("sleep")} style={s.backBtn}>
          ← {hi ? "वापस" : "Back"}
        </button>
      </div>

      <div style={s.content}>
        <h2 style={s.title}>{hi ? "गहरी लय" : "Deep Rhythm"}</h2>
        <p style={s.subtitle}>
          {hi ? "एक धीमी गूंज जो रात में घुल जाती है।" : "A slow, steady hum that fades into the night."}
        </p>
        <p style={s.autoFade}>{hi ? "30 मिनट के बाद स्वतः बंद हो जाएगा" : "Auto-fades after 30 minutes"}</p>

        <div style={s.orbWrap}>
          {isPlaying && (
            <>
              <div style={s.ripple("0s")} />
              <div style={s.ripple("3.3s")} />
            </>
          )}
          <button onClick={toggleAudio} style={s.playBtn}>
            {isPlaying ? (hi ? "रोकें" : "PAUSE") : (hi ? "सुनें" : "PLAY")}
          </button>
        </div>
      </div>

      <div style={s.disclaimer}>
        {hi
          ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।"
          : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
