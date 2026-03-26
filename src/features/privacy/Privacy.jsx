import React from 'react';
import { PageNav } from '../../components/SharedUI';

export function Privacy({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";

  const SECTIONS = [
    {
      icon: "☁️",
      en: "What We Collect",
      hi: "हम क्या एकत्र करते हैं",
      enD: "We collect your email address (for account creation), journal entries, mood logs, reflections, and session history. This data is stored securely on Supabase — a trusted cloud platform — protected by row-level security and tied only to your account.",
      hiD: "हम आपका ईमेल पता (खाता बनाने के लिए), जर्नल प्रविष्टियां, मूड लॉग, चिंतन और सत्र इतिहास एकत्र करते हैं। यह डेटा Supabase पर सुरक्षित रूप से संग्रहीत है।",
    },
    {
      icon: "🎯",
      en: "Why We Collect It",
      hi: "हम इसे क्यों एकत्र करते हैं",
      enD: "Your data is used solely to operate the app — to save your journal, remember your session progress, and personalise your experience. We do not use your personal data for advertising or sell it to any third party.",
      hiD: "आपका डेटा केवल ऐप चलाने के लिए उपयोग किया जाता है — आपकी जर्नल सहेजने, सत्र प्रगति याद रखने और अनुभव को व्यक्तिगत बनाने के लिए। हम विज्ञापन के लिए आपके व्यक्तिगत डेटा का उपयोग नहीं करते।",
    },
    // ─── NEW INTERNATIONAL SECURITY SECTIONS ───
    {
      icon: "🔐",
      en: "End-to-End Encrypted Chat",
      hi: "एंड-टू-एंड एन्क्रिप्टेड चैट",
      enD: "Your private messages are secured with End-to-End Encryption (E2EE) before they ever leave your device. Our database only stores scrambled, unreadable text. We cannot read your private messages, and neither can anyone else.",
      hiD: "आपके निजी संदेश आपके डिवाइस से निकलने से पहले एंड-टू-एंड एन्क्रिप्शन (E2EE) से सुरक्षित होते हैं। हमारा डेटाबेस केवल अव्यवस्थित, अपठनीय टेक्स्ट संग्रहीत करता है। हम आपके निजी संदेश नहीं पढ़ सकते, और न ही कोई और।",
    },

    {
      icon: "🤖",
      en: "AI Processing",
      hi: "AI प्रोसेसिंग",
      enD: "When you use the AI journal feature, your text is sent to the AI API solely to generate a response. It is not stored by the AI provider and is not used to train any model.",
      hiD: "जब आप AI जर्नल सुविधा का उपयोग करते हैं, तो आपका टेक्स्ट केवल उत्तर उत्पन्न करने के लिए AI API को भेजा जाता है। इसे AI प्रदाता द्वारा संग्रहीत नहीं किया जाता है।",
    },
    {
      icon: "📊",
      en: "Analytics",
      hi: "एनालिटिक्स",
      enD: "JSukoon uses PostHog to collect anonymous usage data — pages visited and features used. Your journal entries, thoughts, and personal writing are never tracked or stored in analytics.",
      hiD: "JSukoon PostHog एनालिटिक्स का उपयोग करता है। आपकी जर्नल प्रविष्टियां और व्यक्तिगत लेखन कभी ट्रैक नहीं किया जाता।",
    },
    {
      icon: "🌍",
      en: "Data Processing Outside India",
      hi: "भारत के बाहर डेटा प्रोसेसिंग",
      enD: "JSukoon uses services including Supabase, Vercel, PostHog, and AI providers — which may process data on servers outside India. By using JSukoon, you consent to this processing. We ensure each provider maintains appropriate data protection standards.",
      hiD: "JSukoon Supabase, Vercel, PostHog जैसी सेवाओं का उपयोग करता है जो भारत के बाहर सर्वर पर डेटा प्रोसेस कर सकती हैं। JSukoon का उपयोग करके आप इस प्रोसेसिंग के लिए सहमति देते हैं।",
    },
    {
      icon: "🗓️",
      en: "How Long We Keep It",
      hi: "हम इसे कितने समय तक रखते हैं",
      enD: "Your data is retained as long as your account is active. If your account is inactive for 2 years, data may be deleted. You can delete your account and all associated data at any time from Settings.",
      hiD: "आपका डेटा तब तक रखा जाता है जब तक आपका खाता सक्रिय है। आप किसी भी समय Settings से अपना खाता और सभी डेटा हटा सकते हैं।",
    },
    {
      icon: "🗑️",
      en: "Your Right to Delete",
      hi: "हटाने का आपका अधिकार",
      enD: "Under India's Digital Personal Data Protection Act 2023 (DPDP), you have the right to request deletion of your personal data. You can delete your account and all data directly from Settings → Delete My Account. For any data requests, contact: selfhelp97power@gmail.com",
      hiD: "भारत के DPDP अधिनियम 2023 के तहत, आपको अपना व्यक्तिगत डेटा हटाने का अधिकार है। Settings → Delete My Account से सीधे हटाएं। किसी भी डेटा अनुरोध के लिए: selfhelp97power@gmail.com",
    },
    {
      icon: "🚫",
      en: "No Ad Tracking. No Data Sales.",
      hi: "कोई विज्ञापन ट्रैकिंग नहीं। कोई डेटा बिक्री नहीं।",
      enD: "JSukoon does not use third-party tracking cookies, does not sell your data to advertisers, and does not share your personal data with any third party except as required to operate the app.",
      hiD: "JSukoon थर्ड-पार्टी ट्रैकिंग कुकीज़ का उपयोग नहीं करता, आपका डेटा विज्ञापनदाताओं को नहीं बेचता।",
    },
    {
      icon: "🛡️",
      en: "Security",
      hi: "सुरक्षा",
      enD: "We take every reasonable precaution to protect your data including encryption in transit and row-level security in our database. No method of internet transmission is 100% secure, but we commit to notifying you of any breach that affects your data.",
      hiD: "हम आपके डेटा की सुरक्षा के लिए हर उचित सावधानी बरतते हैं। कोई भी उल्लंघन होने पर हम आपको सूचित करेंगे।",
    },
  ];

  const s = {
    page:        { height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" },
    scroll:      { flex: 1, overflowY: "auto", padding: "10px 24px 80px" },
    header:      { textAlign: "center", marginBottom: 40, marginTop: 10 },
    iconCircle:  { width: 64, height: 64, borderRadius: "50%", background: `${T.accent}15`, border: `1px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, boxShadow: `0 4px 20px ${T.accent}20` },
    heading:     { fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 500, marginBottom: 8 },
    updated:     { fontSize: 12, color: T.muted, letterSpacing: 1, textTransform: "uppercase" },
    highlight:   { marginBottom: 32, lineHeight: 1.6, padding: 20, borderLeft: `3px solid ${T.accent}`, background: "rgba(255,255,255,0.03)", borderRadius: "0 12px 12px 0" },
    hlTitle:     { marginBottom: 12, fontWeight: 600, color: T.text, fontSize: 18, fontFamily: "'Cormorant Garamond',serif" },
    hlText:      { marginBottom: 10, color: T.textSoft, fontSize: 15, margin: 0 },
    sectionCard: { marginBottom: 24, background: T.surfaceAlt, borderRadius: 20, padding: 24, border: `1px solid ${T.borderWarm}` },
    sectionHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    sectionIcon: { fontSize: 24 },
    sectionTitle:{ fontSize: 16, color: T.text, fontWeight: 600, margin: 0 },
    sectionDesc: { fontSize: 14, color: T.textSoft, lineHeight: 1.8, margin: 0 },
    grievance:   { marginTop: 8, padding: "16px 20px", background: `${T.accent}08`, borderRadius: 12, border: `1px solid ${T.accent}20` },
    grievanceText:{ fontSize: 13, color: T.textSoft, lineHeight: 1.7, margin: 0 },
    closing:     { textAlign: "center", marginTop: 48, marginBottom: 32 },
    closingText: { fontSize: 18, color: T.accent, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", lineHeight: 1.6 },
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
          <h3 style={s.hlTitle}>{hi ? "आपकी गोपनीयता" : "Your Privacy"}</h3>
          <p style={s.hlText}>
            {hi
              ? "यह एक निजी स्थान है। आपका डेटा आपका है। हम इसे नहीं बेचते, विज्ञापनों के लिए उपयोग नहीं करते।"
              : "This is a private space. Your data is yours. We do not sell it, we do not use it for ads."}
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

        {/* Grievance Officer — DPDP requirement */}
        <div style={s.grievance}>
          <p style={s.grievanceText}>
            <strong>{hi ? "शिकायत अधिकारी, डिजिटल व्यक्तिगत डेटा संरक्षण (डीपीडीपी) अधिनियम, 2023" : "Grievance Officer (DPDP Act 2023)"}</strong><br />
            {hi
              ? "किसी भी डेटा संबंधी शिकायत के लिए संपर्क करें:"
              : "For any data-related concerns or requests:"}<br />
            selfhelp97power@gmail.com<br />
            {hi ? "हम 30 दिनों के भीतर उत्तर देंगे।" : "We will respond within 30 days."}
          </p>
        </div>

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