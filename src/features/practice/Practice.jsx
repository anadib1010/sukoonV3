import React, { useState, useEffect, useRef } from 'react';
import { Orb, Card } from '../../components/SharedUI';
import { creditSession } from '../../utils/activity';
import { MEDITATIONS, BREATHE_PATTERNS } from '../../utils/content';
import { MEDITATION_AUDIO } from '../../utils/constants';
import { MeditationGuide } from '../meditation/MeditationGuide';

export function Practice({ setTab, goBack, T, lang }) {
  const [fromRacing, setFromRacing] = useState(() => {
    const v = typeof sessionStorage !== "undefined" && sessionStorage.getItem("jsukoon_context") === "racing";
    if (v) sessionStorage.removeItem("jsukoon_context");
    return v;
  });

  const [section, setSection] = useState("breathwork");
  const [sel, setSel] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [secs, setSecs] = useState(0);
  const [filter, setFilter] = useState("All");
  const [pat, setPat] = useState(BREATHE_PATTERNS ? BREATHE_PATTERNS[0] : null);
  const [going, setGoing] = useState(false);
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [phaseKey, setPhaseKey] = useState("inhale");
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);

  const timerRef = useRef(null);
  const phaseRef = useRef("inhale");
  const cntRef = useRef(0);
  const tmRef = useRef(null);
  const guideRef = useRef(null);

  const [guideLoaded, setGuideLoaded] = useState(false);
  const [guidePlaying, setGuidePlaying] = useState(false);
  const [guideError, setGuideError] = useState(false);

  const isHindiLang = lang === "Hindi";
  const cats = ["All", "Morning", "Calm", "Relaxation", "Heart", "Sleep", "Urgent"];

  // ─── MEDITATION LOGIC ───
  const start = (m) => { setSel(m); setSecs(m.dur * 60); setRunning(true); setDone(false); };

  useEffect(() => {
    if (!running) return;
    if (secs <= 0) { 
      setRunning(false); 
      setDone(true); 
      creditSession(sel.dur); 
      return; 
    }
    timerRef.current = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [running, secs]);

  useEffect(() => {
    if (isHindiLang || !sel) { setGuideLoaded(true); return; }
    const audio = new Audio(MEDITATION_AUDIO[sel.id]);
    audio.preload = "auto";
    audio.oncanplaythrough = () => setGuideLoaded(true);
    audio.onerror = () => setGuideError(true);
    audio.onended = () => setGuidePlaying(false);
    guideRef.current = audio;
    return () => { if(audio){audio.pause(); audio.src = "";} };
  }, [sel, isHindiLang]);

  const toggleGuide = () => {
    if (isHindiLang) { setGuidePlaying(!guidePlaying); return; }
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

  // ─── BREATHWORK LOGIC ───
  const getPhases = (p) => [
    { key: "inhale", label: isHindiLang ? "सांस लें" : "Inhale", dur: p.inhale },
    { key: "hold1", label: isHindiLang ? "रोकें" : "Hold", dur: p.hold1 },
    { key: "exhale", label: isHindiLang ? "छोड़ें" : "Exhale", dur: p.exhale },
    { key: "hold2", label: isHindiLang ? "रोकें" : "Hold", dur: p.hold2 },
  ].filter(x => x.dur > 0);

  useEffect(() => {
    if (!going || !pat) { 
      window.speechSynthesis?.cancel();
      clearTimeout(tmRef.current); 
      return; 
    }
    const phases = getPhases(pat);
    let pi = phases.findIndex(p => p.key === phaseRef.current);
    if (pi < 0) pi = 0;

    const tick = () => {
      cntRef.current++;
      setCount(cntRef.current);
      if (cntRef.current === 1 && voiceGuide && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(phases[pi].label);
        u.lang = isHindiLang ? "hi-IN" : "en-US";
        u.rate = 0.85;
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
    }
    setGoing(false); setPhaseKey("inhale"); setCount(0); setCycles(0); 
    phaseRef.current = "inhale"; cntRef.current = 0;
    window.speechSynthesis?.cancel();
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const phases = getPhases(pat);
  const curPhase = phases.find(p => p.key === phaseKey) || phases[0];
  const guidance = phaseKey === "inhale" ? (isHindiLang ? "धीरे-धीरे सांस अंदर लें।" : "Inhale slowly.") : phaseKey === "exhale" ? (isHindiLang ? "छोड़ें... तनाव जाने दें।" : "Exhale... let go.") : (isHindiLang ? "यहाँ रुकें।" : "Hold and rest.");

  // ─── EMERGENCY BUTTON COMPONENT ───
  const EmergencyButton = ({ isSmall = false }) => (
    <button 
      onClick={() => {
        if(guideRef.current) guideRef.current.pause();
        window.speechSynthesis?.cancel();
        setTab("focus");
      }} 
      style={{ 
        width: isSmall ? "auto" : "100%", 
        marginTop: isSmall ? 24 : 32, 
        padding: isSmall ? "10px 20px" : "16px", 
        borderRadius: 18, 
        background: `${T.accent}08`, 
        border: `1px dashed ${T.accent}40`, 
        color: T.accent, 
        fontSize: isSmall ? 12 : 13, 
        fontWeight: 500,
        transition: "all 0.2s"
      }}
    >
      {isHindiLang ? "मुझे और सहायता चाहिए (5-4-3-2-1)" : "I Need More (Play 5-4-3-2-1)"}
    </button>
  );

  if (running || done) {
    const totalMedSecs = sel ? sel.dur * 60 : 1;
    const medProg = 1 - (secs / totalMedSecs);

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 24px 100px", textAlign: "center", background: T.bg }}>
        {running ? (
          <div className="fade-up" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: 10, color: T.muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>{isHindiLang ? (sel.catH || sel.cat) : sel.cat}</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: T.text, fontWeight: 400, marginBottom: 8 }}>{isHindiLang ? (sel.titleH || sel.title) : sel.title}</h2>
            
            <MeditationGuide sel={sel} secs={secs} T={T} lang={lang} onSpeak={speakHindi} />
            
            <Orb size={180} col={sel.col} pulse label={fmt(secs)} />
            
            {/* SESSION AUDIO BAR */}
            <div style={{ width: 200, height: 4, background: T.surfaceAlt, borderRadius: 99, margin: "24px 0 12px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${medProg * 100}%`, background: sel.col, transition: "width 1s linear" }} />
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <button onClick={toggleGuide} style={{ background: `${sel.col}15`, border: `1px solid ${sel.col}40`, borderRadius: 99, padding: "8px 20px", color: sel.col, fontSize: 13 }}>
                 {guidePlaying ? "⏸" : "🎙"} {isHindiLang ? "आवाज़" : "Voice"}
               </button>
               <button onClick={() => { setRunning(false); setSel(null); if(guideRef.current) guideRef.current.pause(); }} style={{ background: "transparent", border: `1px solid ${T.muted}35`, color: T.muted, fontSize: 13, padding: "8px 20px", borderRadius: 99 }}>
                  {isHindiLang ? "बंद करें" : "End"}
               </button>
            </div>

            {/* "I Need More" placed right inside the player */}
            <EmergencyButton isSmall={true} />
          </div>
        ) : (
          <div className="fade-up">
            <span style={{ fontSize: 56, marginBottom: 18, display: "block" }}>🌸</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, color: T.accentSoft, fontWeight: 400, marginBottom: 8 }}>{isHindiLang ? "बहुत अच्छा।" : "Beautiful."}</h2>
            <button onClick={() => { setDone(false); setSel(null); }} style={{ background: `${T.accent}20`, border: `1px solid ${T.accent}45`, color: T.accent, padding: "14px 36px", borderRadius: 99 }}>{isHindiLang ? "वापस जाएं" : "Back to library"}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: T.bg }}>
      <div style={{ padding: "52px 18px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={goBack || (() => setTab("home"))} style={{ background: "none", border: "none", color: T.textSoft, fontSize: 14 }}>← {isHindiLang ? "वापस" : "Back"}</button>
          <button onClick={() => setTab("home")} style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}30`, borderRadius: 99, padding: "5px 12px", color: T.accent, fontSize: 12 }}>🏡 {isHindiLang ? "होम" : "Home"}</button>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 400, marginBottom: 16 }}>{isHindiLang ? "अभ्यास" : "Practice"}</h1>
        <div style={{ display: "flex", background: T.surfaceAlt, borderRadius: 16, padding: 4, marginBottom: 20, border: `1px solid ${T.border}` }}>
          {[{ id: "breathwork", label: isHindiLang ? "श्वास" : "Breathwork", icon: "🌬️" }, { id: "sessions", label: isHindiLang ? "सत्र" : "Sessions", icon: "🧘" }].map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, background: section === s.id ? T.surface : "transparent", border: `1px solid ${section === s.id ? T.borderWarm : "transparent"}`, color: section === s.id ? T.accent : T.muted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-area" style={{ flex: 1, overflowY: "auto", padding: "0 18px 100px" }}>
        {section === "sessions" ? (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 8 }}>
              {cats.map(c => (<button key={c} onClick={() => setFilter(c)} style={{ background: filter === c ? `${T.accent}22` : T.surface, border: `1px solid ${filter === c ? T.accent + "55" : T.border}`, color: filter === c ? T.accent : T.textSoft, borderRadius: 99, padding: "6px 14px", fontSize: 13, flexShrink: 0 }}>{c}</button>))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(filter === "All" ? MEDITATIONS : MEDITATIONS.filter(m => m.cat === filter)).map(m => (
                <button key={m.id} onClick={() => start(m)} style={{ background: T.surface, border: `1px solid ${m.col}22`, borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: `${m.col}18`, border: `1px solid ${m.col}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{m.emoji}</div>
                  <div style={{ flex: 1 }}><p style={{ fontWeight: 500, color: T.text, margin: "0 0 3px", fontSize: 14 }}>{isHindiLang ? (m.titleH || m.title) : m.title}</p><span style={{ color: m.col, fontSize: 13 }}>{m.dur} {isHindiLang ? "मिनट" : "min"}</span></div>
                </button>
              ))}
            </div>
            <EmergencyButton />
          </>
        ) : (
          <>
            {fromRacing && <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}28`, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}><p style={{ fontSize: 13, color: T.textSoft }}>🌀 {isHindiLang ? "दौड़ते विचार? Box Breathing सबसे तेज़ है।" : "Racing thoughts? Box Breathing works fastest."}</p></div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {BREATHE_PATTERNS.map(p => (
                <button key={p.name} onClick={() => { setPat(p); stopBreath(); }} style={{ background: pat.name === p.name ? `${T.accent}18` : T.surface, border: `1px solid ${pat.name === p.name ? T.accent + "55" : T.border}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent, opacity: pat.name === p.name ? 1 : 0.3 }} />
                  <div><p style={{ fontWeight: 500, color: T.text, fontSize: 14 }}>{p.name}</p><p style={{ fontSize: 11, color: T.muted }}>{p.desc}</p></div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <Orb size={170} col={T.accent} pulse={going} label={going ? curPhase.label : null} />
              {going && (
                <div style={{ width: 160, textAlign: "center" }}>
                  <div style={{ width: "100%", height: 3, background: T.surfaceAlt, borderRadius: 99, marginBottom: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(count/curPhase.dur)*100}%`, background: T.accent, transition: "width 1s linear" }} />
                  </div>
                  <p style={{ fontSize: 10, color: T.muted }}>{isHindiLang ? `चक्र: ${cycles}` : `Cycle: ${cycles}`}</p>
                </div>
              )}
              <button onClick={() => going ? stopBreath(true) : setGoing(true)} style={{ background: going ? `${T.muted}18` : `${T.accent}22`, border: `1px solid ${going ? T.muted + "35" : T.accent + "55"}`, color: going ? T.muted : T.accent, padding: "15px 40px", borderRadius: 99 }}>{going ? (isHindiLang ? "रोकें" : "Stop") : (isHindiLang ? "शुरू करें" : "Begin")}</button>
              {going && <Card T={T} style={{ textAlign: "center" }}><p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: T.textSoft, fontSize: 17 }}>{guidance}</p></Card>}
              
              {/* Added "I Need More" while breathing is active */}
              {going && <EmergencyButton isSmall={true} />}
            </div>
            <EmergencyButton />
          </>
        )}
      </div>
    </div>
  );
}