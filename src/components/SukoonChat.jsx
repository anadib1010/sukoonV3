import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { requestFirebaseToken } from '../firebaseSetup';

// ─── ECDH + AES-GCM SECURITY KIT ──────────────────────────────────────────
const SecurityKit = {
  generateKeys: async () => {
    return await window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]
    );
  },
  exportPublicKey: async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  },
  importPublicKey: async (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return await window.crypto.subtle.importKey(
      "spki", bytes, { name: "ECDH", namedCurve: "P-256" }, true, []
    );
  },
  exportPrivateKeyToVault: async (privateKey) => {
    const jwk = await window.crypto.subtle.exportKey("jwk", privateKey);
    return JSON.stringify(jwk);
  },
  importPrivateKeyFromVault: async (jwkString) => {
    const jwk = JSON.parse(jwkString);
    return await window.crypto.subtle.importKey(
      "jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
    );
  },
  deriveSecretBits: async (myPrivateKey, theirPublicKey) => {
    return await window.crypto.subtle.deriveBits(
      { name: "ECDH", public: theirPublicKey }, myPrivateKey, 256
    );
  },
  createAESKey: async (sharedSecretBits) => {
    return await window.crypto.subtle.importKey(
      "raw", sharedSecretBits, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
    );
  },
  encryptText: async (text, aesKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const cipherText = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoded);
    return {
      cipherText: btoa(String.fromCharCode(...new Uint8Array(cipherText))),
      iv: btoa(String.fromCharCode(...new Uint8Array(iv)))
    };
  },
  decryptText: async (cipherText64, iv64, aesKey) => {
    try {
      const cipherText = new Uint8Array(atob(cipherText64).split('').map(c => c.charCodeAt(0)));
      const iv = new Uint8Array(atob(iv64).split('').map(c => c.charCodeAt(0)));
      const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, cipherText);
      return new TextDecoder().decode(decrypted);
    } catch (e) { return null; }
  }
};

// ─── XOR LEGACY FALLBACK (SURGICALLY HARDENED TO PREVENT GIBBERISH) ────────
const decryptXORFallback = (scrambled, key) => {
  try {
    const keyStr = String(key);
    const decodedBase64 = atob(scrambled);
    const xored = decodedBase64.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ keyStr.charCodeAt(i % keyStr.length))
    ).join('');
    
    try {
      return decodeURIComponent(xored);
    } catch (uriError) {
      // If URI decode fails, it's safe to return the raw xor string, preventing Base64 gibberish
      return xored;
    }
  } catch (e) { 
    return "🔒 [Encrypted Message]"; 
  }
};

// ─── iOS DETECTION ─────────────────────────────────────────────────────────
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ─── DECRYPT ONE MESSAGE (FIXED TO PREVENT INFINITE "DECRYPTING" LOOP) ─────
const decryptOneMessage = async (m, aesKey, friendHasKey) => {
  const msg = { ...m };
  
  if (msg.content && msg.content.includes(':::')) {
    if (aesKey) {
      const [iv, cipher] = msg.content.split(':::');
      const result = await SecurityKit.decryptText(cipher, iv, aesKey);
      msg.decrypted_content = result !== null
        ? result
        : '🔒 [Key Mismatch: Devices out of sync]';
      msg._needs_decrypt = false;
    } else if (!friendHasKey) {
      // Friend hasn't logged in to generate a key yet. Stop waiting.
      msg.decrypted_content = '🔒 [Waiting for friend\'s secure key]';
      msg._needs_decrypt = false; 
    } else {
      // Key is still deriving asynchronously. We can wait safely.
      msg.decrypted_content = null;
      msg._needs_decrypt = true;
    }
  } else {
    msg.decrypted_content = decryptXORFallback(msg.content, msg.room_id);
    msg._needs_decrypt = false;
  }
  return msg;
};

export default function SukoonChat({ T, lang, setTab }) {
  const location = useLocation();
  const hi = lang === "Hindi";

  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
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

  const [presentUsers, setPresentUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const presenceChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [isInCall, setIsInCall] = useState(false);
  const isInCallRef = useRef(false);
  const [showAudioBridge, setShowAudioBridge] = useState(false);
  const remoteStreamRef = useRef(null);

  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const myMasterKeyRef = useRef(null);
  const activeAESKeysRef = useRef({});
  
  // 🌟 NEW: Tracks if the friend actually has a public key in the DB
  const friendHasKeyRef = useRef({}); 

  const aesKeyReadyRef = useRef({});
  const keyWatcherChannelRef = useRef(null);

  const localStream = useRef(null);
  const peers = useRef({});
  const signalingChannelRef = useRef(null);
  const autoJoinRef = useRef(false);
  const iceCandidateQueue = useRef({});
  const ringTimeoutRef = useRef(null);
  const iceServersRef = useRef({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  });

  const callPrivateKeyRef = useRef(null);
  const callPublicKeyStrRef = useRef(null);
  const callSharedSecretRef = useRef(null);
  const [activeCallId, setActiveCallId] = useState(null);
  const activeCallIdRef = useRef(null);

  const safeSetIsInCall = (v) => { setIsInCall(v); isInCallRef.current = v; };

  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const s = {
    container: {
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: T.bg, color: T.text, position: 'relative',
      fontFamily: "'DM Sans', sans-serif", overflow: 'hidden'
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: `1px solid ${T.accent}20`,
      backgroundColor: T.bg, position: 'sticky', top: 0, zIndex: 50,
      flexShrink: 0,
    },
    headerTitleBox: {
      flex: 1, textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', minWidth: 0, padding: '0 8px'
    },
    headerTitle: {
      fontWeight: '700', fontSize: '16px', fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.2px', color: T.text,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px'
    },
    headerTitleHome: {
      fontWeight: '700', fontSize: '20px', fontFamily: "'Cormorant Garamond', serif",
      letterSpacing: '1px', color: T.text
    },
    onlineStatus: {
      fontSize: '11px', color: '#4ade80', marginTop: '2px',
      display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700'
    },
    greenDot: { width: '7px', height: '7px', backgroundColor: '#4ade80', borderRadius: '50%' },
    backBtn: {
      padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
      fontWeight: '700', fontSize: '13px', backgroundColor: `${T.accent}20`,
      color: T.accent, whiteSpace: 'nowrap', flexShrink: 0
    },
    logoutBtn: {
      padding: '8px 14px', borderRadius: '20px', border: `1px solid ${T.accent}30`,
      cursor: 'pointer', fontWeight: '700', fontSize: '12px', background: 'transparent',
      color: T.text, opacity: 0.8, whiteSpace: 'nowrap', flexShrink: 0
    },
    callBtn: {
      width: '40px', height: '40px', background: `${T.accent}15`,
      border: `1px solid ${T.accent}40`, borderRadius: '50%', cursor: 'pointer',
      fontSize: '18px', color: T.accent, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0
    },
    callBtnDisabled: {
      width: '40px', height: '40px', background: 'transparent',
      border: 'none', cursor: 'not-allowed', fontSize: '18px', opacity: 0.3, flexShrink: 0
    },
    chatBox: {
      flex: 1, padding: '16px', overflowY: 'auto', display: 'flex',
      flexDirection: 'column', WebkitOverflowScrolling: 'touch'
    },
    searchRow: { display: 'flex', gap: '10px', marginBottom: '14px' },
    searchInput: {
      flex: 1, padding: '13px 18px', borderRadius: '30px',
      border: `1px solid ${T.accent}30`, fontSize: '16px',
      backgroundColor: `${T.accent}05`, color: T.text, outline: 'none',
      fontFamily: "'DM Sans', sans-serif"
    },
    actionBtn: {
      padding: '13px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer',
      fontWeight: '700', fontSize: '15px', backgroundColor: T.accent, color: T.bg,
      boxShadow: `0 4px 15px ${T.accent}40`, flexShrink: 0
    },
    bigGroupBtn: {
      width: '100%', padding: '15px', borderRadius: '16px',
      border: `2px dashed ${T.accent}`, backgroundColor: `${T.accent}10`,
      color: T.accent, fontWeight: '700', fontSize: '16px', cursor: 'pointer',
      marginBottom: '18px', display: 'flex', justifyContent: 'center',
      alignItems: 'center', gap: '10px', fontFamily: "'DM Sans', sans-serif"
    },
    roomCard: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 18px', margin: '6px 0', borderRadius: '16px',
      border: `1px solid ${T.accent}20`, backgroundColor: T.bg,
      boxShadow: `0 2px 8px rgba(0,0,0,0.05)`, cursor: 'pointer',
      color: T.text, fontWeight: '500', fontSize: '15px'
    },
    roomCardSearch: {
      padding: '14px 16px', margin: '8px 0', borderRadius: '12px',
      border: `1px dashed ${T.accent}`, backgroundColor: `${T.accent}05`,
      cursor: 'pointer', color: T.text, fontSize: '15px'
    },
    unreadBadge: {
      backgroundColor: '#ef4444', color: '#fff', borderRadius: '20px',
      padding: '3px 10px', fontSize: '12px', fontWeight: '700', flexShrink: 0
    },
    messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
    emptyRoom: { textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.45, fontSize: '15px' },
    getBubbleWrapper: (isMe) => ({
      display: 'flex', flexDirection: 'column',
      alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%'
    }),
    getBubble: (isMe) => ({
      padding: '11px 16px',
      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      backgroundColor: isMe ? T.accent : `${T.accent}15`,
      color: isMe ? T.bg : T.text,
      border: isMe ? 'none' : `1px solid ${T.accent}20`,
      maxWidth: '78%', fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word'
    }),
    senderName: {
      fontSize: '12px', marginBottom: '3px', opacity: 0.6,
      fontWeight: '700', color: T.text, marginLeft: '4px'
    },
    statusBar: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', marginRight: '4px' },
    timestamp: { fontSize: '11px', opacity: 0.4, color: T.text },
    readTick: (r) => ({ fontSize: '12px', color: r ? '#3b82f6' : T.text, opacity: r ? 1 : 0.4 }),
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.45, padding: 0 },

    inputArea: {
      display: 'flex', padding: '12px 16px', alignItems: 'center',
      gap: '10px', backgroundColor: T.bg, borderTop: `1px solid ${T.accent}15`, flexShrink: 0
    },
    inputField: {
      flex: 1, padding: '14px 18px', borderRadius: '30px',
      border: `1px solid ${T.accent}30`, fontSize: '16px',
      backgroundColor: `${T.accent}05`, color: T.text, outline: 'none',
      fontFamily: "'DM Sans', sans-serif"
    },
    sendBtn: {
      padding: '14px 22px', borderRadius: '30px', border: 'none',
      cursor: 'pointer', fontWeight: '700', fontSize: '16px',
      backgroundColor: T.accent, color: T.bg, flexShrink: 0
    },
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex',
      justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, backdropFilter: 'blur(6px)'
    },
    modalBox: {
      backgroundColor: T.bg, padding: '24px', borderRadius: '20px',
      width: '90%', maxWidth: '400px', border: `1px solid ${T.accent}40`,
      boxShadow: `0 10px 40px rgba(0,0,0,0.2)`, maxHeight: '80vh', overflowY: 'auto'
    },
    selectedFriendPill: {
      display: 'inline-block', padding: '5px 12px', borderRadius: '15px',
      backgroundColor: `${T.accent}20`, color: T.accent,
      fontSize: '13px', margin: '3px', fontWeight: '700'
    },
    callBanner: {
      backgroundColor: `${T.accent}15`, color: T.text, padding: '10px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: `1px solid ${T.accent}40`, fontWeight: '500', fontSize: '14px', flexShrink: 0
    },
    declineBtn: {
      padding: '6px 16px', background: '#ef4444', color: '#fff',
      border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '700'
    },
    autoScrollBtn: (active) => ({
      position: 'absolute', bottom: '88px', right: '16px',
      width: '38px', height: '38px', borderRadius: '50%', border: 'none',
      backgroundColor: active ? T.accent : `${T.accent}30`,
      color: active ? T.bg : T.accent, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '16px', zIndex: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }),
    bridgeOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex',
      flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      zIndex: 2000, backdropFilter: 'blur(12px)', textAlign: 'center', padding: '24px'
    },
    bridgeBtn: {
      padding: '18px 40px', borderRadius: '50px', backgroundColor: '#4ade80',
      color: '#000', border: 'none', fontWeight: '700', fontSize: '18px',
      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
    }
  };

  // ─── INIT: KEYS + USER ───────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      const { data } = await supabase.from('rooms').select('*');
      if (data) setRooms(data);

      if (user) {
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

  // ─── INCOMING CALL VIA NAV STATE ─────────────────────────────────────────
  useEffect(() => {
    if (location.state?.incomingCallRoom) {
      const room = location.state.incomingCallRoom;
      window.history.replaceState({}, document.title);
      if (activeRoomRef.current?.id === room.id) {
        if (!isInCallRef.current) joinCall();
      } else {
        autoJoinRef.current = true;
        setActiveRoom(room);
      }
    }
  }, [location.state]);

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const deriveAESKey = async (publicKeyStr) => {
    if (!myMasterKeyRef.current || !publicKeyStr) return null;
    try {
      const pub = await SecurityKit.importPublicKey(publicKeyStr);
      const bits = await SecurityKit.deriveSecretBits(myMasterKeyRef.current, pub);
      return await SecurityKit.createAESKey(bits);
    } catch (e) { console.error("Key derivation failed", e); return null; }
  };

  const fetchAndDecryptMessages = async (roomId) => {
    const { data } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
    if (!data) return [];
    
    const aesKey = activeAESKeysRef.current[roomId];
    const friendHasKey = friendHasKeyRef.current[roomId];
    
    return Promise.all(data.map(m => decryptOneMessage(m, aesKey, friendHasKey)));
  };

  const retryPendingDecrypts = async (roomId) => {
    const aesKey = activeAESKeysRef.current[roomId];
    const friendHasKey = friendHasKeyRef.current[roomId];
    
    if (!aesKey) return;
    setMessages(prev => {
      if (!prev.some(m => m._needs_decrypt)) return prev;
      Promise.all(prev.map(m => m._needs_decrypt ? decryptOneMessage(m, aesKey, friendHasKey) : Promise.resolve(m)))
        .then(updated => setMessages(updated));
      return prev; 
    });
  };

  // ─── MAIN ROOM EFFECT ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom || !currentUser || !isVaultUnlocked) return;
    let isSubscribed = true;

    const setup = async () => {
      const friendId = activeRoom.is_private
        ? activeRoom.participants.find(id => id !== currentUser.id)
        : null;

      if (friendId && myMasterKeyRef.current) {
        let resolveKeyReady;
        aesKeyReadyRef.current[activeRoom.id] = new Promise(res => { resolveKeyReady = res; });

        const { data: fp } = await supabase.from('profiles').select('public_key').eq('id', friendId).maybeSingle();
        
        if (fp?.public_key) {
          friendHasKeyRef.current[activeRoom.id] = true;
          const key = await deriveAESKey(fp.public_key);
          if (key) activeAESKeysRef.current[activeRoom.id] = key;
        } else {
          friendHasKeyRef.current[activeRoom.id] = false;
        }

        resolveKeyReady();

        if (isSubscribed) await retryPendingDecrypts(activeRoom.id);

        if (keyWatcherChannelRef.current) {
          await supabase.removeChannel(keyWatcherChannelRef.current);
          keyWatcherChannelRef.current = null;
        }
        keyWatcherChannelRef.current = supabase
          .channel(`key-watch-${activeRoom.id}-${friendId}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${friendId}` },
            async (payload) => {
              const newPub = payload.new?.public_key;
              if (newPub && newPub !== payload.old?.public_key) {
                friendHasKeyRef.current[activeRoom.id] = true;
                const freshKey = await deriveAESKey(newPub);
                if (freshKey && isSubscribed) {
                  activeAESKeysRef.current[activeRoom.id] = freshKey;
                  const msgs = await fetchAndDecryptMessages(activeRoom.id);
                  setMessages(msgs);
                }
              }
            }).subscribe();
      } else {
        friendHasKeyRef.current[activeRoom.id] = false;
        aesKeyReadyRef.current[activeRoom.id] = Promise.resolve();
      }

      const msgs = await fetchAndDecryptMessages(activeRoom.id);
      if (isSubscribed) {
        setMessages(msgs);
        const unreadIds = msgs.filter(m => !m.is_read && m.user_id !== currentUser.id).map(m => m.id);
        if (unreadIds.length > 0) supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        setUnreadCounts(prev => ({ ...prev, [activeRoom.id]: 0 }));
      }
    };

    setup();

    // ── Realtime messages ──
    const chatCh = supabase.channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const raw = { ...payload.new };

            const keyReady = aesKeyReadyRef.current[activeRoom.id];
            if (keyReady) await keyReady;

            const decrypted = await decryptOneMessage(raw, activeAESKeysRef.current[activeRoom.id], friendHasKeyRef.current[activeRoom.id]);
            setMessages(prev => prev.find(m => m.id === decrypted.id) ? prev : [...prev, decrypted]);
            if (decrypted.user_id !== currentUser.id) {
              supabase.from('messages').update({ is_read: true }).eq('id', decrypted.id).then();
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old?.id));
          }
        }).subscribe();

    // ── Presence / typing ──
    const presenceCh = supabase.channel(`presence-${activeRoom.id}`, { config: { presence: { key: currentUser.id } } });
    presenceChannelRef.current = presenceCh;
    presenceCh
      .on('presence', { event: 'sync' }, () => {
        const state = presenceCh.presenceState();
        const active = {};
        Object.keys(state).forEach(k => { if (k !== currentUser.id) active[k] = state[k][0]; });
        setPresentUsers(active);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await presenceCh.track({ email: currentUser.email, is_typing: false });
      });

    // ── WebRTC signaling ──
    const sigCh = supabase.channel(`signaling-${activeRoom.id}`, { config: { broadcast: { ack: false } } });
    signalingChannelRef.current = sigCh;

    sigCh.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
      if (payload.sender === currentUser.id) return;
      try {
        if (payload.publicKey && callPrivateKeyRef.current && !callSharedSecretRef.current) {
          try {
            const pub = await SecurityKit.importPublicKey(payload.publicKey);
            const secret = await SecurityKit.deriveSecretBits(callPrivateKeyRef.current, pub);
            callSharedSecretRef.current = Array.from(new Uint8Array(secret)).map(b => b.toString(16).padStart(2, '0')).join('');
          } catch (e) { console.warn("ECDH call handshake skipped"); }
        }
        if (payload.type === 'user-joined' && isInCallRef.current) {
          const pc = createPeerConnection(payload.sender);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sigCh.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'offer', sdp: offer, sender: currentUser.id, target: payload.sender, publicKey: callPublicKeyStrRef.current } });
        }
        else if (payload.type === 'offer' && payload.target === currentUser.id) {
          const pc = createPeerConnection(payload.sender);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          for (const c of (iceCandidateQueue.current[payload.sender] || []))
            await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
          iceCandidateQueue.current[payload.sender] = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sigCh.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'answer', sdp: answer, sender: currentUser.id, target: payload.sender } });
        }
        else if (payload.type === 'answer' && payload.target === currentUser.id) {
          const pc = peers.current[payload.sender];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            for (const c of (iceCandidateQueue.current[payload.sender] || []))
              await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
            iceCandidateQueue.current[payload.sender] = [];
          }
        }
        else if (payload.type === 'ice-candidate' && payload.target === currentUser.id) {
          const pc = peers.current[payload.sender];
          if (pc) {
            if (pc.remoteDescription?.type) {
              pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(console.warn);
            } else {
              if (!iceCandidateQueue.current[payload.sender]) iceCandidateQueue.current[payload.sender] = [];
              iceCandidateQueue.current[payload.sender].push(payload.candidate);
            }
          }
        }
        else if (payload.type === 'user-left') { removePeer(payload.sender); cleanupCall(); }
      } catch (err) { console.error("Signaling error:", err); }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED' && autoJoinRef.current) { autoJoinRef.current = false; joinCall(); }
    });

    return () => {
      isSubscribed = false;
      supabase.removeChannel(chatCh);
      supabase.removeChannel(presenceCh);
      supabase.removeChannel(sigCh);
      if (keyWatcherChannelRef.current) { supabase.removeChannel(keyWatcherChannelRef.current); keyWatcherChannelRef.current = null; }
    };
  }, [activeRoom, currentUser, isVaultUnlocked]);

  // ─── SEND ────────────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    const raw = message;
    setMessage(""); setIsTyping(false);
    if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });

    let content = "";
    const aesKey = activeAESKeysRef.current[activeRoom.id];
    if (aesKey) {
      try { 
        const enc = await SecurityKit.encryptText(raw, aesKey); 
        content = `${enc.iv}:::${enc.cipherText}`; 
      } catch (e) { console.error("Encrypt failed, XOR fallback", e); }
    }
    
    if (!content) {
      const k = String(activeRoom.id);
      content = btoa(encodeURIComponent(raw).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(i % k.length))).join(''));
    }
    await supabase.from('messages').insert([{ content, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email }]);
  };

  // ─── CALL WATCHERS ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCallId) return;
    const w = supabase.channel(`status-board-${activeCallId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${activeCallId}` }, (p) => {
        if (p.new.status === 'accepted' && ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        if (['rejected', 'ended', 'missed'].includes(p.new.status)) cleanupCall();
      }).subscribe();
    return () => supabase.removeChannel(w);
  }, [activeCallId]);

  useEffect(() => {
    if (!activeCallId) return;
    const hb = setInterval(async () => {
      if (activeCallIdRef.current) {
        const { data } = await supabase.from('calls').select('status').eq('id', activeCallIdRef.current).maybeSingle();
        if (data && ['rejected', 'ended', 'missed'].includes(data.status)) cleanupCall();
      }
    }, 3000);
    return () => clearInterval(hb);
  }, [activeCallId]);

  useEffect(() => {
    if (!currentUser) return;
    const r = supabase.channel('global-call-radar-caller-listener')
      .on('broadcast', { event: 'global-ring' }, async ({ payload }) => {
        if (payload.action === 'cancel' && payload.callerId === currentUser.id) {
          if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'rejected' }).eq('id', activeCallIdRef.current);
          cleanupCall();
        }
      }).subscribe();
    return () => supabase.removeChannel(r);
  }, [currentUser]);

  // ─── UNREAD + ROOM/MSG SCANNERS ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from('messages').select('room_id').eq('is_read', false).neq('user_id', currentUser.id);
      const counts = {};
      if (data) data.forEach(m => { counts[m.room_id] = (counts[m.room_id] || 0) + 1; });
      setUnreadCounts(counts);
    })();
    const rc = supabase.channel('live-rooms-radar')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (p) => {
        if (p.new.participants?.includes(currentUser.id)) setRooms(prev => [...prev, p.new]);
      }).subscribe();
    const mc = supabase.channel('global-message-scanner')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p) => {
        if (p.new.user_id !== currentUser.id && activeRoomRef.current?.id !== p.new.room_id)
          setUnreadCounts(prev => ({ ...prev, [p.new.room_id]: (prev[p.new.room_id] || 0) + 1 }));
      }).subscribe();
    return () => { supabase.removeChannel(rc); supabase.removeChannel(mc); };
  }, [currentUser?.id]);

  // ─── AUTO SCROLL ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAutoScrolling && chatBoxRef.current)
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeRoom]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping && presenceChannelRef.current) { setIsTyping(true); presenceChannelRef.current.track({ email: currentUser.email, is_typing: true }); }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });
    }, 2000);
  };

  const formatTime = (ds) => ds ? new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";

  // ─── TURN SERVERS ────────────────────────────────────────────────────────
  const fetchSecureTrucks = async () => {
    try {
      const { data } = await supabase.functions.invoke('get-turn-credentials');
      if (data?.iceServers) { iceServersRef.current = data; return; }
    } catch (e) { console.warn("TURN fetch failed, using fallback"); }
    iceServersRef.current = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
      ]
    };
  };

  // ─── PEER CONNECTION ─────────────────────────────────────────────────────
  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(iceServersRef.current);
    peers.current[peerId] = pc;
    if (localStream.current) localStream.current.getTracks().forEach(t => pc.addTrack(t, localStream.current));
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      remoteStreamRef.current = stream;
      const audio = document.getElementById('sukoon-remote-audio');
      if (audio) { audio.srcObject = stream; audio.playsInline = true; }
      setShowAudioBridge(true);
    };
    pc.onicecandidate = (ev) => {
      if (ev.candidate && signalingChannelRef.current)
        signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'ice-candidate', candidate: ev.candidate, sender: currentUser.id, target: peerId } });
    };
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE state [${peerId}]:`, pc.iceConnectionState);
      if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) cleanupCall();
    };
    return pc;
  };

  const removePeer = (id) => { if (peers.current[id]) { peers.current[id].close(); delete peers.current[id]; } };
  const sendGlobalSignal = (p) => supabase.channel('global-call-radar').send({ type: 'broadcast', event: 'global-ring', payload: p });

  // ─── START CALL ──────────────────────────────────────────────────────────
  const startCall = async () => {
    if (isInCallRef.current || !activeRoom) return;
    try {
      await new Promise(r => setTimeout(r, 300));
      await fetchSecureTrucks();
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      safeSetIsInCall(true);
      try { const kp = await SecurityKit.generateKeys(); callPrivateKeyRef.current = kp.privateKey; callPublicKeyStrRef.current = await SecurityKit.exportPublicKey(kp.publicKey); } catch (e) { console.warn("Call key gen failed"); }
      const friendId = activeRoom.participants.find(id => id !== currentUser.id);
      let callId = null;
      if (friendId) {
        await supabase.from('calls').delete().eq('caller_id', currentUser.id).eq('status', 'ringing');
        const { data: nc } = await supabase.from('calls').insert({ caller_id: currentUser.id, receiver_id: friendId, status: 'ringing', caller_public_key: callPublicKeyStrRef.current }).select().single();
        if (nc) {
          setActiveCallId(nc.id); activeCallIdRef.current = nc.id; callId = nc.id;
          ringTimeoutRef.current = setTimeout(async () => {
            if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'missed' }).eq('id', activeCallIdRef.current);
            if (activeRoomRef.current) sendGlobalSignal({ action: 'cancel', roomId: activeRoomRef.current.id, callerId: currentUser.id, participants: activeRoomRef.current.participants });
            cleanupCall();
          }, 30000);
        }
        const { data: fp } = await supabase.from('profiles').select('fcm_token').eq('id', friendId).maybeSingle();
        if (fp?.fcm_token) await supabase.functions.invoke('send-call-notification', { body: { token: fp.fcm_token, callerName: currentUser.email.split('@')[0], roomId: activeRoom.id } });
      }
      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'call-started', sender: currentUser.id, callerEmail: currentUser.email, publicKey: callPublicKeyStrRef.current } });
      sendGlobalSignal({ action: 'start', roomId: activeRoom.id, callerId: currentUser.id, callerEmail: currentUser.email, participants: activeRoom.participants, roomDetails: activeRoom, publicKey: callPublicKeyStrRef.current, callId });
    } catch (e) { alert("Microphone Access Failed: " + e.message); }
  };

  // ─── JOIN CALL ───────────────────────────────────────────────────────────
  const joinCall = async () => {
    try {
      await fetchSecureTrucks();
      const { data: ic } = await supabase.from('calls').select('id').eq('receiver_id', currentUser.id).eq('status', 'ringing').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (ic) { setActiveCallId(ic.id); activeCallIdRef.current = ic.id; }
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      safeSetIsInCall(true);
      try { const kp = await SecurityKit.generateKeys(); callPrivateKeyRef.current = kp.privateKey; callPublicKeyStrRef.current = await SecurityKit.exportPublicKey(kp.publicKey); } catch (e) { console.warn("Join key gen failed"); }
      if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'accepted', receiver_public_key: callPublicKeyStrRef.current || null }).eq('id', activeCallIdRef.current);
      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-joined', sender: currentUser.id, publicKey: callPublicKeyStrRef.current } });
    } catch (e) { alert("Failed to join call: " + e.message); }
  };

  // ─── END + CLEANUP ───────────────────────────────────────────────────────
  const endCall = async () => {
    try {
      if (signalingChannelRef.current) signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-left', sender: currentUser.id } });
      if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'ended' }).eq('id', activeCallIdRef.current);
      if (activeRoom) sendGlobalSignal({ action: 'cancel', roomId: activeRoom.id, callerId: currentUser.id, participants: activeRoom.participants });
    } catch (e) { console.error(e); } finally { cleanupCall(); }
  };

  const cleanupCall = () => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (audio) { audio.pause(); audio.srcObject = null; audio.load(); }
    remoteStreamRef.current = null;
    Object.values(peers.current).forEach(pc => { pc.onicecandidate = null; pc.ontrack = null; pc.oniceconnectionstatechange = null; pc.close(); });
    peers.current = {}; iceCandidateQueue.current = {};
    if (localStream.current) { localStream.current.getTracks().forEach(t => t.stop()); localStream.current = null; }
    safeSetIsInCall(false); setShowAudioBridge(false);
    callPrivateKeyRef.current = null; callPublicKeyStrRef.current = null; callSharedSecretRef.current = null;
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    setActiveCallId(null); activeCallIdRef.current = null;
  };

  // ─── AUDIO BRIDGE (iOS + Old Android) ────────────────────────────────────
  const handleStartAudio = () => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (!audio) { setShowAudioBridge(false); return; }
    if (remoteStreamRef.current && !audio.srcObject) audio.srcObject = remoteStreamRef.current;
    audio.playsInline = true;
    audio.muted = false;
    audio.play().then(() => setShowAudioBridge(false)).catch(e => {
      console.error("Audio play failed:", e);
      setTimeout(() => { audio.play().catch(console.error); setShowAudioBridge(false); }, 500);
    });
  };

  // ─── CHAT MANAGEMENT ─────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!currentUser || searchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${searchTerm}%`).neq('id', currentUser.id);
    setSearchResults(data || []);
  };
  const startPrivateChat = async (friend) => {
    const { data: ex } = await supabase.from('rooms').select('*').eq('is_private', true).contains('participants', [currentUser.id, friend.id]);
    if (ex?.length > 0) { setActiveRoom(ex[0]); }
    else {
      const { data: nr } = await supabase.from('rooms').insert([{ name: `${currentUser.email}:::${friend.email}`, is_private: true, participants: [currentUser.id, friend.id] }]).select();
      if (nr) { setRooms(p => [...p, nr[0]]); setActiveRoom(nr[0]); }
    }
    setSearchTerm(""); setSearchResults([]);
  };
  const searchForGroup = async () => {
    if (!currentUser || groupSearchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${groupSearchTerm}%`).neq('id', currentUser.id);
    setGroupSearchResults(data || []);
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
  const getRoomDisplayName = (room) => {
    if (room.is_private && room.name.includes(':::')) {
      const [a, b] = room.name.split(':::');
      return `✨ ${currentUser?.email === b ? a.split('@')[0] : b.split('@')[0]}`;
    }
    return `👥 ${room.name}`;
  };
  const handleLogout = async () => {
    if (!window.confirm(hi ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?")) return;
    await supabase.auth.signOut(); setTab('home'); window.location.reload();
  };
  const handleDeleteMessage = async (id) => {
    if (!window.confirm(hi ? "हटाएं?" : "Delete?")) return;
    setMessages(p => p.filter(m => m.id !== id));
    await supabase.from('messages').delete().eq('id', id);
  };
  const handleBackOrHome = () => {
    setIsAutoScrolling(false);
    if (isInCallRef.current) endCall();
    if (activeRoom) setUnreadCounts(p => ({ ...p, [activeRoom.id]: 0 }));
    activeRoom ? setActiveRoom(null) : setTab('home');
  };

  const typingUsers = Object.values(presentUsers).filter(u => u.is_typing);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={s.container}>
      <audio id="sukoon-remote-audio" autoPlay playsInline muted
        style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }} />

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
          <button
            style={isInCallRef.current ? s.callBtnDisabled : s.callBtn}
            onClick={startCall} disabled={isInCallRef.current}
            title={hi ? "वॉयस कॉल" : "Voice call"}
          >📞</button>
        ) : (
          <button style={s.logoutBtn} onClick={handleLogout}>{hi ? "लॉग आउट" : "Logout"}</button>
        )}
      </div>

      {isInCall && (
        <div style={s.callBanner}>
          <span style={{ color: '#4ade80' }}>🟢 {hi ? "कॉल जारी है" : "Secure Call Active"}</span>
          <button onClick={endCall} style={s.declineBtn}>{hi ? "कॉल समाप्त करें" : "End Call"}</button>
        </div>
      )}

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

      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          <>
            <button style={s.bigGroupBtn} onClick={() => setShowGroupModal(true)}>
              👥 {hi ? "+ नया ग्रुप बनाएं" : "+ Create New Group"}
            </button>
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
                const content = m._needs_decrypt
                  ? "🔄 Decrypting..."
                  : (m.decrypted_content || "🔒 [Encrypted]");
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

      {activeRoom && messages.length > 5 && (
        <button onClick={() => setIsAutoScrolling(!isAutoScrolling)} style={s.autoScrollBtn(isAutoScrolling)}>
          {isAutoScrolling ? "⏸️" : "⏬"}
        </button>
      )}

      {activeRoom && typingUsers.length > 0 && (
        <div style={{ fontSize: '12px', color: T.accent, padding: '0 18px 6px', fontStyle: 'italic', fontWeight: '700', flexShrink: 0 }}>
          {typingUsers.map(u => u.email?.split('@')[0]).join(', ')} {hi ? "टाइप कर रहे हैं..." : "is typing..."}
        </div>
      )}

      {activeRoom && (
        <div style={s.inputArea}>
          <input style={s.inputField} value={message} onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={hi ? "संदेश लिखें..." : "Type a secure message..."} />
          <button style={s.sendBtn} onClick={handleSendMessage}>➤</button>
        </div>
      )}
    </div>
  );
}