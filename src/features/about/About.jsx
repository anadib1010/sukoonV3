import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';

export function About({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ─── STYLES (Every single professional line restored) ───
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

          {/* 1. Header (Updated Branding) */}
          <div style={s.header}>
            <div style={s.headerEmoji}>🌿</div>
            <h1 style={s.appName}>J Sukoon</h1>
            <p style={s.version}>Version 3.1 · Made in India</p>
            <p style={s.tagline}>sukoon — शांति</p>
          </div>

          {/* 2. What This Is */}
          <div style={s.section}>
            <h3 style={s.sectionLabel}>{hi ? "यह क्या है" : "What This Is"}</h3>
            <p style={s.sectionText}>
              {hi
                ? "J Sukoon एक डिजिटल आश्रय है — भारत और दुनिया भर के उन लाखों प्रशंसकों के लिए बनाया गया है जो थक चुके हैं लेकिन रुक नहीं सकते। जो सब कुछ महसूस करते हैं लेकिन कुछ कह नहीं पाते। जिन्हें एक ऐसे शांत कोने की ज़रूरत है जो बदले में कुछ नहीं मांगता।"
                : "J Sukoon is a digital sanctuary — built for the millions of fans across the globe who are exhausted but cannot stop. Who feel everything but can say nothing. Who need a quiet corner that does not demand anything back."}
            </p>
          </div>

          {/* 3. NEW: A Space for Fans (Fandom Sanctuary) */}
          <div style={s.section}>
            <h3 style={s.sectionLabel}>{hi ? "प्रशंसकों के लिए एक कोना" : "A Space for Fans"}</h3>
            <p style={s.sectionText}>
              {hi
                ? "प्रशंसक होना जुनून से भरा होता है, लेकिन यह तनावपूर्ण भी हो सकता है। J Sukoon आपको अपनी पसंदीदा दुनिया (K-Pop, K-Drama) से जुड़े रहने के साथ-साथ मानसिक शांति पाने का मौका देता है। यह सोशल मीडिया के शोर से दूर आपका सुरक्षित स्थान है।"
                : "Being a fan is passionate, but it can be stressful. J Sukoon gives you a place to stay connected to the worlds you love (K-Pop, K-Drama) while finding mental stillness. It is your safe space away from the noise of social media."}
            </p>
          </div>

          {/* 4. What Sukoon Means (Restored from your original) */}
          <div style={s.section}>
            <h3 style={s.sectionLabel}>{hi ? "सुकून का अर्थ" : "What Sukoon Means"}</h3>
            <p style={s.sectionText}>
              {hi
                ? "सुकून — उर्दू, हिंदी, अरबी। इसका अर्थ है शांति। ठहराव। वह सुकून जो भीतर से आता है, किसी उपलब्धि से नहीं। हम यहाँ यही बनाने की कोशिश कर रहे हैं।"
                : "Sukoon — Urdu, Hindi, Arabic. It means peace. Stillness. The kind of comfort that comes from within, not from achievement. That is what we are trying to build here."}
            </p>
          </div>

          {/* 5. Our Philosophy (Bilingual & Precise) */}
          <div style={s.philosophyCard}>
            <h3 style={s.sectionLabel}>{hi ? "हमारा दर्शन" : "Our Philosophy"}</h3>
            <ul style={s.philosophyList}>
              <li style={s.philosophyItem}>🚫 {hi ? "कोई स्ट्रीक्स नहीं — आप मशीन नहीं हैं" : "No streaks — you are not a machine"}</li>
              <li style={s.philosophyItem}>🚫 {hi ? "कोई लक्ष्य नहीं — शांति कोई उपलब्धि नहीं है" : "No goals — peace is not an achievement"}</li>
              <li style={s.philosophyItem}>🚫 {hi ? "कोई दबाव नहीं — बस यहाँ होना ही काफी है" : "No pressure — showing up is enough"}</li>
              <li style={s.philosophyAccent}>✓ {hi ? "सिर्फ सुकून" : "Only Sukoon"}</li>
            </ul>
          </div>

          {/* 6. The Tech & Philosophy (Built by One + Gemini AI) */}
          <div style={s.section}>
            <h3 style={s.sectionLabel}>{hi ? "तकनीक और दर्शन" : "The Tech & Philosophy"}</h3>
            <p style={s.sectionText}>
              {hi
                ? "यह एक 'Built by One' प्रोजेक्ट है, जो एक अकेले डेवलपर की मेहनत और AI की शक्ति का मेल है। Vite + React पर PWA के रूप में निर्मित। Gemini द्वारा संचालित AI रिफ्लेक्शन और राशिफल। Supabase पर सुरक्षित क्लाउड स्टोरेज। Cloudflare Turnstile सुरक्षा। कोई विज्ञापन नहीं।"
                : "This is a 'Built by One' project, blending the heart of a solo developer with the power of AI. Built on Vite + React as a PWA. AI reflections and horoscopes powered by Gemini. Secure cloud storage on Supabase. Protected by Cloudflare Turnstile. No ads."}
            </p>
          </div>

          {/* 7. Footer (Updated Branding) */}
          <div style={s.footer}>
            <p style={s.footerText}>
              {hi ? "उन लोगों के लिए 🌿 के साथ बनाया गया जिन्हें शांति की आवश्यकता है" : "Made with 🌿 for those who need quiet"}
            </p>
            <p style={s.footerCopy}>© 2026 J Sukoon · India</p>
          </div>

        </div>
      </div>
    </div>
  );
}