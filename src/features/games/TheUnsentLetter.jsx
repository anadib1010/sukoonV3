import React, { useState, useEffect, useRef } from 'react';

export function TheUnsentLetter({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  // PHASES: 'compose' -> 'burning' -> 'gone'
  const [phase, setPhase] = useState('compose');
  const [letter, setLetter] = useState("");
  
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);
  const burnStartTime = useRef(0);

  // Keep ref synced for the animation loop
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ─── THE CORD-CUTTING NETWORK ENGINE ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;

    // 1. Initialize the Complex Network of Orbs
    const orbs = [];
    // The Center Orb (You)
    orbs.push({ id: 0, x: W / 2, y: H / 2, baseRadius: 6, isCenter: true, angle: 0, dist: 0 }); 
    
    // The Peripheral Orbs (Attachments/Burdens)
    for (let i = 1; i < 15; i++) {
      orbs.push({
        id: i,
        x: W / 2, 
        y: H / 2,
        baseRadius: Math.random() * 3 + 2,
        isCenter: false,
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 160 + 60, // How far from center
        speed: (Math.random() - 0.5) * 0.005
      });
    }

    let animationId;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const currentPhase = phaseRef.current;
      
      let elapsed = 0;
      if (currentPhase === 'burning') elapsed = Date.now() - burnStartTime.current;
      if (currentPhase === 'gone') elapsed = 10000; // Force to post-snap state

      // 2. Physics & Orbit Updates
      orbs.forEach(orb => {
        if (orb.isCenter) {
          // Keep center orb grounded
          orb.x += (W / 2 - orb.x) * 0.1;
          orb.y += (H / 2 - orb.y) * 0.1;
        } else {
          if (elapsed > 4500) {
            // THE RELEASE: Peripherals shoot infinitely away off-screen
            const dx = orb.x - W / 2;
            const dy = orb.y - H / 2;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            orb.x += (dx / len) * 25; 
            orb.y += (dy / len) * 25;
          } else {
            // THE TETHER: Slowly orbiting the center
            orb.angle += orb.speed;
            const targetX = W / 2 + Math.cos(orb.angle) * orb.dist;
            const targetY = H / 2 + Math.sin(orb.angle) * orb.dist;
            orb.x += (targetX - orb.x) * 0.02;
            orb.y += (targetY - orb.y) * 0.02;
          }
        }
      });

      // 3. Draw the Complex Lines (The Cords)
      if (elapsed < 4500) {
        let shakeX = 0;
        let shakeY = 0;
        let lineColor = 'rgba(150, 180, 255, 0.15)'; // Gentle, complex grey/blue web initially
        let lineWidth = 1;

        if (currentPhase === 'burning') {
          // Transition the web to intense, glowing RED
          const progress = Math.min(1, elapsed / 4000);
          const r = 255;
          const g = Math.floor(150 * (1 - progress));
          const b = Math.floor(255 * (1 - progress));
          lineColor = `rgba(${r}, ${g}, ${b}, ${0.15 + progress * 0.7})`;
          lineWidth = 1 + progress * 2;

          // Violent shaking right before the snap
          if (elapsed > 2000) {
            const intensity = Math.pow((elapsed - 2000) / 2500, 2);
            shakeX = (Math.random() - 0.5) * 15 * intensity;
            shakeY = (Math.random() - 0.5) * 15 * intensity;
          }
        }

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.shadowBlur = currentPhase === 'burning' ? 15 : 0;
        ctx.shadowColor = '#ff0033';

        ctx.beginPath();
        const center = orbs[0];
        for (let i = 1; i < orbs.length; i++) {
          // Connect to center
          ctx.moveTo(center.x + shakeX, center.y + shakeY);
          ctx.lineTo(orbs[i].x + shakeX, orbs[i].y + shakeY);
          
          // Connect to neighbor to form a web
          if (i < orbs.length - 1) {
            ctx.moveTo(orbs[i].x + shakeX, orbs[i].y + shakeY);
            ctx.lineTo(orbs[i+1].x + shakeX, orbs[i+1].y + shakeY);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 4. THE FLASH (The Snap)
      if (elapsed > 4500 && elapsed < 4800) {
        const flashOpacity = 1 - (elapsed - 4500) / 300;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, W, H);
      }

      // 5. Draw the Orbs
      orbs.forEach(orb => {
        if (elapsed > 4500 && !orb.isCenter) return; // The burdens are gone

        let orbShakeX = 0;
        let orbShakeY = 0;
        
        if (currentPhase === 'burning' && elapsed < 4500) {
          const intensity = Math.max(0, (elapsed - 2000) / 2500);
          orbShakeX = (Math.random() - 0.5) * 10 * intensity;
          orbShakeY = (Math.random() - 0.5) * 10 * intensity;
        }

        ctx.beginPath();
        
        if (orb.isCenter) {
          if (elapsed > 4500) {
            // Post-Snap: Lovely white orb glowing softly and peacefully
            const pulse = Math.sin(Date.now() / 600) * 3;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 25 + pulse * 10;
            ctx.shadowColor = '#ffffff';
            ctx.arc(orb.x, orb.y, orb.baseRadius + 6 + pulse, 0, Math.PI * 2);
          } else {
            // Pre-Snap Center Orb
            ctx.fillStyle = currentPhase === 'burning' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
            ctx.arc(orb.x + orbShakeX, orb.y + orbShakeY, orb.baseRadius, 0, Math.PI * 2);
          }
        } else {
          // Peripheral Orbs
          ctx.fillStyle = currentPhase === 'burning' ? '#ff3333' : 'rgba(255, 255, 255, 0.3)';
          ctx.arc(orb.x + orbShakeX, orb.y + orbShakeY, orb.baseRadius, 0, Math.PI * 2);
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Move to Gone phase officially
      if (currentPhase === 'burning' && elapsed > 6500) {
        setPhase('gone'); 
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleBurn = () => {
    if (!letter.trim()) return;
    burnStartTime.current = Date.now();
    setPhase('burning');
    
    // HAPTIC CHOREOGRAPHY
    if (navigator.vibrate) {
      navigator.vibrate([30, 80, 30]); // The heat rising
      // The exact moment of the snap (4.5s)
      setTimeout(() => navigator.vibrate([200, 50, 300]), 4500); 
    }
  };

  return (
    <div style={{
      height: '100%', width: '100%', backgroundColor: '#050508',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* ─── THE NETWORK CANVAS ─── */}
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
          width: '85%', maxWidth: 400, zIndex: 20,
          transition: 'all 3s cubic-bezier(0.25, 1, 0.5, 1)',
          transform: phase === 'burning' ? 'scale(1.05) translateY(-20px)' : 'scale(1) translateY(0)',
          filter: phase === 'burning' ? 'blur(15px) brightness(2)' : 'none',
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
              width: '100%', height: 250, backgroundColor: 'rgba(255,255,255,0.02)',
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
          zIndex: 20, animation: 'fadeIn 3s ease'
        }}>
          {/* Note: Background remains transparent here so the softly pulsing white orb on the canvas shows through! */}
          <span style={{ fontSize: 40, marginBottom: 20, opacity: 0.8, marginTop: -100 }}>🕊️</span>
          <p style={{ color: '#d4af37', fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', letterSpacing: 1, textAlign: 'center' }}>
            {isHindi ? "तार कट गया है।" : "The cord is cut."}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontFamily: "'Cormorant Garamond', serif", marginTop: 10 }}>
            {isHindi ? "बोझ मुक्त हो गया है।" : "The burden is released."}
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