import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { SecurityKit } from '../utils/security';

// 🌟 STEP 3: THE STUDIO ENGINEER ROBOT (SDP Munging)
// This safely rewrites the invitation letter to force max quality Opus audio
const enforceHighQualityOpus = (sdp) => {
  let modifiedSdp = sdp;
  const opusRegex = /a=rtpmap:(\d+) opus\/48000\/2/;
  const match = modifiedSdp.match(opusRegex);
  if (match) {
    const opusId = match[1];
    const fmtpRegex = new RegExp(`a=fmtp:${opusId} (.*)`);
    if (fmtpRegex.test(modifiedSdp)) {
      modifiedSdp = modifiedSdp.replace(
        fmtpRegex, 
        `a=fmtp:${opusId} $1; maxaveragebitrate=510000; usedtx=0`
      );
    }
  }
  return modifiedSdp;
};

export function useAudioEngine(currentUser, activeRoom, blockedUsers, hi) {
  const [isInCall, setIsInCall] = useState(false);
  const isInCallRef = useRef(false);
  const [showAudioBridge, setShowAudioBridge] = useState(false);
  const [activeCallId, setActiveCallId] = useState(null);

  const activeCallIdRef = useRef(null);
  const remoteStreamRef = useRef(null);
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

  const safeSetIsInCall = (v) => { setIsInCall(v); isInCallRef.current = v; };

  // 1. TURN SERVERS 
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

  // 2. END & CLEANUP 
  const cleanupCall = () => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (audio) { audio.pause(); audio.srcObject = null; audio.load(); }
    remoteStreamRef.current = null;
    
    Object.values(peers.current).forEach(pc => { 
      pc.onicecandidate = null; pc.ontrack = null; pc.oniceconnectionstatechange = null; pc.close(); 
    });
    peers.current = {}; 
    iceCandidateQueue.current = {};
    
    if (localStream.current) { 
      localStream.current.getTracks().forEach(t => t.stop()); 
      localStream.current = null; 
    }
    
    safeSetIsInCall(false); 
    setShowAudioBridge(false);
    callPrivateKeyRef.current = null; 
    callPublicKeyStrRef.current = null; 
    callSharedSecretRef.current = null;
    
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    setActiveCallId(null); 
    activeCallIdRef.current = null;
  };

  const endCall = async () => {
    try {
      if (signalingChannelRef.current) signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-left', sender: currentUser.id } });
      if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'ended' }).eq('id', activeCallIdRef.current);
      if (activeRoom) sendGlobalSignal({ action: 'cancel', roomId: activeRoom.id, callerId: currentUser.id, participants: activeRoom.participants });
    } catch (e) { console.error(e); } finally { cleanupCall(); }
  };

  const removePeer = (id) => { if (peers.current[id]) { peers.current[id].close(); delete peers.current[id]; } };
  const sendGlobalSignal = (p) => supabase.channel('global-call-radar').send({ type: 'broadcast', event: 'global-ring', payload: p });

  // 3. PEER CONNECTION (🔒 UNTOUCHED)
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
      if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) cleanupCall();
    };
    return pc;
  };

  // 4. SIGNALING LISTENER (🌟 STEP 3 APPLIED: SDP MUNGING)
  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    const sigCh = supabase.channel(`signaling-${activeRoom.id}`, { config: { broadcast: { ack: false } } });
    signalingChannelRef.current = sigCh;

    sigCh.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
      if (payload.sender === currentUser.id || blockedUsers.includes(payload.sender)) return;
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
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false }); 
          
          // 🌟 The Secret P.S. Note for the Offer
          offer.sdp = enforceHighQualityOpus(offer.sdp);
          
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
          
          // 🌟 The Secret P.S. Note for the Answer
          answer.sdp = enforceHighQualityOpus(answer.sdp);
          
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

    return () => supabase.removeChannel(sigCh);
  }, [activeRoom, currentUser, blockedUsers]);

  // 5. CALL WATCHERS 
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

  // 6. START CALL (🌟 STEP 1 & 2 APPLIED)
  const startCall = async () => {
    if (isInCallRef.current || !activeRoom) return;
    try {
      await new Promise(r => setTimeout(r, 300));
      await fetchSecureTrucks();
      
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true,
          sampleRate: 48000, 
          channelCount: 1    
        }, 
        video: false 
      });
      
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

  // 7. JOIN CALL (🌟 STEP 1 & 2 APPLIED)
  const joinCall = async () => {
    try {
      await fetchSecureTrucks();
      const { data: ic } = await supabase.from('calls').select('id').eq('receiver_id', currentUser.id).eq('status', 'ringing').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (ic) { setActiveCallId(ic.id); activeCallIdRef.current = ic.id; }
      
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true,
          sampleRate: 48000, 
          channelCount: 1    
        }, 
        video: false 
      });
      
      safeSetIsInCall(true);
      try { const kp = await SecurityKit.generateKeys(); callPrivateKeyRef.current = kp.privateKey; callPublicKeyStrRef.current = await SecurityKit.exportPublicKey(kp.publicKey); } catch (e) { console.warn("Join key gen failed"); }
      if (activeCallIdRef.current) await supabase.from('calls').update({ status: 'accepted', receiver_public_key: callPublicKeyStrRef.current || null }).eq('id', activeCallIdRef.current);
      signalingChannelRef.current.send({ type: 'broadcast', event: 'webrtc', payload: { type: 'user-joined', sender: currentUser.id, publicKey: callPublicKeyStrRef.current } });
    } catch (e) { alert("Failed to join call: " + e.message); }
  };

  // 8. AUDIO BRIDGE (GENTLE BOOSTER)
  const handleStartAudio = async () => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (!audio) { setShowAudioBridge(false); return; }

    try {
      // Check if we can use the "Volume Knob" tool
      if (remoteStreamRef.current && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(remoteStreamRef.current);
        
        // 🌟 THE VOLUME KNOB: We set it to 4.0 (400% volume)
        // This pushes the sound through the "ceiling"
        const gainNode = ctx.createGain();
        gainNode.gain.value = 4.0; 

        const dest = ctx.createMediaStreamDestination();
        source.connect(gainNode);
        gainNode.connect(dest);

        audio.srcObject = dest.stream;
        if (ctx.state === 'suspended') await ctx.resume();
      } else {
        // Fallback for very old phones that don't have the Volume Knob tool
        audio.srcObject = remoteStreamRef.current;
      }
    } catch (e) {
      console.warn("Booster failed, using raw audio", e);
      audio.srcObject = remoteStreamRef.current;
    }

    audio.muted = false;
    audio.play().then(() => {
      setShowAudioBridge(false);
    }).catch(e => {
      setTimeout(() => { audio.play(); setShowAudioBridge(false); }, 500);
    });
  };

  return {
    isInCall,
    showAudioBridge,
    startCall,
    joinCall,
    endCall,
    handleStartAudio,
    autoJoinRef
  };
}