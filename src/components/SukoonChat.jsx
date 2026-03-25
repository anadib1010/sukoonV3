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

  // 3. SEARCH & PRIVATE CHAT LOGIC (With X-Ray Vision & Safety Net!)
  const handleSearch = async () => {
    // 🛡️ THE SAFETY NET: This stops the app from crashing if you are logged out!
    if (!currentUser) {
      alert("You are logged out! Please go back to Home and log in again.");
      return;
    }

    console.log("🔍 1. Search Button Clicked!");
    console.log("🔍 2. You typed:", searchTerm);

    if (searchTerm.length < 3) {
      alert("Please type at least 3 letters of the email!");
      return;
    }

    // Ask the database for the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${searchTerm}%`)
      .neq('id', currentUser.id);

    console.log("🔍 3. Did the Security Guard block us? Error:", error);
    console.log("🔍 4. What did the database find?", data);

    if (error) {
      alert("Database Error: " + error.message);
    } else if (data && data.length === 0) {
      alert("No friend found! Are you sure their email is in the 'profiles' table?");
    }

    setSearchResults(data || []);
  };

  // ─── THE MISSING TOOL: START PRIVATE CHAT ─────────────────────────────────
  const startPrivateChat = async (friend) => {
    if (!currentUser) return; // 🛡️ Another safety net

    // 1. Check if a private room already exists between these two users
    const { data: existing } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_private', true)
      .contains('participants', [currentUser.id, friend.id]);

    if (existing && existing.length > 0) {
      setActiveRoom(existing[0]);
    } else {
      // 2. Create a brand new private room
      const roomName = `Chat: ${friend.email.split('@')[0]}`;
      const { data: newRoom, error } = await supabase
        .from('rooms')
        .insert([{ 
          name: roomName, 
          is_private: true, 
          participants: [currentUser.id, friend.id] 
        }])
        .select();
      
      if (error) alert("Could not create room: " + error.message);
      if (newRoom) {
        setRooms(prev => [...prev, newRoom[0]]);
        setActiveRoom(newRoom[0]);
      }
    }
    setSearchTerm("");
    setSearchResults([]);
  };
  // ──────────────────────────────────────────────────────────────────────────

  // ─── THE SECRET SCRAMBLER (SPY TOOLS) ─────────────────────────────────────
  
  // Encrypt: Mixes the text with the secret key
  const encrypt = (text, key) => {
    if (!text) return "";
    return btoa(text.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join(''));
  };

  // Decrypt: Unmixes the text using the exact same secret key
  const decrypt = (scrambled, key) => {
    if (!scrambled) return "";
    try {
      const decoded = atob(scrambled);
      return decoded.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
      ).join('');
    } catch (e) {
      // Teacher's Note: If it fails to unscramble (like for old messages), 
      // just show the normal text so the app doesn't crash!
      return scrambled; 
    }
  };

  // 4. SEND MESSAGE (Updated to Scramble!)
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    
    // 1. Grab the room ID to use as our secret key
    const secretKey = activeRoom.id;
    
    // 2. Scramble the message!
    const scrambledText = encrypt(message, secretKey);

    // 3. Send the scrambled gibberish to the database
    const newMessage = { 
      content: scrambledText, 
      room_id: activeRoom.id, 
      user_id: currentUser.id, 
      user_email: currentUser.email 
    };
    
    setMessage(""); 
    const { error } = await supabase.from('messages').insert([newMessage]);
    if (error) alert("Security Error: " + error.message);
  };

  // 5. THE LOGOUT FUNCTION
  const handleLogout = async () => {
    const confirmLogout = window.confirm(lang === "Hindi" ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?");
    if (!confirmLogout) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error: " + error.message);
    } else {
      setTab('home'); 
      window.location.reload();
    }
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
      {/* HEADER */}
      <div style={staticStyles.header}>
        <button style={dynamicStyles.combinedHomeBtn} onClick={handleBackOrHome}>
          {activeRoom ? "BACK" : "HOME"}
        </button>
        <div style={staticStyles.headerTitle}>{activeRoom ? activeRoom.name : "SUKOON TEAM CHAT"}</div>
        <button style={dynamicStyles.logoutBtn} onClick={handleLogout}>
          {lang === "Hindi" ? "लॉग आउट" : "LOGOUT"}
        </button>
      </div>

      <div style={staticStyles.chatBox}>
        {!activeRoom ? (
          <>
            {/* SEARCH SECTION */}
            <div style={staticStyles.searchContainer}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  style={dynamicStyles.combinedInput}
                  placeholder="Find friend's email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button style={dynamicStyles.combinedButton} onClick={handleSearch}>FIND</button>
              </div>
              {searchResults.map(user => (
                <div key={user.id} onClick={() => startPrivateChat(user)} style={{ ...dynamicStyles.roomCard, border: `1px dashed ${T.accent}`, marginTop: '10px' }}>
                  ✨ Chat with {user.email}
                </div>
              ))}
            </div>

            {/* ROOMS LIST */}
            <div style={{ marginTop: '10px', opacity: 0.8, fontSize: '12px', letterSpacing: '1px' }}>YOUR ROOMS</div>
            {rooms.map(r => (
              <div key={r.id} style={dynamicStyles.roomCard} onClick={() => setActiveRoom(r)}>
                {r.is_private ? "👤" : "📁"} {r.name}
              </div>
            ))}
          </>
        ) : (
          /* MESSAGE LIST */
          <div style={staticStyles.messageList}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.5 }}>Welcome to {activeRoom.name}</div>
            ) : (
              messages.map(m => {
                const isMe = m.user_id === currentUser?.id;
                return (
                  <div key={m.id} style={dynamicStyles.getBubbleWrapper(isMe)}>
                    {!isMe && <div style={dynamicStyles.senderName}>{m.user_email?.split('@')[0]}</div>}
                    
                    {/* DESCRAMBLE THE MESSAGE HERE! */}
                    <div style={dynamicStyles.getBubble(isMe)}>
                      {decrypt(m.content, activeRoom.id)}
                    </div>
                    
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