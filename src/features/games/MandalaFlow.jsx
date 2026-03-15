import React, { useRef, useEffect, useState } from 'react';

export function MandalaFlow({ setTab, T, lang }) {
  const canvasRef     = useRef(null);
  const [isActive,    setIsActive]    = useState(false);
  const [pullCount,   setPullCount]   = useState(0);
  const [mandalaDNA,  setMandalaDNA]  = useState(null);
  const [recipient,   setRecipient]   = useState('');
  const [sender,      setSender]      = useState('');
  const [message,     setMessage]     = useState('');
  const [shared,      setShared]      = useState(false);
  const [generating,  setGenerating]  = useState(false);

  const isHindi  = lang === "Hindi";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const complete = pullCount >= 6;

  const getSize = () => Math.min(window.innerWidth, window.innerHeight);

  useEffect(() => {
    setMandalaDNA({
      symmetry:   Math.random() > 0.5 ? 8 : 12,
      hueStart:   Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const size   = getSize();
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
  }, []);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawStroke = (e) => {
    if (!mandalaDNA) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const size   = canvas.width;
    const center = size / 2;
    const { x, y } = getCanvasCoords(e);
    const dx = x - center, dy = y - center;
    const distance    = Math.sqrt(dx * dx + dy * dy);
    const MAX_ALLOWED = size * 0.44;
    const drawDist    = Math.min(distance, MAX_ALLOWED);
    const { symmetry, hueStart, curvePower } = mandalaDNA;

    ctx.save();
    ctx.translate(center, center);
    for (let i = 0; i < symmetry; i++) {
      ctx.rotate((Math.PI * 2) / symmetry);
      const currentHue = (hueStart + (drawDist / MAX_ALLOWED) * 50) % 360;
      ctx.strokeStyle  = `hsla(${currentHue}, 80%, 60%, 0.12)`;
      ctx.shadowBlur   = 10;
      ctx.shadowColor  = `hsla(${currentHue}, 80%, 50%, 0.4)`;
      ctx.lineWidth    = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(drawDist * curvePower, drawDist * 0.3,  drawDist, 0);
      ctx.quadraticCurveTo(drawDist * curvePower, -drawDist * 0.3, 0, 0);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handlePointerDown = (e) => { if (!complete) { setIsActive(true); drawStroke(e); } };
  const handlePointerMove = (e) => { if (!isActive || complete) return; drawStroke(e); };
  const handlePointerUp   = ()  => {
    if (isActive) { setIsActive(false); setPullCount(p => p + 1); }
  };

  const resetGame = () => {
    const canvas = canvasRef.current;
    const size   = getSize();
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    setPullCount(0);
    setShared(false);
    setMandalaDNA({
      symmetry:   Math.random() > 0.5 ? 8 : 12,
      hueStart:   Math.floor(Math.random() * 360),
      curvePower: 0.3 + Math.random() * 0.4,
    });
  };

  // ── Capture canvas + overlay text into a shareable image ──────────
  const generateShareImage = () => new Promise(resolve => {
    const src    = canvasRef.current;
    const size   = src.width;
    const out    = document.createElement('canvas');
    out.width    = size;
    out.height   = size;
    const ctx    = out.getContext('2d');

    // 1. Copy mandala
    ctx.drawImage(src, 0, 0);

    // 2. Subtle dark vignette so text reads
    const vg = ctx.createRadialGradient(size/2,size/2,size*0.3,size/2,size/2,size*0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, size, size);

    // 3. Recipient
    if (recipient.trim()) {
      ctx.textAlign     = 'center';
      ctx.textBaseline  = 'alphabetic';
      ctx.font          = `300 ${Math.round(size*0.062)}px Georgia, serif`;
      ctx.fillStyle     = 'rgba(255,255,255,0.92)';
      ctx.shadowColor   = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur    = 14;
      ctx.fillText(recipient.trim(), size/2, size * 0.18);
      ctx.shadowBlur    = 0;
    }

    // 4. Message
    if (message.trim()) {
      ctx.font         = `italic ${Math.round(size*0.038)}px Georgia, serif`;
      ctx.fillStyle    = 'rgba(255,255,255,0.75)';
      ctx.shadowColor  = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur   = 10;
      ctx.fillText(`"${message.trim()}"`, size/2, size * 0.26);
      ctx.shadowBlur   = 0;
    }

    // 5. Sender — with love from
    const fromLine = sender.trim()
      ? (isHindi ? `— ${sender.trim()} की ओर से, प्यार के साथ` : `— with love from ${sender.trim()}`)
      : (isHindi ? '— JSukoon की ओर से' : '— from JSukoon');
    ctx.font        = `400 ${Math.round(size*0.032)}px Georgia, serif`;
    ctx.fillStyle   = 'rgba(255,255,255,0.55)';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 8;
    ctx.fillText(fromLine, size/2, size * 0.88);
    ctx.shadowBlur  = 0;

    // 6. JSukoon branding — visible but not intrusive
    ctx.font      = `300 ${Math.round(size*0.032)}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 8;
    ctx.fillText(isHindi ? 'JSukoon पर बनाया गया' : 'Made with JSukoon', size/2, size * 0.94);
    ctx.shadowBlur  = 0;

    out.toBlob(blob => resolve(blob), 'image/png');
  });

  const handleShare = async () => {
    setGenerating(true);
    const blob = await generateShareImage();
    const safeR = (recipient.trim() || 'mandala').replace(/[^a-zA-Z0-9]/g,'-').slice(0,30);
    const file  = new File([blob], `mandala-for-${safeR}.png`, { type:'image/png' });
    const text  = isHindi
      ? `✨ एक मंडला, ${recipient.trim()||'आपके'} लिए\nJSukoon पर बनाया गया`
      : `✨ A mandala created for ${recipient.trim()||'you'}\nMade with JSukoon`;

    // ─── NEW: INSTANT CLIPBOARD BACKUP ───
    // This saves the text so PC users can easily paste it if WhatsApp drops it
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch (err) {
      console.log("Clipboard copy failed", err);
    }

    if (navigator.share && navigator.canShare?.({ files:[file] })) {
      try {
        await navigator.share({ files:[file], text });
        setShared(true); setGenerating(false); return;
      } catch(e) { if (e.name === 'AbortError') { setGenerating(false); return; } }
    }
    
    // Fallback — download (Usually triggers on PC)
    const a = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `mandala-for-${safeR}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setShared(true); setGenerating(false);
  };

  const size = getSize();

  return (
    <div style={{
      height:'100%', width:'100%', backgroundColor:'#000',
      position:'relative', overflow:'hidden', touchAction:'none',
      display:'flex', flexDirection:'column', alignItems:'center',
    }}>

      {/* Top nav */}
      <div style={{ position:'absolute', top:20, left:20, zIndex:20, display:'flex', gap:20 }}>
        <button onClick={() => setTab('more')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:14, cursor:'pointer' }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
        <button onClick={resetGame} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', fontSize:12, letterSpacing:2, cursor:'pointer' }}>
          {isHindi ? "पुनः आरंभ" : "RESTART"}
        </button>
      </div>

      {/* Pull counter — 100% opacity, clearly readable */}
      <div style={{
        position:'absolute', top:22, right:22, zIndex:20,
        color: complete ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
        fontFamily:"'Cormorant Garamond', serif",
        fontSize: complete ? 13 : 16,
        fontWeight: complete ? 400 : 500,
        letterSpacing: 1,
        textAlign:'right',
      }}>
        {complete
          ? (isHindi ? "✦ पूर्ण" : "✦ Complete")
          : `${pullCount} / 6 ${isHindi ? 'खींचें' : 'pulls'}`}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={complete ? "mandala-spin" : ""}
        style={{
          cursor: complete ? 'default' : 'crosshair',
          width: size, height: size,
          display:'block', touchAction:'none',
          flexShrink: 0,
        }}
      />

      {/* Instruction — 100% opacity, bold enough to read */}
      {pullCount === 0 && (
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%, -50%)',
          pointerEvents:'none',
          color:'rgba(255,255,255,0.88)',
          fontFamily:"'Cormorant Garamond', serif",
          letterSpacing:3, textAlign:'center',
          fontSize: 'clamp(14px, 4vw, 18px)',
        }}>
          <div style={{ fontSize:'clamp(28px,8vw,38px)', marginBottom:10 }}>⦿</div>
          {isHindi ? "केंद्र से खींचें" : "PULL FROM CENTER"}
          <div style={{ fontSize:'clamp(12px,3vw,14px)', marginTop:8, opacity:0.65, letterSpacing:1 }}>
            {isHindi ? "6 बार — मंडला पूर्ण होगा" : "6 pulls to complete"}
          </div>
        </div>
      )}

      {/* Share panel — appears after 6 pulls */}
      {complete && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, zIndex:20,
          background:'rgba(0,0,0,0.82)',
          backdropFilter:'blur(12px)',
          borderTop:'1px solid rgba(255,255,255,0.1)',
          padding:'18px 20px 32px',
          display:'flex', flexDirection:'column', gap:10,
        }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:'rgba(255,255,255,0.7)', textAlign:'center', margin:'0 0 6px', letterSpacing:1 }}>
            {isHindi ? "किसे भेजना है?" : "Share your mandala"}
          </p>

          <input
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder={isHindi ? "किसके लिए? (नाम — वैकल्पिक)" : "Who is this for? (optional)"}
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' }}
          />
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={isHindi ? "एक छोटा संदेश (वैकल्पिक)" : "A short message (optional)"}
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' }}
          />
          <input
            value={sender}
            onChange={e => setSender(e.target.value)}
            placeholder={isHindi ? "आपका नाम — 'with love from' जुड़ेगा (वैकल्पिक)" : "Your name — 'with love from' will be added (optional)"}
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' }}
          />

          <button onClick={handleShare} disabled={generating} style={{
            background: shared ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.14)',
            border:'1px solid rgba(255,255,255,0.3)',
            borderRadius:12, padding:'13px', color:'#fff',
            fontSize:15, fontFamily:"'Cormorant Garamond',serif",
            letterSpacing:0.5, cursor:'pointer',
          }}>
            {generating ? '…' : shared
              ? (isHindi ? '✓ भेज दिया!' : '✓ Shared!')
              : (isHindi ? '✨ मंडला भेजें' : '✨ Share this mandala')}
          </button>

          {shared && (
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textAlign:'center', margin:0, lineHeight:1.7 }}>
              {isMobile
                ? (isHindi ? '📱 WhatsApp या Instagram चुनें।' : '📱 Choose WhatsApp or Instagram from the share sheet.')
                : (isHindi ? '💻 फ़ाइल डाउनलोड हो गई।' : '💻 Image downloaded — share it anywhere.')}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .mandala-spin { animation: slowSpin 40s linear infinite; }
      `}</style>
    </div>
  );
}
