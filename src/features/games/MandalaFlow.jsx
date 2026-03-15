import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [mandalaDNA, setMandalaDNA] = useState(null);
  
  const isHindi = lang === "Hindi";

  // ─── 1. INITIALIZE RANDOM DNA ───
  useEffect(() => {
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.2 + Math.random() * 0.6, // Changes how "flowery" or "sharp" petals are
      seedType: Math.random() > 0.5 ? 'circle' : 'diamond'
    });
  }, []);

  // ─── 2. CANVAS SETUP & SPIN ANIMATION ───
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let animationFrame;
    const animate = () => {
      if (pullCount >= 6) {
        setRotation(prev => prev + 0.2); // Very slow, meditative spin
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [pullCount]);

  const handlePointerDown = () => {
    if (pullCount < 6) setIsActive(true);
  };

  const handlePointerUp = () => {
    setIsActive(false);
    if (pullCount < 6) setPullCount(prev => prev + 1);
  };

  const handlePointerMove = (e) => {
    if (!isActive || !mandalaDNA) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Calculate distance and angle relative to center
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Limits the growth to a circular bounds (perfect width/breadth)
    const MAX_RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.45;
    if (distance > MAX_RADIUS) return;

    const { symmetry, hueStart, curvePower, seedType } = mandalaDNA;

    ctx.save();
    ctx.translate(centerX, centerY);
    // Apply the cumulative rotation if locked
    ctx.rotate((rotation * Math.PI) / 180);

    for (let i = 0; i < symmetry; i++) {
      ctx.rotate((Math.PI * 2) / symmetry);
      
      const currentHue = (hueStart + (distance / MAX_RADIUS) * 40) % 360;
      ctx.strokeStyle = `hsla(${currentHue}, 70%, 60%, 0.1)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsla(${currentHue}, 80%, 50%, 0.4)`;
      ctx.lineWidth = 1.5;

      // Draw the mirrored petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        distance * curvePower, distance * 0.2, 
        distance, 0
      );
      ctx.quadraticCurveTo(
        distance * curvePower, -distance * 0.2, 
        0, 0
      );
      ctx.stroke();

      // Optional geometric seeds
      if (seedType === 'circle') {
        ctx.beginPath();
        ctx.arc(distance, 0, 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  const resetGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPullCount(0);
    setRotation(0);
    // New DNA for new game
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.2 + Math.random() * 0.6,
      seedType: Math.random() > 0.5 ? 'circle' : 'diamond'
    });
  };

  return (
    <div style={{ 
      height: '100%', width: '100%', backgroundColor: '#000', 
      position: 'relative', overflow: 'hidden', touchAction: 'none' 
    }}>
      
      {/* ─── UI ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: 20 }}>
        <button onClick={() => setTab('resonance')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
        <button onClick={resetGame} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 }}>
          {isHindi ? "पुनः आरंभ" : "RESTART"}
        </button>
      </div>

      <div style={{
        position: 'absolute', top: 24, right: 24, 
        color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: 10
      }}>
        {pullCount < 6 ? `${pullCount} / 6` : (isHindi ? "पूर्ण" : "LOCKED")}
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ 
          cursor: 'crosshair', 
          width: '100%', height: '100%',
          transform: pullCount >= 6 ? `rotate(${rotation}deg)` : 'none',
          transition: pullCount >= 6 ? 'none' : 'transform 0.5s ease'
        }}
      />
      
      {pullCount === 0 && (
        <div style={{ 
          position: 'absolute', top: '55%', width: '100%', textAlign: 'center', 
          pointerEvents: 'none', color: 'rgba(255,255,255,0.15)',
          fontFamily: "'Cormorant Garamond', serif", letterSpacing: 4
        }}>
          {isHindi ? "केंद्र से बाहर खींचें" : "PULL FROM CENTER"}
        </div>
      )}
    </div>
  );
}