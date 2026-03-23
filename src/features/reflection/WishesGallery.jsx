import React, { useState, useEffect } from 'react';

export function WishesGallery({ setTab, T, lang }) {
  const [wishes, setWishes] = useState([]);
  const hi = lang === "Hindi";

  useEffect(() => {
    const savedWishes = JSON.parse(localStorage.getItem("jsukoon_wishes") || "[]");
    setWishes(savedWishes);
  }, []);

  const s = {
    outer: {
      minHeight: "100vh", width: "100%",
      background: T.bg, color: T.text,
      display: "flex", justifyContent: "center", overflowY: "auto",
    },
    inner: {
      width: "100%", maxWidth: "600px",
      padding: "24px", display: "flex",
      flexDirection: "column", boxSizing: "border-box",
    },
    header: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: "32px", marginTop: "10px",
    },
    backBtn: {
      background: "none", border: "none", color: T.accent,
      fontSize: "15px", cursor: "pointer", padding: "5px 0",
    },
    pageTitle: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", margin: 0,
    },
    homeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer" },
    disclaimer: {
      fontSize: "13px", color: T.textSoft, textAlign: "center",
      marginBottom: "40px", lineHeight: "1.6", opacity: 0.8,
    },
    emptyWrap: { textAlign: "center", marginTop: "60px", opacity: 0.4 },
    emptyIcon: { fontSize: "40px", marginBottom: "10px" },
    emptyText: { fontSize: "15px" },
    list: { display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" },
    wishDate: {
      fontSize: "11px", color: T.accent,
      marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase",
    },
    wishText: { fontSize: "16px", lineHeight: "1.7", color: T.text, fontWeight: "300", margin: 0 },
  };

  return (
    <div style={s.outer}>
      <div style={s.inner}>
        <div style={s.header}>
          <button onClick={() => setTab("reflection")} style={s.backBtn}>
            ← {hi ? "वापस" : "Back"}
          </button>
          <h2 style={s.pageTitle}>{hi ? "इच्छा गैलरी" : "Wishes Gallery"}</h2>
          <button onClick={() => setTab("home")} style={s.homeBtn}>🏠</button>
        </div>

        <p style={s.disclaimer}>
          {hi
            ? "ये आपकी निजी इच्छाएं हैं, जो केवल आपके डिवाइस पर सुरक्षित हैं। कोई ट्रैकिंग नहीं।"
            : "These are your private wishes, stored securely only on your device. No tracking."}
        </p>

        {wishes.length === 0 ? (
          <div style={s.emptyWrap}>
            <p style={s.emptyIcon}>✨</p>
            <p style={s.emptyText}>{hi ? "अभी तक कोई इच्छा नहीं है।" : "No wishes sent to the stars yet."}</p>
          </div>
        ) : (
          <div style={s.list}>
            {wishes.map(wish => (
              <div key={wish.id} style={{
                background: `${T.accent}08`,
                border: `1px solid ${T.accent}15`,
                padding: "24px", borderRadius: "20px",
              }}>
                <p style={s.wishDate}>
                  {new Date(wish.date).toLocaleDateString(hi ? "hi-IN" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p style={s.wishText}>{wish.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
