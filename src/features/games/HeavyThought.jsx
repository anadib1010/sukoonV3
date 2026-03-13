import React, { useState } from 'react';

export function HeavyThought({ T, lang }) {
  const [thought, setThought] = useState("");
  const [released, setReleased] = useState(false);
  const isHindi = lang === "Hindi";

  const containerStyle = {
    background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 24,
    padding: "32px 24px", maxWidth: "400px", margin: "0 auto", textAlign: "center",
    boxShadow: `0 10px 30px ${T.accent}08`
  };

  if (released) return (
    <div style={containerStyle} className="fade-in">
      <div className="float-up" style={{ fontSize: 60, marginBottom: 20 }}>🎈</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: T.accentSoft, marginBottom: 12 }}>
        {isHindi ? "वह चला गया।" : "It is gone."}
      </h3>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 24 }}>
        {isHindi ? "आपने उस बोझ को ब्रह्मांड को सौंप दिया है। अब आप हल्का महसूस कर सकते हैं।" : "You've handed that weight to the universe. You can breathe easier now."}
      </p>
      <button onClick={() => {setReleased(false); setThought("");}} style={{ background: `${T.accent}20`, border: `1px solid ${T.accent}40`, color: T.accent, padding: "12px 32px", borderRadius: 99, fontWeight: 500 }}>
        {isHindi ? "एक और विचार छोड़ें" : "Release another"}
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>☁️</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.text, marginBottom: 8 }}>
        {isHindi ? "भारी विचार" : "Heavy Thought"}
      </h3>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
        {isHindi ? "जो बात आपको परेशान कर रही है उसे लिखें और उसे उड़ जाने दें।" : "Write what is weighing on you and watch it float away."}
      </p>
      <textarea 
        value={thought} 
        onChange={(e) => setThought(e.target.value)}
        placeholder={isHindi ? "यहाँ लिखें..." : "Type here..."}
        style={{ width: "100%", height: 120, borderRadius: 16, padding: 16, background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, fontSize: 15, marginBottom: 20, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
      />
      <button 
        disabled={!thought.trim()}
        onClick={() => setReleased(true)} 
        style={{ width: "100%", background: T.accent, color: "#fff", padding: "16px", borderRadius: 18, fontSize: 15, fontWeight: 600, border: 'none', opacity: thought.trim() ? 1 : 0.4, transition: 'opacity 0.3s' }}>
        {isHindi ? "गुब्बारे में भरें और छोड़ें" : "Release into the Sky"}
      </button>
    </div>
  );
}