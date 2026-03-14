import React, { useState, useEffect } from 'react';

export function SeedInMud({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  
  const [growth, setGrowth] = useState(0); // 0 to 100
  const [lastTapTime, setLastTapTime] = useState(0);
  const [isRushing, setIsRushing] = useState(false);

  // The Magic: Enforcing a 3-second wait between taps
  const PATIENCE_THRESHOLD_MS = 3000; 

  const handleTap = () => {
    if (growth >= 100) return; // It has already bloomed!

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    // If it's the very first tap, allow it. Otherwise, check their patience.
    if (lastTapTime !== 0 && timeSinceLastTap < PATIENCE_THRESHOLD_MS) {
      // They are rushing. Show a gentle warning and shrink the seed slightly.
      setIsRushing(true);
      setGrowth((prev) => Math.max(0, prev - 5)); 
      
      setTimeout(() => setIsRushing(false), 1000);
    } else {
      // They waited patiently. Let the seed grow!
      setIsRushing(false);
      setGrowth((prev) => Math.min(100, prev + 15)); 
    }
    
    setLastTapTime(now);
  };

  // ─── VISUAL STAGES OF THE LOTUS ───
  let stageIcon = "🌱"; // Just a tiny shoot
  let stageSize = 30 + (growth * 0.8); // Grows from 30px to 110px
  let stageGlow = `0 0 ${growth / 2}px rgba(100, 200, 150, 0.4)`;

  if (growth >= 100) {
    stageIcon = "🪷"; // Full Lotus Bloom
    stageGlow = "0 0 40px rgba(255, 150, 200, 0.8)"; // Warm pink glow
  } else if (growth > 60) {
    stageIcon = "🌿"; // Growing leaves
  } else if (growth === 0) {
    stageIcon = "🌰"; // Just a seed in the mud
  }

  // Calculate deep earthy background color
  const bgDarkness = Math.max(10 - (growth * 0.05), 2); // Slowly gets lighter as it grows
  const backgroundColor = `hsl(30, 20%, ${bgDarkness}%)`; // Dark muddy brown

  return (
    <div 
      onClick={handleTap}
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: backgroundColor,
        transition: "background-color 2s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        userSelect: "none",
        cursor: "pointer",
        overflow: "hidden"
      }}
    >
      {/* ─── TOP NAVIGATION ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); setTab('vault'); }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── INSTRUCTIONAL TEXT ─── */}
      <div style={{
        position: 'absolute',
        top: '20%',
        textAlign: 'center',
        opacity: growth >= 100 ? 0 : 1, // Fades out when fully bloomed
        transition: 'opacity 2s ease',
        pointerEvents: 'none',
        padding: '0 20px'
      }}>
        <h2 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '28px', 
          fontWeight: 300, 
          color: isRushing ? '#ff8888' : 'rgba(255,255,255,0.8)', // Turns red if rushing
          transition: 'color 0.5s ease',
          margin: '0 0 10px 0'
        }}>
          {isHindi ? "कीचड़ में बीज" : "Seed in the Mud"}
        </h2>
        <p style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '16px', 
          color: 'rgba(255,255,255,0.5)', 
          fontStyle: 'italic'
        }}>
          {isRushing 
            ? (isHindi ? "जल्दबाजी न करें। इसे समय दें।" : "Do not rush. Give it time.") 
            : (isHindi ? "दिल की धड़कन की तरह, धीरे-धीरे टैप करें।" : "Tap slowly, like a resting heartbeat.")}
        </p>
      </div>

      {/* ─── THE GROWING PLANT ─── */}
      <div style={{
        fontSize: `${stageSize}px`,
        textShadow: stageGlow,
        transition: "all 1s cubic-bezier(0.25, 0.8, 0.25, 1)", // Smooth, natural springing motion
        transform: isRushing ? "scale(0.9) translateY(10px)" : "scale(1) translateY(0px)",
        pointerEvents: 'none'
      }}>
        {stageIcon}
      </div>

      {/* ─── FINAL BLOOM MESSAGE ─── */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        opacity: growth >= 100 ? 1 : 0,
        transition: 'opacity 3s ease',
        pointerEvents: 'none',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '20px', 
          color: 'rgba(255, 200, 220, 0.9)', 
          fontStyle: 'italic'
        }}>
          {isHindi ? "धैर्य से ही सुंदर चीजें बढ़ती हैं।" : "Beautiful things require patience."}
        </p>
      </div>
    </div>
  );
}