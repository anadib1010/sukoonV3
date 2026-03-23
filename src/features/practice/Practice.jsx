import posthog from 'posthog-js';
import React, { useState, useEffect, useRef } from 'react';
import { Orb, Card } from '../../components/SharedUI';
import { creditSession } from '../../utils/activity';
import { MEDITATIONS, BREATHE_PATTERNS } from '../../utils/content';
import { MEDITATION_AUDIO } from '../../utils/constants';
import { MeditationGuide } from '../meditation/MeditationGuide';

export function Practice({ setTab, goBack, T, lang }) {
  const [fromRacing] = useState(() => {
    const v = typeof sessionStorage !== "undefined" && sessionStorage.getItem("jsukoon_context") === "racing";
    if (v) sessionStorage.removeItem("jsukoon_context");
    return v;
  });

  const [section, setSection]       = useState("breathwork");
  const [sel, setSel]               = useState(null);
  const [running, setRunning]       = useState(false);
  const [done, setDone]             = useState(false);
  const [secs, setSecs]             = useState(0);
  const [filter, setFilter]         = useState("All");
  const [pat, setPat]               = useState(BREATHE_PATTERNS ? BREATHE_PATTERNS[0] : null);
  const [going, setGoing]           = useState(false);
  const [voiceGuide]                = useState(true);
  const [phaseKey, setPhaseKey]     = useState("inhale");
  const [count, setCount]           = useState(0);
  const [cycles, setCycles]         = useState(0);
  const [guideLoaded, setGuideLoaded] = useState(false);
  const [guidePlaying, setGuidePlaying] = useState(false);
  const [guideError, setGuideError] = useState(false);
  const [visible, setVisible]       = useState(false);

  const timerRef = useRef(null);
  const phaseRef = useRef("inhale");
  const cntRef   = useRef(0);
  const tmRef    = useRef(null);
  const guideRef = useRef(null);

  const hi   = lang === "Hindi";
  const cats = ["All", "Morning", "Calm", "Relaxation", "Heart", "Sleep", "Urgent"];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ─── MEDITATION LOGIC ─────────────────────────────────────────────
  const start = (m) => { setSel(m); setSecs(m.dur * 60); setRunning(true); setDone(false); };

  const toggleMeditation = (m) => {
    if (sel?.id === m.id) {
      setRunning(false); setDone(false); setSel(null);
      if (guideRef.current) guideRef.current.pause();
    } else {
      start(m);
    }
  };

  useEffect(() => {
    if (!running) return;
    if (secs <= 0) { setRunning(false); setDone(true); creditSession(sel.dur); return; }
    timerRef.current = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [running, secs]);

  useEffect(() => {
    if (hi || !sel) { setGuideLoaded(true); return; }
    const audio = new Audio(MEDITATION_AUDIO[sel.id]);
    audio.preload = "auto";
    audio.oncanplaythrough = () => setGuideLoaded(true);
    audio.onerror = () => setGuideError(true);
    audio.onended = () => setGuidePlaying(false);
    guideRef.current = audio;
    return () => { if (audio) { audio.pause(); audio.src = ""; } };
  }, [sel, hi]);

  const toggleGuide = () => {
    if (hi) { setGuidePlaying(!guidePlaying); return; }
    const a = guideRef.current;
    if (!a) return;
    if (guidePlaying) { a.pause(); setGuidePlaying(false); }
    else { a.play().then(() => setGuidePlaying(true)).catch(() => setGuideError(true)); }
  };

  const speakHindi = (text) => {
    if (!guidePlaying || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN"; u.rate = 0.82;
    window.speechSynthesis.speak(u);
  };

  // ─── BREATHWORK LOGIC ─────────────────────────────────────────────
  const getPhases = (p) => [
    { key: "inhale", label: hi ? "सांस लें"  : "Inhale",  dur: p.inhale },
    { key: "hold1",  label: hi ? "रोकें"     : "Hold",    dur: p.hold1  },
    { key: "exhale", label: hi ? "छोड़ें"    : "Exhale",  dur: p.exhale },
    { key: "hold2",  label: hi ? "रोकें"     : "Hold",    dur: p.hold2  },
  ].filter(x => x.dur > 0);

  const toggleBreath = (p) => {
    if (pat?.name === p.name) { if (going) stopBreath(true); setPat(null); }
    else { setPat(p); stopBreath(); }
  };

  useEffect(() => {
    if (!going || !pat) { window.speechSynthesis?.cancel(); clearTimeout(tmRef.current); return; }
    const phases = getPhases(pat);
    let pi = phases.findIndex(p => p.key === phaseRef.current);
    if (pi < 0) pi = 0;
    const tick = () => {
      cntRef.current++;
      setCount(cntRef.current);
      if (cntRef.current === 1 && voiceGuide && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(phases[pi].label);
        u.lang = hi ? "hi-IN" : "en-US"; u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
      if (cntRef.current >= phases[pi].dur) {
        cntRef.current = 0;
        pi = (pi + 1) % phases.length;
        if (pi === 0) setCycles(c => c + 1);
        phaseRef.current = phases[pi].key;
        setPhaseKey(phases[pi].key);
        setCount(0);
      }
      tmRef.current = setTimeout(tick, 1000);
    };
    tmRef.current = setTimeout(tick, 1000);
    return () => { clearTimeout(tmRef.current); window.speechSynthesis?.cancel(); };
  }, [going, pat, voiceGuide, lang]);

  const stopBreath = (completed = false) => {
    if (completed || cycles > 0) {
      const totalSecs = cycles * (pat.inhale + (pat.hold1 || 0) + pat.exhale + (pat.hold2 || 0));
      creditSession(Math.max(1, Math.round(totalSecs / 60)));
      posthog.capture('breathwork_completed', { pattern: pat.name, cycles, lang });
    }
    setGoing(false); setPhaseKey("inhale"); setCount(0); setCycles(0);
    phaseRef.current = "inhale"; cntRef.current = 0;
    window.speechSynthesis?.cancel();
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const phases   = pat ? getPhases(pat) : [];
  const curPhase = phases.find(p => p.key === phaseKey) || phases[0] || {};
  const guidance = phaseKey === "inhale"
    ? (hi ? "धीरे-धीरे सांस अंदर लें।" : "Inhale slowly.")
    : phaseKey === "exhale"
      ? (hi ? "छोड़ें... तनाव जाने दें।" : "Exhale... let go.")
      : (hi ? "यहाँ रुकें।" : "Hold and rest.");

  // ─── STYLES ───────────────────────────────────────────────────────
  const s = {
    page: { height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: T.bg },
    flexFill:   { flex: 1 },
    orbMargin:  { margin: "20px 0" },

    header: {
      padding: "52px 18px 0",
      flexShrink: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    },

    navRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },

    backBtn: { background: "none", border: "none", color: T.textSoft, fontSize: 14, cursor: "pointer" },

    homeBtn: {
      background: `${T.accent}15`,
      border: `1px solid ${T.accent}30`,
      borderRadius: 99,
      padding: "5px 12px",
      color: T.accent,
      fontSize: 12,
      cursor: "pointer",
    },

    heading: { fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: T.text, fontWeight: 400, marginBottom: 16 },

    tabToggle: {
      display: "flex",
      background: T.surfaceAlt,
      borderRadius: 16,
      padding: 4,
      marginBottom: 20,
      border: `1px solid ${T.border}`,
    },

    tab: (active) => ({
      flex: 1,
      padding: "10px 8px",
      borderRadius: 12,
      background: active ? T.surface : "transparent",
      border: `1px solid ${active ? T.borderWarm : "transparent"}`,
      color: active ? T.accent : T.muted,
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      cursor: "pointer",
      transition: "all 0.2s",
    }),

    scrollArea: { flex: 1, overflowY: "auto", padding: "0 18px 100px" },

    // Sessions
    filterBar: { display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 8 },

    filterChip: (active) => ({
      background: active ? `${T.accent}22` : T.surface,
      border: `1px solid ${active ? T.accent + "55" : T.border}`,
      color: active ? T.accent : T.textSoft,
      borderRadius: 99,
      padding: "6px 14px",
      fontSize: 13,
      flexShrink: 0,
      cursor: "pointer",
      transition: "all 0.2s",
    }),

    medList: { display: "flex", flexDirection: "column", gap: 10 },

    medHeader: (active, col) => ({
      width: "100%",
      background: active ? `${col}10` : T.surface,
      border: `1px solid ${active ? col + "50" : col + "22"}`,
      borderRadius: 18,
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.2s",
    }),

    medIcon: (col) => ({
      width: 50,
      height: 50,
      borderRadius: 14,
      background: `${col}18`,
      border: `1px solid ${col}30`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24,
      flexShrink: 0,
    }),

    medTitle: { fontWeight: 500, color: T.text, margin: "0 0 3px", fontSize: 14 },
    medDur: (col) => ({ color: col, fontSize: 13 }),

    medPlayer: {
      marginTop: 8,
      padding: "24px 16px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: 16,
      border: `1px solid ${T.borderWarm}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },

    progressTrack: { width: "100%", maxWidth: 220, height: 4, background: T.surfaceAlt, borderRadius: 99, marginBottom: 16, overflow: "hidden" },
    progressBar: (pct, col) => ({ height: "100%", width: `${pct * 100}%`, background: col, transition: "width 1s linear" }),

    medBtnRow: { display: "flex", gap: 12, alignItems: "center" },

    voiceBtn: (col) => ({
      background: `${col}15`,
      border: `1px solid ${col}40`,
      borderRadius: 99,
      padding: "8px 20px",
      color: col,
      fontSize: 13,
      cursor: "pointer",
    }),

    endBtn: {
      background: "transparent",
      border: `1px solid ${T.muted}35`,
      color: T.muted,
      fontSize: 13,
      padding: "8px 20px",
      borderRadius: 99,
      cursor: "pointer",
    },

    doneMed: { fontSize: 44, marginBottom: 12, display: "block" },
    doneMedTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: T.accentSoft, fontWeight: 400, margin: "0 0 12px" },
    closeBtn: { background: `${T.accent}20`, border: `1px solid ${T.accent}45`, color: T.accent, padding: "10px 28px", borderRadius: 99, fontSize: 14, cursor: "pointer" },

    emergencyBtn: (small) => ({
      width: small ? "auto" : "100%",
      marginTop: small ? 16 : 32,
      padding: small ? "10px 20px" : "16px",
      borderRadius: 18,
      background: `${T.accent}08`,
      border: `1px dashed ${T.accent}40`,
      color: T.accent,
      fontSize: small ? 12 : 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
    }),

    // Breathwork
    racingBanner: {
      background: `${T.accent}10`,
      border: `1px solid ${T.accent}28`,
      borderRadius: 14,
      padding: "12px 16px",
      marginBottom: 16,
    },

    racingText: { fontSize: 13, margin: 0, color: T.textSoft },

    breathList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 },

    breathHeader: (active) => ({
      width: "100%",
      background: active ? `${T.accent}12` : T.surface,
      border: `1px solid ${active ? T.accent + "55" : T.border}`,
      borderRadius: 16,
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.2s",
    }),

    breathDot: (active) => ({
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: T.accent,
      opacity: active ? 1 : 0.3,
      flexShrink: 0,
      transition: "opacity 0.2s",
    }),

    breathName: { fontWeight: 500, color: T.text, fontSize: 14, margin: "0 0 2px" },
    breathDesc: { fontSize: 11, color: T.muted, margin: 0 },

    breathContent: {
      marginTop: 8,
      padding: "24px 16px",
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${T.borderWarm}`,
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
    },

    breathProgress: { width: "100%", maxWidth: 180, textAlign: "center" },
    breathProgressTrack: { width: "100%", height: 3, background: T.surfaceAlt, borderRadius: 99, marginBottom: 8, overflow: "hidden" },
    breathProgressBar: (pct) => ({ height: "100%", width: `${pct * 100}%`, background: T.accent, transition: "width 1s linear" }),
    breathCycleText: { fontSize: 11, color: T.muted, margin: 0 },

    breathToggleBtn: (active) => ({
      background: active ? `${T.muted}18` : `${T.accent}22`,
      border: `1px solid ${active ? T.muted + "35" : T.accent + "55"}`,
      color: active ? T.muted : T.accent,
      padding: "12px 40px",
      borderRadius: 99,
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
    }),

    guidanceCard: { textAlign: "center", width: "100%", padding: "16px" },
    guidanceText: { fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: T.textSoft, fontSize: 18, margin: 0 },
  };

  const EmergencyButton = ({ isSmall = false }) => (
    <button
      onClick={() => {
        if (guideRef.current) guideRef.current.pause();
        window.speechSynthesis?.cancel();
        setTab("focus");
      }}
      style={s.emergencyBtn(isSmall)}
      onMouseEnter={e => e.currentTarget.style.background = `${T.accent}15`}
      onMouseLeave={e => e.currentTarget.style.background = `${T.accent}08`}
    >
      {hi ? "मुझे और सहायता चाहिए (5-4-3-2-1)" : "I Need More (Play 5-4-3-2-1)"}
    </button>
  );

  const TABS = [
    { id: "breathwork", label: hi ? "श्वास"  : "Breathwork", icon: "🌬️" },
    { id: "sessions",   label: hi ? "सत्र"   : "Sessions",   icon: "🧘" },
  ];

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.navRow}>
          <button onClick={goBack || (() => setTab("home"))} style={s.backBtn}>
            ← {hi ? "वापस" : "Back"}
          </button>
          <button onClick={() => setTab("home")} style={s.homeBtn}>
            🏡 {hi ? "होम" : "Home"}
          </button>
        </div>
        <h1 style={s.heading}>{hi ? "अभ्यास" : "Practice"}</h1>
        <div style={s.tabToggle}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setSection(t.id)} style={s.tab(section === t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-area" style={s.scrollArea}>

        {/* ── SESSIONS ── */}
        {section === "sessions" ? (
          <>
            <div style={s.filterBar}>
              {cats.map(c => (
                <button key={c} onClick={() => setFilter(c)} style={s.filterChip(filter === c)}>{c}</button>
              ))}
            </div>

            <div style={s.medList}>
              {(filter === "All" ? MEDITATIONS : MEDITATIONS.filter(m => m.cat === filter)).map(m => (
                <div key={m.id}>
                  <button
                    onClick={() => toggleMeditation(m)}
                    style={s.medHeader(sel?.id === m.id, m.col)}
                    onMouseEnter={e => { if (sel?.id !== m.id) e.currentTarget.style.background = `${m.col}08`; }}
                    onMouseLeave={e => { if (sel?.id !== m.id) e.currentTarget.style.background = T.surface; }}
                  >
                    <div style={s.medIcon(m.col)}>{m.emoji}</div>
                    <div style={s.flexFill}>
                      <p style={s.medTitle}>{hi ? (m.titleH || m.title) : m.title}</p>
                      <span style={s.medDur(m.col)}>{m.dur} {hi ? "मिनट" : "min"}</span>
                    </div>
                  </button>

                  {sel?.id === m.id && (running || done) && (
                    <div className="fade-down" style={s.medPlayer}>
                      {running ? (
                        <>
                          <MeditationGuide sel={m} secs={secs} T={T} lang={lang} onSpeak={speakHindi} />
                          <div style={s.orbMargin}>
                            <Orb size={140} col={m.col} pulse label={fmt(secs)} />
                          </div>
                          <div style={s.progressTrack}>
                            <div style={s.progressBar(1 - (secs / (m.dur * 60)), m.col)} />
                          </div>
                          <div style={s.medBtnRow}>
                            <button onClick={toggleGuide} style={s.voiceBtn(m.col)}>
                              {guidePlaying ? "⏸" : "🎙"} {hi ? "आवाज़" : "Voice"}
                            </button>
                            <button onClick={() => toggleMeditation(m)} style={s.endBtn}>
                              {hi ? "बंद करें" : "End"}
                            </button>
                          </div>
                          <EmergencyButton isSmall={true} />
                        </>
                      ) : (
                        <>
                          <span style={s.doneMed}>🌸</span>
                          <h2 style={s.doneMedTitle}>{hi ? "बहुत अच्छा।" : "Beautiful."}</h2>
                          <button onClick={() => toggleMeditation(m)} style={s.closeBtn}>
                            {hi ? "बंद करें" : "Close"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <EmergencyButton />
          </>

        ) : (

          /* ── BREATHWORK ── */
          <>
            {fromRacing && (
              <div style={s.racingBanner}>
                <p style={s.racingText}>
                  🌀 {hi ? "दौड़ते विचार? Box Breathing सबसे तेज़ है।" : "Racing thoughts? Box Breathing works fastest."}
                </p>
              </div>
            )}

            <div style={s.breathList}>
              {BREATHE_PATTERNS.map(p => (
                <div key={p.name}>
                  <button
                    onClick={() => toggleBreath(p)}
                    style={s.breathHeader(pat?.name === p.name)}
                    onMouseEnter={e => { if (pat?.name !== p.name) e.currentTarget.style.background = `${T.accent}08`; }}
                    onMouseLeave={e => { if (pat?.name !== p.name) e.currentTarget.style.background = T.surface; }}
                  >
                    <div style={s.breathDot(pat?.name === p.name)} />
                    <div style={s.flexFill}>
                      <p style={s.breathName}>{p.name}</p>
                      <p style={s.breathDesc}>{p.desc}</p>
                    </div>
                  </button>

                  {pat?.name === p.name && (
                    <div className="fade-down" style={s.breathContent}>
                      <Orb size={150} col={T.accent} pulse={going} label={going ? curPhase.label : null} />

                      {going && (
                        <div style={s.breathProgress}>
                          <div style={s.breathProgressTrack}>
                            <div style={s.breathProgressBar(count / curPhase.dur)} />
                          </div>
                          <p style={s.breathCycleText}>{hi ? `चक्र: ${cycles}` : `Cycle: ${cycles}`}</p>
                        </div>
                      )}

                      <button
                        onClick={() => going ? stopBreath(true) : setGoing(true)}
                        style={s.breathToggleBtn(going)}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        {going ? (hi ? "रोकें" : "Stop") : (hi ? "शुरू करें" : "Begin")}
                      </button>

                      {going && (
                        <Card T={T} style={s.guidanceCard}>
                          <p style={s.guidanceText}>{guidance}</p>
                        </Card>
                      )}

                      {going && <EmergencyButton isSmall={true} />}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <EmergencyButton />
          </>
        )}
      </div>
    </div>
  );
}
