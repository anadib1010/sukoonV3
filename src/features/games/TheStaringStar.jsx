import React, { useState, useEffect, useRef } from 'react';

export function TheStaringStar({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  const [phase,           setPhase]           = useState('intro');
  const [difficulty,      setDifficulty]      = useState('medium');
  const [permissionError, setPermissionError] = useState(false);

  const starRef       = useRef(null);
  const textRef       = useRef(null);
  const animationRef  = useRef(null);
  const brightness    = useRef(10);
  const movement      = useRef(0);
  const lastAngles    = useRef({ beta: null, gamma: null });

  const levels = {
    easy:    { threshold: 1.2, recovery: 0.30, label: hi ? "आसान"        : "Easy",    desc: hi ? "शुरुआत करने के लिए एक आसान स्तर।"               : "A gentle starting point." },
    medium:  { threshold: 0.6, recovery: 0.15, label: hi ? "मध्यम"       : "Medium",  desc: hi ? "एकाग्रता के लिए एक संतुलित चुनौती।"              : "A balanced challenge for your focus." },
    hard:    { threshold: 0.3, recovery: 0.08, label: hi ? "कठिन"        : "Hard",    desc: hi ? "गहरी शारीरिक स्थिरता की आवश्यकता है।"            : "Requires deep physical stillness." },
    extreme: { threshold: 0.1, recovery: 0.04, label: hi ? "अत्यंत कठिन" : "Extreme", desc: hi ? "पूर्ण स्थिरता की आवश्यकता है। हर गति मायने रखती है।" : "Absolute stillness required. Every movement matters." },
  };

  const startGazing = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') { setPermissionError(true); return; }
      } catch {}
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

  useEffect(() => () => stopGazing(), []);

  const handleOrientation = (e) => {
    const { beta, gamma } = e;
    if (lastAngles.current.beta === null) { lastAngles.current = { beta, gamma }; return; }
    movement.current += Math.abs(beta - lastAngles.current.beta) + Math.abs(gamma - lastAngles.current.gamma);
    lastAngles.current = { beta, gamma };
  };

  const handleMouseMove = (e) => { movement.current += (Math.abs(e.movementX) + Math.abs(e.movementY)) * 0.1; };

  const gameLoop = () => {
    if (phase === 'clarity') return;
    const lv = levels[difficulty];
    if (movement.current > lv.threshold) brightness.current = Math.max(5, brightness.current - movement.current * 0.5);
    else brightness.current = Math.min(100, brightness.current + lv.recovery);
    movement.current *= 0.8;
    if (starRef.current) {
      const b = brightness.current;
      starRef.current.style.transform = `scale(${0.5 + b / 100})`;
      starRef.current.style.opacity = Math.max(0.1, b / 100);
      starRef.current.style.boxShadow = `0 0 ${b * 1.5}px ${b * 0.75}px rgba(255,255,255,${b / 100})`;
    }
    if (textRef.current) textRef.current.style.opacity = Math.max(0, 1 - brightness.current / 30);
    if (brightness.current >= 100) { stopGazing(); setPhase('clarity'); return; }
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const serif = "'Cormorant Garamond', serif";

  const s = {
    page:      { height: '100%', width: '100%', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', color: '#fff' },
    backBtn:   { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, transition: 'color 0.2s' },
    navWrap:   { position: 'absolute', top: 20, left: 20, zIndex: 20 },
    introWrap: { textAlign: 'center', width: '80%', maxWidth: 400 },
    introTitle:{ fontFamily: serif, fontSize: 32, fontWeight: 300, marginBottom: 20, textTransform: "uppercase", letterSpacing: "2px" },
    introDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.6, marginBottom: 24, fontFamily: serif, fontStyle: 'italic' },
    select:    { width: '100%', padding: '12px 20px', borderRadius: 15, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', appearance: 'none', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' },
    selectDesc:{ marginTop: 12, fontSize: 13, color: '#ff7e00', opacity: 0.8, minHeight: 36, lineHeight: 1.4 },
    infoBox:   { background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, marginBottom: 30, textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)' },
    infoLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' },
    infoText:  { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 },
    errText:   { color: '#ff8a8a', fontSize: 14, marginBottom: 20 },
    beginBtn:  { background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 40px', borderRadius: 30, fontSize: 16, cursor: 'pointer', letterSpacing: 2, transition: 'all 0.3s ease' },
    activeWrap:{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    holdText:  { position: 'absolute', top: '20%', textAlign: 'center', transition: 'opacity 0.1s linear' },
    holdLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 16, letterSpacing: 2, textTransform: 'uppercase' },
    star:      { width: 8, height: 8, backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 10px 5px rgba(255,255,255,0.1)', transition: 'transform 0.1s linear, box-shadow 0.1s linear, opacity 0.1s linear' },
    clarityWrap:{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', animation: 'pureWhite 4s forwards' },
    clarityText:{ color: '#000', fontSize: 24, fontFamily: serif, letterSpacing: 2, animation: 'textFadeIn 6s forwards', opacity: 0, textTransform: "uppercase" },
    selectWrap:{ marginBottom: 20 },
  };

  return (
    <div style={s.page}>
      <div style={s.navWrap}>
        <button onClick={() => setTab('stillness')} style={s.backBtn}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      {phase === 'intro' && (
        <div style={s.introWrap}>
          <h2 style={s.introTitle}>{hi ? "स्थिरता बिंदु" : "The Stillness Point"}</h2>
          <p style={s.introDesc}>
            {hi
              ? "अपने फोन को दोनों हाथों में लें। बीच में चमकते हुए बिंदु पर ध्यान केंद्रित करें। यदि आपके हाथ कांपते हैं, तो प्रकाश धुंधला हो जाएगा। एक गहरी, संतुलित स्थिरता खोजें, और बिंदु चमकने लगेगा।"
              : "Hold your mobile device in both hands. Focus your attention on the single point of light. If your hands waver, the light dims. Find a deep, steady stillness, and clarity will follow."}
          </p>
          <div style={s.selectWrap}>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={s.select}>
              {Object.keys(levels).map(lvl => (
                <option key={lvl} value={lvl} style={{ background: '#111' }}>{levels[lvl].label}</option>
              ))}
            </select>
            <div style={s.selectDesc}>{levels[difficulty].desc}</div>
          </div>
          <div style={s.infoBox}>
            <h4 style={s.infoLabel}>{hi ? "यह कैसे काम करता है" : "How it works"}</h4>
            <p style={s.infoText}>
              {hi
                ? "उच्च स्तर प्रकाश को गति के प्रति अधिक संवेदनशील बनाते हैं। कठिन स्तरों पर अभ्यास करने से आप अपनी शारीरिक स्थिरता और एकाग्रता को चुनौती देते हैं।"
                : "Higher levels make the light more sensitive to movement. By practicing at harder levels, you challenge your ability to remain completely still and focused."}
            </p>
          </div>
          {permissionError && <p style={s.errText}>{hi ? "गति सेंसर तक पहुंच की आवश्यकता है।" : "Motion sensor access is required to play."}</p>}
          <button onClick={startGazing} style={s.beginBtn}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {hi ? "शुरू करें" : "BEGIN"}
          </button>
        </div>
      )}

      {phase === 'active' && (
        <div style={s.activeWrap}>
          <div ref={textRef} style={s.holdText}>
            <p style={s.holdLabel}>{hi ? "स्थिर रहें" : "Hold Steady"}</p>
          </div>
          <div ref={starRef} style={s.star} />
        </div>
      )}

      {phase === 'clarity' && (
        <div style={s.clarityWrap}>
          <p style={s.clarityText}>{hi ? "गहरी स्थिरता प्राप्त हुई।" : "Deep stillness found."}</p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pureWhite { 0% { background-color: rgba(255,255,255,0); } 100% { background-color: rgba(255,255,255,1); } }
        @keyframes textFadeIn { 0% { opacity: 0; transform: translateY(10px); } 50% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
