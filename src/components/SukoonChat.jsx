import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// ─── STATIC STYLES ─────────────────────────────────────────────────────────
const staticStyles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerTitle: { fontWeight: 'bold', fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px', flex: 1, textAlign: 'center' },
  homeBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', textTransform: 'uppercase' },
  chatBox: { flex: 1, padding: '20px', overflowY: 'scroll', display: 'flex', flexDirection: 'column' },
  messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  inputField: { flex: 1, padding: '12px', borderRadius: '25px', border: 'none', marginRight: '10px', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" },
  sendButton: { padding: '12px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" }
};

export default function SukoonChat({ T, lang, setTab }) {
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]); 
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  // 1. FETCH ROOMS
  useEffect(() => {
    async function setupRooms() {
      let { data, error } = await supabase.from('rooms').select('*');
      if (!error && data.length === 0) {
        const { data: newRoom } = await supabase.from('rooms').insert([{ name: 'Main Team Board', type: 'public' }]).select();
        if (newRoom) setRooms(newRoom);
      } else if (!error) setRooms(data);
      setLoading(false);
    }
    setupRooms();
  }, []);

  // 2. FETCH MESSAGES & REALTIME LISTENER
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase.from('messages').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    };
    fetchMessages();

    // Give each connection a unique ID so it doesn't get blocked
    const uniqueId = Math.floor(Math.random() * 10000);
    const channel = supabase.channel(`room-${activeRoom.id}-${uniqueId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` }, 
      (payload) => {
        setMessages((prev) => {
          // Check if message is already in list to prevent duplicates
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe((status) => console.log("Realtime Status:", status));

    return () => { supabase.removeChannel(channel); };
  }, [activeRoom]);

  // 3. SEND MESSAGE
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const textToSend = message;
    setMessage(""); // Clear input immediately for a "fast" feel

    const { data, error } = await supabase.from('messages').insert([{ content: textToSend, room_id: activeRoom.id }]).select();
    
    if (error) {
      alert("Error: " + error.message);
    } else if (data) {
      // Manually add your own message to the screen instantly
      setMessages((prev) => [...prev, data[0]]);
    }
  };

  // ─── DYNAMIC STYLES (Rule of T) ──────────────────────────────────────────
  const dynamicStyles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text },
    combinedHomeBtn: { ...staticStyles.homeBtn, backgroundColor: `${T.accent}20`, color: T.text, border: `1px solid ${T.accent}50` },
    inputArea: { display: 'flex', padding: '15px', backgroundColor: `${T.accent}10` },
    combinedInput: { ...staticStyles.inputField, backgroundColor: T.bg, color: T.text, border: `1px solid ${T.accent}30` },
    combinedButton: { ...staticStyles.sendButton, backgroundColor: T.accent, color: T.bg },
    roomCard: { padding: '15px', margin: '10px 0', borderRadius: '12px', border: `1px solid ${T.accent}30`, backgroundColor: `${T.accent}05`, cursor: 'pointer' },
    messageBubble: { padding: '10px 15px', borderRadius: '15px', backgroundColor: `${T.accent}15`, border: `1px solid ${T.accent}20`, maxWidth: '80%', alignSelf: 'flex-start', color: T.text }
  };

  const handleBackOrHome = () => activeRoom ? setActiveRoom(null) : setTab('home');

  return (
    <div style={dynamicStyles.container}>
      <div style={staticStyles.header}>
        <button style={dynamicStyles.combinedHomeBtn} onClick={handleBackOrHome}>
          {lang === "Hindi" ? (activeRoom ? "पीछे" : "होम") : (activeRoom ? "BACK" : "HOME")}
        </button>
        <div style={staticStyles.headerTitle}>
          {activeRoom ? activeRoom.name : (lang === "Hindi" ? "सुकून टीम चैट" : "SUKOON TEAM CHAT")}
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div style={staticStyles.chatBox}>
        {!activeRoom ? (
          <>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '15px' }}>Rooms:</p>
            {rooms.map(r => (
              <div key={r.id} style={dynamicStyles.roomCard} onClick={() => setActiveRoom(r)}>📁 {r.name}</div>
            ))}
          </>
        ) : (
          <div style={staticStyles.messageList}>
            {messages.length === 0 ? <p style={{ textAlign: 'center', opacity: 0.4 }}>No messages yet.</p> : 
              messages.map(m => <div key={m.id} style={dynamicStyles.messageBubble}>{m.content}</div>)
            }
          </div>
        )}
      </div>

      {activeRoom && (
        <div style={dynamicStyles.inputArea}>
          <input 
            style={dynamicStyles.combinedInput} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type..."
          />
          <button style={dynamicStyles.combinedButton} onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}