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

// ─── DISPOSABLE SPEAKER BOX ───
const AudioPlayer = ({ stream }) => {
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      // We wait for the bridge click to handle the actual .play() command
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }}
    />
  );
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

  const [isInCall, setIsInCall] = useState(false);
  const isInCallRef = useRef(false); 
  
  // 🌟 NEW: State to trigger the user interaction bridge
  const [showAudioBridge, setShowAudioBridge] = useState(false);

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

  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${T.accent}20` },
    headerTitle: { fontWeight: 'bold', fontSize: '18px', color: T.text },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: `${T.accent}20`, color: T.accent },
    callBtn: { padding: '10px', background: `${T.accent}15`, border: `1px solid ${T.accent}40`, borderRadius: '50%', cursor: 'pointer', color: T.accent },
    callBtnDisabled: { padding: '10px', background: 'transparent', border: 'none', cursor: 'not-allowed', opacity: 0.4 },
    chatBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    callBanner: { backgroundColor: `${T.accent}15`, color: T.text, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    declineBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer' },
    
    // 🌟 BRIDGE STYLING
    bridgeOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000, textAlign: 'center', padding: '20px' },
    bridgeBtn: { padding: '15px 30px', borderRadius: '30px', backgroundColor: '#4ade80', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 0 15px #4ade80' }
  };

  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      const { data } = await supabase.from('rooms').select('*');
      if (data) setRooms(data);
      if (user) {
        try {
          const token = await requestFirebaseToken();
          if (token) await supabase.from('profiles').upsert({ id: user.id, email: user.email, fcm_token: token });
        } catch (e) { console.log("Init error:", e); }
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
        if (payload.new.status === 'accepted' && ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        if (['rejected', 'ended', 'missed'].includes(payload.new.status)) cleanupCall();
      }).subscribe();
    return () => supabase.removeChannel(boardWatcher);
  }, [activeCallId]);

  useEffect(() => {
    if (!activeRoom || !currentUser) return;
    const sigChannel = supabase.channel(`signaling-${activeRoom.id}`, { config: { broadcast: { ack: false } } });
    signalingChannelRef.current = sigChannel;

    sigChannel.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
      if (payload.sender === currentUser.id) return; 
      try {
        if (payload.publicKey && myPrivateKeyRef.current && !sharedSecretRef.current) {
          const theirPublicKey = await SecurityKit.importMixture(payload.publicKey);
          const finalSecret = await SecurityKit.deriveSecret(myPrivateKeyRef.current, theirPublicKey);
          sharedSecretRef.current = Array.from(new Uint8Array(finalSecret)).map(b => b.toString(16).padStart(2, '0')).join('');
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
            iceCandidateQueue.current[payload.sender].forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.log(e)));
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
              iceCandidateQueue.current[payload.sender].forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.log(e)));
              iceCandidateQueue.current[payload.sender] = [];
            }
          }
        } 
        else if (payload.type === 'ice-candidate' && payload.target === currentUser.id) {
          const pc = peers.current[payload.sender];
          if (pc) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(e => console.log("ICE Error", e));
            } else {
              if (!iceCandidateQueue.current[payload.sender]) iceCandidateQueue.current[payload.sender] = [];
              iceCandidateQueue.current[payload.sender].push(payload.candidate);
            }
          }
        } 
        else if (payload.type === 'user-left') { cleanupCall(); }
      } catch (err) { console.error("Signaling Error:", err); }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED' && autoJoinRef.current) {
          autoJoinRef.current = false;
          joinCall(); 
      }
    });

    return () => { supabase.removeChannel(sigChannel); };
  }, [activeRoom, currentUser]); 

  const fetchSecureTrucks = async () => {
    try {
      const { data } = await supabase.functions.invoke('get-turn-credentials');
      if (data && data.iceServers) iceServersRef.current = data;
    } catch (err) { console.error("TURN failed, using STUN.", err); }
  };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(iceServersRef.current); 
    peers.current[peerId] = pc;
    if (localStream.current) localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));
    
    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const cleanList = prev.filter(p => p.userId !== peerId);
        return [...cleanList, { userId: peerId, stream: event.streams[0], uniqueId: Math.random() }];
      });
      // 🌟 TRIGGER BRIDGE: Audio track received, now we need the physical tap to play it
      setShowAudioBridge(true);
    };
    
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'ice-candidate', candidate: event.candidate, sender: currentUser.id, target: peerId } });
      }
    };
    return pc;
  };

  const startCall = async () => {
    if (isInCallRef.current || !activeRoom) return;
    try {
      // FIX 3: 300ms hardware cool-down period [cite: 79]
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchSecureTrucks(); 
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      safeSetIsInCall(true);
      
      const keys = await SecurityKit.generateKeys();
      myPrivateKeyRef.current = keys.privateKey;
      myPublicKeyStrRef.current = await SecurityKit.exportMixture(keys.publicKey);

      const friendId = activeRoom.participants.find(id => id !== currentUser.id);
      if (friendId) {
        // 🌟 SANITIZE: Clear previous signaling data to prevent ghost calls [cite: 78]
        await supabase.from('calls').delete().eq('caller_id', currentUser.id).eq('status', 'ringing');

        const { data: newCall } = await supabase.from('calls').insert({
          caller_id: currentUser.id, receiver_id: friendId, status: 'ringing', caller_public_key: myPublicKeyStrRef.current
        }).select().single();

        if (newCall) {
          setActiveCallId(newCall.id);
          activeCallIdRef.current = newCall.id;
          ringTimeoutRef.current = setTimeout(async () => {
            if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'missed' }).eq('id', activeCallIdRef.current);
            cleanupCall();
          }, 30000); 
        }

        const { data: friendProfile } = await supabase.from('profiles').select('fcm_token').eq('id', friendId).maybeSingle(); 
        if (friendProfile?.fcm_token) {
          await supabase.functions.invoke('send-call-notification', { body: { token: friendProfile.fcm_token, callerName: currentUser.email.split('@')[0], roomId: activeRoom.id } });
        }
      }
      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'call-started', sender: currentUser.id, publicKey: myPublicKeyStrRef.current } });
    } catch (error) { alert("Mic Error: " + error.message); }
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
    } catch (error) { alert("Join failed: " + error.message); }
  };

  const endCall = async () => { 
    try {
      if (signalingChannelRef.current) signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-left', sender: currentUser.id } });
      if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'ended' }).eq('id', activeCallIdRef.current);
    } finally { cleanupCall(); }
  };

  const cleanupCall = () => { 
    // FIX 2: Explicitly stop all media tracks before clearing [cite: 72, 73]
    setRemoteStreams(prev => {
      prev.forEach(p => p.stream?.getTracks().forEach(t => t.stop()));
      return [];
    });
    Object.values(peers.current).forEach(pc => { pc.onicecandidate = null; pc.ontrack = null; pc.close(); }); 
    peers.current = {}; 
    iceCandidateQueue.current = {}; 
    if (localStream.current) { localStream.current.getTracks().forEach(track => track.stop()); localStream.current = null; } 
    
    safeSetIsInCall(false); 
    setShowAudioBridge(false); // Reset the bridge
    myPrivateKeyRef.current = null; myPublicKeyStrRef.current = null; sharedSecretRef.current = null;
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    setActiveCallId(null); activeCallIdRef.current = null;
  };

  return (
    <div style={s.container}>
      {remoteStreams.map(peer => <AudioPlayer key={peer.uniqueId} stream={peer.stream} />)}

      {/* 🌟 THE BRIDGE: This physical tap is required to unlock audio on Call #2  */}
      {showAudioBridge && (
        <div style={s.bridgeOverlay}>
          <h2 style={{ color: '#fff', marginBottom: '20px' }}>{hi ? "कॉल कनेक्टेड" : "Call Connected"}</h2>
          <button style={s.bridgeBtn} onClick={() => {
            // Forcefully command all audio tags to play 
            const audios = document.querySelectorAll('audio');
            audios.forEach(a => {
              a.muted = false; // 
              a.play().catch(e => console.log("Play blocked:", e));
            });
            setShowAudioBridge(false);
          }}>
            {hi ? "आवाज शुरू करें 🔊" : "Start Audio 🔊"}
          </button>
        </div>
      )}

      <div style={s.header}>
        <button style={s.backBtn} onClick={() => { if (isInCallRef.current) endCall(); activeRoom ? setActiveRoom(null) : setTab('home'); }}>◀</button>
        <div style={s.headerTitle}>{activeRoom?.name}</div>
        {activeRoom && <button style={isInCallRef.current ? s.callBtnDisabled : s.callBtn} onClick={startCall} disabled={isInCallRef.current}>📞</button>}
      </div>

      <div style={s.chatBox} ref={chatBoxRef}>
        {!activeRoom ? (
          rooms.map(r => <div key={r.id} style={s.roomCard} onClick={() => setActiveRoom(r)}>{r.name}</div>)
        ) : (
          messages.map(m => (
            <div key={m.id} style={s.getBubbleWrapper(m.user_id === currentUser?.id)}>
              <div style={s.getBubble(m.user_id === currentUser?.id)}>{m.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}