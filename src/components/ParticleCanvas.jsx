import React, { useEffect, useRef } from 'react';

export function ParticleCanvas({ mode, T }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, isPressing=false, mx=0, my=0;
    
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; };
    window.addEventListener("resize", resize); resize();
    
    const getXY = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x:(e.touches?e.touches[0].clientX:e.clientX)-r.left, y:(e.touches?e.touches[0].clientY:e.clientY)-r.top };
    };
    
    const onStart=(e)=>{ isPressing=true; const p=getXY(e); mx=p.x; my=p.y; if(navigator.vibrate)navigator.vibrate(30); };
    const onMove=(e)=>{ if(!isPressing)return; const p=getXY(e); mx=p.x; my=p.y; };
    const onEnd=()=>{ isPressing=false; };
    
    canvas.addEventListener("mousedown",onStart); canvas.addEventListener("touchstart",onStart,{passive:true});
    canvas.addEventListener("mousemove",onMove);  canvas.addEventListener("touchmove",onMove,{passive:true});
    window.addEventListener("mouseup",onEnd);     window.addEventListener("touchend",onEnd);
    
    const colors = mode==="burning"?["#ff4d4d","#ff944d","#ffcc44"]:mode==="sending"?["#a3c2fa","#ffffff","#c9b8ff"]:[T.accent,T.accentSoft,"#ffffff"];
    
    class Particle {
      constructor(){ this.reset(); }
      reset(){ this.x=Math.random()*canvas.width; this.y=canvas.height+20; this.size=Math.random()*2+1.2; this.speedY=Math.random()*-.5-.2; this.speedX=(Math.random()-.5)*.3; this.color=colors[Math.floor(Math.random()*colors.length)]; this.life=1; this.decay=Math.random()*.003+.001; }
      update(){ if(isPressing){ this.x+=(mx-this.x)*.03; this.y+=(my-this.y)*.03; } else { this.y+=this.speedY; this.x+=this.speedX; } this.life-=this.decay; if(this.life<=0)this.reset(); }
      draw(){ ctx.save(); ctx.globalAlpha=Math.max(this.life,.8); const og=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size*6); og.addColorStop(0,this.color); og.addColorStop(1,"transparent"); ctx.fillStyle=og; ctx.beginPath(); ctx.arc(this.x,this.y,this.size*7,0,Math.PI*2); ctx.fill(); const ig=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size); ig.addColorStop(0,"#ffffff"); ig.addColorStop(1,this.color); ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.restore(); }
    }
    
    const particles=[]; for(let i=0;i<40;i++)particles.push(new Particle());
    const render=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.update();p.draw();}); animId=requestAnimationFrame(render); };
    render();
    
    return ()=>{ window.removeEventListener("resize",resize); canvas.removeEventListener("mousedown",onStart); canvas.removeEventListener("touchstart",onStart); canvas.removeEventListener("mousemove",onMove); canvas.removeEventListener("touchmove",onMove); window.removeEventListener("mouseup",onEnd); window.removeEventListener("touchend",onEnd); cancelAnimationFrame(animId); };
  }, [mode, T]);

  return <canvas ref={canvasRef} style={{ width:"100%", height:"100%", position:"absolute", inset:0, zIndex:5, touchAction:"none" }} />;
}