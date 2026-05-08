import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { decryptXORFallback } from '../utils/security';
import { useE2EE } from './useE2EE.web';

// ─── DECRYPT ONE MESSAGE ───────────────────────────────────────────────────
// Three formats handled:
//   1. nacl.box (new Android + PWA): has nonce column  → decrypt with nacl
//   2. Old PWA P-256 AES-GCM: content contains ":::"  → unreadable, show placeholder
//   3. XOR legacy: plain base64                        → XOR fallback
const decryptOneMessage = (m, decryptFn, friendPublicKey) => {
  const msg = { ...m };

  // New nacl format
  if (msg.nonce && friendPublicKey && decryptFn) {
    const result = decryptFn(msg.content, msg.nonce, friendPublicKey);
    msg.decrypted_content = result !== null ? result : '🔒 [Encrypted]';
    msg._needs_decrypt = false;
    return msg;
  }

  // Old P-256 format — encryption keys are gone, cannot recover
  if (msg.content && msg.content.includes(':::')) {
    msg.decrypted_content = '🔒 [Old message]';
    msg._needs_decrypt = false;
    return msg;
  }

  // XOR legacy fallback
  msg.decrypted_content = decryptXORFallback(msg.content, msg.room_id);
  msg._needs_decrypt = false;
  return msg;
};

// ─── THE MAILROOM ENGINE ───────────────────────────────────────────────────
// isVaultUnlocked and myMasterKeyRef kept in signature for backward
// compatibility with parent component — no longer used internally.
// Key management is now handled by useE2EE.web.js (nacl, same as Android).
export function useChatEngine(currentUser, activeRoom, blockedUsers, isVaultUnlocked, myMasterKeyRef, hi) {
  const [messages, setMessages] = useState([]);
  const [presentUsers, setPresentUsers] = useState({});
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [friendPublicKey, setFriendPublicKey] = useState(null);

  const presenceChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastMessageTimeRef = useRef(0);
  const keyWatcherChannelRef = useRef(null);

  // nacl E2EE — identical key system to Android
  const {
    encryptMessage, decryptMessage, isReady,
    needsPinSetup, needsPinRestore,
    backupKeyWithPin, restoreKeyWithPin,
    skipBackup, generateFreshKeys,
  } = useE2EE(currentUser?.id, currentUser?.email);

  // Fetch friend public key + watch for changes
  useEffect(() => {
    if (!activeRoom || !currentUser || !activeRoom.is_private) {
      setFriendPublicKey(null);
      return;
    }
    const friendId = activeRoom.participants?.find(id => id !== currentUser.id);
    if (!friendId) return;

    supabase.from('profiles').select('public_key').eq('id', friendId).maybeSingle()
      .then(({ data }) => { if (data?.public_key) setFriendPublicKey(data.public_key); });

    if (keyWatcherChannelRef.current) supabase.removeChannel(keyWatcherChannelRef.current);
    keyWatcherChannelRef.current = supabase
      .channel(`key-watch-${activeRoom.id}-${friendId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${friendId}`
      }, (payload) => {
        const newPub = payload.new?.public_key;
        if (newPub && newPub !== payload.old?.public_key) setFriendPublicKey(newPub);
      }).subscribe();

    return () => {
      if (keyWatcherChannelRef.current) {
        supabase.removeChannel(keyWatcherChannelRef.current);
        keyWatcherChannelRef.current = null;
      }
    };
  }, [activeRoom, currentUser]);

  // Main effect: fetch + realtime
  useEffect(() => {
    if (!activeRoom || !currentUser) return;
    let isSubscribed = true;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages').select('*')
        .eq('room_id', activeRoom.id)
        .order('created_at', { ascending: true });
      if (!data) return [];
      return data.map(m => decryptOneMessage(m, decryptMessage, friendPublicKey));
    };

    const setup = async () => {
      const msgs = await fetchMessages();
      if (!isSubscribed) return;
      setMessages(msgs);
      const unreadIds = msgs.filter(m => !m.is_read && m.user_id !== currentUser.id).map(m => m.id);
      if (unreadIds.length > 0) supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
    };

    setup();

    const chatCh = supabase.channel(`room-${activeRoom.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const raw = { ...payload.new };
          if (blockedUsers?.includes(raw.user_id)) return;
          const decrypted = decryptOneMessage(raw, decryptMessage, friendPublicKey);
          setMessages(prev => prev.find(m => m.id === decrypted.id) ? prev : [...prev, decrypted]);
          if (decrypted.user_id !== currentUser.id) {
            supabase.from('messages').update({ is_read: true }).eq('id', decrypted.id).then();
          }
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m =>
            m.id === payload.new.id ? { ...m, is_read: payload.new.is_read } : m
          ));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old?.id));
        }
      }).subscribe();

    const presenceCh = supabase.channel(
      `presence-${activeRoom.id}`,
      { config: { presence: { key: currentUser.id } } }
    );
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
    };
  }, [activeRoom, currentUser, friendPublicKey, blockedUsers]);

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    if (!isTyping && presenceChannelRef.current) {
      setIsTyping(true);
      presenceChannelRef.current.track({ email: currentUser.email, is_typing: true });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;
    const now = Date.now();
    if (now - lastMessageTimeRef.current < 1000) {
      alert(hi ? 'कृपया धीरे-धीरे संदेश भेजें।' : 'Please slow down.');
      return;
    }
    lastMessageTimeRef.current = now;

    const raw = messageText;
    setMessageText('');
    setIsTyping(false);
    if (presenceChannelRef.current) presenceChannelRef.current.track({ email: currentUser.email, is_typing: false });

    if (!isReady || !friendPublicKey) {
      alert(hi ? 'एन्क्रिप्शन तैयार नहीं है।' : 'Encryption not ready. Please wait a moment.');
      return;
    }

    // Validate friend public key is nacl-compatible (must be exactly 32 bytes)
    // Old P-256 keys are 91 bytes — incompatible until friend reopens app
    try {
      const keyBytes = atob(friendPublicKey.replace(/-/g,'+').replace(/_/g,'/'));
      if (keyBytes.length !== 32) {
        alert(hi
          ? 'मित्र की एन्क्रिप्शन की पुरानी है। उन्हें PWA या ऐप दोबारा खोलने को कहें।'
          : 'Friend\'s encryption key is outdated. Ask them to reopen the app or PWA to update it.');
        return;
      }
    } catch(e) {
      alert('Invalid friend key. Ask friend to reopen the app.');
      return;
    }

    let encrypted;
    try {
      encrypted = encryptMessage(raw, friendPublicKey);
    } catch(e) {
      console.error('[Chat] Encrypt error:', e);
      alert('Encryption failed. Ask friend to reopen the app.');
      return;
    }
    if (!encrypted) return;

    await supabase.from('messages').insert([{
      content: encrypted.encryptedText,
      nonce: encrypted.nonce,
      room_id: activeRoom.id,
      user_id: currentUser.id,
      user_email: currentUser.email,
    }]);
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm(hi ? 'हटाएं?' : 'Delete?')) return;
    setMessages(p => p.filter(m => m.id !== id));
    await supabase.from('messages').delete().eq('id', id);
  };

  return {
    messages,
    presentUsers,
    messageText,
    handleTyping,
    handleSendMessage,
    handleDeleteMessage,
    isReady,
    needsPinSetup,
    needsPinRestore,
    backupKeyWithPin,
    restoreKeyWithPin,
    skipBackup,
    generateFreshKeys,
  };
}
