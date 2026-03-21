import React, { useState } from 'react';
import { creditSession } from '../../utils/activity';

export function SensoryAnchor({ T, lang }) {
  const hi = lang === "Hindi";

  const STEPS = [
    { count:5, sense:hi?"देखें":"See",   icon:"👁️", instruction:hi?"5 चीज़ें जो आप देख सकते हैं":"5 things you can see",   color:"#7A9EA8" },
    { count:4, sense:hi?"सुनें":"Hear",  icon:"👂", instruction:hi?"4 चीज़ें जो आप सुन सकते हैं":"4 things you can hear",  color:"#8aaa7a" },
    { count:3, sense:hi?"छुएं":"Touch",  icon:"🤚", instruction:hi?"3 चीज़ें जो आप छू सकते हैं":"3 things you can touch", color:"#D4A373" },
    { count:2, sense:hi?"सूंघें":"Smell", icon:"👃", instruction:hi?"2 चीज़ें जो आप सूंघ सकते हैं":"2 things you can smell",color:"#C88A8E" },
    { count:1, sense:hi?"चखें":"Taste",  icon:"👅", instruction:hi?"1 चीज़ जो आप चख सकते हैं":"1 thing you can taste",  color:"#726FBA" },
  ];

  const [started,      setStarted]      = useState(false);
  const [stepIdx,      setStepIdx]      = useState(0);
  const [tapped,       setTapped]       = useState([]);
  const [done,         setDone]         = useState(false);
  const [transitioning,setTransitioning]= useState(false);

  const step = STEPS[stepIdx];

  const handleTap = (i) => {
    if (tapped.includes(i)) return;
    if (navigator.vibrate) navigator.vibrate(25);
    const next = [...tapped, i];
    setTapped(next);
    if (next.length === step.count) {
      setTimeout(() => {
        if (stepIdx < STEPS.length - 1) {
          setTransitioning(true);
          setTimeout(() => { setStepIdx(s => s + 1); setTapped([]); setTransitioning(false); }, 500);
        } else {
          setDone(true); creditSession(2);
        }
      }, 400);
    }
  };

  const reset = () => { setStepIdx(0); setTapped([]); setDone(false); setTransitioning(false); setStarted(false); };

  const s = {
    card:     { background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "24px 20px", maxWidth: 400, margin: "0 auto", textAlign: "center" },
    infoBox:  { background: `${T.accent}05`, padding: 18, borderRadius: 20, border: `1px solid ${T.accent}15`, marginBottom: 24, textAlign: "left" },
    infoTitle:{ fontSize: 16, color: T.accent, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Cormorant Garamond',serif" },
    infoDesc: { fontSize: 13, color: T.textSoft, lineHeight: 1.6, margin: "0 0 16px" },
    infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 14, borderTop: `1px solid ${T.accent}15` },
    infoItem: { fontSize: 11, color: T.muted, display: "flex", alignItems: "center", gap: 4 },
    startBtn: { width: "100%", background: `${T.accent}22`, border: `1px solid ${T.accent}55`, color: T.accent, padding: 14, borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" },
    doneEmoji:{ fontSize: 48, display: "block", marginBottom: 16 },
    doneTitle:{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.accentSoft, fontWeight: 400, marginBottom: 8 },
    doneDesc: { fontSize: 13, color: T.muted, lineHeight: 1.7, maxWidth: 240, margin: "0 auto 24px" },
    resetBtn: { background: `${T.accent}20`, border: `1px solid ${T.accent}40`, color: T.accent, fontSize: 13, padding: "10px 28px", borderRadius: 99, cursor: "pointer" },
    gameCard: { background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "24px 20px", maxWidth: 400, margin: "0 auto", textAlign: "center", opacity: transitioning ? 0 : 1, transition: "opacity 0.5s ease" },
    progress: { display: "flex", gap: 6, marginBottom: 24 },
    progBar:  (i) => ({ flex: 1, height: 3, borderRadius: 99, background: i < stepIdx ? STEPS[i].color : i === stepIdx ? `${step.color}55` : T.surfaceAlt, transition: "background 0.4s ease" }),
    stepHead: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 20 },
    stepIcon: { width: 48, height: 48, borderRadius: 14, background: `${step.color}18`, border: `1px solid ${step.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 },
    stepNow:  { fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 2px" },
    stepInstr:{ fontSize: 16, color: T.text, fontWeight: 600, margin: 0 },
    tapRow:   { display: "flex", justifyContent: "center", gap: 14, margin: "20px 0", flexWrap: "wrap" },
    tapBtn:   (tpd) => ({ width: 54, height: 54, borderRadius: "50%", background: tpd ? `${step.color}30` : T.surfaceAlt, border: `2px solid ${tpd ? step.color : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "all 0.3s ease", transform: tpd ? "scale(1.1)" : "scale(1)", boxShadow: tpd ? `0 0 16px ${step.color}40` : "none", cursor: "pointer" }),
    bar:      { width: "100%", height: 4, background: T.surfaceAlt, borderRadius: 99, marginBottom: 12, overflow: "hidden" },
    barFill:  { height: "100%", width: `${(tapped.length / step.count) * 100}%`, background: step.color, transition: "width 0.3s ease" },
    stepNum:  { fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", opacity: 0.6 },
  };

  if (!started && !done) return (
    <div className="fade-in" style={s.card}>
      <div style={s.infoBox}>
        <h4 style={s.infoTitle}>🎯 {hi ? "यह कैसे मदद करता है?" : "How this helps?"}</h4>
        <p style={s.infoDesc}>
          {hi ? "जब विचार बहुत तेज़ हों, तब यह खेल आपका ध्यान वर्तमान (present) में वापस लाता है।"
              : "When thoughts race, this game pulls your focus back to the present moment."}
        </p>
        <div style={s.infoGrid}>
          {STEPS.map(st => <div key={st.sense} style={s.infoItem}><span>{st.icon}</span> {st.count} {st.sense}</div>)}
        </div>
      </div>
      <button onClick={() => setStarted(true)} style={s.startBtn}
        onMouseEnter={e => e.currentTarget.style.background = `${T.accent}33`}
        onMouseLeave={e => e.currentTarget.style.background = `${T.accent}22`}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {hi ? "ग्राउंडिंग शुरू करें" : "Start Grounding"}
      </button>
    </div>
  );

  if (done) return (
    <div className="fade-in" style={s.card}>
      <span style={s.doneEmoji}>🌿</span>
      <h3 style={s.doneTitle}>{hi ? "आप वापस आ गए।" : "You are back."}</h3>
      <p style={s.doneDesc}>{hi ? "आपकी इंद्रियों ने आपको इस पल में लाया।" : "Your senses have returned you to this moment."}</p>
      <button onClick={reset} style={s.resetBtn}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >{hi ? "फिर से करें" : "Begin again"}</button>
    </div>
  );

  return (
    <div style={s.gameCard}>
      <div style={s.progress}>
        {STEPS.map((_, i) => <div key={i} style={s.progBar(i)} />)}
      </div>
      <div style={s.stepHead}>
        <div style={s.stepIcon}>{step.icon}</div>
        <div>
          <p style={s.stepNow}>{hi ? "अभी" : "Right now"}</p>
          <p style={s.stepInstr}>{step.instruction}</p>
        </div>
      </div>
      <div style={s.tapRow}>
        {[...Array(step.count)].map((_, i) => (
          <button key={i} onClick={() => handleTap(i)} style={s.tapBtn(tapped.includes(i))}
            onTouchStart={e => { if (!tapped.includes(i)) e.currentTarget.style.transform = 'scale(0.92)'; }}
            onTouchEnd={e => e.currentTarget.style.transform = tapped.includes(i) ? 'scale(1.1)' : 'scale(1)'}
          >
            {tapped.includes(i) ? "✓" : i + 1}
          </button>
        ))}
      </div>
      <div style={s.bar}><div style={s.barFill} /></div>
      <p style={s.stepNum}>{hi ? `चरण ${stepIdx+1} / ${STEPS.length}` : `Step ${stepIdx+1} of ${STEPS.length}`}</p>
    </div>
  );
}
