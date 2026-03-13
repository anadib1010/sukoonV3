import React from 'react';
import { PageNav } from '../../components/SharedUI';

export function About({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("settings"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />
      
      <div className="scroll-area fade-up" style={{ flex: 1, overflowY: "auto", padding: "10px 24px 80px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40, marginTop: 10 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 500, margin: "0 0 4px" }}>
            JSukoon
          </h1>
          <p style={{ fontSize: 12, color: T.textSoft, letterSpacing: 1, marginBottom: 16 }}>
            Version 3.1 · Made in India
          </p>
          <p style={{ fontSize: 18, color: T.accent, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }}>
            sukoon — سکون — शांति
          </p>
        </div>

        {/* What This Is */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            {hi ? "यह क्या है" : "What This Is"}
          </h3>
          <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.8 }}>
            {hi 
              ? "JSukoon एक डिजिटल आश्रय है — भारत में उन लाखों लोगों के लिए बनाया गया है जो थक चुके हैं लेकिन रुक नहीं सकते। जो सब कुछ महसूस करते हैं लेकिन कुछ कह नहीं पाते। जिन्हें एक ऐसे शांत कोने की ज़रूरत है जो बदले में कुछ नहीं मांगता।"
              : "JSukoon is a digital sanctuary — built for the millions in India who are exhausted but cannot stop. Who feel everything but can say nothing. Who need a quiet corner that does not demand anything back."}
          </p>
        </div>

        {/* What Sukoon Means */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            {hi ? "सुकून का अर्थ" : "What Sukoon Means"}
          </h3>
          <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.8 }}>
            {hi
              ? "सुकून — उर्दू, हिंदी, अरबी। इसका अर्थ है शांति। ठहराव। वह सुकून जो भीतर से आता है, किसी उपलब्धि से नहीं। हम यहाँ यही बनाने की कोशिश कर रहे हैं।"
              : "Sukoon — Urdu, Hindi, Arabic. It means peace. Stillness. The kind of comfort that comes from within, not from achievement. That is what we are trying to build here."}
          </p>
        </div>

        {/* Our Philosophy */}
        <div style={{ marginBottom: 32, background: T.surfaceAlt, borderRadius: 20, padding: "24px", border: `1px solid ${T.borderWarm}` }}>
          <h3 style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            {hi ? "हमारा दर्शन" : "Our Philosophy"}
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, color: T.textSoft, lineHeight: 2 }}>
            <li style={{ marginBottom: 8 }}>🚫 {hi ? "कोई स्ट्रीक्स नहीं — आप मशीन नहीं हैं" : "Streaks used to not to track but to encourage you to check your progress."}</li>
            <li style={{ marginBottom: 8 }}>🚫 {hi ? "कोई लक्ष्य नहीं — शांति कोई उपलब्धि नहीं है" : "No goals — peace is not an achievement"}</li>
            <li style={{ marginBottom: 8 }}>🚫 {hi ? "कोई दबाव नहीं — बस यहाँ होना ही काफी है" : "No pressure — showing up is enough"}</li>
            <li style={{ color: T.accent, fontWeight: 600, marginTop: 12, fontSize: 15 }}>✓ {hi ? "सिर्फ सुकून" : "Only Sukoon"}</li>
          </ul>
        </div>

        {/* The Tech */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            {hi ? "तकनीक" : "The Tech"}
          </h3>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.8 }}>
            {hi
              ? "Vite + React पर PWA के रूप में निर्मित। जेमिनी द्वारा संचालित AI रिफ्लेक्शन। सब कुछ आपके डिवाइस पर सुरक्षित। कोई डेटाबेस नहीं, कोई लॉगिन नहीं, कोई विज्ञापन नहीं।"
              : "Built on Vite + React as a PWA. AI reflections powered by Gemini. Everything stored on your device. No database, no login, no ads."}
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", borderTop: `1px solid ${T.borderWarm}`, paddingTop: 32, paddingBottom: 24 }}>
          <p style={{ fontSize: 13, color: T.textSoft, marginBottom: 8 }}>
            {hi ? "उन लोगों के लिए 🌿 के साथ बनाया गया जिन्हें शांति की आवश्यकता है" : "Made with 🌿 for those who need quiet"}
          </p>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: 1 }}>
            © 2026 JSukoon · India
          </p>
        </div>

      </div>
    </div>
  );
}