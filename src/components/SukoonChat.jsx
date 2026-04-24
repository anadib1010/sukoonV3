import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { requestFirebaseToken } from '../firebaseSetup';
import { useChatEngine } from '../hooks/useChatEngine';
import { useAudioEngine } from '../hooks/useAudioEngine';
import QRCode from 'react-qr-code';
import { SecurityKit } from '../utils/security';

// ─── iOS DETECTION ─────────────────────────────────────────────────────────
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ─── EXPIRY OPTIONS ────────────────────────────────────────────────────────
const EXPIRY_OPTIONS = [
  { label: 'Off',    value: null },
  { label: '1 min',  value: 60 },
  { label: '1 hr',   value: 3600 },
  { label: '24 hr',  value: 86400 },
  { label: '7 days', value: 604800 },
];

// ─── REFERRAL LINK ─────────────────────────────────────────────────────────
const getReferralLink = (email) => {
  const code = btoa(email || '').replace(/=/g, '').slice(0, 8).toUpperCase();
  return `${window.location.origin}?ref=${code}`;
};

// ─── FORMAT CALL DURATION ──────────────────────────────────────────────────
// Converts seconds → "0:04", "1:23", "12:05" etc.
const formatDuration = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ─── AVATAR HELPERS ────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1','#14b8a6'];
const getAvatarColor = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};
const getInitials = (str = '') => {
  const clean = str.split('@')[0].replace(/[^a-zA-Z\s]/g, '');
  const parts = clean.trim().split(/\s+/);
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : clean.slice(0, 2)).toUpperCase() || '??';
};
const Avatar = ({ name = '', size = 42, style = {} }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    backgroundColor: getAvatarColor(name),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, color: '#fff', fontWeight: '700',
    fontSize: size * 0.38, fontFamily: "'DM Sans', sans-serif", ...style,
  }}>
    {getInitials(name)}
  </div>
);

// ─── DOUBLE TICK (SVG, WhatsApp-accurate) ──────────────────────────────────
const Ticks = ({ isRead }) => isRead
  ? <span style={{ display: 'inline-flex' }}>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
        <path d="M1 5.5L4.5 9L10 3" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L9.5 9L15 3" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  : <span style={{ display: 'inline-flex' }}>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
        <path d="M1 5.5L4.5 9L10 3" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L9.5 9L15 3" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>;

export default function SukoonChat({ T, lang, setTab }) {
  const location = useLocation();
  const hi = lang === "Hindi";

  // ── Core state ─────────────────────────────────────────────────────────────
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

  // ── Safety / moderation ────────────────────────────────────────────────────
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showManageBlocks, setShowManageBlocks] = useState(false);
  const [blockedProfiles, setBlockedProfiles] = useState([]);

  // ── Scroll ────────────────────────────────────────────────────────────────
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // ── Feature state ─────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(null);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [missedCalls, setMissedCalls] = useState([]);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [lastCallId, setLastCallId] = useState(null);
  const [showReferral, setShowReferral] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const offlineQueueRef = useRef([]);
  const [incomingCall, setIncomingCall] = useState(null);

  // ── Security vault ─────────────────────────────────────────────────────────
  const [showVault, setShowVault] = useState(false);
  const [vaultMode, setVaultMode] = useState(null);
  const [pinInput, setPinInput] = useState("");

  // ── Last message cache for room list preview ───────────────────────────────
  const [lastMessages, setLastMessages] = useState({});

  // ── Engines ───────────────────────────────────────────────────────────────
  const {
    messages, presentUsers, messageText,
    handleTyping, handleSendMessage, handleDeleteMessage
  } = useChatEngine(currentUser, activeRoom, blockedUsers, isVaultUnlocked, myMasterKeyRef, hi);

  const {
    isInCall, showAudioBridge, isSpeakerOn, toggleSpeaker,
    callDuration,   // ← live seconds from engine
    startCall, joinCall, endCall, handleStartAudio, autoJoinRef
  } = useAudioEngine(currentUser, activeRoom, blockedUsers, hi, showToast);

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' },

    header: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: `1px solid ${T.accent}15`, backgroundColor: T.bg, position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 },
    headerBack: { background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontSize: '26px', padding: '2px 8px 2px 0', flexShrink: 0, lineHeight: 1, fontWeight: '300' },
    headerInfo: { flex: 1, minWidth: 0 },
    headerName: { fontWeight: '700', fontSize: '16px', color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 },
    headerSub: { fontSize: '12px', marginTop: '1px', color: T.accent, fontWeight: '500' },
    headerSubMuted: { fontSize: '12px', marginTop: '1px', color: T.text, opacity: 0.38, fontWeight: '400' },
    headerTitleHome: { fontWeight: '700', fontSize: '20px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px', color: T.text },
    callBtn: { width: '38px', height: '38px', background: '#16a34a', border: '1px solid #4ade80', borderRadius: '50%', cursor: 'pointer', fontSize: '17px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 10px rgba(74,222,128,0.3)' },
    callBtnDisabled: { width: '38px', height: '38px', background: 'transparent', border: 'none', cursor: 'not-allowed', fontSize: '17px', opacity: 0.25, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    shieldBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '8px', color: T.accent, opacity: 0.6, flexShrink: 0 },
    logoutBtn: { padding: '7px 14px', borderRadius: '20px', border: `1px solid ${T.accent}30`, cursor: 'pointer', fontWeight: '700', fontSize: '12px', background: 'transparent', color: T.text, opacity: 0.75, whiteSpace: 'nowrap', flexShrink: 0 },

    chatBox: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', WebkitOverflowScrolling: 'touch' },
    sectionLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: T.text, opacity: 0.32, padding: '12px 16px 4px' },
    newChatBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', backgroundColor: 'transparent', cursor: 'pointer', color: T.accent, fontWeight: '600', fontSize: '15px', border: 'none', width: '100%', textAlign: 'left', borderBottom: `1px solid ${T.accent}08` },
    searchRow: { display: 'flex', gap: '10px', padding: '10px 16px', borderBottom: `1px solid ${T.accent}08` },
    searchInput: { flex: 1, padding: '10px 16px', borderRadius: '22px', border: `1px solid ${T.accent}20`, fontSize: '15px', backgroundColor: `${T.accent}06`, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif" },
    actionBtn: { padding: '10px 16px', borderRadius: '22px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', backgroundColor: T.accent, color: T.bg, flexShrink: 0 },
    
    roomRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', borderBottom: `1px solid ${T.accent}06` },
    roomRowInfo: { flex: 1, minWidth: 0 },
    roomRowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' },
    roomRowName: { fontWeight: '600', fontSize: '15px', color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' },
    roomRowTime: { fontSize: '11px', color: T.text, opacity: 0.38, flexShrink: 0, marginLeft: '8px' },
    roomRowBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    roomRowPreview: { fontSize: '13px', color: T.text, opacity: 0.48, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' },
    unreadBadge: { backgroundColor: T.accent, color: T.bg, borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', fontWeight: '700', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },

    chatWallpaper: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '8px 10px', WebkitOverflowScrolling: 'touch', backgroundImage: `radial-gradient(circle, ${T.accent}08 1px, transparent 1px)`, backgroundSize: '20px 20px' },
    messageList: { display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '8px' },
    dateSep: { alignSelf: 'center', backgroundColor: `${T.accent}14`, borderRadius: '8px', padding: '3px 10px', fontSize: '11px', color: T.text, opacity: 0.6, margin: '8px 0', fontWeight: '500' },
    getBubbleWrapper: (isMe) => ({ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '6px', paddingLeft: isMe ? '48px' : '0', paddingRight: isMe ? '0' : '48px' }),
    
    getBubble: (isMe) => ({
      position: 'relative',
      padding: '7px 10px 20px 10px',
      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
      backgroundColor: isMe ? T.accent : T.bg,
      color: isMe ? T.bg : T.text,
      border: isMe ? 'none' : `1px solid ${T.accent}12`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      maxWidth: '75%', minWidth: '80px',
      fontSize: '15px', lineHeight: '1.45', wordBreak: 'break-word',
    }),
    bubbleMeta: (isMe) => ({ position: 'absolute', bottom: '4px', right: '8px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: isMe ? 'rgba(255,255,255,0.65)' : `${T.text}60`, whiteSpace: 'nowrap' }),
    senderName: { fontSize: '12px', fontWeight: '700', marginBottom: '1px' },
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', opacity: 0.3, padding: '0 0 0 4px', flexShrink: 0 },
    emptyRoom: { textAlign: 'center', padding: '40px 20px', opacity: 0.45 },

    inputArea: { display: 'flex', flexDirection: 'column', backgroundColor: T.bg, borderTop: `1px solid ${T.accent}12`, flexShrink: 0 },
    inputToolbar: { display: 'flex', alignItems: 'center', padding: '8px 14px 0', gap: '8px' },
    inputRow: { display: 'flex', padding: '8px 10px 10px', alignItems: 'center', gap: '8px' },
    inputField: { flex: 1, padding: '10px 14px', borderRadius: '22px', border: `1px solid ${T.accent}22`, fontSize: '15px', backgroundColor: `${T.accent}05`, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif" },
    sendBtn: { width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: T.accent, color: T.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
    toolbarChip: (active) => ({ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${active ? T.accent : T.accent + '28'}`, backgroundColor: active ? `${T.accent}16` : 'transparent', color: active ? T.accent : T.text, fontWeight: active ? '700' : '400', fontFamily: "'DM Sans', sans-serif" }),

    callBanner: { backgroundColor: '#14532d', color: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
    callBannerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    callDurationText: { fontSize: '15px', fontWeight: '700', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px', color: '#4ade80' },
    callBannerSub: { fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' },
    speakerBtn: { padding: '6px 12px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' },
    endCallBtn: { padding: '8px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
    modalBox: { backgroundColor: T.bg, padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', border: `1px solid ${T.accent}30`, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' },
    selectedFriendPill: { display: 'inline-block', padding: '5px 12px', borderRadius: '15px', backgroundColor: `${T.accent}20`, color: T.accent, fontSize: '13px', margin: '3px', fontWeight: '700' },
    backBtn: { padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', backgroundColor: `${T.accent}20`, color: T.accent },
    declineBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' },
    acceptBtn: { padding: '6px 16px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' },

    ringingOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: 'linear-gradient(160deg,#0f2027,#203a43,#2c5364)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '32px' },
    avatarRing: { width: '96px', height: '96px', borderRadius: '50%', background: `${T.accent}25`, border: `3px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', marginBottom: '24px' },
    ringActionBtn: (color) => ({ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: color, border: 'none', cursor: 'pointer', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${color}80` }),

    bridgeOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(12px)', textAlign: 'center', padding: '24px' },
    bridgeBtn: { padding: '16px 36px', borderRadius: '50px', backgroundColor: '#4ade80', color: '#000', border: 'none', fontWeight: '700', fontSize: '17px', cursor: 'pointer' },

    missedCallCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${T.accent}06`, fontSize: '14px' },
    offlineBanner: { backgroundColor: '#f59e0b', color: '#000', padding: '6px 16px', fontSize: '13px', fontWeight: '700', textAlign: 'center', flexShrink: 0 },
    autoScrollBtn: (active) => ({ position: 'absolute', bottom: '80px', right: '14px', width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: T.bg, color: T.accent, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', zIndex: 40 }),
    toast: { position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.82)', color: '#fff', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', zIndex: 9999, whiteSpace: 'nowrap', pointerEvents: 'none' },
  };

  // ── Expiry countdown badge ─────────────────────────────────────────────────
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

  // ── Initialization (UPDATED WITH YOUR SNIPPET) ────────────────────────────
  useEffect(() => {
    async function init() {
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") Notification.requestPermission();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        const { data: blocks } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
        const blockedIds = blocks ? blocks.map(b => b.blocked_id) : [];
        setBlockedUsers(blockedIds);
        const { data } = await supabase.from('rooms').select('*');
        if (data) {
          setRooms(data.filter(room => {
            if (room.is_private) { const o = room.participants.find(p => p !== user.id); return !blockedIds.includes(o); }
            return true;
          }));
        }
        try { const token = await requestFirebaseToken(); if (token) await supabase.from('profiles').upsert({ id: user.id, email: user.email, fcm_token: token }); } catch (e) {}
        
        // ── HERE IS YOUR SNIPPET CAREFULLY INTEGRATED ──
        try {
          // Step 1: Open the drawer and check for old keys
          // (Note: Your vault uses 'sukoon_master_key' for the private key name)
          const savedPrivKey = localStorage.getItem('sukoon_master_key');
          const savedPubKey = localStorage.getItem('sukoon_public_key');

          if (savedPrivKey && savedPubKey) {
            // Step 2 (YES): We found the old keys! Let's load them up so we can read old messages.
            const privateKey = await SecurityKit.importPrivateKeyFromVault(savedPrivKey);
            
            // Save them to your React ref so the Chat Engine can use it
            myMasterKeyRef.current = privateKey;
            
            // Tell the database we are online with our public key
            await supabase.from('profiles').update({ public_key: savedPubKey }).eq('id', user.id);
            console.log("Loaded existing keys from the drawer!");

          } else {
            // Step 3 (NO): No keys found. We must be a brand new user. 
            // Let's generate a new pair and save them to the drawer permanently.
            const keyPair = await SecurityKit.generateKeys();
            
            const privString = await SecurityKit.exportPrivateKeyToVault(keyPair.privateKey);
            const pubString = await SecurityKit.exportPublicKey(keyPair.publicKey);

            localStorage.setItem('sukoon_master_key', privString);
            localStorage.setItem('sukoon_public_key', pubString);
            
            // Save them to your React ref
            myMasterKeyRef.current = keyPair.privateKey;
            
            // Tell the database our brand new public key
            await supabase.from('profiles').update({ public_key: pubString }).eq('id', user.id);
            console.log("Generated brand new keys and saved them!");
          }
        } catch (error) {
          console.error("Error setting up security keys:", error);
        }
        // ────────────────────────────────────────────────

        setIsVaultUnlocked(true);
        if (!localStorage.getItem('sukoon_onboarded')) setShowOnboarding(true);
      }
      setLoading(false);
    }
    init();
  }, []);

  // ── Incoming call via nav state ───────────────────────────────────────────
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

  // ── Unread scanners ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from('messages').select('room_id').eq('is_read', false).neq('user_id', currentUser.id);
      const counts = {}; if (data) data.forEach(m => { counts[m.room_id] = (counts[m.room_id] || 0) + 1; }); setUnreadCounts(counts);
    })();
    const rc = supabase.channel('live-rooms-radar').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (p) => { if (p.new.participants?.includes(currentUser.id)) setRooms(prev => [...prev, p.new]); }).subscribe();
    return () => supabase.removeChannel(rc);
  }, [currentUser?.id]);

  // ── Last message cache ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || rooms.length === 0) return;
    (async () => {
      const cache = {};
      await Promise.all(rooms.map(async r => {
        const { data } = await supabase.from('messages').select('content, created_at, user_id').eq('room_id', r.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (data) cache[r.id] = data;
      }));
      setLastMessages(cache);
    })();
  }, [rooms, currentUser]);

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current) chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeRoom]);

  // ── Online/offline ────────────────────────────────────────────────────────
  useEffect(() => {
    const goOnline = () => { setIsOnline(true); offlineQueueRef.current.forEach(() => handleSendMessage()); offlineQueueRef.current = []; };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline); window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [handleSendMessage]);

  // ── Missed calls ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data: callsData } = await supabase.from('calls').select('*').eq('receiver_id', currentUser.id).eq('status', 'missed').order('created_at', { ascending: false }).limit(5);
      if (callsData?.length > 0) {
        const callerIds = callsData.map(c => c.caller_id);
        const { data: profilesData } = await supabase.from('profiles').select('id, email').in('id', callerIds);
        setMissedCalls(callsData.map(call => ({ ...call, caller: { email: profilesData?.find(p => p.id === call.caller_id)?.email } })));
      }
    })();
    const mc = supabase.channel(`missed-${currentUser.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `receiver_id=eq.${currentUser.id}` }, (p) => { if (p.new.status === 'missed') setMissedCalls(prev => [p.new, ...prev.slice(0, 4)]); }).subscribe();
    return () => supabase.removeChannel(mc);
  }, [currentUser?.id]);

  // ── Incoming call ringing UI ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const ring = supabase.channel('ring-ui').on('broadcast', { event: 'global-ring' }, ({ payload }) => {
      if (payload.action === 'start' && payload.participants?.includes(currentUser.id) && payload.callerId !== currentUser.id) {
        if (blockedUsers.includes(payload.callerId)) return;
        setIncomingCall({ callerEmail: payload.callerEmail, callId: payload.callId, room: payload.roomDetails });
      }
      if (payload.action === 'cancel') setIncomingCall(null);
    }).subscribe();
    return () => supabase.removeChannel(ring);
  }, [currentUser?.id, blockedUsers]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (ds) => ds ? new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const formatRoomTime = (ds) => {
    if (!ds) return '';
    const d = new Date(ds), now = new Date();
    if (d.toDateString() === now.toDateString()) return formatTime(ds);
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return hi ? 'कल' : 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };
  const getContactName = (room) => {
    if (room.is_private && room.name.includes(':::')) { const [a, b] = room.name.split(':::'); return currentUser?.email === b ? a.split('@')[0] : b.split('@')[0]; }
    return room.name;
  };
  const getRoomDisplayName = getContactName;
  const getLastMsgPreview = (room) => {
    const last = lastMessages[room.id];
    if (!last) return hi ? 'चैट शुरू करें' : 'Start chatting';
    const isMe = last.user_id === currentUser?.id;
    const text = last.content?.includes(':::') ? (hi ? '🔒 एन्क्रिप्टेड' : '🔒 Encrypted message') : (last.content || '...');
    return (isMe ? (hi ? 'आप: ' : 'You: ') : '') + text;
  };
  const handleBackOrHome = () => { if (isInCall) endCall(); setIsAutoScrolling(false); if (activeRoom) { setUnreadCounts(p => ({ ...p, [activeRoom.id]: 0 })); setActiveRoom(null); } else setTab('home'); };
  const handleLogout = async () => { if (window.confirm(hi ? "लॉग आउट?" : "Logout?")) { await supabase.auth.signOut(); setTab('home'); window.location.reload(); } };
  const handleSearch = async () => {
    if (!currentUser || searchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${searchTerm}%`).neq('id', currentUser.id);
    setSearchResults(data?.filter(u => !blockedUsers.includes(u.id)) || []);
  };
  const startPrivateChat = async (friend) => {
    const { data: existing } = await supabase.from('rooms').select('*').eq('is_private', true).contains('participants', [currentUser.id, friend.id]);
    if (existing?.length > 0) setActiveRoom(existing[0]);
    else { const { data: nr } = await supabase.from('rooms').insert([{ name: `${currentUser.email}:::${friend.email}`, is_private: true, participants: [currentUser.id, friend.id] }]).select(); if (nr) { setRooms(p => [...p, nr[0]]); setActiveRoom(nr[0]); } }
    setSearchTerm(""); setSearchResults([]);
  };
  const handleUnblock = async (userId) => {
    await supabase.from('blocks').delete().eq('blocker_id', currentUser.id).eq('blocked_id', userId);
    setBlockedUsers(p => p.filter(id => id !== userId)); setBlockedProfiles(p => p.filter(u => u.id !== userId));
  };
  const handleAcceptCall = () => {
    if (!incomingCall?.room) return;
    const room = incomingCall.room; setIncomingCall(null);
    if (activeRoomRef.current?.id === room.id) joinCall();
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
    const { data } = await supabase.from('calls').select('id').eq('status', 'accepted').or(`caller_id.eq.${currentUser?.id},receiver_id.eq.${currentUser?.id}`).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data?.id) setLastCallId(data.id);
    await endCall(); setShowQualityModal(true);
  };
  const handleCallQuality = async (rating) => {
    if (lastCallId) await supabase.from('calls').update({ quality_rating: rating }).eq('id', lastCallId);
    setShowQualityModal(false); setLastCallId(null);
  };
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(getReferralLink(currentUser?.email)).then(() => { setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2500); });
  };
  const finishOnboarding = () => { localStorage.setItem('sukoon_onboarded', '1'); setShowOnboarding(false); setOnboardingStep(0); };
  const handleCloudBackup = async () => {
    if (pinInput.length !== 6) return alert(hi ? "6 अंकों का पिन दर्ज करें" : "Enter a 6-digit PIN");
    try { const myKey = localStorage.getItem('sukoon_master_key'); const lockedKey = await SecurityKit.lockKeyWithPin(myKey, pinInput, currentUser.email); await supabase.from('profiles').update({ encrypted_backup: lockedKey }).eq('id', currentUser.id); alert(hi ? "क्लाउड में सुरक्षित हो गया!" : "Securely backed up to cloud!"); setShowVault(false); setPinInput(""); } catch (e) { alert("Backup failed: " + e.message); }
  };
  const handleCloudRestore = async () => {
    if (pinInput.length !== 6) return alert(hi ? "6 अंकों का पिन दर्ज करें" : "Enter a 6-digit PIN");
    try { const { data } = await supabase.from('profiles').select('encrypted_backup').eq('id', currentUser.id).single(); if (!data?.encrypted_backup) return alert(hi ? "कोई बैकअप नहीं मिला!" : "No backup found!"); const unlockedKey = await SecurityKit.unlockKeyWithPin(data.encrypted_backup, pinInput, currentUser.email); localStorage.setItem('sukoon_master_key', unlockedKey); alert(hi ? "कुंजी बहाल हो गई! रिफ्रेश करें।" : "Key restored! Please refresh."); window.location.reload(); } catch (e) { alert(hi ? "गलत पिन!" : "Incorrect PIN!"); }
  };
  const handleManualQRPaste = () => {
    const code = prompt(hi ? "पुराने फोन से कोड पेस्ट करें:" : "Paste code from old phone:");
    if (code && code.length > 50) { localStorage.setItem('sukoon_master_key', code); alert("Success! Refreshing..."); window.location.reload(); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const typingUsers = Object.values(presentUsers).filter(u => u.is_typing && !blockedUsers.includes(u.id));
  const onlineUsers = Object.values(presentUsers).filter(u => !blockedUsers.includes(u.id));
  const expiryLabel = EXPIRY_OPTIONS.find(o => o.value === expirySeconds)?.label || 'Off';
  const headerSubIsLive = typingUsers.length > 0 || onlineUsers.length > 0;
  const getHeaderSub = () => {
    if (typingUsers.length > 0) return hi ? 'टाइप कर रहे हैं...' : 'typing...';
    if (onlineUsers.length > 0) return hi ? 'ऑनलाइन' : 'online';
    return hi ? 'एन्क्रिप्टेड चैट' : 'end-to-end encrypted';
  };
  const sortedRooms = [...rooms].sort((a, b) => {
    const ta = lastMessages[a.id]?.created_at || a.created_at || '';
    const tb = lastMessages[b.id]?.created_at || b.created_at || '';
    return tb.localeCompare(ta);
  });

  // ── Onboarding slides ─────────────────────────────────────────────────────
  const slides = [
    { icon: '🔐', title: hi ? 'आपके संदेश सुरक्षित हैं' : 'Your messages are encrypted', body: hi ? 'ECDH + AES-GCM एन्क्रिप्शन — यहाँ तक कि हम भी नहीं पढ़ सकते।' : 'Sukoon uses ECDH + AES-GCM end-to-end encryption. Even we cannot read your messages.' },
    { icon: '🫧', title: hi ? 'कमरे और बातचीत' : 'Rooms & Conversations', body: hi ? 'ईमेल से दोस्त खोजें। प्राइवेट चैट या ग्रुप रूम बनाएं।' : 'Search any friend by email. Start a private chat or create a group room instantly.' },
    { icon: '🌙', title: hi ? 'संदेश गायब हो सकते हैं' : 'Messages can disappear', body: hi ? '1 मिनट से 7 दिन तक — आपकी शर्तों पर।' : 'Set disappearing messages from 1 minute to 7 days. Your thoughts, your terms.' },
    { icon: '📞', title: hi ? 'सुरक्षित वॉयस कॉल' : 'Encrypted voice calls', body: hi ? 'E2E encrypted audio calls — ब्राउज़र या मोबाइल से।' : 'End-to-end encrypted voice calls directly from browser or mobile.' },
    { icon: '⚠️', title: hi ? 'महत्वपूर्ण चेतावनी' : 'CRITICAL WARNING', body: hi ? 'हम आपकी एन्क्रिप्शन कुंजी नहीं जानते। कृपया सुरक्षा वॉल्ट (🗝️) में अपना पिन या QR कोड सुरक्षित करें।' : 'We do not have your encryption key. Please use the Security Vault (🗝️) to backup via PIN or QR code.' },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={s.container}>
      <video id="sukoon-remote-audio" autoPlay playsInline
        style={{ position: 'absolute', top: '-10px', left: '-10px', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none' }} />

      <style>{`@keyframes sukoonTyping{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}} @keyframes sukoonPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.1)}50%{box-shadow:0 0 0 20px rgba(255,255,255,0)}}`}</style>

      {/* Ringing screen */}
      {incomingCall && (
        <div style={s.ringingOverlay}>
          <div style={{ ...s.avatarRing, animation: 'sukoonPulse 2s infinite' }}>
            {incomingCall.callerEmail?.charAt(0).toUpperCase()}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>{hi ? 'आ रही कॉल' : 'Incoming Call'}</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{incomingCall.callerEmail?.split('@')[0]}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '52px' }}>{hi ? 'सुकून एन्क्रिप्टेड कॉल' : 'Sukoon encrypted call'}</div>
          <div style={{ display: 'flex', gap: '48px' }}>
            {[{ color: '#ef4444', icon: '📵', label: hi ? 'अस्वीकार' : 'Decline', fn: handleDeclineCall }, { color: '#4ade80', icon: '📞', label: hi ? 'स्वीकार' : 'Accept', fn: handleAcceptCall }].map(({ color, icon, label, fn }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <button style={s.ringActionBtn(color)} onClick={fn}>{icon}</button>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onboarding */}
      {showOnboarding && !incomingCall && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalBox, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '52px', marginBottom: '14px' }}>{slides[onboardingStep].icon}</div>
            <div style={{ fontWeight: '700', fontSize: '19px', color: T.text, marginBottom: '10px', fontFamily: "'Cormorant Garamond', serif" }}>{slides[onboardingStep].title}</div>
            <div style={{ fontSize: '14px', color: T.text, opacity: 0.65, lineHeight: '1.65', marginBottom: '28px' }}>{slides[onboardingStep].body}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
              {slides.map((_, i) => <div key={i} style={{ height: '6px', width: i === onboardingStep ? '20px' : '6px', borderRadius: '3px', backgroundColor: i === onboardingStep ? T.accent : `${T.accent}30`, transition: 'width 0.3s' }} />)}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {onboardingStep > 0 && <button onClick={() => setOnboardingStep(s => s - 1)} style={{ ...s.backBtn, flex: 1 }}>{hi ? 'पीछे' : 'Back'}</button>}
              <button onClick={() => onboardingStep < slides.length - 1 ? setOnboardingStep(s => s + 1) : finishOnboarding()} style={{ ...s.actionBtn, flex: 1, borderRadius: '14px', boxShadow: 'none', padding: '14px' }}>
                {onboardingStep < slides.length - 1 ? (hi ? 'आगे' : 'Next') : (hi ? 'शुरू करें 🚀' : 'Get Started 🚀')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call quality */}
      {showQualityModal && !incomingCall && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalBox, textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📞</div>
            <div style={{ fontWeight: '700', fontSize: '17px', color: T.text, marginBottom: '6px' }}>{hi ? 'कॉल कैसी रही?' : 'How was the call quality?'}</div>
            <div style={{ fontSize: '13px', opacity: 0.5, marginBottom: '22px' }}>{hi ? 'आपकी राय हमें बेहतर बनाती है' : 'Your feedback helps us improve'}</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              {[{ e: '😞', v: 1, l: hi ? 'खराब' : 'Poor' }, { e: '😐', v: 2, l: hi ? 'ठीक' : 'OK' }, { e: '😊', v: 3, l: hi ? 'अच्छी' : 'Good' }].map(({ e, v, l }) => (
                <button key={v} onClick={() => handleCallQuality(v)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '76px', padding: '14px 0', borderRadius: '16px', border: `1px solid ${T.accent}20`, backgroundColor: `${T.accent}06`, cursor: 'pointer', fontSize: '30px' }}>
                  {e}<span style={{ fontSize: '11px', color: T.text, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}>{l}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowQualityModal(false)} style={{ ...s.logoutBtn, fontSize: '13px' }}>{hi ? 'छोड़ें' : 'Skip'}</button>
          </div>
        </div>
      )}

      {/* Referral */}
      {showReferral && (
        <div style={s.modalOverlay} onClick={() => setShowReferral(false)}>
          <div style={{ ...s.modalBox, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>💌</div>
            <div style={{ fontWeight: '700', fontSize: '19px', color: T.text, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>{hi ? 'दोस्त को बुलाएं' : 'Invite a Friend'}</div>
            <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '18px', lineHeight: '1.6' }}>{hi ? 'सुकून पर सुरक्षित बात करने के लिए दोस्त को आमंत्रित करें।' : 'Invite a friend to have private, encrypted conversations on Sukoon.'}</div>
            <div style={{ padding: '13px 16px', borderRadius: '12px', backgroundColor: `${T.accent}08`, border: `1px solid ${T.accent}20`, fontSize: '12px', wordBreak: 'break-all', marginBottom: '16px', fontFamily: 'monospace', textAlign: 'left', color: T.text }}>{getReferralLink(currentUser?.email)}</div>
            <button onClick={handleCopyReferral} style={{ ...s.actionBtn, width: '100%', borderRadius: '14px', boxShadow: 'none', padding: '14px', marginBottom: '10px', fontSize: '15px', backgroundColor: referralCopied ? '#4ade80' : T.accent, color: referralCopied ? '#000' : T.bg, transition: 'background 0.3s' }}>
              {referralCopied ? (hi ? '✅ कॉपी हो गया!' : '✅ Copied!') : (hi ? '🔗 लिंक कॉपी करें' : '🔗 Copy Invite Link')}
            </button>
            <button onClick={() => setShowReferral(false)} style={s.logoutBtn}>{hi ? 'बंद करें' : 'Close'}</button>
          </div>
        </div>
      )}

      {/* Expiry picker */}
      {showExpiryPicker && (
        <div style={s.modalOverlay} onClick={() => setShowExpiryPicker(false)}>
          <div style={{ ...s.modalBox, padding: '20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: '700', fontSize: '16px', color: T.text, marginBottom: '14px' }}>⏱ {hi ? 'संदेश कब गायब हो?' : 'Disappearing Messages'}</div>
            {EXPIRY_OPTIONS.map(opt => (
              <button key={String(opt.value)} onClick={() => { setExpirySeconds(opt.value); setShowExpiryPicker(false); }} style={{ display: 'block', width: '100%', padding: '13px 16px', marginBottom: '8px', borderRadius: '14px', cursor: 'pointer', border: `1px solid ${expirySeconds === opt.value ? T.accent : T.accent + '18'}`, backgroundColor: expirySeconds === opt.value ? `${T.accent}12` : 'transparent', color: T.text, fontWeight: expirySeconds === opt.value ? '700' : '400', fontSize: '15px', textAlign: 'left', fontFamily: "'DM Sans', sans-serif" }}>
                {expirySeconds === opt.value ? '✓ ' : ''}{opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Group modal */}
      {showGroupModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h3 style={{ color: T.text, marginBottom: '16px' }}>{hi ? 'नया ग्रुप बनाएं' : 'New Group'}</h3>
            <input style={{ ...s.searchInput, width: '100%', boxSizing: 'border-box', marginBottom: '10px', borderRadius: '12px' }} placeholder={hi ? 'ग्रुप का नाम...' : 'Group name...'} value={groupName} onChange={e => setGroupName(e.target.value)} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input style={{ ...s.searchInput, flex: 1, borderRadius: '12px' }} placeholder={hi ? 'मित्र खोजें...' : 'Add people...'} value={groupSearchTerm} onChange={e => setGroupSearchTerm(e.target.value)} />
              <button style={{ ...s.actionBtn, borderRadius: '12px' }} onClick={async () => { if (groupSearchTerm.length < 3) return; const { data } = await supabase.from('profiles').select('*').ilike('email', `%${groupSearchTerm}%`).neq('id', currentUser.id); setGroupSearchResults(data || []); }}>🔍</button>
            </div>
            {groupSearchResults.map(u => (
              <div key={u.id} onClick={() => { if (!selectedFriends.find(f => f.id === u.id)) setSelectedFriends(p => [...p, u]); setGroupSearchTerm(''); setGroupSearchResults([]); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', cursor: 'pointer', borderBottom: `1px solid ${T.accent}08` }}>
                <Avatar name={u.email} size={36} /><span style={{ fontSize: '14px', color: T.text }}>{u.email}</span>
              </div>
            ))}
            <div style={{ margin: '10px 0' }}>{selectedFriends.map(f => <span key={f.id} style={s.selectedFriendPill}>{f.email.split('@')[0]} ✕</span>)}</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={{ ...s.actionBtn, flex: 1, borderRadius: '14px', boxShadow: 'none' }} onClick={async () => { if (!groupName.trim() || selectedFriends.length === 0) return alert(hi ? 'नाम और एक मित्र जरूरी है' : 'Need a name + 1 friend'); const { data: nr } = await supabase.from('rooms').insert([{ name: groupName, is_private: false, participants: [currentUser.id, ...selectedFriends.map(f => f.id)] }]).select(); if (nr) { setRooms(p => [...p, nr[0]]); setShowGroupModal(false); setGroupName(''); setSelectedFriends([]); setActiveRoom(nr[0]); } }}>{hi ? 'बनाएं' : 'Create'}</button>
              <button style={{ padding: '13px 20px', borderRadius: '14px', border: `1px solid ${T.accent}22`, background: 'transparent', color: T.text, cursor: 'pointer', fontWeight: '600', flex: 1 }} onClick={() => setShowGroupModal(false)}>{hi ? 'रद्द करें' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Security vault */}
      {showVault && (
        <div style={s.modalOverlay} onClick={() => { setShowVault(false); setVaultMode(null); setPinInput(""); }}>
          <div style={{ ...s.modalBox, textAlign: 'center', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗝️</div>
            <h3 style={{ margin: '0 0 15px 0', color: T.text }}>{hi ? "सुरक्षा वॉल्ट" : "Security Vault"}</h3>
            {!vaultMode && <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: T.text, lineHeight: '1.5' }}><strong style={{ color: '#ef4444' }}>{hi ? 'महत्वपूर्ण: ' : 'CRITICAL: '}</strong>{hi ? 'हम आपकी चैट नहीं पढ़ सकते और खोया हुआ डेटा वापस नहीं ला सकते।' : 'We cannot read your chats or recover lost data. Save your key!'}</div>}
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
                <p style={{ fontSize: '14px', color: T.text, opacity: 0.8, lineHeight: '1.5' }}>{vaultMode === 'pin-backup' ? (hi ? 'सुरक्षित 6 अंकों का पिन बनाएं। इसे न भूलें!' : 'Create a 6-digit PIN. Do not forget it!') : (hi ? 'अपना 6 अंकों का पिन डालें।' : 'Enter your 6-digit PIN to restore.')}</p>
                <input type="password" maxLength="6" style={{ ...s.searchInput, textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }} placeholder="••••••" value={pinInput} onChange={e => setPinInput(e.target.value.replace(/[^0-9]/g, ''))} />
                <button style={{ ...s.actionBtn, opacity: pinInput.length === 6 ? 1 : 0.5 }} onClick={vaultMode === 'pin-backup' ? handleCloudBackup : handleCloudRestore} disabled={pinInput.length !== 6}>{vaultMode === 'pin-backup' ? (hi ? "बैकअप बनाएं" : "Backup to Cloud") : (hi ? "बहाल करें" : "Restore Chats")}</button>
                <button style={s.logoutBtn} onClick={() => { setVaultMode(null); setPinInput(""); }}>{hi ? "पीछे" : "Back"}</button>
              </div>
            ) : vaultMode === 'qr-show' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <p style={{ fontSize: '14px', color: T.text, opacity: 0.8 }}>{hi ? "नए फोन पर स्कैनर खोलें या कोड कॉपी करें:" : "Open scanner on new phone or copy code:"}</p>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px' }}><QRCode value={localStorage.getItem('sukoon_master_key') || ''} size={150} /></div>
                <button style={{ ...s.actionBtn, width: '100%' }} onClick={() => { navigator.clipboard.writeText(localStorage.getItem('sukoon_master_key')); alert("Copied!"); }}>{hi ? "कोड कॉपी करें" : "Copy Code"}</button>
                <button style={{ ...s.logoutBtn, width: '100%' }} onClick={() => setVaultMode(null)}>{hi ? "पीछे" : "Back"}</button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Manage blocks */}
      {showManageBlocks && (
        <div style={s.modalOverlay} onClick={() => setShowManageBlocks(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: T.text }}>{hi ? "ब्लॉक सूची" : "Blocked Users"}</h3>
            {blockedProfiles.length === 0 ? <p style={{ opacity: 0.5, fontSize: '14px' }}>{hi ? 'कोई ब्लॉक नहीं' : 'No blocked users'}</p> : blockedProfiles.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${T.accent}12` }}>
                <span>{u.email}</span><button onClick={() => handleUnblock(u.id)} style={{ ...s.backBtn, padding: '4px 12px', fontSize: '12px' }}>Unblock</button>
              </div>
            ))}
            <button onClick={() => setShowManageBlocks(false)} style={{ ...s.backBtn, marginTop: '16px' }}>Close</button>
          </div>
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <div style={s.header}>
        <button style={s.headerBack} onClick={handleBackOrHome}>‹</button>
        {activeRoom ? (
          <>
            <Avatar name={getContactName(activeRoom)} size={38} />
            <div style={s.headerInfo}>
              <div style={s.headerName}>{getRoomDisplayName(activeRoom)}</div>
              <div style={headerSubIsLive ? s.headerSub : s.headerSubMuted}>{getHeaderSub()}</div>
            </div>
            <button style={isInCall ? s.callBtnDisabled : s.callBtn} onClick={startCall} disabled={isInCall}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            </button>
          </>
        ) : (
          <>
            <div style={{ ...s.headerInfo }}><div style={s.headerTitleHome}>Sukoon Chat</div></div>
            <button style={s.logoutBtn} onClick={handleLogout}>{hi ? 'लॉग आउट' : 'Logout'}</button>
          </>
        )}
      </div>

      {/* Offline banner */}
      {!isOnline && <div style={s.offlineBanner}>📵 {hi ? 'ऑफलाइन — संदेश कतार में हैं' : 'Offline — messages will deliver when reconnected'}</div>}

      {/* ── ACTIVE CALL BANNER with live duration ── */}
      {isInCall && (
        <div style={s.callBanner}>
          <div style={s.callBannerLeft}>
            {/* Green pulse dot */}
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80', animation: 'sukoonPulse 2s infinite', flexShrink: 0 }} />
            <div>
              {/* Duration ticks up every second from the engine */}
              <div style={s.callDurationText}>{formatDuration(callDuration)}</div>
              <div style={s.callBannerSub}>{hi ? 'सुरक्षित कॉल जारी है' : 'Secure call active'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={toggleSpeaker} style={s.speakerBtn} title={isSpeakerOn ? 'Switch to earpiece' : 'Switch to speaker'}>
              {isSpeakerOn ? '🔊' : '🫦'}
            </button>
            <button onClick={handleEndCallWithFeedback} style={s.endCallBtn}>{hi ? 'समाप्त' : 'End'}</button>
          </div>
        </div>
      )}

      {/* Audio bridge */}
      {showAudioBridge && (
        <div style={s.bridgeOverlay}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>📞</div>
          <h2 style={{ color: '#fff', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}>{hi ? "कॉल कनेक्टेड" : "Call Connected"}</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '28px' }}>{isIOS() ? (hi ? 'iOS पर ऑडियो चालू करें' : 'Tap to start audio on iOS') : (hi ? 'ऑडियो चालू करें' : 'Tap to activate audio')}</p>
          <button style={s.bridgeBtn} onClick={handleStartAudio}>🔊 {hi ? 'आवाज शुरू करें' : 'Start Audio'}</button>
        </div>
      )}

      {/* ── MAIN BODY ── */}
      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          /* ── ROOM LIST ── */
          <div>
            {/* Missed calls */}
            {missedCalls.length > 0 && (
              <div>
                <div style={s.sectionLabel}>{hi ? 'छूटी हुई कॉल' : 'Missed Calls'}</div>
                {missedCalls.map(c => (
                  <div key={c.id} style={s.missedCallCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>📵</span>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#ef4444' }}>{c.caller?.email?.split('@')[0] || 'Unknown'}</div>
                        <div style={{ fontSize: '11px', opacity: 0.45, marginTop: '1px' }}>{formatTime(c.created_at)}</div>
                      </div>
                    </div>
                    <button onClick={() => clearMissedCall(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.35, fontSize: '16px' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* New group row */}
            <button style={s.newChatBtn} onClick={() => setShowGroupModal(true)}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: `${T.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>👥</div>
              <div><div style={{ fontWeight: '600', fontSize: '15px' }}>{hi ? 'नया ग्रुप' : 'New Group'}</div><div style={{ fontSize: '12px', opacity: 0.42, marginTop: '1px' }}>{hi ? 'ग्रुप बनाएं' : 'Create a group chat'}</div></div>
            </button>

            {/* Search */}
            <div style={s.searchRow}>
              <input style={s.searchInput} placeholder={hi ? '🔍 खोजें...' : '🔍 Search or start new chat'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              {searchTerm.length >= 3 && <button style={s.actionBtn} onClick={handleSearch}>{hi ? 'खोजें' : 'Find'}</button>}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <>
                <div style={s.sectionLabel}>{hi ? 'खोज परिणाम' : 'Search Results'}</div>
                {searchResults.map(u => (
                  <div key={u.id} onClick={() => startPrivateChat(u)} style={s.roomRow}>
                    <Avatar name={u.email} size={48} />
                    <div style={s.roomRowInfo}>
                      <div style={s.roomRowTop}><div style={s.roomRowName}>{u.email.split('@')[0]}</div></div>
                      <div style={{ ...s.roomRowPreview }}>{u.email}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Chats */}
            {sortedRooms.length > 0 && <div style={s.sectionLabel}>{hi ? 'चैट' : 'Chats'}</div>}
            {sortedRooms.map(r => {
              const name = getContactName(r);
              return (
                <div key={r.id} style={s.roomRow} onClick={() => setActiveRoom(r)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = `${T.accent}06`}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Avatar name={name} size={50} />
                  <div style={s.roomRowInfo}>
                    <div style={s.roomRowTop}>
                      <div style={s.roomRowName}>{!r.is_private ? '👥 ' : ''}{name}</div>
                      <div style={s.roomRowTime}>{formatRoomTime(lastMessages[r.id]?.created_at)}</div>
                    </div>
                    <div style={s.roomRowBottom}>
                      <div style={s.roomRowPreview}>{getLastMsgPreview(r)}</div>
                      {unreadCounts[r.id] > 0 && <div style={s.unreadBadge}>{unreadCounts[r.id] > 9 ? '9+' : unreadCounts[r.id]}</div>}
                    </div>
                  </div>
                </div>
              );
            })}

            {rooms.length === 0 && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', opacity: 0.38 }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                <div style={{ fontSize: '15px', fontWeight: '600' }}>{hi ? 'कोई चैट नहीं' : 'No chats yet'}</div>
                <div style={{ fontSize: '13px', marginTop: '6px' }}>{hi ? 'ऊपर खोजकर शुरू करें' : 'Search above to start a conversation'}</div>
              </div>
            )}

            {/* Bottom actions */}
            <div style={{ display: 'flex', gap: '10px', margin: '18px 16px 8px' }}>
              <button onClick={() => setShowReferral(true)} style={{ flex: 1, padding: '13px', borderRadius: '16px', border: `1px dashed ${T.accent}45`, backgroundColor: `${T.accent}06`, color: T.accent, fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>💌 {hi ? 'दोस्त बुलाएं' : 'Invite Friend'}</button>
              <button onClick={() => setShowVault(true)} style={{ padding: '13px 16px', borderRadius: '16px', border: `1px solid ${T.accent}18`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '18px', opacity: 0.52 }} title="Security Vault">🗝️</button>
              <button onClick={() => { setOnboardingStep(0); setShowOnboarding(true); }} style={{ padding: '13px 16px', borderRadius: '16px', border: `1px solid ${T.accent}18`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '18px', opacity: 0.52 }} title="Security info">🔐</button>
            </div>
          </div>
        ) : (
          /* ── MESSAGE VIEW ── */
          <div style={s.chatWallpaper}>
            <div style={s.messageList}>
              {messages.length === 0 ? (
                <div style={s.emptyRoom}>
                  <div style={s.dateSep}>🔐 {hi ? 'E2E एन्क्रिप्टेड' : 'End-to-end encrypted'}</div>
                  <div style={{ fontSize: '14px', opacity: 0.38, marginTop: '8px' }}>{hi ? 'संदेश भेजकर शुरू करें' : 'Send a message to start'}</div>
                </div>
              ) : (
                <>
                  <div style={s.dateSep}>{hi ? 'आज' : 'Today'}</div>
                  {messages.map((m, idx) => {
                    const isMe = m.user_id === currentUser?.id;
                    if (m.expires_at && new Date(m.expires_at) < new Date()) return null;
                    const content = m.decrypted_content || (m._needs_decrypt ? '🔄' : '...');
                    const prev = messages[idx - 1];
                    const isFirstInRun = !prev || prev.user_id !== m.user_id;
                    const showName = !isMe && !activeRoom?.is_private && isFirstInRun;

                    return (
                      <div key={m.id} style={{ ...s.getBubbleWrapper(isMe), marginTop: isFirstInRun && idx > 0 ? '8px' : '1px' }}>
                        {/* Avatar for received — first in run only */}
                        {!isMe && (
                          <div style={{ width: '32px', flexShrink: 0, alignSelf: 'flex-end', marginBottom: '2px' }}>
                            {isFirstInRun ? <Avatar name={m.user_email || ''} size={32} /> : null}
                          </div>
                        )}
                        <div style={{ maxWidth: '75%' }}>
                          {showName && <div style={{ ...s.senderName, color: getAvatarColor(m.user_email || '') }}>{m.user_email?.split('@')[0]}</div>}
                          {/* Bubble — double tap to delete */}
                          <div style={s.getBubble(isMe)} onDoubleClick={() => handleDeleteMessage(m.id)}>
                            {content}
                            {/* Timestamp + expiry + ticks embedded inside */}
                            <div style={s.bubbleMeta(isMe)}>
                              <span>{formatTime(m.created_at)}</span>
                              <ExpiryBadge expiresAt={m.expires_at} />
                              {isMe && <Ticks isRead={m.is_read} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginTop: '4px' }}>
                      <Avatar name={typingUsers[0]?.email || ''} size={32} />
                      <div style={{ ...s.getBubble(false), padding: '10px 14px 10px', minWidth: 'unset' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '16px' }}>
                          {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: T.accent, opacity: 0.5, animation: `sukoonTyping 1.2s ${i * 0.2}s infinite` }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} style={{ height: '4px' }} />
            </div>
          </div>
        )}
      </div>

      {/* Auto scroll */}
      {activeRoom && messages.length > 5 && (
        <button onClick={() => setIsAutoScrolling(p => !p)} style={s.autoScrollBtn(isAutoScrolling)}>
          {isAutoScrolling ? '⏸' : '⌄'}
        </button>
      )}

      {/* ── INPUT BAR ── */}
      {activeRoom && (
        <div style={s.inputArea}>
          <div style={s.inputToolbar}>
            <button style={s.toolbarChip(expirySeconds !== null)} onClick={() => setShowExpiryPicker(true)}>⏱ {expiryLabel}</button>
            <button style={s.toolbarChip(false)} onClick={() => setShowReferral(true)}>💌 {hi ? 'आमंत्रित करें' : 'Invite'}</button>
          </div>
          <div style={s.inputRow}>
            <input style={s.inputField} value={messageText} onChange={handleTyping}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={hi ? 'संदेश...' : 'Message'} />
            <button style={s.sendBtn} onClick={handleSendMessage}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}