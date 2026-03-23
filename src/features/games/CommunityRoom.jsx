import React, { useState, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';
import { useLS } from '../../hooks/useLS';

const EMOTIONS = [
  { id: 'peace',       en: "Peace",       hi: "शांति" },
  { id: 'gratitude',   en: "Gratitude",   hi: "आभार" },
  { id: 'hope',        en: "Hope",        hi: "आशा" },
  { id: 'joy',         en: "Joy",         hi: "खुशी" },
  { id: 'love',        en: "Love",        hi: "प्रेम" },
  { id: 'relief',      en: "Relief",      hi: "सुकून" },
  { id: 'acceptance',  en: "Acceptance",  hi: "स्वीकृति" },
  { id: 'courage',     en: "Courage",     hi: "साहस" },
  { id: 'calm',        en: "Calm",        hi: "शांत" },
  { id: 'curiosity',   en: "Curiosity",   hi: "जिज्ञासा" },
  { id: 'tired',       en: "Tired",       hi: "थका हुआ" },
  { id: 'restless',    en: "Restless",    hi: "बेचैन" },
  { id: 'sadness',     en: "Sadness",     hi: "उदासी" },
  { id: 'lonely',      en: "Lonely",      hi: "अकेला" },
  { id: 'overwhelmed', en: "Overwhelmed", hi: "व्याकुल" },
  { id: 'fear',        en: "Fear",        hi: "डर" },
  { id: 'anger',       en: "Anger",       hi: "क्रोध" },
  { id: 'grief',       en: "Grief",       hi: "शोक" },
  { id: 'numb',        en: "Numb",        hi: "सुन्न" },
  { id: 'lost',        en: "Lost",        hi: "गुमसुम" },
];

export function CommunityRoom({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [selectedId, setSelectedId] = useState(EMOTIONS[0].id);
  const [stars, setStars] = useLS("jsukoon_sky_stars", []);
  const skyRef = useRef(null);

  const bgM = T.bg.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const isDark = bgM
    ? (parseInt(bgM[1], 16) * 0.299 + parseInt(bgM[2], 16) * 0.587 + parseInt(bgM[3], 16) * 0.114) < 128
    : true;

  const s = {
    page: { height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" },
    sky: { flex: 1, position: "relative", cursor: "crosshair", overflow: "hidden" },
    instruction: {
      position: "absolute", top: 20, left: 0, right: 0,
      textAlign: "center", pointerEvents: "none", zIndex: 5,
    },
    instructionText: {
      margin: 0, fontSize: 13, color: T.muted,
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      letterSpacing: 0.5, opacity: 0.8,
    },
    starDot: {
      width: 5, height: 5, borderRadius: "50%",
      backgroundColor: isDark ? "#fff" : T.accent,
      boxShadow: isDark ? "0 0 12px 2px rgba(255,255,255,0.8)" : `0 0 10px 2px ${T.accent}44`,
    },
    starLabel: {
      fontSize: 10, color: isDark ? "rgba(255,255,255,0.7)" : T.text,
      fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap",
    },
    glass: {
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.80)",
      backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)",
      borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
      padding: "20px 24px 40px", display: "flex", flexDirection: "column", gap: 12,
    },
    selectLabel: { fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5 },
    select: {
      width: "100%", padding: "12px 16px", borderRadius: "12px",
      border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)",
      background: isDark ? "rgba(0,0,0,0.2)" : "#fff",
      color: T.text, fontSize: "16px", outline: "none", appearance: "none",
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(T.muted)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px",
    },
  };

  const handleSkyClick = (e) => {
    if (!skyRef.current) return;
    const rect = skyRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const emotionObj = EMOTIONS.find(emp => emp.id === selectedId);
    setStars([...stars, { id: Date.now(), x, y, text: hi ? emotionObj.hi : emotionObj.en }]);
  };

  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div ref={skyRef} onClick={handleSkyClick} style={s.sky}>
        <div style={s.instruction}>
          <p style={s.instructionText}>
            {hi
              ? "नीचे एक भाव चुनें, फिर उसे आकाश में छोड़ने के लिए टैप करें।"
              : "Choose a feeling below, then tap the sky to release it."}
          </p>
        </div>

        {stars.map(star => (
          <div key={star.id} style={{
            position: "absolute", left: `${star.x}%`, top: `${star.y}%`,
            transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4, pointerEvents: "none", animation: "starFade 1.2s ease-out",
          }}>
            <div style={s.starDot} />
            <span style={s.starLabel}>{star.text}</span>
          </div>
        ))}
      </div>

      <div style={s.glass}>
        <label style={s.selectLabel}>{hi ? "वर्तमान भाव चुनें" : "Select Current Feeling"}</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={s.select}>
          {EMOTIONS.map(e => (
            <option key={e.id} value={e.id} style={{ background: isDark ? "#222" : "#fff", color: isDark ? "#fff" : "#000" }}>
              {hi ? e.hi : e.en}
            </option>
          ))}
        </select>
      </div>

      <style>{`
        @keyframes starFade {
          from { opacity: 0; transform: translate(-50%, -20%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
}
