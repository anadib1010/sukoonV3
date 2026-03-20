import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';

export function Crisis({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const HELPLINES = [
    { name: hi ? "किरण (मानसिक स्वास्थ्य)"       : "KIRAN (Mental Health)",      desc: hi ? "24/7 सरकारी हेल्पलाइन" : "24/7 Govt. Helpline",       number: "18005990019" },
    { name: hi ? "आसरा (संकट सहायता)"             : "AASRA (Crisis Support)",     desc: hi ? "पेशेवर परामर्श"         : "Professional Counseling",  number: "9820466726"  },
    { name: hi ? "वंद्रेवाला फाउंडेशन"            : "Vandrevala Foundation",      desc: hi ? "भावनात्मक समर्थन"        : "Emotional Support",         number: "9999666555"  },
    { name: hi ? "आपातकालीन (पुलिस/एम्बुलेंस)"   : "Emergency (Police/Medical)", desc: hi ? "राष्ट्रीय आपातकाल"      : "National Emergency",        number: "112"         },
  ];

  const STEPS = [
    { emoji: "👀", n: "5", en: "things you can see",    hi: "चीजें जो आप देख सकते हैं"       },
    { emoji: "🖐️", n: "4", en: "things you can touch",  hi: "चीजें जिन्हें आप छू सकते हैं"   },
    { emoji: "👂", n: "3", en: "things you can hear",   hi: "चीजें जो आप सुन सकते हैं"       },
    { emoji: "👃", n: "2", en: "things you can smell",  hi: "चीजें जिन्हें आप सूंघ सकते हैं" },
    { emoji: "👅", n: "1", en: "thing you can taste",   hi: "चीज जिसका आप स्वाद ले सकते हैं" },
  ];

  const red     = "#e06666";
  const redBg   = "rgba(224,102,102,0.08)";
  const redBord = "rgba(224,102,102,0.2)";
  const redSoft = "rgba(224,102,102,0.15)";

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

    iconCircle: {
      width: 64, height: 64,
      borderRadius: "50%",
      background: redSoft,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 16px",
      fontSize: 28,
    },

    heading: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 32, color: T.text,
      fontWeight: 500, marginBottom: 8,
    },

    headerText: {
      fontSize: 13, color: T.textSoft,
      lineHeight: 1.6, maxWidth: 300,
      margin: "0 auto",
    },

    sectionLabel: {
      fontSize: 11, color: T.muted,
      letterSpacing: 2, textTransform: "uppercase",
      marginBottom: 16,
    },

    helplineList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 },

    helplineCard: {
      display: "flex", alignItems: "center",
      background: redBg,
      border: `1px solid ${redBord}`,
      borderRadius: 16, padding: "16px 20px",
      textDecoration: "none",
      transition: "background 0.2s",
    },

    helplineInfo: { flex: 1 },

    helplineName: { margin: "0 0 4px", fontSize: 16, color: red, fontWeight: 600 },

    helplineDesc: { margin: 0, fontSize: 12, color: T.textSoft },

    helplineIcon: {
      width: 40, height: 40,
      borderRadius: "50%",
      background: redSoft,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: red, fontSize: 18, flexShrink: 0,
    },

    groundingCard: {
      background: T.surfaceAlt,
      borderRadius: 24, padding: 24,
      marginBottom: 20,
    },

    groundingTitle: {
      margin: "0 0 16px",
      fontSize: 18, color: T.text,
      fontFamily: "'Cormorant Garamond', serif",
    },

    groundingSub: {
      margin: "0 0 16px",
      fontSize: 13, color: T.textSoft,
      lineHeight: 1.5,
    },

    groundingList: {
      margin: 0, padding: 0,
      fontSize: 14, color: T.textSoft,
      lineHeight: 1.8, listStyleType: "none",
    },

    groundingItem: { marginBottom: 8 },
    groundingNumber: { color: T.text, fontWeight: 700 },
  };

  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div className="scroll-area fade-up" style={s.scrollArea}>
        <div style={s.content}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.iconCircle}>🆘</div>
            <h1 style={s.heading}>{hi ? "मदद उपलब्ध है" : "Help is Available"}</h1>
            <p style={s.headerText}>
              {hi
                ? "यह ऐप चिकित्सा सलाह प्रदान नहीं करता है। यदि आप संकट में हैं, तो कृपया तुरंत नीचे दिए गए किसी पेशेवर संसाधन से संपर्क करें।"
                : "This app does not provide medical advice. If you are in distress, please contact a professional resource below immediately."}
            </p>
          </div>

          {/* Helplines */}
          <p style={s.sectionLabel}>
            {hi ? "बाहरी हेल्पलाइन (कॉल करने के लिए टैप करें)" : "External Helplines (Tap to Call)"}
          </p>

          <div style={s.helplineList}>
            {HELPLINES.map((line, idx) => (
              <a
                key={idx}
                href={`tel:${line.number}`}
                style={s.helplineCard}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(224,102,102,0.14)"}
                onMouseLeave={e => e.currentTarget.style.background = redBg}
              >
                <div style={s.helplineInfo}>
                  <p style={s.helplineName}>{line.name}</p>
                  <p style={s.helplineDesc}>{line.desc}</p>
                </div>
                <div style={s.helplineIcon}>📞</div>
              </a>
            ))}
          </div>

          {/* 5-4-3-2-1 Grounding */}
          <div style={s.groundingCard}>
            <h3 style={s.groundingTitle}>
              {hi ? "5-4-3-2-1 तकनीक" : "5-4-3-2-1 Grounding"}
            </h3>
            <p style={s.groundingSub}>
              {hi ? "अपने आस-पास देखें और मन में इनका नाम लें:" : "Look around you and silently name:"}
            </p>
            <ul style={s.groundingList}>
              {STEPS.map((step, i) => (
                <li key={i} style={i < STEPS.length - 1 ? s.groundingItem : {}}>
                  {step.emoji} <strong style={s.groundingNumber}>{step.n}</strong>{" "}
                  {hi ? step.hi : step.en}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
