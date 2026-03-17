import React, { useState, useEffect, useRef } from 'react';

export function DeepRhythm({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [isPlaying, setIsPlaying] = useState(false);
  
  // References to hold our audio engine
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";

  // ─── AUDIO ENGINE ───
  const toggleAudio = () => {
    if (!isPlaying) {
      // Start or Resume Audio
      if (!audioCtxRef.current) {
        // Initialize the Web Audio API
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        // Create the deep base sound (a low 85Hz sine wave)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 85; 

        // Create a volume control (Gain Node)
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0; // Start quiet so it doesn't pop
        gainNodeRef.current = gainNode;

        // Create a slow pulse (LFO) to make the hum rhythmically rise and fall
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15; // Very slow pulse

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.4; // How deep the pulse goes

        // Connect the wires
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Start playing
        osc.start();
        lfo.start();
      }
      
      // Fade the sound in gently
      audioCtxRef.current.resume();
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 2);
      }
      setIsPlaying(true);

    } else {
      // Pause Audio gently
      if (gainNodeRef.current && audioCtxRef.current) {
        // Fade out quickly to avoid a clicking noise
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        setTimeout(() => {
          if (audioCtxRef.current) audioCtxRef.current.suspend();
        }, 500);
      }
      setIsPlaying(false);
    }
  };

  // Clean up the audio if the user leaves the page while it's playing
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      <div style={{ textAlign: 'center', zIndex: 2 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 16 }}>
          {hi ? "गहरी लय" : "Deep Rhythm"}
        </h2>
        <p style={{ color: dimAmber, opacity: 0.5, fontSize: 16, marginBottom: 60, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", padding: '0 20px' }}>
          {hi ? "एक धीमी गूंज जो रात में घुल जाती है।" : "A slow, steady hum that fades into the night."}
        </p>

        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Visual Slow Pulse */}
          {isPlaying && (
            <>
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px solid ${dimAmber}`, animation: 'ripple 6.6s infinite linear' }} />
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px solid ${dimAmber}`, animation: 'ripple 6.6s infinite linear 3.3s' }} />
            </>
          )}
          
          <button 
            onClick={toggleAudio}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'transparent', border: `1px solid ${dimAmber}`, color: dimAmber,
              fontSize: 14, letterSpacing: 2, cursor: 'pointer', zIndex: 10, transition: 'all 0.3s',
              boxShadow: isPlaying ? `0 0 30px rgba(184, 93, 25, 0.2)` : 'none'
            }}
          >
            {isPlaying ? (hi ? "रोकें" : "PAUSE") : (hi ? "सुनें" : "PLAY")}
          </button>
        </div>
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.6, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}