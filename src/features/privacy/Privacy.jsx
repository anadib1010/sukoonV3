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

        {/* --- NEW HIGHLIGHTED PRIVACY & ANALYTICS DISCLAIMER --- */}
        <div style={{ 
          opacity: 1.0, 
          marginBottom: '32px', 
          lineHeight: '1.6',
          padding: '20px',
          borderLeft: `3px solid ${T.accent}`, // Creates the colored highlight line
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '0 12px 12px 0'
        }}>
          <h3 style={{ marginBottom: '12px', fontWeight: '600', color: T.text, fontSize: 18, fontFamily: "'Cormorant Garamond',serif" }}>
            {hi ? "आपकी गोपनीयता और एनालिटिक्स" : "Your Privacy & Analytics"}
          </h3>
          <p style={{ marginBottom: '10px', color: T.textSoft, fontSize: 15 }}>
            {hi 
              ? "यह एक निजी स्थान है। आपका जर्नल, मूड, और सत्र डेटा Supabase क्लाउड पर सुरक्षित रूप से संग्रहीत होता है — केवल आपके खाते से जुड़ा।" 
              : "This is a private space. Your journal, mood, and session data is securely stored on Supabase cloud — linked only to your account."}
          </p>
          <p style={{ color: T.textSoft, fontSize: 15, margin: 0 }}>
            {hi 
              ? "JSukoon को बेहतर बनाने के लिए हम PostHog एनालिटिक्स का उपयोग करते हैं। यह हमें बताता है कि कौन से पेज देखे गए, कौन सी सुविधाएं उपयोग की गईं, और कितने समय तक। यह आपकी जर्नल सामग्री, विचार या व्यक्तिगत लेखन को कभी रिकॉर्ड नहीं करता। डेटा आपके Supabase खाते से जुड़ा है।" 
              : "To improve JSukoon, we use PostHog analytics. This tells us which pages were visited, which features were used, and session duration. It never records your journal content, thoughts, or personal writing. Data is tied to your Supabase account ID."}
          </p>
        </div>

        {/* Sections */}
        <Section 
          icon="☁️" 
          title="Your Data is on Secure Cloud" 
          titleH="आपका डेटा सुरक्षित क्लाउड पर है"
          desc="Your journal entries, mood logs, reflections, and session history are stored securely on Supabase — a trusted cloud platform. Your data is tied to your account and protected by row-level security."
          descH="आपकी जर्नल प्रविष्टियां, मूड लॉग, चिंतन और सत्र इतिहास Supabase पर सुरक्षित रूप से संग्रहीत हैं — एक विश्वसनीय क्लाउड प्लेटफ़ॉर्म। आपका डेटा आपके खाते से जुड़ा है और row-level security द्वारा सुरक्षित है।"
        />

        <Section 
          icon="🤖" 
          title="AI Processing" 
          titleH="AI प्रोसेसिंग"
          desc="When you Seek a Reflection, your text is sent to the Google Gemini API. This data is used only to generate the reflection and is not stored."
          descH="जब आप कोई प्रतिबिंब (Reflection) खोजते हैं, तो आपका टेक्स्ट Google Gemini API को भेजा जाता है। इस डेटा का उपयोग केवल उत्तर उत्पन्न करने के लिए किया जाता है और इसे सहेजा नहीं जाता है।"
        />

        <Section
          icon="📊"
          title="Analytics & Tracking"
          titleH="एनालिटिक्स और ट्रैकिंग"
          desc="JSukoon uses PostHog to collect anonymous usage data — pages visited, features used, and actions like completing a meditation or submitting a journal entry. This data is linked to your account ID and helps us improve the app. Your journal entries, thoughts, and personal writing are never tracked or stored in analytics."
          descH="JSukoon बेहतर बनाने के लिए PostHog एनालिटिक्स का उपयोग करता है — देखे गए पेज, उपयोग की गई सुविधाएं, और ध्यान पूरा करने या जर्नल सबमिट करने जैसी क्रियाएं। यह डेटा आपके खाता ID से जुड़ा है। आपकी जर्नल प्रविष्टियां, विचार और व्यक्तिगत लेखन कभी ट्रैक नहीं किया जाता।"
        />

        <Section 
          icon="🚫" 
          title="No Ad Tracking" 
          titleH="कोई विज्ञापन ट्रैकिंग नहीं"
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