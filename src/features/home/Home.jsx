import React, { useRef } from 'react';

export function Home({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const pressTimer = useRef(null);

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setTab('vault'), 1500);
  };
  const handlePressEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const hours = new Date().getHours();
  let greeting;
  if (hi) {
    greeting = hours < 12 ? "सुप्रभात" : hours < 17 ? "शुभ दोपहर" : "शुभ संध्या";
  } else {
    greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";
  }

  const squareGlass = () => ({
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "32px", // Slightly tighter border radius for smaller size
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1 / 1",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    padding: "16px", // Reduced padding
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)", // Softer shadow
    textAlign: "center",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
  });

  const titleStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(14px, 3.5vw, 18px)", // Scaled down slightly
    fontWeight: 500,
    marginBottom: "4px",
    letterSpacing: "0.4px",
    lineHeight: 1.2,
    wordBreak: "break-word",
  };

  const subTextStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(11px, 2.5vw, 13px)", // Scaled down slightly
    opacity: 0.72,
    lineHeight: 1.3,
    letterSpacing: "0.5px",
    fontWeight: 400,
    marginTop: "2px", // Tighter margin
    fontStyle: "italic",
    wordBreak: "break-word",
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between", // Pushes header up and footer down naturally
      background: T.bg,
      overflowX: "hidden",
      boxSizing: "border-box",
    }}>

      {/* ─── BRANDING & GREETING ─── */}
      <div style={{ padding: "6vh 0 2vh", textAlign: "center", width: "100%", boxSizing: "border-box" }}>

        {/* JSukoon — long press opens Vault */}
        <h1
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 10vw, 56px)", // Slightly smaller max size
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
          gap: "12px", // Tighter gap
          width: "100%",
          maxWidth: "380px", // Reduced from 420px to force the 1/1 aspect ratio to be shorter
          boxSizing: "border-box",
        }}>

          {/* 1. RACING THOUGHTS */}
          <button onClick={() => { sessionStorage.setItem("jsukoon_context","racing"); setTab("practice"); }} style={squareGlass()}>
            <span style={{ fontSize: "clamp(22px, 6vw, 28px)", marginBottom: "6px", opacity: 0.9 }}>🌀</span>
            <span style={{ ...titleStyle, color: "#a090d0" }}>
              {hi ? "दौड़ते विचार" : "Racing Thoughts"}
            </span>
            <span style={{ ...subTextStyle, color: "#a090d0" }}>
              {hi ? "सांस लें और वापस आएं" : "Breathe & Return"}
            </span>
          </button>

          {/* 2. SANCTUARY */}
          <button onClick={() => setTab("bench")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(22px, 6vw, 28px)", marginBottom: "6px", opacity: 0.9 }}>🌿</span>
            <span style={{ ...titleStyle, color: T.text }}>
              {hi ? "अभयारण्य" : "Sanctuary"}
            </span>
            <span style={{ ...subTextStyle, color: T.textSoft }}>
              {hi ? "शांति और सुकून" : "Quiet & Calm"}
            </span>
          </button>

          {/* 3. SEND WARMTH */}
          <button onClick={() => setTab("warmth")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(22px, 6vw, 28px)", marginBottom: "6px", opacity: 0.9 }}>❤️</span>
            <span style={{ ...titleStyle, color: "#C88A8E" }}>
              {hi ? "गर्माहट भेजें" : "Send Warmth"}
            </span>
            <span style={{ ...subTextStyle, color: "#C88A8E" }}>
              {hi ? "दयालुता साझा करें" : "Share Kindness"}
            </span>
          </button>

          {/* 4. EXPLORE MORE */}
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
      <div style={{ padding: "4vh 0", textAlign: "center", width: "100%" }}>
        <button onClick={() => setTab("legal")} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.3 }}>
          <span style={{ color: T.muted, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase" }}>
            {hi ? "अस्वीकरण" : "Disclaimer"}
          </span>
        </button>
      </div>

    </div>
  );
}