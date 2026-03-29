import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { SecurityKit, decryptXORFallback } from '../utils/security';

// ─── DECRYPT ONE MESSAGE ───────────────────────────────────────────────────
const decryptOneMessage = async (m, aesKey) => {
  const msg = { ...m };
  if (msg.content && msg.content.includes(':::')) {
    if (aesKey) {
      const [iv, cipher] = msg.content.split(':::');
      const result = await SecurityKit.decryptText(cipher, iv, aesKey);
      msg.decrypted_content = result !== null ? result : '🔒 [Key mismatch — ask friend to reopen chat]';
      msg._needs_decrypt = false;
    } else {
      msg.decrypted_content = null;
      msg._needs_decrypt = true;
    }
  } else {
    msg.decrypted_content = decryptXORFallback(msg.content, msg.room_id);
    msg._needs_decrypt = false;
  }
  return msg;
};

// ─── THE MAILROOM ENGINE ───────────────────────────────────────────────────
export function useChatEngine(currentUser, activeRoom, blockedUsers, isVaultUnlocked, myMasterKeyRef, hi) {
  const [messages, setMessages] = useState([]);
  const [presentUsers, setPresentUsers] = useState({});
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const activeAESKeysRef = useRef({});
  const aesKeyReadyRef = useRef({});
  const keyWatcherChannelRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastMessageTimeRef = useRef(0);

  // 1. Key Derivation Helper
  const deriveAESKey = async (publicKeyStr) => {
    if (!myMasterKeyRef.current || !publicKeyStr) return null;
    try {
      const pub = await SecurityKit.importPublicKey(publicKeyStr);
      const bits = await SecurityKit.deriveSecretBits(myMasterKeyRef.current, pub);
      return await SecurityKit.createAESKey(bits);
    } catch (e) { return null; }
  };

  // 2. Fetch & Decrypt Helper
  const fetchAndDecryptMessages = async (roomId) => {
    const { data } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
    if (!data) return [];
    const aesKey = activeAESKeysRef.current[roomId];
    return Promise.all(data.map(m => decryptOneMessage(m, aesKey)));
  };

  // 3. Retry Decryption Helper (for slow internet)
  const retryPendingDecrypts = async (roomId) => {
    const aesKey = activeAESKeysRef.current[roomId];
    if (!aesKey) return;
    setMessages(prev => {
      if (!prev.some(m => m._needs_decrypt)) return prev;
      Promise.all(prev.map(m => m._needs_decrypt ? decryptOneMessage(m, aesKey) : Promise.resolve(m)))
        .then(updated => setMessages(updated));
      return prev;
    });
  };

  // 4. MAIN ROOM EFFECT: Watches the database for new texts
  useEffect(() => {
    if (!activeRoom || !currentUser || !isVaultUnlocked) return;
    let isSubscribed = true;

    const setup = async () => {
      const friendId = activeRoom.is_private ? activeRoom.participants.find(id => id !== currentUser.id) : null;

      if (friendId && myMasterKeyRef.current) {
        let resolveKeyReady;
        aesKeyReadyRef.current[activeRoom.id] = new Promise(res => { resolveKeyReady = res; });

        const { data: fp } = await supabase.from('profiles').select('public_key').eq('id', friendId).maybeSingle();
        if (fp?.public_key) {
          const key = await deriveAESKey(fp.public_key);
          if (key) activeAESKeysRef.current[activeRoom.id] = key;
        }
        resolveKeyReady();

        if (isSubscribed) await retryPendingDecrypts(activeRoom.id);

        if (keyWatcherChannelRef.current) await supabase.removeChannel(keyWatcherChannelRef.current);
        
        keyWatcherChannelRef.current = supabase
          .channel(`key-watch-${activeRoom.id}-${friendId}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${friendId}` },
            async (payload) => {
              const newPub = payload.new?.public_key;
              if (newPub && newPub !== payload.old?.public_key) {
                const freshKey = await deriveAESKey(newPub);
                if (freshKey && isSubscribed) {
                  activeAESKeysRef.current[activeRoom.id] = freshKey;
                  const msgs = await fetchAndDecryptMessages(activeRoom.id);
                  setMessages(msgs);
                }
              }
            }).subscribe();
      } else {
        aesKeyReadyRef.current[activeRoom.id] = Promise.resolve();
      }

      const msgs = await fetchAndDecryptMessages(activeRoom.id);
      if (isSubscribed) {
        setMessages(msgs);
        const unreadIds = msgs.filter(m => !m.is_read && m.user_id !== currentUser.id).map(m => m.id);
        if (unreadIds.length > 0) supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }
    };

    setup();

    // Listen for live texts
    const chatCh = supabase.channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const raw = { ...payload.new };
            if (blockedUsers.includes(raw.user_id)) return;

            const keyReady = aesKeyReadyRef.current[activeRoom.id];
            if (keyReady) await keyReady;

            const decrypted = await decryptOneMessage(raw, activeAESKeysRef.current[activeRoom.id]);
            setMessages(prev => prev.find(m => m.id === decrypted.id) ? prev : [...prev, decrypted]);
            
            if (decrypted.user_id !== currentUser.id) {
              supabase.from('messages').update({ is_read: true }).eq('id', decrypted.id).then();
            }
          } else if (payload.eventType === 'UPDATE') {
            // ─── READ RECEIPT FIX: update is_read in sender's message list ───
            setMessages(prev => prev.map(m =>
              m.id === payload.new.id ? { ...m, is_read: payload.new.is_read } : m
            ));
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old?.id));
          }
        }).subscribe();

    // Listen for online/typing status
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

    return () => {
      isSubscribed = false;
      supabase.removeChannel(chatCh);
      supabase.removeChannel(presenceCh);
      if (keyWatcherChannelRef.current) { supabase.removeChannel(keyWatcherChannelRef.current); keyWatcherChannelRef.current = null; }
    };
  }, [activeRoom, currentUser, isVaultUnlocked, blockedUsers]);

  // 5. Handle Typing UI
  const handleTyping = (e) => {
    setMessageText(e.target.value);
    if (!isTyping && presenceChannelRef.current) { setIsTyping(true); presenceChannelRef.current.track({ email: currentUser.email, is_typing: true }); }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });
    }, 2000);
  };

  // 6. Handle Sending Texts (with Anti-Spam)
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    const now = Date.now();
    if (now - lastMessageTimeRef.current < 1000) {
      alert(hi ? "कृपया धीरे-धीरे संदेश भेजें।" : "Please slow down. You are sending messages too fast.");
      return;
    }
    lastMessageTimeRef.current = now;

    const raw = messageText;
    setMessageText(""); 
    setIsTyping(false);
    if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });

    let content = "";
    const aesKey = activeAESKeysRef.current[activeRoom.id];
    if (aesKey) {
      try { 
        const enc = await SecurityKit.encryptText(raw, aesKey); 
        content = `${enc.iv}:::${enc.cipherText}`; 
      }
      catch (e) { console.error("Encrypt failed, XOR fallback", e); }
    }
    
    // Fallback if AES is missing
    if (!content) {
      const k = String(activeRoom.id);
      content = btoa(encodeURIComponent(raw).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(i % k.length))).join(''));
    }
    
    await supabase.from('messages').insert([{ content, room_id: activeRoom.id, user_id: currentUser.id, user_email: currentUser.email }]);
  };

  // 7. Handle Deleting Texts
  const handleDeleteMessage = async (id) => {
    if (!window.confirm(hi ? "हटाएं?" : "Delete?")) return;
    setMessages(p => p.filter(m => m.id !== id));
    await supabase.from('messages').delete().eq('id', id);
  };

  // ── Returns the clean tools to the UI ──
  return {
    messages,
    presentUsers,
    messageText,
    handleTyping,
    handleSendMessage,
    handleDeleteMessage
  };
}