import React, { useState } from 'react';

export function YakshaGate({ children }) {
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // For testing phase: The secret key
  const MASTER_KEY = "SUKOON2026";

  const handleUnlock = () => {
    if (passcode.toUpperCase() === MASTER_KEY) {
      setIsUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500); // Shake effect reset
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#050508',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, textAlign: 'center'
    }}>
      
      {/* ─── NARRATIVE ICON ─── */}
      <div style={{ fontSize: 40, marginBottom: 30, opacity: 0.6 }}>⚖️</div>

      {/* ─── THE QUESTION ─── */}
      <h2 style={{ 
        fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#fff', 
        fontWeight: 300, marginBottom: 40, letterSpacing: 1, maxWidth: 300, lineHeight: 1.5 
      }}>
        "Do you have the key to the next level, the <span style={{ color: '#d4af37' }}>Quieter Place</span>?"
      </h2>

      {/* ─── INPUT BOX ─── */}
      <div style={{
        transform: error ? 'translateX(10px)' : 'translateX(0)',
        transition: 'transform 0.1s ease'
      }}>
        <input 
          type="text"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="ENTER CODE"
          style={{
            background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', textAlign: 'center', fontSize: 18, letterSpacing: 5, padding: 10,
            outline: 'none', width: 200, marginBottom: 30, textTransform: 'uppercase'
          }}
        />
      </div>

      <button 
        onClick={handleUnlock}
        style={{
          background: 'transparent', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#d4af37',
          padding: '10px 30px', borderRadius: 20, fontSize: 12, letterSpacing: 2, cursor: 'pointer'
        }}
      >
        PROCEED
      </button>

      {/* ─── TESTING PHASE KEY ─── */}
      <div style={{ position: 'absolute', bottom: 40, opacity: 0.2, fontSize: 10, letterSpacing: 1 }}>
        TESTING MODE ACCESS KEY: <span style={{ userSelect: 'all' }}>{MASTER_KEY}</span>
      </div>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.1); letter-spacing: 2px; }
      `}</style>
    </div>
  );
}