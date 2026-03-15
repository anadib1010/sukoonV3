import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const [mandalaDNA, setMandalaDNA] = useState(null);
  
  const isHindi = lang === "Hindi";

  // ─── 1. SETUP DNA (Once per session) ───
  useEffect(() => {
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4
    });
  }, []);

  // ─── 2. INITIAL CANVAS SETUP (Run once) ───
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Pure black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handlePointerDown = (e) => {
    if (pullCount < 6) {
      setIsActive(true);
      // Start the stroke immediately at the center
      draw(e); 
    }
  };

  const handlePointerUp = () => {
    if (isActive) {
      setIsActive(false);
      setPullCount(prev => prev + 1);
    }
  };

  const draw = (e) => {
    if (!isActive || !mandalaDNA) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Ensure it stays circular (Diameter approx 300-350px on mobile)
    const MAX_ALLOWED = Math.min(window.innerWidth, window.innerHeight) * 0.44;
    const drawDist = Math.min(distance, MAX_ALLOWED);

    const { symmetry, hueStart, curvePower } = mandalaDNA;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < symmetry; i++) {
      ctx.rotate((Math.PI * 2) / symmetry);
      
      const currentHue = (hueStart + (drawDist / MAX_ALLOWED) * 50) % 360;
      ctx.strokeStyle = `hsla(${currentHue}, 80%, 60%, 0.12)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${currentHue}, 80%, 50%, 0.4)`;
      ctx.lineWidth = 2;

      // Draw the mirrored petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        drawDist * curvePower, drawDist * 0.3, 
        drawDist, 0
      );
      ctx.quadraticCurveTo(
        drawDist * curvePower, -drawDist * 0.3, 
        0, 0
      );
      ctx.stroke();
    }
    ctx.restore();
  };

  const resetGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPullCount(0);
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4
    });
  };

  return (
    <div style={{ 
      height: '100%', width: '100%', backgroundColor: '#000', 
      position: 'relative', overflow: 'hidden', touchAction: 'none' 
    }}>
      
      {/* ─── UI ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, display: 'flex', gap: 20 }}>
        <button onClick={() => setTab('resonance')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer' }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
        <button onClick={resetGame} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2, cursor: 'pointer' }}>
          {isHindi ? "पुनः आरंभ" : "RESTART"}
        </button>
      </div>

      {/* Progress Counter */}
      <div style={{
        position: 'absolute', top: 24, right: 24, zIndex: 20,
        color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 12
      }}>
        {pullCount < 6 ? `${pullCount} / 6` : (isHindi ? "पूर्ण" : "LOCKED")}
      </div>

      {/* ─── THE CANVAS ─── */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={draw}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={pullCount >= 6 ? "mandala-spin" : ""}
        style={{ 
          cursor: 'crosshair', 
          width: '100%', height: '100%',
          display: 'block'
        }}
      />
      
      {pullCount === 0 && (
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', color: 'rgba(255,255,255,0.1)',
          fontFamily: "'Cormorant Garamond', serif", letterSpacing: 4, textAlign: 'center'
        }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>⦿</div>
          {isHindi ? "केंद्र से खींचें" : "PULL FROM CENTER"}
        </div>
      )}

      {/* ─── SPIN ANIMATION ─── */}
      <style>{`
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mandala-spin {
          animation: slowSpin 40s linear infinite;
        }
      `}</style>
    </div>
  );
}