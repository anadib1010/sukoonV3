// ============================================================================
// src/features/khub/RulesGate.jsx
// ============================================================================
// Forced rules acceptance for K-Hub rooms. Wraps the chat content so users
// MUST tap "I Agree" before they can send. Persists to:
//   - localStorage  (jsukoon_khub_rules_accepted_v1)  → fast UX
//   - khub_rules_accepted table                       → legal proof
//
// Usage (in each room component):
//   import RulesGate from "./RulesGate";
//   ...
//   return (
//     <RulesGate lang={lang} T={T} accent="#A18CD1">
//       {/* existing room JSX */}
//     </RulesGate>
//   );
// ============================================================================

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const STORAGE_KEY = "jsukoon_khub_rules_accepted_v1";
const RULES_VERSION = 1;

const COPY = {
  en: {
    title: "House rules",
    intro: "K-Hub is a fan space — be kind, stay legal.",
    hard: "Hard rules (auto-blocked, -10 to -20 reputation):",
    hardList: [
      "No hate speech, slurs, or personal attacks",
      "No fandom wars (BTS vs BLACKPINK style)",
      "No NSFW content — text or image",
      "No piracy links, leaks, or copyrighted full songs",
      "No insulting artists' looks, voices, or families",
    ],
    soft: "Soft rules (warnings, then mute):",
    softList: [
      "No spam or flooding (5 messages / 10 sec)",
      "No self-promotion outside dedicated threads",
      "Stay on topic for the room",
    ],
    legal: "JSukoon is unofficial. Not affiliated with HYBE, YG, SM, JYP, or any artist or label.",
    agree: "I understand and agree",
    decline: "Leave",
  },
  hi: {
    title: "नियम",
    intro: "K-Hub एक फ़ैन स्पेस है — दयालु रहें, क़ानूनी रहें।",
    hard: "कड़े नियम (ऑटो-ब्लॉक, -10 से -20 प्रतिष्ठा):",
    hardList: [
      "कोई नफ़रत भाषण, गाली या व्यक्तिगत हमला नहीं",
      "फ़ैनडम वॉर नहीं (BTS vs BLACKPINK जैसे)",
      "कोई NSFW कंटेंट नहीं — टेक्स्ट या इमेज",
      "कोई पाइरेसी लिंक, लीक या कॉपीराइटेड पूरे गाने नहीं",
      "कलाकारों के दिखावे, आवाज़ या परिवार पर अपमान नहीं",
    ],
    soft: "नर्म नियम (चेतावनी, फिर म्यूट):",
    softList: [
      "कोई स्पैम नहीं (5 मैसेज / 10 सेकंड)",
      "अपने प्रोजेक्ट का प्रचार सिर्फ़ निर्धारित जगह पर",
      "रूम के विषय पर रहें",
    ],
    legal: "JSukoon अनौपचारिक है। HYBE, YG, SM, JYP, या किसी कलाकार/लेबल से संबंधित नहीं।",
    agree: "मैं समझता/समझती हूँ और सहमत हूँ",
    decline: "बाहर जाएँ",
  },
};

export default function RulesGate({ children, lang = "en", T, accent = "#A18CD1" }) {
  const t = COPY[lang] ?? COPY.en;
  const [accepted, setAccepted] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === String(RULES_VERSION);
    } catch { return false; }
  });

  // Verify against server on mount (handles cleared localStorage)
  useEffect(() => {
    if (accepted) return;
    let cancel = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("khub_rules_accepted")
        .select("version")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!cancel && data && data.version >= RULES_VERSION) {
        try { localStorage.setItem(STORAGE_KEY, String(RULES_VERSION)); } catch {}
        setAccepted(true);
      }
    })();
    return () => { cancel = true; };
  }, [accepted]);

  async function accept() {
    try { localStorage.setItem(STORAGE_KEY, String(RULES_VERSION)); } catch {}
    setAccepted(true);

    // best-effort server record (don't block UX on failure)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from("khub_rules_accepted")
        .upsert(
          { user_id: session.user.id, version: RULES_VERSION, accepted_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
    }
  }

  function decline() {
    // navigate back; KHub selector or home
    if (typeof window !== "undefined") {
      window.history.length > 1 ? window.history.back() : (window.location.href = "/");
    }
  }

  if (accepted) return children;

  const text = T?.text ?? "#fff";
  const bg   = T?.bg   ?? "#000";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 800,
      background: "rgba(0,0,0,0.85)",
      display: "grid", placeItems: "center", padding: 16,
      overflow: "auto",
    }}>
      <div style={{
        background: bg, color: text,
        borderRadius: 16,
        maxWidth: 480, width: "100%",
        padding: 20,
        border: `1px solid ${accent}66`,
        boxShadow: `0 10px 40px ${accent}33`,
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <h2 style={{ margin: 0, color: accent, fontSize: 20 }}>{t.title}</h2>
        <p style={{ marginTop: 8, opacity: 0.85, fontSize: 14 }}>{t.intro}</p>

        <h3 style={{ fontSize: 13, marginTop: 16, marginBottom: 6, color: accent }}>{t.hard}</h3>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.6 }}>
          {t.hardList.map((line, i) => <li key={i}>{line}</li>)}
        </ul>

        <h3 style={{ fontSize: 13, marginTop: 14, marginBottom: 6, color: accent }}>{t.soft}</h3>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.6 }}>
          {t.softList.map((line, i) => <li key={i}>{line}</li>)}
        </ul>

        <p style={{
          marginTop: 16, fontSize: 11, opacity: 0.65,
          padding: "8px 10px", borderRadius: 8,
          background: `${text}08`, border: `1px solid ${text}15`,
        }}>
          {t.legal}
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={decline}
            style={{
              flex: 1, padding: "12px",
              background: "transparent",
              color: text,
              border: `1px solid ${text}33`,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={accept}
            style={{
              flex: 2, padding: "12px",
              background: accent,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t.agree}
          </button>
        </div>
      </div>
    </div>
  );
}
