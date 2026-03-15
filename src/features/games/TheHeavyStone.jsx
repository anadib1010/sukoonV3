import React, { useState, useEffect, useRef } from 'react';

export function TheHeavyStone({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  // PHASES: 'intro' -> 'dragging' -> 'sunk'
  const [phase, setPhase] = useState('intro');
  
  const rockRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const rumbleInterval = useRef(null);
  
  // Drag state
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const depthRatio = useRef(0); // 0.0 (top) to 1.0 (bottom)

  // ─── START THE DRAG ───
  const handlePointerDown = (e) => {
    if (phase !== 'dragging') return;
    
    isDragging.current = true;
    startY.current = e.clientY - currentY.current;
    
    if (rockRef.current) rockRef.current.setPointerCapture(e.pointerId);

    if (!rumbleInterval.current) {
      rumbleInterval.current = setInterval(applyRumble, 50);
    }
    
    updatePhysics();
  };

  // ─── DRAGGING DOWNWARD ───
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

  // ─── LETTING GO ───
  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (rockRef.current) rockRef.current.releasePointerCapture(e.pointerId);
    if (rumbleInterval.current) {
      clearInterval(rumbleInterval.current);
      rumbleInterval.current = null;
    }

    if (depthRatio.current > 0.85) {
      setPhase('sunk');
      if (navigator.vibrate) navigator.vibrate([30, 50, 20]); 
    } else {
      snapBackToTop();
    }
  };

  // ─── THE RUMBLE ENGINE ───
  const applyRumble = () => {
    if (!isDragging.current) return;
    
    const intensity = 1 - depthRatio.current;
    
    if (navigator.vibrate && intensity > 0.1) {
      navigator.vibrate(Math.floor(intensity * 30)); 
    }
  };

  // ─── VISUAL PHYSICS (60FPS) ───
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

  // ─── SNAP BACK ───
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

  return (
    <div 
      ref={containerRef}
      style={{
        height: '100%', width: '100%', backgroundColor: '#05050a',
        position: 'relative', overflow: 'hidden', touchAction: 'none',
        transition: 'background-color 0.1s linear'
      }}
    >
      
      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 30 }}>
        <button 
          onClick={() => setTab(null)} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}
        >
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── PHASE 1: INTRO ─── */}
      {phase === 'intro' && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 20, animation: 'fadeIn 1.5s ease'
        }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#fff', fontWeight: 300, marginBottom: 20 }}>
            {isHindi ? "भारी पत्थर" : "The Heavy Stone"}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", textAlign: 'center', maxWidth: 300, marginBottom: 40, lineHeight: 1.5 }}>
            {isHindi 
              ? "यह बोझ भारी और अस्थिर है। इसे पकड़ें और धीरे-धीरे गहराई में खींचें जब तक कि यह शांत न हो जाए।" 
              : "This burden is heavy and unstable. Hold it, and pull it down into the deep until it is completely quiet."}
          </p>
          <button 
            onClick={() => setPhase('dragging')}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff',
              padding: '12px 40px', borderRadius: 30, fontSize: 16, cursor: 'pointer',
              letterSpacing: 2, transition: 'all 0.3s ease'
            }}
          >
            {isHindi ? "मैं तैयार हूँ" : "I AM READY"}
          </button>
        </div>
      )}

      {/* ─── PHASE 2: DRAGGING THE STONE ─── */}
      {phase === 'dragging' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <p style={{ position: 'absolute', top: 80, color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', animation: 'fadeIn 2s ease' }}>
            {isHindi ? "नीचे खींचें" : "Drag Downward"}
          </p>
          <p style={{ position: 'absolute', bottom: 40, color: 'rgba(255,255,255,0.1)', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>
            {isHindi ? "समर्पण" : "Surrender"}
          </p>

          {/* DRAGGING CONTAINER */}
          <div 
            ref={rockRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'absolute', top: 120,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'grab', 
              touchAction: 'none',
              // ─── MAGIC FIX: Disables mobile copy/paste menus ───
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          >
            {/* THE PHYSICAL ROCK */}
            <div style={{
              width: 100, height: 120,
              background: 'radial-gradient(ellipse at 30% 30%, #4a4a5a 0%, #1a1a24 100%)',
              borderRadius: '40% 60% 55% 45% / 50% 45% 60% 50%', 
              boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.6)',
              pointerEvents: 'none' // Lets the touch pass through to the container
            }} />
            
            {/* THE ICON BELOW THE ROCK */}
            <span style={{ fontSize: 32, opacity: 0.4, marginTop: 15, pointerEvents: 'none' }}>👆</span>
          </div>
        </div>
      )}

      {/* ─── PHASE 3: SUNK ─── */}
      {phase === 'sunk' && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          zIndex: 20, animation: 'fadeIn 3s ease', backgroundColor: '#000'
        }}>
          <p style={{ color: '#d4af37', fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', letterSpacing: 1 }}>
            {isHindi ? "यह चला गया है। आप हल्के हैं।" : "It is gone. You are light."}
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