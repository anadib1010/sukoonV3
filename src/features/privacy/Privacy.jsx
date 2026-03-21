import React from 'react';
import { PageNav } from '../../components/SharedUI';

export function Privacy({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";

  const SECTIONS = [
    {
      icon: "☁️",
      en: "Your Data is on Secure Cloud",
      hi: "आपका डेटा सुरक्षित क्लाउड पर है",
      enD: "Your journal entries, mood logs, reflections, and session history are stored securely on Supabase — a trusted cloud platform. Your data is tied to your account and protected by row-level security.",
      hiD: "आपकी जर्नल प्रविष्टियां, मूड लॉग, चिंतन और सत्र इतिहास Supabase पर सुरक्षित रूप से संग्रहीत हैं — एक विश्वसनीय क्लाउड प्लेटफ़ॉर्म। आपका डेटा आपके खाते से जुड़ा है और row-level security द्वारा सुरक्षित है।",
    },
    {
      icon: "🤖",
      en: "AI Processing",
      hi: "AI प्रोसेसिंग",
      enD: "When you Seek a Reflection, your text is sent to the Google Gemini API. This data is used only to generate the reflection and is not stored.",
      hiD: "जब आप कोई प्रतिबिंब (Reflection) खोजते हैं, तो आपका टेक्स्ट Google Gemini API को भेजा जाता है। इस डेटा का उपयोग केवल उत्तर उत्पन्न करने के लिए किया जाता है और इसे सहेजा नहीं जाता है।",
    },
    {
      icon: "📊",
      en: "Analytics & Tracking",
      hi: "एनालिटिक्स और ट्रैकिंग",
      enD: "JSukoon uses PostHog to collect anonymous usage data — pages visited, features used, and actions like completing a meditation or submitting a journal entry. This data is linked to your account ID and helps us improve the app. Your journal entries, thoughts, and personal writing are never tracked or stored in analytics.",
      hiD: "JSukoon बेहतर बनाने के लिए PostHog एनालिटिक्स का उपयोग करता है — देखे गए पेज, उपयोग की गई सुविधाएं, और ध्यान पूरा करने या जर्नल सबमिट करने जैसी क्रियाएं। यह डेटा आपके खाता ID से जुड़ा है। आपकी जर्नल प्रविष्टियां, विचार और व्यक्तिगत लेखन कभी ट्रैक नहीं किया जाता।",
    },
    {
      icon: "🚫",
      en: "No Ad Tracking",
      hi: "कोई विज्ञापन ट्रैकिंग नहीं",
      enD: "JSukoon does not use third-party tracking cookies or sell your data to advertisers.",
      hiD: "JSukoon थर्ड-पार्टी ट्रैकिंग कुकीज़ का उपयोग नहीं करता है या आपका डेटा विज्ञापनदाताओं को नहीं बेचता है।",
    },
    {
      icon: "🛡️",
      en: "Security",
      hi: "सुरक्षा",
      enD: "While we take every precaution to protect your data, no method of transmission over the internet is 100% secure.",
      hiD: "हालांकि हम आपके डेटा की सुरक्षा के लिए हर सावधानी बरतते हैं, लेकिन इंटरनेट पर ट्रांसमिशन का कोई भी तरीका 100% सुरक्षित नहीं है।",
    },
  ];

  const s = {
    page:       { height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" },
    scroll:     { flex: 1, overflowY: "auto", padding: "10px 24px 80px" },
    header:     { textAlign: "center", marginBottom: 40, marginTop: 10 },
    iconCircle: { width: 64, height: 64, borderRadius: "50%", background: `${T.accent}15`, border: `1px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, boxShadow: `0 4px 20px ${T.accent}20` },
    heading:    { fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 500, marginBottom: 8 },
    updated:    { fontSize: 12, color: T.muted, letterSpacing: 1, textTransform: "uppercase" },
    highlight:  { marginBottom: 32, lineHeight: 1.6, padding: 20, borderLeft: `3px solid ${T.accent}`, background: 'rgba(255,255,255,0.03)', borderRadius: '0 12px 12px 0' },
    hlTitle:    { marginBottom: 12, fontWeight: 600, color: T.text, fontSize: 18, fontFamily: "'Cormorant Garamond',serif" },
    hlText:     { marginBottom: 10, color: T.textSoft, fontSize: 15 },
    sectionCard:{ marginBottom: 32, background: T.surfaceAlt, borderRadius: 20, padding: 24, border: `1px solid ${T.borderWarm}` },
    sectionHead:{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    sectionIcon:{ fontSize: 24 },
    sectionTitle:{ fontSize: 16, color: T.text, fontWeight: 600, margin: 0 },
    sectionDesc:{ fontSize: 14, color: T.textSoft, lineHeight: 1.8, margin: 0 },
    closing:    { textAlign: "center", marginTop: 48, marginBottom: 32 },
    closingText:{ fontSize: 18, color: T.accent, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", lineHeight: 1.6 },
  };

  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("settings"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div className="scroll-area fade-up" style={s.scroll}>

        <div style={s.header}>
          <div style={s.iconCircle}>🔒</div>
          <h1 style={s.heading}>{hi ? "गोपनीयता नीति" : "Privacy Policy"}</h1>
          <p style={s.updated}>{hi ? "अंतिम अपडेट: मार्च 2026" : "Last updated: March 2026"}</p>
        </div>

        <div style={s.highlight}>
          <h3 style={s.hlTitle}>{hi ? "आपकी गोपनीयता और एनालिटिक्स" : "Your Privacy & Analytics"}</h3>
          <p style={s.hlText}>
            {hi
              ? "यह एक निजी स्थान है। आपका जर्नल, मूड, और सत्र डेटा Supabase क्लाउड पर सुरक्षित रूप से संग्रहीत होता है — केवल आपके खाते से जुड़ा।"
              : "This is a private space. Your journal, mood, and session data is securely stored on Supabase cloud — linked only to your account."}
          </p>
          <p style={{ ...s.hlText, margin: 0 }}>
            {hi
              ? "JSukoon को बेहतर बनाने के लिए हम PostHog एनालिटिक्स का उपयोग करते हैं। यह आपकी जर्नल सामग्री, विचार या व्यक्तिगत लेखन को कभी रिकॉर्ड नहीं करता।"
              : "To improve JSukoon, we use PostHog analytics. It never records your journal content, thoughts, or personal writing."}
          </p>
        </div>

        {SECTIONS.map((sec, i) => (
          <div key={i} style={s.sectionCard}>
            <div style={s.sectionHead}>
              <span style={s.sectionIcon}>{sec.icon}</span>
              <h3 style={s.sectionTitle}>{hi ? sec.hi : sec.en}</h3>
            </div>
            <p style={s.sectionDesc}>{hi ? sec.hiD : sec.enD}</p>
          </div>
        ))}

        <div style={s.closing}>
          <p style={s.closingText}>
            {hi
              ? "JSukoon में, गोपनीयता कोई फीचर नहीं है — यह एक मूल्य है।"
              : "At JSukoon, privacy is not a feature — it is a value."}
          </p>
        </div>

      </div>
    </div>
  );
}
