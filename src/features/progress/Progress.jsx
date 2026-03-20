import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';
import { supabase, addCredits, fireGrandConfetti } from "../../supabase";

export function Progress({ setTab, goBack, T, lang }) {
  const [stats, setStats] = useState({ total_sessions: 0, total_minutes: 0, current_streak: 0, grace_days: 2, credits: 0 });
  const [weekData, setWeekData] = useState({ Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const hi = lang === "Hindi";

  // Milestone confetti — fireGrandConfetti now correctly imported from supabase.js
  useEffect(() => {
    const milestones = [10, 50, 100, 250, 500];
    if (milestones.includes(stats.credits)) {
      fireGrandConfetti();
    }
  }, [stats.credits]);

  useEffect(() => { addCredits(2); }, []);

  useEffect(() => { loadAllProgress(); }, []);

  const loadAllProgress = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: statsData } = await supabase
        .from('progress_user_stats').select('*')
        .eq('user_id', user.id).maybeSingle();
      if (statsData) setStats(statsData);

      let { data: activityData } = await supabase
        .from('daily_activity').select('activity_date')
        .eq('user_id', user.id).limit(7);
      if (activityData) {
        const newWeekData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        activityData.forEach(act => {
          newWeekData[days[new Date(act.activity_date).getDay()]] = 1;
        });
        setWeekData(newWeekData);
      }

      let { data: histData } = await supabase
        .from('journal_entries').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (histData) setHistory(histData);

    } catch (e) {
      // Cloud sync failure handled silently — user sees stale data, not a crash
    } finally {
      setLoading(false);
    }
  };

  const renderTree = (sessionCount) => {
    const leafCount = Math.min(sessionCount, 40);
    const leaves = [];
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * 137.5) * (Math.PI / 180);
      const radius = 10 + (i * 1.5);
      const x = 100 + Math.cos(angle) * radius;
      const y = 80 + Math.sin(angle) * radius * 0.8;
      const size = 6 + (i % 4);
      const color = i % 3 === 0 ? T.accent : i % 2 === 0 ? "#7A9EA8" : "#8aaa7a";
      leaves.push(<circle key={i} cx={x} cy={y} r={size} fill={color} opacity="0.85" />);
    }
    return (
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <svg width="200" height="160" viewBox="0 0 200 160">
          <ellipse cx="100" cy="150" rx="40" ry="6" fill={T.borderWarm} />
          <path d="M95,150 C95,100 85,80 85,60 C90,70 95,80 98,90 C98,90 102,90 102,90 C105,80 110,70 115,60 C115,80 105,100 105,150 Z" fill="#5c3d1e" opacity="0.9" />
          {leafCount > 5 && <path d="M98,110 Q80,90 60,85" stroke="#5c3d1e" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />}
          {leafCount > 15 && <path d="M102,120 Q120,100 140,95" stroke="#5c3d1e" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />}
          {leafCount > 25 && <path d="M99,85 Q85,60 75,50" stroke="#5c3d1e" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />}
          {leaves}
        </svg>
      </div>
    );
  };

  // Unicode glyphs replace emojis — calmer, more refined
  const statCards = [
    { glyph: "✦", value: stats.total_sessions,  label: hi ? "सत्र"       : "Sessions" },
    { glyph: "◈", value: stats.current_streak,  label: hi ? "सिलसिला"   : "Streak"   },
    { glyph: "⬡", value: stats.credits || 0,    label: hi ? "क्रेडिट्स" : "Credits"  },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("home"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div className="scroll-area fade-up" style={{ flex: 1, overflowY: "auto", padding: "10px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 400, margin: "0 0 8px" }}>
            {hi ? "आपकी यात्रा" : "Your Journey"}
          </h1>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
            {hi ? "हर छोटे कदम का महत्व है।" : "Every small moment counts."}
          </p>
        </div>

        {renderTree(stats.total_sessions)}

        {/* Stats Grid — improved padding and legible label sizes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {statCards.map(({ glyph, value, label }) => (
            <div key={label} style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "18px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 16, color: T.accent, marginBottom: 6, fontFamily: "'Cormorant Garamond',serif" }}>{glyph}</div>
              <h3 style={{ fontSize: 24, color: T.text, margin: "0 0 6px", fontFamily: "'Cormorant Garamond',serif", fontWeight: 400 }}>{value}</h3>
              {/* fontSize 11 minimum — was 9, below WCAG floor */}
              <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Grace Days — with explanatory copy so users aren't anxious */}
        <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}30`, borderRadius: 18, padding: "16px 20px", marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ fontSize: 20, color: T.accent, flexShrink: 0, marginTop: 2, fontFamily: "'Cormorant Garamond',serif" }}>✿</div>
          <div>
            <p style={{ fontSize: 14, color: T.text, fontWeight: 500, margin: "0 0 4px" }}>
              {stats.grace_days} {hi ? "ग्रेस दिन बचे हैं" : "Grace Days Left"}
            </p>
            <p style={{ fontSize: 12, color: T.textSoft, margin: 0, lineHeight: 1.5 }}>
              {hi
                ? "आपकी streak सुरक्षित है — एक दिन छोड़ने पर भी।"
                : "Your streak is safe even if you miss a day."}
            </p>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            {hi ? "आपकी डायरी" : "Your History"}
          </p>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted, fontStyle: "italic", textAlign: "center" }}>
              {hi ? "अभी तक कुछ नहीं लिखा गया है।" : "Nothing written yet."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(item => (
                <div key={item.id} style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 16, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: T.accent, fontWeight: 500 }}>{item.mood}</span>
                    <span style={{ fontSize: 11, color: T.muted }}>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 14, color: T.text, margin: 0 }}>{item.content || item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
