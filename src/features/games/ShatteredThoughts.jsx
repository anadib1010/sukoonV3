import React, { useState, useEffect, useRef } from 'react';

export function ShatteredThoughts({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  
  // ─── PHASES: 'compose' -> 'shattering' -> 'resolved' ───
  const [phase, setPhase] = useState('compose');
  const [text, setText] = useState("");
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleShatter = () => {
    if (!text.trim() || phase !== 'compose') return;
    
    setPhase('shattering');
    createParticlesFromText();
  };

  const createParticlesFromText = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas to actual screen size
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw the text temporarily to read its pixels
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.font = "40px 'Cormorant Garamond', serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text if needed, but for a single thought, center it
    ctx.fillText(text, width / 2, height / 2);

    // 2. Scan the canvas for pixels to turn into stars
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newParticles = [];

    // Scan every 3rd pixel to keep mobile performance smooth (Density)
    const step = 3; 
    
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        // If the pixel is visible (part of the text)
        if (alpha > 128) {
          // Calculate distance from center for explosion direction
          const dx = x - width / 2;
          const dy = y - height / 2;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          newParticles.push({
            x: x,
            y: y,
            // Explode outward based on position, plus some random chaos
            vx: (dx / distance) * (Math.random() * 3) + (Math.random() - 0.5) * 2,
            vy: (dy / distance) * (Math.random() * 3) + (Math.random() - 0.5) * 2 - 1, // Slight upward draft
            size: Math.random() * 1.5 + 0.5, // Star size
            alpha: 1,
            decay: Math.random() * 0.015 + 0.005 // How fast it fades
          });
        }
      }
    }

    particlesRef.current = newParticles;
    
    // Clear the solid text so we only see the particles
    ctx.clearRect(0, 0, width, height);
    
    // Start the physics engine
    animateParticles();
  };

  const animateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    particlesRef.current.forEach(p => {
      if (p.alpha <= 0) return; // Skip dead stars
      activeParticles++;

      // Update physics
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      // Draw Star
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`; // Golden stars
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(212, 175, 55, ${p.alpha})`;
      ctx.fill();
    });

    if (activeParticles > 0) {
      animationRef.current = requestAnimationFrame(animateParticles);
    } else {
      // Once all stars are gone, show the final message
      setPhase('resolved');
    }
  };

  const resetFlow = () => {
    setPhase('compose');
    setText("");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div style={{
      height: "100%", width: "100%", backgroundColor: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden"
    }}>
      
      {/* ─── CANVAS LAYER (Always behind UI) ─── */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', top: 0, left: 0, 
          width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 
        }} 
      />

      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}>
        <button 
          onClick={() => setTab('stillness')} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}
        >
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── PHASE 1: COMPOSE ─── */}
      {phase === 'compose' && (
        <div style={{ textAlign: 'center', width: '80%', maxWidth: 400, zIndex: 20 }}>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', marginBottom: 40, fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', serif", fontSize: 18
          }}>
            {hi ? "उस विचार को लिखें जो आपको बांधता है..." : "Type the thought that binds you..."}
          </p>
          
          <input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="..."
            style={{
              background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 28, textAlign: 'center', width: '100%', outline: 'none',
              fontFamily: "'Cormorant Garamond', serif", paddingBottom: 10
            }}
          />
          
          <button 
            onClick={handleShatter}
            disabled={!text.trim()}
            style={{ 
              marginTop: 60, background: 'none', 
              border: text.trim() ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255,255,255,0.1)', 
              color: text.trim() ? '#d4af37' : 'rgba(255,255,255,0.2)', 
              padding: '12px 40px', borderRadius: 30, cursor: text.trim() ? 'pointer' : 'default',
              fontSize: 14, letterSpacing: 2, transition: 'all 0.3s ease'
            }}
          >
            {hi ? "सामना करें" : "CONFRONT"}
          </button>
        </div>
      )}

      {/* ─── PHASE 3: RESOLVED ─── */}
      {phase === 'resolved' && (
        <div 
          onClick={resetFlow} 
          style={{ 
            width: '100%', height: '100%', display: 'flex', zIndex: 20,
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ textAlign: 'center', animation: 'fadeIn 3s ease' }}>
            <p style={{ 
              color: '#d4af37', fontSize: 22, 
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              letterSpacing: 1
            }}>
              {hi ? "यह सिर्फ एक भ्रम था।" : "It was only an illusion."}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 20, letterSpacing: 1 }}>
              {hi ? "(जारी रखने के लिए कहीं भी टैप करें)" : "(Tap anywhere to continue)"}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}