import React, { useState, useEffect, useRef } from 'react';

export function TheStaringStar({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  // ─── PHASES: 'intro' -> 'active' -> 'clarity' (win) ───
  const [phase, setPhase] = useState('intro');
  const [difficulty, setDifficulty] = useState('medium'); 
  const [permissionError, setPermissionError] = useState(false);
  
  // Refs for high-performance animation loop
  const starRef = useRef(null);
  const textRef = useRef(null);
  const animationRef = useRef(null);
  
  // Game variables
  const brightness = useRef(10); 
  const movement = useRef(0);
  const lastAngles = useRef({ beta: null, gamma: null });

  // ─── DIFFICULTY CONFIGURATION ───
  const levels = {
    easy:    { threshold: 1.2, recovery: 0.30, label: isHindi ? "आसान" : "Easy", desc: isHindi ? "शुरुआत करने के लिए एक आसान स्तर।" : "A gentle starting point." },
    medium:  { threshold: 0.6, recovery: 0.15, label: isHindi ? "मध्यम" : "Medium", desc: isHindi ? "एकाग्रता के लिए एक संतुलित चुनौती।" : "A balanced challenge for your focus." },
    hard:    { threshold: 0.3, recovery: 0.08, label: isHindi ? "कठिन" : "Hard", desc: isHindi ? "गहरी शारीरिक स्थिरता की आवश्यकता है।" : "Requires deep physical stillness." },
    extreme: { threshold: 0.1, recovery: 0.04, label: isHindi ? "अत्यंत कठिन" : "Extreme", desc: isHindi ? "पूर्ण स्थिरता की आवश्यकता है। हर गति मायने रखती है।" : "Absolute stillness required. Every movement matters." }
  };

  // ─── SENSOR LOGIC ───
  const startGazing = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          setPermissionError(true);
          return;
        }
      } catch (error) {
      }
    }
    
    setPhase('active');
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouseMove);
    gameLoop();
  };

  const stopGazing = () => {
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('mousemove', handleMouseMove);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  useEffect(() => {
    return () => stopGazing();
  }, []);

  const handleOrientation = (event) => {
    const { beta, gamma } = event;
    if (lastAngles.current.beta === null) {
      lastAngles.current = { beta, gamma };
      return;
    }
    const deltaBeta = Math.abs(beta - lastAngles.current.beta);
    const deltaGamma = Math.abs(gamma - lastAngles.current.gamma);
    movement.current += (deltaBeta + deltaGamma);
    lastAngles.current = { beta, gamma };
  };

  const handleMouseMove = (e) => {
    const speed = Math.abs(e.movementX) + Math.abs(e.movementY);
    movement.current += speed * 0.1; 
  };

  // ─── THE PHYSICS LOOP ───
  const gameLoop = () => {
    if (phase === 'clarity') return;

    const currentLevel = levels[difficulty];

    if (movement.current > currentLevel.threshold) {
      brightness.current = Math.max(5, brightness.current - movement.current * 0.5);
    } else {
      brightness.current = Math.min(100, brightness.current + currentLevel.recovery);
    }

    movement.current *= 0.8; 

    if (starRef.current) {
      const b = brightness.current;
      const scale = 0.5 + (b / 100); 
      const glow = b * 1.5; 
      
      starRef.current.style.transform = `scale(${scale})`;
      starRef.current.style.opacity = Math.max(0.1, b / 100);
      starRef.current.style.boxShadow = `0 0 ${glow}px ${glow / 2}px rgba(255, 255, 255, ${b / 100})`;
    }

    if (textRef.current) {
      textRef.current.style.opacity = Math.max(0, 1 - (brightness.current / 30));
    }

    if (brightness.current >= 100) {
      stopGazing();
      setPhase('clarity');
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div style={{
      height: '100%', width: '100%', backgroundColor: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', color: '#fff'
    }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}>
        <button 
          onClick={() => setTab('stillness')} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14 }}
        >
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {phase === 'intro' && (
        <div style={{ textAlign: 'center', width: '80%', maxWidth: 400, animation: 'fadeIn 2s ease' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, marginBottom: 20, textTransform: "uppercase", letterSpacing: "2px" }}>
            {isHindi ? "स्थिरता बिंदु" : "The Stillness Point"}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.6, marginBottom: 24, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
            {isHindi 
              ? "अपने फोन को दोनों हाथों में लें। बीच में चमकते हुए बिंदु पर ध्यान केंद्रित करें। यदि आपके हाथ कांपते हैं, तो प्रकाश धुंधला हो जाएगा। एक गहरी, संतुलित स्थिरता खोजें, और बिंदु चमकने लगेगा।"
              : "Hold your mobile device in both hands. Focus your attention on the single point of light. If your hands waver, the light dims. Find a deep, steady stillness, and clarity will follow."}
          </p>

          {/* ─── DROP DOWN SELECTOR ─── */}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                width: '100%', padding: '12px 20px', borderRadius: '15px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '14px', outline: 'none', appearance: 'none',
                textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {Object.keys(levels).map(lvl => (
                <option key={lvl} value={lvl} style={{ background: '#111' }}>
                  {levels[lvl].label}
                </option>
              ))}
            </select>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#ff7e00', opacity: 0.8, minHeight: '36px', lineHeight: 1.4 }}>
              {levels[difficulty].desc}
            </div>
          </div>

          {/* ─── EDUCATIONAL TEXT (NON-CLINICAL) ─── */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: 30, textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>
              {isHindi ? "यह कैसे काम करता है" : "How it works"}
            </h4>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', margin: 0 }}>
              {isHindi 
                ? "उच्च स्तर प्रकाश को गति के प्रति अधिक संवेदनशील बनाते हैं। कठिन स्तरों पर अभ्यास करने से आप अपनी शारीरिक स्थिरता और एकाग्रता को चुनौती देते हैं।"
                : "Higher levels make the light more sensitive to movement. By practicing at harder levels, you challenge your ability to remain completely still and focused."}
            </p>
          </div>
          
          {permissionError && (
            <p style={{ color: '#ff8a8a', fontSize: 14, marginBottom: 20 }}>
              {isHindi ? "गति सेंसर तक पहुंच की आवश्यकता है।" : "Motion sensor access is required to play."}
            </p>
          )}

          <button 
            onClick={startGazing}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff',
              padding: '12px 40px', borderRadius: 30, fontSize: 16, cursor: 'pointer',
              letterSpacing: 2, transition: 'all 0.3s ease'
            }}
          >
            {isHindi ? "शुरू करें" : "BEGIN"}
          </button>
        </div>
      )}

      {phase === 'active' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div ref={textRef} style={{ position: 'absolute', top: '20%', textAlign: 'center', transition: 'opacity 0.1s linear' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
              {isHindi ? "स्थिर रहें" : "Hold Steady"}
            </p>
          </div>

          <div 
            ref={starRef}
            style={{
              width: 8, height: 8,
              backgroundColor: '#fff',
              borderRadius: '50%',
              boxShadow: '0 0 10px 5px rgba(255,255,255,0.1)',
              transition: 'transform 0.1s linear, box-shadow 0.1s linear, opacity 0.1s linear'
            }}
          />
        </div>
      )}

      {phase === 'clarity' && (
        <div style={{ 
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
          animation: 'pureWhite 4s forwards' 
        }}>
          <p style={{ 
            color: '#000', fontSize: 24, fontFamily: "'Cormorant Garamond', serif", 
            letterSpacing: 2, animation: 'textFadeIn 6s forwards', opacity: 0, textTransform: "uppercase"
          }}>
            {isHindi ? "गहरी स्थिरता प्राप्त हुई।" : "Deep stillness found."}
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pureWhite {
          0% { background-color: rgba(255, 255, 255, 0); }
          100% { background-color: rgba(255, 255, 255, 1); }
        }
        @keyframes textFadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          50% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}