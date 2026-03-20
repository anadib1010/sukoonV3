import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';

export function About({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ─── STYLES ───
  const s = {
    page: { height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" },

    scrollArea: { flex: 1, overflowY: "auto", padding: "10px 24px 80px" },

    content: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },

    header: { textAlign: "center", marginBottom: 40, marginTop: 10 },
    headerEmoji: { fontSize: 40, marginBottom: 12 },

    appName: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 32, color: T.text,
      fontWeight: 500, margin: "0 0 4px",
    },

    version: { fontSize: 12, color: T.textSoft, letterSpacing: 1, marginBottom: 16 },

    tagline: {
      fontSize: 18, color: T.accent,
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
    },

    section: { marginBottom: 32 },

    sectionLabel: {
      fontSize: 11, color: T.muted,
      letterSpacing: 2, textTransform: "uppercase",
      marginBottom: 12,
    },

    sectionText: { fontSize: 14, color: T.textSoft, lineHeight: 1.8, margin: 0 },

    philosophyCard: {
      marginBottom: 32,
      background: T.surfaceAlt,
      borderRadius: 20,
      padding: 24,
      border: `1px solid ${T.borderWarm}`,
    },

    philosophyList: {
      listStyle: "none", padding: 0, margin: 0,
      fontSize: 14, color: T.textSoft, lineHeight: 2,
    },

    philosophyItem: { marginBottom: 8 },

    philosophyAccent: {
      color: T.accent, fontWeight: 600,
      marginTop: 12, fontSize: 15,
    },

    footer: {
      textAlign: "center",
      borderTop: `1px solid ${T.borderWarm}`,
      paddingTop: 32, paddingBottom: 24,
    },

    footerText: { fontSize: 13, color: T.textSoft, marginBottom: 8 },

    footerCopy: { fontSize: 11, color: T.muted, letterSpacing: 1 },
  };

  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("settings"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div className="scroll-area fade-up" style={s.scrollArea}>
        <div style={s.content}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerEmoji}>🌿</div>
            <h1 style={s.appName}>JSukoon</h1>
            <p style={s.version}>Version 3.1 · Made in India</p>
            <p style={s.tagline}>Sukoon — शांति</p>
          </div>

          {/* What This Is */}
          <div style={s.section}>
            <h3 style={s.sectionLabel}>{hi ? "यह क्या है" : "What This Is"}</h3>
            <p style={s.sectionText}>
              {hi
                ? "JSukoon एक डिजिटल आश्रय है — भारत में उन लाखों लोगों के लिए बनाया गया है जो थक चुके हैं लेकिन रुक नहीं सकते। जो सब कुछ महसूस करते हैं लेकिन कुछ कह नहीं पाते। जिन्हें एक ऐसे शांत कोने की ज़रूरत है जो बदले में कुछ नहीं मांगता।"
                : "JSukoon is a digital sanctuary — built for the millions in India who are exhausted but cannot stop. Who feel everything but can say nothing. Who need a quiet corner that does not demand anything back."}
            </p>
          </div>

          {/* What Sukoon Means */}
          <div style={s.section}>
            <h3 style={s.sectionLabel}>{hi ? "सुकून का अर्थ" : "What Sukoon Means"}</h3>
            <p style={s.sectionText}>
              {hi
                ? "सुकून — उर्दू, हिंदी, अरबी। इसका अर्थ है शांति। ठहराव। वह सुकून जो भीतर से आता है, किसी उपलब्धि से नहीं। हम यहाँ यही बनाने की कोशिश कर रहे हैं।"
                : "Sukoon — Urdu, Hindi, Arabic. It means peace. Stillness. The kind of comfort that comes from within, not from achievement. That is what we are trying to build here."}
            </p>
          </div>

          {/* Our Philosophy */}
          <div style={s.philosophyCard}>
            <h3 style={s.sectionLabel}>{hi ? "हमारा दर्शन" : "Our Philosophy"}</h3>
            <ul style={s.philosophyList}>
              <li style={s.philosophyItem}>🚫 {hi ? "कोई स्ट्रीक्स नहीं — आप मशीन नहीं हैं" : "Streaks used not to track but to encourage you to check your progress."}</li>
              <li style={s.philosophyItem}>🚫 {hi ? "कोई लक्ष्य नहीं — शांति कोई उपलब्धि नहीं है" : "No goals — peace is not an achievement"}</li>
              <li style={s.philosophyItem}>🚫 {hi ? "कोई दबाव नहीं — बस यहाँ होना ही काफी है" : "No pressure — showing up is enough"}</li>
              <li style={s.philosophyAccent}>✓ {hi ? "सिर्फ सुकून" : "Only Sukoon"}</li>
            </ul>
          </div>

          {/* The Tech */}
          <div style={s.section}>
            <h3 style={s.sectionLabel}>{hi ? "तकनीक" : "The Tech"}</h3>
            <p style={s.sectionText}>
              {hi
                ? "Vite + React पर PWA के रूप में निर्मित। जेमिनी द्वारा संचालित AI रिफ्लेक्शन। Supabase क्लाउड सुरक्षित। कोई विज्ञापन नहीं।"
                : "Built on Vite + React as a PWA. AI reflections powered by Gemini. Secured by Supabase. No ads."}
            </p>
          </div>

          {/* Footer */}
          <div style={s.footer}>
            <p style={s.footerText}>
              {hi ? "उन लोगों के लिए 🌿 के साथ बनाया गया जिन्हें शांति की आवश्यकता है" : "Made with 🌿 for those who need quiet"}
            </p>
            <p style={s.footerCopy}>© 2026 JSukoon · India</p>
          </div>

        </div>
      </div>
    </div>
  );
}
