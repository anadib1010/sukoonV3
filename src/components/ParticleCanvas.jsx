import React, { useEffect, useRef } from 'react';

export function ParticleCanvas({ mode, T }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, isPressing = false, mx = 0, my = 0;
    let vibInterval;
    
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", resize); resize();
    
    const getXY = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.touches ? e.touches[0].clientX : e.clientX) - r.left, y: (e.touches ? e.touches[0].clientY : e.clientY) - r.top };
    };
    
    const onStart = (e) => { 
      isPressing = true; 
      const p = getXY(e); mx = p.x; my = p.y; 
      
      // HAPTIC FEEDBACK: Continuous "Purr"
      if (navigator.vibrate) {
        if (vibInterval) clearInterval(vibInterval); // Safety check
        navigator.vibrate(50); // Initial solid thump
        // 40ms vibration every 100ms creates a deep, continuous hum
        vibInterval = setInterval(() => navigator.vibrate(40), 100); 
      }
    };
    
    const onMove = (e) => { if (!isPressing) return; const p = getXY(e); mx = p.x; my = p.y; };
    
    const onEnd = () => { 
      isPressing = false; 
      if (vibInterval) {
        clearInterval(vibInterval); 
        vibInterval = null;
      }
    };
    
    // Desktop and Mobile Touch Events
    canvas.addEventListener("mousedown", onStart); canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("mousemove", onMove);  canvas.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onEnd);     window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd); // Failsafe for mobile to stop vibration
    
    const colors = mode === "burning" ? ["#ff4d4d", "#ff944d", "#ffcc44"] : mode === "sending" ? ["#a3c2fa", "#ffffff", "#c9b8ff"] : [T.accent, T.accentSoft, "#ffffff"];
    
    class Particle {
      constructor() { 
        this.x = Math.random() * canvas.width; 
        this.y = Math.random() * canvas.height; 
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1.2; 
        this.color = colors[Math.floor(Math.random() * colors.length)]; 
        this.baseAlpha = Math.random() * 0.5 + 0.3;
      }
      
      update() { 
        if (isPressing) { 
          // SLOW, GENTLE PULL
          const dx = mx - this.x;
          const dy = my - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 2) {
            // Very soft gravitational force
            const force = 0.12; 
            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
          }
          // Smooth friction creates a floaty, gliding effect
          this.vx *= 0.92; 
          this.vy *= 0.92; 
        } else { 
          // CHAOTIC SWARM
          this.vx += (Math.random() - 0.5) * 0.2; // Softer wandering
          this.vy += (Math.random() - 0.5) * 0.2;
          this.vx *= 0.98;
          this.vy *= 0.98;
        } 
        
        this.x += this.vx; 
        this.y += this.vy;
        
        // INFINITE CANVAS Wrap
        if (this.x < -10) this.x = canvas.width + 10;
        else if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        else if (this.y > canvas.height + 10) this.y = -10;
      }
      
      draw() { 
        ctx.save(); 
        ctx.globalAlpha = isPressing ? 0.9 : this.baseAlpha; 
        const og = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 6); 
        og.addColorStop(0, this.color); 
        og.addColorStop(1, "transparent"); 
        ctx.fillStyle = og; 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.size * 7, 0, Math.PI * 2); 
        ctx.fill(); 
        
        const ig = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size); 
        ig.addColorStop(0, "#ffffff"); 
        ig.addColorStop(1, this.color); 
        ctx.fillStyle = ig; 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
        ctx.fill(); 
        ctx.restore(); 
      }
    }
    
    const particles = []; for (let i = 0; i < 60; i++) particles.push(new Particle());
    const render = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); animId = requestAnimationFrame(render); };
    render();
    
    return () => { 
      window.removeEventListener("resize", resize); 
      canvas.removeEventListener("mousedown", onStart); canvas.removeEventListener("touchstart", onStart); 
      canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("touchmove", onMove); 
      window.removeEventListener("mouseup", onEnd); window.removeEventListener("touchend", onEnd); 
      window.removeEventListener("touchcancel", onEnd);
      cancelAnimationFrame(animId); 
      if (vibInterval) clearInterval(vibInterval);
    };
  }, [mode, T]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 5, touchAction: "none" }} />;
}