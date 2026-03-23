import React, { useState, useEffect, useRef } from 'react';

export function TheHeavyStone({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  const [phase, setPhase] = useState('intro');
  const rockRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const rumbleInterval = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const depthRatio = useRef(0);

  const handlePointerDown = (e) => {
    if (phase !== 'dragging') return;
    isDragging.current = true;
    startY.current = e.clientY - currentY.current;
    if (rockRef.current) rockRef.current.setPointerCapture(e.pointerId);
    if (!rumbleInterval.current) rumbleInterval.current = setInterval(applyRumble, 50);
    updatePhysics();
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const containerHeight = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;
    const maxDrag = containerHeight - 150;
    let newY = e.clientY - startY.current;
    if (newY < 0) newY = 0;
    if (newY > maxDrag) newY = maxDrag;
    currentY.current = newY;
    depthRatio.current = newY / maxDrag;
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (rockRef.current) rockRef.current.releasePointerCapture(e.pointerId);
    if (rumbleInterval.current) { clearInterval(rumbleInterval.current); rumbleInterval.current = null; }
    if (depthRatio.current > 0.85) {
      setPhase('sunk');
      if (navigator.vibrate) navigator.vibrate([30, 50, 20]);
    } else {
      snapBackToTop();
    }
  };

  const applyRumble = () => {
    if (!isDragging.current) return;
    const intensity = 1 - depthRatio.current;
    if (navigator.vibrate && intensity > 0.1) navigator.vibrate(Math.floor(intensity * 30));
  };

  const updatePhysics = () => {
    if (!rockRef.current) return;
    if (isDragging.current) {
      const shakeAmount = (1 - Math.pow(depthRatio.current, 0.5)) * 8;
      const offsetX = (Math.random() - 0.5) * shakeAmount;
      const offsetY = (Math.random() - 0.5) * shakeAmount;
      const darkness = depthRatio.current * 0.8;
      rockRef.current.style.transform = `translateY(${currentY.current}px) translate(${offsetX}px, ${offsetY}px)`;
      rockRef.current.style.filter = `brightness(${1 - darkness})`;
      if (containerRef.current) {
        const r = Math.floor(5 - depthRatio.current * 5);
        const g = Math.floor(5 - depthRatio.current * 5);
        const b = Math.floor(20 - depthRatio.current * 20);
        containerRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      }
      animationRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  const snapBackToTop = () => {
    const snap = () => {
      currentY.current *= 0.8;
      depthRatio.current = currentY.current / (containerRef.current.clientHeight - 150);
      if (rockRef.current) {
        rockRef.current.style.transform = `translateY(${currentY.current}px)`;
        rockRef.current.style.filter = `brightness(${1 - depthRatio.current * 0.8})`;
      }
      if (currentY.current > 2) {
        animationRef.current = requestAnimationFrame(snap);
      } else {
        currentY.current = 0;
        depthRatio.current = 0;
        if (containerRef.current) containerRef.current.style.backgroundColor = '#05050a';
      }
    };
    animationRef.current = requestAnimationFrame(snap);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rumbleInterval.current) clearInterval(rumbleInterval.current);
    };
  }, []);

  const s = {
    page:         { height: "100%", width: "100%", backgroundColor: "#05050a", position: "relative", overflow: "hidden", touchAction: "none", transition: "background-color 0.1s linear" },
    backWrap:     { position: "absolute", top: 20, left: 20, zIndex: 30 },
    backBtn:      { background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 },
    introWrap:    { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, animation: "fadeIn 1.5s ease" },
    introTitle:   { fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#fff", fontWeight: 300, marginBottom: 20 },
    introBody:    { color: "rgba(255,255,255,0.6)", fontSize: 16, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", textAlign: "center", maxWidth: 300, marginBottom: 40, lineHeight: 1.5 },
    readyBtn:     { background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", padding: "12px 40px", borderRadius: 30, fontSize: 16, cursor: "pointer", letterSpacing: 2, transition: "all 0.3s ease" },
    dragWrap:     { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" },
    dragHint:     { position: "absolute", top: 80, color: "rgba(255,255,255,0.3)", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", animation: "fadeIn 2s ease" },
    dragSurrender:{ position: "absolute", bottom: 40, color: "rgba(255,255,255,0.1)", fontSize: 14, letterSpacing: 2, textTransform: "uppercase" },
    rockHandle:   { position: "absolute", top: 120, display: "flex", flexDirection: "column", alignItems: "center", cursor: "grab", touchAction: "none", WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" },
    rock:         { width: 100, height: 120, background: "radial-gradient(ellipse at 30% 30%, #4a4a5a 0%, #1a1a24 100%)", borderRadius: "40% 60% 55% 45% / 50% 45% 60% 50%", boxShadow: "inset -10px -10px 20px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.6)", pointerEvents: "none" },
    rockIcon:     { fontSize: 32, opacity: 0.4, marginTop: 15, pointerEvents: "none" },
    sunkWrap:     { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, animation: "fadeIn 3s ease", backgroundColor: "#000" },
    sunkText:     { color: "#d4af37", fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", letterSpacing: 1 },
  };

  return (
    <div ref={containerRef} style={s.page}>
      <div style={s.backWrap}><button onClick={() => setTab(null)} style={s.backBtn}>← {isHindi ? "वापस" : "Back"}</button></div>

      {phase === "intro" && (
        <div style={s.introWrap}>
          <h2 style={s.introTitle}>{isHindi ? "भारी पत्थर" : "The Heavy Stone"}</h2>
          <p style={s.introBody}>{isHindi ? "यह बोझ भारी और अस्थिर है। इसे पकड़ें और धीरे-धीरे गहराई में खींचें जब तक कि यह शांत न हो जाए।" : "This burden is heavy and unstable. Hold it, and pull it down into the deep until it is completely quiet."}</p>
          <button onClick={() => setPhase("dragging")} style={s.readyBtn}>{isHindi ? "मैं तैयार हूँ" : "I AM READY"}</button>
        </div>
      )}

      {phase === "dragging" && (
        <div style={s.dragWrap}>
          <p style={s.dragHint}>{isHindi ? "नीचे खींचें" : "Drag Downward"}</p>
          <p style={s.dragSurrender}>{isHindi ? "समर्पण" : "Surrender"}</p>
          <div ref={rockRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} style={s.rockHandle}>
            <div style={s.rock} />
            <span style={s.rockIcon}>👆</span>
          </div>
        </div>
      )}

      {phase === "sunk" && (
        <div style={s.sunkWrap}>
          <p style={s.sunkText}>{isHindi ? "यह चला गया है। आप हल्के हैं।" : "It is gone. You are light."}</p>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
