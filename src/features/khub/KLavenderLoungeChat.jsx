import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase'; // 🛡️ The master key to your database

export function KLavenderLoungeChat({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const scrollRef = useRef(null);

  const lavCol = "#A18CD1";
  const roomName = 'Lavender Lounge'; // 🪻 The official "Luggage Tag" for this room

  // ─── 1. THE BOUNCER CHECK (Get User) ───
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  // ─── 2. THE FILING CABINET & LIVE WIRE ───
  useEffect(() => {
    // A. Open the cabinet and read the past messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('khub_messages')
        .select('*')
        .eq('room_name', roomName) // Only grab Lavender messages!
        .order('created_at', { ascending: true });
      
      if (!error && data) setMessages(data);
    };
    fetchMessages();

    // B. Attach the "Live Wire" to listen for new messages instantly
    const subscription = supabase
      .channel('lavender_live_wire')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'khub_messages',
        filter: `room_name=eq.${roomName}` // Only listen to Lavender!
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  // Auto-scroll to the newest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── THE RULE OF T: INTERNAL STYLING ───
  const s = {
    container: { height: "100dvh", display: "flex", flexDirection: "column", background: T.bg, color: T.text, position: "relative", overflow: "hidden" },
    header: { padding: "60px 20px 20px", background: `${lavCol}12`, borderBottom: `1px solid ${lavCol}25`, textAlign: "center", boxShadow: `0 4px 30px ${lavCol}08` },
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 600, color: lavCol, letterSpacing: "1.5px", margin: 0 },
    chatArea: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
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
    senderName: { fontSize: "10px", opacity: 0.5, marginBottom: "4px", padding: "0 4px", textAlign: "left", fontFamily: "'DM Sans', sans-serif" },
    inputArea: { padding: "24px 20px 40px", background: T.bg, borderTop: `1px solid ${lavCol}15`, display: "flex", gap: "12px", alignItems: "center" },
    inputField: { flex: 1, padding: "15px 22px", borderRadius: "30px", background: `${T.accent}03`, border: `1px solid ${lavCol}30`, color: T.text, outline: "none", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" },
    sendBtn: { width: "48px", height: "48px", borderRadius: "50%", background: lavCol, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: `0 4px 12px ${lavCol}40` },
    backBtn: { position: "absolute", left: 20, top: 62, background: "none", border: "none", color: lavCol, cursor: "pointer", fontSize: "20px" }
  };

  // ─── 3. SENDING A SECURE MESSAGE ───
  const sendMessage = async () => {
    if (!input.trim() || !currentUser) return;
    
    const textToSend = input;
    setInput(""); // Clear input instantly so the user feels it is fast

    // Send the armored truck to Supabase!
    await supabase.from('khub_messages').insert({
      room_name: roomName,
      user_id: currentUser.id,
      user_email: currentUser.email,
      text: textToSend
    });
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
        {messages.map(m => {
          const isMe = currentUser?.id === m.user_id;
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              {!isMe && <span style={s.senderName}>{m.user_email.split('@')[0]}</span>}
              <div style={s.bubble(isMe)}>{m.text}</div>
            </div>
          );
        })}
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