import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const [mandalaDNA, setMandalaDNA] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, recording, shared

  const isHindi = lang === "Hindi";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const complete = pullCount >= 6;

  // ─── 1. DNA & INITIALIZATION ───
  useEffect(() => {
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const size = Math.min(window.innerWidth, window.innerHeight);
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
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawStroke = (e) => {
    if (!mandalaDNA) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const { x, y } = getCanvasCoords(e);
    const dx = x - center, dy = y - center;
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
      ctx.quadraticCurveTo(drawDist * curvePower, drawDist * 0.3, drawDist, 0);
      ctx.quadraticCurveTo(drawDist * curvePower, -drawDist * 0.3, 0, 0);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handlePointerDown = (e) => { if (!complete) { setIsActive(true); drawStroke(e); } };
  const handlePointerMove = (e) => { if (!isActive || complete) return; drawStroke(e); };
  const handlePointerUp = () => { if (isActive) { setIsActive(false); setPullCount(p => p + 1); } };

  const resetGame = () => {
    const canvas = canvasRef.current;
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, size, size);
    setPullCount(0); setStatus('idle');
  };

  // ─── 2. SHARING LOGIC (STILL & ANIMATED) ───
  
  const generateOverlay = (ctx, size) => {
    // Subtle vignette
    const vg = ctx.createRadialGradient(size/2,size/2,size*0.3,size/2,size/2,size*0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, size, size);

    ctx.textAlign = 'center'; ctx.fillStyle = 'white';
    if (recipient) {
      ctx.font = `300 ${Math.round(size*0.06)}px Georgia, serif`;
      ctx.fillText(recipient, size/2, size * 0.18);
    }
    ctx.font = `300 ${Math.round(size*0.025)}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('JSukoon', size/2, size * 0.94);
  };

  const shareStill = async () => {
    setStatus('processing');
    const src = canvasRef.current;
    const size = src.width;
    const out = document.createElement('canvas');
    out.width = size; out.height = size;
    const ctx = out.getContext('2d');
    ctx.drawImage(src, 0, 0);
    generateOverlay(ctx, size);
    
    out.toBlob(async (blob) => {
      const file = new File([blob], 'mandala.png', { type: 'image/png' });
      if (navigator.share) await navigator.share({ files: [file] });
      setStatus('shared');
    });
  };

  const shareAnimation = async () => {
    setStatus('recording');
    const stream = canvasRef.current.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new File([new Blob(chunks)], 'mandala.mp4', { type: 'video/mp4' });
      if (navigator.share) await navigator.share({ files: [blob] });
      setStatus('shared');
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 4000); // Records 4 seconds of spin
  };

  const size = Math.min(window.innerWidth, window.innerHeight);

  return (
    <div style={{ height:'100%', width:'100%', backgroundColor:'#000', position:'relative', overflow:'hidden', touchAction:'none', display:'flex', flexDirection:'column', alignItems:'center' }}>
      
      {/* Nav */}
      <div style={{ position:'absolute', top:20, left:20, zIndex:20 }}>
        <button onClick={() => setTab('resonance')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>←</button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={complete ? "mandala-spin" : ""}
        style={{ width: size, height: size, display:'block' }}
      />

      {complete && (
        <div style={{ position:'absolute', bottom:0, width:'100%', background:'rgba(0,0,0,0.9)', padding:20, display:'flex', flexDirection:'column', gap:10, zIndex:30 }}>
          <input 
            placeholder={isHindi ? "किसके लिए?" : "Recipient Name..."} 
            onChange={e => setRecipient(e.target.value)}
            style={{ background:'rgba(255,255,255,0.1)', border:'none', padding:12, borderRadius:8, color:'#fff' }} 
          />
          
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={shareStill} style={{ flex:1, padding:12, borderRadius:8, background:'#222', color:'#fff', border:'1px solid #444' }}>
              🖼️ {isHindi ? "फोटो" : "Still"}
            </button>
            <button onClick={shareAnimation} style={{ flex:1, padding:12, borderRadius:8, background:'#fff', color:'#000', fontWeight:'bold' }}>
              🌀 {status === 'recording' ? '...' : (isHindi ? "एनिमेशन" : "GIF/Video")}
            </button>
          </div>
          <button onClick={resetGame} style={{ color:'rgba(255,255,255,0.4)', background:'none', border:'none', fontSize:12 }}>{isHindi ? "फिर से बनाएं" : "RECREATE"}</button>
        </div>
      )}

      <style>{`
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mandala-spin { animation: slowSpin 40s linear infinite; }
      `}</style>
    </div>
  );
}