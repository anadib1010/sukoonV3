import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const isHindi = lang === "Hindi";

  // Setting the max diameter to roughly 300px or screen width
  const MAX_RADIUS = Math.min(window.innerWidth, window.innerHeight, 350) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    // Clear the canvas to pure black at start
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handlePointerMove = (e) => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Calculate distance from center
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only draw if we are within the spreading bounds
    if (distance > MAX_RADIUS + 50) return;

    // Drawing settings
    const hue = (distance / MAX_RADIUS) * 60 + 200; // Shifts from blue to gold
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.15)`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.5)`;
    ctx.lineWidth = 2;

    // Create the 12-fold symmetry
    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < 12; i++) {
      ctx.rotate((Math.PI * 2) / 12);
      
      // Draw geometric "Petal"
      ctx.beginPath();
      // This math creates a flowery diamond shape that spreads outward
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(distance / 2, distance / 4, distance, 0);
      ctx.quadraticCurveTo(distance / 2, -distance / 4, 0, 0);
      ctx.stroke();

      // Add a small geometric "Seed" at the current distance
      ctx.beginPath();
      ctx.arc(distance, 0, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ 
      height: '100%', width: '100%', backgroundColor: '#000', 
      position: 'relative', overflow: 'hidden', touchAction: 'none' 
    }}>
      
      {/* ─── UI CONTROLS ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zCenter: 10, display: 'flex', gap: 20 }}>
        <button onClick={() => setTab('resonance')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
        <button onClick={clearCanvas} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 2 }}>
          {isHindi ? "मिटाएं" : "RESET"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={() => setIsActive(true)}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setIsActive(false)}
        onPointerLeave={() => setIsActive(false)}
        style={{ cursor: 'crosshair', width: '100%', height: '100%' }}
      />
      
      {/* Centered Target Mark */}
      {!isActive && (
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', 
          transform: 'translate(-50%, -50%)', pointerEvents: 'none',
          color: 'rgba(255,255,255,0.1)', textAlign: 'center'
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⦿</div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, letterSpacing: 2 }}>
            {isHindi ? "केंद्र से खींचें" : "PULL FROM CENTER"}
          </p>
        </div>
      )}
    </div>
  );
}