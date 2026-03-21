import React, { useState, useEffect } from 'react';

export function QuietCorner({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  const [hasStarted, setHasStarted] = useState(false);
  const [heading,    setHeading]    = useState(null);
  const [isAligned,  setIsAligned]  = useState(false);
  const [error,      setError]      = useState(null);

  const handleOrientation = (e) => {
    let h = null;
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
      h = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      h = 360 - e.alpha;
    }
    if (h !== null) {
      h = ((h % 360) + 360) % 360;
      setHeading(h);
      setIsAligned(h >= 30 && h <= 60);
    }
  };

  const startCompass = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setHasStarted(true);
        } else {
          setError(hi ? "कंपास की अनुमति अस्वीकृत कर दी गई।" : "Compass permission denied.");
        }
      } catch (err) { setError(err.message); }
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setHasStarted(true);
    }
  };

  useEffect(() => () => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    window.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  const simulatePC = () => { setHasStarted(true); setHeading(45); setIsAligned(true); };

  const gold = '#d4af37';

  const s = {
    page: {
      height: '100%', width: '100%', position: 'relative',
      overflow: 'hidden', touchAction: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: isAligned
        ? 'radial-gradient(circle at center, rgba(212,175,55,0.4) 0%, rgba(10,10,15,1) 70%)'
        : 'radial-gradient(circle at center, rgba(30,30,40,0.8) 0%, rgba(10,10,15,1) 100%)',
      transition: 'background 2s ease',
    },
    backBtn:   { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' },
    navWrap:   { position: 'absolute', top: 20, left: 20, zIndex: 20 },

    // Start screen
    startWrap: { textAlign: 'center', padding: 30, maxWidth: 400, zIndex: 10 },
    startEmoji: { fontSize: 40, display: 'block', marginBottom: 20 },
    startTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fff', fontWeight: 300, marginBottom: 16 },
    startDesc:  { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 },
    startHint:  { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic', marginBottom: 30 },
    startBtn:   { background: 'rgba(212,175,55,0.2)', border: `1px solid rgba(212,175,55,0.5)`, color: gold, padding: '14px 32px', borderRadius: 30, fontSize: 16, fontFamily: "'Cormorant Garamond', serif", cursor: 'pointer', marginBottom: 20, transition: 'background 0.2s' },
    errorText:  { color: '#ff6b6b', fontSize: 13, marginTop: 10 },
    pcBtn:      { display: 'block', margin: '0 auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' },

    // Compass
    compassWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 },
    compassRing: { width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isAligned ? '0 0 50px rgba(212,175,55,0.3)' : 'none', transition: 'box-shadow 2s ease' },
    compassDial: { width: '100%', height: '100%', position: 'absolute', transform: heading ? `rotate(${-heading}deg)` : 'rotate(0deg)', transition: 'transform 0.1s linear' },
    dirN:  { position: 'absolute', top: 10,    left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' },
    dirS:  { position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)' },
    dirE:  { position: 'absolute', top: '50%', right: 10,   transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' },
    dirW:  { position: 'absolute', top: '50%', left: 10,    transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' },
    neDot: { position: 'absolute', top: 35, right: 35, width: 12, height: 12, borderRadius: '50%', background: isAligned ? gold : 'rgba(255,255,255,0.2)', boxShadow: isAligned ? `0 0 15px ${gold}` : 'none', transition: 'all 0.5s ease' },
    needle: { width: 2, height: 40, background: 'rgba(255,255,255,0.8)', position: 'absolute', top: -20, borderRadius: 2 },
    orbCenter: { width: 80, height: 80, borderRadius: '50%', background: isAligned ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', border: isAligned ? `1px solid rgba(212,175,55,0.5)` : '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 2s ease' },
    orbStar: { fontSize: 24, opacity: isAligned ? 1 : 0.3, transition: 'opacity 2s ease' },
    statusWrap: { marginTop: 50, textAlign: 'center', height: 80 },
    statusTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: isAligned ? gold : '#fff', fontWeight: 300, margin: '0 0 8px', transition: 'color 1s ease' },
    statusDesc:  { color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0, opacity: isAligned ? 1 : 0.5, transition: 'opacity 1s ease' },
  };

  return (
    <div style={s.page}>

      <div style={s.navWrap}>
        <button
          onClick={() => setTab('resonance')}
          style={s.backBtn}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      {!hasStarted ? (
        <div style={s.startWrap}>
          <span style={s.startEmoji}>🧭</span>
          <h2 style={s.startTitle}>{hi ? "ईशान कोण खोजें" : "Find Your Ishan Kone"}</h2>
          <p style={s.startDesc}>
            {hi
              ? "वास्तु में, उत्तर-पूर्व (ईशान कोण) ध्यान और स्पष्टता की दिशा है। अपने फोन के कंपास का उपयोग करके इसे खोजें।"
              : "In Vastu, the Northeast (Ishan Kone) is the direction of meditation and clarity. Let's use your compass to find it."}
          </p>
          <p style={s.startHint}>📱 {hi ? "लाइव कंपास के लिए कृपया मोबाइल फ़ोन का उपयोग करें।" : "Please use a mobile device for the live compass."}</p>
          <button
            onClick={startCompass}
            style={s.startBtn}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.32)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {hi ? "कंपास शुरू करें" : "Start Compass"}
          </button>
          {error && <p style={s.errorText}>{error}</p>}
          <button onClick={simulatePC} style={s.pcBtn}>
            {hi ? "PC पर परीक्षण करें" : "Test on PC Browser"}
          </button>
        </div>
      ) : (
        <div style={s.compassWrap}>
          <div style={s.compassRing}>
            <div style={s.compassDial}>
              <span style={s.dirN}>N</span>
              <span style={s.dirS}>S</span>
              <span style={s.dirE}>E</span>
              <span style={s.dirW}>W</span>
              <div style={s.neDot} />
            </div>
            <div style={s.needle} />
            <div style={s.orbCenter}>
              <span style={s.orbStar}>✨</span>
            </div>
          </div>
          <div style={s.statusWrap}>
            <h3 style={s.statusTitle}>
              {isAligned
                ? (hi ? "यही आपका शांत कोना है" : "You have found your Quiet Corner")
                : (hi ? "धीरे-धीरे घूमें..." : "Turn slowly...")}
            </h3>
            <p style={s.statusDesc}>
              {isAligned
                ? (hi ? "यहाँ बैठें। एक गहरी साँस लें।" : "Sit here. Take a deep breath.")
                : (hi ? "उत्तर-पूर्व दिशा खोजें (45°)" : "Locating Northeast (45°)")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
