import React, { useRef, useState } from 'react';
import { getReflection } from '../../utils/quoteEngine';

export function Home({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const pressTimer = useRef(null);
  
  // 1. This creates your random quote when the page loads
  const [quote] = useState(getReflection());

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setTab('vault'), 1500);
  };
  const handlePressEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const hours = new Date().getHours();
  let greeting;
  
  // 2. We only want words here, no HTML!
  if (hi) {
    greeting = hours < 12 ? "सुप्रभात" : hours < 17 ? "शुभ दोपहर" : "शुभ संध्या";
  } else {
    greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";
  }

  // --- STYLES ---
  const squareGlass = () => ({
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "32px", 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1 / 1",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    padding: "16px", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)", 
    textAlign: "center",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
  });

  const titleStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(14px, 3.5vw, 18px)", 
    fontWeight: 500,
    marginBottom: "4px",
    letterSpacing: "0.4px",
    lineHeight: 1.2,
    wordBreak: "break-word",
  };

  const subTextStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(11px, 2.5vw, 13px)", 
    opacity: 0.72,
    lineHeight: 1.3,
    letterSpacing: "0.5px",
    fontWeight: 400,
    marginTop: "2px", 
    fontStyle: "italic",
    wordBreak: "break-word",
  };

  return (
    <div style={{
      position: "relative", // Added so the Sleep button anchors to this container
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between", 
      background: T.bg,
      overflowX: "hidden",
      boxSizing: "border-box",
    }}>

      {/* ─── BRANDING, GREETING & QUOTE ─── */}
      <div style={{ padding: "6vh 0 2vh", textAlign: "center", width: "100%", boxSizing: "border-box" }}>

        <h1
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 10vw, 56px)", 
            color: T.text,
            fontWeight: 300,
            margin: "0 0 2px",
            letterSpacing: "4px",
            lineHeight: 1,
            userSelect: "none",
            cursor: "default",
          }}>
          JSukoon
        </h1>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(12px, 3vw, 15px)",
          color: T.textSoft,
          margin: "4px 0 0",
          opacity: 0.5,
          letterSpacing: "1px",
          fontStyle: "italic",
        }}>
          Discover Stillness
        </p>

        <div style={{ width: "24px", height: "1px", background: T.accent, margin: "12px auto", opacity: 0.4 }} />

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(14px, 3.5vw, 18px)",
          color: T.textSoft,
          letterSpacing: "2px",
          textTransform: "uppercase",
          margin: 0,
          opacity: 0.85,
          fontWeight: 300,
        }}>
          {greeting}
        </p>

        {/* 3. THE QUOTE BOX IS NOW IN THE RIGHT PLACE! */}
        <div style={{ marginTop: '20px', padding: '0 40px' }}>
          <p style={{ 
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic', 
            fontSize: '18px', 
            opacity: 0.7, 
            color: T.accent,
            lineHeight: 1.4
          }}>
            "{quote}"
          </p>
        </div>
      </div>

      {/* ─── 2×2 GRID ─── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "0 20px",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "12px", 
          width: "100%",
          maxWidth: "380px", 
          boxSizing: "border-box",
        }}>

          <button onClick={() => { sessionStorage.setItem("jsukoon_context","racing"); setTab("practice"); }} style={squareGlass()}>
            <span style={{ fontSize: "clamp(22px, 6vw, 28px)", marginBottom: "6px", opacity: 0.9 }}>🌀</span>
            <span style={{ ...titleStyle, color: "#a090d0" }}>
              {hi ? "दौड़ते विचार" : "Racing Thoughts"}
            </span>
            <span style={{ ...subTextStyle, color: "#a090d0" }}>
              {hi ? "सांस लें और वापस आएं" : "Breathe & Return"}
            </span>
          </button>

          <button onClick={() => setTab("bench")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(22px, 6vw, 28px)", marginBottom: "6px", opacity: 0.9 }}>🌿</span>
            <span style={{ ...titleStyle, color: T.text }}>
              {hi ? "अभयारण्य" : "Sanctuary"}
            </span>
            <span style={{ ...subTextStyle, color: T.textSoft }}>
              {hi ? "शांति और सुकून" : "Quiet & Calm"}
            </span>
          </button>

          <button onClick={() => setTab("warmth")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(22px, 6vw, 28px)", marginBottom: "6px", opacity: 0.9 }}>❤️</span>
            <span style={{ ...titleStyle, color: "#C88A8E" }}>
              {hi ? "गर्माहट भेजें" : "Send Warmth"}
            </span>
            <span style={{ ...subTextStyle, color: "#C88A8E" }}>
              {hi ? "दयालुता साझा करें" : "Share Kindness"}
            </span>
          </button>

          <button onClick={() => setTab("more")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(22px, 6vw, 28px)", marginBottom: "6px", opacity: 0.9 }}>✨</span>
            <span style={{ ...titleStyle, color: T.accent }}>
              {hi ? "और खोजें" : "Explore More"}
            </span>
            <span style={{ ...subTextStyle, color: T.textSoft }}>
              {hi ? "उपकरण और अभ्यास" : "Tools & Practice"}
            </span>
          </button>

        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ padding: "4vh 20px", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
        <p style={{ 
          margin: 0, 
          fontSize: "12px", 
          color: T.muted, 
          opacity: 0.6, 
          lineHeight: 1.4, 
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: "0.5px"
        }}>
          <button 
            onClick={() => setTab("legal")} 
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              padding: 0, 
              margin: 0, 
              color: T.textSoft, 
              textDecoration: "underline", 
              fontSize: "inherit", 
              fontFamily: "inherit" 
            }}
          >
            {hi ? "कानूनी अस्वीकरण" : "Legal Disclaimer"}
          </button>
          {" - "}
          {hi ? "यह कोई चिकित्सा या मनोवैज्ञानिक सहायता ऐप नहीं है।" : "This is not a medical or psychological help app."}
        </p>
      </div>

      {/* ─── QUIET SLEEP ROOM GATEWAY ─── */}
      <button 
        onClick={() => setTab("sleep")}
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          background: "transparent",
          border: "none",
          color: T.text,
          opacity: 0.5,
          fontSize: 8,
          fontFamily: "'Cormorant Garamond', serif",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          zIndex: 10
        }}
      >
        <span>🌙</span> {hi ? "नींद" : "Sleep"}
      </button>

    </div>
  );
}