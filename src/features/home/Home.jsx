import React from 'react';

export function Home({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  // ─── DYNAMIC GREETING LOGIC ───
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
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: "40px", // Even rounder for a softer feel
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1 / 1",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    padding: "20px",
    boxShadow: "0 15px 45px rgba(0,0,0,0.2)",
    textAlign: "center",
    boxSizing: "border-box"
  });

  // THE SECRET TO BEAUTIFUL UI TYPOGRAPHY
  const titleStyle = {
    fontFamily: "'Cormorant Garamond', serif", // Using the elegant serif here too
    fontSize: "20px", 
    fontWeight: 500,
    marginBottom: "4px",
    letterSpacing: "0.5px",
    lineHeight: 1
  };

  const subTextStyle = {
    fontSize: "11px",
    opacity: 0.6,
    lineHeight: "1.5",
    letterSpacing: "0.8px", // Spaced out letters look more "designed"
    textTransform: "uppercase", // Uppercase sub-headers look very premium
    fontWeight: 400,
    marginTop: "4px"
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, padding: "0", overflowX: "hidden" }}>
      
      {/* ─── BRANDING & GREETING ─── */}
      <div style={{ padding: "70px 0 40px", textAlign: "center" }}>
        <h1 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: 48, 
          color: T.text, 
          fontWeight: 300, 
          margin: "0 0 4px",
          letterSpacing: "3px"
        }}>
          JSukoon
        </h1>
        <div style={{ width: "30px", height: "1px", background: T.accent, margin: "12px auto", opacity: 0.4 }} />
        <p style={{ 
          fontSize: "14px", 
          color: T.textSoft, 
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: "2px",
          textTransform: "uppercase",
          margin: 0,
          opacity: 0.8
        }}>
          {greeting}
        </p>
      </div>

      {/* ─── 2x2 LUXURY GRID ─── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "60px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", width: "100%", maxWidth: "420px", margin: "0 auto" }}>
          
          {/* 1. RACING THOUGHTS */}
          <button onClick={() => { sessionStorage.setItem("jsukoon_context","racing"); setTab("practice"); }} style={squareGlass()}>
            <span style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.9 }}>🌀</span>
            <span style={{ ...titleStyle, color: "#a090d0" }}>
              {hi ? "दौड़ते विचार" : "Racing Thoughts"}
            </span>
            <span style={{ ...subTextStyle, color: "#a090d0" }}>
              {hi ? "सांस लें और वापस आएं" : "Breathe & Return"}
            </span>
          </button>

          {/* 2. SANCTUARY */}
          <button onClick={() => setTab("bench")} style={squareGlass()}>
            <span style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.9 }}>🌿</span>
            <span style={{ ...titleStyle, color: T.text }}>
              {hi ? "अभयारण्य" : "Sanctuary"}
            </span>
            <span style={{ ...subTextStyle, color: T.textSoft }}>
              {hi ? "शांति और सुकून" : "Quiet & Calm"}
            </span>
          </button>

          {/* 3. SEND WARMTH */}
          <button onClick={() => setTab("warmth")} style={squareGlass()}>
            <span style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.9 }}>❤️</span>
            <span style={{ ...titleStyle, color: "#C88A8E" }}>
              {hi ? "गर्माहट भेजें" : "Send Warmth"}
            </span>
            <span style={{ ...subTextStyle, color: "#C88A8E" }}>
              {hi ? "दयालुता साझा करें" : "Share Kindness"}
            </span>
          </button>

          {/* 4. EXPLORE MORE */}
          <button onClick={() => setTab("more")} style={squareGlass()}>
            <span style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.9 }}>✨</span>
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
      <div style={{ paddingBottom: "30px", textAlign: "center" }}>
        <button onClick={() => setTab("legal")} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.3 }}>
          <span style={{ color: T.muted, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase" }}>{hi ? "अस्वीकरण" : "Disclaimer"}</span>
        </button>
      </div>
    </div>
  );
}