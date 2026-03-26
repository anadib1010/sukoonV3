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

  // ─── LIVE PRESENCE STATE (Who is online & typing) ───
  const [presentUsers, setPresentUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const presenceChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ─── ENTERPRISE MESH WEBRTC STATE ───
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]); 
  
  const localStream = useRef(null);
  const peers = useRef({}); 
  const signalingChannelRef = useRef(null);
  const ringtoneRef = useRef(null); // The invisible ringing speaker

  // ─── AUTO-SCROLL TRACKERS ───
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // ─── STYLES (Powered by dynamic T variables) ───
  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${T.accent}20` },
    headerTitleBox: { flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    headerTitle: { fontWeight: 'bold', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px', color: T.text },
    onlineStatus: { fontSize: '11px', color: '#4ade80', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 },
    greenDot: { width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 5px #4ade80' },
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
    typingIndicator: { fontSize: '12px', color: T.accent, padding: '0 20px', fontStyle: 'italic', opacity: 0.8, marginBottom: '5px' },
    autoScrollBtn: (active) => ({ position: 'absolute', bottom: '90px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: active ? `${T.accent}40` : `${T.accent}15`, border: `1px solid ${T.accent}`, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: active ? `0 0 15px ${T.accent}40` : '0 4px 10px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', zIndex: 100, fontSize: '16px' }),
    inputArea: { display: 'flex', padding: '15px', alignItems: 'center' },
    inputField: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", backgroundColor: `${T.accent}10`, color: T.text, border: `1px solid ${T.accent}30` },
    sendBtn: { padding: '12px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px', backgroundColor: T.accent, color: T.bg },
    loadingText: { textAlign: 'center', marginTop: '40px', opacity: 0.5, color: T.text },
    
    callBanner: { backgroundColor: `${T.accent}15`, color: T.text, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.accent}40`, fontWeight: '500', fontSize: '14px' },
    acceptBtn: { padding: '6px 16px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px' },
    declineBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }
  };

  // 1. INITIALIZATION
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
          if (payload.new.participants && payload.new.participants.includes(currentUser.id)) setRooms((prev) => [...prev, payload.new]);
        })
      .subscribe();
    return () => { supabase.removeChannel(roomChannel); };
  }, [currentUser?.id]);

  // 2. CHAT, MESH SIGNALING & PRESENCE LISTENER
  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    // A. Chat Message Fetching
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

    // B. Live Presence Engine (Who is online & typing)
    const presenceRoom = supabase.channel(`presence-${activeRoom.id}`, { config: { presence: { key: currentUser.id } } });
    presenceChannelRef.current = presenceRoom;

    presenceRoom.on('presence', { event: 'sync' }, () => {
      const state = presenceRoom.presenceState();
      const activeUsers = {};
      Object.keys(state).forEach(key => {
        if (key !== currentUser.id) activeUsers[key] = state[key][0]; 
      });
      setPresentUsers(activeUsers);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceRoom.track({ email: currentUser.email, is_typing: false });
      }
    });

    // C. Enterprise Mesh Signaling Channel & Ringer
    const sigChannel = supabase.channel(`signaling-${activeRoom.id}`, { config: { broadcast: { ack: false } } });
    signalingChannelRef.current = sigChannel;

    sigChannel.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
      if (payload.sender === currentUser.id) return; 

      try {
        if (payload.type === 'call-started' && !isInCall) {
          setIncomingCall(payload);
          // START RINGING!
          if (ringtoneRef.current) ringtoneRef.current.play().catch(e => console.log("Auto-play blocked by browser. User must click first."));
        } 
        else if (payload.type === 'user-joined' && isInCall) {
          const pc = createPeerConnection(payload.sender);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sigChannel.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'offer', sdp: offer, sender: currentUser.id, target: payload.sender } });
        } 
        else if (payload.type === 'offer' && payload.target === currentUser.id) {
          const pc = createPeerConnection(payload.sender);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sigChannel.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'answer', sdp: answer, sender: currentUser.id, target: payload.sender } });
        } 
        else if (payload.type === 'answer' && payload.target === currentUser.id) {
          const pc = peers.current[payload.sender];
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        } 
        else if (payload.type === 'ice-candidate' && payload.target === currentUser.id) {
          const pc = peers.current[payload.sender];
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } 
        else if (payload.type === 'user-left') {
          removePeer(payload.sender);
          if (incomingCall?.sender === payload.sender) {
            setIncomingCall(null);
            stopRinging();
          }
        }
      } catch (err) { console.error("Signaling Error:", err); }
    }).subscribe();

    return () => { 
      supabase.removeChannel(chatChannel); 
      supabase.removeChannel(presenceRoom);
      supabase.removeChannel(sigChannel);
      stopRinging();
    };
  }, [activeRoom, currentUser, isInCall]);

  // ─── RINGTONE CONTROLLER ───
  const stopRinging = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0; // Rewind to start
    }
  };

  // ─── AUTO-SCROLL MOTORS ───
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current) chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeRoom]);

  // ─── TYPING INDICATOR LOGIC ───
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Tell Supabase we started typing
    if (!isTyping && presenceChannelRef.current) {
      setIsTyping(true);
      presenceChannelRef.current.track({ email: currentUser.email, is_typing: true });
    }

    // Reset the timer. If we stop typing for 2 seconds, tell Supabase we stopped.
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });
    }, 2000);
  };

  // ─── ENCRYPTION ───
  const encrypt = (text, key) => {
    if (!text || !key) return "";
    const stringKey = String(key);
    return btoa(encodeURIComponent(text).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join(''));
  };

  const decrypt = (scrambled, key) => {
    if (!scrambled || !key) return "";
    const stringKey = String(key);
    try { return decodeURIComponent(atob(scrambled).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ stringKey.charCodeAt(i % stringKey.length))).join('')); } 
    catch (e) { return scrambled; }
  };

  // ─── ENTERPRISE MESH WEBRTC IMPLEMENTATION ───
  const STUN_SERVERS = { iceServers: [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' } ] };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);
    peers.current[peerId] = pc;
    if (localStream.current) localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));

    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        if (prev.find(p => p.userId === peerId)) return prev;
        return [...prev, { userId: peerId, stream: event.streams[0] }];
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'ice-candidate', candidate: event.candidate, sender: currentUser.id, target: peerId } });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') removePeer(peerId);
    };
    return pc;
  };

  const removePeer = (peerId) => {
    if (peers.current[peerId]) { peers.current[peerId].close(); delete peers.current[peerId]; }
    setRemoteStreams(prev => prev.filter(p => p.userId !== peerId));
  };

  const startCall = async () => {
    if (isInCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      setIsInCall(true);
      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'call-started', sender: currentUser.id, callerEmail: currentUser.email } });
    } catch (error) { alert("Microphone Access Failed: " + error.message); }
  };

  const joinCall = async () => {
    if (!incomingCall) return;
    stopRinging(); // Stop the ringing when we pick up!
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      setIsInCall(true);
      setIncomingCall(null);
      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-joined', sender: currentUser.id } });
    } catch (error) { alert("Failed to join call: " + error.message); }
  };

  const declineCall = () => {
    setIncomingCall(null);
    stopRinging(); // Stop ringing if we decline
  };

  const endCall = () => {
    if (signalingChannelRef.current) signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-left', sender: currentUser.id } });
    cleanupCall();
  };

  const cleanupCall = () => {
    Object.values(peers.current).forEach(pc => pc.close());
    peers.current = {};
    if (localStream.current) { localStream.current.getTracks().forEach(track => track.stop()); localStream.current = null; }
    setRemoteStreams([]);
    setIsInCall(false);
    stopRinging();
  };

  // ─── CHAT ACTIONS ───
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    const scrambledText = encrypt(message, activeRoom.id);
    setMessage("");
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });
    
    const { error } = await supabase.from('messages').insert([{ content: scrambledText, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email }]);
    if (error) alert("Security Error: " + error.message);
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm(hi ? "क्या आप इस संदेश को हटाना चाहते हैं?" : "Are you sure you want to delete this message?");
    if (!confirmDelete) return;
    setMessages((prev) => prev.filter(m => m.id !== messageId));
    await supabase.from('messages').delete().eq('id', messageId);
  };

  const handleSearch = async () => {
    if (!currentUser || searchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${searchTerm}%`).neq('id', currentUser.id);
    setSearchResults(data || []);
  };

  const startPrivateChat = async (friend) => {
    const { data: existing } = await supabase.from('rooms').select('*').eq('is_private', true).contains('participants', [currentUser.id, friend.id]);
    if (existing && existing.length > 0) setActiveRoom(existing[0]);
    else {
      const { data: newRoom } = await supabase.from('rooms').insert([{ name: `${currentUser.email}:::${friend.email}`, is_private: true, participants: [currentUser.id, friend.id] }]).select();
      if (newRoom) { setRooms(prev => [...prev, newRoom[0]]); setActiveRoom(newRoom[0]); }
    }
    setSearchTerm(""); setSearchResults([]);
  };

  const getRoomDisplayName = (room) => {
    if (room.is_private && room.name.includes(':::')) {
      const parts = room.name.split(':::');
      return currentUser?.email === parts[1] ? `✨ ${parts[0].split('@')[0]}` : `👤 Chat with ${parts[1].split('@')[0]}`;
    }
    return room.is_private ? `👤 ${room.name}` : `📁 ${room.name}`;
  };

  const handleLogout = async () => {
    if (!window.confirm(hi ? "लॉग आउट?" : "Logout?")) return;
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
  // Find out who is typing right now (anyone except us)
  const typingUsers = Object.values(presentUsers).filter(user => user.is_typing);

  return (
    <div style={s.container}>
      
      {/* 🎵 THE INVISIBLE RINGTONE SPEAKER */}
      <audio ref={ringtoneRef} src="/ringtone.mp3" loop style={{ display: 'none' }} />

      {/* MESH NETWORK SPEAKERS */}
      {remoteStreams.map(peer => (
        <audio key={peer.userId} autoPlay ref={el => { if (el && el.srcObject !== peer.stream) el.srcObject = peer.stream; }} style={{ display: 'none' }} />
      ))}

      <div style={s.header}>
        <button style={s.backBtn} onClick={handleBackOrHome}>{activeRoom ? (hi ? "वापस" : "BACK") : (hi ? "होम" : "HOME")}</button>
        
        <div style={s.headerTitleBox}>
          <div style={s.headerTitle}>{activeRoom ? getRoomDisplayName(activeRoom) : (hi ? "सुकून चैट" : "SUKOON CHAT")}</div>
          
          {/* THE LIVE GREEN DOT RADAR */}
          {activeRoom && Object.keys(presentUsers).length > 0 && (
            <div style={s.onlineStatus}>
              <span style={s.greenDot}></span> 
              {hi ? "ऑनलाइन" : "Online"}
            </div>
          )}
        </div>
        
        {activeRoom && (
          <button style={isInCall ? s.callBtnDisabled : s.callBtn} onClick={startCall} disabled={isInCall} title="Start Call">📞</button>
        )}
        {!activeRoom && <button style={s.logoutBtn} onClick={handleLogout}>{hi ? "लॉग आउट" : "LOGOUT"}</button>}
      </div>

      {/* INCOMING CALL BANNER (Rings when this appears!) */}
      {incomingCall && !isInCall && (
        <div style={s.callBanner}>
          <span>📞 {incomingCall.callerEmail?.split('@')[0]} is calling!</span>
          <div>
            <button onClick={joinCall} style={s.acceptBtn}>{hi ? "जुड़ें" : "Join"}</button>
            <button onClick={declineCall} style={s.declineBtn}>{hi ? "खारिज करें" : "Decline"}</button>
          </div>
        </div>
      )}

      {/* IN-CALL BANNER */}
      {isInCall && (
        <div style={s.callBanner}>
          <span style={{ color: '#4ade80' }}>🟢 {hi ? `कॉल कनेक्टेड` : `Secure Call Active`}</span>
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
            {messages.length === 0 ? ( <div style={s.emptyRoom}>{hi ? `स्वागत है` : `Welcome`}</div> ) : (
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

      {/* TYPING INDICATOR RADAR */}
      {activeRoom && typingUsers.length > 0 && (
        <div style={s.typingIndicator}>
          {typingUsers.map(u => u.email?.split('@')[0]).join(', ')} {hi ? "टाइप कर रहे हैं..." : "is typing..."}
        </div>
      )}

      {activeRoom && (
        <div style={s.inputArea}>
          <input 
            style={s.inputField} 
            value={message} 
            onChange={handleTyping} // <-- Uses the new Typing function!
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder={hi ? "संदेश लिखें..." : "Type a message..."} 
          />
          <button style={s.sendBtn} onClick={handleSendMessage}>{hi ? "भेजें" : "Send"}</button>
        </div>
      )}
    </div>
  );
}