import React, { useState, useRef, useEffect } from 'react';

export function SoundBath({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [resonanceLevel, setResonanceLevel] = useState(0); // 0 to 100
  const bowlRef = useRef(null);
  
  // Audio references
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const lastAngleRef = useRef(null);

  // ─── AUDIO SETUP ───
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      
      // The Singing Bowl Frequency (e.g., 432Hz or a deep 216Hz)
      oscillatorRef.current = audioCtxRef.current.createOscillator();
      oscillatorRef.current.type = 'sine'; // Smooth, pure tone
      oscillatorRef.current.frequency.value = 216; 
      
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.value = 0; // Start silent
      
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioCtxRef.current.destination);
      
      oscillatorRef.current.start();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Cleanup audio when leaving the page
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // ─── INTERACTION LOGIC ───
  const handlePointerDown = (e) => {
    initAudio();
    setIsPlaying(true);
    calculateMovement(e);
  };

  const handlePointerMove = (e) => {
    if (!isPlaying) return;
    calculateMovement(e);
  };

  const handlePointerUp = () => {
    setIsPlaying(false);
    lastAngleRef.current = null;
    
    // Fade out the sound beautifully instead of an abrupt cut
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
    }
  };

  const calculateMovement = (e) => {
    if (!bowlRef.current) return;
    
    const rect = bowlRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Support both mouse and touch
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;

    // Calculate angle of finger around the center of the bowl
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    
    if (lastAngleRef.current !== null) {
      // If the finger is moving, increase the resonance (volume & glow)
      let angleDiff = Math.abs(angle - lastAngleRef.current);
      if (angleDiff > 0.05) { 
        setResonanceLevel(prev => Math.min(100, prev + 1));
        
        // Map resonance level to audio volume (max volume 0.5 so it's not too loud)
        if (gainNodeRef.current) {
          const targetGain = (resonanceLevel / 100) * 0.5;
          gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
        }
      }
    }
    lastAngleRef.current = angle;
  };

  // Slowly lose resonance if they stop spinning
  useEffect(() => {
    if (!isPlaying && resonanceLevel > 0) {
      const interval = setInterval(() => {
        setResonanceLevel(prev => Math.max(0, prev - 2));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, resonanceLevel]);


  // ─── VISUALS ───
  const glowIntensity = resonanceLevel / 100;
  const bowlColor = `rgba(212, 175, 55, ${0.3 + (glowIntensity * 0.7)})`; // Gold that gets brighter

  return (
    <div 
      style={{
        height: "100%", width: "100%",
        backgroundColor: "#0a0a0f", // Very dark, quiet room
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        userSelect: "none", touchAction: "none" // Prevent screen scrolling while playing
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); setTab('resonance'); }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── INSTRUCTION ─── */}
      <div style={{
        position: 'absolute', top: '15%', textAlign: 'center',
        opacity: resonanceLevel > 50 ? 0 : 1, // Fades out as they get into the zone
        transition: 'opacity 2s ease', pointerEvents: 'none'
      }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: 'rgba(255,255,255,0.8)', fontWeight: 300, margin: '0 0 10px' }}>
          {isHindi ? "ध्वनि स्नान" : "Sound Bath"}
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
          {isHindi ? "कटोरे के किनारे के चारों ओर खोजें।" : "Trace in circles along the rim."}
        </p>
      </div>

      {/* ─── THE BOWL ─── */}
      <div 
        ref={bowlRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "250px", height: "250px",
          borderRadius: "50%",
          border: `4px solid ${bowlColor}`,
          boxShadow: `0 0 ${20 + (resonanceLevel * 2)}px ${bowlColor}, inset 0 0 ${10 + resonanceLevel}px ${bowlColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "box-shadow 0.1s ease, border-color 0.1s ease",
          cursor: "grab"
        }}
      >
        {/* Center Water Ripple Effect */}
        <div style={{
          width: `${50 + (resonanceLevel * 1.5)}%`,
          height: `${50 + (resonanceLevel * 1.5)}%`,
          borderRadius: "50%",
          backgroundColor: `rgba(212, 175, 55, ${glowIntensity * 0.2})`,
          transition: "all 0.1s ease"
        }} />
      </div>
      
    </div>
  );
}