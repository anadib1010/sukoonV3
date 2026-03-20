import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';
import { supabase, addCredits, fireGrandConfetti } from "../../supabase";

export function Progress({ setTab, goBack, T, lang }) {
  const [stats, setStats] = useState({ total_sessions: 0, total_minutes: 0, current_streak: 0, grace_days: 2, credits: 0 });
  const [weekData, setWeekData] = useState({ Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const hi = lang === "Hindi";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const milestones = [10, 50, 100, 250, 500];
    if (milestones.includes(stats.credits)) fireGrandConfetti();
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
      // Silent — user sees stale data, not a crash
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
      <div style={s.treeWrapper}>
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

  const statCards = [
    { glyph: "✦", value: stats.total_sessions, label: hi ? "सत्र"       : "Sessions" },
    { glyph: "◈", value: stats.current_streak, label: hi ? "सिलसिला"   : "Streak"   },
    { glyph: "⬡", value: stats.credits || 0,   label: hi ? "क्रेडिट्स" : "Credits"  },
  ];

  // ─── STYLES ───
  const s = {
    page: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      overflow: "hidden",
      position: "relative",
    },

    // Subtle ambient glow at top
    glow: {
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "300px",
      height: "200px",
      background: `radial-gradient(ellipse, ${T.accent}12 0%, transparent 70%)`,
      pointerEvents: "none",
      zIndex: 0,
      transition: "background 0.8s ease",
    },

    scrollArea: {
      flex: 1,
      overflowY: "auto",
      padding: "10px 24px 80px",
      position: "relative",
      zIndex: 1,
    },

    header: {
      textAlign: "center",
      marginBottom: 32,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },

    heading: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 32,
      color: T.text,
      fontWeight: 400,
      margin: "0 0 8px",
    },

    subheading: {
      fontSize: 13,
      color: T.textSoft,
      lineHeight: 1.6,
      maxWidth: 260,
      margin: "0 auto",
    },

    treeWrapper: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 24,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12,
      marginBottom: 24,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
    },

    statCard: {
      background: T.surface,
      border: `1px solid ${T.borderWarm}`,
      borderRadius: 20,
      padding: "18px 10px",
      textAlign: "center",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },

    statGlyph: {
      fontSize: 16,
      color: T.accent,
      marginBottom: 6,
      fontFamily: "'Cormorant Garamond', serif",
    },

    statValue: {
      fontSize: 24,
      color: T.text,
      margin: "0 0 6px",
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 400,
    },

    statLabel: {
      fontSize: 11,
      color: T.muted,
      textTransform: "uppercase",
      letterSpacing: 1,
      margin: 0,
    },

    graceCard: {
      background: `${T.accent}10`,
      border: `1px solid ${T.accent}30`,
      borderRadius: 18,
      padding: "16px 20px",
      marginBottom: 32,
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.6s ease 0.3s",
    },

    graceGlyph: {
      fontSize: 20,
      color: T.accent,
      flexShrink: 0,
      marginTop: 2,
      fontFamily: "'Cormorant Garamond', serif",
    },

    graceTitle: {
      fontSize: 14,
      color: T.text,
      fontWeight: 500,
      margin: "0 0 4px",
    },

    graceSub: {
      fontSize: 12,
      color: T.textSoft,
      margin: 0,
      lineHeight: 1.5,
    },

    historyLabel: {
      fontSize: 11,
      color: T.muted,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 16,
    },

    historyEmpty: {
      fontSize: 13,
      color: T.muted,
      fontStyle: "italic",
      textAlign: "center",
    },

    historyList: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },

    historyCard: {
      background: T.surface,
      border: `1px solid ${T.borderWarm}`,
      borderRadius: 16,
      padding: "16px",
      transition: "transform 0.2s ease",
    },

    historyCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8,
    },

    historyMood: {
      fontSize: 11,
      color: T.accent,
      fontWeight: 500,
    },

    historyDate: {
      fontSize: 11,
      color: T.muted,
    },

    historyText: {
      fontSize: 14,
      color: T.text,
      margin: 0,
      lineHeight: 1.6,
    },
  };

  return (
    <div style={s.page}>
      <div style={s.glow} />

      <PageNav
        onBack={goBack || (() => setTab("home"))}
        onHome={() => setTab("home")}
        backLabel={hi ? "वापस" : "Back"}
        T={T}
        lang={lang}
      />

      <div className="scroll-area" style={s.scrollArea}>

        {/* Header */}
        <div style={s.header}>
          <h1 style={s.heading}>
            {hi ? "आपकी यात्रा" : "Your Journey"}
          </h1>
          <p style={s.subheading}>
            {hi ? "हर छोटे कदम का महत्व है।" : "Every small moment counts."}
          </p>
        </div>

        {/* Growth Tree */}
        {renderTree(stats.total_sessions)}

        {/* Stats Grid */}
        <div style={s.statsGrid}>
          {statCards.map(({ glyph, value, label }) => (
            <div
              key={label}
              style={s.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.15)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={s.statGlyph}>{glyph}</div>
              <h3 style={s.statValue}>{value}</h3>
              <p style={s.statLabel}>{label}</p>
            </div>
          ))}
        </div>

        {/* Grace Days */}
        <div style={s.graceCard}>
          <div style={s.graceGlyph}>✿</div>
          <div>
            <p style={s.graceTitle}>
              {stats.grace_days} {hi ? "ग्रेस दिन बचे हैं" : "Grace Days Left"}
            </p>
            <p style={s.graceSub}>
              {hi
                ? "आपकी streak सुरक्षित है — एक दिन छोड़ने पर भी।"
                : "Your streak is safe even if you miss a day."}
            </p>
          </div>
        </div>

        {/* Journal History */}
        <div>
          <p style={s.historyLabel}>
            {hi ? "आपकी डायरी" : "Your History"}
          </p>
          {loading ? (
            <p style={s.historyEmpty}>
              {hi ? "लोड हो रहा है..." : "Loading..."}
            </p>
          ) : history.length === 0 ? (
            <p style={s.historyEmpty}>
              {hi ? "अभी तक कुछ नहीं लिखा गया है।" : "Nothing written yet."}
            </p>
          ) : (
            <div style={s.historyList}>
              {history.map(item => (
                <div
                  key={item.id}
                  style={s.historyCard}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={s.historyCardHeader}>
                    <span style={s.historyMood}>{item.mood}</span>
                    <span style={s.historyDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={s.historyText}>{item.content || item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
