// ─── ONBOARDING ──────────────────────────────────────────────────────
import React, { useState } from 'react';
export function Onboarding({ onComplete, setThemeKey, setLang, T }) {
  const [screen, setScreen] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [mood, setMood] = useState(null);
  const [lang, setLocalLang] = useState(null); // chosen on screen 0

  const chooseLang = (l) => {
    setLocalLang(l);
    setLang(l);
    setLeaving(true);
    setTimeout(() => { setScreen(1); setLeaving(false); }, 400);
  };

  const hi = lang === "Hindi";

  const SCREENS = [
    { langPick: true },
    { line1: hi?"स्वागत है।":"Welcome.", line2: hi?"JSukoon एक शांति का स्थान है — जब मन भारी हो, जब विचार दौड़ रहे हों, या जब बस एक पल की शांति चाहिए।":"JSukoon is a space for your mind — when thoughts race, when you feel heavy, or when you simply need one quiet moment.", sub:null, button: hi?"आगे":"Continue", legal:true },
    { features: true },
    { line1: hi?"न streak। न लक्ष्य।":"No goals.", line2: hi?"यहाँ कोई दबाव नहीं है। आप जब चाहें आएं, जितना चाहें रुकें।":"No pressure here. Come when you need to. Stay as long as you like.", sub: hi?"यह जगह हमेशा आपके लिए है।":"This space is always here for you.", button: hi?"आगे":"Continue" },
    { line1: hi?"आज आप कैसे आए हैं?":"How are you arriving today?", line2:null, sub:null, button:null, mood:true },
    { line1: hi?"एक धीमी सांस लें।":"Take one slow breath.", line2: hi?"नाक से धीरे सांस लें — रोकें — और धीरे छोड़ें।":"Breathe in slowly through your nose — hold — and breathe out.", sub: hi?"जब तैयार हों, शुरू करें।":"When you are ready, begin.", button: hi?"JSukoon में प्रवेश करें":"Enter JSukoon", breathe:true },
  ];

  const ONBOARD_MOODS = [
    { emoji:"😔", label: hi?"भारी":"Heavy",      theme:"Maroon" },
    { emoji:"😐", label: hi?"अस्थिर":"Unsettled", theme:"TwilightBlue" },
    { emoji:"🙂", label: hi?"ठीक":"Okay",         theme:"SageSanctuary" },
    { emoji:"😊", label: hi?"गर्म":"Warm",         theme:"PinkChampagne" },
  ];

  const advance = (next) => {
    setLeaving(true);
    setTimeout(() => { setScreen(next); setLeaving(false); }, 400);
  };

  const handleMood = (m) => {
    setMood(m); setThemeKey(m.theme);
    setTimeout(() => advance(screen+1), 600);
  };

  const handleComplete = () => {
    setLeaving(true);
    setTimeout(() => { document.body.style.background="#050505"; onComplete(); }, 500);
  };

  const s = SCREENS[screen];
  const totalDots = SCREENS.length - 1; // exclude lang screen from dots

  return (
    <div style={{ position:"fixed", inset:0, zIndex:99998, background:"#050505",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"0 36px", opacity:leaving?0:1, transition:"opacity 0.5s ease" }}>

      {[...Array(8)].map((_,i) => (
        <div key={i} style={{ position:"absolute", top:`${8+i*11}%`, left:`${5+i*12}%`,
          width:i%3===0?2:1, height:i%3===0?2:1, borderRadius:"50%", background:"#ffffff",
          animation:`twinkle ${3+i*.7}s infinite alternate ease-in-out`,
          animationDelay:`${i*.3}s`, opacity:0.3, pointerEvents:"none" }} />
      ))}

      {screen > 0 && (
        <div style={{ position:"absolute", top:56, display:"flex", gap:8 }}>
          {Array.from({length:totalDots}).map((_,i) => (
            <div key={i} style={{ width:i===(screen-1)?20:6, height:6, borderRadius:99,
              background:i<screen?"#ffffff55":"#ffffff15", transition:"all 0.4s ease" }} />
          ))}
        </div>
      )}

      {/* ── SCREEN 0: Language picker ── */}
      {s.langPick && (
        <div style={{ width:"100%", maxWidth:320, textAlign:"center" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:4, textTransform:"uppercase", marginBottom:32 }}>JSukoon</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:"#e8e8e8", lineHeight:1.4, marginBottom:10, letterSpacing:.5 }}>
            Choose your language
          </h1>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:"rgba(255,255,255,0.5)", lineHeight:1.4, marginBottom:48 }}>
            अपनी भाषा चुनें
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <button onClick={() => chooseLang("English")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:18, padding:"20px 24px", color:"#e8e8e8", fontSize:18, fontFamily:"'Cormorant Garamond',serif", letterSpacing:2, transition:"all 0.3s ease" }}>
              English
            </button>
            <button onClick={() => chooseLang("Hindi")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:18, padding:"20px 24px", color:"#e8e8e8", fontSize:18, fontFamily:"'Cormorant Garamond',serif", letterSpacing:2, transition:"all 0.3s ease" }}>
              हिंदी
            </button>
          </div>
        </div>
      )}

      {/* ── FEATURES SCREEN ── */}
      {s.features && (
        <div style={{ width:"100%", maxWidth:360, padding:"0 8px" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:4, textTransform:"uppercase", textAlign:"center", marginBottom:16 }}>
            {hi?"यहाँ क्या है":"What's inside"}
          </p>
          {[
            { emoji:"🌀", title: hi?"दौड़ते विचार":"Racing Thoughts",    desc: hi?"श्वास और ग्राउंडिंग अभ्यास — मन को अभी शांत करने के लिए।":"Breathing and grounding tools — to calm your mind right now." },
            { emoji:"🧘", title: hi?"ध्यान":"Meditation",                 desc: hi?"12 गाइडेड सत्र — नींद, सुबह, करुणा, और अधिक के लिए।":"12 guided sessions — for sleep, mornings, compassion, and more." },
            { emoji:"📖", title: hi?"जर्नल":"Journal",                    desc: hi?"लिखें, बोलें, जलाएं। AI आपके विचारों पर शांत प्रतिबिंब देगा।":"Write, speak, burn. AI offers a calm reflection on what you share." },
            { emoji:"🌿", title: hi?"अभयारण्य":"Sanctuary",               desc: hi?"एक शांत कोना — परिवेश ध्वनि, उद्धरण, और बस बैठने की जगह।":"A quiet corner — ambient sound, quotes, and a place to just sit." },
          ].map((f,i) => (
            <div key={i} style={{ display:"flex", gap:14, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize:28, flexShrink:0, lineHeight:"1.5" }}>{f.emoji}</span>
              <div>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"rgba(255,255,255,0.85)", margin:"0 0 3px", fontWeight:400 }}>{f.title}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.6, margin:0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
          <button onClick={() => advance(screen+1)} style={{ width:"100%", marginTop:24, background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:99, padding:"14px 48px", color:"#e8e8e8", fontSize:14, fontFamily:"'DM Sans',sans-serif", letterSpacing:2, textTransform:"uppercase", transition:"all 0.3s ease" }}>
            {hi?"आगे":"Continue"}
          </button>
          <button onClick={handleComplete} style={{ marginTop:14, background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:12, letterSpacing:2, cursor:"pointer", width:"100%", padding:"6px 0" }}>
            {hi?"छोड़ें":"skip"}
          </button>
        </div>
      )}

      {/* ── SCREENS 1–5: Main onboarding ── */}
      {!s.langPick && !s.features && (
        <div style={{ width:"100%", maxWidth:340, textAlign:"center" }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:s.line1&&s.line1.length>20?28:36, fontWeight:300, color:"#e8e8e8", lineHeight:1.3, marginBottom:s.line2?20:32, letterSpacing:.5 }}>
            {s.line1}
          </h1>
          {s.line2 && <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:20, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:32 }}>{s.line2}</p>}
          {s.sub   && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.45)", letterSpacing:2, textTransform:"uppercase", marginBottom:48, lineHeight:1.8 }}>{s.sub}</p>}

          {s.mood && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:32 }}>
              {ONBOARD_MOODS.map(m => (
                <button key={m.label} onClick={() => handleMood(m)} style={{ background:mood?.label===m.label?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${mood?.label===m.label?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:16, padding:"14px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all 0.3s ease" }}>
                  <span style={{ fontSize:28 }}>{m.emoji}</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", letterSpacing:1 }}>{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {s.breathe && (
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
              <div style={{ width:90, height:90, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", background:"radial-gradient(circle, rgba(255,255,255,0.06), transparent)", animation:"orbFloat 5s ease-in-out infinite" }} />
            </div>
          )}

          {s.button && (
            <button onClick={() => screen===SCREENS.length-1 ? handleComplete() : advance(screen+1)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:99, padding:"14px 48px", color:"#e8e8e8", fontSize:14, fontFamily:"'DM Sans',sans-serif", letterSpacing:2, textTransform:"uppercase", transition:"all 0.3s ease" }}>
              {s.button}
            </button>
          )}
        </div>
      )}

      {!s.langPick && !s.features && s.legal && (
        <p style={{ position:"absolute", bottom:40, fontSize:12, color:"rgba(255,255,255,0.35)", textAlign:"center", lineHeight:1.7, padding:"0 24px", maxWidth:340 }}>
          {hi
            ?"यह ऐप चिकित्सा, मनोवैज्ञानिक या धार्मिक सलाह नहीं देता। उपयोग स्वैच्छिक है।"
            :"This application does not provide medical, psychological, therapeutic, or religious advice. Use is voluntary."}
        </p>
      )}

      {!s.langPick && !s.features && screen < SCREENS.length-1 && (
        <button onClick={handleComplete} style={{ position:"absolute", bottom:40, background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, letterSpacing:2, cursor:"pointer", padding:"10px 20px" }}>
          {hi?"छोड़ें":"skip"}
        </button>
      )}
    </div>
  );
}