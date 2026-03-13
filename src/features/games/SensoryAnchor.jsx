import React, { useState } from 'react';
import { creditSession } from '../../utils/activity';

export function SensoryAnchor({ T, lang }) {
  const isHindiLang = lang === "Hindi";

  const STEPS = [
    { count:5, sense:isHindiLang?"देखें":"See",   icon:"👁️", instruction:isHindiLang?"5 चीज़ें जो आप देख सकते हैं":"5 things you can see",   color:"#7A9EA8" },
    { count:4, sense:isHindiLang?"सुनें":"Hear",  icon:"👂", instruction:isHindiLang?"4 चीज़ें जो आप सुन सकते हैं":"4 things you can hear",  color:"#8aaa7a" },
    { count:3, sense:isHindiLang?"छुएं":"Touch",  icon:"🤚", instruction:isHindiLang?"3 चीज़ें जो आप छू सकते हैं":"3 things you can touch", color:"#D4A373" },
    { count:2, sense:isHindiLang?"सूंघें":"Smell", icon:"👃", instruction:isHindiLang?"2 चीज़ें जो आप सूंघ सकते हैं":"2 things you can smell",color:"#C88A8E" },
    { count:1, sense:isHindiLang?"चखें":"Taste",  icon:"👅", instruction:isHindiLang?"1 चीज़ जो आप चख सकते हैं":"1 thing you can taste",  color:"#726FBA" },
  ];
  
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [tapped, setTapped] = useState([]);
  const [done, setDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  
  const step = STEPS[stepIdx];
  
  const handleTap=(i)=>{ 
    if(tapped.includes(i))return; 
    if(navigator.vibrate)navigator.vibrate(25); 
    const next=[...tapped,i]; setTapped(next); 
    if(next.length===step.count){ 
      setTimeout(()=>{ 
        if(stepIdx<STEPS.length-1){ 
          setTransitioning(true); 
          setTimeout(()=>{ setStepIdx(s=>s+1); setTapped([]); setTransitioning(false); },500); 
        } else { 
          setDone(true); creditSession(2); 
        } 
      },400); 
    } 
  };
  
  const reset=()=>{ setStepIdx(0); setTapped([]); setDone(false); setTransitioning(false); setStarted(false); };
  
  // Container style for consistent centering across all states
  const containerStyle = {
    background: T.surface,
    border: `1px solid ${T.borderWarm}`,
    borderRadius: 20,
    padding: "24px 20px",
    maxWidth: "400px",      // Ensures it doesn't get too wide on desktop
    margin: "0 auto",        // Centrally aligns the box itself
    textAlign: "center"      // Centrally aligns the text inside
  };

  if(!started && !done) return (
    <div className="fade-in" style={containerStyle}>
      <div style={{ background: `${T.accent}05`, padding: '18px', borderRadius: '20px', border: `1px solid ${T.accent}15`, marginBottom: '24px', textAlign: 'left' }}>
        <h4 style={{ fontSize: 16, color: T.accent, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Cormorant Garamond',serif" }}>
          🎯 {isHindiLang ? "यह कैसे मदद करता है?" : "How this helps?"}
        </h4>
        <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6, margin: "0 0 16px" }}>
          {isHindiLang 
            ? "जब विचार बहुत तेज़ हों, तब यह खेल आपका ध्यान वर्तमान (present) में वापस लाता है।" 
            : "When thoughts race, this game pulls your focus back to the present moment."}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 14, borderTop: `1px solid ${T.accent}15` }}>
          {STEPS.map(s => (
            <div key={s.sense} style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{s.icon}</span> {s.count} {s.sense}
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => setStarted(true)} style={{ width: "100%", background: `${T.accent}22`, border: `1px solid ${T.accent}55`, color: T.accent, padding: "14px", borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        {isHindiLang ? "ग्राउंडिंग शुरू करें" : "Start Grounding"}
      </button>
    </div>
  );

  if(done) return (
    <div className="fade-in" style={containerStyle}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>🌿</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{isHindiLang?"आप वापस आ गए।":"You are back."}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:240, margin:"0 auto 24px" }}>{isHindiLang?"आपकी इंद्रियों ने आपको इस पल में लाया।":"Your senses have returned you to this moment."}</p>
      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99, cursor: 'pointer' }}>{isHindiLang?"फिर से करें":"Begin again"}</button>
    </div>
  );

  return (
    <div style={{ ...containerStyle, opacity:transitioning?0:1, transition:"opacity 0.5s ease" }}>
      <div style={{ display:"flex", gap:6, marginBottom:24 }}>
        {STEPS.map((s,i) => (<div key={i} style={{ flex:1, height:3, borderRadius:99, background:i<stepIdx?s.color:i===stepIdx?`${s.color}55`:T.surfaceAlt, transition:"background 0.4s ease" }} />))}
      </div>
      
      <div style={{ display:"flex", flexDirection: "column", alignItems:"center", gap:8, marginBottom:20 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:`${step.color}18`, border:`1px solid ${step.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{step.icon}</div>
        <div>
          <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", margin:"0 0 2px" }}>{isHindiLang?"अभी":"Right now"}</p>
          <p style={{ fontSize:16, color:T.text, fontWeight:600, margin:0 }}>{step.instruction}</p>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"center", gap:14, margin:"20px 0", flexWrap:"wrap" }}>
        {[...Array(step.count)].map((_,i) => (
          <button key={i} onClick={()=>handleTap(i)} style={{ 
            width:54, height:54, borderRadius:"50%", 
            background:tapped.includes(i)?`${step.color}30`:T.surfaceAlt, 
            border:`2px solid ${tapped.includes(i)?step.color:T.border}`, 
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, 
            transition:"all 0.3s ease", 
            transform:tapped.includes(i)?"scale(1.1)":"scale(1)", 
            boxShadow:tapped.includes(i)?`0 0 16px ${step.color}40`:"none",
            cursor: 'pointer'
          }}>
            {tapped.includes(i)?"✓":i+1}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", height: 4, background: T.surfaceAlt, borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
         <div style={{ height: "100%", width: `${(tapped.length / step.count) * 100}%`, background: step.color, transition: "width 0.3s ease" }} />
      </div>

      <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", opacity:.6 }}>
        {isHindiLang?`चरण ${stepIdx+1} / ${STEPS.length}`:`Step ${stepIdx+1} of ${STEPS.length}`}
      </p>
    </div>
  );
}