import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';
// 🔗 Connecting to our global tools
import { supabase, addCredits } from "../../supabase";

export function Progress({ setTab, goBack, T, lang }) {
  const [stats, setStats] = useState({ total_sessions: 0, total_minutes: 0, current_streak: 0, grace_days: 2, credits: 0 });
  const [weekData, setWeekData] = useState({ Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const hi = lang === "Hindi";
  // Add this inside your Progress function, right above your other useEffects
  useEffect(() => {
    // We only pop the confetti if the user has 10 or more credits!
    if (stats.credits >= 10) {
      fireConfetti();
    }
  }, [stats.credits]); // This tells React: "Only run this when the credit number changes"
  // 💎 REWARD: Give 2 credits for visiting the progress page
  useEffect(() => {
    addCredits(2);
  }, []);

  // 📈 LOAD: Fetch all data from the cloud
  useEffect(() => {
    loadAllProgress();
  }, []);

  const loadAllProgress = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Stats (using maybeSingle to prevent 406 errors)
      let { data: statsData } = await supabase
        .from('progress_user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (statsData) setStats(statsData);

      // 2. Fetch Weekly Activity
      let { data: activityData } = await supabase
        .from('daily_activity')
        .select('activity_date')
        .eq('user_id', user.id)
        .limit(7);

      if (activityData) {
        const newWeekData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        activityData.forEach(act => {
          const dayName = days[new Date(act.activity_date).getDay()];
          newWeekData[dayName] = 1;
        });
        setWeekData(newWeekData);
      }

      // 3. Fetch Journal History from 'journal_entries'
      let { data: histData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (histData) setHistory(histData);

    } catch (e) {
      console.error("Cloud Sync Error:", e);
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

        {/* 📊 The 3-Column Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "15px 5px", textAlign: "center" }}>
            <span style={{ fontSize: 20 }}>🌿</span>
            <h3 style={{ fontSize: 22, color: T.text, margin: "5px 0", fontFamily: "'Cormorant Garamond',serif" }}>{stats.total_sessions}</h3>
            <p style={{ fontSize: 9, color: T.muted, textTransform: "uppercase" }}>{hi ? "सत्र" : "Sessions"}</p>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "15px 5px", textAlign: "center" }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <h3 style={{ fontSize: 22, color: T.text, margin: "5px 0", fontFamily: "'Cormorant Garamond',serif" }}>{stats.current_streak}</h3>
            <p style={{ fontSize: 9, color: T.muted, textTransform: "uppercase" }}>{hi ? "सिलसिला" : "Streak"}</p>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.borderWarm}`, borderRadius: 20, padding: "15px 5px", textAlign: "center" }}>
            <span style={{ fontSize: 20 }}>💎</span>
            <h3 style={{ fontSize: 22, color: T.text, margin: "5px 0", fontFamily: "'Cormorant Garamond',serif" }}>{stats.credits || 0}</h3>
            <p style={{ fontSize: 9, color: T.muted, textTransform: "uppercase" }}>{hi ? "क्रेडिट्स" : "Credits"}</p>
          </div>
        </div>

        <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}30`, borderRadius: 18, padding: "16px", marginBottom: 32, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🪷</span>
          <div>
            <p style={{ fontSize: 14, color: T.text, fontWeight: 500, margin: "0 0 4px" }}>
               {stats.grace_days} {hi ? "ग्रेस दिन बचे हैं" : "Grace Days Left"}
            </p>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{hi ? "आपकी डायरी" : "Your History"}</p>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted, fontStyle: "italic", textAlign: "center" }}>{hi ? "अभी तक कुछ नहीं लिखा गया है।" : "Nothing written yet."}</p>
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