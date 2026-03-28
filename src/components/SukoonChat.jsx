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

  // ─── INITIALIZATION (User, Keys, Blocks) ───
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
            await supabase.from('profiles').update({ public_key: savedPub }).eq('id', user.id);
          } else {
            const kp = await SecurityKit.generateKeys();
            myMasterKeyRef.current = kp.privateKey;
            const priv = await SecurityKit.exportPrivateKeyToVault(kp.privateKey);
            const pub = await SecurityKit.exportPublicKey(kp.publicKey);
            localStorage.setItem('sukoon_master_key', priv);
            localStorage.setItem('sukoon_public_key', pub);
            await supabase.from('profiles').update({ public_key: pub }).eq('id', user.id);
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

      if (activeRoomRef.current?.id === room.id) {
        if (!isInCall) joinCall();
      } else {
        autoJoinRef.current = true;
        setActiveRoom(room);
      }
    }
  }, [location.state, blockedUsers]);

  // ─── GLOBAL UNREAD SCANNERS ───
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from('messages').select('room_id').eq('is_read', false).neq('user_id', currentUser.id);
      const counts = {};
      if (data) { data.forEach(m => { counts[m.room_id] = (counts[m.room_id] || 0) + 1; }); }
      setUnreadCounts(counts);
    })();

    const rc = supabase.channel('live-rooms-radar')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (p) => {
        if (p.new.participants?.includes(currentUser.id)) {
          if (p.new.is_private) {
            const otherUser = p.new.participants.find(u => u !== currentUser.id);
            if (blockedUsers.includes(otherUser)) return;
          }
          setRooms(prev => [...prev, p.new]);
        }
      }).subscribe();

    const mc = supabase.channel('global-message-scanner')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p) => {
        if (p.new.user_id !== currentUser.id && activeRoomRef.current?.id !== p.new.room_id && !blockedUsers.includes(p.new.user_id)) {
          setUnreadCounts(prev => ({ ...prev, [p.new.room_id]: (prev[p.new.room_id] || 0) + 1 }));
        }
      }).subscribe();

    return () => { supabase.removeChannel(rc); supabase.removeChannel(mc); };
  }, [currentUser?.id, blockedUsers]);

  // ─── AUTO SCROLL ───
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current)
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeRoom]);

  // ─── HELPERS & ACTIONS ───
  const formatTime = (ds) => ds ? new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
  
  const getRoomDisplayName = (room) => {
    if (room.is_private && room.name.includes(':::')) {
      const [a, b] = room.name.split(':::');
      return `✨ ${currentUser?.email === b ? a.split('@')[0] : b.split('@')[0]}`;
    }
    return `👥 ${room.name}`;
  };

  const handleBackOrHome = () => {
    setIsAutoScrolling(false);
    if (isInCall) endCall();
    if (activeRoom) setUnreadCounts(p => ({ ...p, [activeRoom.id]: 0 }));
    activeRoom ? setActiveRoom(null) : setTab('home');
  };

  const handleLogout = async () => {
    if (!window.confirm(hi ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?")) return;
    await supabase.auth.signOut(); setTab('home'); window.location.reload();
  };

  // ─── CHAT MANAGEMENT ───
  const handleSearch = async () => {
    if (!currentUser || searchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${searchTerm}%`).neq('id', currentUser.id);
    const filteredResults = data ? data.filter(u => !blockedUsers.includes(u.id)) : [];
    setSearchResults(filteredResults);
  };

  const startPrivateChat = async (friend) => {
    const { data: existing } = await supabase.from('rooms').select('*').eq('is_private', true).contains('participants', [currentUser.id, friend.id]);
    if (existing?.length > 0) { setActiveRoom(existing[0]); }
    else {
      const { data: nr } = await supabase.from('rooms').insert([{ name: `${currentUser.email}:::${friend.email}`, is_private: true, participants: [currentUser.id, friend.id] }]).select();
      if (nr) { setRooms(p => [...p, nr[0]]); setActiveRoom(nr[0]); }
    }
    setSearchTerm(""); setSearchResults([]);
  };

  const searchForGroup = async () => {
    if (!currentUser || groupSearchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${groupSearchTerm}%`).neq('id', currentUser.id);
    const filteredResults = data ? data.filter(u => !blockedUsers.includes(u.id)) : [];
    setGroupSearchResults(filteredResults);
  };

  const addFriendToGroupList = (f) => {
    if (!selectedFriends.find(x => x.id === f.id)) setSelectedFriends([...selectedFriends, f]);
    setGroupSearchTerm(""); setGroupSearchResults([]);
  };

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return alert(hi ? "एक नाम और मित्र की आवश्यकता है!" : "Need a group name and at least 1 friend!");
    const { data: nr } = await supabase.from('rooms').insert([{ name: groupName, is_private: false, participants: [currentUser.id, ...selectedFriends.map(f => f.id)] }]).select();
    if (nr) { setRooms(p => [...p, nr[0]]); setShowGroupModal(false); setGroupName(""); setSelectedFriends([]); setActiveRoom(nr[0]); }
  };

  // ─── SAFETY ACTIONS ───
  const handleBlockUser = async () => {
    if (!activeRoom || !activeRoom.is_private) return;
    if (!window.confirm(hi ? "क्या आप वाकई इस उपयोगकर्ता को ब्लॉक करना चाहते हैं?" : "Are you sure you want to block this user? They will no longer be able to message or call you.")) return;
    
    const friendId = activeRoom.participants.find(id => id !== currentUser.id);
    await supabase.from('blocks').insert({ blocker_id: currentUser.id, blocked_id: friendId });
    
    setBlockedUsers(prev => [...prev, friendId]);
    setRooms(prev => prev.filter(r => r.id !== activeRoom.id));
    setActiveRoom(null);
    setShowSafetyModal(false);
    alert(hi ? "उपयोगकर्ता को ब्लॉक कर दिया गया है।" : "User has been blocked.");
  };

  const handleReportUser = async () => {
    if (!activeRoom || !reportReason.trim()) return alert(hi ? "कृपया कारण दर्ज करें।" : "Please enter a reason.");
    const friendId = activeRoom.is_private ? activeRoom.participants.find(id => id !== currentUser.id) : null;
    await supabase.from('reports').insert({ reporter_id: currentUser.id, reported_id: friendId, reason: reportReason });
    setShowSafetyModal(false);
    setReportReason("");
    alert(hi ? "रिपोर्ट सुरक्षित रूप से दर्ज कर ली गई है।" : "Report submitted securely.");
  };

  const openManageBlocks = async () => {
    if (blockedUsers.length > 0) {
      const { data } = await supabase.from('profiles').select('*').in('id', blockedUsers);
      setBlockedProfiles(data || []);
    } else {
      setBlockedProfiles([]);
    }
    setShowManageBlocks(true);
  };

  const handleUnblock = async (targetId) => {
    if (!window.confirm(hi ? "क्या आप इस उपयोगकर्ता को अनब्लॉक करना चाहते हैं?" : "Are you sure you want to unblock this user?")) return;
    
    await supabase.from('blocks').delete().eq('blocker_id', currentUser.id).eq('blocked_id', targetId);
    const newBlockedList = blockedUsers.filter(id => id !== targetId);
    setBlockedUsers(newBlockedList);
    setBlockedProfiles(prev => prev.filter(u => u.id !== targetId));
    
    const { data } = await supabase.from('rooms').select('*');
    if (data) {
      const filteredRooms = data.filter(room => {
        if (room.is_private) {
          const otherUser = room.participants.find(p => p !== currentUser.id);
          return !newBlockedList.includes(otherUser);
        }
        return true;
      });
      setRooms(filteredRooms);
    }
    alert(hi ? "उपयोगकर्ता को अनब्लॉक कर दिया गया है।" : "User has been unblocked.");
  };

  const typingUsers = Object.values(presentUsers).filter(u => u.is_typing && !blockedUsers.includes(u.id));

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={s.container}>
      <video id="sukoon-remote-audio" autoPlay playsInline 
        style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }} />

      {/* 🌟 SECURITY DESK MODAL */}
      {showManageBlocks && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h3 style={{ margin: '0 0 15px 0', color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
              🛡️ {hi ? "ब्लॉक किए गए उपयोगकर्ता" : "Manage Blocked Users"}
            </h3>
            
            {blockedProfiles.length === 0 ? (
              <p style={{ color: T.textSoft, fontSize: '14px', marginBottom: '20px' }}>
                {hi ? "कोई उपयोगकर्ता ब्लॉक नहीं है।" : "No users are currently blocked."}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                {blockedProfiles.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: `${T.accent}05`, borderRadius: '12px', border: `1px solid ${T.accent}20` }}>
                    <span style={{ fontSize: '14px', color: T.text }}>{u.email.split('@')[0]}</span>
                    <button 
                      style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }} 
                      onClick={() => handleUnblock(u.id)}
                    >
                      {hi ? "अनब्लॉक" : "Unblock"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button style={{ ...s.backBtn, width: '100%' }} onClick={() => setShowManageBlocks(false)}>
              {hi ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Safety & Moderation Modal */}
      {showSafetyModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h3 style={{ margin: '0 0 15px 0', color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
              {hi ? "सुरक्षा और गोपनीयता" : "Safety & Privacy"}
            </h3>
            <p style={{ fontSize: '14px', color: T.textSoft, marginBottom: '20px' }}>
              {hi ? "JSukoon एक सुरक्षित स्थान है। यदि कोई आपको परेशान कर रहा है, तो आप उन्हें रोक सकते हैं या रिपोर्ट कर सकते हैं।" : "JSukoon is a safe space. If someone is bothering you, you can block or report them."}
            </p>
            <input style={{ ...s.searchInput, width: '100%', boxSizing: 'border-box', marginBottom: '15px' }}
              placeholder={hi ? "रिपोर्ट का कारण..." : "Reason for reporting..."} 
              value={reportReason} onChange={e => setReportReason(e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{ ...s.actionBtn, background: '#ef4444', color: '#fff' }} onClick={handleReportUser}>
                🚨 {hi ? "रिपोर्ट करें" : "Report User"}
              </button>
              <button style={{ ...s.actionBtn, background: 'transparent', border: `1px solid #ef4444`, color: '#ef4444' }} onClick={handleBlockUser}>
                🚫 {hi ? "ब्लॉक करें" : "Block User"}
              </button>
              <button style={{ ...s.backBtn, alignSelf: 'center', marginTop: '10px' }} onClick={() => setShowSafetyModal(false)}>
                {hi ? "रद्द करें" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h3 style={{ margin: '0 0 15px 0', color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
              {hi ? "नया ग्रुप बनाएं" : "Create New Group"}
            </h3>
            <input style={{ ...s.searchInput, width: '100%', boxSizing: 'border-box', marginBottom: '10px' }}
              placeholder={hi ? "ग्रुप का नाम..." : "Group Name..."} value={groupName} onChange={e => setGroupName(e.target.value)} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input style={{ ...s.searchInput, flex: 1 }} placeholder={hi ? "मित्र खोजें..." : "Find friends..."}
                value={groupSearchTerm} onChange={e => setGroupSearchTerm(e.target.value)} />
              <button style={s.actionBtn} onClick={searchForGroup}>🔍</button>
            </div>
            {groupSearchResults.map(u => (
              <div key={u.id} onClick={() => addFriendToGroupList(u)} style={s.roomCardSearch}>+ Add {u.email.split('@')[0]}</div>
            ))}
            <div style={{ margin: '10px 0' }}>
              {selectedFriends.map(f => <span key={f.id} style={s.selectedFriendPill}>{f.email.split('@')[0]} ✕</span>)}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={{ ...s.actionBtn, flex: 1 }} onClick={createGroupChat}>{hi ? "बनाएं" : "Create"}</button>
              <button style={{ ...s.backBtn, flex: 1 }} onClick={() => setShowGroupModal(false)}>{hi ? "रद्द करें" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={handleBackOrHome}>
          {activeRoom ? "◀ Back" : "◀ Home"}
        </button>
        <div style={s.headerTitleBox}>
          {activeRoom ? (
            <>
              <div style={s.headerTitle}>{getRoomDisplayName(activeRoom)}</div>
              {Object.keys(presentUsers).length > 0 && (
                <div style={s.onlineStatus}>
                  <span style={s.greenDot} />
                  {Object.keys(presentUsers).length} {hi ? "ऑनलाइन" : "online"}
                </div>
              )}
            </>
          ) : (
            <div style={s.headerTitleHome}>SUKOON CHAT</div>
          )}
        </div>
        {activeRoom ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              style={isInCall ? s.callBtnDisabled : s.callBtn}
              onClick={startCall} disabled={isInCall}
              title={hi ? "वॉयस कॉल" : "Voice call"}
            >📞</button>
            {activeRoom.is_private && (
              <button style={s.shieldBtn} onClick={() => setShowSafetyModal(true)} title="Safety & Privacy">
                🛡️
              </button>
            )}
          </div>
        ) : (
          <button style={s.logoutBtn} onClick={handleLogout}>{hi ? "लॉग आउट" : "Logout"}</button>
        )}
      </div>

      {/* Active Call Banner */}
      {isInCall && (
        <div style={s.callBanner}>
          <span style={{ color: '#4ade80' }}>🟢 {hi ? "कॉल जारी है" : "Secure Call Active"}</span>
          <button onClick={endCall} style={s.declineBtn}>{hi ? "कॉल समाप्त करें" : "End Call"}</button>
        </div>
      )}

      {/* Audio Bridge Overlay */}
      {showAudioBridge && (
        <div style={s.bridgeOverlay}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>📞</div>
          <h2 style={{ color: '#fff', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif", fontWeight: '700' }}>
            {hi ? "कॉल कनेक्टेड" : "Call Connected"}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontSize: '14px', maxWidth: '260px' }}>
            {isIOS()
              ? (hi ? "iOS पर ऑडियो चालू करने के लिए नीचे टैप करें" : "Tap below to start audio on iOS")
              : (hi ? "ऑडियो चालू करने के लिए नीचे टैप करें" : "Tap below to activate audio")}
          </p>
          <button style={s.bridgeBtn} onClick={handleStartAudio}>
            🔊 {hi ? "आवाज शुरू करें" : "Start Audio"}
          </button>
        </div>
      )}

      {/* Main Chat Box */}
      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              <button style={{ ...s.bigGroupBtn, flex: 1, marginBottom: 0 }} onClick={() => setShowGroupModal(true)}>
                👥 {hi ? "नया ग्रुप" : "New Group"}
              </button>
              <button style={{ ...s.bigGroupBtn, flex: 1, marginBottom: 0, border: `1px solid ${T.accent}`, background: 'transparent' }} onClick={openManageBlocks}>
                🛡️ {hi ? "ब्लॉक सूची" : "Blocked Users"}
              </button>
            </div>
            
            <div style={s.searchRow}>
              <input style={s.searchInput}
                placeholder={hi ? "ईमेल से दोस्त खोजें..." : "Find friend by email..."}
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button style={s.actionBtn} onClick={handleSearch}>{hi ? "खोजें" : "Find"}</button>
            </div>
            {searchResults.map(u => (
              <div key={u.id} onClick={() => startPrivateChat(u)} style={s.roomCardSearch}>
                ✨ {hi ? "के साथ प्राइवेट चैट: " : "Start chat with "}{u.email}
              </div>
            ))}
            <div style={{ marginTop: '18px', fontWeight: '700', letterSpacing: '0.5px', opacity: 0.5, fontSize: '12px', textTransform: 'uppercase' }}>
              {hi ? "आपके चैट" : "Your Chats"}
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
            {messages.length === 0 ? (
              <div style={s.emptyRoom}>{hi ? "बात शुरू करें..." : "Start the conversation..."}</div>
            ) : (
              messages.map(m => {
                const isMe = m.user_id === currentUser?.id;
                const content = m._needs_decrypt ? "🔄 Decrypting..." : (m.decrypted_content || "🔒 [Encrypted]");
                return (
                  <div key={m.id} style={s.getBubbleWrapper(isMe)}>
                    {!isMe && <div style={s.senderName}>{m.user_email?.split('@')[0]}</div>}
                    <div style={s.getBubble(isMe)}>{content}</div>
                    <div style={s.statusBar}>
                      <div style={s.timestamp}>{formatTime(m.created_at)}</div>
                      {isMe && (
                        <>
                          <div style={s.readTick(m.is_read)}>{m.is_read ? '✓✓' : '✓'}</div>
                          <button onClick={() => handleDeleteMessage(m.id)} style={s.deleteBtn}>🗑️</button>
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

      {/* Auto Scroll Button */}
      {activeRoom && messages.length > 5 && (
        <button onClick={() => setIsAutoScrolling(!isAutoScrolling)} style={s.autoScrollBtn(isAutoScrolling)}>
          {isAutoScrolling ? "⏸️" : "⏬"}
        </button>
      )}

      {/* Typing Indicator */}
      {activeRoom && typingUsers.length > 0 && (
        <div style={{ fontSize: '12px', color: T.accent, padding: '0 18px 6px', fontStyle: 'italic', fontWeight: '700', flexShrink: 0 }}>
          {typingUsers.map(u => u.email?.split('@')[0]).join(', ')} {hi ? "टाइप कर रहे हैं..." : "is typing..."}
        </div>
      )}

      {/* Message Input */}
      {activeRoom && (
        <div style={s.inputArea}>
          <input style={s.inputField} value={messageText} onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={hi ? "संदेश लिखें..." : "Type a secure message..."} />
          <button style={s.sendBtn} onClick={handleSendMessage}>➤</button>
        </div>
      )}
    </div>
  );
}