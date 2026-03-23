import React, { useState } from 'react';

export function HeavyThought({ T, lang }) {
  const [thought, setThought] = useState("");
  const [released, setReleased] = useState(false);
  const isHindi = lang === "Hindi";

  const s = {
    container: {
      background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 24,
      padding: "32px 24px", maxWidth: "400px", margin: "0 auto", textAlign: "center",
      boxShadow: `0 10px 30px ${T.accent}08`,
    },
    balloonIcon: { fontSize: 60, marginBottom: 20 },
    releasedTitle: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: 26,
      color: T.accentSoft, marginBottom: 12,
    },
    releasedBody: { fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 24 },
    againBtn: {
      background: `${T.accent}20`, border: `1px solid ${T.accent}40`,
      color: T.accent, padding: "12px 32px", borderRadius: 99,
      fontWeight: 500, cursor: "pointer",
    },
    cloudIcon: { fontSize: 32, marginBottom: 12 },
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: T.text, marginBottom: 8 },
    prompt: { fontSize: 13, color: T.muted, marginBottom: 20 },
    textarea: {
      width: "100%", height: 120, borderRadius: 16, padding: 16,
      background: T.surfaceAlt, border: `1px solid ${T.border}`,
      color: T.text, fontSize: 15, marginBottom: 20,
      outline: "none", resize: "none", fontFamily: "inherit",
    },
    releaseBtn: (active) => ({
      width: "100%", background: T.accent, color: "#fff", padding: "16px",
      borderRadius: 18, fontSize: 15, fontWeight: 600, border: "none",
      opacity: active ? 1 : 0.4, transition: "opacity 0.3s",
      cursor: active ? "pointer" : "default",
    }),
  };

  if (released) return (
    <div style={s.container} className="fade-in">
      <div className="float-up" style={s.balloonIcon}>🎈</div>
      <h3 style={s.releasedTitle}>{isHindi ? "वह चला गया।" : "It is gone."}</h3>
      <p style={s.releasedBody}>
        {isHindi
          ? "आपने उस बोझ को ब्रह्मांड को सौंप दिया है। अब आप हल्का महसूस कर सकते हैं।"
          : "You've handed that weight to the universe. You can breathe easier now."}
      </p>
      <button onClick={() => { setReleased(false); setThought(""); }} style={s.againBtn}>
        {isHindi ? "एक और विचार छोड़ें" : "Release another"}
      </button>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.cloudIcon}>☁️</div>
      <h3 style={s.title}>{isHindi ? "भारी विचार" : "Heavy Thought"}</h3>
      <p style={s.prompt}>
        {isHindi
          ? "जो बात आपको परेशान कर रही है उसे लिखें और उसे उड़ जाने दें।"
          : "Write what is weighing on you and watch it float away."}
      </p>
      <textarea
        value={thought}
        onChange={(e) => setThought(e.target.value)}
        placeholder={isHindi ? "यहाँ लिखें..." : "Type here..."}
        style={s.textarea}
      />
      <button
        disabled={!thought.trim()}
        onClick={() => setReleased(true)}
        style={s.releaseBtn(thought.trim())}
      >
        {isHindi ? "गुब्बारे में भरें और छोड़ें" : "Release into the Sky"}
      </button>
    </div>
  );
}
