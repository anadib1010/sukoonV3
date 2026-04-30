import React from 'react';
import { PageNav } from '../../components/SharedUI';

export function Terms({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";

  const SECTIONS = [
    {
      icon: "🤝",
      en: "1. Acceptance of Terms",
      hi: "1. शर्तों की स्वीकृति",
      enD: "By accessing or using J Su Kun, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.",
      hiD: "J Su Kun का उपयोग करके, आप इन सेवा शर्तों से सहमत होते हैं। यदि आप सहमत नहीं हैं, तो कृपया ऐप का उपयोग न करें।",
    },
    {
      icon: "🎂",
      en: "2. Age Requirements",
      hi: "2. आयु सीमा",
      enD: "You must be at least 18 years old (or the age of legal majority in your jurisdiction) to use J Su Kun. By using this app, you confirm that you meet this requirement.",
      hiD: "J Su Kun का उपयोग करने के लिए आपकी आयु कम से कम 18 वर्ष (या आपके अधिकार क्षेत्र में कानूनी वयस्कता की आयु) होनी चाहिए। ऐप का उपयोग करके, आप पुष्टि करते हैं कि आप इस आवश्यकता को पूरा करते हैं।",
    },
    {
      icon: "📱",
      en: "3. Description of Service",
      hi: "3. सेवा का विवरण",
      enD: "J Su Kun is a self-help and wellness application that provides journaling tools, mood tracking, AI-assisted features, and communication features. It is intended for personal use only.",
      hiD: "J Su Kun एक सेल्फ-हेल्प और वेलनेस ऐप है, जिसमें जर्नलिंग, मूड ट्रैकिंग, एआई-सहायता प्राप्त सुविधाएं और संचार फीचर्स शामिल हैं। यह केवल व्यक्तिगत उपयोग के लिए है।",
    },
    {
      icon: "⚠️",
      en: "4. Not Medical or Professional Advice",
      hi: "4. चिकित्सा या पेशेवर सलाह नहीं",
      enD: "J Su Kun does not provide medical, psychological, or therapeutic advice. The app is not a substitute for professional care.\n\nIf you are experiencing distress or health concerns, please consult a qualified professional.",
      hiD: "J Su Kun चिकित्सा, मनोवैज्ञानिक या चिकित्सीय सलाह प्रदान नहीं करता है। यह किसी पेशेवर उपचार का विकल्प नहीं है।\n\nयदि आप किसी परेशानी का अनुभव कर रहे हैं, तो कृपया किसी योग्य विशेषज्ञ से संपर्क करें।",
    },
    {
      icon: "👤",
      en: "5. User Accounts",
      hi: "5. उपयोगकर्ता खाता",
      enD: "• You are responsible for maintaining the confidentiality of your account.\n• You agree to provide accurate information during registration.\n• You are responsible for all activity under your account.",
      hiD: "• अपने खाते की गोपनीयता बनाए रखना आपकी जिम्मेदारी है।\n• पंजीकरण के समय सही जानकारी देना आवश्यक है।\n• आपके खाते से होने वाली सभी गतिविधियों के लिए आप जिम्मेदार हैं।",
    },
    {
      icon: "✅",
      en: "6. Acceptable Use & Interactions",
      hi: "6. स्वीकार्य उपयोग और बातचीत",
      enD: "You agree not to:\n• Use the app for unlawful or harmful activities\n• Harass, abuse, or harm others\n• Upload or share illegal, offensive, or harmful content\n• Attempt to disrupt or interfere with the app’s functionality\n\nUsers are responsible for their interactions and must not misuse communication features.",
      hiD: "आप सहमत हैं कि आप:\n• ऐप का उपयोग अवैध या हानिकारक गतिविधियों के लिए नहीं करेंगे\n• किसी को परेशान, नुकसान या दुर्व्यवहार नहीं करेंगे\n• अवैध, आपत्तिजनक या हानिकारक सामग्री साझा नहीं करेंगे\n• ऐप के काम में बाधा डालने की कोशिश नहीं करेंगे\n\nउपयोगकर्ता अपनी बातचीत के लिए जिम्मेदार हैं।",
    },
    {
      icon: "📝",
      en: "7. User Content",
      hi: "7. उपयोगकर्ता सामग्री",
      enD: "You retain ownership of the content you create. By using the app, you grant us a limited right to process your content solely to operate and improve the service.",
      hiD: "आप अपने द्वारा बनाई गई सामग्री के स्वामी बने रहते हैं। ऐप का उपयोग करके, आप हमें केवल सेवा चलाने और सुधारने के लिए इस सामग्री को प्रोसेस करने की अनुमति देते हैं।",
    },
    {
      icon: "🤖",
      en: "8. AI Features",
      hi: "8. एआई सुविधाएं",
      enD: "AI-generated responses and horoscopes are provided for informational and entertainment purposes only. They should not be relied on as professional advice.",
      hiD: "एआई द्वारा दिए गए उत्तर और राशिफल केवल जानकारी और मनोरंजन के लिए हैं। उन्हें पेशेवर सलाह के रूप में उपयोग नहीं किया जाना चाहिए।",
    },
    {
      icon: "🔒",
      en: "9. Privacy",
      hi: "9. गोपनीयता",
      enD: "Your use of the app is also governed by our Privacy Policy.",
      hiD: "ऐप का उपयोग हमारी गोपनीयता नीति के अनुसार होता है।",
    },
    {
      icon: "⚡",
      en: "10. Service Availability",
      hi: "10. सेवा की उपलब्धता",
      enD: "We aim to provide a reliable service, but we do not guarantee uninterrupted or error-free operation.",
      hiD: "हम सेवा को स्थिर रखने का प्रयास करते हैं, लेकिन हम निरंतर या त्रुटि-रहित सेवा की गारंटी नहीं देते।",
    },
    {
      icon: "⚖️",
      en: "11. Limitation of Liability",
      hi: "11. दायित्व की सीमा",
      enD: "To the maximum extent permitted by law, J Su Kun is provided “as is”. We are not liable for any indirect, incidental, or consequential damages.",
      hiD: "कानून द्वारा अनुमत सीमा तक, J Su Kun “जैसा है” प्रदान किया जाता है। किसी भी अप्रत्यक्ष या आकस्मिक नुकसान के लिए हम जिम्मेदार नहीं हैं।",
    },
    {
      icon: "🛑",
      en: "12. Termination",
      hi: "12. समाप्ति",
      enD: "We may suspend or terminate your access if you violate these Terms.",
      hiD: "यदि आप इन शर्तों का उल्लंघन करते हैं, तो आपका उपयोग समाप्त किया जा सकता है।",
    },
    {
      icon: "🔄",
      en: "13. Changes to Terms",
      hi: "13. शर्तों में बदलाव",
      enD: "We may update these Terms from time to time. Continued use of the app constitutes acceptance of the updated Terms.",
      hiD: "हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। ऐप का उपयोग जारी रखना नए शर्तों की स्वीकृति माना जाएगा।",
    },
    {
      icon: "🇮🇳",
      en: "14. Governing Law",
      hi: "14. लागू कानून",
      enD: "These Terms are governed by the laws of India.",
      hiD: "ये शर्तें भारत के कानूनों के अनुसार नियंत्रित होती हैं।",
    },
    {
      icon: "✉️",
      en: "15. Contact",
      hi: "15. संपर्क",
      enD: "For questions regarding these Terms: selfhelp97power@gmail.com",
      hiD: "इन शर्तों से संबंधित प्रश्नों के लिए संपर्क करें: selfhelp97power@gmail.com",
    },
    {
      icon: "🛡️",
      en: "16. Community Conduct & Fan Wars",
      hi: "16. सामुदायिक आचरण और प्रशंसक विवाद",
      enD: "J Su Kun is a space for peace. 'Fan wars', toxic behavior, harassment of other fans, or spreading hate regarding any artist or group is strictly prohibited. Violation will result in an immediate permanent ban.",
      hiD: "J Su Kun शांति के लिए एक जगह है। 'फैन वॉर्स', जहरीला व्यवहार, अन्य प्रशंसकों का उत्पीड़न, या किसी भी कलाकार के प्रति नफरत फैलाना सख्त मना है। उल्लंघन करने पर तुरंत प्रतिबंध लगा दिया जाएगा।",
    },
    {
      icon: "🌟",
      en: "17. Non-Affiliation",
      hi: "17. गैर-संबद्धता",
      enD: "You acknowledge that J Su Kun is an independent fan-made application and is not a representative of the official K-pop industry or its corporate entities.",
      hiD: "आप स्वीकार करते हैं कि J Su Kun एक स्वतंत्र प्रशंसक-निर्मित ऐप है और यह आधिकारिक K-pop उद्योग या उनकी कंपनियों का प्रतिनिधि नहीं है।",
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
    hlText:      { marginBottom: 10, color: T.textSoft, fontSize: 15, margin: 0, whiteSpace: 'pre-line' },
    sectionCard: { marginBottom: 24, background: T.surfaceAlt, borderRadius: 20, padding: 24, border: `1px solid ${T.borderWarm}` },
    sectionHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    sectionIcon: { fontSize: 24 },
    sectionTitle:{ fontSize: 16, color: T.text, fontWeight: 600, margin: 0 },
    sectionDesc: { fontSize: 14, color: T.textSoft, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' },
    closing:     { textAlign: "center", marginTop: 48, marginBottom: 32 },
    closingText: { fontSize: 18, color: T.accent, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", lineHeight: 1.6 },
  };

  return (
    <div style={s.page}>
      <PageNav onBack={goBack || (() => setTab("settings"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div className="scroll-area fade-up" style={s.scroll}>
        <div style={s.header}>
          <div style={s.iconCircle}>⚖️</div>
          <h1 style={s.heading}>{hi ? "सेवा की शर्तें" : "Terms of Service"}</h1>
          <p style={s.updated}>{hi ? "अंतिम अपडेट: अप्रैल 2026" : "Last updated: April 2026"}</p>
        </div>

        <div style={s.highlight}>
          <h3 style={s.hlTitle}>{hi ? "सुरक्षित समुदाय" : "Safe Community"}</h3>
          <p style={s.hlText}>
            {hi
              ? "हम एक सुरक्षित और निजी अनुभव प्रदान करने का प्रयास करते हैं। स्पैम, उत्पीड़न या दुरुपयोग को बर्दाश्त नहीं किया जाएगा।"
              : "We aim to provide a private and secure experience. Spam, harassment, or abuse will not be tolerated."}
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
              ? "J Su Kun का उपयोग करने के लिए धन्यवाद।"
              : "Thank you for using J Su Kun."}
          </p>
        </div>
      </div>
    </div>
  );
}