import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// ─── STATIC STYLES (Professional & Clean) ──────────────────────────────────
const staticStyles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerTitle: { fontWeight: 'bold', fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px', flex: 1, textAlign: 'center' },
  homeBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" },
  chatBox: { flex: 1, padding: '20px', overflowY: 'scroll', display: 'flex', flexDirection: 'column' },
  messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  inputArea: { display: 'flex', padding: '15px', alignItems: 'center' },
  inputField: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" },
  sendButton: { padding: '12px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }
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
      const { data, error } = await supabase.from('rooms').select('*');
      if (!error) setRooms(data.length === 0 ? [] : data);
      setLoading(false);
    }
    setupRooms();
  }, []);

  // 2. FETCH MESSAGES & LIVE WALKIE-TALKIE
  useEffect(() => {
    if (!activeRoom) return;

    // Fetch old messages
    const fetchMessages = async () => {
      const { data, error } = await supabase.from('messages').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    };
    fetchMessages();

    // Turn on the live listener for EVERYONE in this room
    const channel = supabase.channel(`room-chat-${activeRoom.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` }, 
      (payload) => {
        setMessages((prev) => {
          // Prevent duplicates (International standard safety)
          const exists = prev.find(m => m.id === payload.new.id);
          return exists ? prev : [...prev, payload.new];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRoom]);

  // 3. SEND MESSAGE
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const textToSend = message;
    setMessage(""); // Clear instantly for "Speed Feel"

    const { data, error } = await supabase.from('messages').insert([{ content: textToSend, room_id: activeRoom.id }]).select();
    
    if (error) alert("Security Error: " + error.message);
    // Note: We don't manually add the message here anymore because the Walkie-Talkie will handle it for us and the other person!
  };

  // 4. HELPER: FORMAT TIME
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── DYNAMIC STYLES (Rule of T) ──────────────────────────────────────────
  const dynamicStyles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text },
    combinedHomeBtn: { ...staticStyles.homeBtn, backgroundColor: `${T.accent}20`, color: T.text },
    combinedInput: { ...staticStyles.inputField, backgroundColor: `${T.accent}10`, color: T.text, border: `1px solid ${T.accent}30` },
    combinedButton: { ...staticStyles.sendButton, backgroundColor: T.accent, color: T.bg },
    roomCard: { padding: '15px', margin: '10px 0', borderRadius: '12px', border: `1px solid ${T.accent}30`, backgroundColor: `${T.accent}05`, cursor: 'pointer' },
    // Professional Bubble with Time
    bubbleContainer: { display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', maxWidth: '80%' },
    bubble: { padding: '10px 16px', borderRadius: '18px 18px 18px 4px', backgroundColor: `${T.accent}15`, border: `1px solid ${T.accent}20`, fontSize: '15px' },
    timestamp: { fontSize: '10px', marginTop: '4px', opacity: 0.5, alignSelf: 'flex-end', paddingRight: '5px' }
  };

  const handleBackOrHome = () => activeRoom ? setActiveRoom(null) : setTab('home');

  return (
    <div style={dynamicStyles.container}>
      {/* HEADER */}
      <div style={staticStyles.header}>
        <button style={dynamicStyles.combinedHomeBtn} onClick={handleBackOrHome}>
          {activeRoom ? "BACK" : "HOME"}
        </button>
        <div style={staticStyles.headerTitle}>
          {activeRoom ? activeRoom.name : "SUKOON TEAM CHAT"}
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* CHAT BOX */}
      <div style={staticStyles.chatBox}>
        {!activeRoom ? (
          rooms.map(r => (
            <div key={r.id} style={dynamicStyles.roomCard} onClick={() => setActiveRoom(r)}>📁 {r.name}</div>
          ))
        ) : (
          <div style={staticStyles.messageList}>
            {messages.map(m => (
              <div key={m.id} style={dynamicStyles.bubbleContainer}>
                <div style={dynamicStyles.bubble}>{m.content}</div>
                <div style={dynamicStyles.timestamp}>{formatTime(m.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INPUT */}
      {activeRoom && (
        <div style={staticStyles.inputArea}>
          <input 
            style={dynamicStyles.combinedInput} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a secure message..."
          />
          <button style={dynamicStyles.combinedButton} onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}