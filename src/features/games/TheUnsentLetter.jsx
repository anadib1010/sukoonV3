import React, { useState, useEffect, useRef } from 'react';

export function TheUnsentLetter({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  // PHASES: 'compose' -> 'burning' -> 'gone'
  const [phase, setPhase] = useState('compose');
  const [letter, setLetter] = useState("");
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // ─── PROFOUND CORD-CUTTING FIRE ENGINE ───
  useEffect(() => {
    if (phase !== 'burning') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;
    
    let particles = [];
    const startTime = Date.now();

    const animateFire = () => {
      const elapsed = Date.now() - startTime;
      
      // 1. Dark, trailing background for profound motion blur
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5, 5, 8, 0.2)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'screen'; // Magical, blending fire

      // 2. Spawn Ethereal Fire (Crimson, Violet, Pure White)
      if (elapsed < 4500) { // Fire builds for 4.5 seconds
        let spawnRate = elapsed < 3000 ? 6 : 2; // Intense at first, then focuses on the cord
        for (let i = 0; i < spawnRate; i++) {
          particles.push({
            // Start wide, then narrow in on the center as time passes
            x: W/2 + (Math.random() - 0.5) * W * Math.max(0.2, 1 - elapsed/4000), 
            y: H + 50,
            size: Math.random() * 40 + 15,
            vx: (Math.random() - 0.5) * 3,
            vy: -(Math.random() * 7 + 2),
            life: 1,
            maxLife: Math.random() * 50 + 30,
            color: ['#ff0040', '#7000ff', '#ff5a00', '#ffffff'][Math.floor(Math.random() * 4)]
          });
        }
      }

      // 3. Update & Draw Fire
      let activeParticles = 0;
      particles.forEach(p => {
        if (p.life <= 0) return;
        activeParticles++;
        
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.95; // Flames shrink to sharp tips as they rise
        p.life--;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.pow(p.life / p.maxLife, 1.5); // Fades out smoothly
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 4. The Spiritual Cord (Reveals, Burns, Snaps)
      if (elapsed > 2000 && elapsed < 7500) {
        ctx.globalCompositeOperation = 'source-over';
        
        // Cord fades in, then fades out after snap
        let cordAlpha = Math.min(1, (elapsed - 2000) / 1000);
        if (elapsed > 5000) cordAlpha = Math.max(0, 1 - (elapsed - 5000) / 1500);

        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;

        if (elapsed < 4500) {
          // THE TENSION: Taut cord, begins shaking violently right before the snap
          let shake = elapsed > 3500 ? (Math.random() - 0.5) * 12 : 0;
          
          ctx.strokeStyle = `rgba(255, 100, 100, ${cordAlpha})`;
          ctx.shadowColor = '#ff0040';
          ctx.beginPath();
          ctx.moveTo(0, H/2 + shake);
          ctx.lineTo(W, H/2 - shake);
          ctx.stroke();
          
        } else {
          // THE RELEASE: The cord snaps and recoils
          let gap = Math.pow((elapsed - 4500) * 0.15, 1.3); // Exponential pulling apart
          
          ctx.strokeStyle = `rgba(200, 200, 255, ${cordAlpha})`;
          ctx.shadowColor = '#ffffff';

          // Left Half Recoils
          ctx.beginPath();
          ctx.moveTo(0, H/2);
          ctx.quadraticCurveTo(W/4, H/2 + gap*0.4, W/2 - gap, H/2 + gap);
          ctx.stroke();

          // Right Half Recoils
          ctx.beginPath();
          ctx.moveTo(W, H/2);
          ctx.quadraticCurveTo(W*0.75, H/2 + gap*0.4, W/2 + gap, H/2 + gap);
          ctx.stroke();

          // Blinding Flash at the exact moment of the snap
          if (elapsed > 4500 && elapsed < 4700) {
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - (elapsed - 4500) / 200})`;
            ctx.fillRect(0, 0, W, H);
          }
        }
        ctx.shadowBlur = 0;
      }

      // 5. End the animation loop
      if (elapsed < 8000) {
        animationRef.current = requestAnimationFrame(animateFire);
      } else {
        setPhase('gone');
      }
    };

    animationRef.current = requestAnimationFrame(animateFire);
    return () => cancelAnimationFrame(animationRef.current);
  }, [phase]);

  const handleBurn = () => {
    if (!letter.trim()) return;
    setPhase('burning');
    
    // HAPTIC CHOREOGRAPHY
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40]); // Initial fire crackle
      // Precisely timed heavy vibration when the visual cord snaps at 4.5s
      setTimeout(() => navigator.vibrate([200, 50, 250]), 4500); 
    }
  };

  return (
    <div style={{
      height: '100%', width: '100%', backgroundColor: '#050508',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* ─── FIRE CANVAS ─── */}
      <canvas 
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
      />

      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 30 }}>
        <button 
          onClick={() => setTab(null)} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}
        >
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── PHASE 1 & 2: THE LETTER ─── */}
      {(phase === 'compose' || phase === 'burning') && (
        <div style={{
          width: '85%', maxWidth: 400, zIndex: 5,
          // CSS Magic: When burning, the letter dissolves into blinding white light and blurs away
          transition: 'all 3s cubic-bezier(0.25, 1, 0.5, 1)',
          transform: phase === 'burning' ? 'scale(1.1) translateY(-30px)' : 'scale(1) translateY(0)',
          filter: phase === 'burning' ? 'blur(20px) brightness(3)' : 'none',
          opacity: phase === 'burning' ? 0 : 1
        }}>
          
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fff', fontWeight: 300, marginBottom: 10, textAlign: 'center' }}>
            {isHindi ? "अनभेजा पत्र" : "The Unsent Letter"}
          </h2>
          
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", textAlign: 'center', marginBottom: 30 }}>
            {isHindi 
              ? "वह लिखें जो आपने कभी नहीं कहा। जिसे क्षमा करने की आवश्यकता है। उसे जाने दें।" 
              : "Write what you never said. To the one who hurt you. To yourself. Let it go."}
          </p>

          <textarea 
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            disabled={phase === 'burning'}
            placeholder={isHindi ? "प्रिय..." : "Dear..."}
            style={{
              width: '100%', height: 250, backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20,
              color: 'rgba(255,255,255,0.8)', fontFamily: "'Cormorant Garamond', serif", fontSize: 18,
              lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box'
            }}
          />

          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <button 
              onClick={handleBurn}
              disabled={!letter.trim() || phase === 'burning'}
              style={{
                background: 'transparent', 
                border: letter.trim() ? '1px solid rgba(255, 90, 0, 0.6)' : '1px solid rgba(255,255,255,0.1)', 
                color: letter.trim() ? '#ff9a00' : 'rgba(255,255,255,0.2)',
                padding: '12px 40px', borderRadius: 30, fontSize: 16, 
                cursor: letter.trim() ? 'pointer' : 'default',
                letterSpacing: 2, transition: 'all 0.3s ease',
                boxShadow: letter.trim() ? '0 0 15px rgba(255, 90, 0, 0.2)' : 'none'
              }}
            >
              {isHindi ? "जला दें" : "BURN"}
            </button>
          </div>
        </div>
      )}

      {/* ─── PHASE 3: GONE ─── */}
      {phase === 'gone' && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          zIndex: 20, animation: 'fadeIn 3s ease', backgroundColor: '#050508'
        }}>
          <span style={{ fontSize: 40, marginBottom: 20, opacity: 0.8 }}>🕊️</span>
          <p style={{ color: '#d4af37', fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', letterSpacing: 1, textAlign: 'center' }}>
            {isHindi ? "तार कट गया है।" : "The cord is cut."}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontFamily: "'Cormorant Garamond', serif", marginTop: 10 }}>
            {isHindi ? "ऋण क्षमा कर दिया गया है।" : "The debt is forgiven."}
          </p>
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