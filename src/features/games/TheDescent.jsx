import React, { useState, useEffect, useRef } from 'react';

export function TheDescent({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  
  // States: 'intro' (waiting), 'descending' (thumb on screen), 'slipping' (thumb slipped, fading to sleep)
  const [phase, setPhase] = useState('intro'); 
  const [depth, setDepth] = useState(0); // 0 to 100+
  
  const requestRef = useRef();
  const holdStartTime = useRef(0);
  // ─── THE AUDIO ENGINE ───
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const startSound = () => {
    // Only start if it isn't already playing
    if (audioCtxRef.current) return; 

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContext();
    
    // Create a deep, humming sound
    oscillatorRef.current = audioCtxRef.current.createOscillator();
    oscillatorRef.current.type = 'sine'; // Smooth, pure tone
    oscillatorRef.current.frequency.setValueAtTime(60, audioCtxRef.current.currentTime); // 60Hz is a deep, sleepy hum

    // Control the volume
    gainNodeRef.current = audioCtxRef.current.createGain();
    gainNodeRef.current.gain.setValueAtTime(0.01, audioCtxRef.current.currentTime); // Start quiet
    
    // Gradually increase volume over 5 seconds
    gainNodeRef.current.gain.linearRampToValueAtTime(0.2, audioCtxRef.current.currentTime + 5);

    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioCtxRef.current.destination);
    oscillatorRef.current.start();
  };

  const stopSound = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      // Gently fade the sound out over 3 seconds so it isn't jarring
      gainNodeRef.current.gain.linearRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 3);
      
      // Stop and clean up after the fade out
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
      }, 3000);
    }
  };

  // ─── THE DESCENT ENGINE ───
  // This runs 60 times a second while the thumb is on the screen.
  const updateDescent = () => {
    setDepth((prevDepth) => {
      const newDepth = prevDepth + 0.005; // Adjust this number to make the descent faster or slower
      return newDepth;
    });
    requestRef.current = requestAnimationFrame(updateDescent);
  };

  // ─── TOUCH HANDLERS ───
  const handleTouchStart = (e) => {
    // Prevent default scrolling/zooming while holding
    if (e.cancelable) e.preventDefault(); 
    if (phase === 'slipping') return; // If already falling asleep, ignore touches

    setPhase('descending');
    holdStartTime.current = Date.now();
    requestRef.current = requestAnimationFrame(updateDescent);

    startSound();
  };

  const handleTouchEnd = () => {
    if (phase === 'slipping') return;
    
    cancelAnimationFrame(requestRef.current);
    
    const holdDuration = Date.now() - holdStartTime.current;
    
    // If they held it for less than 5 seconds, it was a mistake or they got distracted. Reset.
    if (holdDuration < 5000) {
      setPhase('intro');
      setDepth(0);
    } else {
      // THE MAGIC MOMENT: They held it for a long time, and their thumb slipped. 
      // They are falling asleep. Trigger the 15-second fade to black.
      setPhase('slipping');
      stopSound();
    }
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // ─── DYNAMIC STYLING MATH ───
  // As depth increases, the animation slows down (simulating a slowing heart rate)
  const currentPulseDuration = Math.min(3 + (depth * 0.1), 12); 
  
  // The orb physically sinks down the screen
  const translateY = Math.min(depth * 3, window.innerHeight * 0.4); 
  
  // The warm ember light fades into deep sea blue, then black
  const orbOpacity = Math.max(1 - (depth * 0.015), 0);
  
  // The background shifts from dark gray to absolute void black
  const bgLightness = Math.max(8 - (depth * 0.2), 0); 

  return (
    <div 
      // Universal mouse and touch events
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: phase === 'slipping' ? '#000000' : `hsl(220, 20%, ${bgLightness}%)`,
        transition: phase === 'slipping' ? 'background-color 15s ease-out' : 'background-color 0.5s ease',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        userSelect: "none", // Prevents text highlighting on long press
        WebkitUserSelect: "none",
        cursor: "pointer",
      }}
    >
      {/* ─── INJECTED CSS ANIMATIONS ─── */}
      <style>{`
        @keyframes heartbeatPulse {
          0% { transform: scale(0.95) translateY(${translateY}px); box-shadow: 0 0 20px 5px rgba(255, 120, 50, 0.2); }
          50% { transform: scale(1.05) translateY(${translateY}px); box-shadow: 0 0 60px 20px rgba(255, 120, 50, 0.6); }
          100% { transform: scale(0.95) translateY(${translateY}px); box-shadow: 0 0 20px 5px rgba(255, 120, 50, 0.2); }
        }
      `}</style>

      {/* ─── TOP NAVIGATION (Fades out when holding) ─── */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10, 
        display: 'flex', justifyContent: 'space-between',
        opacity: phase === 'intro' ? 1 : 0,
        transition: 'opacity 1s ease',
        pointerEvents: phase === 'intro' ? 'auto' : 'none'
      }}>
        <button onClick={() => setTab('vault')}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 14, opacity: 0.6 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── INSTRUCTIONAL TEXT (Fades out as they sink) ─── */}
      <div style={{
        position: 'absolute',
        top: '25%',
        textAlign: 'center',
        opacity: phase === 'intro' ? 1 : Math.max(1 - (depth * 0.1), 0),
        transition: phase === 'slipping' ? 'opacity 15s ease' : 'opacity 1s ease',
        pointerEvents: 'none',
        padding: '0 30px'
      }}>
        <h2 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: 'clamp(28px, 6vw, 36px)', 
          fontWeight: 300, 
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 16px 0',
          letterSpacing: '1px'
        }}>
          {hi ? "गहराई" : "The Descent"}
        </h2>
        <p style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '18px', 
          color: 'rgba(255,255,255,0.6)', 
          fontStyle: 'italic',
          lineHeight: 1.5
        }}>
          {hi 
            ? "स्क्रीन पर अपना अंगूठा रखें।\nजब नींद आए, तो इसे फिसलने दें।" 
            : "Rest your thumb on the light.\nWhen sleep comes, let it slip away."}
        </p>
      </div>

      {/* ─── THE ANCHOR ORB (The thumb target) ─── */}
      <div style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,180,100,0.8) 0%, rgba(255,100,50,0.2) 70%, transparent 100%)",
        // The animation dynamically updates its speed based on the depth!
        animation: `heartbeatPulse ${currentPulseDuration}s ease-in-out infinite`,
        opacity: phase === 'slipping' ? 0 : orbOpacity,
        transition: phase === 'slipping' ? 'opacity 15s ease-out' : 'opacity 0.2s',
        pointerEvents: 'none', // Touch is handled by the background container
        marginTop: "15vh" // Pushed down slightly so it's comfortable for the thumb
      }} />

      {/* ─── SLIPPING CONFIRMATION TEXT ─── */}
      {/* This only appears if their thumb slips off after holding it for a while */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        opacity: phase === 'slipping' ? 1 : 0,
        transition: 'opacity 4s ease',
        pointerEvents: 'none'
      }}>
        <p style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '18px', 
          color: 'rgba(255,255,255,0.3)', 
          fontStyle: 'italic',
        }}>
          {hi ? "शुभ रात्रि।" : "Goodnight."}
        </p>
      </div>

    </div>
  );
}

export default TheDescent;