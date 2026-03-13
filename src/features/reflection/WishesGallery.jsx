import React, { useState, useEffect } from 'react';

export function WishesGallery({ setTab, T, lang }) {
  const [wishes, setWishes] = useState([]);
  const hi = lang === "Hindi";

  // Fetch the wishes from the device's local storage when the page loads
  useEffect(() => {
    const savedWishes = JSON.parse(localStorage.getItem("jsukoon_wishes") || "[]");
    setWishes(savedWishes);
  }, []);

  // --- STYLES (Matching your exact 600px centered rule) ---
  const outerWrapper = {
    minHeight: "100vh",
    width: "100%",
    background: T.background,
    color: T.text,
    display: "flex",
    justifyContent: "center", // Keeps it centered on big laptop screens
    overflowY: "auto"
  };

  const innerContainer = {
    width: "100%",
    maxWidth: "600px", // Strict 600px width
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box"
  };

  return (
    <div style={outerWrapper}>
      <div style={innerContainer}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", marginTop: "10px" }}>
          <button 
            onClick={() => setTab("reflection")} // Goes back to Reflection page
            style={{ background: "none", border: "none", color: T.accent, fontSize: "15px", cursor: "pointer", padding: "5px 0" }}
          >
            ← {hi ? "वापस" : "Back"}
          </button>
          
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", margin: 0 }}>
            {hi ? "इच्छा गैलरी" : "Wishes Gallery"}
          </h2>
          
          <button 
            onClick={() => setTab("home")} 
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
          >
            🏠
          </button>
        </div>

        {/* PRIVACY DISCLAIMER */}
        <p style={{ fontSize: "13px", color: T.textSoft, textAlign: "center", marginBottom: "40px", lineHeight: "1.6", opacity: 0.8 }}>
          {hi 
            ? "ये आपकी निजी इच्छाएं हैं, जो केवल आपके डिवाइस पर सुरक्षित हैं। कोई ट्रैकिंग नहीं।" 
            : "These are your private wishes, stored securely only on your device. No tracking."}
        </p>

        {/* LIST OF WISHES */}
        {wishes.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "60px", opacity: 0.4 }}>
            <p style={{ fontSize: "40px", marginBottom: "10px" }}>✨</p>
            <p style={{ fontSize: "15px" }}>{hi ? "अभी तक कोई इच्छा नहीं है।" : "No wishes sent to the stars yet."}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>
            {wishes.map(wish => (
              <div key={wish.id} style={{
                background: "rgba(138, 170, 255, 0.05)",
                border: `1px solid rgba(138, 170, 255, 0.1)`,
                padding: "24px",
                borderRadius: "20px"
              }}>
                <p style={{ fontSize: "11px", color: "#8aaaff", marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {new Date(wish.date).toLocaleDateString(hi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ fontSize: "16px", lineHeight: "1.7", color: T.text, fontWeight: "300", margin: 0 }}>
                  {wish.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}