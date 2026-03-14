import React, { useState } from 'react';

export function ShatteredThoughts({ setTab, T, lang }) {
  const [text, setText] = useState("");
  const [isShattered, setIsShattered] = useState(false);
  const hi = lang === "Hindi";

  const handleShatter = () => {
    if (!text || isShattered) return;
    setIsShattered(true);
  };

  return (
    <div style={{
      height: "100%", width: "100%", backgroundColor: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden"
    }}>
      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button 
          onClick={() => setTab('stillness')} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      {!isShattered ? (
        <div style={{ textAlign: 'center', width: '80%', maxWidth: 400 }}>
          <p style={{ 
            color: 'rgba(255,255,255,0.4)', 
            marginBottom: 30, 
            fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20
          }}>
            {hi ? "उस विचार को लिखें जो आपको बांधता है..." : "Type the thought that binds you..."}
          </p>
          <input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="..."
            style={{
              background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 28, textAlign: 'center', width: '100%', outline: 'none',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          />
          <button 
            onClick={handleShatter}
            style={{ 
              marginTop: 50, background: 'none', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: '#fff', padding: '12px 40px', 
              borderRadius: 30, cursor: 'pointer',
              fontSize: 14, letterSpacing: 2
            }}
          >
            {hi ? "सामना करें" : "CONFRONT"}
          </button>
        </div>
      ) : (
        <div 
          onClick={() => { setIsShattered(false); setText(""); }} 
          style={{ 
            width: '100%', height: '100%', display: 'flex', 
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {/* The "Shattered" Text */}
          <h1 style={{ 
            fontSize: "clamp(32px, 8vw, 60px)", 
            color: 'rgba(255,255,255,0.05)', 
            transform: 'scale(1.2) rotate(-3deg)', 
            filter: 'blur(4px)',
            textAlign: 'center',
            padding: '0 20px',
            transition: 'all 2s ease'
          }}>
            {text}
          </h1>

          <div style={{
            marginTop: 40,
            textAlign: 'center',
            animation: 'fadeIn 3s ease'
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: 18, 
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic' 
            }}>
              {hi ? "यह सिर्फ एक भ्रम था।" : "It was only an illusion."}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 10 }}>
              {hi ? "(जारी रखने के लिए कहीं भी टैप करें)" : "(Tap anywhere to continue)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}