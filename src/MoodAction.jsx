import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const moodLibrary = {
  Heavy: {
    bgColor: "#0a0a0f", textColor: "#e8e8e8",
    message:         "You're carrying something heavy.",
    messageH:        "आप कुछ भारी लिए चल रहे हैं।",
    cta:             "A 2-minute breath might help.",
    ctaH:            "दो मिनट की सांस शायद मदद करे।",
    primaryLabel:    "Quick Return · 2 min",
    primaryLabelH:   "त्वरित वापसी · 2 मिनट",
    primaryTab:      "practice",
    secondaryLabel:  "Or burn it in Reflection",
    secondaryLabelH: "या इसे चिंतन में जलाएं",
    secondaryTab:    "reflection",
    glyph:           "◈",
  },
  Restless: {
    bgColor: "#0f1824", textColor: "#e8f0ff",
    message:         "Let this restless energy have somewhere to go.",
    messageH:        "इस बेचैन ऊर्जा को कहीं जाने दें।",
    cta:             "Burn it or write it out.",
    ctaH:            "इसे जलाएं या लिख डालें।",
    primaryLabel:    "Open Reflection",
    primaryLabelH:   "चिंतन खोलें",
    primaryTab:      "reflection",
    secondaryLabel:  "Or write in your journal",
    secondaryLabelH: "या अपने जर्नल में लिखें",
    secondaryTab:    "journal",
    glyph:           "⟡",
  },
  Exhausted: {
    bgColor: "#141f1a", textColor: "#d4e8dc",
    message:         "Acknowledging exhaustion takes courage.",
    messageH:        "थकान को स्वीकार करना साहस का काम है।",
    cta:             "A sleep meditation might be what you need.",
    ctaH:            "शायद एक नींद ध्यान आपके काम आए।",
    primaryLabel:    "Meditation Clips",
    primaryLabelH:   "ध्यान सत्र",
    primaryTab:      "audio",
    secondaryLabel:  "Or just rest on the Bench",
    secondaryLabelH: "या बस बेंच पर आराम करें",
    secondaryTab:    "bench",
    glyph:           "✦",
  },
  Okay: {
    bgColor: "#f5f0e8", textColor: "#2a2a1a",
    message:         "Steady is a good place to be.",
    messageH:        "स्थिर रहना एक अच्छी जगह है।",
    cta:             "Write a little — it helps.",
    ctaH:            "थोड़ा लिखें — यह मदद करता है।",
    primaryLabel:    "Open your journal",
    primaryLabelH:   "जर्नल खोलें",
    primaryTab:      "journal",
    secondaryLabel:  "Or explore practices",
    secondaryLabelH: "या अभ्यास देखें",
    secondaryTab:    "practice",
    glyph:           "◇",
  },
  Warm: {
    bgColor: "#fdf0f0", textColor: "#2a1a1a",
    message:         "A warm feeling — hold it gently.",
    messageH:        "एक गर्म एहसास — इसे धीरे से थामे रहें।",
    cta:             "Write a little, or send warmth.",
    ctaH:            "थोड़ा लिखें, या गर्माहट भेजें।",
    primaryLabel:    "Send Warmth",
    primaryLabelH:   "गर्माहट भेजें",
    primaryTab:      "warmth",
    secondaryLabel:  "Or write in your journal",
    secondaryLabelH: "या अपने जर्नल में लिखें",
    secondaryTab:    "journal",
    glyph:           "✿",
  },
  Sad: {
    bgColor: "#0e1c20", textColor: "#c8e0e8",
    message:         "Let go of it and be a witness.",
    messageH:        "इसे जाने दें और एक साक्षी बनें।",
    cta:             "Let it sink.",
    ctaH:            "इसे डूब जाने दें।",
    primaryLabel:    "Write a message and let it sink in water",
    primaryLabelH:   "एक संदेश लिखें और इसे पानी में डूबने दें",
    primaryTab:      "focus",
    secondaryLabel:  "Or write your journal",
    secondaryLabelH: "या अपना जर्नल लिखें",
    secondaryTab:    "journal",
    glyph:           "⬡",
  },
};

export default function MoodAction({ selectedMood, goBack, setTab, lang }) {
  const [aiTip, setAiTip]         = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible]     = useState(false);
  const hi = lang === "Hindi";

  const activeMood = moodLibrary[selectedMood];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchAiTip = async () => {
      if (!selectedMood) return;
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || '';
        const response = await fetch('/api/mood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ mood: selectedMood, lang }),
        });
        const data = await response.json();
        setAiTip(data.tip);
      } catch {
        setAiTip(
          hi
            ? "एक धीमी सांस लें। आप एक सुरक्षित जगह पर हैं।"
            : "Take a gentle breath. You are in a safe space."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAiTip();
  }, [selectedMood, lang]);

  if (!activeMood) return (
    <div style={{ color: "white", padding: 20 }}>
      {hi ? "मूड नहीं मिला।" : "Mood not found."}
    </div>
  );

  const isLight = activeMood.textColor.startsWith("#2") || activeMood.textColor.startsWith("#1a1");
  const btnBg   = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.13)";

  // ─── STYLES ───
  const s = {
    page: {
      minHeight: "100%",
      padding: "64px 24px 40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: activeMood.bgColor,
      color: activeMood.textColor,
      transition: "background-color 0.5s ease",
      position: "relative",
      boxSizing: "border-box",
    },

    // Ambient glow behind content
    glow: {
      position: "absolute",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "260px",
      height: "260px",
      borderRadius: "50%",
      background: `radial-gradient(circle, ${activeMood.textColor}08 0%, transparent 70%)`,
      pointerEvents: "none",
    },

    backBtn: {
      position: "absolute", top: 20, left: 20,
      background: "none", border: "none",
      color: "inherit", opacity: 0.6,
      cursor: "pointer", fontSize: 15,
      fontFamily: "'DM Sans', sans-serif",
      transition: "opacity 0.2s",
    },

    homeBtn: {
      position: "absolute", top: 20, right: 20,
      background: "none", border: "none",
      color: "inherit", opacity: 0.6,
      cursor: "pointer", fontSize: 15,
      fontFamily: "'DM Sans', sans-serif",
      transition: "opacity 0.2s",
    },

    // Content wrapper — fades and rises in
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      maxWidth: 340,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    },

    // Decorative glyph unique to each mood
    glyphWrap: {
      fontSize: 32,
      opacity: 0.2,
      marginBottom: 20,
      letterSpacing: 2,
      color: activeMood.textColor,
      fontFamily: "'Cormorant Garamond', serif",
    },

    message: {
      fontSize: "clamp(22px, 6vw, 30px)",
      fontWeight: 300,
      textAlign: "center",
      marginBottom: 20,
      fontFamily: "'Cormorant Garamond', serif",
      lineHeight: 1.4,
      maxWidth: 320,
    },

    // Divider line
    divider: {
      width: 24,
      height: 1,
      background: activeMood.textColor,
      opacity: 0.2,
      marginBottom: 20,
    },

    // AI tip box
    aiBox: {
      minHeight: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      textAlign: "center",
      maxWidth: 300,
      padding: "16px 20px",
      borderRadius: 16,
      background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
      border: `1px solid ${activeMood.textColor}15`,
    },

    aiLoading: {
      fontSize: 14,
      fontStyle: "italic",
      opacity: 0.5,
      color: activeMood.textColor,
    },

    aiTip: {
      fontSize: 15,
      fontStyle: "italic",
      opacity: 0.85,
      lineHeight: 1.65,
      color: activeMood.textColor,
      fontFamily: "'Cormorant Garamond', serif",
    },

    cta: {
      fontSize: 16,
      marginBottom: 32,
      opacity: 0.75,
      textAlign: "center",
      maxWidth: 280,
      lineHeight: 1.5,
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
    },

    btnGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
      maxWidth: 300,
    },

    primaryBtn: {
      backgroundColor: btnBg,
      color: "inherit",
      padding: "16px",
      borderRadius: 16,
      border: `1px solid ${activeMood.textColor}30`,
      cursor: "pointer",
      fontSize: 15,
      fontFamily: "'Cormorant Garamond', serif",
      letterSpacing: 0.3,
      lineHeight: 1.3,
      transition: "background 0.2s, transform 0.2s",
    },

    secondaryBtn: {
      backgroundColor: "transparent",
      color: "inherit",
      padding: "12px",
      borderRadius: 16,
      border: "none",
      cursor: "pointer",
      opacity: 0.55,
      fontSize: 13,
      textDecoration: "underline",
      fontFamily: "'Cormorant Garamond', serif",
      transition: "opacity 0.2s",
    },
  };

  return (
    <div style={s.page}>

      {/* Ambient glow */}
      <div style={s.glow} />

      {/* Nav */}
      <button
        onClick={goBack}
        style={s.backBtn}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
      >
        ← {hi ? "वापस" : "Back"}
      </button>

      <button
        onClick={() => setTab("home")}
        style={s.homeBtn}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
      >
        {hi ? "होम" : "Home"} ⌂
      </button>

      {/* Content */}
      <div style={s.content}>

        {/* Mood glyph */}
        <div style={s.glyphWrap}>{activeMood.glyph}</div>

        {/* Message */}
        <h1 style={s.message}>
          {hi ? activeMood.messageH : activeMood.message}
        </h1>

        <div style={s.divider} />

        {/* AI tip */}
        <div style={s.aiBox}>
          {isLoading ? (
            <p style={s.aiLoading}>
              {hi ? "एक विचार इकट्ठा हो रहा है..." : "Gathering a gentle thought..."}
            </p>
          ) : (
            <p style={s.aiTip}>"{aiTip}"</p>
          )}
        </div>

        {/* CTA */}
        <p style={s.cta}>
          {hi ? activeMood.ctaH : activeMood.cta}
        </p>

        {/* Buttons */}
        <div style={s.btnGroup}>
          <button
            onClick={() => setTab(activeMood.primaryTab)}
            style={s.primaryBtn}
            onMouseEnter={e => { e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.13)" : "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = btnBg; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {hi ? activeMood.primaryLabelH : activeMood.primaryLabel}
          </button>

          <button
            onClick={() => setTab(activeMood.secondaryTab)}
            style={s.secondaryBtn}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.55"}
          >
            {hi ? activeMood.secondaryLabelH : activeMood.secondaryLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
