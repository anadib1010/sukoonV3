import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; 
import { supabase } from '../supabase';
import { requestFirebaseToken } from '../firebaseSetup'; 

// ─── THE SECURITY KIT (ECDH) ───
const SecurityKit = {
  generateKeys: async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true, 
      ["deriveKey", "deriveBits"]
    );
    return keyPair;
  },
  exportMixture: async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  },
  importMixture: async (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return await window.crypto.subtle.importKey(
      "spki", bytes, { name: "ECDH", namedCurve: "P-256" }, true, []
    );
  },
  deriveSecret: async (myPrivateKey, theirPublicKey) => {
    const sharedSecret = await window.crypto.subtle.deriveBits(
      { name: "ECDH", public: theirPublicKey },
      myPrivateKey,
      256
    );
    return sharedSecret; 
  }
};

// ─── 🌟 THE NEW DISPOSABLE SPEAKER BOX 🌟 ───
// This guarantees a fresh, un-muted speaker for every single call!
const AudioPlayer = ({ stream }) => {
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      // We give the old Android phone exactly 100 milliseconds to catch its breath before playing!
      setTimeout(() => {
        audioRef.current?.play().catch(e => console.log("Old Android Auto-play wait:", e));
      }, 100);
    }
  }, [stream]);

  // Using visibility: hidden instead of display: none so the phone doesn't mute it!
  return <audio ref={audioRef} autoPlay playsInline style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }} />;
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
  
  const [remoteStreams, setRemoteStreams] = useState([]); 
  const localStream = useRef(null);
  const peers = useRef({}); 
  const signalingChannelRef = useRef(null);
  const autoJoinRef = useRef(false);

  const iceCandidateQueue = useRef({}); 
  const ringTimeoutRef = useRef(null);
  const iceServersRef = useRef({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  const myPrivateKeyRef = useRef(null); 
  const myPublicKeyStrRef = useRef(null); 
  const sharedSecretRef = useRef(null); 
  
  const [activeCallId, setActiveCallId] = useState(null);
  const activeCallIdRef = useRef(null);

  const safeSetIsInCall = (status) => {
    setIsInCall(status);
    isInCallRef.current = status;
  };

  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${T.accent}20`, backgroundColor: `${T.bg}95`, backdropFilter: 'blur(10px)', zIndex: 10 },
    headerTitleBox: { flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    headerTitle: { fontWeight: 'bold', fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px', color: T.text },
    onlineStatus: { fontSize: '11px', color: '#4ade80', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' },
    greenDot: { width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #4ade80' },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', backgroundColor: `${T.accent}20`, color: T.accent, transition: '0.2s' },
    logoutBtn: { padding: '8px 16px', borderRadius: '20px', border: `1px solid ${T.accent}30`, cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', background: 'transparent', color: T.text, opacity: 0.8 },
    callBtn: { padding: '10px', background: `${T.accent}15`, border: `1px solid ${T.accent}40`, borderRadius: '50%', cursor: 'pointer', fontSize: '18px', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
    callBtnDisabled: { padding: '10px', background: 'transparent', border: 'none', cursor: 'not-allowed', fontSize: '18px', opacity: 0.4 },
    chatBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollBehavior: 'smooth' },
    searchRow: { display: 'flex', gap: '10px', marginBottom: '15px' },
    searchInput: { flex: 1, padding: '14px 20px', borderRadius: '30px', border: `1px solid ${T.accent}30`, fontSize: '15px', backgroundColor: `${T.accent}05`, color: T.text, outline: 'none' },
    actionBtn: { padding: '14px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: T.accent, color: T.bg, boxShadow: `0 4px 15px ${T.accent}40`, transition: '0.2s' },
    bigGroupBtn: { width: '100%', padding: '15px', borderRadius: '16px', border: `2px dashed ${T.accent}`, backgroundColor: `${T.accent}10`, color: T.accent, fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
    roomCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', margin: '8px 0', borderRadius: '16px', border: `1px solid ${T.accent}20`, backgroundColor: `${T.bg}`, boxShadow: `0 2px 10px rgba(0,0,0,0.05)`, cursor: 'pointer', color: T.text, fontWeight: '500' },
    roomCardSearch: { padding: '15px', margin: '10px 0', borderRadius: '12px', border: `1px dashed ${T.accent}`, backgroundColor: `${T.accent}05`, cursor: 'pointer', color: T.text },
    unreadBadge: { backgroundColor: '#ef4444', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' },
    messageList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
    emptyRoom: { textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.5, color: T.text },
    getBubbleWrapper: (isMe) => ({ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }),
    getBubble: (isMe) => ({ padding: '12px 18px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', backgroundColor: isMe ? T.accent : `${T.accent}15`, color: isMe ? T.bg : T.text, border: isMe ? 'none' : `1px solid ${T.accent}20`, maxWidth: '75%', fontSize: '15px', lineHeight: '1.4' }),
    senderName: { fontSize: '11px', marginBottom: '4px', opacity: 0.7, fontWeight: 'bold', color: T.text, marginLeft: '5px' },
    statusBar: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginRight: '5px' },
    timestamp: { fontSize: '10px', opacity: 0.5, color: T.text },
    readTick: (isRead) => ({ fontSize: '12px', color: isRead ? '#3b82f6' : T.text, opacity: isRead ? 1 : 0.4 }),
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: 0.5, padding: 0 },
    inputArea: { display: 'flex', padding: '15px 20px', alignItems: 'center', gap: '10px', backgroundColor: T.bg, borderTop: `1px solid ${T.accent}15` },
    inputField: { flex: 1, padding: '15px 20px', borderRadius: '30px', border: `1px solid ${T.accent}30`, fontSize: '15px', backgroundColor: `${T.accent}05`, color: T.text, outline: 'none' },
    sendBtn: { padding: '15px 25px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: T.accent, color: T.bg },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' },
    modalBox: { backgroundColor: T.bg, padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '400px', border: `1px solid ${T.accent}40`, boxShadow: `0 10px 40px rgba(0,0,0,0.2)` },
    selectedFriendPill: { display: 'inline-block', padding: '5px 12px', borderRadius: '15px', backgroundColor: `${T.accent}20`, color: T.accent, fontSize: '12px', margin: '2px', fontWeight: 'bold' },
    callBanner: { backgroundColor: `${T.accent}15`, color: T.text, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.accent}40`, fontWeight: '500', fontSize: '14px', zIndex: 50 },
    declineBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' },
    autoScrollBtn: (active) => ({ 
      position: 'absolute', bottom: '100px', right: '20px', width: '40px', height: '40px', 
      borderRadius: '50%', border: 'none', backgroundColor: active ? T.accent : `${T.accent}30`, 
      color: active ? T.bg : T.accent, cursor: 'pointer', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', fontSize: '18px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100, transition: '0.3s' 
    })
  };

  useEffect(() => {
    async function initialize() {
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") Notification.requestPermission();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      const { data } = await supabase.from('rooms').select('*');
      if (data) setRooms(data);
      
      if (user) {
        try {
          const token = await requestFirebaseToken();
          if (token) {
            await supabase.from('profiles').upsert({ id: user.id, email: user.email, fcm_token: token });
          }
        } catch (e) { console.log("Could not register Nightwatchman: ", e); }
      }
      setLoading(false);
    }
    initialize();
  }, []);

  useEffect(() => {
    if (!activeCallId) return;
    const boardWatcher = supabase.channel(`status-board-${activeCallId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${activeCallId}` },
      (payload) => {
         const newStatus = payload.new.status;
         if (newStatus === 'accepted' && ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
         if (['rejected', 'ended', 'missed'].includes(newStatus)) cleanupCall();
      }).subscribe();
    return () => supabase.removeChannel(boardWatcher);
  }, [activeCallId]);

  useEffect(() => {
    if (!activeCallId) return;
    const heartbeat = setInterval(async () => {
      if (activeCallIdRef.current) {
        const { data } = await supabase.from('calls').select('status').eq('id', activeCallIdRef.current).maybeSingle();
        if (data && ['rejected', 'ended', 'missed'].includes(data.status)) cleanupCall();
      }
    }, 3000);
    return () => clearInterval(heartbeat);
  }, [activeCallId]);

  useEffect(() => {
    if (!currentUser) return;
    const globalRadar = supabase.channel('global-call-radar-caller-listener')
      .on('broadcast', { event: 'global-ring' }, async ({ payload }) => {
         if (payload.action === 'cancel' && payload.callerId === currentUser.id) {
             if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'rejected' }).eq('id', activeCallIdRef.current);
             cleanupCall();
         }
      }).subscribe();
    return () => supabase.removeChannel(globalRadar);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchInitialUnread = async () => {
      const { data } = await supabase.from('messages').select('room_id').eq('is_read', false).neq('user_id', currentUser.id);
      const counts = {};
      if (data) { data.forEach(msg => { counts[msg.room_id] = (counts[msg.room_id] || 0) + 1; }); setUnreadCounts(counts); }
    };
    fetchInitialUnread();

    const roomChannel = supabase.channel('live-rooms-radar').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' },
      (payload) => { if (payload.new.participants && payload.new.participants.includes(currentUser.id)) setRooms((prev) => [...prev, payload.new]); }).subscribe();

    const globalMessageScanner = supabase.channel('global-message-scanner').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        if (newMsg.user_id !== currentUser.id && activeRoomRef.current?.id !== newMsg.room_id) {
          setUnreadCounts(prev => ({ ...prev, [newMsg.room_id]: (prev[newMsg.room_id] || 0) + 1 }));
        }
      }).subscribe();

    return () => { supabase.removeChannel(roomChannel); supabase.removeChannel(globalMessageScanner); };
  }, [currentUser?.id]); 

  useEffect(() => {
    if (location.state?.incomingCallRoom && !activeRoomRef.current) {
      setActiveRoom(location.state.incomingCallRoom);
      autoJoinRef.current = true; 
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        const unreadIds = data.filter(m => !m.is_read && m.user_id !== currentUser.id).map(m => m.id);
        if (unreadIds.length > 0) supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        setUnreadCounts(prev => ({ ...prev, [activeRoom.id]: 0 }));
      }
    };
    fetchMessages();

    const lightningChannel = supabase
      .channel(`lightning-${activeRoom.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` }, 
        (payload) => {
          setMessages((prev) => {
             if (prev.find(m => m.id === payload.new.id)) return prev;
             return [...prev, payload.new];
          });
          if (payload.new.user_id !== currentUser.id) supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then();
        }
      ).subscribe();

    const chatChannel = supabase.channel(`room-${activeRoom.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
            if (payload.new.user_id !== currentUser.id) supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then();
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter(m => m.id !== payload.old?.id));
          }
        }).subscribe();

    const presenceRoom = supabase.channel(`presence-${activeRoom.id}`, { config: { presence: { key: currentUser.id } } });
    presenceChannelRef.current = presenceRoom;
    presenceRoom.on('presence', { event: 'sync' }, () => {
      const state = presenceRoom.presenceState();
      const activeUsers = {};
      Object.keys(state).forEach(key => { if (key !== currentUser.id) activeUsers[key] = state[key][0]; });
      setPresentUsers(activeUsers);
    }).subscribe(async (status) => { if (status === 'SUBSCRIBED') await presenceRoom.track({ email: currentUser.email, is_typing: false }); });

    const sigChannel = supabase.channel(`signaling-${activeRoom.id}`, { config: { broadcast: { ack: false } } });
    signalingChannelRef.current = sigChannel;

    sigChannel.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
      if (payload.sender === currentUser.id) return; 
      try {
        if (payload.publicKey && myPrivateKeyRef.current && !sharedSecretRef.current) {
          const theirPublicKey = await SecurityKit.importMixture(payload.publicKey);
          const finalSecret = await SecurityKit.deriveSecret(myPrivateKeyRef.current, theirPublicKey);
          const secretArray = Array.from(new Uint8Array(finalSecret));
          sharedSecretRef.current = secretArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        if (payload.type === 'user-joined' && isInCallRef.current) {
          const pc = createPeerConnection(payload.sender);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sigChannel.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'offer', sdp: offer, sender: currentUser.id, target: payload.sender, publicKey: myPublicKeyStrRef.current } });
        } 
        else if (payload.type === 'offer' && payload.target === currentUser.id) {
          const pc = createPeerConnection(payload.sender);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          
          if (iceCandidateQueue.current[payload.sender]) {
             iceCandidateQueue.current[payload.sender].forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(e=>console.log(e)));
             iceCandidateQueue.current[payload.sender] = [];
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sigChannel.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'answer', sdp: answer, sender: currentUser.id, target: payload.sender } });
        } 
        else if (payload.type === 'answer' && payload.target === currentUser.id) {
          const pc = peers.current[payload.sender];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            if (iceCandidateQueue.current[payload.sender]) {
               iceCandidateQueue.current[payload.sender].forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(e=>console.log(e)));
               iceCandidateQueue.current[payload.sender] = [];
            }
          }
        } 
        else if (payload.type === 'ice-candidate' && payload.target === currentUser.id) {
          const pc = peers.current[payload.sender];
          if (pc) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(e=>console.log("ICE Error", e));
            } else {
              if (!iceCandidateQueue.current[payload.sender]) iceCandidateQueue.current[payload.sender] = [];
              iceCandidateQueue.current[payload.sender].push(payload.candidate);
            }
          }
        } 
        else if (payload.type === 'user-left') {
          removePeer(payload.sender);
          cleanupCall();
        }
      } catch (err) { console.error("Signaling Error:", err); }

    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (autoJoinRef.current) {
          autoJoinRef.current = false;
          joinCall(); 
        }
      }
    });

    return () => { 
        supabase.removeChannel(chatChannel); 
        supabase.removeChannel(presenceRoom); 
        supabase.removeChannel(sigChannel); 
        supabase.removeChannel(lightningChannel);
    };
  }, [activeRoom, currentUser]); 

  useEffect(() => { if (!isAutoScrolling && chatBoxRef.current) chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, activeRoom]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping && presenceChannelRef.current) { setIsTyping(true); presenceChannelRef.current.track({ email: currentUser.email, is_typing: true }); }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { setIsTyping(false); if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false }); }, 2000);
  };

  const encrypt = (text, key) => { return btoa(encodeURIComponent(text).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ String(key).charCodeAt(i % String(key).length))).join('')); };
  const decrypt = (scrambled, key) => { try { return decodeURIComponent(atob(scrambled).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ String(key).charCodeAt(i % String(key).length))).join('')); } catch (e) { return scrambled; } };
  const formatTime = (dateString) => { if (!dateString) return "Just now"; return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

  const fetchSecureTrucks = async () => {
    try {
      // Put your actual Metered keys back into the app if the vault isn't working for the older phones, 
      // or continue using the secure vault invoke. For testing, hardcoding the fallback is okay!
      const { data } = await supabase.functions.invoke('get-turn-credentials');
      if (data && data.iceServers) {
        iceServersRef.current = data;
      }
    } catch (err) { console.error("Could not fetch secure trucks, using free STUN.", err); }
  };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(iceServersRef.current); 
    peers.current[peerId] = pc;
    if (localStream.current) localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));
    
    // 🌟 THE FIX: We build the fresh speaker box and throw it into our React state!
    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        // Clear out any old streams so we have a 100% fresh speaker
        const cleanList = prev.filter(p => p.userId !== peerId);
        return [...cleanList, { userId: peerId, stream: event.streams[0], uniqueId: Math.random() }];
      });
    };
    
    pc.onicecandidate = (event) => { if (event.candidate && signalingChannelRef.current) signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'ice-candidate', candidate: event.candidate, sender: currentUser.id, target: peerId } }); };
    pc.oniceconnectionstatechange = () => { if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) removePeer(peerId); };
    return pc;
  };

  const removePeer = (peerId) => { if (peers.current[peerId]) { peers.current[peerId].close(); delete peers.current[peerId]; } setRemoteStreams(prev => prev.filter(p => p.userId !== peerId)); };

  const sendGlobalSignal = (actionPayload) => {
    supabase.channel('global-call-radar').send({
      type: 'broadcast', event: 'global-ring', payload: actionPayload
    });
  };

  const startCall = async () => {
    if (isInCallRef.current || !activeRoom) return;
    try {
      await fetchSecureTrucks(); 
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      safeSetIsInCall(true);
      
      const keys = await SecurityKit.generateKeys();
      myPrivateKeyRef.current = keys.privateKey;
      myPublicKeyStrRef.current = await SecurityKit.exportMixture(keys.publicKey);

      const friendId = activeRoom.participants.find(id => id !== currentUser.id);
      let currentCallId = null;

      if (friendId) {
        const { data: newCall } = await supabase.from('calls').insert({
          caller_id: currentUser.id,
          receiver_id: friendId,
          status: 'ringing',
          caller_public_key: myPublicKeyStrRef.current
        }).select().single();

        if (newCall) {
          setActiveCallId(newCall.id);
          activeCallIdRef.current = newCall.id;
          currentCallId = newCall.id;

          ringTimeoutRef.current = setTimeout(async () => {
            if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'missed' }).eq('id', activeCallIdRef.current);
            if (activeRoomRef.current) sendGlobalSignal({ action: 'cancel', roomId: activeRoomRef.current.id, callerId: currentUser.id, participants: activeRoomRef.current.participants });
            cleanupCall();
          }, 30000); 
        }

        const { data: friendProfile } = await supabase.from('profiles').select('fcm_token').eq('id', friendId).maybeSingle(); 
        if (friendProfile?.fcm_token) {
          await supabase.functions.invoke('send-call-notification', { body: { token: friendProfile.fcm_token, callerName: currentUser.email.split('@')[0], roomId: activeRoom.id } });
        }
      }

      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'call-started', sender: currentUser.id, callerEmail: currentUser.email, publicKey: myPublicKeyStrRef.current } });
      sendGlobalSignal({ action: 'start', roomId: activeRoom.id, callerId: currentUser.id, callerEmail: currentUser.email, participants: activeRoom.participants, roomDetails: activeRoom, publicKey: myPublicKeyStrRef.current, callId: currentCallId });

    } catch (error) { alert("Microphone Access Failed: " + error.message); }
  };

  const joinCall = async () => {
    try {
      await fetchSecureTrucks(); 
      const { data: incomingCall } = await supabase.from('calls').select('id').eq('receiver_id', currentUser.id).eq('status', 'ringing').order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (incomingCall) {
        setActiveCallId(incomingCall.id);
        activeCallIdRef.current = incomingCall.id;
      }

      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      safeSetIsInCall(true);

      const keys = await SecurityKit.generateKeys();
      myPrivateKeyRef.current = keys.privateKey;
      myPublicKeyStrRef.current = await SecurityKit.exportMixture(keys.publicKey);

      if (activeCallIdRef.current) {
         await supabase.from('calls').update({ status: 'accepted', receiver_public_key: myPublicKeyStrRef.current }).eq('id', activeCallIdRef.current);
      }

      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-joined', sender: currentUser.id, publicKey: myPublicKeyStrRef.current } });
    } catch (error) { alert("Failed to join call: " + error.message); }
  };

  const endCall = async () => { 
    try {
      if (signalingChannelRef.current) signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-left', sender: currentUser.id } }); 
      if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'ended' }).eq('id', activeCallIdRef.current);
      if (activeRoom) sendGlobalSignal({ action: 'cancel', roomId: activeRoom.id, callerId: currentUser.id, participants: activeRoom.participants });
    } catch (error) {
      console.error("Failed to update database, forcing cleanup anyway!");
    } finally {
      cleanupCall(); 
    }
  };

  const cleanupCall = () => { 
    Object.values(peers.current).forEach(pc => {
       pc.onicecandidate = null;
       pc.ontrack = null;
       pc.oniceconnectionstatechange = null;
       pc.close();
    }); 
    peers.current = {}; 
    iceCandidateQueue.current = {}; 

    if (localStream.current) { localStream.current.getTracks().forEach(track => track.stop()); localStream.current = null; } 
    
    // 🌟 THE FIX: Throw all the old speaker boxes in the trash immediately!
    setRemoteStreams([]);

    safeSetIsInCall(false); 

    myPrivateKeyRef.current = null;
    myPublicKeyStrRef.current = null;
    sharedSecretRef.current = null;

    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    setActiveCallId(null);
    activeCallIdRef.current = null;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    const scrambledText = encrypt(message, activeRoom.id);
    setMessage(""); setIsTyping(false);
    if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });
    await supabase.from('messages').insert([{ content: scrambledText, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email }]);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm(hi ? "हटाएं?" : "Delete?")) return;
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

  const searchForGroup = async () => {
    if (!currentUser || groupSearchTerm.length < 3) return;
    const { data } = await supabase.from('profiles').select('*').ilike('email', `%${groupSearchTerm}%`).neq('id', currentUser.id);
    setGroupSearchResults(data || []);
  };

  const addFriendToGroupList = (friend) => {
    if (!selectedFriends.find(f => f.id === friend.id)) setSelectedFriends([...selectedFriends, friend]);
    setGroupSearchTerm(""); setGroupSearchResults([]);
  };

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return alert(hi ? "एक नाम और मित्र की आवश्यकता है!" : "Need a group name and at least 1 friend!");
    const participantIds = [currentUser.id, ...selectedFriends.map(f => f.id)];
    const { data: newRoom } = await supabase.from('rooms').insert([{ name: groupName, is_private: false, participants: participantIds }]).select();
    if (newRoom) { setRooms(prev => [...prev, newRoom[0]]); setShowGroupModal(false); setGroupName(""); setSelectedFriends([]); setActiveRoom(newRoom[0]); }
  };

  const getRoomDisplayName = (room) => {
    if (room.is_private && room.name.includes(':::')) {
      const parts = room.name.split(':::');
      return currentUser?.email === parts[1] ? `✨ ${parts[0].split('@')[0]}` : `✨ ${parts[1].split('@')[0]}`;
    }
    return `👥 ${room.name}`;
  };

  const handleLogout = async () => {
    if (!window.confirm(hi ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?")) return;
    await supabase.auth.signOut();
    setTab('home'); 
    window.location.reload();
  };

  const handleBackOrHome = () => {
    setIsAutoScrolling(false); if (isInCallRef.current) endCall();
    if (activeRoom) setUnreadCounts(prev => ({ ...prev, [activeRoom.id]: 0 }));
    activeRoom ? setActiveRoom(null) : setTab('home');
  };

  const typingUsers = Object.values(presentUsers).filter(user => user.is_typing);

  return (
    <div style={s.container}>
      {/* 🌟 THE FIX: Map over the stream array to build the Disposable Speaker Boxes! */}
      {remoteStreams.map(peer => (
        <AudioPlayer key={peer.uniqueId} stream={peer.stream} />
      ))}

      {showGroupModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h3 style={{ margin: '0 0 15px 0', color: T.text }}>{hi ? "नया ग्रुप बनाएं" : "Create New Group"}</h3>
            <input style={{...s.searchInput, width: '100%', marginBottom: '10px'}} placeholder={hi ? "ग्रुप का नाम..." : "Group Name..."} value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
              <input style={{...s.searchInput, flex: 1}} placeholder={hi ? "मित्र खोजें..." : "Find friends..."} value={groupSearchTerm} onChange={(e) => setGroupSearchTerm(e.target.value)} />
              <button style={s.actionBtn} onClick={searchForGroup}>🔍</button>
            </div>
            {groupSearchResults.map(u => ( <div key={u.id} onClick={() => addFriendToGroupList(u)} style={s.roomCardSearch}>+ Add {u.email.split('@')[0]}</div> ))}
            <div style={{ margin: '10px 0' }}>{selectedFriends.map(f => ( <span key={f.id} style={s.selectedFriendPill}>{f.email.split('@')[0]} ✕</span> ))}</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={{...s.actionBtn, flex: 1}} onClick={createGroupChat}>{hi ? "बनाएं" : "Create"}</button>
              <button style={{...s.backBtn, flex: 1}} onClick={() => setShowGroupModal(false)}>{hi ? "रद्द करें" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.header}>
        <button style={s.backBtn} onClick={handleBackOrHome}>{activeRoom ? "◀ BACK" : "◀ HOME"}</button>
        <div style={s.headerTitleBox}>
          <div style={s.headerTitle}>{activeRoom ? getRoomDisplayName(activeRoom) : "SUKOON CHAT"}</div>
          {activeRoom && Object.keys(presentUsers).length > 0 && (
            <div style={s.onlineStatus}><span style={s.greenDot}></span> {Object.keys(presentUsers).length} {hi ? "ऑनलाइन" : "Online"}</div>
          )}
        </div>
        
        {activeRoom && (
          <button style={isInCallRef.current ? s.callBtnDisabled : s.callBtn} onClick={startCall} disabled={isInCallRef.current}>📞</button>
        )}
        {!activeRoom && <button style={s.logoutBtn} onClick={handleLogout}>{hi ? "लॉग आउट" : "LOGOUT"}</button>}
      </div>

      {isInCallRef.current && (
        <div style={s.callBanner}>
          <span style={{ color: '#4ade80' }}>🟢 {hi ? `कॉल कनेक्टेड` : `Secure Call Active`}</span>
          <button onClick={endCall} style={s.declineBtn}>{hi ? "कॉल समाप्त करें" : "End Call"}</button>
        </div>
      )}

      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          <>
            <button style={s.bigGroupBtn} onClick={() => setShowGroupModal(true)}><span>👥</span> {hi ? "+ नया ग्रुप बनाएं" : "+ CREATE NEW GROUP"}</button>
            <div style={s.searchRow}>
              <input style={s.searchInput} placeholder={hi ? "ईमेल से खोजें..." : "Find friend by email..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              <button style={s.actionBtn} onClick={handleSearch}>{hi ? "खोजें" : "FIND"}</button>
            </div>
            {searchResults.map(user => ( <div key={user.id} onClick={() => startPrivateChat(user)} style={s.roomCardSearch}>✨ Start Private Chat with {user.email}</div> ))}
            
            <div style={{ marginTop: '20px', fontWeight: 'bold', letterSpacing: '1px', opacity: 0.7, fontSize: '12px' }}>{hi ? "आपके चैट" : "YOUR CHATS"}</div>
            {rooms.map(r => ( 
              <div key={r.id} style={s.roomCard} onClick={() => setActiveRoom(r)}>
                <span>{getRoomDisplayName(r)}</span>
                {unreadCounts[r.id] > 0 && <span style={s.unreadBadge}>{unreadCounts[r.id]}</span>}
              </div> 
            ))}
          </>
        ) : (
          <div style={s.messageList}>
            {messages.length === 0 ? ( <div style={s.emptyRoom}>{hi ? `चैट शुरू करें` : `Start the conversation...`}</div> ) : (
              messages.map(m => {
                const isMe = m.user_id === currentUser?.id;
                return (
                  <div key={m.id} style={s.getBubbleWrapper(isMe)}>
                    {!isMe && <div style={s.senderName}>{m.user_email?.split('@')[0]}</div>}
                    <div style={s.getBubble(isMe)}>{decrypt(m.content, activeRoom.id)}</div>
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

      {activeRoom && typingUsers.length > 0 && (
        <div style={{ fontSize: '11px', color: T.accent, padding: '0 20px 5px 20px', fontStyle: 'italic', fontWeight: 'bold' }}>
          {typingUsers.map(u => u.email?.split('@')[0]).join(', ')} {hi ? "टाइप कर रहे हैं..." : "is typing..."}
        </div>
      )}

      {activeRoom && (
        <div style={s.inputArea}>
          <input style={s.inputField} value={message} onChange={handleTyping} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={hi ? "संदेश लिखें..." : "Type a secure message..."} />
          <button style={s.sendBtn} onClick={handleSendMessage}>➤</button>
        </div>
      )}
    </div>
  );
}