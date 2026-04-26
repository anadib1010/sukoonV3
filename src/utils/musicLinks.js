// ============================================================================
// src/utils/musicLinks.js
// ============================================================================
// URL detection + sanitization for K-Hub chat.
// Allow-list: spotify.com, open.spotify.com, youtube.com, youtu.be, music.youtube.com.
// Anything else → render as plain text (we do NOT linkify foreign domains).
// We never fetch metadata from those sites — just parse the URL itself.
// ============================================================================

const URL_RE = /https?:\/\/[^\s<>"']+/gi;

const ALLOWED = {
  spotify:    /^(open\.|www\.)?spotify\.com$/i,
  youtube:    /^(www\.|m\.|music\.)?youtube\.com$/i,
  youtu_be:   /^youtu\.be$/i,
};

function detectKind(host) {
  if (ALLOWED.spotify.test(host))  return "spotify";
  if (ALLOWED.youtube.test(host))  return "youtube";
  if (ALLOWED.youtu_be.test(host)) return "youtube";
  return null;
}

/**
 * Parses a single URL string, returns { kind, url, title } or null if not allow-listed.
 * `title` is derived from the URL path only (no network fetch, copyright-safe).
 */
export function parseMusicLink(raw) {
  let u;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const kind = detectKind(u.hostname);
  if (!kind) return null;

  // Sanitize URL — strip query params except essentials, drop fragments
  if (kind === "spotify") {
    // expected: /track/:id, /album/:id, /playlist/:id, /artist/:id
    const segs = u.pathname.split("/").filter(Boolean);
    if (segs.length < 2) return null;
    const [type, id] = segs;
    if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return null;
    if (!["track", "album", "playlist", "artist", "episode", "show"].includes(type)) return null;
    return {
      kind: "spotify",
      subType: type,
      url: `https://open.spotify.com/${type}/${id}`,
      title: `Spotify ${type}`,
    };
  }

  if (kind === "youtube") {
    let id = null;
    if (u.hostname === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (u.pathname === "/watch") {
      id = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/shorts/")) {
      id = u.pathname.split("/")[2];
    } else if (u.pathname.startsWith("/embed/")) {
      id = u.pathname.split("/")[2];
    }
    if (!id || !/^[A-Za-z0-9_-]{8,15}$/.test(id)) return null;
    return {
      kind: "youtube",
      url: `https://www.youtube.com/watch?v=${id}`,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      title: "YouTube video",
    };
  }

  return null;
}

/**
 * Splits a message into an array of segments:
 *   [{ type: 'text', value }, { type: 'link', link }, ...]
 * Only allow-listed links become 'link' segments. Everything else (other URLs
 * included) stays inside 'text' segments and gets rendered as plain text.
 */
export function segmentMessage(text) {
  if (!text) return [];
  const segments = [];
  let last = 0;
  const matches = text.matchAll(URL_RE);
  for (const m of matches) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > last) segments.push({ type: "text", value: text.slice(last, start) });
    const link = parseMusicLink(m[0]);
    if (link) {
      segments.push({ type: "link", link });
    } else {
      // foreign URL — render as plain text (no clickable href)
      segments.push({ type: "text", value: m[0] });
    }
    last = end;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  return segments;
}
