import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

// ─── STATIC STYLES ─────────────────────────────────────────────────────────
const staticStyles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerTitle: { fontWeight: 'bold', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px', flex: 1, textAlign: 'center' },
  homeBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px' },
  chatBox: { flex: 1, padding: '20px', overflowY: 'scroll', display: 'flex', flexDirection: 'column', scrollBehavior: 'smooth' }, 
  messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' },
  inputArea: { display: 'flex', padding: '15px', alignItems: 'center' },
  inputField: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" },
  sendButton: { padding: '12px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' },
  searchContainer: { marginBottom: '20px', padding: '0 5px' }
};

export default function SukoonChat({ T, lang, setTab }) {
  const hi = lang === "Hindi";
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]); 
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ─── NEW: VOICE CALL STATE ───
  const [callUrl, setCallUrl] = useState(null);
  const [isStartingCall, setIsStartingCall] = useState(false);

  // ─── AUTO-SCROLL TRACKERS ───
  const chatBoxRef = useRef(null); 
  const messagesEndRef = useRef(null); 
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

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

  // 1.5 ROOM RADAR
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

  // 2. LIVE MESSAGE LISTENER 
  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        const unreadMessages = data.filter(m => !m.is_read && m.user_id !== currentUser.id);
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(m => m.id);
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        }
      }
    };
    fetchMessages();

    const channel = supabase.channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` }, 
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
          if (payload.new.user_id !== currentUser.id) {
            supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then();
          }
        } 
        else if (payload.eventType === 'DELETE') {
          setMessages((prev) => prev.filter(m => m.id !== payload.old?.id));
        } 
        else if (payload.eventType === 'UPDATE') {
          setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRoom, currentUser]);

  // ─── THE AUTO-SCROLL MOTORS ───
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current && !callUrl) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, activeRoom, callUrl]); 

  useEffect(() => {
    let motor;
    if (isAutoScrolling && chatBoxRef.current) {
      motor = setInterval(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop += 1; 
          const isBottom = chatBoxRef.current.scrollHeight - chatBoxRef.current.scrollTop <= chatBoxRef.current.clientHeight + 1;
          if (isBottom) setIsAutoScrolling(false);
        }
      }, 40); 
    }
    return () => clearInterval(motor);
  }, [isAutoScrolling]);


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

  // ─── THE UPGRADED SECRET SCRAMBLER ─────────────────────────────────────────
  const encrypt = (text, key) => {
    if (!text || !key) return "";
    const stringKey = String(key); 
    // This safely encodes Emojis and Hindi before scrambling
    const safeText = encodeURIComponent(text);
    return btoa(safeText.split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join(''));
  };

  const decrypt = (scrambled, key) => {
    if (!scrambled || !key) return "";
    const stringKey = String(key); 
    try {
      const decodedXor = atob(scrambled).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join('');
      // This turns the code back into beautiful Emojis and Hindi
      return decodeURIComponent(decodedXor);
    } catch (e) {
      return scrambled; 
    }
  };

  // ─── NEW: THE BOUNCER CALL LOGIC ───
  const handleStartCall = async () => {
    setIsStartingCall(true);
    try {
      // 1. Ask the Bouncer for a room
      const response = await fetch('/api/daily', { method: 'POST' });
      const data = await response.json();
      
      if (data.url) {
        // 2. Open the call for myself
        setCallUrl(data.url);
        
        // 3. Secretly send the invite link to the chat!
        const inviteText = `📞 [SUKOON_CALL]:::${data.url}`;
        const scrambledText = encrypt(inviteText, activeRoom.id);
        const newMessage = { content: scrambledText, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email };
        await supabase.from('messages').insert([newMessage]);
      } else {
        alert(hi ? "कॉल शुरू नहीं हो सकी" : "Could not start call.");
      }
    } catch (error) {
      console.error(error);
      alert(hi ? "कॉल सर्वर त्रुटि" : "Call server error.");
    } finally {
      setIsStartingCall(false);
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

  // 4.5 THE INSTANT ERASER
  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm(lang === "Hindi" ? "क्या आप इस संदेश को हटाना चाहते हैं?" : "Are you sure you want to delete this message?");
    if (!confirmDelete) return;
    setMessages((prev) => prev.filter(m => m.id !== messageId));
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) alert("Could not delete message: " + error.message);
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
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative' },
    combinedHomeBtn: { ...staticStyles.homeBtn, backgroundColor: `${T.accent}20`, color: T.text },
    logoutBtn: { ...staticStyles.homeBtn, backgroundColor: 'transparent', color: T.text, opacity: 0.6, fontSize: '10px', border: `1px solid ${T.accent}30` },
    combinedInput: { ...staticStyles.inputField, backgroundColor: `${T.accent}10`, color: T.text, border: `1px solid ${T.accent}30` },
    combinedButton: { ...staticStyles.sendButton, backgroundColor: T.accent, color: T.bg },
    
    // NEW: Style for the Call Header Button
    callBtn: { ...staticStyles.sendButton, backgroundColor: `${T.accent}20`, color: T.text, border: `1px solid ${T.accent}50`, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px' },
    
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
    senderName: { fontSize: '11px', marginBottom: '4px', opacity: 0.6, fontWeight: 'bold' },
    
    autoScrollBtn: (active) => ({
      position: 'absolute', bottom: '90px', right: '20px', width: '40px', height: '40px', borderRadius: '50%',
      background: active ? `${T.accent}40` : `${T.accent}15`, border: `1px solid ${T.accent}`, color: T.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      boxShadow: active ? `0 0 15px ${T.accent}40` : '0 4px 10px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', zIndex: 100, fontSize: '16px',
    })
  };

  const handleBackOrHome = () => {
    setIsAutoScrolling(false); 
    setCallUrl(null); // End call if leaving room
    activeRoom ? setActiveRoom(null) : setTab('home');
  };

  return (
    <div style={dynamicStyles.container}>
      <div style={staticStyles.header}>
        <button style={dynamicStyles.combinedHomeBtn} onClick={handleBackOrHome}>{activeRoom ? "BACK" : "HOME"}</button>
        <div style={staticStyles.headerTitle}>{activeRoom ? getRoomDisplayName(activeRoom) : "SUKOON TEAM CHAT"}</div>
        
        {/* NEW: The Call Button in Header */}
        {activeRoom && activeRoom.is_private && !callUrl && (
          <button style={dynamicStyles.callBtn} onClick={handleStartCall} disabled={isStartingCall}>
            {isStartingCall ? "⏳" : "📞"}
          </button>
        )}
        
        {!activeRoom && <button style={dynamicStyles.logoutBtn} onClick={handleLogout}>{hi ? "लॉग आउट" : "LOGOUT"}</button>}
      </div>

      <div style={staticStyles.chatBox} ref={chatBoxRef}>
        
        {/* NEW: The Live Call Window */}
        {callUrl ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
            <iframe
              src={callUrl}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ flex: 1, width: '100%', border: `1px solid ${T.accent}50`, borderRadius: '16px', backgroundColor: '#000' }}
            ></iframe>
            <button onClick={() => setCallUrl(null)} style={{ ...dynamicStyles.combinedButton, backgroundColor: '#ff4e00', alignSelf: 'center', padding: '12px 30px' }}>
              {hi ? "कॉल समाप्त करें" : "End Call"}
            </button>
          </div>
        ) : !activeRoom ? (
          <>
            <div style={staticStyles.searchContainer}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input style={dynamicStyles.combinedInput} placeholder={hi ? "मित्र का ईमेल खोजें..." : "Find friend's email..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button style={dynamicStyles.combinedButton} onClick={handleSearch}>{hi ? "खोजें" : "FIND"}</button>
              </div>
              {searchResults.map(user => (
                <div key={user.id} onClick={() => startPrivateChat(user)} style={{ ...dynamicStyles.roomCard, border: `1px dashed ${T.accent}`, marginTop: '10px' }}>
                  ✨ Chat with {user.email}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', opacity: 0.8, fontSize: '12px', letterSpacing: '1px' }}>{hi ? "आपके कक्ष" : "YOUR ROOMS"}</div>
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
                const decryptedText = decrypt(m.content, activeRoom.id);
                
                // NEW: Detect Call Invites in Chat
                const isCallInvite = decryptedText.startsWith("📞 [SUKOON_CALL]:::");
                
                return (
                  <div key={m.id} style={dynamicStyles.getBubbleWrapper(isMe)}>
                    {!isMe && <div style={dynamicStyles.senderName}>{m.user_email?.split('@')[0]}</div>}
                    
                    {/* Render a Join Button if it's a Call Invite, otherwise render Text */}
                    {isCallInvite ? (
                       <div style={{...dynamicStyles.getBubble(isMe), border: `2px solid ${T.accent}`}}>
                         <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{hi ? "📞 वॉयस कॉल शुरू हो गई है!" : "📞 Voice Call Started!"}</p>
                         {!isMe && (
                           <button onClick={() => setCallUrl(decryptedText.split(":::")[1])} style={dynamicStyles.combinedButton}>
                             {hi ? "कॉल से जुड़ें" : "Join Call"}
                           </button>
                         )}
                       </div>
                    ) : (
                       <div style={dynamicStyles.getBubble(isMe)}>{decryptedText}</div>
                    )}
                    
                    {/* STATUS BAR */}
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
                            title={hi ? "संदेश हटाएं" : "Delete Message"}
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
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>
        )}
      </div>

      {activeRoom && messages.length > 5 && !callUrl && (
        <button 
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          style={dynamicStyles.autoScrollBtn(isAutoScrolling)}
          title={hi ? "ऑटो-स्क्रॉल" : "Auto-Scroll"}
        >
          {isAutoScrolling ? "⏸️" : "⏬"}
        </button>
      )}

      {activeRoom && !callUrl && (
        <div style={staticStyles.inputArea}>
          <input style={dynamicStyles.combinedInput} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={hi ? "एक संदेश लिखें..." : "Type a message..."} />
          <button style={dynamicStyles.combinedButton} onClick={handleSendMessage}>{hi ? "भेजें" : "Send"}</button>
        </div>
      )}
    </div>
  );
}