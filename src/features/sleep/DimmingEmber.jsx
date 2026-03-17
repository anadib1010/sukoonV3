import React, { useState, useEffect } from 'react';

export function DimmingEmber({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [phase, setPhase] = useState('intro'); // intro, breathe
  const [breathState, setBreathState] = useState('inhale'); // inhale (4), hold (7), exhale (8)
  const [cycle, setCycle] = useState(0);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";

  useEffect(() => {
    if (phase !== 'breathe') return;

    let timer;
    if (breathState === 'inhale') {
      timer = setTimeout(() => setBreathState('hold'), 4000);
    } else if (breathState === 'hold') {
      timer = setTimeout(() => setBreathState('exhale'), 7000);
    } else if (breathState === 'exhale') {
      timer = setTimeout(() => {
        setCycle(c => c + 1);
        setBreathState('inhale');
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [breathState, phase]);

  const getInstruction = () => {
    if (breathState === 'inhale') return hi ? "सांस लें (4)" : "Inhale (4)";
    if (breathState === 'hold') return hi ? "रोकें (7)" : "Hold (7)";
    if (breathState === 'exhale') return hi ? "छोड़ें (8)" : "Exhale (8)";
  };

  // The ember gets dimmer with every cycle
  const emberOpacity = Math.max(0.1, 0.85 - (cycle * 0.1));

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      {phase === 'intro' ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, marginBottom: 20, fontWeight: 300 }}>
            {hi ? "बुझता हुआ अंगारा" : "Dimming Ember"}
          </h2>
          <p style={{ color: dimAmber, opacity: 0.7, fontSize: 16, lineHeight: 1.6, marginBottom: 40 }}>
            {hi 
              ? "4-7-8 श्वास अभ्यास। अंगारे की चमक के साथ सांस लें। जैसे-जैसे आप शांत होंगे, यह बुझता जाएगा।" 
              : "The 4-7-8 breathing technique. Breathe with the glow. As you calm down, the ember will slowly fade to black."}
          </p>
          <button onClick={() => setPhase('breathe')} style={{ background: 'transparent', border: `1px solid ${dimAmber}`, color: dimAmber, padding: '12px 40px', borderRadius: 30, fontSize: 16, cursor: 'pointer', opacity: 0.8 }}>
            {hi ? "शुरू करें" : "BEGIN"}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* The Breathing Ember */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            backgroundColor: dimAmber,
            opacity: emberOpacity,
            boxShadow: `0 0 40px 10px rgba(184, 93, 25, ${emberOpacity * 0.5})`,
            transform: breathState === 'inhale' ? 'scale(1.5)' : breathState === 'hold' ? 'scale(1.5)' : 'scale(0.8)',
            transition: breathState === 'inhale' ? 'transform 4s ease-out' : breathState === 'hold' ? 'transform 7s linear' : 'transform 8s ease-in-out',
            marginBottom: 60
          }} />

          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: dimAmber, letterSpacing: 2, transition: 'opacity 0.5s' }}>
            {getInstruction()}
          </p>
        </div>
      )}
    </div>
  );
}