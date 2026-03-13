import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';
import { useLS } from '../../hooks/useLS';

export function Progress({ setTab, goBack, T, lang }) {
  const [stats] = useLS("jsukoon_stats", { sessions: 0, minutes: 0, streak: 0 });
  const [weekData] = useLS("jsukoon_week", { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 });
  const [history, setHistory] = useState([]);
  const hi = lang === "Hindi";

  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('jsukoon_history') || '[]');
      setHistory(hist);
    } catch(e) {}
  }, []);

  // 1. THE HIDDEN FUTURE: Only calculate days up to today
  const getDaysUpToToday = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const todayIdx = (new Date().getDay() + 6) % 7; // Make Monday 0, Sunday 6
    return days.slice(0, todayIdx + 1);
  };
  const activeDays = getDaysUpToToday();

  // 2. THE SUKOON TREE: Procedurally generated leaves based on total sessions
  const renderTree = (sessionCount) => {
    // Max out at 40 leaves per tree stage to keep it looking nice
    const leafCount = Math.min(sessionCount, 40); 
    const leaves = [];
    
    // Seeded random-ish placement based on index
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * 137.5) * (Math.PI / 180); // Golden ratio spread
      const radius = 10 + (i * 1.5); // Spiral outward
      const x = 100 + Math.cos(angle) * radius;
      const y = 80 + Math.sin(angle) * radius * 0.8; // Flatten slightly
      
      const size = 6 + (i % 4);
      const color = i % 3 === 0 ? T.accent : i % 2 === 0 ? "#7A9EA8" : "#8aaa7a";
      
      leaves.push(
        <circle key={i} cx={x} cy={y} r={size} fill={color} opacity="0.85" />
      );
    }

    return (
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <svg width="200" height="160" viewBox="0 0 200 160">
          {/* Ground */}
          <ellipse cx="100" cy="150" rx="40" ry="6" fill={T.borderWarm} />
          
          {/* Trunk */}
          <path d="M95,150 C95,100 85,80 85,60 C90,70 95,80 98,90 C98,90 102,90 102,90 C105,80 110,70 115,60 C115,80 105,100 105,150 Z" fill="#5c3d1e" opacity="0.9" />
          
          {/* Branches */}
          {leafCount > 5 && <path d="M98,110 Q80,90 60,85" stroke="#5c3d1e" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />}
          {leafCount > 15 && <path d="M102,120 Q120,100 140,95" stroke="#5c3d1e" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />}
          {leafCount > 25 && <path d="M99,85 Q85,60 75,50" stroke="#5c3d1e" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />}
          
          {/* Leaves */}
          {leaves}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("home"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />
      
      <div className="scroll-area fade-up" style={{ flex: 1, overflowY: "auto", padding: "10px 24px 80px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 400, margin: "0 0 8px" }}>
            {hi ? "आपकी यात्रा" : "Your Journey"}
          </h1>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
            {hi ? "हर छोटे कदम का महत्व है। कोई भी दिन खाली नहीं है।" : "Every small moment counts. No effort is ever erased."}
          </p>
        </div>

        {/* The Tree */}
        {renderTree(stats.sessions)}

        {/* 4. CUMULATIVE CARE: Stats grid emphasizing totals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "20px", textAlign: "center" }}>
            <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>🌿</span>
            <h3 style={{ fontSize: 28, color: T.text, margin: "0 0 4px", fontFamily: "'Cormorant Garamond',serif" }}>{stats.sessions}</h3>
            <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>{hi ? "कुल सत्र" : "Total Sessions"}</p>
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "20px", textAlign: "center" }}>
            <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>⏳</span>
            <h3 style={{ fontSize: 28, color: T.text, margin: "0 0 4px", fontFamily: "'Cormorant Garamond',serif" }}>{stats.minutes}</h3>
            <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>{hi ? "कुल मिनट" : "Peaceful Mins"}</p>
          </div>
        </div>

        {/* 2. GRACE DAYS: The Rest Freeze Feature */}
        <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}30`, borderRadius: 18, padding: "16px", marginBottom: 32, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🪷</span>
          <div>
            <p style={{ fontSize: 14, color: T.text, fontWeight: 500, margin: "0 0 4px" }}>
              {hi ? "2 ग्रेस दिन बचे हैं" : "2 Grace Days Remaining"}
            </p>
            <p style={{ fontSize: 12, color: T.textSoft, margin: 0, lineHeight: 1.4 }}>
              {hi ? "आराम करना भी प्रगति है। अगर आप कल चूक जाते हैं, तो आपकी यात्रा टूटेगी नहीं।" : "Rest is progress too. If you need a break tomorrow, your streak will be protected."}
            </p>
          </div>
        </div>

        {/* THE HIDDEN FUTURE: The weekly view */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            {hi ? "इस सप्ताह" : "This Week"}
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            {activeDays.map(day => {
              const count = weekData[day] || 0;
              const isToday = day === activeDays[activeDays.length - 1];
              return (
                <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                  <div style={{ width: "100%", aspectRatio: "1", borderRadius: "50%", background: count > 0 ? T.accent : T.surfaceAlt, border: `1px solid ${count > 0 ? T.accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                    {count > 0 && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 11, color: isToday ? T.text : T.muted, fontWeight: isToday ? 600 : 400 }}>
                    {hi ? {Mon:"सोम",Tue:"मंगल",Wed:"बुध",Thu:"गुरु",Fri:"शुक्र",Sat:"शनि",Sun:"रवि"}[day] : day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* History / Journal Log */}
        <div>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            {hi ? "आपकी डायरी" : "Your History"}
          </p>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted, fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
              {hi ? "अभी तक कुछ नहीं लिखा गया है।" : "Nothing written yet. Your pages are waiting."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(item => (
                <div key={item.id} style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 16, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: T.accent, fontWeight: 500 }}>{item.mood}</span>
                    <span style={{ fontSize: 11, color: T.muted }}>
                      {new Date(item.date).toLocaleDateString(hi ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: T.text, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}