import React, { useState } from 'react';

export function UnsentLetter({ T, lang }) {
  const [text, setText] = useState("");
  const [burned, setBurned] = useState(false);
  const isHindi = lang === "Hindi";

  const containerStyle = {
    background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 24,
    padding: "32px 24px", maxWidth: "400px", margin: "0 auto", textAlign: "center"
  };

  if (burned) return (
    <div style={containerStyle} className="fade-in">
      <div style={{ fontSize: 50, marginBottom: 16 }}>✨</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.accentSoft }}>
        {isHindi ? "मुक्त महसूस करें" : "Feel Released"}
      </h3>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 24 }}>
        {isHindi ? "आपका पत्र अब राख है। आपकी भावनाएं सुनी गईं और अब वे मुक्त हैं।" : "Your letter is now ash. Your feelings were heard, and now they are free."}
      </p>
      <button onClick={() => {setBurned(false); setText("");}} style={{ color: T.accent, fontWeight: 500, background: 'none', border: `1px solid ${T.accent}40`, padding: "10px 24px", borderRadius: 99 }}>
        {isHindi ? "एक और लिखें" : "Write Another"}
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.text, marginBottom: 8 }}>
        {isHindi ? "बिना भेजा पत्र" : "Unsent Letter"}
      </h3>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder={isHindi ? "बिना किसी डर के सब कुछ लिख दें..." : "Say everything you need to say, without judgment..."}
        style={{ width: "100%", height: 180, borderRadius: 16, padding: 16, background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, fontSize: 15, marginBottom: 20, outline: 'none', resize: 'none' }}
      />
      <button 
        disabled={!text.trim()}
        onClick={() => setBurned(true)} 
        style={{ width: "100%", background: "#444", color: "#fff", padding: "16px", borderRadius: 18, fontSize: 15, fontWeight: 600, border: 'none', opacity: text.trim() ? 1 : 0.4 }}>
        {isHindi ? "इसे प्रतीकात्मक रूप से जला दें" : "Burn Symbolically"}
      </button>
    </div>
  );
}