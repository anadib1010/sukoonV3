import React, { useState, useEffect, useRef } from "react";
import { PageNav, SectionLabel, Card } from "../components/shared";
import { ParticleCanvas, SensoryAnchor, BreathPainting, BloomGame } from "../components/games";
import useLS from "../hooks/useLS";

export function Focus({ setTab, goBack, T, lang }) {
  const [activeGame, setActiveGame] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [focusDone, setFocusDone] = useLS("jsukoon_focus_done", {});

  const markComplete = (id) => {
    const today = new Date().toDateString();
    setFocusDone(prev => ({ ...prev, [id]: today }));
    setGameComplete(true);
  };

  const GAMES = [
    {
      id:"anchor",
      label: lang==="Hindi" ? "5-4-3-2-1 वापसी" : "5-4-3-2-1 Return",
      emoji:"👁️",
      featured: true,
      shortDesc: lang==="Hindi" ? "अस्थिर महसूस कर रहे हैं?" : "Feeling unsteady?",
      instruction: lang==="Hindi"
        ? "5 चीज़ें देखें · 4 को छुएं · 3 सुनें · 2 सूंघें · 1 चखें। यह आपको अभी इस पल में वापस लाएगा।"
        : "Name 5 things you can see · 4 you can touch · 3 you hear · 2 you smell · 1 you taste. This brings you back to right now.",
    },
    {
      id:"breath",
      label: lang==="Hindi" ? "सांस लें" : "Breathing",
      emoji:"🌬️",
      shortDesc: lang==="Hindi" ? "मन शांत करना है?" : "Need to calm down?",
      instruction: lang==="Hindi"
        ? "सांस लें और कैनवास पर रंग भरें। सांस छोड़ने के लिए टैप करें। बस इतना ही।"
        : "Breathe in and watch the canvas fill with colour. Tap to breathe out. That is all you need to do.",
    },
    {
      id:"bloom",
      label: lang==="Hindi" ? "फूल खिलाएं" : "Bloom",
      emoji:"🌸",
      shortDesc: lang==="Hindi" ? "धीमे होना है?" : "Need to slow down?",
      instruction: lang==="Hindi"
        ? "धीरे-धीरे टैप करें — एक-एक पंखुड़ी खिलेगी। जल्दबाजी नहीं। छह टैप में पूरा फूल।"
        : "Tap slowly — one petal opens with each touch. No hurry. Six gentle taps to complete the bloom.",
    },
    {
      id:"particles",
      label: lang==="Hindi" ? "ध्यान पैड" : "Focus Pad",
      emoji:"✨",
      shortDesc: lang==="Hindi" ? "मन बिखरा हुआ है?" : "Mind feels scattered?",
      instruction: lang==="Hindi"
        ? "दबाकर रखें — कण आपकी ओर आएंगे। ध्यान केंद्रित करें।"
        : "Press and hold — watch the particles gather toward you. Just focus on that one thing.",
    },
  ];

  const GAME_DESC = {
    anchor:    lang==="Hindi"?"अपनी इंद्रियों के माध्यम से इस पल में वापस आएं।":"Name what you can see · touch · hear · smell · taste.",
    breath:    lang==="Hindi"?"सांस लें — कैनवास भरता है।":"Breathe in to fill the canvas. Tap to breathe out.",
    bloom:     lang==="Hindi"?"धीरे से छुएं। छह बार में पूर्ण।":"Tap slowly — six gentle touches to bloom.",
    particles: lang==="Hindi"?"दबाकर रखें — कणों को अपनी ओर खींचें।":"Press and hold to gather the particles.",
  };

  // ── Game active ──
  if (activeGame) {
    const g = GAMES.find(x => x.id === activeGame);

    // Done screen
    if (gameComplete) {
      const doneMessages = {
        anchor:    { en:"You just brought yourself back to the present moment. That is real.", hi:"आप अभी इस पल में वापस आए। यही सबसे ज़रूरी था।" },
        breath:    { en:"You breathed through it. That is all it ever takes.", hi:"आपने सांस ली। बस यही काफी था।" },
        bloom:     { en:"Six gentle touches. That slowness was the practice.", hi:"छह धीमे स्पर्श। वह धीमापन ही अभ्यास था।" },
        particles: { en:"Focus is a muscle. You just used it.", hi:"ध्यान एक शक्ति है। आपने उसे इस्तेमाल किया।" },
      };
      const msg = doneMessages[activeGame] || { en:"You showed up. That is what matters.", hi:"आप आए। यही मायने रखता है।" };
      const totalDone = Object.keys(focusDone).length;
      return (
        <div className="fade-in" style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px", background:T.bg, textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:20 }}>{g.emoji}</div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:T.text, fontWeight:300, lineHeight:1.4, marginBottom:12 }}>
            {lang==="Hindi"?"हो गया।":"Done."}
          </p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:18, color:T.textSoft, lineHeight:1.7, marginBottom:32, maxWidth:280 }}>
            {lang==="Hindi" ? msg.hi : msg.en}
          </p>
          {totalDone > 1 && (
            <div style={{ background:`${T.accent}10`, border:`1px solid ${T.accent}20`, borderRadius:14, padding:"10px 20px", marginBottom:24 }}>
              <p style={{ fontSize:13, color:T.accent, margin:0 }}>
                {lang==="Hindi" ? `आपने अब तक ${totalDone} अभ्यास किए हैं 🌟` : `${totalDone} practices completed so far 🌟`}
              </p>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:300 }}>
            <button onClick={() => { setGameComplete(false); setActiveGame(null); }}
              style={{ background:`${T.accent}18`, border:`1px solid ${T.accent}40`, borderRadius:16, padding:"14px", color:T.accent, fontSize:14, fontWeight:500 }}>
              {lang==="Hindi"?"अभ्यास पर वापस जाएं →":"Back to practices →"}
            </button>
            <button onClick={() => setTab("home")}
              style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:16, padding:"14px", color:T.muted, fontSize:14 }}>
              🏡 {lang==="Hindi"?"होम":"Home"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <PageNav onBack={() => { setActiveGame(null); setGameComplete(false); }} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
        <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
        <div style={{ padding:"0 18px 0" }}>
          {/* Large clear instruction at top */}
          <div style={{ background:`${T.accent}12`, border:`1px solid ${T.accent}30`, borderRadius:18, padding:"16px 18px", marginBottom:20 }}>
            <p style={{ fontSize:22, margin:"0 0 6px" }}>{g.emoji}</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.text, fontWeight:400, margin:"0 0 10px", lineHeight:1.3 }}>{g.label}</p>
            <p style={{ fontSize:15, color:T.textSoft, lineHeight:1.8, margin:0 }}>{GAME_DESC[activeGame]}</p>
          </div>
          {activeGame==="anchor"    && <SensoryAnchor T={T} lang={lang} />}
          {activeGame==="breath"    && <BreathPainting T={T} lang={lang} />}
          {activeGame==="bloom"     && <BloomGame T={T} lang={lang} />}
          {activeGame==="particles" && (
            <div style={{ position:"relative", height:300, width:"100%", background:T.surface, borderRadius:20, border:`1px solid ${T.borderWarm}`, overflow:"hidden" }}>
              <ParticleCanvas mode="idle" T={T} />
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:10 }}>
                <p style={{ color:T.muted, fontSize:14, letterSpacing:2, textTransform:"uppercase" }}>{lang==="Hindi"?"दबाकर रखें":"Press & Hold"}</p>
              </div>
            </div>
          )}
          {/* Done button */}
          <button onClick={() => markComplete(activeGame)}
            style={{ width:"100%", marginTop:24, background:`${T.accent}15`, border:`1px solid ${T.accent}35`, borderRadius:16, padding:"16px", color:T.accent, fontSize:14, fontWeight:500 }}>
            {lang==="Hindi"?"✓ हो गया — मैंने यह किया":"✓ I'm done — mark complete"}
          </button>
        </div>
        </div>
      </div>
    );
  }

  const featured = GAMES.find(g => g.featured);
  const rest = GAMES.filter(g => !g.featured);

  // ── Game grid ──
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      <div style={{ padding:"20px 18px 0" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, marginBottom:4 }}>
          {lang==="Hindi" ? "ध्यान केंद्र" : "Focus"}
        </h1>
        <p style={{ fontSize:14, color:T.muted, marginBottom:22, lineHeight:1.6 }}>
          {lang==="Hindi" ? "जब मन अस्थिर हो — कोई एक चुनें और बस शुरू करें।" : "When your mind feels unsteady — pick one and just begin."}
        </p>

        {/* ── Featured card — 5-4-3-2-1, large and prominent ── */}
        <button onClick={() => { setGameComplete(false); setActiveGame(featured.id); }} style={{ width:"100%", background:`${T.accent}18`, border:`2px solid ${T.accent}55`, borderRadius:22, padding:"22px 20px", textAlign:"left", marginBottom:14, display:"flex", flexDirection:"column", gap:10, transition:"all 0.2s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:36 }}>{featured.emoji}</span>
            <div>
              <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", margin:"0 0 3px", fontWeight:600 }}>
                {lang==="Hindi" ? "▶ यहाँ से शुरू करें" : "▶ start here"}
              </p>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.text, fontWeight:400, margin:0, lineHeight:1.2 }}>{featured.label}</p>
            </div>
          </div>
          <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.75, margin:0 }}>{featured.instruction}</p>
          <div style={{ alignSelf:"flex-start", background:`${T.accent}25`, border:`1px solid ${T.accent}50`, borderRadius:99, padding:"8px 20px" }}>
            <span style={{ fontSize:13, color:T.accent, fontWeight:500 }}>{lang==="Hindi" ? "खेलें →" : "Begin →"}</span>
          </div>
        </button>

        {/* ── Divider ── */}
        <p style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12, marginTop:8 }}>
          {lang==="Hindi" ? "या कोई और चुनें" : "or choose another"}
        </p>

        {/* ── Rest of games — 2 column, larger cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          {rest.map(g => (
            <button key={g.id} onClick={() => { setGameComplete(false); setActiveGame(g.id); }} style={{ background:T.surface, border:`1px solid ${focusDone[g.id]===new Date().toDateString()?T.accent+"55":T.borderWarm}`, borderRadius:18, padding:"18px 14px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:8, backdropFilter:"blur(8px)", transition:"all 0.2s ease", textAlign:"left", position:"relative" }}>
              {focusDone[g.id]===new Date().toDateString() && <span style={{ position:"absolute", top:10, right:10, fontSize:12, color:T.accent }}>✓</span>}
              <span style={{ fontSize:30 }}>{g.emoji}</span>
              <p style={{ fontSize:15, color:T.accent, fontWeight:600, margin:0, lineHeight:1.3 }}>{g.label}</p>
              <p style={{ fontSize:12, color:T.muted, margin:0, lineHeight:1.55 }}>{g.shortDesc}</p>
            </button>
          ))}
        </div>

        {/* ── ZenBox at bottom, explained ── */}
        <p style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
          {lang==="Hindi" ? "या बस छुएं और महसूस करें" : "or just touch and feel"}
        </p>
        <ZenBox T={T} lang={lang} />
      </div>
      </div>
    </div>
  );
}

// ─── BENCH ───────────────────────────────────────────────────────────

export default Focus;
