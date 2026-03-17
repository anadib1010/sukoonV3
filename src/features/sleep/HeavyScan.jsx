import React, { useState, useEffect } from 'react';

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

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";

  useEffect(() => {
    if (step >= SCAN_SCRIPT.length - 1) return;
    const timer = setTimeout(() => {
      setStep(s => s + 1);
    }, 10000); // 10 seconds per prompt
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.4, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      <p 
        key={step} 
        style={{ 
          fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: dimAmber, 
          textAlign: 'center', padding: '0 40px', lineHeight: 1.5,
          animation: 'amberFade 10s ease-in-out forwards'
        }}
      >
        {hi ? SCAN_SCRIPT[step].hi : SCAN_SCRIPT[step].en}
      </p>

      <style>{`
        @keyframes amberFade {
          0% { opacity: 0; filter: blur(4px); }
          20% { opacity: 0.8; filter: blur(0px); }
          80% { opacity: 0.8; filter: blur(0px); }
          100% { opacity: 0; filter: blur(4px); }
        }
      `}</style>
    </div>
  );
}