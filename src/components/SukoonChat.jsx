import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// ─── STATIC STYLES ─────────────────────────────────────────────────────────
const staticStyles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerTitle: { fontWeight: 'bold', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px', flex: 1, textAlign: 'center' },
  homeBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px' },
  chatBox: { flex: 1, padding: '20px', overflowY: 'scroll', display: 'flex', flexDirection: 'column' },
  messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' },
  inputArea: { display: 'flex', padding: '15px', alignItems: 'center' },
  inputField: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" },
  sendButton: { padding: '12px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' },
  searchContainer: { marginBottom: '20px', padding: '0 5px' }
};

export default function SukoonChat({ T, lang, setTab }) {
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]); 
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // 1. IDENTITY & INITIAL ROOMS
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

  // 1.5 ROOM RADAR (Instantly pops up invites)
  useEffect(() => {
    if (!currentUser) return;
    const roomChannel = supabase.channel('live-rooms-radar')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, 
      (payload) => {
        if (payload.new.participants && payload.new.participants.includes(currentUser.id)) {
          setRooms((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(roomChannel); };
  }, [currentUser?.id]);

  // 2. LIVE MESSAGE LISTENER (UPGRADED for Ticks and Deletes!)
  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        
        // 🛠️ THE AUTO-READER: Find messages sent to me that I haven't read yet
        const unreadMessages = data.filter(m => !m.is_read && m.user_id !== currentUser.id);
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(m => m.id);
          // Tell the database "I saw these!"
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        }
      }
    };
    fetchMessages();

    // 🛠️ THE UPGRADED RADAR: Now listens to event: '*' (Everything!)
    const channel = supabase.channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` }, 
      (payload) => {
        
        // If a new message arrives...
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
          // If the message is from my friend, mark it as read immediately!
          if (payload.new.user_id !== currentUser.id) {
            supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then();
          }
        } 
        // If a message gets deleted...
        else if (payload.eventType === 'DELETE') {
          setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
        } 
        // If a message gets updated (like turning blue ✓✓)...
        else if (payload.eventType === 'UPDATE') {
          setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }

      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRoom, currentUser]);

  // 3. SEARCH & PRIVATE CHAT LOGIC
  const handleSearch = async () => {
    if (!currentUser) return alert("You are logged out!");
    if (searchTerm.length < 3) return alert("Please type at least 3 letters!");
    const { data, error } = await supabase.from('profiles').select('*').ilike('email', `%${searchTerm}%`).neq('id', currentUser.id);
    if (error) alert("Error: " + error.message);
    else if (data && data.length === 0) alert("No friend found!");
    setSearchResults(data || []);
  };

  const startPrivateChat = async (friend) => {
    if (!currentUser) return; 
    const { data: existing } = await supabase.from('rooms').select('*').eq('is_private', true).contains('participants', [currentUser.id, friend.id]);
    if (existing && existing.length > 0) {
      setActiveRoom(existing[0]);
    } else {
      const roomName = `${currentUser.email}:::${friend.email}`;
      const { data: newRoom, error } = await supabase.from('rooms').insert([{ name: roomName, is_private: true, participants: [currentUser.id, friend.id] }]).select();
      if (error) alert("Could not create room: " + error.message);
      if (newRoom) {
        setRooms(prev => [...prev, newRoom[0]]);
        setActiveRoom(newRoom[0]);
      }
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const getRoomDisplayName = (room) => {
    if (room.is_private && room.name.includes(':::')) {
      const parts = room.name.split(':::');
      if (currentUser?.email === parts[1]) return `✨ ${parts[0].split('@')[0]} invited you!`;
      else return `👤 Chat with ${parts[1].split('@')[0]}`;
    }
    return room.is_private ? `👤 ${room.name}` : `📁 ${room.name}`;
  };

  // ─── THE SECRET SCRAMBLER ─────────────────────────────────────────────────
  const encrypt = (text, key) => {
    if (!text || !key) return "";
    const stringKey = String(key); 
    return btoa(text.split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join(''));
  };

  const decrypt = (scrambled, key) => {
    if (!scrambled || !key) return "";
    const stringKey = String(key); 
    try {
      return atob(scrambled).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join('');
    } catch (e) {
      return scrambled; 
    }
  };

  // 4. SEND MESSAGE 
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    const secretKey = activeRoom.id;
    const scrambledText = encrypt(message, secretKey);
    const newMessage = { content: scrambledText, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email };
    setMessage(""); 
    const { error } = await supabase.from('messages').insert([newMessage]);
    if (error) alert("Security Error: " + error.message);
  };

  // 4.5 THE INSTANT ERASER (Delete Message)
  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm(
      lang === "Hindi" ? "क्या आप इस संदेश को हटाना चाहते हैं?" : "Are you sure you want to delete this message?"
    );
    if (!confirmDelete) return;
    
    // 🛠️ MAGIC TRICK: Instantly hide it from the screen so the app feels super fast!
    setMessages((prev) => prev.filter(m => m.id !== messageId));

    // Tell the database Security Guard to officially destroy it
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    
    if (error) {
      alert("Could not delete message: " + error.message);
    }
  };

  // 5. THE LOGOUT FUNCTION
  const handleLogout = async () => {
    const confirmLogout = window.confirm(lang === "Hindi" ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?");
    if (!confirmLogout) return;
    const { error } = await supabase.auth.signOut();
    if (error) alert("Error: " + error.message);
    else { setTab('home'); window.location.reload(); }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── DYNAMIC STYLES ───────────────────────────────────────────────────────
  const dynamicStyles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text },
    combinedHomeBtn: { ...staticStyles.homeBtn, backgroundColor: `${T.accent}20`, color: T.text },
    logoutBtn: { ...staticStyles.homeBtn, backgroundColor: 'transparent', color: T.text, opacity: 0.6, fontSize: '10px', border: `1px solid ${T.accent}30` },
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
        <div style={staticStyles.headerTitle}>{activeRoom ? getRoomDisplayName(activeRoom) : "SUKOON TEAM CHAT"}</div>
        <button style={dynamicStyles.logoutBtn} onClick={handleLogout}>{lang === "Hindi" ? "लॉग आउट" : "LOGOUT"}</button>
      </div>

      <div style={staticStyles.chatBox}>
        {!activeRoom ? (
          <>
            <div style={staticStyles.searchContainer}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input style={dynamicStyles.combinedInput} placeholder="Find friend's email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button style={dynamicStyles.combinedButton} onClick={handleSearch}>FIND</button>
              </div>
              {searchResults.map(user => (
                <div key={user.id} onClick={() => startPrivateChat(user)} style={{ ...dynamicStyles.roomCard, border: `1px dashed ${T.accent}`, marginTop: '10px' }}>
                  ✨ Chat with {user.email}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', opacity: 0.8, fontSize: '12px', letterSpacing: '1px' }}>YOUR ROOMS</div>
            {rooms.map(r => (
              <div key={r.id} style={dynamicStyles.roomCard} onClick={() => setActiveRoom(r)}>{getRoomDisplayName(r)}</div>
            ))}
          </>
        ) : (
          <div style={staticStyles.messageList}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.5 }}>Welcome to {getRoomDisplayName(activeRoom)}</div>
            ) : (
              messages.map(m => {
                const isMe = m.user_id === currentUser?.id;
                return (
                  <div key={m.id} style={dynamicStyles.getBubbleWrapper(isMe)}>
                    {!isMe && <div style={dynamicStyles.senderName}>{m.user_email?.split('@')[0]}</div>}
                    <div style={dynamicStyles.getBubble(isMe)}>{decrypt(m.content, activeRoom.id)}</div>
                    
                    {/* 🛠️ THE NEW STATUS BAR (Time, Ticks, and Eraser) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div style={{ fontSize: '10px', opacity: 0.5 }}>{formatTime(m.created_at)}</div>
                      
                      {isMe && (
                        <>
                          <div style={{ fontSize: '11px', color: m.is_read ? '#4dabf7' : T.text, opacity: m.is_read ? 1 : 0.6, fontWeight: 'bold' }}>
                            {m.is_read ? '✓✓' : '✓'}
                          </div>
                          <button 
                            onClick={() => handleDeleteMessage(m.id)} 
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: 0.5, padding: 0 }}
                            title="Delete Message"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>

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