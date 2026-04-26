// ============================================================================
// src/features/khub/MessageBubble.jsx  (V2 — auth-gated image fetch)
// ============================================================================

import { useEffect, useState } from "react";
import { fetchAuthedImage } from "./moderation";
import { segmentMessage } from "../../utils/musicLinks";
import SafeLinkCard from "./SafeLinkCard";

const COPY = {
  en: {
    nsfwHidden: "Possibly sensitive",
    viewAnyway: "View anyway",
    hide:       "Hide",
    blocked:    "[Image removed by moderation]",
    expired:    "Image no longer available (older than 60 days)",
    loading:    "Loading…",
  },
  hi: {
    nsfwHidden: "संभावित रूप से संवेदनशील",
    viewAnyway: "फिर भी देखें",
    hide:       "छिपाएँ",
    blocked:    "[मॉडरेशन द्वारा इमेज हटाई गई]",
    expired:    "इमेज अब उपलब्ध नहीं (60 दिन से पुरानी)",
    loading:    "लोड हो रहा है…",
  },
};

function AuthedImage({ object_path, blurred, revealed, t, accent, onClick }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = await fetchAuthedImage(object_path);
        if (!cancelled) setSrc(url);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [object_path]);

  if (error) {
    return (
      <div style={{
        padding: 16, background: "#0008", borderRadius: 10,
        color: "#aaa", fontStyle: "italic", fontSize: 12,
        textAlign: "center", minHeight: 80,
      }}>
        {t.expired}
      </div>
    );
  }

  if (!src) {
    return (
      <div style={{
        padding: 24, background: "#0006", borderRadius: 10,
        color: "#aaa", fontSize: 12, textAlign: "center",
      }}>
        {t.loading}
      </div>
    );
  }

  return (
    <img
      src={src} alt="" loading="lazy"
      style={{
        display: "block", maxWidth: "100%", maxHeight: 320,
        borderRadius: 10,
        filter: blurred && !revealed ? "blur(28px)" : "none",
        transition: "filter 0.25s ease",
        cursor: blurred ? "pointer" : "default",
      }}
      onClick={onClick}
    />
  );
}

export default function MessageBubble({
  msg, accent = "#A18CD1", T, lang = "en", isMine = false, onReport,
}) {
  const t = COPY[lang] ?? COPY.en;
  const [revealed, setRevealed] = useState(false);

  const text = T?.text ?? "#fff";
  const isImage = msg.msg_type === "image" && msg.object_path;
  const blurred = msg.nsfw_state === "blurred";
  const blocked = msg.nsfw_state === "blocked";

  const bubbleStyle = {
    maxWidth: "78%", padding: "10px 14px", borderRadius: 16,
    background: isMine ? `${accent}33` : `${text}11`,
    color: text, border: `1px solid ${isMine ? accent : `${text}22`}`,
    fontSize: 14, lineHeight: 1.4, wordBreak: "break-word",
    alignSelf: isMine ? "flex-end" : "flex-start", position: "relative",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isMine ? "flex-end" : "flex-start",
      marginBottom: 6,
    }}>
      {!isMine && (
        <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2, marginLeft: 8 }}>
          {msg.avatar_emoji ?? "🌸"} {(msg.user_email ?? "").split("@")[0] || "fan"}
        </div>
      )}

      <div style={bubbleStyle}>
        {isImage && !blocked && (
          <div style={{ position: "relative", marginBottom: msg.text ? 8 : 0 }}>
            <AuthedImage
              object_path={msg.object_path}
              blurred={blurred} revealed={revealed}
              t={t} accent={accent}
              onClick={() => blurred && setRevealed(!revealed)}
            />
            {blurred && !revealed && (
              <button
                type="button" onClick={() => setRevealed(true)}
                style={{
                  position: "absolute", inset: 0, margin: "auto",
                  width: "fit-content", height: "fit-content",
                  padding: "8px 16px", background: "rgba(0,0,0,0.7)",
                  color: "#fff", border: `1px solid ${accent}`,
                  borderRadius: 999, fontSize: 12, cursor: "pointer",
                }}
              >
                ⚠ {t.nsfwHidden} — {t.viewAnyway}
              </button>
            )}
            {blurred && revealed && (
              <button
                type="button" onClick={() => setRevealed(false)}
                style={{
                  position: "absolute", top: 8, right: 8,
                  background: "rgba(0,0,0,0.6)", color: "#fff",
                  border: "none", borderRadius: 999, fontSize: 11,
                  padding: "4px 10px", cursor: "pointer",
                }}
              >
                {t.hide}
              </button>
            )}
          </div>
        )}

        {isImage && blocked && (
          <div style={{
            padding: 16, background: "#0008", borderRadius: 10,
            color: `${text}99`, fontStyle: "italic", fontSize: 13,
            textAlign: "center",
          }}>
            {t.blocked}
          </div>
        )}

        {msg.text && (
          <div>
            {segmentMessage(msg.text).map((seg, i) =>
              seg.type === "text" ? (
                <span key={i}>{seg.value}</span>
              ) : (
                <SafeLinkCard key={i} link={seg.link} accent={accent} />
              )
            )}
          </div>
        )}

        {!isMine && onReport && (
          <button
            type="button" onClick={() => onReport(msg.id)}
            aria-label="Report message"
            style={{
              position: "absolute", top: 4, right: 4,
              background: "transparent", border: "none",
              color: `${text}55`, fontSize: 12,
              cursor: "pointer", padding: 2,
            }}
          >
            ⚑
          </button>
        )}
      </div>
    </div>
  );
}
