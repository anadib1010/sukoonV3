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
      
      // HAPTIC FEEDBACK: Initial solid thump, then a continuous grounding pulse
      if (navigator.vibrate) {
        navigator.vibrate(40); 
        vibInterval = setInterval(() => navigator.vibrate(15), 150); 
      }
    };
    
    const onMove = (e) => { if (!isPressing) return; const p = getXY(e); mx = p.x; my = p.y; };
    
    const onEnd = () => { 
      isPressing = false; 
      if (vibInterval) clearInterval(vibInterval); // Stop vibrating when released
    };
    
    canvas.addEventListener("mousedown", onStart); canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("mousemove", onMove);  canvas.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onEnd);     window.addEventListener("touchend", onEnd);
    
    const colors = mode === "burning" ? ["#ff4d4d", "#ff944d", "#ffcc44"] : mode === "sending" ? ["#a3c2fa", "#ffffff", "#c9b8ff"] : [T.accent, T.accentSoft, "#ffffff"];
    
    class Particle {
      constructor() { 
        // SPAWN EVERYWHERE, not just at the bottom
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
          // MAGNETIC PULL: Calculate distance to the finger
          const dx = mx - this.x;
          const dy = my - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 2) {
            // The closer they get, the stronger the pull creates a dense core
            const force = Math.min(100 / (dist + 10), 2); 
            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
          }
          // High friction so they stick to your finger instead of slingshotting away
          this.vx *= 0.85; 
          this.vy *= 0.85; 
        } else { 
          // CHAOTIC SWARM (Brownian Motion)
          this.vx += (Math.random() - 0.5) * 0.5;
          this.vy += (Math.random() - 0.5) * 0.5;
          // Low friction for smooth, continuous drifting
          this.vx *= 0.98;
          this.vy *= 0.98;
        } 
        
        this.x += this.vx; 
        this.y += this.vy;
        
        // INFINITE CANVAS: Wrap around edges so the swarm never empties out
        if (this.x < -10) this.x = canvas.width + 10;
        else if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        else if (this.y > canvas.height + 10) this.y = -10;
      }
      
      draw() { 
        ctx.save(); 
        // Particles glow brighter when they are being pulled
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
    
    // Increased particle count from 40 to 60 for a better, thicker "swarm"
    const particles = []; for (let i = 0; i < 60; i++) particles.push(new Particle());
    const render = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); animId = requestAnimationFrame(render); };
    render();
    
    return () => { 
      window.removeEventListener("resize", resize); 
      canvas.removeEventListener("mousedown", onStart); canvas.removeEventListener("touchstart", onStart); 
      canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("touchmove", onMove); 
      window.removeEventListener("mouseup", onEnd); window.removeEventListener("touchend", onEnd); 
      cancelAnimationFrame(animId); 
      if (vibInterval) clearInterval(vibInterval);
    };
  }, [mode, T]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 5, touchAction: "none" }} />;
}