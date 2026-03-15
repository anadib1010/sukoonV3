import React, { useState, useEffect, useRef } from 'react';

export function MessageInBottle({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  const [step, setStep] = useState('compose'); // compose, sending, waiting, receiving, read
  const [userMessage, setUserMessage] = useState('');
  const [receivedMessage, setReceivedMessage] = useState('');
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // ─── THE KARMIC MESSAGES (Simulated Universe) ───
  const universeMessagesEn = [
    "May the peace you just sent out return to you a thousandfold.",
    "You are not alone. We are all connected by the same breath.",
    "Someone far away just felt a little lighter because of your energy.",
    "Breathe. You are exactly where you need to be in this moment.",
    "Your light makes this vast universe a little bit brighter."
  ];

  const universeMessagesHi = [
    "जो शांति आपने अभी भेजी है, वह हजार गुना होकर आपके पास लौटे।",
    "आप अकेले नहीं हैं। हम सब एक ही ऊर्जा और साँस से जुड़े हैं।",
    "आपकी सकारात्मक ऊर्जा से आज कहीं किसी को सुकून मिला है।",
    "गहरी साँस लें। आप इस पल में बिल्कुल वहीं हैं जहाँ आपको होना चाहिए।",
    "आपकी रोशनी इस विशाल ब्रह्मांड को थोड़ा और उज्ज्वल बनाती है।"
  ];

  // ─── COSMIC OCEAN CANVAS BACKGROUND ───
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create floating light particles (representing thoughts/souls)
    const initParticles = () => {
      particlesRef.current = Array.from({ length: 40 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.5 + 0.1),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1
      }));
    };
    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Gentle gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#05050a');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particlesRef.current.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        
        // Wrap around
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();
        
        // Add glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      });
      ctx.shadowBlur = 0; // reset
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ─── ORCHESTRATE THE FLOW OF KARMA ───
  const releaseMessage = () => {
    if (!userMessage.trim()) return;
    
    setStep('sending');
    
    // Simulate the message traveling away
    setTimeout(() => {
      setStep('waiting');
      
      // Simulate the universe finding a message for you
      setTimeout(() => {
        const msgArray = isHindi ? universeMessagesHi : universeMessagesEn;
        const randomMsg = msgArray[Math.floor(Math.random() * msgArray.length)];
        setReceivedMessage(randomMsg);
        setStep('receiving');
      }, 4000); // Wait 4 seconds in the void
      
    }, 2000); // Takes 2 seconds to fade out
  };

  const openReceivedMessage = () => {
    setStep('read');
  };

  const resetFlow = () => {
    setUserMessage('');
    setReceivedMessage('');
    setStep('compose');
  };

  return (
    <div style={{
      height: '100%', width: '100%', position: 'relative', overflow: 'hidden',
      color: '#fff', fontFamily: "'Cormorant Garamond', serif", touchAction: 'none'
    }}>
      
      {/* Background Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}>
        <button onClick={() => setTab('resonance')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── UI CONTAINER ─── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 10, padding: 20, boxSizing: 'border-box'
      }}>

        {/* STEP 1: COMPOSE */}
        <div style={{
          opacity: step === 'compose' ? 1 : 0,
          pointerEvents: step === 'compose' ? 'auto' : 'none',
          transition: 'opacity 1.5s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 300, marginBottom: 10, textAlign: 'center', letterSpacing: 1 }}>
            {isHindi ? "ब्रह्मांड के लिए एक संदेश" : "A Message to the Universe"}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 30, fontStyle: 'italic' }}>
            {isHindi 
              ? "बिना किसी उम्मीद के एक दयालु विचार या प्रार्थना लिखें और उसे जाने दें।" 
              : "Write a kind thought or prayer without expectation, and let it go."}
          </p>

          <textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder={isHindi ? "दुनिया के लिए कुछ अच्छा लिखें..." : "Write something kind for the world..."}
            style={{
              width: '100%', height: 160, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: 16,
              color: '#fff', fontSize: 16, fontFamily: "'Cormorant Garamond', serif",
              outline: 'none', resize: 'none', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}
          />

          <button 
            onClick={releaseMessage}
            disabled={!userMessage.trim()}
            style={{
              marginTop: 30, padding: '12px 32px', borderRadius: 30,
              background: userMessage.trim() ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
              border: userMessage.trim() ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: userMessage.trim() ? '#d4af37' : 'rgba(255,255,255,0.3)',
              fontSize: 16, fontFamily: "'Cormorant Garamond', serif", cursor: userMessage.trim() ? 'pointer' : 'default',
              transition: 'all 0.3s ease', letterSpacing: 1
            }}
          >
            {isHindi ? "ब्रह्मांड में भेजें ✨" : "Release into Universe ✨"}
          </button>
        </div>

        {/* STEP 2 & 3: SENDING / WAITING */}
        <div style={{
          position: 'absolute',
          opacity: (step === 'sending' || step === 'waiting') ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 2s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div className={`cosmic-orb ${step === 'sending' ? 'float-away' : 'hidden'}`} />
          
          <p style={{
            marginTop: 40, fontSize: 18, color: 'rgba(212, 175, 55, 0.8)', fontStyle: 'italic',
            opacity: step === 'waiting' ? 1 : 0, transition: 'opacity 2s ease', letterSpacing: 1
          }}>
            {isHindi ? "आपकी ऊर्जा ब्रह्मांड में गूंज रही है..." : "Your energy is rippling outward..."}
          </p>
        </div>

        {/* STEP 4: RECEIVING */}
        <div style={{
          position: 'absolute',
          opacity: step === 'receiving' ? 1 : 0,
          pointerEvents: step === 'receiving' ? 'auto' : 'none',
          transition: 'opacity 2s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer'
        }} onClick={openReceivedMessage}>
          <div className="cosmic-orb float-down pulse-glow" />
          <p style={{ marginTop: 40, fontSize: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
            {isHindi ? "आपके लिए एक संदेश आया है। खोलने के लिए टैप करें।" : "A message has arrived for you. Tap to open."}
          </p>
        </div>

        {/* STEP 5: READ */}
        <div style={{
          position: 'absolute',
          opacity: step === 'read' ? 1 : 0,
          pointerEvents: step === 'read' ? 'auto' : 'none',
          transition: 'opacity 1.5s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400,
          background: 'rgba(20, 20, 30, 0.6)', padding: 40, borderRadius: 20,
          border: '1px solid rgba(212, 175, 55, 0.3)', backdropFilter: 'blur(10px)',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.1)'
        }}>
          <span style={{ fontSize: 30, marginBottom: 20 }}>🕊️</span>
          <p style={{ fontSize: 22, color: '#fff', textAlign: 'center', lineHeight: 1.6, marginBottom: 40, fontStyle: 'italic' }}>
            "{receivedMessage}"
          </p>
          
          <button 
            onClick={resetFlow}
            style={{
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
              fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 2,
              cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1
            }}
          >
            {isHindi ? "एक और संदेश भेजें" : "Send another message"}
          </button>
        </div>

      </div>

      {/* ─── ANIMATION STYLES ─── */}
      <style>{`
        .cosmic-orb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d4af37;
          box-shadow: 0 0 30px #d4af37, 0 0 60px #fff;
          opacity: 0;
        }
        
        .float-away {
          animation: floatUp 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .float-down {
          animation: floatDown 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .pulse-glow {
          animation: pulseGlow 2s infinite alternate;
        }

        .hidden {
          display: none;
        }

        @keyframes floatUp {
          0% { transform: translateY(100px) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(0.2); opacity: 0; }
        }

        @keyframes floatDown {
          0% { transform: translateY(-200px) scale(0.2); opacity: 0; }
          100% { transform: translateY(0px) scale(1.5); opacity: 1; }
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px #d4af37, 0 0 40px #fff; transform: scale(1.4); }
          100% { box-shadow: 0 0 40px #d4af37, 0 0 80px #fff; transform: scale(1.6); }
        }
      `}</style>
    </div>
  );
}