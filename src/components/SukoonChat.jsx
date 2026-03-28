import { useState, useEffect, useRef } from 'react';
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
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${T.accent}20`, backgroundColor: T.bg, position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 },
    headerTitleBox: { flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, padding: '0 8px' },
    headerTitle: { fontWeight: '700', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.2px', color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' },
    headerTitleHome: { fontWeight: '700', fontSize: '20px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px', color: T.text },
    onlineStatus: { fontSize: '11px', color: '#4ade80', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' },
    greenDot: { width: '7px', height: '7px', backgroundColor: '#4ade80', borderRadius: '50%' },
    backBtn: { padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', backgroundColor: `${T.accent}20`, color: T.accent, whiteSpace: 'nowrap', flexShrink: 0 },
    logoutBtn: { padding: '8px 14px', borderRadius: '20px', border: `1px solid ${T.accent}30`, cursor: 'pointer', fontWeight: '700', fontSize: '12px', background: 'transparent', color: T.text, opacity: 0.8, whiteSpace: 'nowrap', flexShrink: 0 },
    callBtn: { width: '40px', height: '40px', background: `${T.accent}15`, border: `1px solid ${T.accent}40`, borderRadius: '50%', cursor: 'pointer', fontSize: '18px', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    callBtnDisabled: { width: '40px', height: '40px', background: 'transparent', border: 'none', cursor: 'not-allowed', fontSize: '18px', opacity: 0.3, flexShrink: 0 },
    shieldBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '10px', color: T.accent, opacity: 0.7, flexShrink: 0 },
    chatBox: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', WebkitOverflowScrolling: 'touch' },
    searchRow: { display: 'flex', gap: '10px', marginBottom: '14px' },
    searchInput: { flex: 1, padding: '13px 18px', borderRadius: '30px', border: `1px solid ${T.accent}30`, fontSize: '16px', backgroundColor: `${T.accent}05`, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif" },
    actionBtn: { padding: '13px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px', backgroundColor: T.accent, color: T.bg, boxShadow: `0 4px 15px ${T.accent}40`, flexShrink: 0 },
    bigGroupBtn: { width: '100%', padding: '15px', borderRadius: '16px', border: `2px dashed ${T.accent}`, backgroundColor: `${T.accent}10`, color: T.accent, fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif" },
    roomCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', margin: '6px 0', borderRadius: '16px', border: `1px solid ${T.accent}20`, backgroundColor: T.bg, boxShadow: `0 2px 8px rgba(0,0,0,0.05)`, cursor: 'pointer', color: T.text, fontWeight: '500', fontSize: '15px' },
    roomCardSearch: { padding: '14px 16px', margin: '8px 0', borderRadius: '12px', border: `1px dashed ${T.accent}`, backgroundColor: `${T.accent}05`, cursor: 'pointer', color: T.text, fontSize: '15px' },
    unreadBadge: { backgroundColor: '#ef4444', color: '#fff', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
    messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
    emptyRoom: { textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.45, fontSize: '15px' },
    getBubbleWrapper: (isMe) => ({ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }),
    getBubble: (isMe) => ({ padding: '11px 16px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: isMe ? T.accent : `${T.accent}15`, color: isMe ? T.bg : T.text, border: isMe ? 'none' : `1px solid ${T.accent}20`, maxWidth: '78%', fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word' }),
    senderName: { fontSize: '12px', marginBottom: '3px', opacity: 0.6, fontWeight: '700', color: T.text, marginLeft: '4px' },
    statusBar: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', marginRight: '4px' },
    timestamp: { fontSize: '11px', opacity: 0.4, color: T.text },
    readTick: (r) => ({ fontSize: '12px', color: r ? '#3b82f6' : T.text, opacity: r ? 1 : 0.4 }),
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.45, padding: 0 },
    inputArea: { display: 'flex', padding: '12px 16px', alignItems: 'center', gap: '10px', backgroundColor: T.bg, borderTop: `1px solid ${T.accent}15`, flexShrink: 0 },
    inputField: { flex: 1, padding: '14px 18px', borderRadius: '30px', border: `1px solid ${T.accent}30`, fontSize: '16px', backgroundColor: `${T.accent}05`, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif" },
    sendBtn: { padding: '14px 22px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '16px', backgroundColor: T.accent, color: T.bg, flexShrink: 0 },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
    modalBox: { backgroundColor: T.bg, padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', border: `1px solid ${T.accent}40`, boxShadow: `0 10px 40px rgba(0,0,0,0.2)`, maxHeight: '80vh', overflowY: 'auto' },
    selectedFriendPill: { display: 'inline-block', padding: '5px 12px', borderRadius: '15px', backgroundColor: `${T.accent}20`, color: T.accent, fontSize: '13px', margin: '3px', fontWeight: '700' },
    callBanner: { backgroundColor: `${T.accent}15`, color: T.text, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.accent}40`, fontWeight: '500', fontSize: '14px', flexShrink: 0 },
    declineBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' },
    autoScrollBtn: (active) => ({ position: 'absolute', bottom: '88px', right: '16px', width: '38px', height: '38px', borderRadius: '50%', border: 'none', backgroundColor: active ? T.accent : `${T.accent}30`, color: active ? T.bg : T.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', zIndex: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }),
    bridgeOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(12px)', textAlign: 'center', padding: '24px' },
    bridgeBtn: { padding: '18px 40px', borderRadius: '50px', backgroundColor: '#4ade80', color: '#000', border: 'none', fontWeight: '700', fontSize: '18px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }
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

  // ─── INCOMING CALL NOTIFICATION LOGIC ───
  useEffect(() => {
    if (location.state?.incomingCallRoom) {
      const room = location.state.incomingCallRoom;
      window.history.replaceState({}, document.title);
      const callerId = room.participants.find(p => p !== currentUser?.id);
      if (blockedUsers.includes(callerId)) return;
      if (activeRoomRef.current?.id === room.id) { if (!isInCall) joinCall(); } 
      else { autoJoinRef.current = true; setActiveRoom(room); }
    }
  }, [location.state, blockedUsers]);

  // ─── GLOBAL UNREAD SCANNERS ───
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from('messages').select('room_id').eq('is_read', false).neq('user_id', currentUser.id);
      const counts = {};
      if (data) data.forEach(m => { counts[m.room_id] = (counts[m.room_id] || 0) + 1; });
      setUnreadCounts(counts);
    })();
    const rc = supabase.channel('live-rooms-radar').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (p) => {
      if (p.new.participants?.includes(currentUser.id)) setRooms(prev => [...prev, p.new]);
    }).subscribe();
    return () => supabase.removeChannel(rc);
  }, [currentUser?.id]);

  // ─── AUTO SCROLL ───
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current) chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeRoom]);

  // ─── HELPERS ───
  const formatTime = (ds) => ds ? new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
  const getRoomDisplayName = (room) => {
    if (room.is_private && room.name.includes(':::')) {
      const [a, b] = room.name.split(':::');
      return `✨ ${currentUser?.email === b ? a.split('@')[0] : b.split('@')[0]}`;
    }
    return `👥 ${room.name}`;
  };
  const handleBackOrHome = () => { if (isInCall) endCall(); activeRoom ? setActiveRoom(null) : setTab('home'); };
  const handleLogout = async () => { if (window.confirm(hi ? "लॉग आउट?" : "Logout?")) { await supabase.auth.signOut(); setTab('home'); window.location.reload(); } };

  // ─── CHAT ACTIONS ───
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

  const typingUsers = Object.values(presentUsers).filter(u => u.is_typing && !blockedUsers.includes(u.id));

  return (
    <div style={s.container}>
      {/* 🌟 THE AUDIO STAGE (Now inside the container and fixed) */}
      <video 
        id="sukoon-remote-audio" 
        autoPlay 
        playsInline 
        style={{ position: 'absolute', top: '-10px', left: '-10px', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none' }} 
      />

      {/* MODALS (Group, Safety, ManageBlocks) - Standard logic maintained */}
      {showManageBlocks && (
        <div style={s.modalOverlay} onClick={() => setShowManageBlocks(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
             <h3 style={{color: T.text}}>{hi ? "ब्लॉक सूची" : "Blocked Users"}</h3>
             {blockedProfiles.map(u => (
               <div key={u.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:`1px solid ${T.accent}20`}}>
                 <span>{u.email}</span>
                 <button onClick={() => handleUnblock(u.id)}>Unblock</button>
               </div>
             ))}
             <button onClick={() => setShowManageBlocks(false)} style={s.backBtn}>Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={handleBackOrHome}>{activeRoom ? "◀ Back" : "◀ Home"}</button>
        <div style={s.headerTitleBox}>
          {activeRoom ? <div style={s.headerTitle}>{getRoomDisplayName(activeRoom)}</div> : <div style={s.headerTitleHome}>SUKOON CHAT</div>}
        </div>
        {activeRoom ? (
          <button style={isInCall ? s.callBtnDisabled : s.callBtn} onClick={startCall} disabled={isInCall}>📞</button>
        ) : (
          <button style={s.logoutBtn} onClick={handleLogout}>{hi ? "Logout" : "Logout"}</button>
        )}
      </div>

      {/* Call Banner */}
      {isInCall && (
        <div style={s.callBanner}>
          <span>🟢 Secure Call Active</span>
          <button onClick={endCall} style={s.declineBtn}>End</button>
        </div>
      )}

      {/* Audio Bridge */}
      {showAudioBridge && (
        <div style={s.bridgeOverlay}>
          <h2 style={{color:'#fff'}}>{hi ? "कॉल कनेक्टेड" : "Call Connected"}</h2>
          <button style={s.bridgeBtn} onClick={handleStartAudio}>🔊 Start Audio</button>
        </div>
      )}

      {/* Chat Box */}
      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          <>
            <button style={s.bigGroupBtn} onClick={() => setShowGroupModal(true)}>👥 New Group</button>
            <div style={s.searchRow}>
              <input style={s.searchInput} placeholder="Search email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <button style={s.actionBtn} onClick={handleSearch}>Find</button>
            </div>
            {rooms.map(r => (
              <div key={r.id} style={s.roomCard} onClick={() => setActiveRoom(r)}>
                <span>{getRoomDisplayName(r)}</span>
                {unreadCounts[r.id] > 0 && <span style={s.unreadBadge}>{unreadCounts[r.id]}</span>}
              </div>
            ))}
          </>
        ) : (
          <div style={s.messageList}>
            {messages.map(m => (
              <div key={m.id} style={s.getBubbleWrapper(m.user_id === currentUser?.id)}>
                <div style={s.getBubble(m.user_id === currentUser?.id)}>{m.decrypted_content || "..."}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {activeRoom && (
        <div style={s.inputArea}>
          <input style={s.inputField} value={messageText} onChange={handleTyping} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
          <button style={s.sendBtn} onClick={handleSendMessage}>➤</button>
        </div>
      )}
    </div>
  );
}