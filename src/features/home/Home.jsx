import React from 'react';

export function Home({ setTab, T, lang }) {
  const hi = lang === "Hindi";

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
    borderRadius: "32px", 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1 / 1",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    padding: "16px", 
    boxShadow: "0 15px 45px rgba(0,0,0,0.2)",
    textAlign: "center",
    boxSizing: "border-box",
    width: "100%",
  });

  const titleStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(16px, 4vw, 20px)",
    fontWeight: 500,
    marginBottom: "4px",
    letterSpacing: "0.5px",
    lineHeight: 1.2,
  };

  const subTextStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(12px, 3vw, 14px)",
    opacity: 0.7,
    lineHeight: 1.3,
    letterSpacing: "0.5px",
    fontWeight: 400,
    marginTop: "2px",
    fontStyle: "italic",
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: T.bg,
      overflow: "hidden", 
      boxSizing: "border-box",
      padding: "0 24px", 
    }}>

      {/* ─── BRANDING & GREETING ─── */}
      <div style={{ 
        paddingTop: "max(10vh, 40px)", 
        textAlign: "center", 
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>

        {/* JSukoon — sleek, non-italic, elegant */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(40px, 10vw, 56px)", 
          color: T.text,
          fontWeight: 400, 
          fontStyle: "normal", 
          margin: "0 0 4px",
          letterSpacing: "2px",
          lineHeight: 1,
        }}>
          JSukoon
        </h1>

        <div style={{ width: "30px", height: "1px", background: T.accent, margin: "20px 0", opacity: 0.5 }} />

        {/* Greeting */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(15px, 4vw, 18px)",
          color: T.textSoft,
          letterSpacing: "2px",
          textTransform: "uppercase",
          margin: 0,
          opacity: 0.8,
          fontWeight: 300,
        }}>
          {greeting}
        </p>
      </div>

      {/* ─── 2×2 GRID ─── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "400px", 
        margin: "0 auto", 
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          width: "100%",
        }}>

          {/* 1. RACING THOUGHTS */}
          <button onClick={() => { sessionStorage.setItem("jsukoon_context","racing"); setTab("practice"); }} style={squareGlass()}>
            <span style={{ fontSize: "clamp(24px, 6vw, 32px)", marginBottom: "8px", opacity: 0.9 }}>🌀</span>
            <span style={{ ...titleStyle, color: "#a090d0" }}>
              {hi ? "दौड़ते विचार" : "Racing Thoughts"}
            </span>
            <span style={{ ...subTextStyle, color: "#a090d0" }}>
              {hi ? "सांस लें और वापस आएं" : "Breathe & Return"}
            </span>
          </button>

          {/* 2. SANCTUARY */}
          <button onClick={() => setTab("bench")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(24px, 6vw, 32px)", marginBottom: "8px", opacity: 0.9 }}>🌿</span>
            <span style={{ ...titleStyle, color: T.text }}>
              {hi ? "अभयारण्य" : "Sanctuary"}
            </span>
            <span style={{ ...subTextStyle, color: T.textSoft }}>
              {hi ? "शांति और सुकून" : "Quiet & Calm"}
            </span>
          </button>

          {/* 3. SEND WARMTH */}
          <button onClick={() => setTab("warmth")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(24px, 6vw, 32px)", marginBottom: "8px", opacity: 0.9 }}>❤️</span>
            <span style={{ ...titleStyle, color: "#C88A8E" }}>
              {hi ? "गर्माहट भेजें" : "Send Warmth"}
            </span>
            <span style={{ ...subTextStyle, color: "#C88A8E" }}>
              {hi ? "दयालुता साझा करें" : "Share Kindness"}
            </span>
          </button>

          {/* 4. EXPLORE MORE */}
          <button onClick={() => setTab("more")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(24px, 6vw, 32px)", marginBottom: "8px", opacity: 0.9 }}>✨</span>
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
      <div style={{ paddingBottom: "max(3vh, 20px)", textAlign: "center", width: "100%" }}>
        <button onClick={() => setTab("legal")} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.3 }}>
          <span style={{ color: T.muted, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase" }}>
            {hi ? "अस्वीकरण" : "Disclaimer"}
          </span>
        </button>
      </div>

    </div>
  );
}