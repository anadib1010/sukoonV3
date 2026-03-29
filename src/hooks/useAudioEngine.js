import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { SecurityKit } from '../utils/security';

// ─── SDP MUNGING ─────────────────────────────────────────────────────────────
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

// ─── SAMSUNG-SAFE AUDIO CONSTRAINTS ──────────────────────────────────────────
// goog-prefixed constraints force Chrome/Samsung browser into the voice call
// audio pipeline (same as WhatsApp) instead of the media/music pipeline
// which Samsung browser quietly throttles at lower volume.
const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: { ideal: 48000 },
  channelCount: { ideal: 1 },
  googEchoCancellation: true,
  googAutoGainControl: true,
  googNoiseSuppression: true,
  googHighpassFilter: true,
  googAudioMirroring: false,
};

export function useAudioEngine(currentUser, activeRoom, blockedUsers, hi) {
  const [isInCall, setIsInCall] = useState(false);
  const isInCallRef = useRef(false);
  const [showAudioBridge, setShowAudioBridge] = useState(false);
  const [activeCallId, setActiveCallId] = useState(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // default: speaker (browser default)

  const activeCallIdRef = useRef(null);
  const activeRoomRef = useRef(activeRoom);
  const remoteStreamRef = useRef(null);
  const localStream = useRef(null);
  const peers = useRef({});
  const signalingChannelRef = useRef(null);
  const autoJoinRef = useRef(false);
  const iceCandidateQueue = useRef({});
  const ringTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  const iceServersRef = useRef({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  });

  const callPrivateKeyRef = useRef(null);
  const callPublicKeyStrRef = useRef(null);
  const callSharedSecretRef = useRef(null);

  useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

  const safeSetIsInCall = (v) => { setIsInCall(v); isInCallRef.current = v; };

  // ─── 1. TURN SERVERS ───────────────────────────────────────────────────────
  const fetchSecureTrucks = async () => {
    try {
      const { data } = await supabase.functions.invoke('get-turn-credentials');
      if (data?.iceServers) { iceServersRef.current = data; return; }
    } catch (e) { console.warn("TURN fetch failed, using fallback"); }
    iceServersRef.current = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80',                username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443',               username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
      ]
    };
  };

  // ─── 2. AUDIO BOOST ENGINE ────────────────────────────────────────────────
  const applyAudioBoost = (stream) => {
    if (!stream) return;
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const gainNode = ctx.createGain();
      gainNode.gain.value = 2.0;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
    } catch (e) {
      console.warn('AudioContext boost not available:', e);
    }
  };

  // ─── 2b. SPEAKER TOGGLE ──────────────────────────────────────────────────
  // Tries to switch between loudspeaker and earpiece.
  // On Android browsers, enumerateDevices may expose earpiece as an output.
  // Falls back gracefully if earpiece is not available.
  const toggleSpeaker = async () => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (!audio) return;

    const nextSpeaker = !isSpeakerOn;

    if (typeof audio.setSinkId === 'function') {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter(d => d.kind === 'audiooutput');

        if (nextSpeaker) {
          // Switch to loudspeaker — use default sink
          await audio.setSinkId('');
          setIsSpeakerOn(true);
        } else {
          // Try to find earpiece
          const earpiece = outputs.find(d =>
            d.label.toLowerCase().includes('earpiece') ||
            d.label.toLowerCase().includes('ear') ||
            d.label.toLowerCase().includes('receiver') ||
            d.label.toLowerCase().includes('handset')
          );
          if (earpiece) {
            await audio.setSinkId(earpiece.deviceId);
            setIsSpeakerOn(false);
          } else {
            // Earpiece not available on this browser — stay on speaker
            console.warn('Earpiece not found, staying on speaker');
            setIsSpeakerOn(true);
          }
        }
      } catch (e) {
        console.warn('Speaker toggle failed:', e);
        setIsSpeakerOn(true);
      }
    } else {
      // setSinkId not supported — inform user
      alert('Speaker switching is not supported on this browser. Use your phone volume buttons.');
    }
  };

  // ─── 3. PLAY REMOTE AUDIO ─────────────────────────────────────────────────
  const playRemoteAudio = (stream) => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (!audio) { setShowAudioBridge(true); return; }

    if (audio.srcObject !== stream) audio.srcObject = stream;
    audio.muted = false;
    audio.volume = 1.0;
    audio.playsInline = true;

    // SAMSUNG FIX: setSinkId('') routes audio through the voice call
    // pipeline instead of the media stream — this is why WhatsApp is loud
    if (typeof audio.setSinkId === 'function') {
      audio.setSinkId('').catch(e => console.warn('setSinkId failed:', e));
    }

    audio.play()
      .then(() => {
        setShowAudioBridge(false);
        applyAudioBoost(stream);
      })
      .catch((e) => {
        console.warn('Autoplay blocked, showing bridge:', e);
        setShowAudioBridge(true);
      });
  };

  // ─── 4. CLEANUP ───────────────────────────────────────────────────────────
  const cleanupCall = () => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (audio) { audio.pause(); audio.srcObject = null; audio.load(); }
    remoteStreamRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    Object.values(peers.current).forEach(pc => {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.oniceconnectionstatechange = null;
      pc.close();
    });
    peers.current = {};
    iceCandidateQueue.current = {};

    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }

    safeSetIsInCall(false);
    setShowAudioBridge(false);

    // CRITICAL: always null these so ECDH re-runs fresh on next call
    callPrivateKeyRef.current = null;
    callPublicKeyStrRef.current = null;
    callSharedSecretRef.current = null;

    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    setActiveCallId(null);
    activeCallIdRef.current = null;
  };

  const endCall = async () => {
    try {
      if (signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: 'broadcast', event: 'webrtc',
          payload: { type: 'user-left', sender: currentUser.id }
        });
      }
      if (activeCallIdRef.current) {
        await supabase.from('calls').update({ status: 'ended' }).eq('id', activeCallIdRef.current);
      }
      if (activeRoomRef.current) {
        sendGlobalSignal({
          action: 'cancel',
          roomId: activeRoomRef.current.id,
          callerId: currentUser.id,
          participants: activeRoomRef.current.participants
        });
      }
    } catch (e) { console.error(e); } finally { cleanupCall(); }
  };

  const removePeer = (id) => {
    if (peers.current[id]) { peers.current[id].close(); delete peers.current[id]; }
  };

  const sendGlobalSignal = (p) =>
    supabase.channel('global-call-radar').send({ type: 'broadcast', event: 'global-ring', payload: p });

  // ─── 5. PEER CONNECTION ───────────────────────────────────────────────────
  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(iceServersRef.current);
    peers.current[peerId] = pc;

    if (localStream.current) {
      localStream.current.getTracks().forEach(t => pc.addTrack(t, localStream.current));
    }

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;
      remoteStreamRef.current = stream;
      playRemoteAudio(stream);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: 'broadcast', event: 'webrtc',
          payload: { type: 'ice-candidate', candidate: ev.candidate, sender: currentUser.id, target: peerId }
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) cleanupCall();
    };

    return pc;
  };

  // ─── 6. SIGNALING LISTENER ────────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    const sigCh = supabase.channel(`signaling-${activeRoom.id}`, {
      config: { broadcast: { ack: false } }
    });
    signalingChannelRef.current = sigCh;

    sigCh.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
      if (payload.sender === currentUser.id || blockedUsers.includes(payload.sender)) return;
      try {
        if (payload.publicKey && callPrivateKeyRef.current && !callSharedSecretRef.current) {
          try {
            const pub = await SecurityKit.importPublicKey(payload.publicKey);
            const secret = await SecurityKit.deriveSecretBits(callPrivateKeyRef.current, pub);
            callSharedSecretRef.current = Array.from(new Uint8Array(secret))
              .map(b => b.toString(16).padStart(2, '0')).join('');
          } catch (e) { console.warn("ECDH handshake skipped:", e); }
        }

        if (payload.type === 'user-joined' && isInCallRef.current) {
          const pc = createPeerConnection(payload.sender);
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
          offer.sdp = enforceHighQualityOpus(offer.sdp);
          await pc.setLocalDescription(offer);
          sigCh.send({
            type: 'broadcast', event: 'webrtc',
            payload: { type: 'offer', sdp: offer, sender: currentUser.id, target: payload.sender, publicKey: callPublicKeyStrRef.current }
          });
        }
        else if (payload.type === 'offer' && payload.target === currentUser.id) {
          const pc = createPeerConnection(payload.sender);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          for (const c of (iceCandidateQueue.current[payload.sender] || []))
            await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
          iceCandidateQueue.current[payload.sender] = [];
          const answer = await pc.createAnswer();
          answer.sdp = enforceHighQualityOpus(answer.sdp);
          await pc.setLocalDescription(answer);
          sigCh.send({
            type: 'broadcast', event: 'webrtc',
            payload: { type: 'answer', sdp: answer, sender: currentUser.id, target: payload.sender }
          });
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
        else if (payload.type === 'user-left') {
          removePeer(payload.sender);
          cleanupCall();
        }
      } catch (err) { console.error("Signaling error:", err); }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED' && autoJoinRef.current) {
        autoJoinRef.current = false;
        joinCall();
      }
    });

    return () => supabase.removeChannel(sigCh);
  }, [activeRoom, currentUser, blockedUsers]);

  // ─── 7. CALL STATUS WATCHERS ──────────────────────────────────────────────
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
          if (activeCallIdRef.current) {
            await supabase.from('calls').update({ status: 'rejected' }).eq('id', activeCallIdRef.current);
          }
          cleanupCall();
        }
      }).subscribe();
    return () => supabase.removeChannel(r);
  }, [currentUser]);

  // ─── 8. START CALL ────────────────────────────────────────────────────────
  const startCall = async () => {
    if (isInCallRef.current || !activeRoom) return;
    try {
      await new Promise(r => setTimeout(r, 300));
      await fetchSecureTrucks();

      // SAMSUNG FIX: use AUDIO_CONSTRAINTS with goog prefix
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
        video: false
      });

      safeSetIsInCall(true);

      try {
        const kp = await SecurityKit.generateKeys();
        callPrivateKeyRef.current = kp.privateKey;
        callPublicKeyStrRef.current = await SecurityKit.exportPublicKey(kp.publicKey);
      } catch (e) { console.warn("Call key gen failed:", e); }

      const friendId = activeRoom.participants.find(id => id !== currentUser.id);
      let callId = null;

      if (friendId) {
        await supabase.from('calls').delete().eq('caller_id', currentUser.id).eq('status', 'ringing');
        const { data: nc } = await supabase.from('calls').insert({
          caller_id: currentUser.id,
          receiver_id: friendId,
          status: 'ringing',
          caller_public_key: callPublicKeyStrRef.current
        }).select().single();

        if (nc) {
          setActiveCallId(nc.id);
          activeCallIdRef.current = nc.id;
          callId = nc.id;

          ringTimeoutRef.current = setTimeout(async () => {
            if (activeCallIdRef.current) {
              await supabase.from('calls').update({ status: 'missed' }).eq('id', activeCallIdRef.current);
            }
            if (activeRoomRef.current) {
              sendGlobalSignal({
                action: 'cancel',
                roomId: activeRoomRef.current.id,
                callerId: currentUser.id,
                participants: activeRoomRef.current.participants
              });
            }
            cleanupCall();
          }, 30000);
        }

        const { data: fp } = await supabase.from('profiles').select('fcm_token').eq('id', friendId).maybeSingle();
        if (fp?.fcm_token) {
          await supabase.functions.invoke('send-call-notification', {
            body: {
              token: fp.fcm_token,
              callerName: currentUser.email.split('@')[0],
              roomId: activeRoom.id
            }
          });
        }
      }

      signalingChannelRef.current.send({
        type: 'broadcast', event: 'webrtc',
        payload: { type: 'call-started', sender: currentUser.id, callerEmail: currentUser.email, publicKey: callPublicKeyStrRef.current }
      });

      sendGlobalSignal({
        action: 'start',
        roomId: activeRoom.id,
        callerId: currentUser.id,
        callerEmail: currentUser.email,
        participants: activeRoom.participants,
        roomDetails: activeRoom,
        publicKey: callPublicKeyStrRef.current,
        callId
      });

    } catch (e) {
      safeSetIsInCall(false);
      alert("Microphone Access Failed: " + e.message);
    }
  };

  // ─── 9. JOIN CALL ─────────────────────────────────────────────────────────
  const joinCall = async () => {
    try {
      await fetchSecureTrucks();

      const { data: ic } = await supabase.from('calls')
        .select('id')
        .eq('receiver_id', currentUser.id)
        .eq('status', 'ringing')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ic) { setActiveCallId(ic.id); activeCallIdRef.current = ic.id; }

      // SAMSUNG FIX: use AUDIO_CONSTRAINTS with goog prefix on join side too
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
        video: false
      });

      safeSetIsInCall(true);

      try {
        const kp = await SecurityKit.generateKeys();
        callPrivateKeyRef.current = kp.privateKey;
        callPublicKeyStrRef.current = await SecurityKit.exportPublicKey(kp.publicKey);
      } catch (e) { console.warn("Join key gen failed:", e); }

      if (activeCallIdRef.current) {
        await supabase.from('calls').update({
          status: 'accepted',
          receiver_public_key: callPublicKeyStrRef.current || null
        }).eq('id', activeCallIdRef.current);
      }

      signalingChannelRef.current.send({
        type: 'broadcast', event: 'webrtc',
        payload: { type: 'user-joined', sender: currentUser.id, publicKey: callPublicKeyStrRef.current }
      });

    } catch (e) {
      safeSetIsInCall(false);
      alert("Failed to join call: " + e.message);
    }
  };

  // ─── 10. AUDIO BRIDGE (manual fallback for strict autoplay browsers) ──────
  const handleStartAudio = () => {
    const audio = document.getElementById('sukoon-remote-audio');
    if (!audio) { setShowAudioBridge(false); return; }

    if (remoteStreamRef.current && audio.srcObject !== remoteStreamRef.current) {
      audio.srcObject = remoteStreamRef.current;
    }

    audio.muted = false;
    audio.volume = 1.0;

    if (typeof audio.setSinkId === 'function') {
      audio.setSinkId('').catch(e => console.warn('setSinkId failed:', e));
    }

    audio.play()
      .then(() => {
        applyAudioBoost(remoteStreamRef.current);
        setShowAudioBridge(false);
      })
      .catch(e => {
        console.error("Manual audio play failed:", e);
        setTimeout(() => {
          audio.play()
            .then(() => { applyAudioBoost(remoteStreamRef.current); setShowAudioBridge(false); })
            .catch(console.error);
        }, 500);
      });
  };

  return {
    isInCall,
    showAudioBridge,
    isSpeakerOn,
    toggleSpeaker,
    startCall,
    joinCall,
    endCall,
    handleStartAudio,
    autoJoinRef
  };
}
