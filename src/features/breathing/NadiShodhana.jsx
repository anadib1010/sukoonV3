import React, { useState, useEffect, useRef } from 'react';
import { creditSession } from '../../utils/activity';

export function NadiShodhana({ T, lang }) {
  const hi = lang === "Hindi";

  const [going, setGoing] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("inhale_left");
  const [count, setCount] = useState(0);
  const [done,  setDone]  = useState(false);

  const tmRef      = useRef(null);
  const phaseRef   = useRef("inhale_left");
  const countRef   = useRef(0);
  const roundRef   = useRef(0);
  const TARGET     = 5;

  const PHASES = [
    { key:"inhale_left",  label:hi?"बाईं नाक से सांस लें":"Inhale — Left",  nostril:"left",  dur:4 },
    { key:"hold",         label:hi?"रोकें (दोनों बंद)":"Hold Both",         nostril:"both",  dur:4 },
    { key:"exhale_right", label:hi?"दाईं नाक से छोड़ें":"Exhale — Right",   nostril:"right", dur:6 },
    { key:"inhale_right", label:hi?"दाईं नाक से सांस लें":"Inhale — Right", nostril:"right", dur:4 },
    { key:"hold2",        label:hi?"रोकें (दोनों बंद)":"Hold Both",         nostril:"both",  dur:4 },
    { key:"exhale_left",  label:hi?"बाईं नाक से छोड़ें":"Exhale — Left",    nostril:"left",  dur:6 },
  ];

  useEffect(() => {
    if (!going) { clearTimeout(tmRef.current); return; }
    let pi = PHASES.findIndex(p => p.key === phaseRef.current);
    if (pi < 0) pi = 0;
    const tick = () => {
      countRef.current++;
      setCount(countRef.current);
      if (countRef.current >= PHASES[pi].dur) {
        countRef.current = 0;
        pi = (pi + 1) % PHASES.length;
        if (pi === 0) {
          roundRef.current++;
          setRound(roundRef.current);
          if (roundRef.current >= TARGET) { setGoing(false); setDone(true); creditSession(4); return; }
        }
        phaseRef.current = PHASES[pi].key;
        setPhase(PHASES[pi].key);
        setCount(0);
        if (navigator.vibrate) navigator.vibrate(15);
      }
      tmRef.current = setTimeout(tick, 1000);
    };
    tmRef.current = setTimeout(tick, 1000);
    return () => clearTimeout(tmRef.current);
  }, [going]);

  const stop = () => {
    setGoing(false); setPhase("inhale_left"); setCount(0); setRound(0);
    phaseRef.current = "inhale_left"; countRef.current = 0; roundRef.current = 0;
  };

  const curPhase = PHASES.find(p => p.key === phase);
  const phProg   = curPhase ? (count / curPhase.dur) * 100 : 0;

  const isActive = (side) => curPhase?.nostril === side || curPhase?.nostril === "both";

  const s = {
    card:      { background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "24px 20px", maxWidth: 400, margin: "0 auto", textAlign: "center" },
    doneEmoji: { fontSize: 48, display: "block", marginBottom: 16 },
    doneTitle: { fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.accentSoft, fontWeight: 400, marginBottom: 8 },
    doneDesc:  { fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 24 },
    resetBtn:  { background: `${T.accent}20`, border: `1px solid ${T.accent}40`, color: T.accent, fontSize: 13, padding: "10px 28px", borderRadius: 99, cursor: "pointer" },
    progress:  { display: "flex", gap: 6, marginBottom: 20 },
    progBar:   (i) => ({ flex: 1, height: 3, borderRadius: 99, background: i < round ? T.accent : i === round && going ? `${T.accent}55` : T.surfaceAlt, transition: "background 0.4s ease" }),
    nostrils:  { display: "flex", justifyContent: "center", gap: 24, marginBottom: 24 },
    nostril:   (side) => ({ width: 72, height: 72, borderRadius: "50%", background: isActive(side) ? `${T.accent}25` : T.surfaceAlt, border: `2px solid ${isActive(side) ? T.accent : T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.4s ease" }),
    nostrilEmoji: { fontSize: 24 },
    nostrilLabel: { fontSize: 10, fontWeight: 700, color: T.textSoft },
    infoBox:   { background: `${T.accent}05`, padding: 16, borderRadius: 16, marginBottom: 20, border: `1px dashed ${T.accent}30`, textAlign: 'left' },
    infoTitle: { fontSize: 13, fontWeight: 600, color: T.accent, marginBottom: 4 },
    infoDesc:  { fontSize: 12, color: T.textSoft, lineHeight: 1.5, margin: 0 },
    phaseWrap: { marginBottom: 20 },
    phaseLabel:{ fontSize: 16, color: T.text, fontWeight: 600, marginBottom: 10 },
    barTrack:  { width: "100%", height: 4, background: T.surfaceAlt, borderRadius: 99, overflow: "hidden" },
    barFill:   { height: "100%", width: `${phProg}%`, background: T.accent, transition: "width 1s linear" },
    roundNum:  { fontSize: 11, color: T.muted, letterSpacing: 1, marginBottom: 16 },
    actionBtn: { width: "100%", background: going ? `${T.muted}15` : `${T.accent}22`, border: `1px solid ${going ? T.muted + "30" : T.accent + "50"}`, color: going ? T.muted : T.accent, fontSize: 14, fontWeight: 600, padding: 15, borderRadius: 16, cursor: "pointer", transition: "all 0.2s" },
  };

  if (done) return (
    <div className="fade-in" style={s.card}>
      <span style={s.doneEmoji}>🌬️</span>
      <h3 style={s.doneTitle}>{hi ? "नाड़ी शोधन पूर्ण।" : "Nadi Shodhana complete."}</h3>
      <p style={s.doneDesc}>{hi ? "दोनों नाड़ियाँ अब संतुलित हैं।" : "Both channels are now balanced."}</p>
      <button onClick={() => { setDone(false); stop(); }} style={s.resetBtn}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >{hi ? "फिर से करें" : "Begin again"}</button>
    </div>
  );

  return (
    <div style={s.card}>
      <div style={s.progress}>
        {[...Array(TARGET)].map((_, i) => <div key={i} style={s.progBar(i)} />)}
      </div>
      <div style={s.nostrils}>
        {["left", "right"].map(side => (
          <div key={side} style={s.nostril(side)}>
            <span style={s.nostrilEmoji}>{side === "left" ? "👈" : "👉"}</span>
            <span style={s.nostrilLabel}>{side === "left" ? (hi ? "बायां" : "LEFT") : (hi ? "दायां" : "RIGHT")}</span>
          </div>
        ))}
      </div>
      {!going && (
        <div style={s.infoBox}>
          <p style={s.infoTitle}>{hi ? "हाथ की मुद्रा:" : "Hand Position:"}</p>
          <p style={s.infoDesc}>
            {hi
              ? "दाएं हाथ का प्रयोग करें। अंगूठे से दाईं नाक और अनामिका से बाईं नाक को बारी-बारी से बंद करें।"
              : "Use your right hand. Use your thumb for the right nostril and ring finger for the left."}
          </p>
        </div>
      )}
      {going && (
        <div style={s.phaseWrap}>
          <p style={s.phaseLabel}>{curPhase?.label}</p>
          <div style={s.barTrack}><div style={s.barFill} /></div>
        </div>
      )}
      <p style={s.roundNum}>
        {hi ? `चक्र ${round + (going ? 1 : 0)} / ${TARGET}` : `ROUND ${round + (going ? 1 : 0)} OF ${TARGET}`}
      </p>
      <button onClick={() => going ? stop() : setGoing(true)} style={s.actionBtn}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {going ? (hi ? "रोकें" : "Stop") : (hi ? "शुरू करें" : "Begin Practice")}
      </button>
    </div>
  );
}
