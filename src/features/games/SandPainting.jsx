import React, { useState, useEffect, useRef } from 'react';

export function SandPainting({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  // PHASES: 'draw' (creating) -> 'wind' (blowing away) -> 'empty' (gone)
  const [phase, setPhase] = useState('draw');
  const [hasDrawn, setHasDrawn] = useState(false);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const isDrawing = useRef(false);

  // ─── SETUP CANVAS ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set actual size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // ─── THE SAND BRUSH (DRAWING LOGIC) ───
  const startDrawing = (e) => {
    if (phase !== 'draw') return;
    isDrawing.current = true;
    if (!hasDrawn) setHasDrawn(true);
    dropSand(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const draw = (e) => {
    if (!isDrawing.current || phase !== 'draw') return;
    dropSand(e);
  };

  const dropSand = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Support both mouse and touch
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Get exact canvas coordinates
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Scatter 15 tiny "grains" of sand around the cursor
    for (let i = 0; i < 15; i++) {
      const offsetX = (Math.random() - 0.5) * 16;
      const offsetY = (Math.random() - 0.5) * 16;
      
      const colors = ['#d4af37', '#e6c27a', '#c5a059'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ─── IMPERMANENCE (THE WIND LOGIC) ───
  const releaseToTheWind = () => {
    if (phase !== 'draw') return;
    setPhase('wind');
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;

    // Scan the canvas to find every grain of sand
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newParticles = [];

    const step = 3; 
    
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 50) { 
          newParticles.push({
            x: x,
            y: y,
            vx: Math.random() * 4 + 2, 
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 1.5 + 0.5,
            alpha: 1,
            decay: Math.random() * 0.01 + 0.005 
          });
        }
      }
    }

    particlesRef.current = newParticles;
    ctx.clearRect(0, 0, width, height);
    animateWind();
  };

  const animateWind = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    particlesRef.current.forEach(p => {
      if (p.alpha <= 0) return;
      activeParticles++;

      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.vy += (Math.random() - 0.5) * 0.2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
      ctx.fill();
    });

    if (activeParticles > 0) {
      animationRef.current = requestAnimationFrame(animateWind);
    } else {
      setPhase('empty');
    }
  };

  return (
    <div style={{
      height: '100%', width: '100%', backgroundColor: '#000',
      position: 'relative', overflow: 'hidden', touchAction: 'none' 
    }}>
      
      {/* ─── CANVAS ─── */}
      <canvas 
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerOut={stopDrawing}
        style={{ 
          position: 'absolute', top: 0, left: 0, zIndex: 10, cursor: 'crosshair',
          // MAGIC FIX: Disables canvas clicking when not in 'draw' phase
          pointerEvents: phase === 'draw' ? 'auto' : 'none' 
        }}
      />

      {/* ─── UI / NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 30 }}>
        <button 
          onClick={() => setTab(null)} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}
        >
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── INSTRUCTIONS ─── */}
      {phase === 'draw' && (
        <div style={{ 
          position: 'absolute', top: 80, left: 0, width: '100%', textAlign: 'center', zIndex: 5,
          opacity: hasDrawn ? 0 : 1, transition: 'opacity 2s ease', pointerEvents: 'none' 
        }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fff', fontWeight: 300, margin: '0 0 10px' }}>
            {isHindi ? "रेत की चित्रकारी" : "Sand Painting"}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
            {isHindi ? "कुछ सुंदर बनाएं..." : "Create something beautiful..."}
          </p>
        </div>
      )}

      {/* ─── THE WIND BUTTON ─── */}
      {phase === 'draw' && hasDrawn && (
        <div style={{ position: 'absolute', bottom: 40, left: 0, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 20, animation: 'fadeIn 2s ease' }}>
          <button 
            onClick={releaseToTheWind}
            style={{
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212, 175, 55, 0.5)', color: '#d4af37',
              padding: '12px 40px', borderRadius: 30, fontSize: 16, cursor: 'pointer',
              fontFamily: "'Cormorant Garamond', serif", letterSpacing: 2, backdropFilter: 'blur(4px)',
              transition: 'all 0.3s ease'
            }}
          >
            {isHindi ? "हवा को बहने दें" : "Let the Wind Blow!"}
          </button>
        </div>
      )}

      {/* ─── THE VOID (END STATE) ─── */}
      {phase === 'empty' && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          zIndex: 20, // MAGIC FIX: Pulls this UI screen to the very front
          animation: 'fadeIn 3s ease' 
        }}>
          <p style={{ color: '#d4af37', fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', letterSpacing: 1 }}>
            {isHindi ? "कुछ भी हमेशा के लिए नहीं रहता।" : "Nothing lasts forever."}
          </p>
          <button 
            onClick={() => {
              particlesRef.current = []; // Clean up old memory
              setPhase('draw');
              setHasDrawn(false);
            }}
            style={{ marginTop: 30, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2, fontSize: 14 }}
          >
            {isHindi ? "पुनः आरंभ करें" : "Begin Again"}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}