import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

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

  // ─── WEBRTC STATE & REFS ───
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const localStream = useRef(null);
  const peerConnection = useRef(null);
  const remoteAudioRef = useRef(null);
  const signalingChannelRef = useRef(null);

  // ─── AUTO-SCROLL TRACKERS ───
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // ─── STYLES ───
  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${T.accent}20` },
    headerTitle: { fontWeight: 'bold', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px', flex: 1, textAlign: 'center', color: T.text },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', backgroundColor: `${T.accent}20`, color: T.text },
    logoutBtn: { padding: '8px 16px', borderRadius: '20px', border: `1px solid ${T.accent}30`, cursor: 'pointer', fontWeight: '600', fontSize: '10px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', background: 'transparent', color: T.text, opacity: 0.6 },
    callBtn: { padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.8 },
    callBtnDisabled: { padding: '8px', background: 'transparent', border: 'none', cursor: 'not-allowed', fontSize: '18px', opacity: 0.4 },
    chatBox: { flex: 1, padding: '20px', overflowY: 'scroll', display: 'flex', flexDirection: 'column', scrollBehavior: 'smooth' },
    searchContainer: { marginBottom: '20px', padding: '0 5px' },
    searchRow: { display: 'flex', gap: '8px' },
    searchInput: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", backgroundColor: `${T.accent}10`, color: T.text, border: `1px solid ${T.accent}30` },
    findBtn: { padding: '12px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px', backgroundColor: T.accent, color: T.bg },
    roomsLabel: { marginTop: '10px', opacity: 0.8, fontSize: '12px', letterSpacing: '1px', color: T.text },
    roomCard: { padding: '15px', margin: '10px 0', borderRadius: '12px', border: `1px solid ${T.accent}30`, backgroundColor: `${T.accent}05`, cursor: 'pointer', color: T.text },
    roomCardSearch: { padding: '15px', margin: '10px 0', borderRadius: '12px', border: `1px dashed ${T.accent}`, backgroundColor: `${T.accent}05`, cursor: 'pointer', color: T.text },
    messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' },
    emptyRoom: { textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.5, color: T.text },
    getBubbleWrapper: (isMe) => ({ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }),
    getBubble: (isMe) => ({ padding: '10px 16px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: isMe ? T.accent : `${T.accent}15`, color: isMe ? T.bg : T.text, border: `1px solid ${T.accent}30`, maxWidth: '75%', fontSize: '15px' }),
    senderName: { fontSize: '11px', marginBottom: '4px', opacity: 0.6, fontWeight: 'bold', color: T.text },
    statusBar: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
    timestamp: { fontSize: '10px', opacity: 0.5, color: T.text },
    readTick: (isRead) => ({ fontSize: '11px', color: isRead ? '#4dabf7' : T.text, opacity: isRead ? 1 : 0.6 }),
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: 0.5, padding: 0 },
    autoScrollBtn: (active) => ({ position: 'absolute', bottom: '90px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: active ? `${T.accent}40` : `${T.accent}15`, border: `1px solid ${T.accent}`, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: active ? `0 0 15px ${T.accent}40` : '0 4px 10px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', zIndex: 100, fontSize: '16px' }),
    inputArea: { display: 'flex', padding: '15px', alignItems: 'center' },
    inputField: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", backgroundColor: `${T.accent}10`, color: T.text, border: `1px solid ${T.accent}30` },
    sendBtn: { padding: '12px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px', backgroundColor: T.accent, color: T.bg },
    loadingText: { textAlign: 'center', marginTop: '40px', opacity: 0.5, color: T.text },
    
    // Call UI Styles
    callBanner: { backgroundColor: `${T.accent}15`, color: T.text, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.accent}40`, fontWeight: '500', fontSize: '14px' },
    acceptBtn: { padding: '6px 16px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px' },
    declineBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }
  };

  // 1. INITIALIZATION & IDENTITY
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

  // 2. CHAT & WEBRTC SIGNALING LISTENER
  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    // A. Chat Message Fetching & Listener
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        const unreadIds = data.filter(m => !m.is_read && m.user_id !== currentUser.id).map(m => m.id);
        if (unreadIds.length > 0) supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }
    };
    fetchMessages();

    const chatChannel = supabase.channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
            if (payload.new.user_id !== currentUser.id) supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then();
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter(m => m.id !== payload.old?.id));
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
          }
        })
      .subscribe();

    // B. WebRTC Signaling Channel (Supabase Broadcast)
    const sigChannel = supabase.channel(`signaling-${activeRoom.id}`, {
      config: { broadcast: { ack: false } }
    });

    sigChannel.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
      if (payload.sender === currentUser.id) return; // Ignore our own signals

      try {
        if (payload.type === 'offer') {
          setIncomingCall(payload);
        } else if (payload.type === 'answer' && peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        } else if (payload.type === 'ice-candidate' && peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } else if (payload.type === 'end-call') {
          cleanupCall();
          setIncomingCall(null);
        }
      } catch (err) {
        console.error("Signaling Error:", err);
      }
    }).subscribe();

    signalingChannelRef.current = sigChannel;

    return () => { 
      supabase.removeChannel(chatChannel); 
      supabase.removeChannel(sigChannel);
    };
  }, [activeRoom, currentUser]);

  // ─── AUTO-SCROLL MOTORS ───
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current) {
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, activeRoom]);

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

  // ─── ENCRYPTION ───
  const encrypt = (text, key) => {
    if (!text || !key) return "";
    const stringKey = String(key);
    const safeText = encodeURIComponent(text);
    return btoa(safeText.split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join(''));
  };

  const decrypt = (scrambled, key) => {
    if (!scrambled || !key) return "";
    const stringKey = String(key);
    try {
      const decodedXor = atob(scrambled).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join('');
      return decodeURIComponent(decodedXor);
    } catch (e) {
      return scrambled;
    }
  };

  // ─── ENTERPRISE WEBRTC IMPLEMENTATION ───
  const STUN_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const initializeWebRTC = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStream.current = stream;
    
    const pc = new RTCPeerConnection(STUN_SERVERS);
    peerConnection.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: 'broadcast', event: 'webrtc',
          payload: { type: 'ice-candidate', candidate: event.candidate, sender: currentUser.id }
        });
      }
    };
    return pc;
  };

  const startCall = async () => {
    if (isInCall) return;
    setIsInCall(true);
    try {
      const pc = await initializeWebRTC();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      signalingChannelRef.current.send({
        type: 'broadcast', event: 'webrtc',
        payload: { type: 'offer', sdp: offer, sender: currentUser.id, callerEmail: currentUser.email }
      });
    } catch (error) {
      alert("Call Initialization Failed: " + error.message);
      cleanupCall();
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    setIsInCall(true);
    try {
      const pc = await initializeWebRTC();
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      signalingChannelRef.current.send({
        type: 'broadcast', event: 'webrtc',
        payload: { type: 'answer', sdp: answer, sender: currentUser.id }
      });
      setIncomingCall(null);
    } catch (error) {
      alert("Failed to answer call: " + error.message);
      cleanupCall();
    }
  };

  const declineCall = () => {
    if (signalingChannelRef.current) {
      signalingChannelRef.current.send({
        type: 'broadcast', event: 'webrtc',
        payload: { type: 'end-call', sender: currentUser.id }
      });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (signalingChannelRef.current) {
      signalingChannelRef.current.send({
        type: 'broadcast', event: 'webrtc',
        payload: { type: 'end-call', sender: currentUser.id }
      });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    setIsInCall(false);
  };

  // ─── CHAT ACTIONS ───
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    const scrambledText = encrypt(message, activeRoom.id);
    setMessage("");
    const { error } = await supabase.from('messages').insert([{ content: scrambledText, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email }]);
    if (error) alert("Security Error: " + error.message);
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm(hi ? "क्या आप इस संदेश को हटाना चाहते हैं?" : "Are you sure you want to delete this message?");
    if (!confirmDelete) return;
    setMessages((prev) => prev.filter(m => m.id !== messageId));
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) alert("Could not delete message: " + error.message);
  };

  const handleSearch = async () => {
    if (!currentUser) return;
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
      if (error) alert("Error: " + error.message);
      if (newRoom) { setRooms(prev => [...prev, newRoom[0]]); setActiveRoom(newRoom[0]); }
    }
    setSearchTerm(""); setSearchResults([]);
  };

  const getRoomDisplayName = (room) => {
    if (room.is_private && room.name.includes(':::')) {
      const parts = room.name.split(':::');
      if (currentUser?.email === parts[1]) return `✨ ${parts[0].split('@')[0]}`;
      else return `👤 Chat with ${parts[1].split('@')[0]}`;
    }
    return room.is_private ? `👤 ${room.name}` : `📁 ${room.name}`;
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm(hi ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    setTab('home'); window.location.reload();
  };

  const handleBackOrHome = () => {
    setIsAutoScrolling(false);
    if (isInCall) endCall();
    activeRoom ? setActiveRoom(null) : setTab('home');
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── RENDER ───
  return (
    <div style={s.container}>
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />

      <div style={s.header}>
        <button style={s.backBtn} onClick={handleBackOrHome}>{activeRoom ? (hi ? "वापस" : "BACK") : (hi ? "होम" : "HOME")}</button>
        <div style={s.headerTitle}>{activeRoom ? getRoomDisplayName(activeRoom) : (hi ? "सुकून चैट" : "SUKOON CHAT")}</div>
        
        {activeRoom && activeRoom.is_private && (
          <button style={isInCall ? s.callBtnDisabled : s.callBtn} onClick={startCall} disabled={isInCall} title="Secure WebRTC Call">
            📞
          </button>
        )}
        {!activeRoom && <button style={s.logoutBtn} onClick={handleLogout}>{hi ? "लॉग आउट" : "LOGOUT"}</button>}
      </div>

      {/* INCOMING CALL BANNER */}
      {incomingCall && !isInCall && (
        <div style={s.callBanner}>
          <span>📞 {incomingCall.callerEmail?.split('@')[0]} is calling...</span>
          <div>
            <button onClick={answerCall} style={s.acceptBtn}>{hi ? "स्वीकार" : "Accept"}</button>
            <button onClick={declineCall} style={s.declineBtn}>{hi ? "अस्वीकार" : "Decline"}</button>
          </div>
        </div>
      )}

      {/* ACTIVE CALL BANNER */}
      {isInCall && (
        <div style={s.callBanner}>
          <span style={{ color: '#4ade80' }}>🟢 {hi ? "कॉल सुरक्षित रूप से कनेक्टेड" : "Secure Call Active"}</span>
          <button onClick={endCall} style={s.declineBtn}>{hi ? "कॉल समाप्त करें" : "End Call"}</button>
        </div>
      )}

      <div style={s.chatBox} ref={chatBoxRef}>
        {loading ? ( <div style={s.loadingText}>{hi ? "लोड हो रहा है..." : "Loading..."}</div> ) : !activeRoom ? (
          <>
            <div style={s.searchContainer}>
              <div style={s.searchRow}>
                <input style={s.searchInput} placeholder={hi ? "ईमेल से खोजें..." : "Find by email..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                <button style={s.findBtn} onClick={handleSearch}>{hi ? "खोजें" : "FIND"}</button>
              </div>
              {searchResults.map(user => ( <div key={user.id} onClick={() => startPrivateChat(user)} style={s.roomCardSearch}>✨ Chat with {user.email}</div> ))}
            </div>
            <div style={s.roomsLabel}>{hi ? "आपके रूम" : "YOUR ROOMS"}</div>
            {rooms.map(r => ( <div key={r.id} style={s.roomCard} onClick={() => setActiveRoom(r)}>{getRoomDisplayName(r)}</div> ))}
          </>
        ) : (
          <div style={s.messageList}>
            {messages.length === 0 ? ( <div style={s.emptyRoom}>{hi ? `स्वागत है` : `Welcome to ${getRoomDisplayName(activeRoom)}`}</div> ) : (
              messages.map(m => {
                const isMe = m.user_id === currentUser?.id;
                const decryptedText = decrypt(m.content, activeRoom.id);
                return (
                  <div key={m.id} style={s.getBubbleWrapper(isMe)}>
                    {!isMe && <div style={s.senderName}>{m.user_email?.split('@')[0]}</div>}
                    <div style={s.getBubble(isMe)}>{decryptedText}</div>
                    <div style={s.statusBar}>
                      <div style={s.timestamp}>{formatTime(m.created_at)}</div>
                      {isMe && ( <> <div style={s.readTick(m.is_read)}>{m.is_read ? '✓✓' : '✓'}</div> <button onClick={() => handleDeleteMessage(m.id)} style={s.deleteBtn}>🗑️</button> </> )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>
        )}
      </div>

      {activeRoom && messages.length > 5 && ( <button onClick={() => setIsAutoScrolling(!isAutoScrolling)} style={s.autoScrollBtn(isAutoScrolling)}>{isAutoScrolling ? "⏸️" : "⏬"}</button> )}

      {activeRoom && (
        <div style={s.inputArea}>
          <input style={s.inputField} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={hi ? "संदेश लिखें..." : "Type a message..."} />
          <button style={s.sendBtn} onClick={handleSendMessage}>{hi ? "भेजें" : "Send"}</button>
        </div>
      )}
    </div>
  );
}