import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 K-DRAMA LOUNGE — Fan Community Chat
// ⚠️  NOT an official app. Not affiliated with any
//     Korean broadcaster, Netflix, Disney+, or studio.
//     Fan-made space for drama lovers only.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ROOM_NAME  = 'K-Drama Room';
const DRAMA_COL  = '#FAD0C4';

// ─── TOXICITY: banned phrase fragments ───
const BANNED_FRAGMENTS = [
  'worst drama', 'trash', 'garbage', 'hate', 'kill',
  'die', 'ugly', 'disgusting', 'pathetic', 'loser',
  'better than', 'worse than', 'sucks', 'flop',
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
export function KDramaRoom({ setTab, T, lang }) {
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
      .channel('kdrama_live')
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
    if (muted) { showToast(hi ? 'आप म्यूट हैं।' : 'You are muted.', 'error'); return; }

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
        hi ? `"${reason}" जैसे शब्द यहाँ allowed नहीं। कृपया respectful रहें 🙏`
           : `"${reason}" isn't allowed here. Let's keep it respectful 🙏`,
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
      background: `linear-gradient(180deg, ${DRAMA_COL}18 0%, transparent 100%)`,
      borderBottom: `1px solid ${DRAMA_COL}30`, textAlign: 'center',
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", fontSize: '24px',
      fontWeight: 700, color: DRAMA_COL, letterSpacing: '1px', margin: 0,
    },
    unofficialBadge: {
      display: 'inline-block', marginTop: '6px',
      background: `${DRAMA_COL}18`, border: `1px solid ${DRAMA_COL}45`,
      borderRadius: '20px', padding: '3px 10px',
      fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
      color: DRAMA_COL, opacity: 0.85,
    },
    rulesBtn: {
      marginTop: '8px', background: 'none', border: `1px solid ${DRAMA_COL}40`,
      borderRadius: '12px', padding: '4px 12px',
      color: DRAMA_COL, fontSize: '11px', cursor: 'pointer',
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
      background: isMe ? DRAMA_COL : `${T.accent}10`,
      color: isMe ? '#1a1a1a' : T.text, // dark text on peach
      border: `1px solid ${isMe ? 'transparent' : `${DRAMA_COL}25`}`,
      fontSize: '14px', lineHeight: '1.6',
      boxShadow: isMe ? `0 4px 14px ${DRAMA_COL}45` : 'none',
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
      borderTop: `1px solid ${DRAMA_COL}20`,
      display: 'flex', gap: '10px', alignItems: 'center',
    },
    inputField: {
      flex: 1, padding: '13px 20px', borderRadius: '28px',
      background: `${T.accent}06`, border: `1px solid ${DRAMA_COL}35`,
      color: T.text, outline: 'none', fontSize: '14px',
      fontFamily: "'DM Sans', sans-serif",
    },
    sendBtn: {
      width: '46px', height: '46px', borderRadius: '50%',
      background: DRAMA_COL, border: 'none', color: '#333',
      cursor: 'pointer', fontSize: '18px', flexShrink: 0,
      boxShadow: `0 4px 12px ${DRAMA_COL}55`,
    },
    backBtn: {
      position: 'absolute', left: 16, top: 54,
      background: 'none', border: 'none',
      color: DRAMA_COL, cursor: 'pointer', fontSize: '20px',
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
      border: `1px solid ${DRAMA_COL}30`,
    },
    modalTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px', color: DRAMA_COL,
      margin: '0 0 4px', fontWeight: 700,
    },
    ruleItem: {
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      padding: '10px 0', borderBottom: `1px solid ${DRAMA_COL}15`,
      fontSize: '13px', lineHeight: 1.5,
    },
    ruleIcon: { fontSize: '16px', marginTop: '1px', flexShrink: 0 },
    closeBtn: {
      width: '100%', marginTop: '20px', padding: '14px',
      background: DRAMA_COL, border: 'none', borderRadius: '16px',
      color: '#333', fontSize: '15px', fontWeight: 700,
      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    },
  };

  const rules = hi ? [
    { icon: '🚫', hard: true,  text: 'कोई hate speech या slurs नहीं — instant mute' },
    { icon: '🎭', hard: true,  text: 'Actors/directors को personally attack करना मना है' },
    { icon: '🔞', hard: true,  text: 'NSFW content सख्त मना है — auto-blocked' },
    { icon: '💿', hard: true,  text: 'Pirated episodes/content share करना illegal है' },
    { icon: '⚠️', hard: false, text: 'Spoiler alert दें — पहले "SPOILER ⚠️" लिखें' },
    { icon: '🔗', hard: false, text: 'Netflix/YouTube trailer links ✅ — piracy links ❌' },
    { icon: '💬', hard: false, text: 'Criticism OK है, disrespect नहीं' },
    { icon: '🚩', hard: false, text: '3 रिपोर्ट = message auto-hidden for review' },
  ] : [
    { icon: '🚫', hard: true,  text: 'No hate speech or slurs — zero tolerance, instant mute' },
    { icon: '🎭', hard: true,  text: 'No personal attacks on actors, directors, or writers' },
    { icon: '🔞', hard: true,  text: 'No NSFW content — automatically blocked' },
    { icon: '💿', hard: true,  text: 'No sharing pirated episodes or copyrighted content' },
    { icon: '⚠️', hard: false, text: 'Use spoiler warnings — type "SPOILER ⚠️" before spoilers' },
    { icon: '🔗', hard: false, text: 'Netflix / YouTube trailer links allowed — piracy links not' },
    { icon: '💬', hard: false, text: 'Criticism is welcome, disrespect is not' },
    { icon: '🚩', hard: false, text: '3 reports from users = message auto-hidden for review' },
  ];

  const reportReasons = hi
    ? ['घृणास्पद भाषा', 'Spam', 'NSFW', 'व्यक्तिगत हमला', 'Piracy link', 'अन्य']
    : ['Hate speech', 'Spam', 'NSFW content', 'Personal attack', 'Piracy link', 'Other'];

  return (
    <div style={s.container}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <button onClick={() => setTab('khub')} style={s.backBtn}>←</button>
        <h2 style={s.title}>🎬 {hi ? 'के-ड्रामा लाउंज' : 'K-Drama Lounge'}</h2>
        <div style={s.unofficialBadge}>
          {hi ? '⚠️ अनधिकृत फैन स्पेस — किसी broadcaster या studio से संबद्ध नहीं'
               : '⚠️ Unofficial fan space · Not affiliated with any broadcaster or studio'}
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
            {hi ? 'अपनी favourite drama के बारे में बात करें! 🎬' : 'Start the drama discussion! 🎬'}
          </div>
        )}
        {messages.map(m => {
          const isMe = currentUser?.id === m.user_id;
          return (
            <div key={m.id} style={s.msgRow(isMe)}>
              {!isMe && (
                <span style={s.senderName}>
                  {(m.avatar_emoji || '🎬') + ' ' + (m.user_email?.split('@')[0] ?? 'fan')}
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
          placeholder={hi ? 'Latest drama discuss करें...' : 'Which drama are you watching?'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          maxLength={500}
        />
        <button style={s.sendBtn} onClick={sendMessage}>🍿</button>
      </div>

      {/* ── TOAST ── */}
      {toast && <div style={s.toast(toast.type)}>{toast.text}</div>}

      {/* ── RULES MODAL ── */}
      {showRules && (
        <div style={s.overlay} onClick={() => setShowRules(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>📋 {hi ? 'समुदाय नियम' : 'Community Rules'}</h3>
            <p style={{ fontSize: '11px', opacity: 0.5, marginTop: 0, marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {hi
                ? '⚠️ यह JSukoon का एक अनधिकृत K-Drama फैन स्पेस है। किसी Korean broadcaster, Netflix, Disney+ या production house से कोई संबंध नहीं है।'
                : '⚠️ This is an unofficial K-Drama fan space on JSukoon. Not affiliated with any Korean broadcaster, Netflix, Disney+, Kakao, or any production studio.'}
            </p>
            {rules.map((r, i) => (
              <div key={i} style={s.ruleItem}>
                <span style={s.ruleIcon}>{r.icon}</span>
                <span>
                  {r.hard && <strong style={{ color: DRAMA_COL }}>{hi ? '[सख्त] ' : '[HARD RULE] '}</strong>}
                  {r.text}
                </span>
              </div>
            ))}
            <button style={s.closeBtn} onClick={() => setShowRules(false)}>
              {hi ? 'समझ गया, चैट करें! 🎬' : 'Got it, let me chat! 🎬'}
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
                  background: `${DRAMA_COL}12`, border: `1px solid ${DRAMA_COL}35`,
                  color: T.text, fontSize: '14px', textAlign: 'left',
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {reason}
              </button>
            ))}
            <button
              style={{ ...s.closeBtn, background: 'transparent', border: `1px solid ${DRAMA_COL}35`, color: T.text }}
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
