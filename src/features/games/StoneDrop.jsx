import React, { useState, useEffect, useRef } from 'react';
import { creditSession } from '../../utils/activity';

export function StoneDrop({ T, lang }) {
  const canvasRef = useRef(null);
  const [thought, setThought] = useState("");
  const [dropping, setDropping] = useState(false);
  const [done, setDone] = useState(false);
  const animRef = useRef(null);
  const stoneY = useRef(0);
  const ripples = useRef([]);

  const drop = () => {
    if (!thought.trim()) return;
    setDropping(true); stoneY.current=0; ripples.current=[];
    if(navigator.vibrate)navigator.vibrate([20,100,40]);
  };

  useEffect(() => {
    if (!dropping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    const W=canvas.width, H=canvas.height, cx=W/2;
    let speed=.5;
    
    const render = () => {
      ctx.clearRect(0,0,W,H);
      const waterGrad=ctx.createLinearGradient(0,H*.4,0,H); 
      waterGrad.addColorStop(0,"rgba(30,50,80,0.6)"); 
      waterGrad.addColorStop(1,"rgba(10,20,40,0.9)"); 
      ctx.fillStyle=waterGrad; ctx.fillRect(0,H*.4,W,H*.6);
      
      ripples.current=ripples.current.filter(r=>r.opacity>0);
      ripples.current.forEach(r=>{ 
        ctx.beginPath(); ctx.ellipse(cx,H*.42,r.rx,r.ry,0,0,Math.PI*2); 
        ctx.strokeStyle=`rgba(120,180,220,${r.opacity})`; ctx.lineWidth=1; ctx.stroke(); 
        r.rx+=1.5; r.ry+=.4; r.opacity-=.012; 
      });
      
      const waterLine=H*.42;
      stoneY.current+=speed; speed+=.08;
      
      if(stoneY.current<waterLine){
        ctx.beginPath(); ctx.ellipse(cx,stoneY.current,14,10,0,0,Math.PI*2); 
        ctx.fillStyle="rgba(100,100,120,0.9)"; ctx.shadowBlur=8; ctx.shadowColor="rgba(0,0,0,0.4)"; ctx.fill(); ctx.shadowBlur=0;
        ctx.font="9px 'DM Sans'"; ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.textAlign="center";
        ctx.fillText(thought.length>12?thought.slice(0,12)+"…":thought,cx,stoneY.current+3);
      } else {
        if(ripples.current.length===0){ 
          for(let i=0;i<4;i++)ripples.current.push({rx:4+i*6,ry:2+i*1.5,opacity:.7-i*.1}); 
          if(navigator.vibrate)navigator.vibrate(60); 
        }
        const depth=Math.min((stoneY.current-waterLine)/(H*.5),1);
        ctx.beginPath(); ctx.ellipse(cx,waterLine+(stoneY.current-waterLine)*.6,14*(1-depth*.3),10*(1-depth*.3),0,0,Math.PI*2); 
        ctx.fillStyle=`rgba(80,80,100,${.9-depth*.7})`; ctx.fill();
        if(depth>=1){ cancelAnimationFrame(animRef.current); setTimeout(()=>{ setDropping(false); setDone(true); creditSession(2); },800); return; }
      }
      animRef.current=requestAnimationFrame(render);
    };
    animRef.current=requestAnimationFrame(render);
    return ()=>cancelAnimationFrame(animRef.current);
  }, [dropping]);

  const reset=()=>{ setThought(""); setDone(false); setDropping(false); };

  if(done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>🌊</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?"डूब गया।":"It has sunk."}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:260, margin:"0 auto 24px" }}>{lang==="Hindi"?"वह विचार अब गहरे पानी में है। यहाँ आने की ज़रूरत नहीं।":"That thought is in deep water now. It does not need to surface."}</p>
      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>{lang==="Hindi"?"एक और छोड़ें":"Drop another"}</button>
    </div>
  );

  if(dropping) return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, overflow:"hidden" }}>
      <canvas ref={canvasRef} style={{ width:"100%", height:240, display:"block" }} />
    </div>
  );

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:T.textSoft, marginBottom:20, lineHeight:1.7, textAlign:"center" }}>
        {lang==="Hindi"?"एक भारी विचार लिखें। उसे पत्थर बनने दें। उसे जाने दें।":"Write a heavy thought. Let it become a stone. Let it go."}
      </p>
      <textarea value={thought} onChange={e=>setThought(e.target.value)} placeholder={lang==="Hindi"?"यहाँ लिखें…":"Write it here…"}
        style={{ width:"100%", minHeight:90, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px 14px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.6, resize:"none", outline:"none", marginBottom:16 }} />
      <button onClick={drop} disabled={!thought.trim()} style={{ width:"100%", background:thought.trim()?`${T.accent}22`:"transparent", border:`1px solid ${thought.trim()?T.accent+"50":T.border}`, color:thought.trim()?T.accent:T.muted, fontSize:14, fontWeight:500, padding:"13px", borderRadius:14, opacity:thought.trim()?1:.5 }}>
        {lang==="Hindi"?"पानी में छोड़ें":"Drop into the water"}
      </button>
    </div>
  );
}