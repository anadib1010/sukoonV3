import React, { useState, useRef, useEffect } from 'react';

export function SoundBath({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [resonanceLevel, setResonanceLevel] = useState(0); 
  const [selectedFreq, setSelectedFreq] = useState(108); 
  
  const bowlRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const lastAngleRef = useRef(null);

  const FREQUENCIES = [
    { name: isHindi ? "ब्रह्मांडीय नाद (108 Hz)" : "Cosmic Hum (108 Hz)", value: 108 },
    { name: isHindi ? "आधार ऊर्जा (174 Hz)" : "Earth Foundation (174 Hz)", value: 174 },
    { name: isHindi ? "गहराव (216 Hz)" : "Deep Grounding (216 Hz)", value: 216 },
    { name: isHindi ? "मुक्ति (396 Hz)" : "Release Fear (396 Hz)", value: 396 },
    { name: isHindi ? "शांति (432 Hz)" : "Healing Calm (432 Hz)", value: 432 },
    { name: isHindi ? "परिवर्तन (528 Hz)" : "Transformation (528 Hz)", value: 528 }
  ];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      
      oscillatorRef.current = audioCtxRef.current.createOscillator();
      oscillatorRef.current.type = 'sine'; 
      oscillatorRef.current.frequency.value = selectedFreq; 
      
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.value = 0; 
      
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioCtxRef.current.destination);
      
      oscillatorRef.current.start();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

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
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
    }
  };

  const calculateMovement = (e) => {
    if (!bowlRef.current) return;
    const rect = bowlRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    
    if (lastAngleRef.current !== null) {
      let angleDiff = Math.abs(angle - lastAngleRef.current);
      if (angleDiff > 0.05) { 
        setResonanceLevel(prev => Math.min(100, prev + 1));
        if (gainNodeRef.current) {
          const targetGain = (resonanceLevel / 100) * 0.5;
          gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
        }
      }
    }
    lastAngleRef.current = angle;
  };

  useEffect(() => {
    if (!isPlaying && resonanceLevel > 0) {
      const interval = setInterval(() => setResonanceLevel(prev => Math.max(0, prev - 2)), 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, resonanceLevel]);

  const changeFrequency = (e) => {
    const newFreq = Number(e.target.value);
    setSelectedFreq(newFreq);
    if (oscillatorRef.current && audioCtxRef.current) {
      oscillatorRef.current.frequency.setTargetAtTime(newFreq, audioCtxRef.current.currentTime, 0.1);
    }
  };

  const glowIntensity = resonanceLevel / 100;
  const bowlColor = `rgba(212, 175, 55, ${0.3 + (glowIntensity * 0.7)})`; 

  return (
    <div 
      style={{
        height: "100%", width: "100%", backgroundColor: "#0a0a0f", 
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", userSelect: "none", touchAction: "none" 
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); setTab('resonance'); }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      <div style={{
        position: 'absolute', top: '12%', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: resonanceLevel > 50 ? 0 : 1, transition: 'opacity 2s ease', pointerEvents: 'none'
      }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: 'rgba(255,255,255,0.9)', fontWeight: 300, margin: '0 0 8px', letterSpacing: '1px' }}>
          {isHindi ? "ध्वनि स्नान" : "Sound Bath"}
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', margin: '0 0 16px' }}>
          {isHindi ? "कटोरे के किनारे के चारों ओर खोजें।" : "Trace in circles along the rim."}
        </p>
        
        {/* ─── HEADPHONE BADGE ─── */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          padding: '6px 16px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ fontSize: '14px' }}>🎧</span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px' }}>
            {isHindi ? "हेडफोन या इयरफ़ोन का उपयोग करें" : "Use Headphones or Earphones"}
          </span>
        </div>
      </div>

      <div 
        ref={bowlRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "250px", height: "250px", borderRadius: "50%",
          border: `4px solid ${bowlColor}`,
          boxShadow: `0 0 ${20 + (resonanceLevel * 2)}px ${bowlColor}, inset 0 0 ${10 + resonanceLevel}px ${bowlColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "box-shadow 0.1s ease, border-color 0.1s ease", cursor: "grab",
          marginBottom: "40px", marginTop: "20px"
        }}
      >
        <div style={{
          width: `${50 + (resonanceLevel * 1.5)}%`, height: `${50 + (resonanceLevel * 1.5)}%`,
          borderRadius: "50%", backgroundColor: `rgba(212, 175, 55, ${glowIntensity * 0.2})`,
          transition: "all 0.1s ease"
        }} />
      </div>

      <div style={{ zIndex: 20 }}>
        <select 
          value={selectedFreq} 
          onChange={changeFrequency}
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "10px 15px",
            borderRadius: "20px",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "16px",
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            textAlign: "center"
          }}
        >
          {FREQUENCIES.map((freq) => (
            <option key={freq.value} value={freq.value} style={{ backgroundColor: "#0a0a0f", color: "#fff" }}>
              {freq.name}
            </option>
          ))}
        </select>
      </div>
      
    </div>
  );
}