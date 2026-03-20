import React, { useState, useEffect, useRef } from 'react';

const SCAN_SCRIPT = [
  { en: "Close your eyes.", hi: "अपनी आँखें बंद करें।" },
  { en: "Feel the surface beneath you.", hi: "अपने नीचे की सतह को महसूस करें।" },
  { en: "Bring your attention to your feet.", hi: "अपना ध्यान अपने पैरों पर लाएं।" },
  { en: "Tense them... then let them go.", hi: "उन्हें सिकोड़ें... फिर छोड़ दें।" },
  { en: "Move to your legs. Let them sink heavy.", hi: "अपने पैरों पर जाएं। उन्हें भारी होने दें।" },
  { en: "Release your stomach.", hi: "अपने पेट को ढीला छोड़ दें।" },
  { en: "Drop your shoulders away from your ears.", hi: "अपने कंधों को कानों से दूर गिराएं।" },
  { en: "Unclench your jaw.", hi: "अपने जबड़े को ढीला करें।" },
  { en: "Your body is heavy. You are safe.", hi: "आपका शरीर भारी है। आप सुरक्षित हैं।" },
  { en: "", hi: "" }
];

export function HeavyScan({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const wakeLockRef = useRef(null);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";

  // ─── SCREEN WAKE LOCK ───
  useEffect(() => {
    const requestWakeLock = async () => {
      if (isActive && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
        }
      }
    };

    if (isActive) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isActive]);

  // ─── AUDIO ENGINE (TEXT TO SPEECH) ───
  const speak = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = hi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.7; 
    utterance.pitch = 0.8; 
    
    window.speechSynthesis.speak(utterance);
  };

  const startScan = () => {
    setIsActive(true);
    setStep(0);
  };

  useEffect(() => {
    if (!isActive) return;
    if (step >= SCAN_SCRIPT.length - 1) {
      // Release wake lock when finished
      setIsActive(false); 
      return; 
    }

    const currentText = hi ? SCAN_SCRIPT[step].hi : SCAN_SCRIPT[step].en;
    speak(currentText);

    const timer = setTimeout(() => {
      setStep(s => s + 1);
    }, 12000); 

    return () => clearTimeout(timer);
  }, [step, isActive, hi]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.4, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      {!isActive ? (
        <div style={{ textAlign: 'center', animation: 'fadeIn 2s ease' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 16 }}>
            {hi ? "गहरी शांति" : "Heavy Scan"}
          </h2>
          <p style={{ color: dimAmber, opacity: 0.6, fontSize: 15, lineHeight: 1.6, marginBottom: 40, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', padding: '0 20px' }}>
            {hi 
              ? "एक निर्देशित ऑडियो अभ्यास। अपनी आँखें बंद करें और आवाज़ का पालन करें।" 
              : "A guided audio descent. Close your eyes and follow the voice."}
          </p>
          <button 
            onClick={startScan}
            style={{
              background: 'transparent', border: `1px solid ${dimAmber}`,
              color: dimAmber, padding: '12px 40px', borderRadius: 30,
              fontSize: 16, cursor: 'pointer', letterSpacing: 2
            }}
          >
            {hi ? "सुनना शुरू करें" : "BEGIN AUDIO"}
          </button>
        </div>
      ) : (
        <p 
          key={step} 
          style={{ 
            fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: dimAmber, 
            textAlign: 'center', padding: '0 40px', lineHeight: 1.5,
            animation: 'amberFade 12s ease-in-out forwards'
          }}
        >
          {hi ? SCAN_SCRIPT[step].hi : SCAN_SCRIPT[step].en}
        </p>
      )}

      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.3, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes amberFade {
          0% { opacity: 0; filter: blur(4px); }
          20% { opacity: 0.6; filter: blur(0px); }
          80% { opacity: 0.6; filter: blur(0px); }
          100% { opacity: 0; filter: blur(4px); }
        }
      `}</style>
    </div>
  );
}