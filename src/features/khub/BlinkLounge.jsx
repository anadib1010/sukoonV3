import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌸 BLINK LOUNGE — Fan Community Chat
// ⚠️  NOT an official app. Not affiliated with YG
//     Entertainment or BLACKPINK in any way.
//     "BLACKPINK", "BLINK" are trademarks of
//     YG Entertainment. This is a fan-made space only.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ROOM_NAME  = 'Blink Lounge';
const BLINK_COL  = '#E91E8C';   // BLACKPINK's iconic hot pink

const BANNED_FRAGMENTS = [
  'flop', 'overrated', 'trash', 'garbage', 'hate', 'kill',
  'die', 'ugly', 'disgusting', 'pathetic', 'loser',
  'better than', 'worse than', 'sucks',
  'army trash', 'bts trash', 'bts flop',
  'blink trash', 'blink vs', 'blackpink vs',
];

const SPAM_LIMIT    = 5;
const SPAM_WINDOW_S = 10;

function checkToxicity(text) {
  const lower = text.toLowerCase();
  for (const frag of BANNED_FRAGMENTS) {
    if (lower.includes(frag)) return { toxic: true, reason: frag };
  }
  return { toxic: false };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function BlinkLounge({ setTab, T, lang }) {
  const hi = lang === 'Hindi';

  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showRules,   setShowRules]   = useState(false);
  const [showReport,  setShowReport]  = useState(null);
  const [toast,       setToast]       = useState(null);
  const [muted,       setMuted]       = useState(false);

  const scrollRef  = useRef(null);
  const recentMsgs = useRef([]);

  // ─── 1. AUTH ───
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  // ─── 2. FETCH + REALTIME ───
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('khub_messages')
        .select('*')
        .eq('room_name', ROOM_NAME)
        .eq('status', 'visible')
        .order('created_at', { ascending: true })
        .limit(100);
      if (!error && data) setMessages(data);
    };
    fetchMessages();

    const sub = supabase
      .channel('blink_lounge_live')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'khub_messages',
        filter: `room_name=eq.${ROOM_NAME}`,
      }, (payload) => {
        if (payload.new.status === 'visible') {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  // ─── 3. AUTO-SCROLL ───
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── 4. TOAST ───
  const showToast = (text, type = 'warn') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── 5. SEND ───
  const sendMessage = async () => {
    if (!input.trim() || !currentUser) return;
    if (muted) {
      showToast(hi ? 'आप अभी म्यूट हैं।' : 'You are currently muted.', 'error');
      return;
    }

    const now = Date.now();
    recentMsgs.current = recentMsgs.current.filter(t => now - t < SPAM_WINDOW_S * 1000);
    if (recentMsgs.current.length >= SPAM_LIMIT) {
      showToast(hi ? 'बहुत तेज़! थोड़ा रुकें 🐢' : 'Slow down a little 🐢', 'warn');
      return;
    }
    recentMsgs.current.push(now);

    if (input.length > 500) {
      showToast(hi ? 'संदेश 500 chars से छोटा रखें' : 'Keep messages under 500 chars', 'warn');
      return;
    }

    const { toxic, reason } = checkToxicity(input);
    if (toxic) {
      showToast(
        hi
          ? `"${reason}" जैसे शब्द यहाँ allowed नहीं। कृपया respectful रहें 🙏`
          : `"${reason}" isn't allowed here. Keep it kind 🙏`,
        'error'
      );
      return;
    }

    const textToSend = input.trim();
    setInput('');

    await supabase.from('khub_messages').insert({
      room_name:  ROOM_NAME,
      user_id:    currentUser.id,
      user_email: currentUser.email,
      text:       textToSend,
      status:     'visible',
      msg_type:   'text',
    });
  };

  // ─── 6. REPORT ───
  const submitReport = async (msg, reason) => {
    if (!currentUser) return;
    await supabase.from('message_reports').insert({
      message_id:  msg.id,
      reported_by: currentUser.id,
      reason,
    });
    const { count } = await supabase
      .from('message_reports')
      .select('*', { count: 'exact', head: true })
      .eq('message_id', msg.id);

    if (count >= 3) {
      await supabase.from('khub_messages').update({ status: 'hidden' }).eq('id', msg.id);
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    }
    setShowReport(null);
    showToast(hi ? 'रिपोर्ट भेजी गई ✅' : 'Report submitted ✅', 'ok');
  };

  // ─── STYLES ───
  const s = {
    container: {
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: T.bg, color: T.text, position: 'relative', overflow: 'hidden',
    },
    header: {
      padding: '52px 20px 16px',
      background: `linear-gradient(180deg, ${BLINK_COL}18 0%, transparent 100%)`,
      borderBottom: `1px solid ${BLINK_COL}30`, textAlign: 'center',
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: '24px',
      fontWeight: 700, color: BLINK_COL, letterSpacing: '1px', margin: 0,
    },
    unofficialBadge: {
      display: 'inline-block', marginTop: '6px',
      background: `${BLINK_COL}15`, border: `1px solid ${BLINK_COL}40`,
      borderRadius: '20px', padding: '3px 10px',
      fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
      color: BLINK_COL, opacity: 0.85,
    },
    rulesBtn: {
      marginTop: '8px', background: 'none', border: `1px solid ${BLINK_COL}35`,
      borderRadius: '12px', padding: '4px 12px',
      color: BLINK_COL, fontSize: '11px', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    chatArea: {
      flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
      display: 'flex', flexDirection: 'column', gap: '10px',
    },
    msgRow: (isMe) => ({
      display: 'flex', flexDirection: 'column',
      alignSelf: isMe ? 'flex-end' : 'flex-start',
      maxWidth: '78%',
    }),
    senderName: {
      fontSize: '10px', opacity: 0.5, marginBottom: '3px',
      paddingLeft: '4px', fontFamily: "'DM Sans', sans-serif",
    },
    bubble: (isMe) => ({
      padding: '12px 16px',
      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: isMe ? BLINK_COL : `${T.accent}10`,
      color: isMe ? '#fff' : T.text,
      border: `1px solid ${isMe ? 'transparent' : `${BLINK_COL}22`}`,
      fontSize: '14px', lineHeight: '1.6',
      boxShadow: isMe ? `0 4px 14px ${BLINK_COL}38` : 'none',
      position: 'relative',
    }),
    reportBtn: {
      position: 'absolute', top: '6px', right: '-24px',
      background: 'none', border: 'none',
      color: T.text, opacity: 0.25, fontSize: '12px',
      cursor: 'pointer', padding: '2px 4px',
    },
    inputArea: {
      padding: '16px 16px 32px', background: T.bg,
      borderTop: `1px solid ${BLINK_COL}18`,
      display: 'flex', gap: '10px', alignItems: 'center',
    },
    inputField: {
      flex: 1, padding: '13px 20px', borderRadius: '28px',
      background: `${T.accent}06`, border: `1px solid ${BLINK_COL}30`,
      color: T.text, outline: 'none', fontSize: '14px',
      fontFamily: "'DM Sans', sans-serif",
    },
    sendBtn: {
      width: '46px', height: '46px', borderRadius: '50%',
      background: BLINK_COL, border: 'none', color: '#fff',
      cursor: 'pointer', fontSize: '18px', flexShrink: 0,
      boxShadow: `0 4px 12px ${BLINK_COL}42`,
    },
    backBtn: {
      position: 'absolute', left: 16, top: 54,
      background: 'none', border: 'none',
      color: BLINK_COL, cursor: 'pointer', fontSize: '20px',
    },
    toast: (type) => ({
      position: 'fixed', bottom: '90px', left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'error' ? '#c0392b' : type === 'ok' ? '#27ae60' : '#e67e22',
      color: '#fff', borderRadius: '20px', padding: '10px 20px',
      fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
      zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap', maxWidth: '85vw', textAlign: 'center',
    }),
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 100, display: 'flex', alignItems: 'flex-end',
    },
    modal: {
      width: '100%', background: T.bg,
      borderRadius: '24px 24px 0 0',
      padding: '28px 24px 40px',
      maxHeight: '80vh', overflowY: 'auto',
      border: `1px solid ${BLINK_COL}30`,
    },
    modalTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px', color: BLINK_COL,
      margin: '0 0 4px', fontWeight: 700,
    },
    ruleItem: {
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      padding: '10px 0', borderBottom: `1px solid ${BLINK_COL}14`,
      fontSize: '13px', lineHeight: 1.5,
    },
    ruleIcon: { fontSize: '16px', marginTop: '1px', flexShrink: 0 },
    closeBtn: {
      width: '100%', marginTop: '20px', padding: '14px',
      background: BLINK_COL, border: 'none', borderRadius: '16px',
      color: '#fff', fontSize: '15px', fontWeight: 700,
      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    },
  };

  const rules = hi ? [
    { icon: '🚫', hard: true,  text: 'कोई hate speech या slurs नहीं — zero tolerance, instant mute' },
    { icon: '⚔️', hard: true,  text: 'Fandom wars सख्त मना — दूसरे fandoms को attack नहीं' },
    { icon: '🔞', hard: true,  text: 'NSFW content पूरी तरह banned — auto-blocked' },
    { icon: '🎵', hard: true,  text: 'Pirated music/content share करना illegal है' },
    { icon: '💬', hard: false, text: 'Max 5 messages per 10 seconds — spam = warning' },
    { icon: '🌸', hard: false, text: 'अपने idol को celebrate करें — दूसरों को down मत करें' },
    { icon: '🔗', hard: false, text: 'Spotify/YouTube links share करें — in-app playback नहीं' },
    { icon: '🚩', hard: false, text: '3 reports = message auto-hidden for review' },
    { icon: '⚠️', hard: false, text: 'Comparison wars नहीं — "मुझे यह पसंद है" ✅, "यह > वो" ❌' },
  ] : [
    { icon: '🚫', hard: true,  text: 'No hate speech or slurs — zero tolerance, instant mute' },
    { icon: '⚔️', hard: true,  text: 'No fandom wars — attacking other fandoms is not allowed' },
    { icon: '🔞', hard: true,  text: 'No NSFW content — automatically blocked' },
    { icon: '🎵', hard: true,  text: 'No sharing pirated music or copyrighted content' },
    { icon: '💬', hard: false, text: 'Max 5 messages per 10 seconds — spam gets a warning' },
    { icon: '🌸', hard: false, text: 'Celebrate your idols without putting others down' },
    { icon: '🔗', hard: false, text: 'Spotify / YouTube links are welcome — no in-app playback' },
    { icon: '🚩', hard: false, text: '3 reports from users = message goes to review queue' },
    { icon: '⚠️', hard: false, text: 'No comparison wars — "I love X" ✅, "X is better than Y" ❌' },
  ];

  const reportReasons = hi
    ? ['घृणास्पद भाषा', 'Spam', 'NSFW', 'Fandom Attack', 'Piracy link', 'अन्य']
    : ['Hate speech', 'Spam', 'NSFW content', 'Fandom attack', 'Piracy link', 'Other'];

  return (
    <div style={s.container}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <button onClick={() => setTab('khub')} style={s.backBtn}>←</button>
        <h2 style={s.title}>🌸 {hi ? 'ब्लिंक लाउंज' : 'Blink Lounge'}</h2>
        <div style={s.unofficialBadge}>
          {hi
            ? '⚠️ अनधिकृत फैन कम्युनिटी — YG Entertainment या BLACKPINK से संबद्ध नहीं'
            : '⚠️ Unofficial fan community · Not affiliated with YG Entertainment or BLACKPINK'}
        </div>
        <br />
        <button style={s.rulesBtn} onClick={() => setShowRules(true)}>
          📋 {hi ? 'नियम देखें' : 'View Community Rules'}
        </button>
      </div>

      {/* ── CHAT AREA ── */}
      <div style={s.chatArea}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.35, marginTop: '40px', fontSize: '13px' }}>
            {hi ? 'Blink Lounge में आपका स्वागत है! 🌸' : 'Welcome to the Blink Lounge! 🌸'}
          </div>
        )}
        {messages.map(m => {
          const isMe = currentUser?.id === m.user_id;
          return (
            <div key={m.id} style={s.msgRow(isMe)}>
              {!isMe && (
                <span style={s.senderName}>
                  {(m.avatar_emoji || '🌸') + ' ' + (m.user_email?.split('@')[0] ?? 'fan')}
                </span>
              )}
              <div style={s.bubble(isMe)}>
                {m.text}
                {!isMe && (
                  <button style={s.reportBtn} onClick={() => setShowReport(m)} title="Report">⚑</button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={s.inputArea}>
        <input
          style={s.inputField}
          placeholder={hi ? 'Blink Lounge में share करें... 🌸' : 'Share your Blink energy... 🌸'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          maxLength={500}
        />
        <button style={s.sendBtn} onClick={sendMessage}>🌸</button>
      </div>

      {/* ── TOAST ── */}
      {toast && <div style={s.toast(toast.type)}>{toast.text}</div>}

      {/* ── RULES MODAL ── */}
      {showRules && (
        <div style={s.overlay} onClick={() => setShowRules(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>📋 {hi ? 'समुदाय नियम' : 'Community Rules'}</h3>
            <p style={{ fontSize: '11px', opacity: 0.5, marginTop: 0, marginBottom: '16px', letterSpacing: '0.5px' }}>
              {hi
                ? '⚠️ यह JSukoon का एक अनधिकृत फैन स्पेस है। YG Entertainment या BLACKPINK से कोई आधिकारिक संबंध नहीं है। "BLACKPINK" और "BLINK" YG Entertainment के registered trademarks हैं।'
                : '⚠️ This is an unofficial fan space on JSukoon. Not affiliated with YG Entertainment or BLACKPINK. "BLACKPINK" and "BLINK" are registered trademarks of YG Entertainment.'}
            </p>
            {rules.map((r, i) => (
              <div key={i} style={s.ruleItem}>
                <span style={s.ruleIcon}>{r.icon}</span>
                <span>
                  {r.hard && <strong style={{ color: BLINK_COL }}>{hi ? '[सख्त] ' : '[HARD RULE] '}</strong>}
                  {r.text}
                </span>
              </div>
            ))}
            <button style={s.closeBtn} onClick={() => setShowRules(false)}>
              {hi ? 'समझ गया, चैट करें! 🌸' : 'Got it, let me chat! 🌸'}
            </button>
          </div>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {showReport && (
        <div style={s.overlay} onClick={() => setShowReport(null)}>
          <div style={{ ...s.modal, padding: '24px 24px 36px' }} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>🚩 {hi ? 'रिपोर्ट करें' : 'Report Message'}</h3>
            <p style={{ fontSize: '13px', opacity: 0.6, margin: '8px 0 16px' }}>
              "{showReport.text?.slice(0, 80)}{showReport.text?.length > 80 ? '...' : ''}"
            </p>
            {reportReasons.map(reason => (
              <button
                key={reason}
                onClick={() => submitReport(showReport, reason)}
                style={{
                  display: 'block', width: '100%', marginBottom: '10px',
                  padding: '13px 16px', borderRadius: '12px',
                  background: `${BLINK_COL}12`, border: `1px solid ${BLINK_COL}30`,
                  color: T.text, fontSize: '14px', textAlign: 'left',
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {reason}
              </button>
            ))}
            <button
              style={{ ...s.closeBtn, background: 'transparent', border: `1px solid ${BLINK_COL}30`, color: T.text }}
              onClick={() => setShowReport(null)}
            >
              {hi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
