import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// ─── STATIC STYLES ─────────────────────────────────────────────────────────
const staticStyles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerTitle: { fontWeight: 'bold', fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px', flex: 1, textAlign: 'center' },
  homeBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" },
  chatBox: { flex: 1, padding: '20px', overflowY: 'scroll', display: 'flex', flexDirection: 'column' },
  messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' },
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
  const [currentUser, setCurrentUser] = useState(null);

  // 1. IDENTITY & ROOMS
  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      const { data } = await supabase.from('rooms').select('*');
      if (data) setRooms(data);
      setLoading(false);
    }
    initialize();
  }, []);

  // 2. LIVE LISTENER
  useEffect(() => {
    if (!activeRoom) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase.channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` }, 
      (payload) => {
        setMessages((prev) => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRoom]);

  // 3. SEND MESSAGE
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    const newMessage = { content: message, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email };
    setMessage(""); 
    const { error } = await supabase.from('messages').insert([newMessage]);
    if (error) alert("Security Error: " + error.message);
  };

  // 4. THE TIME-TELLER (The missing piece!)
  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── DYNAMIC STYLES ───────────────────────────────────────────────────────
  const dynamicStyles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text },
    combinedHomeBtn: { ...staticStyles.homeBtn, backgroundColor: `${T.accent}20`, color: T.text },
    combinedInput: { ...staticStyles.inputField, backgroundColor: `${T.accent}10`, color: T.text, border: `1px solid ${T.accent}30` },
    combinedButton: { ...staticStyles.sendButton, backgroundColor: T.accent, color: T.bg },
    roomCard: { padding: '15px', margin: '10px 0', borderRadius: '12px', border: `1px solid ${T.accent}30`, backgroundColor: `${T.accent}05`, cursor: 'pointer' },
    getBubbleWrapper: (isMe) => ({ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }),
    getBubble: (isMe) => ({
      padding: '10px 16px',
      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      backgroundColor: isMe ? T.accent : `${T.accent}15`,
      color: isMe ? T.bg : T.text,
      border: `1px solid ${T.accent}30`,
      maxWidth: '75%',
      fontSize: '15px'
    }),
    senderName: { fontSize: '11px', marginBottom: '4px', opacity: 0.6, fontWeight: 'bold' }
  };

  const handleBackOrHome = () => activeRoom ? setActiveRoom(null) : setTab('home');

  return (
    <div style={dynamicStyles.container}>
      <div style={staticStyles.header}>
        <button style={dynamicStyles.combinedHomeBtn} onClick={handleBackOrHome}>{activeRoom ? "BACK" : "HOME"}</button>
        <div style={staticStyles.headerTitle}>{activeRoom ? activeRoom.name : "SUKOON TEAM CHAT"}</div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div style={staticStyles.chatBox}>
        {!activeRoom ? (
          rooms.map(r => <div key={r.id} style={dynamicStyles.roomCard} onClick={() => setActiveRoom(r)}>📁 {r.name}</div>)
        ) : (
          <div style={staticStyles.messageList}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.5 }}>Welcome to {activeRoom.name}</div>
            ) : (
              messages.map(m => {
                const isMe = m.user_id === currentUser?.id;
                return (
                  <div key={m.id} style={dynamicStyles.getBubbleWrapper(isMe)}>
                    {!isMe && <div style={dynamicStyles.senderName}>{m.user_email?.split('@')[0]}</div>}
                    <div style={dynamicStyles.getBubble(isMe)}>{m.content}</div>
                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.4 }}>{formatTime(m.created_at)}</div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {activeRoom && (
        <div style={staticStyles.inputArea}>
          <input style={dynamicStyles.combinedInput} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." />
          <button style={dynamicStyles.combinedButton} onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}