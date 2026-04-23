import React, { useState, useEffect, useRef } from 'react';

export function KLavenderLoungeChat({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // 🛡️ Lavender-Specific Accent
  const lavCol = "#A18CD1";

  // ─── THE RULE OF T: INTERNAL STYLING ───
  const s = {
    container: {
      height: "100dvh", display: "flex", flexDirection: "column",
      background: T.bg, color: T.text, position: "relative", overflow: "hidden"
    },
    header: {
      padding: "60px 20px 20px", background: `${lavCol}12`,
      borderBottom: `1px solid ${lavCol}25`, textAlign: "center",
      boxShadow: `0 4px 30px ${lavCol}08`
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: "26px",
      fontWeight: 600, color: lavCol, letterSpacing: "1.5px", margin: 0
    },
    chatArea: {
      flex: 1, overflowY: "auto", padding: "20px",
      display: "flex", flexDirection: "column", gap: "12px"
    },
    // 🛡️ International-Grade Message Bubbles
    bubble: (isMe) => ({
      alignSelf: isMe ? "flex-end" : "flex-start",
      maxWidth: "75%", padding: "14px 18px", borderRadius: "20px",
      background: isMe ? lavCol : `${T.accent}08`,
      color: isMe ? "#fff" : T.text,
      border: `1px solid ${isMe ? "transparent" : `${lavCol}20`}`,
      fontSize: "14px", lineHeight: "1.6",
      boxShadow: isMe ? `0 6px 15px ${lavCol}35` : "none",
      transition: "all 0.3s ease"
    }),
    inputArea: {
      padding: "24px 20px 40px", background: T.bg, 
      borderTop: `1px solid ${lavCol}15`,
      display: "flex", gap: "12px", alignItems: "center"
    },
    inputField: {
      flex: 1, padding: "15px 22px", borderRadius: "30px",
      background: `${T.accent}03`, border: `1px solid ${lavCol}30`,
      color: T.text, outline: "none", fontSize: "14px",
      fontFamily: "'DM Sans', sans-serif"
    },
    sendBtn: {
      width: "48px", height: "48px", borderRadius: "50%",
      background: lavCol, border: "none", color: "#fff",
      cursor: "pointer", display: "flex", alignItems: "center", 
      justifyContent: "center", fontSize: "18px",
      boxShadow: `0 4px 12px ${lavCol}40`
    },
    backBtn: { 
      position: "absolute", left: 20, top: 62, background: "none", 
      border: "none", color: lavCol, cursor: "pointer", fontSize: "20px" 
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { id: Date.now(), text: input, isMe: true };
    setMessages([...messages, msg]);
    setInput("");
    
    // 🛡️ Placeholder for secure community response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: hi ? "लैवेंडर लाउंज में आपका स्वागत है! 🪻" : "Welcome to the peace of the Lavender Lounge! 🪻", 
        isMe: false 
      }]);
    }, 1200);
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button onClick={() => setTab('khub')} style={s.backBtn}>←</button>
        <h2 style={s.title}>🪻 {hi ? "लैवेंडर लाउंज" : "Lavender Lounge"}</h2>
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
          placeholder={hi ? "कुछ लिखें..." : "Share your thoughts..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button style={s.sendBtn} onClick={sendMessage}>✨</button>
      </div>
    </div>
  );
}