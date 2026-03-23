import React, { useState, useEffect, useRef } from 'react';

export function TheUnsentLetter({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  const [phase, setPhase] = useState('compose');
  const [letter, setLetter] = useState("");
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);
  const burnStartTime = useRef(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const orbs = [];
    orbs.push({ id: 0, x: W/2, y: H/2, baseRadius: 6, isCenter: true, angle: 0, dist: 0 });
    for (let i = 1; i < 15; i++) {
      orbs.push({ id: i, x: W/2, y: H/2, baseRadius: Math.random()*3+2, isCenter: false, angle: Math.random()*Math.PI*2, dist: Math.random()*160+60, speed: (Math.random()-0.5)*0.005 });
    }
    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const currentPhase = phaseRef.current;
      let elapsed = 0;
      if (currentPhase === 'burning') elapsed = Date.now() - burnStartTime.current;
      if (currentPhase === 'gone') elapsed = 10000;
      orbs.forEach(orb => {
        if (orb.isCenter) { orb.x += (W/2-orb.x)*0.1; orb.y += (H/2-orb.y)*0.1; }
        else if (elapsed > 4500) {
          const dx=orb.x-W/2, dy=orb.y-H/2, len=Math.sqrt(dx*dx+dy*dy)||1;
          orb.x+=(dx/len)*25; orb.y+=(dy/len)*25;
        } else {
          orb.angle+=orb.speed;
          const tx=W/2+Math.cos(orb.angle)*orb.dist, ty=H/2+Math.sin(orb.angle)*orb.dist;
          orb.x+=(tx-orb.x)*0.02; orb.y+=(ty-orb.y)*0.02;
        }
      });
      if (elapsed < 4500) {
        let shakeX=0, shakeY=0, lineColor='rgba(150,180,255,0.15)', lineWidth=1;
        if (currentPhase === 'burning') {
          const progress=Math.min(1,elapsed/4000);
          lineColor=`rgba(255,${Math.floor(150*(1-progress))},${Math.floor(255*(1-progress))},${0.15+progress*0.7})`;
          lineWidth=1+progress*2;
          if (elapsed>2000) { const intensity=Math.pow((elapsed-2000)/2500,2); shakeX=(Math.random()-0.5)*15*intensity; shakeY=(Math.random()-0.5)*15*intensity; }
        }
        ctx.strokeStyle=lineColor; ctx.lineWidth=lineWidth;
        ctx.shadowBlur=currentPhase==='burning'?15:0; ctx.shadowColor='#ff0033';
        ctx.beginPath();
        const center=orbs[0];
        for (let i=1;i<orbs.length;i++) {
          ctx.moveTo(center.x+shakeX,center.y+shakeY); ctx.lineTo(orbs[i].x+shakeX,orbs[i].y+shakeY);
          if(i<orbs.length-1){ctx.moveTo(orbs[i].x+shakeX,orbs[i].y+shakeY); ctx.lineTo(orbs[i+1].x+shakeX,orbs[i+1].y+shakeY);}
        }
        ctx.stroke(); ctx.shadowBlur=0;
      }
      if (elapsed>4500 && elapsed<4800) { const fo=1-(elapsed-4500)/300; ctx.fillStyle=`rgba(255,255,255,${fo})`; ctx.fillRect(0,0,W,H); }
      orbs.forEach(orb => {
        if (elapsed>4500 && !orb.isCenter) return;
        let ox=0, oy=0;
        if (currentPhase==='burning' && elapsed<4500) { const int=Math.max(0,(elapsed-2000)/2500); ox=(Math.random()-0.5)*10*int; oy=(Math.random()-0.5)*10*int; }
        ctx.beginPath();
        if (orb.isCenter) {
          if (elapsed>4500) { const pulse=Math.sin(Date.now()/600)*3; ctx.fillStyle='#ffffff'; ctx.shadowBlur=25+pulse*10; ctx.shadowColor='#ffffff'; ctx.arc(orb.x,orb.y,orb.baseRadius+6+pulse,0,Math.PI*2); }
          else { ctx.fillStyle=currentPhase==='burning'?'#ffffff':'rgba(255,255,255,0.8)'; ctx.arc(orb.x+ox,orb.y+oy,orb.baseRadius,0,Math.PI*2); }
        } else {
          ctx.fillStyle=currentPhase==='burning'?'#ff3333':'rgba(255,255,255,0.3)'; ctx.arc(orb.x+ox,orb.y+oy,orb.baseRadius,0,Math.PI*2);
        }
        ctx.fill(); ctx.shadowBlur=0;
      });
      if (currentPhase==='burning' && elapsed>6500) setPhase('gone');
      animationId=requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleBurn = () => {
    if (!letter.trim()) return;
    burnStartTime.current = Date.now();
    setPhase('burning');
    if (navigator.vibrate) { navigator.vibrate([30,80,30]); setTimeout(()=>navigator.vibrate([200,50,300]),4500); }
  };

  const s = {
    page:       { height: "100%", width: "100%", backgroundColor: "#050508", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
    canvas:     { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 },
    backWrap:   { position: "absolute", top: 20, left: 20, zIndex: 30 },
    backBtn:    { background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 },
    letterWrap: (ph) => ({ width: "85%", maxWidth: 400, zIndex: 20, transition: "all 3s cubic-bezier(0.25,1,0.5,1)", transform: ph==="burning"?"scale(1.05) translateY(-20px)":"scale(1) translateY(0)", filter: ph==="burning"?"blur(15px) brightness(2)":"none", opacity: ph==="burning"?0:1 }),
    title:      { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#fff", fontWeight: 300, marginBottom: 10, textAlign: "center" },
    prompt:     { color: "rgba(255,255,255,0.4)", fontSize: 14, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", textAlign: "center", marginBottom: 30 },
    textarea:   { width: "100%", height: 250, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 20, color: "rgba(255,255,255,0.8)", fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box" },
    btnWrap:    { textAlign: "center", marginTop: 30 },
    burnBtn:    (active) => ({ background: "transparent", border: active?"1px solid rgba(255,90,0,0.6)":"1px solid rgba(255,255,255,0.1)", color: active?"#ff9a00":"rgba(255,255,255,0.2)", padding: "12px 40px", borderRadius: 30, fontSize: 16, cursor: active?"pointer":"default", letterSpacing: 2, transition: "all 0.3s ease", boxShadow: active?"0 0 15px rgba(255,90,0,0.2)":"none" }),
    goneWrap:   { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, animation: "fadeIn 3s ease" },
    goneDove:   { fontSize: 40, marginBottom: 20, opacity: 0.8, marginTop: -100 },
    goneTitle:  { color: "#d4af37", fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", letterSpacing: 1, textAlign: "center" },
    goneSub:    { color: "rgba(255,255,255,0.4)", fontSize: 16, fontFamily: "'Cormorant Garamond', serif", marginTop: 10 },
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />
      <div style={s.backWrap}>
        <button onClick={() => setTab(null)} style={s.backBtn}>← {isHindi ? "वापस" : "Back"}</button>
      </div>

      {(phase === 'compose' || phase === 'burning') && (
        <div style={s.letterWrap(phase)}>
          <h2 style={s.title}>{isHindi ? "अनभेजा पत्र" : "The Unsent Letter"}</h2>
          <p style={s.prompt}>
            {isHindi
              ? "वह लिखें जो आपने कभी नहीं कहा। उसे जाने दें।"
              : "Write what you never said. To the one who hurt you. Let it go."}
          </p>
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            disabled={phase === 'burning'}
            placeholder={isHindi ? "प्रिय..." : "Dear..."}
            style={s.textarea}
          />
          <div style={s.btnWrap}>
            <button onClick={handleBurn} disabled={!letter.trim() || phase === 'burning'} style={s.burnBtn(!!letter.trim())}>
              {isHindi ? "जला दें" : "BURN"}
            </button>
          </div>
        </div>
      )}

      {phase === 'gone' && (
        <div style={s.goneWrap}>
          <span style={s.goneDove}>🕊️</span>
          <p style={s.goneTitle}>{isHindi ? "तार कट गया है।" : "The cord is cut."}</p>
          <p style={s.goneSub}>{isHindi ? "बोझ मुक्त हो गया है।" : "The burden is released."}</p>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
