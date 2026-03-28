import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { requestFirebaseToken } from '../firebaseSetup';
import { SecurityKit } from '../utils/security';
import { useChatEngine } from '../hooks/useChatEngine';
import { useAudioEngine } from '../hooks/useAudioEngine';
import QRCode from 'react-qr-code';

// ─── iOS DETECTION ─────────────────────────────────────────────────────────
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ─── NEW: EXPIRY OPTIONS FOR DISAPPEARING MESSAGES ─────────────────────────
const EXPIRY_OPTIONS = [
  { label: 'Off',    value: null },
  { label: '1 min',  value: 60 },
  { label: '1 hr',   value: 3600 },
  { label: '24 hr',  value: 86400 },
  { label: '7 days', value: 604800 },
];

// ─── NEW: REFERRAL LINK ─────────────────────────────────────────────────────
const getReferralLink = (email) => {
  const code = btoa(email || '').replace(/=/g, '').slice(0, 8).toUpperCase();
  return `${window.location.origin}?ref=${code}`;
};

export default function SukoonChat({ T, lang, setTab }) {
  const location = useLocation();
  const hi = lang === "Hindi";

  // ─── UI STATE (unchanged from your working file) ──────────────────────────
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

  // ─── SAFETY & MODERATION STATE (unchanged from your working file) ─────────
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showManageBlocks, setShowManageBlocks] = useState(false);
  const [blockedProfiles, setBlockedProfiles] = useState([]);

  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // ─── NEW STATE ────────────────────────────────────────────────────────────
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  // Disappearing messages
  const [expirySeconds, setExpirySeconds] = useState(null);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  // Missed calls
  const [missedCalls, setMissedCalls] = useState([]);
  // Call quality
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [lastCallId, setLastCallId] = useState(null);
  // Referral
  const [showReferral, setShowReferral] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  // Offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const offlineQueueRef = useRef([]);
  // Incoming call ringing UI
  const [incomingCall, setIncomingCall] = useState(null);

  // ─── NEW: SECURITY VAULT STATE ───
  const [showVault, setShowVault] = useState(false);
  const [vaultMode, setVaultMode] = useState(null); // 'qr-show', 'qr-scan', 'pin-backup', 'pin-restore'
  const [pinInput, setPinInput] = useState("");

  // ─── HOOKS (unchanged signatures from your working file) ──────────────────
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

  // ─── STYLES (your exact styles, + new ones appended at the bottom) ─────────
  const s = {
    // ── Your original styles — untouched ──
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
    roomCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', margin: '6px 0', borderRadius: '16px', border: `2px solid ${T.accent}20`, backgroundColor: T.bg, boxShadow: `0 2px 8px rgba(0,0,0,0.08)`, cursor: 'pointer', color: T.text, fontWeight: '500', fontSize: '15px' },
    roomCardSearch: { padding: '14px 16px', margin: '8px 0', borderRadius: '12px', border: `1px dashed ${T.accent}`, backgroundColor: `${T.accent}05`, cursor: 'pointer', color: T.text, fontSize: '15px' },
    unreadBadge: { backgroundColor: '#ef4444', color: '#fff', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
    messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
    emptyRoom: { textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.45, fontSize: '15px' },
    getBubbleWrapper: (isMe) => ({ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }),
    // ── UPDATED: receiver bubble gets glassmorphism; sender stays solid ──
    getBubble: (isMe) => ({
      padding: '11px 16px',
      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      ...(isMe
        ? { backgroundColor: T.accent, color: T.bg }
        : {
            backgroundColor: 'rgba(255,255,255,0.09)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: T.text,
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
          }),
      maxWidth: '78%', fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word',
    }),
    senderName: { fontSize: '12px', marginBottom: '3px', opacity: 0.6, fontWeight: '700', color: T.text, marginLeft: '4px' },
    statusBar: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', marginRight: '4px' },
    timestamp: { fontSize: '11px', opacity: 0.4, color: T.text },
    readTick: (r) => ({ fontSize: '12px', color: r ? '#3b82f6' : T.text, opacity: r ? 1 : 0.4 }),
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.45, padding: 0 },
    // ── UPDATED: inputArea is now a column to accommodate toolbar ──
    inputArea: { display: 'flex', flexDirection: 'column', backgroundColor: T.bg, borderTop: `1px solid ${T.accent}15`, flexShrink: 0 },
    inputField: { flex: 1, padding: '14px 18px', borderRadius: '30px', border: `1px solid ${T.accent}30`, fontSize: '16px', backgroundColor: `${T.accent}05`, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif" },
    sendBtn: { padding: '14px 22px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '16px', backgroundColor: T.accent, color: T.bg, flexShrink: 0 },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
    modalBox: { backgroundColor: T.bg, padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', border: `1px solid ${T.accent}40`, boxShadow: `0 10px 40px rgba(0,0,0,0.2)`, maxHeight: '80vh', overflowY: 'auto' },
    selectedFriendPill: { display: 'inline-block', padding: '5px 12px', borderRadius: '15px', backgroundColor: `${T.accent}20`, color: T.accent, fontSize: '13px', margin: '3px', fontWeight: '700' },
    callBanner: { backgroundColor: `${T.accent}15`, color: T.text, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.accent}40`, fontWeight: '500', fontSize: '14px', flexShrink: 0 },
    declineBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' },
    autoScrollBtn: (active) => ({ position: 'absolute', bottom: '88px', right: '16px', width: '38px', height: '38px', borderRadius: '50%', border: 'none', backgroundColor: active ? T.accent : `${T.accent}30`, color: active ? T.bg : T.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', zIndex: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }),
    bridgeOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(12px)', textAlign: 'center', padding: '24px' },
    bridgeBtn: { padding: '18px 40px', borderRadius: '50px', backgroundColor: '#4ade80', color: '#000', border: 'none', fontWeight: '700', fontSize: '18px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

    // ── NEW styles only ──
    inputToolbar: { display: 'flex', alignItems: 'center', padding: '8px 16px 0', gap: '8px' },
    inputRow: { display: 'flex', padding: '8px 16px 12px', alignItems: 'center', gap: '10px' },
    toolbarChip: (active) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
      border: `1px solid ${active ? T.accent : T.accent + '30'}`,
      backgroundColor: active ? `${T.accent}18` : 'transparent',
      color: active ? T.accent : T.text, fontWeight: active ? '700' : '400',
      fontFamily: "'DM Sans', sans-serif",
    }),
    acceptBtn: { padding: '6px 16px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' },
    missedCallCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', margin: '4px 0', borderRadius: '14px', backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', fontSize: '14px' },
    offlineBanner: { backgroundColor: '#f59e0b', color: '#000', padding: '6px 16px', fontSize: '13px', fontWeight: '700', textAlign: 'center', flexShrink: 0 },
    ringingOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: 'linear-gradient(160deg,#0f2027,#203a43,#2c5364)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '32px' },
    avatarRing: { width: '96px', height: '96px', borderRadius: '50%', background: `${T.accent}25`, border: `3px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', marginBottom: '24px' },
    ringActionBtn: (color) => ({ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: color, border: 'none', cursor: 'pointer', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${color}80` }),
  };

  // ─── INITIALIZATION (your exact logic, unchanged) ─────────────────────────
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

        // NEW: check onboarding
        if (!localStorage.getItem('sukoon_onboarded')) setShowOnboarding(true);
      }
      setLoading(false);
    }
    init();
  }, []);

  // ─── INCOMING CALL NOTIFICATION LOGIC (your exact logic, unchanged) ───────
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

  // ─── GLOBAL UNREAD SCANNERS (your exact logic, unchanged) ────────────────
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

  // ─── AUTO SCROLL (your exact logic, unchanged) ────────────────────────────
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current) chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeRoom]);

  // ─── NEW: ONLINE / OFFLINE ───────────────────────────────────────────────
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      // Flush offline queue — just re-send, engine handles dedup via optimistic IDs
      offlineQueueRef.current.forEach(() => handleSendMessage());
      offlineQueueRef.current = [];
    };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [handleSendMessage]);

  // ─── NEW: MISSED CALLS WATCHER (BULLETPROOF VERSION) ───────────────────
  useEffect(() => {
    if (!currentUser) return;
    
    (async () => {
      // Step 1: Grab the missed calls safely (No fancy bridges)
      const { data: callsData } = await supabase
        .from('calls')
        .select('*')
        .eq('receiver_id', currentUser.id)
        .eq('status', 'missed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (callsData && callsData.length > 0) {
        // Step 2: Grab the emails for those specific callers
        const callerIds = callsData.map(c => c.caller_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', callerIds);

        // Step 3: Match the email to the call
        const finalCalls = callsData.map(call => {
          const profile = profilesData?.find(p => p.id === call.caller_id);
          return { ...call, caller: { email: profile?.email } };
        });
        
        setMissedCalls(finalCalls);
      }
    })();

    const mc = supabase.channel(`missed-${currentUser.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `receiver_id=eq.${currentUser.id}` }, (p) => {
        if (p.new.status === 'missed') setMissedCalls(prev => [p.new, ...prev.slice(0, 4)]);
      }).subscribe();
      
    return () => supabase.removeChannel(mc);
  }, [currentUser?.id]);

  // ─── NEW: INCOMING CALL RINGING UI ───────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const ring = supabase.channel('ring-ui')
      .on('broadcast', { event: 'global-ring' }, ({ payload }) => {
        if (payload.action === 'start' && payload.participants?.includes(currentUser.id) && payload.callerId !== currentUser.id) {
          if (blockedUsers.includes(payload.callerId)) return;
          setIncomingCall({ callerEmail: payload.callerEmail, callId: payload.callId, room: payload.roomDetails });
        }
        if (payload.action === 'cancel') setIncomingCall(null);
      }).subscribe();
    return () => supabase.removeChannel(ring);
  }, [currentUser?.id, blockedUsers]);

  // ─── HELPERS (your exact helpers, unchanged) ──────────────────────────────
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

  // ─── CHAT ACTIONS (your exact logic, unchanged) ───────────────────────────
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
  const handleUnblock = async (userId) => {
    await supabase.from('blocks').delete().eq('blocker_id', currentUser.id).eq('blocked_id', userId);
    setBlockedUsers(p => p.filter(id => id !== userId));
    setBlockedProfiles(p => p.filter(u => u.id !== userId));
  };

  // ─── NEW: ACTION HANDLERS ────────────────────────────────────────────────
  const handleAcceptCall = () => {
    if (!incomingCall?.room) return;
    const room = incomingCall.room;
    setIncomingCall(null);
    if (activeRoomRef.current?.id === room.id) { joinCall(); }
    else { autoJoinRef.current = true; setActiveRoom(room); }
  };
  const handleDeclineCall = async () => {
    if (incomingCall?.callId) await supabase.from('calls').update({ status: 'rejected' }).eq('id', incomingCall.callId);
    setIncomingCall(null);
  };
  const clearMissedCall = async (callId) => {
    await supabase.from('calls').update({ status: 'cleared' }).eq('id', callId);
    setMissedCalls(p => p.filter(c => c.id !== callId));
  };
  const handleEndCallWithFeedback = async () => {
    // capture call id before endCall clears it
    const { data } = await supabase.from('calls').select('id').eq('status', 'accepted').or(`caller_id.eq.${currentUser?.id},receiver_id.eq.${currentUser?.id}`).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data?.id) setLastCallId(data.id);
    await endCall();
    setShowQualityModal(true);
  };
  const handleCallQuality = async (rating) => {
    if (lastCallId) await supabase.from('calls').update({ quality_rating: rating }).eq('id', lastCallId);
    setShowQualityModal(false); setLastCallId(null);
  };
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(getReferralLink(currentUser?.email)).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2500);
    });
  };
  const finishOnboarding = () => {
    localStorage.setItem('sukoon_onboarded', '1');
    setShowOnboarding(false); setOnboardingStep(0);
  };

  // ─── SECURITY VAULT ACTIONS ───
  const handleCloudBackup = async () => {
    if (pinInput.length !== 6) return alert(hi ? "6 अंकों का पिन दर्ज करें" : "Enter a 6-digit PIN");
    try {
      const myKey = localStorage.getItem('sukoon_master_key');
      const lockedKey = await SecurityKit.lockKeyWithPin(myKey, pinInput, currentUser.email);
      await supabase.from('profiles').update({ encrypted_backup: lockedKey }).eq('id', currentUser.id);
      alert(hi ? "क्लाउड में सुरक्षित हो गया!" : "Securely backed up to cloud!");
      setShowVault(false); setPinInput("");
    } catch (e) { alert("Backup failed: " + e.message); }
  };

  const handleCloudRestore = async () => {
    if (pinInput.length !== 6) return alert(hi ? "6 अंकों का पिन दर्ज करें" : "Enter a 6-digit PIN");
    try {
      const { data } = await supabase.from('profiles').select('encrypted_backup').eq('id', currentUser.id).single();
      if (!data?.encrypted_backup) return alert(hi ? "कोई बैकअप नहीं मिला!" : "No backup found in cloud!");
      const unlockedKey = await SecurityKit.unlockKeyWithPin(data.encrypted_backup, pinInput, currentUser.email);
      localStorage.setItem('sukoon_master_key', unlockedKey);
      alert(hi ? "कुंजी बहाल हो गई! कृपया रिफ्रेश करें।" : "Key restored! Please refresh the app.");
      window.location.reload();
    } catch (e) { alert(hi ? "गलत पिन!" : "Incorrect PIN!"); }
  };

  const handleManualQRPaste = () => {
    const code = prompt(hi ? "पुराने फोन से कोड पेस्ट करें:" : "Paste code from old phone:");
    if (code && code.length > 50) {
      localStorage.setItem('sukoon_master_key', code);
      alert("Success! Refreshing..."); window.location.reload();
    }
  };

  // ─── DERIVED ─────────────────────────────────────────────────────────────
  const typingUsers = Object.values(presentUsers).filter(u => u.is_typing && !blockedUsers.includes(u.id));
  const onlineUsers = Object.values(presentUsers).filter(u => !blockedUsers.includes(u.id));
  const expiryLabel = EXPIRY_OPTIONS.find(o => o.value === expirySeconds)?.label || 'Off';

  // ─── ONBOARDING SLIDES ────────────────────────────────────────────────────
  const slides = [
    { icon: '🔐', title: hi ? 'आपके संदेश सुरक्षित हैं' : 'Your messages are encrypted', body: hi ? 'ECDH + AES-GCM एन्क्रिप्शन — यहाँ तक कि हम भी नहीं पढ़ सकते।' : 'Sukoon uses ECDH + AES-GCM end-to-end encryption. Even we cannot read your messages.' },
    { icon: '🫧', title: hi ? 'कमरे और बातचीत' : 'Rooms & Conversations', body: hi ? 'ईमेल से दोस्त खोजें। प्राइवेट चैट या ग्रुप रूम बनाएं।' : 'Search any friend by email. Start a private chat or create a group room instantly.' },
    { icon: '🌙', title: hi ? 'संदेश गायब हो सकते हैं' : 'Messages can disappear', body: hi ? '1 मिनट से 7 दिन तक — आपकी शर्तों पर।' : 'Set disappearing messages from 1 minute to 7 days. Your thoughts, your terms.' },
    { icon: '📞', title: hi ? 'सुरक्षित वॉयस कॉल' : 'Encrypted voice calls', body: hi ? 'E2E encrypted audio calls — ब्राउज़र या मोबाइल से।' : 'End-to-end encrypted voice calls directly from browser or mobile.' },
    // 🛑 NEW WARNING SLIDE
    { icon: '⚠️', title: hi ? 'महत्वपूर्ण चेतावनी' : 'CRITICAL WARNING', body: hi ? 'हम आपकी एन्क्रिप्शन कुंजी नहीं जानते। यदि आप कुंजी खो देते हैं, तो हम आपकी चैट वापस नहीं ला सकते। कृपया सुरक्षा वॉल्ट (🗝️) में जाकर अपना पिन या QR कोड सुरक्षित करें।' : 'We DO NOT have your encryption key. If you lose it, we cannot recover your chats. Please use the Security Vault (🗝️) to backup your key via PIN or QR code. We cannot help you recover lost data.' },
  ];

  // ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

  // NEW: Double-tick seen receipt
  const Ticks = ({ isRead }) => isRead
    ? <span style={{ display: 'inline-flex', gap: '0px' }}><span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '900' }}>✓</span><span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '900', marginLeft: '-5px' }}>✓</span></span>
    : <span style={{ color: T.text, opacity: 0.35, fontSize: '13px', fontWeight: '900' }}>✓</span>;

  // NEW: Expiry countdown badge
  const ExpiryBadge = ({ expiresAt }) => {
    const [label, setLabel] = useState('');
    useEffect(() => {
      if (!expiresAt) return;
      const tick = () => {
        const s = Math.max(0, Math.round((new Date(expiresAt) - Date.now()) / 1000));
        setLabel(s < 60 ? `${s}s` : s < 3600 ? `${Math.round(s / 60)}m` : `${Math.round(s / 3600)}h`);
      };
      tick(); const t = setInterval(tick, 5000); return () => clearInterval(t);
    }, [expiresAt]);
    if (!expiresAt || !label) return null;
    return <span style={{ fontSize: '10px', color: '#f59e0b', opacity: 0.8 }}>⏱{label}</span>;
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={s.container}>
      {/* THE AUDIO STAGE — your exact element */}
      <video
        id="sukoon-remote-audio"
        autoPlay
        playsInline
        style={{ position: 'absolute', top: '-10px', left: '-10px', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none' }}
      />

      {/* ── OVERLAY STACK ── */}

      {/* NEW: Incoming call ringing screen */}
      {incomingCall && (
        <div style={s.ringingOverlay}>
          <style>{`@keyframes sukoonPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.1)}50%{box-shadow:0 0 0 20px rgba(255,255,255,0)}}`}</style>
          <div style={{ ...s.avatarRing, animation: 'sukoonPulse 2s infinite' }}>
            {incomingCall.callerEmail?.charAt(0).toUpperCase()}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            {hi ? 'आ रही कॉल' : 'Incoming Call'}
          </div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
            {incomingCall.callerEmail?.split('@')[0]}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '52px' }}>
            {hi ? 'सुकून एन्क्रिप्टेड कॉल' : 'Sukoon encrypted call'}
          </div>
          <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button style={s.ringActionBtn('#ef4444')} onClick={handleDeclineCall}>📵</button>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{hi ? 'अस्वीकार' : 'Decline'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button style={s.ringActionBtn('#4ade80')} onClick={handleAcceptCall}>📞</button>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{hi ? 'स्वीकार' : 'Accept'}</span>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Onboarding */}
      {showOnboarding && !incomingCall && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalBox, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '52px', marginBottom: '14px' }}>{slides[onboardingStep].icon}</div>
            <div style={{ fontWeight: '700', fontSize: '19px', color: T.text, marginBottom: '10px', fontFamily: "'Cormorant Garamond', serif" }}>
              {slides[onboardingStep].title}
            </div>
            <div style={{ fontSize: '14px', color: T.text, opacity: 0.65, lineHeight: '1.65', marginBottom: '28px' }}>
              {slides[onboardingStep].body}
            </div>
            {/* dot indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
              {slides.map((_, i) => (
                <div key={i} style={{ height: '6px', width: i === onboardingStep ? '20px' : '6px', borderRadius: '3px', backgroundColor: i === onboardingStep ? T.accent : `${T.accent}30`, transition: 'width 0.3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {onboardingStep > 0 && (
                <button onClick={() => setOnboardingStep(s => s - 1)} style={{ ...s.backBtn, flex: 1 }}>
                  {hi ? 'पीछे' : 'Back'}
                </button>
              )}
              <button onClick={() => onboardingStep < slides.length - 1 ? setOnboardingStep(s => s + 1) : finishOnboarding()}
                style={{ ...s.actionBtn, flex: 1, borderRadius: '14px', boxShadow: 'none', padding: '14px' }}>
                {onboardingStep < slides.length - 1 ? (hi ? 'आगे' : 'Next') : (hi ? 'शुरू करें 🚀' : 'Get Started 🚀')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Call quality feedback */}
      {showQualityModal && !incomingCall && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalBox, textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📞</div>
            <div style={{ fontWeight: '700', fontSize: '17px', color: T.text, marginBottom: '6px' }}>
              {hi ? 'कॉल कैसी रही?' : 'How was the call quality?'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.5, marginBottom: '22px' }}>
              {hi ? 'आपकी राय हमें बेहतर बनाती है' : 'Your feedback helps us improve'}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              {[{ e: '😞', v: 1, l: hi ? 'खराब' : 'Poor' }, { e: '😐', v: 2, l: hi ? 'ठीक' : 'OK' }, { e: '😊', v: 3, l: hi ? 'अच्छी' : 'Good' }].map(({ e, v, l }) => (
                <button key={v} onClick={() => handleCallQuality(v)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '76px', padding: '14px 0', borderRadius: '16px', border: `1px solid ${T.accent}25`, backgroundColor: `${T.accent}06`, cursor: 'pointer', fontSize: '30px' }}>
                  {e}<span style={{ fontSize: '11px', color: T.text, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}>{l}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowQualityModal(false)} style={{ ...s.logoutBtn, fontSize: '13px' }}>{hi ? 'छोड़ें' : 'Skip'}</button>
          </div>
        </div>
      )}

      {/* NEW: Referral */}
      {showReferral && (
        <div style={s.modalOverlay} onClick={() => setShowReferral(false)}>
          <div style={{ ...s.modalBox, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>💌</div>
            <div style={{ fontWeight: '700', fontSize: '19px', color: T.text, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>
              {hi ? 'दोस्त को बुलाएं' : 'Invite a Friend'}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '18px', lineHeight: '1.6' }}>
              {hi ? 'सुकून पर सुरक्षित बात करने के लिए दोस्त को आमंत्रित करें।' : 'Invite a friend to have private, encrypted conversations on Sukoon.'}
            </div>
            <div style={{ padding: '13px 16px', borderRadius: '12px', backgroundColor: `${T.accent}08`, border: `1px solid ${T.accent}20`, fontSize: '12px', wordBreak: 'break-all', marginBottom: '16px', fontFamily: 'monospace', textAlign: 'left', color: T.text }}>
              {getReferralLink(currentUser?.email)}
            </div>
            <button onClick={handleCopyReferral} style={{ ...s.actionBtn, width: '100%', borderRadius: '14px', boxShadow: 'none', padding: '14px', marginBottom: '10px', fontSize: '15px', backgroundColor: referralCopied ? '#4ade80' : T.accent, color: referralCopied ? '#000' : T.bg, transition: 'background 0.3s' }}>
              {referralCopied ? (hi ? '✅ कॉपी हो गया!' : '✅ Copied!') : (hi ? '🔗 लिंक कॉपी करें' : '🔗 Copy Invite Link')}
            </button>
            <button onClick={() => setShowReferral(false)} style={s.logoutBtn}>{hi ? 'बंद करें' : 'Close'}</button>
          </div>
        </div>
      )}

      {/* NEW: Expiry picker */}
      {showExpiryPicker && (
        <div style={s.modalOverlay} onClick={() => setShowExpiryPicker(false)}>
          <div style={{ ...s.modalBox, padding: '20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: '700', fontSize: '16px', color: T.text, marginBottom: '14px' }}>
              ⏱ {hi ? 'संदेश कब गायब हो?' : 'Disappearing Messages'}
            </div>
            {EXPIRY_OPTIONS.map(opt => (
              <button key={String(opt.value)} onClick={() => { setExpirySeconds(opt.value); setShowExpiryPicker(false); }}
                style={{ display: 'block', width: '100%', padding: '13px 16px', marginBottom: '8px', borderRadius: '14px', cursor: 'pointer', border: `1px solid ${expirySeconds === opt.value ? T.accent : T.accent + '20'}`, backgroundColor: expirySeconds === opt.value ? `${T.accent}12` : 'transparent', color: T.text, fontWeight: expirySeconds === opt.value ? '700' : '400', fontSize: '15px', textAlign: 'left', fontFamily: "'DM Sans', sans-serif" }}>
                {expirySeconds === opt.value ? '✓ ' : ''}{opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Group modal — your exact logic */}
      {showGroupModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h3 style={{ color: T.text, marginBottom: '16px' }}>{hi ? 'नया ग्रुप बनाएं' : 'Create New Group'}</h3>
            <input style={{ ...s.searchInput, width: '100%', boxSizing: 'border-box', marginBottom: '10px' }}
              placeholder={hi ? 'ग्रुप का नाम...' : 'Group Name...'} value={groupName} onChange={e => setGroupName(e.target.value)} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input style={{ ...s.searchInput, flex: 1 }} placeholder={hi ? 'मित्र खोजें...' : 'Find friends...'} value={groupSearchTerm} onChange={e => setGroupSearchTerm(e.target.value)} />
              <button style={s.actionBtn} onClick={async () => {
                if (groupSearchTerm.length < 3) return;
                const { data } = await supabase.from('profiles').select('*').ilike('email', `%${groupSearchTerm}%`).neq('id', currentUser.id);
                setGroupSearchResults(data || []);
              }}>🔍</button>
            </div>
            {groupSearchResults.map(u => (
              <div key={u.id} onClick={() => { if (!selectedFriends.find(f => f.id === u.id)) setSelectedFriends(p => [...p, u]); setGroupSearchTerm(''); setGroupSearchResults([]); }} style={s.roomCardSearch}>+ {u.email.split('@')[0]}</div>
            ))}
            <div style={{ margin: '10px 0' }}>
              {selectedFriends.map(f => <span key={f.id} style={s.selectedFriendPill}>{f.email.split('@')[0]} ✕</span>)}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={{ ...s.actionBtn, flex: 1, borderRadius: '14px', boxShadow: 'none' }} onClick={async () => {
                if (!groupName.trim() || selectedFriends.length === 0) return alert(hi ? 'नाम और एक मित्र जरूरी है' : 'Need a name and at least 1 friend');
                const { data: nr } = await supabase.from('rooms').insert([{ name: groupName, is_private: false, participants: [currentUser.id, ...selectedFriends.map(f => f.id)] }]).select();
                if (nr) { setRooms(p => [...p, nr[0]]); setShowGroupModal(false); setGroupName(''); setSelectedFriends([]); setActiveRoom(nr[0]); }
              }}>{hi ? 'बनाएं' : 'Create'}</button>
              <button style={{ ...s.backBtn, flex: 1 }} onClick={() => setShowGroupModal(false)}>{hi ? 'रद्द करें' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: SECURITY VAULT MODAL */}
      {showVault && (
        <div style={s.modalOverlay} onClick={() => { setShowVault(false); setVaultMode(null); setPinInput(""); }}>
          <div style={{ ...s.modalBox, textAlign: 'center', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗝️</div>
            <h3 style={{ margin: '0 0 15px 0', color: T.text, fontFamily: "'DM Sans', sans-serif" }}>{hi ? "सुरक्षा वॉल्ट" : "Security Vault"}</h3>

            {/* 🛑 NEW RED WARNING BOX */}
            {!vaultMode && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: T.text, lineHeight: '1.5' }}>
                <strong style={{ color: '#ef4444' }}>{hi ? 'महत्वपूर्ण: ' : 'CRITICAL: '}</strong>
                {hi ? 'हम आपकी चैट नहीं पढ़ सकते और खोया हुआ डेटा वापस नहीं ला सकते। अपना पिन याद रखें या QR कोड सुरक्षित रखें, अन्यथा आपकी चैट हमेशा के लिए नष्ट हो जाएगी।' : 'We cannot read your chats or recover lost data. Memorize your PIN or save your QR code, otherwise your chats will be lost forever.'}
              </div>
            )}

            {!vaultMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={s.actionBtn} onClick={() => setVaultMode('pin-backup')}>{hi ? "क्लाउड पिन बैकअप बनाएं" : "Create Cloud PIN Backup"}</button>
                <button style={{ ...s.actionBtn, backgroundColor: `${T.accent}20`, color: T.accent }} onClick={() => setVaultMode('pin-restore')}>{hi ? "पिन से कुंजी बहाल करें" : "Restore Key from PIN"}</button>
                <button style={{ ...s.actionBtn, backgroundColor: `${T.accent}10`, color: T.accent, border: `1px dashed ${T.accent}50` }} onClick={() => setVaultMode('qr-show')}>{hi ? "QR कोड दिखाएं (पुराना फोन)" : "Show QR Code (Old Phone)"}</button>
                <button style={{ ...s.actionBtn, backgroundColor: `${T.accent}10`, color: T.accent, border: `1px dashed ${T.accent}50` }} onClick={handleManualQRPaste}>{hi ? "मैनुअल पेस्ट (नया फोन)" : "Manual Paste (New Phone)"}</button>
                <button style={{ ...s.logoutBtn, marginTop: '10px' }} onClick={() => setShowVault(false)}>{hi ? "रद्द करें" : "Cancel"}</button>
              </div>
            ) : vaultMode === 'pin-backup' || vaultMode === 'pin-restore' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '14px', color: T.text, opacity: 0.8, marginBottom: '10px', lineHeight: '1.5' }}>
                  {vaultMode === 'pin-backup'
                    ? (hi ? "अपनी चैट सुरक्षित करने के लिए 6 अंकों का पिन बनाएं। इसे न भूलें!" : "Create a 6-digit PIN to secure your chats. Do not forget it!")
                    : (hi ? "अपनी चैट वापस लाने के लिए अपना 6 अंकों का पिन डालें।" : "Enter your 6-digit PIN to restore your chats.")}
                </p>
                <input
                  type="password"
                  maxLength="6"
                  style={{ ...s.searchInput, textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                  placeholder="••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <button
                  style={{ ...s.actionBtn, opacity: pinInput.length === 6 ? 1 : 0.5 }}
                  onClick={vaultMode === 'pin-backup' ? handleCloudBackup : handleCloudRestore}
                  disabled={pinInput.length !== 6}
                >
                  {vaultMode === 'pin-backup' ? (hi ? "बैकअप बनाएं" : "Backup to Cloud") : (hi ? "बहाल करें" : "Restore Chats")}
                </button>
                <button style={{ ...s.logoutBtn, marginTop: '5px' }} onClick={() => { setVaultMode(null); setPinInput(""); }}>{hi ? "पीछे" : "Back"}</button>
              </div>
            ) : vaultMode === 'qr-show' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <p style={{ fontSize: '14px', color: T.text, opacity: 0.8 }}>{hi ? "अपने नए फोन पर स्कैनर खोलें या कोड कॉपी करें:" : "Open scanner on new phone or copy code:"}</p>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px' }}>
                  <QRCode value={localStorage.getItem('sukoon_master_key') || ''} size={150} />
                </div>
                <button style={{ ...s.actionBtn, width: '100%' }} onClick={() => {
                  navigator.clipboard.writeText(localStorage.getItem('sukoon_master_key'));
                  alert("Copied!");
                }}>
                  {hi ? "कोड कॉपी करें" : "Copy Code"}
                </button>
                <button style={{ ...s.logoutBtn, width: '100%' }} onClick={() => setVaultMode(null)}>{hi ? "पीछे" : "Back"}</button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Manage blocks — your exact modal */}
      {showManageBlocks && (
        <div style={s.modalOverlay} onClick={() => setShowManageBlocks(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: T.text }}>{hi ? "ब्लॉक सूची" : "Blocked Users"}</h3>
            {blockedProfiles.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: `1px solid ${T.accent}20` }}>
                <span>{u.email}</span>
                <button onClick={() => handleUnblock(u.id)}>Unblock</button>
              </div>
            ))}
            <button onClick={() => setShowManageBlocks(false)} style={s.backBtn}>Close</button>
          </div>
        </div>
      )}

      {/* ── STICKY HEADER (your exact structure) ── */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={handleBackOrHome}>{activeRoom ? "◀ Back" : "◀ Home"}</button>
        <div style={s.headerTitleBox}>
          {activeRoom ? (
            <>
              <div style={s.headerTitle}>{getRoomDisplayName(activeRoom)}</div>
              {/* NEW: online indicator */}
              {onlineUsers.length > 0 && (
                <div style={s.onlineStatus}>
                  <span style={{ ...s.greenDot, boxShadow: '0 0 5px #4ade80' }} />
                  {onlineUsers.length} {hi ? 'ऑनलाइन' : 'online'}
                </div>
              )}
            </>
          ) : (
            <div style={s.headerTitleHome}>SUKOON CHAT</div>
          )}
        </div>
        {activeRoom ? (
          <button style={isInCall ? s.callBtnDisabled : s.callBtn} onClick={startCall} disabled={isInCall}>📞</button>
        ) : (
          <button style={s.logoutBtn} onClick={handleLogout}>{hi ? "Logout" : "Logout"}</button>
        )}
      </div>

      {/* NEW: Offline banner */}
      {!isOnline && (
        <div style={s.offlineBanner}>📵 {hi ? 'ऑफलाइन — संदेश कतार में हैं' : 'Offline — messages will deliver when reconnected'}</div>
      )}

      {/* Call Banner — your exact structure, end button triggers quality modal */}
      {isInCall && (
        <div style={s.callBanner}>
          <span>🟢 {hi ? 'कॉल जारी है' : 'Secure Call Active'}</span>
          <button onClick={handleEndCallWithFeedback} style={s.declineBtn}>{hi ? 'समाप्त' : 'End'}</button>
        </div>
      )}

      {/* Audio Bridge — your exact structure */}
      {showAudioBridge && (
        <div style={s.bridgeOverlay}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>{hi ? "कॉल कनेक्टेड" : "Call Connected"}</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '28px' }}>
            {isIOS() ? (hi ? 'iOS पर ऑडियो चालू करें' : 'Tap to start audio on iOS') : (hi ? 'ऑडियो चालू करें' : 'Tap to activate audio')}
          </p>
          <button style={s.bridgeBtn} onClick={handleStartAudio}>🔊 {hi ? 'आवाज शुरू करें' : 'Start Audio'}</button>
        </div>
      )}

      {/* ── MAIN CHAT BOX ── */}
      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          /* ROOM LIST VIEW */
          <>
            {/* NEW: Missed calls */}
            {missedCalls.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', opacity: 0.45, textTransform: 'uppercase', marginBottom: '6px' }}>
                  {hi ? 'छूटी हुई कॉल' : 'Missed Calls'}
                </div>
                {missedCalls.map(c => (
                  <div key={c.id} style={s.missedCallCard}>
                    <div>
                      <span style={{ color: '#ef4444', marginRight: '6px' }}>📵</span>
                      <span style={{ fontWeight: '600' }}>{c.caller?.email?.split('@')[0] || 'Unknown'}</span>
                      <span style={{ fontSize: '11px', opacity: 0.45, marginLeft: '8px' }}>{formatTime(c.created_at)}</span>
                    </div>
                    <button onClick={() => clearMissedCall(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.35, fontSize: '15px' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Your exact room list UI */}
            <button style={{ ...s.bigGroupBtn, marginBottom: '14px' }} onClick={() => setShowGroupModal(true)}>👥 {hi ? 'नया ग्रुप बनाएं' : 'New Group'}</button>
            <div style={s.searchRow}>
              <input style={s.searchInput} placeholder={hi ? 'ईमेल से खोजें...' : 'Search email...'} value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button style={s.actionBtn} onClick={handleSearch}>{hi ? 'खोजें' : 'Find'}</button>
            </div>
            {searchResults.map(u => (
              <div key={u.id} onClick={() => startPrivateChat(u)} style={s.roomCardSearch}>
                ✨ {hi ? 'के साथ चैट: ' : 'Chat with '}{u.email}
              </div>
            ))}
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', opacity: 0.45, textTransform: 'uppercase', margin: '14px 0 8px' }}>
              {hi ? 'आपके चैट' : 'Your Chats'}
            </div>
            {rooms.map(r => (
              <div key={r.id} style={s.roomCard} onClick={() => setActiveRoom(r)}>
                <span>{getRoomDisplayName(r)}</span>
                {unreadCounts[r.id] > 0 && <span style={s.unreadBadge}>{unreadCounts[r.id]}</span>}
              </div>
            ))}

            {/* NEW: bottom action row */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => setShowReferral(true)} style={{ flex: 1, padding: '13px', borderRadius: '16px', border: `1px dashed ${T.accent}50`, backgroundColor: `${T.accent}06`, color: T.accent, fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                💌 {hi ? 'दोस्त बुलाएं' : 'Invite Friend'}
              </button>
              <button onClick={() => setShowVault(true)} style={{ padding: '13px 16px', borderRadius: '16px', border: `1px solid ${T.accent}20`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '18px', opacity: 0.55 }} title="Security Vault">🗝️</button>
              <button onClick={() => { setOnboardingStep(0); setShowOnboarding(true); }} style={{ padding: '13px 16px', borderRadius: '16px', border: `1px solid ${T.accent}20`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '18px', opacity: 0.55 }} title="Security info">🔐</button>
            </div>
          </>
        ) : (
          /* MESSAGE VIEW */
          <div style={s.messageList}>
            {/* NEW: typing indicator inside message list */}
            {typingUsers.length > 0 && (
              <div style={{ fontSize: '12px', color: T.accent, fontStyle: 'italic', fontWeight: '700', opacity: 0.75, paddingLeft: '4px', paddingBottom: '4px' }}>
                {typingUsers.map(u => u.email?.split('@')[0]).join(', ')} {hi ? 'टाइप कर रहे हैं...' : 'is typing...'}
              </div>
            )}

            {messages.length === 0 ? (
              <div style={s.emptyRoom}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔐</div>
                <div>{hi ? 'बात शुरू करें...' : 'Start the conversation...'}</div>
                <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.35 }}>{hi ? 'E2E एन्क्रिप्टेड' : 'End-to-end encrypted'}</div>
              </div>
            ) : (
              messages.map(m => {
                const isMe = m.user_id === currentUser?.id;
                // Skip expired messages client-side
                if (m.expires_at && new Date(m.expires_at) < new Date()) return null;
                return (
                  <div key={m.id} style={s.getBubbleWrapper(isMe)}>
                    {/* NEW: sender name for group chats */}
                    {!isMe && activeRoom && !activeRoom.is_private && (
                      <div style={s.senderName}>{m.user_email?.split('@')[0]}</div>
                    )}
                    {/* UPDATED: glassmorphism bubble */}
                    <div style={s.getBubble(isMe)}>
                      {m.decrypted_content || (m._needs_decrypt ? '🔄' : '...')}
                    </div>
                    {/* NEW: status bar with timestamp + expiry + ticks + delete */}
                    <div style={s.statusBar}>
                      <span style={s.timestamp}>{formatTime(m.created_at)}</span>
                      <ExpiryBadge expiresAt={m.expires_at} />
                      {isMe && <Ticks isRead={m.is_read} />}
                      {isMe && (
                        <button onClick={() => handleDeleteMessage(m.id)} style={s.deleteBtn}>🗑</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Auto scroll toggle */}
      {activeRoom && messages.length > 5 && (
        <button onClick={() => setIsAutoScrolling(p => !p)} style={s.autoScrollBtn(isAutoScrolling)}>
          {isAutoScrolling ? '⏸' : '⏬'}
        </button>
      )}

      {/* ── INPUT AREA — your exact structure + toolbar row above ── */}
      {activeRoom && (
        <div style={s.inputArea}>
          {/* NEW: toolbar */}
          <div style={s.inputToolbar}>
            <button style={s.toolbarChip(expirySeconds !== null)} onClick={() => setShowExpiryPicker(true)}>
              ⏱ {expiryLabel}
            </button>
            <button style={s.toolbarChip(false)} onClick={() => setShowReferral(true)}>
              💌 {hi ? 'आमंत्रित करें' : 'Invite'}
            </button>
          </div>
          {/* Your exact input row */}
          <div style={s.inputRow}>
            <input style={s.inputField} value={messageText} onChange={handleTyping}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder={hi ? 'संदेश लिखें...' : 'Type a secure message...'} />
            <button style={s.sendBtn} onClick={handleSendMessage}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}