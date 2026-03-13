import React from 'react';
import { PageNav } from '../../components/SharedUI';

export function Privacy({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";

  const Section = ({ icon, title, titleH, desc, descH }) => (
    <div style={{ marginBottom: 32, background: T.surfaceAlt, borderRadius: 20, padding: "24px", border: `1px solid ${T.borderWarm}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h3 style={{ fontSize: 16, color: T.text, fontWeight: 600, margin: 0 }}>
          {hi ? titleH : title}
        </h3>
      </div>
      <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.8, margin: 0 }}>
        {hi ? descH : desc}
      </p>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("settings"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />
      
      <div className="scroll-area fade-up" style={{ flex: 1, overflowY: "auto", padding: "10px 24px 80px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40, marginTop: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${T.accent}15`, border: `1px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, boxShadow: `0 4px 20px ${T.accent}20` }}>
            🔒
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 500, marginBottom: 8 }}>
            {hi ? "गोपनीयता नीति" : "Privacy Policy"}
          </h1>
          <p style={{ fontSize: 12, color: T.muted, letterSpacing: 1, textTransform: "uppercase" }}>
            {hi ? "अंतिम अपडेट: मार्च 2026" : "Last updated: March 2026"}
          </p>
        </div>

        {/* Sections */}
        <Section 
          icon="📱" 
          title="Your Data is Local" 
          titleH="आपका डेटा लोकल है"
          desc="Your journal entries are stored directly on your device using LocalStorage. We do not have a database that stores your personal entries on our servers."
          descH="आपकी डायरी प्रविष्टियां LocalStorage का उपयोग करके सीधे आपके डिवाइस पर संग्रहीत की जाती हैं। हमारे पास कोई ऐसा डेटाबेस नहीं है जो आपकी व्यक्तिगत प्रविष्टियों को हमारे सर्वर पर सहेजता हो।"
        />

        <Section 
          icon="🤖" 
          title="AI Processing" 
          titleH="AI प्रोसेसिंग"
          desc="When you Seek a Reflection, your text is sent to the Google Gemini API. This data is used only to generate the reflection and is not stored."
          descH="जब आप कोई प्रतिबिंब (Reflection) खोजते हैं, तो आपका टेक्स्ट Google Gemini API को भेजा जाता है। इस डेटा का उपयोग केवल उत्तर उत्पन्न करने के लिए किया जाता है और इसे सहेजा नहीं जाता है।"
        />

        <Section 
          icon="🚫" 
          title="No Tracking" 
          titleH="कोई ट्रैकिंग नहीं"
          desc="JSukoon does not use third-party tracking cookies or sell your data to advertisers."
          descH="JSukoon थर्ड-पार्टी ट्रैकिंग कुकीज़ का उपयोग नहीं करता है या आपका डेटा विज्ञापनदाताओं को नहीं बेचता है।"
        />

        <Section 
          icon="🛡️" 
          title="Security" 
          titleH="सुरक्षा"
          desc="While we take every precaution to protect your data, no method of transmission over the internet is 100% secure."
          descH="हालांकि हम आपके डेटा की सुरक्षा के लिए हर सावधानी बरतते हैं, लेकिन इंटरनेट पर ट्रांसमिशन का कोई भी तरीका 100% सुरक्षित नहीं है।"
        />

        {/* Closing Statement */}
        <div style={{ textAlign: "center", marginTop: 48, marginBottom: 32 }}>
          <p style={{ fontSize: 18, color: T.accent, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", lineHeight: 1.6 }}>
            {hi 
              ? "JSukoon में, गोपनीयता कोई फीचर नहीं है — यह एक मूल्य है।" 
              : "At JSukoon, privacy is not a feature — it is a value."}
          </p>
        </div>

      </div>
    </div>
  );
}