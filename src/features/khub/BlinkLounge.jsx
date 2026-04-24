import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { checkToxicity, SpamLimiter, updateRepScore, submitReport, checkIfMuted, REP_POINTS, getTrustLevel, getTrustLabel } from './moderation';
import { FloatingHearts, HeartButton, useHearts, HEART_CONFIGS } from './FloatingHearts';

const ROOM_NAME = 'Blink Lounge';
const BLINK_COL = '#E91E8C';
const HEART_CFG = HEART_CONFIGS.blink;
const spamLimiter = new SpamLimiter(5, 10);

export function BlinkLounge({ setTab, T, lang }) {
  const hi = lang === 'Hindi';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showReport, setShowReport] = useState(null);
  const [toast, setToast] = useState(null);
  const [muted, setMuted] = useState(false);
  const [heartCount, setHeartCount] = useState(0);
  const scrollRef = useRef(null);
  const { hearts, spawnHeart } = useHearts();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setCurrentUser(user);
      const { data } = await supabase.from('profiles').select('rep_score, trust_level').eq('id', user.id).single();
      setUserProfile(data);
      const { muted: isMuted } = await checkIfMuted(user.id);
      if (isMuted) setMuted(true);
    });
  }, []);

  useEffect(() => {
    supabase.from('khub_messages').select('*').eq('room_name', ROOM_NAME).eq('status', 'visible').order('created_at', { ascending: true }).limit(100).then(({ data }) => { if (data) setMessages(data); });
    const sub = supabase.channel('blink_lounge_live').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'khub_messages', filter: `room_name=eq.${ROOM_NAME}` }, (payload) => { if (payload.new.status === 'visible') setMessages(prev => [...prev, payload.new]); }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const showToast = (text, type = 'warn') => { setToast({ text, type }); setTimeout(() => setToast(null), 3500); };

  const sendMessage = async () => {
    if (!input.trim() || !currentUser) return;
    if (muted) { showToast(hi ? '🚫 आप म्यूट हैं।' : '🚫 You are muted.', 'error'); return; }
    if (getTrustLevel(userProfile?.rep_score ?? 0) === 0) { showToast(hi ? '⚠️ Account restricted.' : '⚠️ Account restricted.', 'error'); return; }
    const spam = spamLimiter.check(hi);
    if (!spam.allowed) { if (spam.muted) setMuted(true); await updateRepScore(currentUser.id, REP_POINTS.SPAM_WARNED); showToast(spam.warning, 'warn'); return; }
    if (input.length > 500) { showToast('Max 500 characters', 'warn'); return; }
    const { toxic, reason } = checkToxicity(input);
    if (toxic) { await updateRepScore(currentUser.id, REP_POINTS.TOXIC_MESSAGE); showToast(hi ? `"${reason}" allowed नहीं 🙏` : `"${reason}" isn't allowed 🙏`, 'error'); return; }
    const textToSend = input.trim(); setInput('');
    await supabase.from('khub_messages').insert({ room_name: ROOM_NAME, user_id: currentUser.id, user_email: currentUser.email, text: textToSend, status: 'visible', msg_type: 'text' });
    await updateRepScore(currentUser.id, REP_POINTS.GOOD_MESSAGE);
  };

  const handleReport = async (msg, reason) => {
    if (!currentUser) return;
    const { reported, autoHidden } = await submitReport(msg.id, currentUser.id, reason, msg.user_id);
    if (autoHidden) { setMessages(prev => prev.filter(m => m.id !== msg.id)); await updateRepScore(currentUser.id, REP_POINTS.VALID_REPORT); showToast('✅ Message hidden', 'ok'); }
    else if (reported) { showToast(hi ? 'रिपोर्ट भेजी ✅' : 'Report submitted ✅', 'ok'); }
    setShowReport(null);
  };

  const s = {
    container: { height: '100dvh', display: 'flex', flexDirection: 'column', background: T.bg, color: T.text, position: 'relative', overflow: 'hidden' },
    header: { padding: '52px 20px 14px', background: `linear-gradient(180deg, ${BLINK_COL}18 0%, transparent 100%)`, borderBottom: `1px solid ${BLINK_COL}30`, textAlign: 'center' },
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 700, color: BLINK_COL, letterSpacing: '1px', margin: 0 },
    badge: { display: 'inline-block', marginTop: '5px', background: `${BLINK_COL}15`, border: `1px solid ${BLINK_COL}40`, borderRadius: '20px', padding: '2px 10px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: BLINK_COL, opacity: 0.85 },
    headerActions: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' },
    rulesBtn: { background: 'none', border: `1px solid ${BLINK_COL}35`, borderRadius: '12px', padding: '4px 12px', color: BLINK_COL, fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
    chatArea: { flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: '10px' },
    msgRow: (isMe) => ({ display: 'flex', flexDirection: 'column', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '78%' }),
    senderName: { fontSize: '10px', opacity: 0.45, marginBottom: '3px', paddingLeft: '4px', fontFamily: "'DM Sans', sans-serif" },
    bubble: (isMe) => ({ padding: '11px 15px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? BLINK_COL : `${T.accent}10`, color: isMe ? '#fff' : T.text, border: `1px solid ${isMe ? 'transparent' : `${BLINK_COL}22`}`, fontSize: '14px', lineHeight: '1.6', boxShadow: isMe ? `0 4px 14px ${BLINK_COL}38` : 'none', position: 'relative' }),
    reportBtn: { position: 'absolute', top: '6px', right: '-22px', background: 'none', border: 'none', color: T.text, opacity: 0.2, fontSize: '11px', cursor: 'pointer', padding: '2px' },
    inputArea: { padding: '12px 14px 28px', background: T.bg, borderTop: `1px solid ${BLINK_COL}18`, display: 'flex', gap: '8px', alignItems: 'center' },
    inputField: { flex: 1, padding: '12px 18px', borderRadius: '28px', background: `${T.accent}06`, border: `1px solid ${BLINK_COL}30`, color: T.text, outline: 'none', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" },
    sendBtn: { width: '44px', height: '44px', borderRadius: '50%', background: BLINK_COL, border: 'none', color: '#fff', cursor: 'pointer', fontSize: '17px', flexShrink: 0, boxShadow: `0 4px 12px ${BLINK_COL}42` },
    backBtn: { position: 'absolute', left: 16, top: 54, background: 'none', border: 'none', color: BLINK_COL, cursor: 'pointer', fontSize: '20px' },
    toast: (type) => ({ position: 'fixed', bottom: '88px', left: '50%', transform: 'translateX(-50%)', background: type === 'error' ? '#c0392b' : type === 'ok' ? '#27ae60' : '#e67e22', color: '#fff', borderRadius: '20px', padding: '10px 18px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', maxWidth: '85vw', textAlign: 'center' }),
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'flex-end' },
    modal: { width: '100%', background: T.bg, borderRadius: '24px 24px 0 0', padding: '24px 22px 40px', maxHeight: '80vh', overflowY: 'auto', border: `1px solid ${BLINK_COL}30` },
    modalTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: BLINK_COL, margin: '0 0 4px', fontWeight: 700 },
    ruleItem: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '9px 0', borderBottom: `1px solid ${BLINK_COL}14`, fontSize: '13px', lineHeight: 1.5 },
    closeBtn: { width: '100%', marginTop: '18px', padding: '13px', background: BLINK_COL, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  };

  const rules = hi ? [
    { icon: '🚫', hard: true, text: 'Hate speech/slurs — instant mute, rep -10' },
    { icon: '⚔️', hard: true, text: 'Fandom wars बंद — सभी fandoms safe हैं' },
    { icon: '🔞', hard: true, text: 'NSFW content — auto-blocked' },
    { icon: '🎵', hard: true, text: 'Pirated content — illegal' },
    { icon: '💬', hard: false, text: 'Max 5 msgs/10sec — spam = mute' },
    { icon: '🌸', hard: false, text: 'Celebrate करें — attack नहीं' },
    { icon: '🚩', hard: false, text: '3 reports = auto-hidden' },
    { icon: '⭐', hard: false, text: 'Clean msgs = +1 rep → Elite mod' },
    { icon: '🔗', hard: false, text: 'Spotify/YouTube links ✅' },
  ] : [
    { icon: '🚫', hard: true, text: 'Hate speech or slurs — instant mute, -10 rep' },
    { icon: '⚔️', hard: true, text: 'No fandom wars — all fandoms are safe' },
    { icon: '🔞', hard: true, text: 'No NSFW content — automatically blocked' },
    { icon: '🎵', hard: true, text: 'No pirated content — illegal' },
    { icon: '💬', hard: false, text: 'Max 5 msgs/10sec — spam = mute' },
    { icon: '🌸', hard: false, text: 'Celebrate without attacking others' },
    { icon: '🚩', hard: false, text: '3 reports = message auto-hidden' },
    { icon: '⭐', hard: false, text: 'Clean msgs = +1 rep → Elite mod' },
    { icon: '🔗', hard: false, text: 'Spotify/YouTube links welcome' },
  ];

  const reportReasons = hi ? ['घृणास्पद भाषा', 'Spam', 'NSFW', 'Fandom Attack', 'Piracy link', 'अन्य'] : ['Hate speech', 'Spam', 'NSFW content', 'Fandom attack', 'Piracy link', 'Other'];

  return (
    <div style={s.container}>
      <FloatingHearts hearts={hearts} roomType="blink" />
      <div style={s.header}>
        <button onClick={() => setTab('khub')} style={s.backBtn}>←</button>
        <h2 style={s.title}>🌸 {hi ? 'ब्लिंक लाउंज' : 'Blink Lounge'}</h2>
        <div style={s.badge}>{hi ? '⚠️ अनधिकृत — YG/BLACKPINK से संबद्ध नहीं' : '⚠️ Unofficial · Not affiliated with YG or BLACKPINK'}</div>
        <div style={s.headerActions}>
          <button style={s.rulesBtn} onClick={() => setShowRules(true)}>📋 {hi ? 'नियम' : 'Rules'}</button>
          <HeartButton spawnHeart={spawnHeart} onPress={() => setHeartCount(c => c + 1)} color={BLINK_COL} emoji={HEART_CFG.emoji} count={heartCount} />
          {userProfile && <span style={{ fontSize: '10px', opacity: 0.5, fontFamily: "'DM Sans', sans-serif" }}>{getTrustLabel(getTrustLevel(userProfile.rep_score ?? 0), hi)}</span>}
        </div>
      </div>
      <div style={s.chatArea}>
        {messages.length === 0 && <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '40px', fontSize: '13px' }}>{hi ? 'Blink Lounge में आपका स्वागत है! 🌸' : 'Welcome to the Blink Lounge! 🌸'}</div>}
        {messages.map(m => {
          const isMe = currentUser?.id === m.user_id;
          return (
            <div key={m.id} style={s.msgRow(isMe)}>
              {!isMe && <span style={s.senderName}>{(m.avatar_emoji || '🌸') + ' ' + (m.user_email?.split('@')[0] ?? 'fan')}</span>}
              <div style={s.bubble(isMe)}>{m.text}{!isMe && <button style={s.reportBtn} onClick={() => setShowReport(m)} title="Report">⚑</button>}</div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <div style={s.inputArea}>
        <input style={s.inputField} placeholder={hi ? 'Blink Lounge में share करें... 🌸' : 'Share your Blink energy... 🌸'} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} maxLength={500} disabled={muted} />
        <button style={s.sendBtn} onClick={sendMessage}>🌸</button>
      </div>
      {toast && <div style={s.toast(toast.type)}>{toast.text}</div>}
      {showRules && (
        <div style={s.overlay} onClick={() => setShowRules(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>📋 {hi ? 'समुदाय नियम' : 'Community Rules'}</h3>
            <p style={{ fontSize: '10px', opacity: 0.45, margin: '0 0 14px' }}>{hi ? '⚠️ JSukoon का अनधिकृत BLACKPINK फैन स्पेस। YG Entertainment से कोई संबंध नहीं।' : '⚠️ Unofficial BLACKPINK fan space. Not affiliated with YG Entertainment.'}</p>
            {rules.map((r, i) => (<div key={i} style={s.ruleItem}><span style={{ fontSize: '15px', flexShrink: 0 }}>{r.icon}</span><span>{r.hard && <strong style={{ color: BLINK_COL }}>{hi ? '[सख्त] ' : '[HARD] '}</strong>}{r.text}</span></div>))}
            <button style={s.closeBtn} onClick={() => setShowRules(false)}>{hi ? 'समझ गया! 🌸' : 'Got it! 🌸'}</button>
          </div>
        </div>
      )}
      {showReport && (
        <div style={s.overlay} onClick={() => setShowReport(null)}>
          <div style={{ ...s.modal, padding: '22px 22px 36px' }} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>🚩 {hi ? 'रिपोर्ट करें' : 'Report Message'}</h3>
            <p style={{ fontSize: '12px', opacity: 0.55, margin: '6px 0 14px' }}>"{showReport.text?.slice(0, 80)}{showReport.text?.length > 80 ? '...' : ''}"</p>
            {reportReasons.map(reason => (<button key={reason} onClick={() => handleReport(showReport, reason)} style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '12px 14px', borderRadius: '12px', background: `${BLINK_COL}12`, border: `1px solid ${BLINK_COL}30`, color: T.text, fontSize: '14px', textAlign: 'left', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{reason}</button>))}
            <button style={{ ...s.closeBtn, background: 'transparent', border: `1px solid ${BLINK_COL}30`, color: T.text }} onClick={() => setShowReport(null)}>{hi ? 'रद्द करें' : 'Cancel'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
