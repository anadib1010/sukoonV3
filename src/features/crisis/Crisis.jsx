import React from 'react';
import { PageNav } from '../../components/SharedUI';

export function Crisis({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";

  const HELPLINES = [
    { name: hi ? "किरण (मानसिक स्वास्थ्य)" : "KIRAN (Mental Health)", desc: hi ? "24/7 सरकारी हेल्पलाइन" : "24/7 Govt. Helpline", number: "18005990019" },
    { name: hi ? "आसरा (सुसाइड प्रिवेंशन)" : "AASRA (Crisis Support)", desc: hi ? "पेशेवर परामर्श" : "Professional Counseling", number: "9820466726" },
    { name: hi ? "वंद्रेवाला फाउंडेशन" : "Vandrevala Foundation", desc: hi ? "भावनात्मक समर्थन" : "Emotional Support", number: "9999666555" },
    { name: hi ? "आपातकालीन (पुलिस/एम्बुलेंस)" : "Emergency (Police/Medical)", desc: hi ? "राष्ट्रीय आपातकाल" : "National Emergency", number: "112" }
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />
      
      <div className="scroll-area fade-up" style={{ flex: 1, overflowY: "auto", padding: "10px 24px 80px" }}>
        
        {/* Header Area */}
        <div style={{ textAlign: "center", marginBottom: 40, marginTop: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(224, 102, 102, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>
            🆘
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: T.text, fontWeight: 500, marginBottom: 8 }}>
            {hi ? "मदद उपलब्ध है" : "Help is Available"}
          </h1>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
            {hi 
              ? "यह ऐप चिकित्सा सलाह प्रदान नहीं करता है। यदि आप संकट में हैं, तो कृपया तुरंत नीचे दिए गए किसी पेशेवर संसाधन से संपर्क करें।" 
              : "This app does not provide medical advice. If you are in distress, please contact a professional resource below immediately."}
          </p>
        </div>

        {/* Helplines (Tap to Call) */}
        <p style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
          {hi ? "बाहरी हेल्पलाइन (कॉल करने के लिए टैप करें)" : "External Helplines (Tap to Call)"}
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {HELPLINES.map((line, idx) => (
            <a key={idx} href={`tel:${line.number}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(224, 102, 102, 0.08)", border: "1px solid rgba(224, 102, 102, 0.2)", borderRadius: 16, padding: "16px 20px", transition: "all 0.2s" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 16, color: "#e06666", fontWeight: 600 }}>
                    {line.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: T.textSoft }}>
                    {line.desc}
                  </p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(224, 102, 102, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e06666", fontSize: 18 }}>
                  📞
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* 5-4-3-2-1 Grounding Technique */}
        <div style={{ background: T.surfaceAlt, borderRadius: 24, padding: "24px", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 18, color: T.text, fontFamily: "'Cormorant Garamond', serif" }}>
            {hi ? "5-4-3-2-1 तकनीक" : "5-4-3-2-1 Grounding"}
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: T.textSoft, lineHeight: 1.5 }}>
            {hi ? "अपने आस-पास देखें और मन में इनका नाम लें:" : "Look around you and silently name:"}
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: T.textSoft, lineHeight: 1.8, listStyleType: "none", padding: 0 }}>
            <li style={{ marginBottom: 8 }}>👀 <strong style={{ color: T.text }}>5</strong> {hi ? "चीजें जो आप देख सकते हैं" : "things you can see"}</li>
            <li style={{ marginBottom: 8 }}>🖐️ <strong style={{ color: T.text }}>4</strong> {hi ? "चीजें जिन्हें आप छू सकते हैं" : "things you can touch"}</li>
            <li style={{ marginBottom: 8 }}>👂 <strong style={{ color: T.text }}>3</strong> {hi ? "चीजें जो आप सुन सकते हैं" : "things you can hear"}</li>
            <li style={{ marginBottom: 8 }}>👃 <strong style={{ color: T.text }}>2</strong> {hi ? "चीजें जिन्हें आप सूंघ सकते हैं" : "things you can smell"}</li>
            <li>👅 <strong style={{ color: T.text }}>1</strong> {hi ? "चीज जिसका आप स्वाद ले सकते हैं" : "thing you can taste"}</li>
          </ul>
        </div>

      </div>
    </div>
  );
}