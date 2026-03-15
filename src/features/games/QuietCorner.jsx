import React, { useState, useEffect } from 'react';

export function QuietCorner({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  const [hasStarted, setHasStarted] = useState(false);
  const [heading, setHeading] = useState(null);
  const [isAligned, setIsAligned] = useState(false);
  const [error, setError] = useState(null);

  // ─── COMPASS LOGIC ───
  const handleOrientation = (e) => {
    let newHeading = null;
    
    // iOS uses webkitCompassHeading, Android uses alpha
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
      newHeading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      // Android alpha is counter-clockwise. Convert to compass heading:
      newHeading = 360 - e.alpha; 
    }

    if (newHeading !== null) {
      // Normalize heading to 0-360
      let h = newHeading % 360;
      if (h < 0) h += 360;
      setHeading(h);

      // Ishan Kone (Northeast) is 45°. We give a 15° buffer (30° to 60°)
      if (h >= 30 && h <= 60) {
        setIsAligned(true);
      } else {
        setIsAligned(false);
      }
    }
  };

  const startCompass = async () => {
    // iOS 13+ requires explicit user permission for DeviceOrientation
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setHasStarted(true);
        } else {
          setError(isHindi ? "कंपास की अनुमति अस्वीकृत कर दी गई।" : "Compass permission denied.");
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Non-iOS devices (Android, etc.)
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setHasStarted(true);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // ─── PC SIMULATION TRIGGER ───
  const simulatePC = () => {
    setHasStarted(true);
    setHeading(45); 
    setIsAligned(true);
  };

  // ─── DYNAMIC STYLING ───
  const bgStyle = isAligned 
    ? "radial-gradient(circle at center, rgba(212, 175, 55, 0.4) 0%, rgba(10, 10, 15, 1) 70%)" 
    : "radial-gradient(circle at center, rgba(30, 30, 40, 0.8) 0%, rgba(10, 10, 15, 1) 100%)";
  
  const compassRotation = heading ? `rotate(${-heading}deg)` : 'rotate(0deg)';

  return (
    <div style={{
      height: '100%', width: '100%', background: bgStyle,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', touchAction: 'none',
      transition: 'background 2s ease'
    }}>
      
      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}>
        <button onClick={() => setTab('resonance')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {!hasStarted ? (
        // ─── START SCREEN ───
        <div style={{ textAlign: 'center', padding: 30, maxWidth: 400, zIndex: 10 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 20 }}>🧭</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fff', fontWeight: 300, marginBottom: 16 }}>
            {isHindi ? "ईशान कोण खोजें" : "Find Your Ishan Kone"}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            {isHindi 
              ? "वास्तु में, उत्तर-पूर्व (ईशान कोण) ध्यान और स्पष्टता की दिशा है। अपने फोन के कंपास का उपयोग करके इसे खोजें।" 
              : "In Vastu, the Northeast (Ishan Kone) is the direction of meditation and clarity. Let's use your compass to find it."}
          </p>
          
          {/* ─── MOBILE DEVICE WARNING ─── */}
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic', marginBottom: 30 }}>
            {isHindi ? "📱 लाइव कंपास के लिए कृपया मोबाइल फ़ोन का उपयोग करें।" : "📱 Please use a mobile device for the live compass."}
          </p>

          <button 
            onClick={startCompass}
            style={{ 
              background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.5)',
              color: '#d4af37', padding: '14px 32px', borderRadius: 30, fontSize: 16,
              fontFamily: "'Cormorant Garamond', serif", cursor: 'pointer', marginBottom: 20
            }}
          >
            {isHindi ? "कंपास शुरू करें" : "Start Compass"}
          </button>

          {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 10 }}>{error}</p>}

          <button onClick={simulatePC} style={{ display: 'block', margin: '0 auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>
            {isHindi ? "PC पर परीक्षण करें" : "Test on PC Browser"}
          </button>
        </div>
      ) : (
        // ─── LIVE COMPASS ───
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          
          <div style={{
            width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isAligned ? '0 0 50px rgba(212, 175, 55, 0.3)' : 'none',
            transition: 'box-shadow 2s ease'
          }}>
            
            <div style={{
              width: '100%', height: '100%', position: 'absolute',
              transform: compassRotation, transition: 'transform 0.1s linear'
            }}>
              <span style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>N</span>
              <span style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)' }}>S</span>
              <span style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>E</span>
              <span style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>W</span>
              
              <div style={{
                position: 'absolute', top: 35, right: 35,
                width: 12, height: 12, borderRadius: '50%',
                background: isAligned ? '#d4af37' : 'rgba(255,255,255,0.2)',
                boxShadow: isAligned ? '0 0 15px #d4af37' : 'none',
                transition: 'all 0.5s ease'
              }} />
            </div>

            <div style={{ width: 2, height: 40, background: 'rgba(255,255,255,0.8)', position: 'absolute', top: -20, borderRadius: 2 }} />
            
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: isAligned ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
              border: isAligned ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 2s ease'
            }}>
              <span style={{ fontSize: 24, opacity: isAligned ? 1 : 0.3, transition: 'opacity 2s ease' }}>✨</span>
            </div>
          </div>

          <div style={{ marginTop: 50, textAlign: 'center', height: 80 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: isAligned ? '#d4af37' : '#fff', fontWeight: 300, margin: '0 0 8px', transition: 'color 1s ease' }}>
              {isAligned 
                ? (isHindi ? "यही आपका शांत कोना है" : "You have found your Quiet Corner") 
                : (isHindi ? "धीरे-धीरे घूमें..." : "Turn slowly...")}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0, opacity: isAligned ? 1 : 0.5, transition: 'opacity 1s ease' }}>
              {isAligned 
                ? (isHindi ? "यहाँ बैठें। एक गहरी साँस लें।" : "Sit here. Take a deep breath.") 
                : (isHindi ? "उत्तर-पूर्व दिशा खोजें (45°)" : "Locating Northeast (45°)")}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}