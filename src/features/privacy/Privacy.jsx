import React from 'react';
import { PageNav } from '../../components/SharedUI';

export function Privacy({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";

  const SECTIONS = [
    {
      icon: "☁️",
      en: "What We Collect",
      hi: "हम क्या डेटा एकत्र करते हैं",
      enD: "We may collect information such as your email address (for account creation), journal entries, mood logs, reflections, and session history. This data is stored on secure cloud infrastructure and is associated only with your account.",
      hiD: "हम आपके द्वारा प्रदान की गई जानकारी एकत्र कर सकते हैं, जैसे आपका ईमेल पता (खाता बनाने के लिए), जर्नल एंट्री, मूड लॉग, विचार और सत्र से जुड़ी जानकारी। यह डेटा सुरक्षित क्लाउड सिस्टम पर संग्रहीत किया जाता है और केवल आपके खाते से जुड़ा होता है।",
    },
    {
      icon: "🎯",
      en: "Why We Collect It",
      hi: "हम यह डेटा क्यों एकत्र करते हैं",
      enD: "Your data is used to operate and improve the app — for example, to save your journal entries, maintain your session progress, and personalise your experience. We do not use your personal data for advertising.",
      hiD: "आपका डेटा ऐप को चलाने और बेहतर बनाने के लिए उपयोग किया जाता है — जैसे आपकी जर्नल एंट्री सुरक्षित रखना, आपकी प्रगति को बनाए रखना और आपके अनुभव को व्यक्तिगत बनाना। हम आपके व्यक्तिगत डेटा का उपयोग विज्ञापन के लिए नहीं करते हैं।",
    },
    {
      icon: "🔐",
      en: "End-to-End Encrypted Chat",
      hi: "एंड-टू-एंड एन्क्रिप्टेड चैट",
      enD: "Your private messages are encrypted on your device before being transmitted. We are not able to read your messages in their encrypted form. However, no system can be guaranteed to be completely secure.",
      hiD: "आपके निजी संदेश आपके डिवाइस पर ही एन्क्रिप्ट किए जाते हैं और उसके बाद भेजे जाते हैं। हम आपके संदेशों को उनके एन्क्रिप्टेड रूप में पढ़ नहीं सकते। हालांकि, कोई भी प्रणाली पूरी तरह से सुरक्षित होने की गारंटी नहीं दे सकती।",
    },
    {
      icon: "🤖",
      en: "AI Processing",
      hi: "एआई प्रोसेसिंग",
      enD: "When you use AI-powered features, your input may be sent to third-party AI service providers to generate responses. We do not use your data to train our own models. These providers may process data according to their own privacy policies.",
      hiD: "जब आप एआई आधारित सुविधाओं का उपयोग करते हैं, तो आपका इनपुट प्रतिक्रिया उत्पन्न करने के लिए तृतीय-पक्ष एआई सेवा प्रदाताओं को भेजा जा सकता है। हम आपके डेटा का उपयोग अपने मॉडल को प्रशिक्षित करने के लिए नहीं करते हैं। ये सेवा प्रदाता अपने-अपने गोपनीयता नीतियों के अनुसार डेटा को प्रोसेस कर सकते हैं।",
    },
    {
      icon: "📊",
      en: "Analytics",
      hi: "विश्लेषण (Analytics)",
      enD: "We use analytics tools such as PostHog to collect limited usage data (for example, pages visited or features used). This information is used to improve the app and does not include your private journal entries or personal writing.",
      hiD: "हम PostHog जैसे टूल का उपयोग सीमित उपयोग डेटा (जैसे कौन-से पेज देखे गए या कौन-सी सुविधाएं उपयोग हुईं) एकत्र करने के लिए करते हैं। इसका उपयोग ऐप को बेहतर बनाने के लिए किया जाता है। आपके जर्नल, व्यक्तिगत विचार या निजी लेखन को इसमें शामिल नहीं किया जाता है।",
    },
    {
      icon: "🌍",
      en: "Data Processing Outside India",
      hi: "भारत के बाहर डेटा प्रोसेसिंग",
      enD: "We use service providers such as Supabase, Vercel, PostHog, and AI providers, which may process data on servers located outside India. By using the app, you consent to such processing. We take reasonable steps to ensure appropriate data protection standards.",
      hiD: "हम Supabase, Vercel, PostHog और एआई सेवा प्रदाताओं जैसी सेवाओं का उपयोग करते हैं, जिनके सर्वर भारत के बाहर स्थित हो सकते हैं। ऐप का उपयोग करके, आप इस प्रकार के डेटा प्रोसेसिंग के लिए सहमति देते हैं। हम उचित डेटा सुरक्षा सुनिश्चित करने के लिए यथासंभव कदम उठाते हैं।",
    },
    {
      icon: "🗓️",
      en: "How Long We Keep It",
      hi: "हम डेटा कितने समय तक रखते हैं",
      enD: "Your data is retained for as long as your account remains active. If your account remains inactive for an extended period (for example, 2 years), we may delete your data. You can delete your account and associated data at any time from the app settings.",
      hiD: "आपका डेटा तब तक सुरक्षित रखा जाता है जब तक आपका खाता सक्रिय रहता है। यदि आपका खाता लंबे समय तक (उदाहरण के लिए 2 वर्ष) निष्क्रिय रहता है, तो हम आपका डेटा हटा सकते हैं। आप किसी भी समय सेटिंग्स में जाकर अपना खाता और संबंधित डेटा हटा सकते हैं।",
    },
    {
      icon: "🗑️",
      en: "Your Right to Delete",
      hi: "डेटा हटाने का आपका अधिकार",
      enD: "Under applicable laws, including the Digital Personal Data Protection Act, 2023 (India), you may request deletion of your personal data. You can delete your account directly from Settings → Delete My Account.\nFor additional requests, contact: selfhelp97power@gmail.com",
      hiD: "लागू कानूनों, जैसे भारत का डिजिटल पर्सनल डेटा प्रोटेक्शन अधिनियम 2023 (DPDP), के तहत आपको अपने व्यक्तिगत डेटा को हटाने का अधिकार है। आप सेटिंग्स → “Delete My Account” से अपना खाता हटा सकते हैं।\nअतिरिक्त अनुरोध के लिए संपर्क करें: selfhelp97power@gmail.com",
    },
    {
      icon: "🚫",
      en: "No Ad Tracking or Data Sales",
      hi: "विज्ञापन और डेटा बिक्री",
      enD: "We do not sell your personal data. We do not use your data for advertising. We do not share your personal data with third parties except as necessary to operate the app or comply with legal obligations.",
      hiD: "हम आपके व्यक्तिगत डेटा को नहीं बेचते हैं। हम आपके डेटा का उपयोग विज्ञापन के लिए नहीं करते हैं। हम आपके डेटा को केवल ऐप चलाने या कानूनी आवश्यकताओं को पूरा करने के लिए ही सीमित रूप से साझा कर सकते हैं।",
    },
    {
      icon: "🛡️",
      en: "Security",
      hi: "सुरक्षा",
      enD: "We take reasonable measures to protect your data, including encryption in transit and access controls. However, no method of transmission or storage is completely secure. We will respond to data breaches in accordance with applicable laws.",
      hiD: "हम आपके डेटा की सुरक्षा के लिए उचित उपाय करते हैं, जैसे ट्रांज़िट में एन्क्रिप्शन और एक्सेस कंट्रोल। हालांकि, इंटरनेट पर डेटा ट्रांसमिशन या स्टोरेज की कोई भी विधि पूरी तरह सुरक्षित नहीं होती। हम लागू कानूनों के अनुसार किसी भी डेटा उल्लंघन की स्थिति में आवश्यक कदम उठाएंगे।",
    },
    {
      icon: "⚠️",
      en: "Not Medical or Mental Health Advice",
      hi: "चिकित्सा या मानसिक स्वास्थ्य सलाह नहीं",
      enD: "JSukoon is intended as a self-help and wellness tool. It does not provide medical, psychological, or therapeutic advice, and it is not a substitute for professional care. If you are experiencing distress or health concerns, please consult a qualified professional.",
      hiD: "JSukoon एक सेल्फ-हेल्प और वेलनेस टूल है। यह चिकित्सा, मनोवैज्ञानिक या चिकित्सीय सलाह प्रदान नहीं करता है और यह पेशेवर उपचार का विकल्प नहीं है। यदि आप किसी मानसिक या शारीरिक परेशानी का अनुभव कर रहे हैं, तो कृपया किसी योग्य विशेषज्ञ से संपर्क करें।",
    }
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
    hlText:      { marginBottom: 10, color: T.textSoft, fontSize: 15, margin: 0, whiteSpace: 'pre-line' },
    sectionCard: { marginBottom: 24, background: T.surfaceAlt, borderRadius: 20, padding: 24, border: `1px solid ${T.borderWarm}` },
    sectionHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    sectionIcon: { fontSize: 24 },
    sectionTitle:{ fontSize: 16, color: T.text, fontWeight: 600, margin: 0 },
    sectionDesc: { fontSize: 14, color: T.textSoft, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' },
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
          <h1 style={s.heading}>{hi ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy"}</h1>
          <p style={s.updated}>{hi ? "अंतिम अपडेट: मार्च 2026" : "Last updated: March 2026"}</p>
        </div>

        <div style={s.highlight}>
          <h3 style={s.hlTitle}>{hi ? "आपकी गोपनीयता" : "Your Privacy"}</h3>
          <p style={s.hlText}>
            {hi
              ? "हम एक सुरक्षित और निजी अनुभव प्रदान करने का प्रयास करते हैं। आपका डेटा आपका है। हम आपके व्यक्तिगत डेटा को न तो बेचते हैं और न ही इसका उपयोग विज्ञापन के लिए करते हैं।"
              : "We aim to provide a private and secure experience. Your data belongs to you. We do not sell your personal data or use it for advertising purposes."}
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

        <div style={s.grievance}>
          <p style={s.grievanceText}>
            <strong>{hi ? "शिकायत अधिकारी (DPDP Act 2023)" : "Grievance Officer (DPDP Act 2023)"}</strong><br />
            {hi
              ? "डेटा से संबंधित किसी भी प्रश्न या अनुरोध के लिए संपर्क करें:"
              : "For any data-related concerns or requests:"}<br />
            selfhelp97power@gmail.com<br />
            <br />
            {hi ? "हम लागू कानूनों के अनुसार उचित समय में उत्तर देने का प्रयास करेंगे।" : "We will respond within a reasonable timeframe, in accordance with applicable laws."}
          </p>
        </div>

        <div style={s.closing}>
          <p style={s.closingText}>
            {hi
              ? "JSukoon में हम आपकी गोपनीयता का सम्मान करने और आपके डेटा को जिम्मेदारी से संभालने का प्रयास करते हैं।"
              : "At JSukoon, we aim to respect your privacy and handle your data responsibly."}
          </p>
        </div>

      </div>
    </div>
  );
}