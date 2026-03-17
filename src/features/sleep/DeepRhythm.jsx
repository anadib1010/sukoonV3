import React, { useState, useEffect, useRef } from 'react';

export function DeepRhythm({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const wakeLockRef = useRef(null); 

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";

  // ─── SCREEN WAKE LOCK ───
  useEffect(() => {
    const requestWakeLock = async () => {
      if (isPlaying && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.error("Wake Lock failed:", err);
        }
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isPlaying]);

  // ─── 30-MINUTE AUTO FADE OUT ───
  useEffect(() => {
    let timeoutId;
    
    if (isPlaying) {
      // Set a timer for 30 minutes (1,800,000 milliseconds)
      timeoutId = setTimeout(() => {
        // Trigger a very slow, 10-second fade out so it doesn't jolt them awake
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 5);
          
          setTimeout(() => {
            if (audioCtxRef.current) audioCtxRef.current.suspend();
            setIsPlaying(false); // This updates the UI and releases the wake lock
          }, 10000);
        }
      }, 1800000); 
    }

    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  // ─── AUDIO ENGINE ───
  const toggleAudio = () => {
    if (!isPlaying) {
      if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 85; 

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0; 
        gainNodeRef.current = gainNode;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
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
        setTimeout(() => {
          if (audioCtxRef.current) audioCtxRef.current.suspend();
        }, 500);
      }
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
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
        <p style={{ color: dimAmber, opacity: 0.6, fontSize: 16, marginBottom: 12, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", padding: '0 20px' }}>
          {hi ? "एक धीमी गूंज जो रात में घुल जाती है।" : "A slow, steady hum that fades into the night."}
        </p>
        
        {/* NEW: Explicitly stating the 30-minute duration */}
        <p style={{ color: dimAmber, opacity: 0.3, fontSize: 13, marginBottom: 50, letterSpacing: 1 }}>
          {hi ? "30 मिनट के बाद स्वतः बंद हो जाएगा" : "Auto-fades after 30 minutes"}
        </p>

        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              boxShadow: isPlaying ? `0 0 30px rgba(184, 93, 25, 0.6)` : 'none'
            }}
          >
            {isPlaying ? (hi ? "रोकें" : "PAUSE") : (hi ? "सुनें" : "PLAY")}
          </button>
        </div>
      </div>

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