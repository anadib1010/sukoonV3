import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';
import { writeEmotionalCtx } from '../../utils/context';
import { supabase } from "../../supabase";

export function Reflection({ setTab, T, lang }) {
  const [thought, setThought]         = useState("");
  const [animating, setAnimating]     = useState(null);
  const [particles, setParticles]     = useState([]);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [burntHistory, setBurntHistory]     = useState([]);
  const [wishHistory, setWishHistory]       = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [visible, setVisible]         = useState(false);
  const hi = lang === "Hindi";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ─── PARTICLE TRIGGER + SUPABASE WRITE ───────────────────────────
  const triggerAnimation = async (type) => {
    if (!thought.trim()) return;
    setAnimating(type);
    writeEmotionalCtx(type, thought, { timestamp: Date.now() });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const tableName = type === "burn" ? 'reflection_burns' : 'quiet_wishes';
        await supabase.from(tableName).insert([{ content: thought, user_id: user.id }]);
      }
    } catch {}

    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      delay: Math.random() * 0.2 + "s",
      duration: Math.random() * 1.5 + 1 + "s",
      size: Math.random() * 6 + 4 + "px",
      xDrift: (Math.random() - 0.5) * 100 + "px",
    }));
    setParticles(newParticles);

    setTimeout(() => {
      setAnimating(null);
      setThought("");
      setParticles([]);
    }, 2500);
  };

  // ─── HISTORY FETCH ────────────────────────────────────────────────
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [burnRes, wishRes] = await Promise.all([
        supabase.from('reflection_burns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('quiet_wishes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (!burnRes.error) setBurntHistory(burnRes.data || []);
      if (!wishRes.error) setWishHistory(wishRes.data || []);
    } catch {}
    finally { setIsLoadingHistory(false); }
  };

  const toggleHistory = () => {
    if (!viewingHistory) fetchHistory();
    setViewingHistory(!viewingHistory);
  };

  // ─── STYLES ───────────────────────────────────────────────────────
  const s = {
    page: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      color: T.text,
      position: "relative",
      overflow: "hidden",
    },

    headerWrap: { position: "relative", zIndex: 10 },

    historyToggleBtn: {
      position: "absolute",
      top: "75px",
      right: "20px",
      background: "transparent",
      border: `1px solid ${T.borderWarm}`,
      borderRadius: 20,
      padding: "6px 16px",
      color: T.text,
      opacity: 0.8,
      cursor: "pointer",
      fontSize: 14,
      fontFamily: "'Cormorant Garamond', serif",
      transition: "opacity 0.2s",
    },

    body: { flex: 1, padding: "30px", display: "flex", flexDirection: "column", position: "relative" },

    // ── History view ──
    historyWrap: {
      animation: "fadeIn 0.5s ease",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },

    historyTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 28,
      color: T.text,
      fontWeight: 300,
      marginBottom: 20,
      textAlign: "center",
    },

    historyLoading: { color: T.text, opacity: 0.5, textAlign: "center" },

    historyGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      flex: 1,
      overflowY: "hidden",
    },

    historyCol: (right) => ({
      overflowY: "auto",
      ...(right
        ? { paddingRight: 10, borderRight: `1px solid ${T.borderWarm}` }
        : { paddingLeft: 10 }),
    }),

    historyColTitle: (color) => ({
      fontFamily: "'Cormorant Garamond', serif",
      color,
      opacity: 0.8,
      fontSize: 20,
      borderBottom: `1px solid ${T.borderWarm}`,
      paddingBottom: 10,
      marginTop: 0,
    }),

    historyEmpty: { color: T.text, opacity: 0.4, fontSize: 14 },

    historyItem: {
      padding: "10px 0",
      borderBottom: `1px dashed ${T.borderWarm}`,
      textAlign: "left",
    },

    historyDate: { color: T.textSoft, fontSize: 12, margin: "0 0 4px" },

    historyText: (italic) => ({
      color: T.text,
      opacity: italic ? 0.9 : 0.8,
      fontSize: 15,
      margin: 0,
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: italic ? "italic" : "normal",
    }),

    // ── Write view ──
    writeWrap: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },

    writeHeader: { textAlign: "center", marginBottom: 30 },

    writeTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 32,
      fontWeight: 300,
      margin: "0 0 8px",
      color: T.text,
    },

    writeSub: {
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      opacity: 0.6,
      color: T.text,
    },

    textAreaWrap: {
      flex: 1,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },

    textarea: {
      width: "100%",
      height: 250,
      background: "transparent",
      border: "none",
      color: T.text,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 26,
      textAlign: "center",
      outline: "none",
      resize: "none",
      lineHeight: 1.4,
    },

    particle: (p, type) => ({
      position: "absolute",
      top: type === "burn" ? "40%" : "60%",
      left: p.left,
      width: p.size,
      height: p.size,
      animationName: type === "burn" ? "burnDrop" : "starRise",
      animationDuration: p.duration,
      animationDelay: p.delay,
      animationFillMode: "forwards",
      animationTimingFunction: type === "burn" ? "cubic-bezier(0.4, 0, 1, 1)" : "ease-out",
      "--xDrift": p.xDrift,
    }),

    actionRow: { display: "flex", flexDirection: "column", gap: 16, marginTop: 20 },

    btnPair: { display: "flex", gap: 12 },

    burnBtn: (active) => ({
      flex: 1,
      padding: "18px",
      borderRadius: 16,
      background: "rgba(255,78,0,0.08)",
      border: "1px solid rgba(255,78,0,0.3)",
      color: "#ff7333",
      cursor: "pointer",
      opacity: active ? 1 : 0.4,
      transition: "all 0.3s",
    }),

    wishBtn: (active) => ({
      flex: 1,
      padding: "18px",
      borderRadius: 16,
      background: `${T.accent}15`,
      border: `1px solid ${T.accent}50`,
      color: T.accent,
      cursor: "pointer",
      opacity: active ? 1 : 0.4,
      transition: "all 0.3s",
    }),

    btnEmoji: { fontSize: 20, display: "block", marginBottom: 4 },

    btnLabel: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 18,
      fontWeight: 600,
    },
  };

  return (
    <div style={s.page}>

      {/* Physics CSS — kept inline since these are keyframe animations */}
      <style>{`
        @keyframes burnDrop {
          0%   { transform: translate(0,0) scale(1.5); opacity:1; background:#ff4e00; border-radius:50% 0 50% 50%; }
          50%  { background:#ff9d00; border-radius:50%; }
          100% { transform: translate(var(--xDrift),250px) scale(0); opacity:0; background:#333; }
        }
        @keyframes starRise {
          0%   { transform:translate(0,0) scale(1) rotate(45deg); opacity:1; background:#fff; box-shadow:0 0 10px #fff; }
          100% { transform:translate(var(--xDrift),-300px) scale(0.1) rotate(180deg); opacity:0; background:#ffd700; box-shadow:0 0 20px #ffd700; }
        }
        .text-dissolve { animation: dissolveOut 2s forwards; }
        @keyframes dissolveOut {
          0%   { filter:blur(0px); opacity:1; }
          50%  { filter:blur(4px); opacity:0.5; transform:scale(0.98); }
          100% { filter:blur(10px); opacity:0; transform:scale(0.95); }
        }
      `}</style>

      {/* Header */}
      <div style={s.headerWrap}>
        <PageNav
          onBack={() => viewingHistory ? setViewingHistory(false) : setTab("yakshagate")}
          onHome={() => setTab("home")}
          T={T} lang={lang}
        />
        {!animating && (
          <button
            onClick={toggleHistory}
            style={s.historyToggleBtn}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}
          >
            {viewingHistory ? (hi ? "वापस जाएं" : "Go Back") : (hi ? "इतिहास" : "History")}
          </button>
        )}
      </div>

      <div style={s.body}>
        {viewingHistory ? (

          /* ── HISTORY ── */
          <div style={s.historyWrap}>
            <h2 style={s.historyTitle}>{hi ? "आपकी यादें" : "Your Reflections"}</h2>

            {isLoadingHistory ? (
              <p style={s.historyLoading}>{hi ? "यादें ला रहा हूँ..." : "Gathering memories..."}</p>
            ) : (
              <div style={s.historyGrid}>

                <div style={s.historyCol(true)}>
                  <h3 style={s.historyColTitle("#ff4e00")}>🔥 {hi ? "राख" : "The Ashes"}</h3>
                  {burntHistory.length === 0 ? (
                    <p style={s.historyEmpty}>{hi ? "खाली" : "Empty"}</p>
                  ) : burntHistory.map(item => (
                    <div key={item.id} style={s.historyItem}>
                      <p style={s.historyDate}>{new Date(item.created_at).toLocaleDateString(hi ? "hi-IN" : "en-US")}</p>
                      <p style={s.historyText(false)}>"{item.content}"</p>
                    </div>
                  ))}
                </div>

                <div style={s.historyCol(false)}>
                  <h3 style={s.historyColTitle(T.accent)}>✨ {hi ? "सितारे" : "The Stars"}</h3>
                  {wishHistory.length === 0 ? (
                    <p style={s.historyEmpty}>{hi ? "खाली" : "Empty"}</p>
                  ) : wishHistory.map(item => (
                    <div key={item.id} style={s.historyItem}>
                      <p style={s.historyDate}>{new Date(item.created_at).toLocaleDateString(hi ? "hi-IN" : "en-US")}</p>
                      <p style={s.historyText(true)}>"{item.content}"</p>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

        ) : (

          /* ── WRITE VIEW ── */
          <div style={{ display: "flex", flexDirection: "column", height: "100%", ...s.writeWrap }}>

            <div style={s.writeHeader}>
              <h2 style={s.writeTitle}>{hi ? "पवित्र स्थान" : "Sacred Space"}</h2>
              <p style={s.writeSub}>{hi ? "लिखें, सहेजें, या जाने दें" : "Record, Save, or Release"}</p>
            </div>

            <div style={s.textAreaWrap}>
              <textarea
                className={animating ? "text-dissolve" : ""}
                value={thought}
                onChange={e => setThought(e.target.value)}
                disabled={!!animating}
                placeholder={hi ? "अपने विचार या इच्छा यहाँ लिखें..." : "Record your thought or wish here..."}
                style={s.textarea}
              />

              {animating && particles.map(p => (
                <div key={p.id} style={s.particle(p, animating)} />
              ))}
            </div>

            <div style={s.actionRow}>
              <div style={s.btnPair}>
                <button
                  onClick={() => triggerAnimation("burn")}
                  disabled={!thought.trim() || !!animating}
                  style={s.burnBtn(thought.trim() && !animating)}
                  onMouseEnter={e => { if (thought.trim()) e.currentTarget.style.background = "rgba(255,78,0,0.15)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,78,0,0.08)"}
                >
                  <span style={s.btnEmoji}>🔥</span>
                  <span style={s.btnLabel}>{hi ? "जलाएं" : "Burn"}</span>
                </button>

                <button
                  onClick={() => triggerAnimation("wish")}
                  disabled={!thought.trim() || !!animating}
                  style={s.wishBtn(thought.trim() && !animating)}
                  onMouseEnter={e => { if (thought.trim()) e.currentTarget.style.background = `${T.accent}25`; }}
                  onMouseLeave={e => e.currentTarget.style.background = `${T.accent}15`}
                >
                  <span style={s.btnEmoji}>✨</span>
                  <span style={s.btnLabel}>{hi ? "शांत इच्छा" : "Quiet Wish"}</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
