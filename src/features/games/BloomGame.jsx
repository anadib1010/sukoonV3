import React, { useState, useEffect, useRef } from 'react';

export function BloomGame({ T, lang }) {
  const canvasRef = useRef(null);
  const [taps, setTaps] = useState(0);
  const [message, setMessage] = useState("");
  const maxTaps = 6;
  const isHindi = lang === "Hindi";

  const affirmations = isHindi 
    ? ["स्पष्ट एकाग्रता", "स्थिर लय", "शांति का क्षण", "पूर्ण सामंजस्य", "शांत उपस्थिति", "स्थिरता मिली"]
    : ["CLEAR FOCUS", "STEADY RHYTHM", "A MOMENT OF PEACE", "PERFECT HARMONY", "CALM PRESENCE", "STILLNESS FOUND"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;

    if (taps === 0) {
      ctx.fillStyle = T.accent + "80"; ctx.font = "300 11px 'DM Sans'"; ctx.textAlign = "center";
      ctx.fillText(isHindi ? "खिलने के लिए टैप करें" : "TAP TO BLOOM", cx, cy); return;
    }

    for (let i = 1; i <= taps; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, i * 22, 0, Math.PI * 2);
      ctx.strokeStyle = T.accent + Math.floor((.15 + i * .12) * 255).toString(16).padStart(2, "0"); 
      ctx.lineWidth = 1.5; ctx.stroke();
      
      for (let j = 0; j < 8; j++) {
        const angle = j * Math.PI / 4 + i * .2, px = cx + Math.cos(angle) * i * 22, py = cy + Math.sin(angle) * i * 22;
        ctx.beginPath(); ctx.arc(px, py, 3 + i, 0, Math.PI * 2); 
        ctx.fillStyle = T.accent + "cc"; ctx.shadowBlur = 15; 
        ctx.shadowColor = T.accent; ctx.fill(); ctx.shadowBlur = 0;
      }
    }
  }, [taps, T, isHindi]);

  const handleTap = () => {
    if (taps < maxTaps) {
      const n = taps + 1; setTaps(n); if (navigator.vibrate) navigator.vibrate(18);
      if (n === maxTaps) { 
        setMessage(affirmations[Math.floor(Math.random() * affirmations.length)]); 
        setTimeout(() => { setMessage(""); setTaps(0); }, 4000); 
      }
    }
  };

  const containerStyle = {
    background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 24,
    padding: "24px 20px", maxWidth: "450px", margin: "0 auto", textAlign: "center"
  };

  return (
    <div style={containerStyle} className="fade-in">
      {/* Instruction Box - Only visible when not playing */}
      {taps === 0 && !message && (
        <div style={{ background: `${T.accent}08`, padding: '16px', borderRadius: '16px', marginBottom: '20px', textAlign: 'left', border: `1px solid ${T.accent}15` }}>
          <h4 style={{ fontSize: 14, color: T.accent, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            🌸 {isHindi ? "यह कैसे काम करता है?" : "How it works?"}
          </h4>
          <p style={{ fontSize: 12, color: T.textSoft, margin: 0, lineHeight: 1.5 }}>
            {isHindi 
              ? "एक लय में स्क्रीन पर टैप करें। हर टैप के साथ एक पंखुड़ी खिलेगी। अपनी एकाग्रता को फूल की तरह बढ़ते हुए देखें।" 
              : "Tap the screen in a steady rhythm. With each tap, a petal blooms. Watch your focus expand like a flower."}
          </p>
        </div>
      )}

      <div 
        style={{ position: "relative", height: 280, width: "100%", background: T.surfaceAlt || T.background, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `1px solid ${T.border}` }} 
        onClick={handleTap}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
        
        {message && (
          <div className="fade-in" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, background: T.surface + "ee", backdropFilter: "blur(4px)" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: T.accent, letterSpacing: 2, textAlign: "center", padding: "0 20px" }}>
              {message}
            </p>
          </div>
        )}
      </div>

      {taps > 0 && !message && (
        <p style={{ marginTop: 12, fontSize: 11, color: T.muted, letterSpacing: 1 }}>
          {isHindi ? "खिलना जारी रखें..." : "KEEP BLOOMING..."}
        </p>
      )}
    </div>
  );
}