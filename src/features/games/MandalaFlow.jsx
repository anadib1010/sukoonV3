import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const [mandalaDNA, setMandalaDNA] = useState(null);
  
  const isHindi = lang === "Hindi";

  // Canvas size — always square, fits the smaller dimension
  const getSize = () => Math.min(window.innerWidth, window.innerHeight);

  useEffect(() => {
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const size = getSize();
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
  }, []);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    if (pullCount < 6) {
      setIsActive(true);
      drawStroke(e);
    }
  };

  const handlePointerUp = () => {
    if (isActive) {
      setIsActive(false);
      setPullCount(prev => prev + 1);
    }
  };

  const drawStroke = (e) => {
    if (!mandalaDNA) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width; // square — width === height
    const center = size / 2;

    const { x, y } = getCanvasCoords(e);
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const MAX_ALLOWED = size * 0.44;
    const drawDist = Math.min(distance, MAX_ALLOWED);

    const { symmetry, hueStart, curvePower } = mandalaDNA;

    ctx.save();
    ctx.translate(center, center);

    for (let i = 0; i < symmetry; i++) {
      ctx.rotate((Math.PI * 2) / symmetry);
      const currentHue = (hueStart + (drawDist / MAX_ALLOWED) * 50) % 360;
      ctx.strokeStyle = `hsla(${currentHue}, 80%, 60%, 0.12)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${currentHue}, 80%, 50%, 0.4)`;
      ctx.lineWidth = 2;
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

  const handlePointerMove = (e) => {
    if (!isActive) return;
    drawStroke(e);
  };

  const resetGame = () => {
    const canvas = canvasRef.current;
    const size = getSize();
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    setPullCount(0);
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4
    });
  };

  const size = getSize();

  return (
    <div style={{
      height: '100%', width: '100%', backgroundColor: '#000',
      position: 'relative', overflow: 'hidden', touchAction: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>

      {/* UI */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, display: 'flex', gap: 20 }}>
        <button onClick={() => setTab('more')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer' }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
        <button onClick={resetGame} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2, cursor: 'pointer' }}>
          {isHindi ? "पुनः आरंभ" : "RESTART"}
        </button>
      </div>

      {/* Progress */}
      <div style={{
        position: 'absolute', top: 24, right: 24, zIndex: 20,
        color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 12
      }}>
        {pullCount < 6 ? `${pullCount} / 6` : (isHindi ? "पूर्ण" : "COMPLETE")}
      </div>

      {/* Square canvas — always circular */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={pullCount >= 6 ? "mandala-spin" : ""}
        style={{
          cursor: 'crosshair',
          width: size, height: size,
          display: 'block',
          touchAction: 'none',
        }}
      />

      {pullCount === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', color: 'rgba(255,255,255,0.1)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: 4, textAlign: 'center',
        }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>⦿</div>
          {isHindi ? "केंद्र से खींचें" : "PULL FROM CENTER"}
        </div>
      )}

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
