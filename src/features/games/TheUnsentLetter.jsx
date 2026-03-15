import React, { useState, useEffect, useRef } from 'react';

export function TheUnsentLetter({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  // PHASES: 'compose' -> 'burning' -> 'gone'
  const [phase, setPhase] = useState('compose');
  const [letter, setLetter] = useState("");
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // ─── EMBER PARTICLE ENGINE ───
  useEffect(() => {
    if (phase !== 'burning') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Spawn 150 embers at the bottom of the screen
    for (let i = 0; i < 150; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100, // Start slightly below screen
        size: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 3 + 1), // Float upwards
        life: Math.random() * 100 + 50,
        maxLife: 150,
        color: Math.random() > 0.5 ? '#ff5a00' : (Math.random() > 0.5 ? '#ff9a00' : '#444') // Fire & Ash colors
      });
    }

    const animateFire = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let activeParticles = 0;
      
      particlesRef.current.forEach(p => {
        if (p.life <= 0) return;
        activeParticles++;
        
        // Float and sway
        p.x += Math.sin(p.life / 10) * 0.5 + p.vx;
        p.y += p.vy;
        p.life--;
        
        const opacity = p.life / p.maxLife;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = p.color === '#444' ? 0 : 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (activeParticles > 0) {
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
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Haptic crackle
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
          // CSS Magic: When phase is burning, the letter scorches to orange/black and fades away
          transition: 'all 4s ease-in-out',
          transform: phase === 'burning' ? 'translateY(-50px) scale(0.95)' : 'translateY(0) scale(1)',
          filter: phase === 'burning' ? 'sepia(1) hue-rotate(-50deg) saturate(5) brightness(0.2) blur(2px)' : 'none',
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