import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { requestFirebaseToken } from '../firebaseSetup';
import { SecurityKit } from '../utils/security';
import { useChatEngine } from '../hooks/useChatEngine';
import { useAudioEngine } from '../hooks/useAudioEngine';

// ─── iOS DETECTION ─────────────────────────────────────────────────────────
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export default function SukoonChat({ T, lang, setTab }) {
  const location = useLocation();
  const hi = lang === "Hindi";

  // ─── UI STATE ───
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const [unreadCounts, setUnreadCounts] = useState({});
  const activeRoomRef = useRef(activeRoom);
  useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const myMasterKeyRef = useRef(null);

  // ─── SAFETY & MODERATION STATE ───
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showManageBlocks, setShowManageBlocks] = useState(false);
  const [blockedProfiles, setBlockedProfiles] = useState([]);

  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // 🌟 THE MAILROOM (Text Chat Engine)
  const {
    messages,
    presentUsers,
    messageText,
    handleTyping,
    handleSendMessage,
    handleDeleteMessage
  } = useChatEngine(currentUser, activeRoom, blockedUsers, isVaultUnlocked, myMasterKeyRef, hi);

  // 🌟 THE WALKIE-TALKIE (Audio Call Engine)
  const {
    isInCall,
    showAudioBridge,
    startCall,
    joinCall,
    endCall,
    handleStartAudio,
    autoJoinRef
  } = useAudioEngine(currentUser, activeRoom, blockedUsers, hi);

  // ─── STYLES ─────────────────────────────────────────────────────────────
  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' },
    header: { 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', 
        borderBottom: `1px solid ${T.accent}30`, 
        backgroundColor: `${T.bg}CC`, 
        backdropFilter: 'blur(15px)', 
        WebkitBackdropFilter: 'blur(15px)',
        position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 
    },
    headerTitleBox: { flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, padding: '0 8px' },
    headerTitle: { fontWeight: '700', fontSize: '16px', color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' },
    headerTitleHome: { fontWeight: '700', fontSize: '20px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px', color: T.text },
    statusContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', marginTop: '2px' },
    onlineDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' },
    backBtn: { padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', backgroundColor: `${T.accent}20`, color: T.accent },
    logoutBtn: { padding: '8px 14px', borderRadius: '20px', border: `1px solid ${T.accent}30`, cursor: 'pointer', fontWeight: '700', fontSize: '12px', background: 'transparent', color: T.text, opacity: 0.8 },
    chatBox: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    getBubble: (isMe) => ({
        padding: '12px 16px',
        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        backgroundColor: isMe ? T.accent : `${T.accent}15`,
        color: isMe ? T.bg : T.text,
        maxWidth: '80%',
        fontSize: '15px',
        position: 'relative',
        boxShadow: isMe ? `0 4px 15px ${T.accent}40` : 'none',
        border: isMe ? 'none' : `1px solid ${T.accent}20`,
        marginBottom: '12px'
    }),
    tickStyle: (isRead) => ({ fontSize: '14px', color: isRead ? '#3b82f6' : '#94a3b8', marginLeft: '5px' }),
    inputArea: { display: 'flex', padding: '12px 16px', alignItems: 'center', gap: '10px', backgroundColor: `${T.bg}EE`, backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.accent}20` },
    inputField: { flex: 1, padding: '14px 20px', borderRadius: '30px', border: `1px solid ${T.accent}30`, backgroundColor: `${T.accent}05`, color: T.text, outline: 'none' },
    sendBtn: { padding: '12px 20px', borderRadius: '25px', border: 'none', backgroundColor: T.accent, color: T.bg, fontWeight: '700', cursor: 'pointer' },
    ringingOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(20px)', color: '#fff' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
    modalBox: { backgroundColor: T.bg, padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', border: `1px solid ${T.accent}40` },
    roomCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', margin: '6px 0', borderRadius: '16px', border: `1px solid ${T.accent}20`, backgroundColor: T.bg, cursor: 'pointer', color: T.text },
    unreadBadge: { backgroundColor: '#ef4444', color: '#fff', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '700' }
  };

  // ─── INITIALIZATION ───
  useEffect(() => {
    async function init() {
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: blocks } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
        const blockedIds = blocks ? blocks.map(b => b.blocked_id) : [];
        setBlockedUsers(blockedIds);

        const { data } = await supabase.from('rooms').select('*');
        if (data) {
          const filteredRooms = data.filter(room => {
            if (room.is_private) {
              const otherUser = room.participants.find(p => p !== user.id);
              return !blockedIds.includes(otherUser);
            }
            return true;
          });
          setRooms(filteredRooms);
        }

        try {
          const token = await requestFirebaseToken();
          if (token) await supabase.from('profiles').upsert({ id: user.id, email: user.email, fcm_token: token });
        } catch (e) { console.log("Push token skip"); }
        
        try {
          const savedPriv = localStorage.getItem('sukoon_master_key');
          const savedPub = localStorage.getItem('sukoon_public_key');
          if (savedPriv && savedPub) {
            myMasterKeyRef.current = await SecurityKit.importPrivateKeyFromVault(savedPriv);
          } else {
            const kp = await SecurityKit.generateKeys();
            myMasterKeyRef.current = kp.privateKey;
            localStorage.setItem('sukoon_master_key', await SecurityKit.exportPrivateKeyToVault(kp.privateKey));
            localStorage.setItem('sukoon_public_key', await SecurityKit.exportPublicKey(kp.publicKey));
          }
        } catch (e) { console.error("E2EE init failed", e); }
        setIsVaultUnlocked(true);
      }
      setLoading(false);
    }
    init();
  }, []);

  // ─── HELPERS ───
  const formatTime = (ds) => ds ? new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
  
  const getRoomDisplayName = (room) => {
    if (!room) return "Chat";
    if (room.is_private && room.name.includes(':::')) {
      const [a, b] = room.name.split(':::');
      return `✨ ${currentUser?.email === b ? a.split('@')[0] : b.split('@')[0]}`;
    }
    return `👥 ${room.name}`;
  };

  const handleBackOrHome = () => {
    if (isInCall) endCall();
    activeRoom ? setActiveRoom(null) : setTab('home');
  };

  const handleSearch = async () => {
    if (!currentUser || searchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${searchTerm}%`).neq('id', currentUser.id);
    setSearchResults(data?.filter(u => !blockedUsers.includes(u.id)) || []);
  };

  const startPrivateChat = async (friend) => {
    const { data: existing } = await supabase.from('rooms').select('*').eq('is_private', true).contains('participants', [currentUser.id, friend.id]);
    if (existing?.length > 0) setActiveRoom(existing[0]);
    else {
      const { data: nr } = await supabase.from('rooms').insert([{ name: `${currentUser.email}:::${friend.email}`, is_private: true, participants: [currentUser.id, friend.id] }]).select();
      if (nr) { setRooms(p => [...p, nr[0]]); setActiveRoom(nr[0]); }
    }
    setSearchTerm(""); setSearchResults([]);
  };

  const typingUsers = Object.values(presentUsers).filter(u => u.is_typing && u.id !== currentUser?.id);

  if (loading) return <div style={{padding: '50px', textAlign:'center', color: T.text}}>Loading JSukoon...</div>;

  return (
    <div style={s.container}>
      {/* 🌟 AUDIO HARDWARE (Kept safe) */}
      <video id="sukoon-remote-audio" autoPlay playsInline style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0 }} />

      {/* 🌟 RINGING SCREEN */}
      {showAudioBridge && (
        <div style={s.ringingOverlay}>
          <div style={{fontSize: '80px', marginBottom: '20px'}}>📞</div>
          <h2 style={{fontSize: '24px', fontWeight: '700'}}>{hi ? "इनकमिंग कॉल" : "Incoming Call"}</h2>
          <p style={{opacity: 0.6, marginBottom: '40px'}}>{getRoomDisplayName(activeRoom)}</p>
          <div style={{display: 'flex', gap: '20px'}}>
             <button style={{padding: '15px 40px', borderRadius: '30px', background: '#4ade80', border:'none', fontWeight:'700', cursor:'pointer'}} onClick={handleStartAudio}>Accept</button>
             <button style={{padding: '15px 40px', borderRadius: '30px', background: '#ef4444', border:'none', color:'#fff', fontWeight:'700', cursor:'pointer'}} onClick={endCall}>Decline</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={handleBackOrHome}>◀</button>
        <div style={s.headerTitleBox}>
          {activeRoom ? (
            <>
              <div style={s.headerTitle}>{getRoomDisplayName(activeRoom)}</div>
              <div style={s.statusContainer}>
                {Object.keys(presentUsers).length > 1 ? (
                  <><span style={s.onlineDot} /> {hi ? "ऑनलाइन" : "Online"}</>
                ) : (
                  <span style={{opacity: 0.5}}>{hi ? "ऑफलाइन" : "Offline"}</span>
                )}
              </div>
            </>
          ) : (
            <div style={s.headerTitleHome}>SUKOON CHAT</div>
          )}
        </div>
        {activeRoom && <button style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer'}} onClick={startCall}>📞</button>}
      </div>

      {/* Main Content Area */}
      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          <>
            <button style={{...s.roomCard, border:`2px dashed ${T.accent}`, justifyContent:'center'}} onClick={() => setShowGroupModal(true)}>👥 New Group</button>
            <div style={{display:'flex', gap:'10px', margin:'15px 0'}}>
              <input style={s.inputField} placeholder="Find friend..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <button style={s.sendBtn} onClick={handleSearch}>🔍</button>
            </div>
            {searchResults.map(u => (
              <div key={u.id} onClick={() => startPrivateChat(u)} style={{...s.roomCard, borderStyle:'dashed'}}>✨ Start chat with {u.email.split('@')[0]}</div>
            ))}
            {rooms.map(r => (
              <div key={r.id} style={s.roomCard} onClick={() => setActiveRoom(r)}>
                <span>{getRoomDisplayName(r)}</span>
                {unreadCounts[r.id] > 0 && <span style={s.unreadBadge}>{unreadCounts[r.id]}</span>}
              </div>
            ))}
          </>
        ) : (
          <>
            {messages.map((m) => {
              const isMe = m.user_id === currentUser?.id;
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={s.getBubble(isMe)}>
                    {m.decrypted_content || "..."}
                    {isMe && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems:'center', marginTop: '4px' }}>
                        <span style={{fontSize: '10px', opacity: 0.5, marginRight: '5px'}}>{formatTime(m.created_at)}</span>
                        <span style={s.tickStyle(m.is_read)}>{m.is_read ? '✓✓' : '✓✓'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {activeRoom && typingUsers.length > 0 && (
        <div style={{padding:'5px 20px', fontSize:'12px', opacity:0.6, fontStyle:'italic'}}>{typingUsers[0].email.split('@')[0]} typing...</div>
      )}

      {/* Message Input */}
      {activeRoom && (
        <div style={s.inputArea}>
          <input style={s.inputField} value={messageText} onChange={handleTyping} placeholder="Type secure message..." onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
          <button style={s.sendBtn} onClick={handleSendMessage}>➤</button>
        </div>
      )}
    </div>
  );
}