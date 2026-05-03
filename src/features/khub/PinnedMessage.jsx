// ============================================================================
// src/features/khub/PinnedMessage.jsx
// ============================================================================
// Shows a pinned message banner at the top of each room.
// Admins can pin any text message by tapping it → Pin button.
// Only one pinned message per room at a time.
// ============================================================================

import { useState } from "react";

export default function PinnedMessage({ text, accent = "#A18CD1", T }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const textColor = T?.text ?? "#fff";
  const bg = T?.bg ?? "#0a0a0a";

  const isLong = text.length > 80;
  const displayText = !expanded && isLong ? text.slice(0, 80) + "…" : text;

  return (
    <div
      onClick={() => isLong && setExpanded(prev => !prev)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "8px 14px",
        background: `${accent}12`,
        borderBottom: `1px solid ${accent}25`,
        cursor: isLong ? "pointer" : "default",
      }}
    >
      {/* Pin icon */}
      <span style={{ fontSize: "13px", flexShrink: 0, marginTop: "2px", opacity: 0.8 }}>
        📌
      </span>

      {/* Message text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 600,
          color: accent,
          letterSpacing: "0.5px",
          marginBottom: "2px",
          fontFamily: "'DM Sans', sans-serif",
          textTransform: "uppercase",
          opacity: 0.8,
        }}>
          Pinned
        </div>
        <div style={{
          fontSize: "13px",
          color: textColor,
          lineHeight: 1.5,
          fontFamily: "'DM Sans', sans-serif",
          opacity: 0.9,
        }}>
          {displayText}
          {isLong && (
            <span style={{ color: accent, marginLeft: "4px", fontSize: "12px" }}>
              {expanded ? " show less" : " show more"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
