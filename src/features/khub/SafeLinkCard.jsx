// ============================================================================
// src/features/khub/SafeLinkCard.jsx
// ============================================================================
// Renders a Spotify or YouTube link as a compact card. NO metadata fetch —
// title is hardcoded from URL path. This is the WhatsApp/Discord pattern:
// safe under copyright because we display only what the user typed + a
// thumbnail provided by the platform itself (YouTube's hqdefault is OK to use).
// ============================================================================

export default function SafeLinkCard({ link, accent = "#A18CD1" }) {
  const isYT = link.kind === "youtube";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 8,
        marginTop: 6,
        borderRadius: 10,
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${accent}55`,
        textDecoration: "none",
        color: "inherit",
        maxWidth: 320,
      }}
    >
      {isYT ? (
        <img
          src={link.thumb}
          alt=""
          loading="lazy"
          width={64}
          height={48}
          style={{
            borderRadius: 6,
            objectFit: "cover",
            flexShrink: 0,
            background: "#000",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: 48, height: 48,
            borderRadius: 6,
            background: "#1DB954",
            display: "grid", placeItems: "center",
            color: "#fff", fontSize: 22, fontWeight: 800,
            flexShrink: 0,
          }}
        >
          ♫
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 2 }}>
          {isYT ? "YouTube" : "Spotify"}
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {link.title}
        </div>
        <div style={{
          fontSize: 11, opacity: 0.55,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {new URL(link.url).hostname}
        </div>
      </div>
    </a>
  );
}
