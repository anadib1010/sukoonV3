import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushIndex, setBrushIndex] = useState(0);
  const hi = lang === "Hindi";

  // ─── 5 SACRED BRUSH STYLES ───
  const BRUSHES = [
    { name: hi ? "स्वर्ण धागा" : "Golden Thread", color: "#FFD700", glow: "#B8860B", width: 2, alpha: 0.8 },
    { name: hi ? "दिव्य धुआं" : "Ethereal Smoke", color: "#E0F7FA", glow: "#00BCD4", width: 8, alpha: 0.1 },
    { name: hi ? "जीवंत पंखुड़ियाँ" : "Vibrant Petals", color: "#FF4081", glow: "#C2185B", width: 4, alpha: 0.5 },
    { name: hi ? "क्रिस्टल प्रकाश" : "Crystal Light", color: "#FFFFFF", glow: "#90CAF9", width: 1, alpha: 1.0 },
    { name: hi ? "प्राचीन स्याही" : "Ancient Ink", color: "#B39DDB", glow: "#512DA8", width: 3, alpha: 0.4 }
  ];

  // Set up canvas size on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x, y };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    draw(x, y, true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Optional: Add the "dissolve" logic here if we want it to fade after every lift
  };

  const draw = (x, y, isStarting = false) => {
    if (!isDrawing && !isStarting) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const brush = BRUSHES[brushIndex];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Shift coordinates so (0,0) is the center of the screen
    const relativeX = x - centerX;
    const relativeY = y - centerY;

    ctx.strokeStyle = brush.color;
    ctx.shadowColor = brush.glow;
    ctx.shadowBlur = 15;
    ctx.lineWidth = brush.width;
    ctx.globalAlpha = brush.alpha;

    // 8-Way Symmetry (Mirroring across 8 axes)
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((i * 45 * Math.PI) / 180); // Rotate by 45 degrees 8 times

      if (isStarting) {
        ctx.beginPath();
        ctx.moveTo(relativeX, relativeY);
      } else {
        ctx.lineTo(relativeX, relativeY);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ 
      height: '100%', width: '100%', backgroundColor: '#000', 
      position: 'relative', overflow: 'hidden', touchAction: 'none' 
    }}>
      
      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: 20 }}>
        <button onClick={() => setTab('resonance')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
        <button onClick={clearCanvas} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 2 }}>
          {hi ? "साफ़ करें" : "CLEAR"}
        </button>
      </div>

      {/* ─── BRUSH SELECTOR ─── */}
      <div style={{ position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <button 
          onClick={() => setBrushIndex((prev) => (prev + 1) % BRUSHES.length)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
            color: BRUSHES[brushIndex].color, padding: '12px 24px', borderRadius: 40,
            fontFamily: "'Cormorant Garamond', serif", fontSize: 18, transition: 'all 0.3s ease'
          }}
        >
          {BRUSHES[brushIndex].name}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={(e) => {
          const { x, y } = getCoordinates(e);
          draw(x, y);
        }}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        style={{ cursor: 'crosshair' }}
      />
      
      {/* Instruction fade-out */}
      <div style={{ 
        position: 'absolute', top: '45%', width: '100%', textAlign: 'center', 
        pointerEvents: 'none', color: 'rgba(255,255,255,0.2)',
        fontFamily: "'Cormorant Garamond', serif", letterSpacing: 4
      }}>
        {hi ? "अपनी उंगली चलाएं" : "MOVE YOUR FINGER"}
      </div>
    </div>
  );
}