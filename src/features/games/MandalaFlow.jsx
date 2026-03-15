import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const [mandalaDNA, setMandalaDNA] = useState(null);
  
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  
  const [status, setStatus] = useState('idle');

  const isHindi = lang === "Hindi";
  const complete = pullCount >= 6;
  const size = Math.min(window.innerWidth, window.innerHeight);

  useEffect(() => {
    setMandalaDNA({
      symmetry: Math.random() > 0.5 ? 8 : 12,
      hueStart: Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
  }, [size]);

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
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, size, size);
    setPullCount(0); setStatus('idle');
  };

  const getShareText = () => {
    const rName = recipient.trim() || (isHindi ? 'आपके' : 'you');
    const sName = sender.trim() ? (isHindi ? `-- ${sender.trim()} की ओर से प्यार के साथ` : `-- with love from ${sender.trim()}`) : '';
    
    if (isHindi) {
      return `✨ एक मंडला, ${rName} लिए ${sName}\nJSukoon पर बनाया गया`;
    }
    return `✨ A mandala created for ${rName} ${sName}\nMade with JSukoon`;
  };

  const copyTextInstantly = () => {
    // This MUST happen the exact millisecond the button is clicked
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(getShareText());
      }
    } catch (err) {
      console.log("Clipboard copy failed", err);
    }
  };

  const shareStill = async () => {
    copyTextInstantly(); // Force copy immediately
    setStatus('processing');
    
    const out = document.createElement('canvas');
    out.width = size; out.height = size;
    const ctx = out.getContext('2d');
    
    ctx.drawImage(canvasRef.current, 0, 0);
    const vg = ctx.createRadialGradient(size/2,size/2,size*0.3,size/2,size/2,size*0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, size, size);

    ctx.textAlign = 'center';
    if (recipient.trim()) {
      ctx.font = `300 ${Math.round(size*0.06)}px Georgia, serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(recipient.trim(), size/2, size * 0.18);
    }
    if (message.trim()) {
      ctx.font = `italic ${Math.round(size*0.038)}px Georgia, serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText(`"${message.trim()}"`, size/2, size * 0.26);
    }
    if (sender.trim()) {
      const fromLine = isHindi ? `— ${sender.trim()} की ओर से` : `— with love from ${sender.trim()}`;
      ctx.font = `400 ${Math.round(size*0.032)}px Georgia, serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText(fromLine, size/2, size * 0.88);
    }
    ctx.font = `300 ${Math.round(size*0.025)}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('JSukoon', size/2, size * 0.94);
    
    out.toBlob(async (blob) => {
      const file = new File([blob], 'mandala.png', { type: 'image/png' });
      if (navigator.share) {
        try {
          await navigator.share({ files: [file], text: getShareText() });
        } catch (e) {
          console.log("Share failed", e);
        }
      }
      setStatus('shared');
      setTimeout(() => setStatus('idle'), 4000);
    });
  };

  const shareAnimation = async () => {
    copyTextInstantly(); // Force copy immediately
    setStatus('recording');
    
    const stream = canvasRef.current.captureStream(30);
    const mime = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    const chunks = [];
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([new Blob(chunks)], `mandala.${ext}`, { type: mime });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: getShareText() });
          setStatus('shared');
          setTimeout(() => setStatus('idle'), 4000);
          return;
        } catch (err) {}
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = `mandala.${ext}`;
      a.click();
      setStatus('shared');
      setTimeout(() => setStatus('idle'), 4000);
    };
    
    recorder.start();
    setTimeout(() => recorder.stop(), 4000); 
  };

  return (
    <div style={{ height:'100%', width:'100%', backgroundColor:'#000', position:'relative', overflow:'hidden', touchAction:'none', display:'flex', flexDirection:'column', alignItems:'center' }}>
      
      <div style={{ position:'absolute', top:20, left:20, right:20, zIndex:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={() => setTab('resonance')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer' }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
        <button onClick={resetGame} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:12, letterSpacing:2, cursor:'pointer' }}>
          {isHindi ? "पुनः आरंभ" : "RESTART"}
        </button>
      </div>

      <div style={{ position:'absolute', top:60, right:20, zIndex:20, color:'#fff', fontWeight:500, letterSpacing:1 }}>
        {complete ? (isHindi ? "✦ पूर्ण" : "✦ Complete") : `${pullCount} / 6 ${isHindi ? 'खींचें' : 'pulls'}`}
      </div>

      {!complete && pullCount === 0 && (
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', pointerEvents:'none', color:'rgba(255,255,255,0.9)', textAlign:'center', zIndex:15 }}>
          <div style={{ fontSize:40, marginBottom:10 }}>⦿</div>
          <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:18, letterSpacing:2, margin:0 }}>
            {isHindi ? "केंद्र से खींचें" : "PULL FROM CENTER"}
          </p>
          <p style={{ fontSize:12, opacity:0.6, marginTop:5 }}>
            {isHindi ? "6 बार पूरा करने के लिए" : "6 pulls to complete"}
          </p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={complete ? "mandala-spin" : ""}
        style={{ width: size, height: size, display:'block', touchAction:'none' }}
      />

      {complete && (
        <div style={{ position:'absolute', bottom:0, width:'100%', background:'rgba(0,0,0,0.95)', padding:24, borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', gap:10, zIndex:30 }}>
          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.7)', fontSize:14, margin:'0 0 5px' }}>
            {isHindi ? "इसे सोशल मीडिया पर साझा करें" : "Share your mandala on social media"}
          </p>
          
          <input 
            value={recipient}
            placeholder={isHindi ? "किसके लिए?" : "Recipient Name..."} 
            onChange={e => setRecipient(e.target.value)}
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', padding:10, borderRadius:8, color:'#fff', outline:'none' }} 
          />
          <input 
            value={message}
            placeholder={isHindi ? "एक छोटा संदेश" : "A short message..."} 
            onChange={e => setMessage(e.target.value)}
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', padding:10, borderRadius:8, color:'#fff', outline:'none' }} 
          />
          <input 
            value={sender}
            placeholder={isHindi ? "आपका नाम" : "Your name..."} 
            onChange={e => setSender(e.target.value)}
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', padding:10, borderRadius:8, color:'#fff', outline:'none' }} 
          />

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button onClick={shareStill} disabled={status !== 'idle' && status !== 'shared'} style={{ flex:1, padding:14, borderRadius:8, background:'#111', color:'#fff', border:'1px solid #333', cursor:'pointer' }}>
              🖼️ {isHindi ? "PNG साझा करें" : "Share PNG"}
            </button>
            <button onClick={shareAnimation} disabled={status !== 'idle' && status !== 'shared'} style={{ flex:1, padding:14, borderRadius:8, background:'#fff', color:'#000', fontWeight:'bold', cursor:'pointer' }}>
              🌀 {status === 'recording' ? '...' : (isHindi ? "GIF कैप्चर करें और साझा करें" : "Capture gif & share")}
            </button>
          </div>
          
          {status === 'shared' && (
            <p style={{ color:'#4ade80', fontSize:13, textAlign:'center', margin:'4px 0 0', fontWeight:'bold', animation:'fadeIn 0.3s ease' }}>
              {isHindi ? "✓ संदेश कॉपी हो गया! बस पेस्ट करें।" : "✓ Message copied! Just hit Paste."}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mandala-spin { animation: slowSpin 40s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}