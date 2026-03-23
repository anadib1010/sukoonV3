import React, { useState } from 'react';

export function YakshaGate({ lang, T, onUnlock, onCancel }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const MASTER_KEY = "SUKOON2026";
  const isHindi = lang === "Hindi";

  const handleCheck = () => {
    if (input.toUpperCase() === MASTER_KEY) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const s = {
    page: {
      position: "fixed", top: 0, left: 0, width: "100%", height: "100dvh",
      zIndex: 99999, background: "#050508",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      boxSizing: "border-box", padding: "0 20px", overflow: "hidden",
    },
    backBtn: {
      position: "fixed", top: 30, left: 30,
      background: "none", border: "none",
      color: "rgba(255,255,255,0.3)", cursor: "pointer",
      fontSize: 14, fontFamily: "'Cormorant Garamond', serif",
    },
    content: {
      width: "100%", maxWidth: "340px", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center",
      boxSizing: "border-box",
    },
    icon: { fontSize: 32, marginBottom: 20, opacity: 0.5 },
    question: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 24,
      color: "#fff", fontWeight: 300, marginBottom: 40,
      lineHeight: 1.6, width: "100%",
    },
    inputWrap: {
      width: "100%", display: "flex", justifyContent: "center",
      transform: error ? "translateX(10px)" : "none",
      transition: "transform 0.1s", marginBottom: 30,
    },
    input: {
      background: "transparent", border: "none",
      borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
      color: "#d4af37", textAlign: "center", fontSize: 18,
      letterSpacing: 6, outline: "none", width: "200px",
      maxWidth: "100%", paddingBottom: 10, borderRadius: 0,
    },
    proceedBtn: {
      background: "transparent", border: "1px solid #d4af37",
      color: "#d4af37", padding: "12px 45px", borderRadius: 30,
      fontSize: 13, letterSpacing: 2, cursor: "pointer",
      transition: "all 0.3s ease",
    },
    keyHint: {
      marginTop: 30, opacity: 0.2, fontSize: 10,
      color: "#fff", letterSpacing: 1.5, fontFamily: "monospace",
    },
  };

  return (
    <div style={s.page}>
      <button onClick={onCancel} style={s.backBtn}>
        ← {isHindi ? "वापस" : "Back"}
      </button>

      <div style={s.content}>
        <div style={s.icon}>⚖️</div>
        <h2 style={s.question}>
          {isHindi
            ? '"क्या आपके पास अगले स्तर की कुंजी है?"'
            : '"Do you have the key to the next level?"'}
        </h2>

        <div style={s.inputWrap}>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder={isHindi ? "कोड यहाँ लिखें" : "TYPE CODE HERE"}
            style={s.input}
          />
        </div>

        <button onClick={handleCheck} style={s.proceedBtn}>
          {isHindi ? "प्रवेश करें" : "PROCEED"}
        </button>

        <div style={s.keyHint}>KEY: {MASTER_KEY}</div>
      </div>

      <style>{`
        input::placeholder {
          font-size: 10px; letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
