import React, { useState, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';

// The 20 Curated Safe Emotions
const EMOTIONS = [
  // Light & Grounding
  { id: 'peace', en: "Peace", hi: "शांति" },
  { id: 'gratitude', en: "Gratitude", hi: "आभार" },
  { id: 'hope', en: "Hope", hi: "आशा" },
  { id: 'joy', en: "Joy", hi: "खुशी" },
  { id: 'love', en: "Love", hi: "प्रेम" },
  { id: 'relief', en: "Relief", hi: "सुकून" },
  { id: 'acceptance', en: "Acceptance", hi: "स्वीकृति" },
  { id: 'courage', en: "Courage", hi: "साहस" },
  { id: 'calm', en: "Calm", hi: "शांत" },
  { id: 'curiosity', en: "Curiosity", hi: "जिज्ञासा" },
  // Heavy & Transitional
  { id: 'tired', en: "Tired", hi: "थका हुआ" },
  { id: 'restless', en: "Restless", hi: "बेचैन" },
  { id: 'sadness', en: "Sadness", hi: "उदासी" },
  { id: 'lonely', en: "Lonely", hi: "अकेला" },
  { id: 'overwhelmed', en: "Overwhelmed", hi: "व्याकुल" },
  { id: 'fear', en: "Fear", hi: "डर" },
  { id: 'anger', en: "Anger", hi: "क्रोध" },
  { id: 'grief', en: "Grief", hi: "शोक" },
  { id: 'numb', en: "Numb", hi: "सुन्न" },
  { id: 'lost', en: "Lost", hi: "गुमसुम" },
];

export function CommunityRoom({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [selectedEmotion, setSelectedEmotion] = useState(EMOTIONS[0]);
  const [stars, setStars] = useState([]); 
  const skyRef = useRef(null);

  // Determine theme properties for glassmorphism
  const bgM = T.bg.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const isDark = bgM ? (parseInt(bgM[1], 16) * 0.299 + parseInt(bgM[2], 16) * 0.587 + parseInt(bgM[3], 16) * 0.114) < 128 : true;
  const glass = {
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.60)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.5)",
  };

  // Place a star where the user clicks
  const handleSkyClick = (e) => {
    if (!skyRef.current) return;
    
    // Get the exact dimensions of the sky area
    const rect = skyRef.current.getBoundingClientRect();
    
    // Calculate percentage coordinates so it scales on different devices
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newStar = {
      id: Date.now(),
      x,
      y,
      text: hi ? selectedEmotion.hi : selectedEmotion.en
    };
    
    setStars([...stars, newStar]);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      {/* ── THE SKY CANVAS ── */}
      <div 
        ref={skyRef}
        onClick={handleSkyClick}
        style={{ 
          flex: 1, 
          position: "relative", 
          cursor: "crosshair",
          overflow: "hidden" 
        }}
      >
        {/* Render all the stars */}
        {stars.map(star => (
          <div 
            key={star.id} 
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: "translate(-50%, -50%)", // Center the dot exactly on the click
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              pointerEvents: "none", // Ensures you can click near a star to place another
              animation: "fadeIn 1s ease-out"
            }}
          >
            {/* The glowing dot */}
            <div style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: isDark ? "#fff" : T.accent,
              boxShadow: isDark ? "0 0 10px 2px rgba(255,255,255,0.6)" : `0 0 10px 2px ${T.accent}66`
            }} />
            
            {/* The emotion word */}
            <span style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.8)" : T.text,
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: 0.5,
              whiteSpace: "nowrap"
            }}>
              {star.text}
            </span>
          </div>
        ))}

        {/* Empty state hint - fades out when there are stars */}
        {stars.length === 0 && (
          <div style={{
            position: "absolute",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center", pointerEvents: "none", opacity: 0.5
          }}>
            <p style={{ margin: 0, fontSize: 16, color: T.text, fontFamily: "'Cormorant Garamond', serif" }}>
              {hi ? "अपनी भावना को आकाश में छोड़ने के लिए टैप करें" : "Tap to leave your emotion in the sky"}
            </p>
          </div>
        )}
      </div>

      {/* ── EMOTION PICKER (BOTTOM BAR) ── */}
      <div style={{ ...glass, padding: "20px 0 30px", zIndex: 10 }}>
        <p style={{ margin: "0 0 12px 24px", fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>
          {hi ? "आप क्या महसूस कर रहे हैं?" : "What are you feeling?"}
        </p>
        
        {/* Horizontal scroll list */}
        <div style={{ 
          display: "flex", gap: 8, overflowX: "auto", 
          padding: "0 24px", paddingBottom: 8, scrollbarWidth: "none" 
        }}>
          {EMOTIONS.map(emotion => {
            const isSelected = selectedEmotion.id === emotion.id;
            return (
              <button
                key={emotion.id}
                onClick={() => setSelectedEmotion(emotion)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 24,
                  whiteSpace: "nowrap",
                  fontSize: 14,
                  cursor: "pointer",
                  background: isSelected ? T.accent : "transparent",
                  border: isSelected ? `1px solid ${T.accent}` : (isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)"),
                  color: isSelected ? "#fff" : T.text,
                  transition: "all 0.2s ease"
                }}
              >
                {hi ? emotion.hi : emotion.en}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Simple fade-in animation for the stars */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -40%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
          }
        `}
      </style>
    </div>
  );
}