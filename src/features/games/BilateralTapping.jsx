import React, { useState, useRef } from 'react';
import { creditSession } from '../../utils/activity';

export function BilateralTapping({ T, lang }) {
  const [active, setActive] = useState(null);
  const [count, setCount] = useState(0);
  const [lastSide, setLastSide] = useState(null);
  const [sets, setSets] = useState(0);
  const [done, setDone] = useState(false);
  const [going, setGoing] = useState(false);
  const audioCtxRef = useRef(null);
  const isHindi = lang === "Hindi";
  const TARGET_SETS = 6, TAPS_PER_SET = 8;

  const playTone = (side) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      osc.connect(gain); gain.connect(panner); panner.connect(ctx.destination);
      osc.frequency.value = side === "left" ? 220 : 280;
      panner.pan.value = side === "left" ? -.8 : .8;
      gain.gain.setValueAtTime(.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .3);
    } catch { }
  };

  const handleTap = (side) => {
    if (!going || side === lastSide) return;
    if (navigator.vibrate) navigator.vibrate(side === "left" ? [30] : [20]);
    setActive(side); setTimeout(() => setActive(null), 200);
    playTone(side); setLastSide(side);
    const nc = count + 1; setCount(nc);
    if (nc % TAPS_PER_SET === 0) {
      const ns = sets + 1; setSets(ns);
      if (ns >= TARGET_SETS) { setTimeout(() => { setDone(true); setGoing(false); creditSession(3); }, 600); }
    }
  };

  const reset = () => { setActive(null); setCount(0); setLastSide(null); setSets(0); setDone(false); setGoing(false); };

  // Shared container style
  const containerStyle = {
    background: T.surface,
    border: `1px solid ${T.borderWarm}`,
    borderRadius: 20,
    padding: "24px 20px",
    maxWidth: "450px",
    margin: "0 auto",
    textAlign: "center"
  };

  if (done) return (
    <div className="fade-in" style={containerStyle}>
      <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>🧠</span>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: T.accentSoft, fontWeight: 400, marginBottom: 8 }}>
        {isHindi ? "संतुलन मिला।" : "Balance found."}
      </h3>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 24 }}>
        {isHindi ? "दोनों तरफ का स्पर्श मन को शांत करता है। आप अभी अधिक स्थिर हैं।" : "Alternating touch helps the body settle. You are more at ease now than when you began."}
      </p>
      <button onClick={reset} style={{ background: `${T.accent}20`, border: `1px solid ${T.accent}40`, color: T.accent, fontSize: 13, padding: "10px 28px", borderRadius: 99 }}>
        {isHindi ? "फिर से करें" : "Begin again"}
      </button>
    </div>
  );

  return (
    <div style={containerStyle} className="fade-in">
      {/* Description / Instruction Box */}
      {!going && (
        <div style={{ background: `${T.accent}08`, padding: '16px', borderRadius: '16px', marginBottom: '20px', textAlign: 'left', border: `1px solid ${T.accent}15` }}>
          <h4 style={{ fontSize: 14, color: T.accent, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            🧠 {isHindi ? "यह क्या है?" : "What is this?"}
          </h4>
          <p style={{ fontSize: 12, color: T.textSoft, margin: 0, lineHeight: 1.5 }}>
            {isHindi 
              ? "यह तकनीक आपके मस्तिष्क के दोनों हिस्सों को जोड़ती है। हेडफ़ोन का उपयोग करें और बारी-बारी से बाएं और दाएं टैप करें।" 
              : "This technique engages both sides of your brain. Use headphones and follow the rhythm by tapping left and right alternately."}
          </p>
        </div>
      )}

      <div style={{ width: "100%", height: 3, background: T.surfaceAlt, borderRadius: 99, marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${(sets / TARGET_SETS) * 100}%`, background: T.accent, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>

      <p style={{ fontSize: 13, color: T.muted, textAlign: "center", marginBottom: 6, lineHeight: 1.6 }}>
        {!going ? (isHindi ? "तैयार होने पर शुरू करें" : "Tap Begin when you are ready") : lastSide === null ? (isHindi ? "किसी भी तरफ से शुरू करें" : "Start on either side") : lastSide === "left" ? (isHindi ? "अब दाईं तरफ →" : "Now right →") : (isHindi ? "← अब बाईं तरफ" : "← Now left")}
      </p>

      <p style={{ fontSize: 10, color: T.muted, textAlign: "center", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20, opacity: .5 }}>
        {isHindi ? `${sets} / ${TARGET_SETS} सेट` : `${sets} of ${TARGET_SETS} sets`}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {["left", "right"].map(side => (
          <button 
            key={side} 
            onPointerDown={() => handleTap(side)} 
            style={{ 
              flex: 1, height: 130, borderRadius: 20, 
              background: active === side ? `${T.accent}30` : T.surfaceAlt, 
              border: `2px solid ${active === side ? T.accent : T.border}`, 
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, 
              transition: "all 0.15s ease", 
              transform: active === side ? "scale(0.97)" : "scale(1)", 
              boxShadow: active === side ? `0 0 24px ${T.accent}35` : "none" 
            }}
          >
            <span style={{ fontSize: 28 }}>{side === "left" ? "👈" : "👉"}</span>
            <span style={{ fontSize: 11, color: T.muted, letterSpacing: 1, textTransform: "uppercase" }}>
              {side === "left" ? (isHindi ? "बाएं" : "Left") : (isHindi ? "दाएं" : "Right")}
            </span>
          </button>
        ))}
      </div>

      <button onClick={() => going ? reset() : setGoing(true)} style={{ width: "100%", background: going ? `${T.muted}18` : `${T.accent}22`, border: `1px solid ${going ? T.muted + "35" : T.accent + "55"}`, color: going ? T.muted : T.accent, fontSize: 14, fontWeight: 500, padding: "13px", borderRadius: 14 }}>
        {going ? (isHindi ? "रोकें" : "Stop") : (isHindi ? "शुरू करें" : "Begin")}
      </button>
    </div>
  );
}