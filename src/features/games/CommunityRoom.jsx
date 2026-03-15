import React, { useState, useEffect } from 'react';

export function CommunityRoom({ setTab, T, lang, goBack }) {
  const [flames, setFlames] = useState([]);
  const hi = lang === "Hindi";

  // 1. Simulate the "Community" (pre-existing flames)
  useEffect(() => {
    // Generate 15-25 random embers already in the room
    const emberCount = Math.floor(Math.random() * 10) + 15;
    const initialFlames = Array.from({ length: emberCount }).map((_, i) => ({
      id: `ember-${i}`,
      x: 5 + Math.random() * 90, // Random X position (5% to 95%)
      y: 15 + Math.random() * 75, // Random Y position (15% to 90%)
      size: 0.4 + Math.random() * 0.6, // Slightly varying sizes
      delay: Math.random() * 4, // Stagger their breathing animation
      isUser: false
    }));
    setFlames(initialFlames);
  }, []);

  // 2. Allow the user to leave their mark
  const handleTap = (e) => {
    // Calculate percentage position of the tap
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Add the user's new flame to the room
    setFlames(prev => [...prev, {
      id: `user-${Date.now()}`,
      x, y,
      size: 1.2, // The user's flame is slightly larger
      delay: 0,
      isUser: true // We style user flames slightly warmer
    }]);
  };

  return (
    <div 
      onClick={handleTap} 
      style={{ 
        position: 'fixed', inset: 0, zIndex: 50, 
        background: '#020408', // Deep dark night sky
        overflow: 'hidden', cursor: 'pointer' 
      }}
    >
      {/* ─── STYLES FOR FLAME ANIMATION ─── */}
      <style>{`
        @keyframes gentle-breathe {
          0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); }
          100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes user-ignite {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          100% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      {/* ─── UI CONTROLS ─── */}
      <button 
        onClick={(e) => { e.stopPropagation(); if(goBack) goBack(); else setTab('home'); }}
        style={{ 
          position: 'absolute', top: 20, left: 20, zIndex: 60, 
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: 99, color: 'rgba(255,255,255,0.6)', padding: '8px 16px', 
          fontSize: 13, cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif"
        }}
      >
        ← {hi ? 'वापस' : 'Back'}
      </button>

      <div style={{ 
        position: 'absolute', top: '15%', left: 0, right: 0, 
        textAlign: 'center', pointerEvents: 'none', zIndex: 60 
      }}>
        <h2 style={{ 
          fontFamily: "'Cormorant Garamond', serif", fontSize: 28, 
          color: 'rgba(255,252,238,0.8)', fontWeight: 300, 
          letterSpacing: 2, margin: '0 0 10px 0' 
        }}>
          {hi ? "समुदाय कक्ष" : "The Community Room"}
        </h2>
        <p style={{ 
          fontFamily: "'Cormorant Garamond', serif", fontSize: 16, 
          color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' 
        }}>
          {hi ? "एक लौ जलाने के लिए टैप करें। आप अकेले नहीं हैं।" : "Tap to leave a flame. You are not sitting alone."}
        </p>
      </div>

      {/* ─── RENDER ALL FLAMES ─── */}
      {flames.map(f => (
        <div key={f.id} style={{
          position: 'absolute', 
          left: `${f.x}%`, top: `${f.y}%`,
          width: 15 * f.size, height: 15 * f.size,
          // Community flames are softer and dimmer. User flame is bright and warm.
          background: f.isUser ? '#ffcd85' : '#8c5a35',
          borderRadius: '50%',
          boxShadow: `0 0 ${40 * f.size}px ${10 * f.size}px ${f.isUser ? 'rgba(255, 176, 92, 0.5)' : 'rgba(163, 109, 64, 0.2)'}`,
          animation: f.isUser 
            ? `user-ignite 2s ease-out forwards, gentle-breathe 3.5s infinite alternate ease-in-out 2s`
            : `gentle-breathe 4s infinite alternate ease-in-out ${f.delay}s`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }} />
      ))}
    </div>
  );
}