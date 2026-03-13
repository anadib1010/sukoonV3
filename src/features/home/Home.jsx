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
    borderRadius: "40px",
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
    boxSizing: "border-box",
    width: "100%",
  });

  const titleStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(17px, 4.2vw, 22px)",
    fontWeight: 500,
    marginBottom: "4px",
    letterSpacing: "0.4px",
    lineHeight: 1.2,
  };

  const subTextStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(13px, 3.2vw, 15px)",
    opacity: 0.72,
    lineHeight: 1.4,
    letterSpacing: "0.5px",
    fontWeight: 400,
    marginTop: "5px",
    fontStyle: "italic",
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",       // ← centres every child horizontally
      background: T.bg,
      overflowX: "hidden",
      boxSizing: "border-box",
    }}>

      {/* ─── BRANDING & GREETING ─── */}
      <div style={{ padding: "70px 0 36px", textAlign: "center", width: "100%" }}>

        {/* JSukoon — beautiful italic serif */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(44px, 12vw, 64px)",
          color: T.text,
          fontWeight: 300,
          fontStyle: "italic",
          margin: "0 0 4px",
          letterSpacing: "4px",
          lineHeight: 1,
        }}>
          JSukoon
        </h1>

        {/* Urdu — the meaning, small and soft */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(13px, 3.5vw, 16px)",
          color: T.textSoft,
          margin: "6px 0 0",
          opacity: 0.5,
          letterSpacing: "1px",
          fontStyle: "italic",
        }}>
          سکون
        </p>

        <div style={{ width: "28px", height: "1px", background: T.accent, margin: "14px auto", opacity: 0.4 }} />

        {/* Greeting */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(16px, 4vw, 20px)",
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
      {/* The trick: fixed width in px on mobile, percentage on desktop.
          align-items:center on the parent centres this block. No margin:auto needed. */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingBottom: "60px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          width: "min(420px, calc(100vw - 48px))",  // responsive, never touches edges
        }}>

          {/* 1. RACING THOUGHTS */}
          <button onClick={() => { sessionStorage.setItem("jsukoon_context","racing"); setTab("practice"); }} style={squareGlass()}>
            <span style={{ fontSize: "clamp(26px,7vw,34px)", marginBottom: "10px", opacity: 0.9 }}>🌀</span>
            <span style={{ ...titleStyle, color: "#a090d0" }}>
              {hi ? "दौड़ते विचार" : "Racing Thoughts"}
            </span>
            <span style={{ ...subTextStyle, color: "#a090d0" }}>
              {hi ? "सांस लें और वापस आएं" : "Breathe & Return"}
            </span>
          </button>

          {/* 2. SANCTUARY */}
          <button onClick={() => setTab("bench")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(26px,7vw,34px)", marginBottom: "10px", opacity: 0.9 }}>🌿</span>
            <span style={{ ...titleStyle, color: T.text }}>
              {hi ? "अभयारण्य" : "Sanctuary"}
            </span>
            <span style={{ ...subTextStyle, color: T.textSoft }}>
              {hi ? "शांति और सुकून" : "Quiet & Calm"}
            </span>
          </button>

          {/* 3. SEND WARMTH */}
          <button onClick={() => setTab("warmth")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(26px,7vw,34px)", marginBottom: "10px", opacity: 0.9 }}>❤️</span>
            <span style={{ ...titleStyle, color: "#C88A8E" }}>
              {hi ? "गर्माहट भेजें" : "Send Warmth"}
            </span>
            <span style={{ ...subTextStyle, color: "#C88A8E" }}>
              {hi ? "दयालुता साझा करें" : "Share Kindness"}
            </span>
          </button>

          {/* 4. EXPLORE MORE */}
          <button onClick={() => setTab("more")} style={squareGlass()}>
            <span style={{ fontSize: "clamp(26px,7vw,34px)", marginBottom: "10px", opacity: 0.9 }}>✨</span>
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
          <span style={{ color: T.muted, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase" }}>
            {hi ? "अस्वीकरण" : "Disclaimer"}
          </span>
        </button>
      </div>

    </div>
  );
}
