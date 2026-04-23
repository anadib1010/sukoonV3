import React, { useState, useEffect, useRef } from 'react';

export function KPopGeneralRoom({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // 🛡️ K-Pop Specific Accent: Hot Pink
  const popCol = "#FF69B4";

  // ─── THE RULE OF T: INTERNAL STYLING ───
  const s = {
    container: {
      height: "100dvh", display: "flex", flexDirection: "column",
      background: T.bg, color: T.text, position: "relative", overflow: "hidden"
    },
    header: {
      padding: "60px 20px 20px", background: `${popCol}12`,
      borderBottom: `1px solid ${popCol}25`, textAlign: "center",
      boxShadow: `0 4px 30px ${popCol}08`
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "26px",
      fontWeight: 600, color: popCol, letterSpacing: "1.5px", margin: 0
    },
    chatArea: {
      flex: 1, overflowY: "auto", padding: "20px",
      display: "flex", flexDirection: "column", gap: "12px"
    },
    // 🛡️ International-Grade Message Bubbles
    bubble: (isMe) => ({
      alignSelf: isMe ? "flex-end" : "flex-start",
      maxWidth: "75%", padding: "14px 18px", borderRadius: "20px",
      background: isMe ? popCol : `${T.accent}08`,
      color: isMe ? "#fff" : T.text,
      border: `1px solid ${isMe ? "transparent" : `${popCol}20`}`,
      fontSize: "14px", lineHeight: "1.6",
      boxShadow: isMe ? `0 6px 15px ${popCol}35` : "none"
    }),
    inputArea: {
      padding: "24px 20px 40px", background: T.bg, 
      borderTop: `1px solid ${popCol}15`,
      display: "flex", gap: "12px", alignItems: "center"
    },
    inputField: {
      flex: 1, padding: "15px 22px", borderRadius: "30px",
      background: `${T.accent}03`, border: `1px solid ${popCol}30`,
      color: T.text, outline: "none", fontSize: "14px"
    },
    sendBtn: {
      width: "48px", height: "48px", borderRadius: "50%",
      background: popCol, border: "none", color: "#fff",
      cursor: "pointer", display: "flex", alignItems: "center", 
      justifyContent: "center", fontSize: "18px",
      boxShadow: `0 4px 12px ${popCol}40`
    },
    backBtn: { 
      position: "absolute", left: 20, top: 62, background: "none", 
      border: "none", color: popCol, cursor: "pointer", fontSize: "20px" 
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { id: Date.now(), text: input, isMe: true };
    setMessages([...messages, msg]);
    setInput("");
    
    // 🛡️ Automated Fan Response (Simulating Community)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: hi ? "K-Pop रूम में आपका स्वागत है! Fighting! 🎤" : "Welcome to the K-Pop Room! Fighting! 🎤", 
        isMe: false 
      }]);
    }, 1000);
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button onClick={() => setTab('khub')} style={s.backBtn}>←</button>
        <h2 style={s.title}>🎤 {hi ? "के-पॉप रूम" : "K-Pop Room"}</h2>
        <p style={{ fontSize: "10px", opacity: 0.4, letterSpacing: "3px", textTransform: "uppercase", marginTop: "4px" }}>
          {hi ? "सुरक्षित समुदाय" : "SECURE COMMUNITY"}
        </p>
      </div>

      <div style={s.chatArea}>
        {messages.map(m => (
          <div key={m.id} style={s.bubble(m.isMe)}>{m.text}</div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div style={s.inputArea}>
        <input 
          style={s.inputField} 
          placeholder={hi ? "कुछ लिखें..." : "Share the hype..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button style={s.sendBtn} onClick={sendMessage}>🔥</button>
      </div>
    </div>
  );
}