// ============================================================================
// src/features/khub/MessageBubble.jsx  (V3 — with delete system)
// ============================================================================

import { useEffect, useState } from "react";
import { fetchAuthedImage } from "./moderation";
import { segmentMessage } from "../../utils/musicLinks";
import SafeLinkCard from "./SafeLinkCard";
import { supabase } from "../../supabase";

const FN_DELETE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/khub-delete-message`;

const COPY = {
  en: {
    nsfwHidden:   "Possibly sensitive",
    viewAnyway:   "View anyway",
    hide:         "Hide",
    blocked:      "[Image removed by moderation]",
    expired:      "Image no longer available (older than 60 days)",
    loading:      "Loading…",
    delete:       "🗑 Delete",
    deleteMod:    "🗑 Delete (mod)",
    deleteAdmin:  "🗑 Delete (admin)",
    undo:         "Undo",
    confirmDel:   "Delete this message?",
    yes:          "Yes, delete",
    cancel:       "Cancel",
    reason:       "Reason (required)",
    reasons:      ["Hate speech", "NSFW", "Spam", "Fandom attack", "Piracy", "Other"],
    deleted:      "Message deleted",
    undone:       "Delete undone",
  },
  hi: {
    nsfwHidden:   "संभावित रूप से संवेदनशील",
    viewAnyway:   "फिर भी देखें",
    hide:         "छिपाएँ",
    blocked:      "[मॉडरेशन द्वारा इमेज हटाई गई]",
    expired:      "इमेज अब उपलब्ध नहीं (60 दिन से पुरानी)",
    loading:      "लोड हो रहा है…",
    delete:       "🗑 हटाएं",
    deleteMod:    "🗑 हटाएं (मॉड)",
    deleteAdmin:  "🗑 हटाएं (एडमिन)",
    undo:         "वापस लाएं",
    confirmDel:   "यह मैसेज हटाएं?",
    yes:          "हाँ, हटाएं",
    cancel:       "रद्द करें",
    reason:       "कारण (ज़रूरी)",
    reasons:      ["नफ़रत भाषा", "NSFW", "Spam", "Fandom attack", "Piracy", "अन्य"],
    deleted:      "मैसेज हटा दिया",
    undone:       "डिलीट वापस लिया",
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

  if (error) return (
    <div style={{ padding: 16, background: "#0008", borderRadius: 10, color: "#aaa", fontStyle: "italic", fontSize: 12, textAlign: "center", minHeight: 80 }}>
      {t.expired}
    </div>
  );

  if (!src) return (
    <div style={{ padding: 24, background: "#0006", borderRadius: 10, color: "#aaa", fontSize: 12, textAlign: "center" }}>
      {t.loading}
    </div>
  );

  return (
    <img src={src} alt="" loading="lazy"
      style={{ display: "block", maxWidth: "100%", maxHeight: 320, borderRadius: 10, filter: blurred && !revealed ? "blur(28px)" : "none", transition: "filter 0.25s ease", cursor: blurred ? "pointer" : "default" }}
      onClick={onClick}
    />
  );
}

export default function MessageBubble({
  msg,
  accent = "#A18CD1",
  T,
  lang = "en",
  isMine = false,
  onReport,
  onDeleted,
  currentUserProfile,
  customBubbleStyle,   // optional: override bubble background/border (preserves room styling)
  customRowStyle,      // optional: override the row wrapper style
  senderLabel,         // optional: override the sender name display
}) {
  const t = COPY[lang] ?? COPY.en;
  const [revealed,       setRevealed]       = useState(false);
  const [showMenu,       setShowMenu]       = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [showReasons,    setShowReasons]    = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [deleting,       setDeleting]       = useState(false);
  const [undoState,      setUndoState]      = useState(null);

  const text    = T?.text ?? "#fff";
  const isImage = msg.msg_type === "image" && msg.object_path;
  const blurred = msg.nsfw_state === "blurred";
  const blocked = msg.nsfw_state === "blocked";

  const isAdmin    = currentUserProfile?.is_admin === true;
  const isEliteMod = (currentUserProfile?.trust_level ?? 0) >= 3;
  const canDelete  = isMine || isAdmin || isEliteMod;

  const resolveDeleteType = () => {
    if (isMine)     return "self";
    if (isAdmin)    return "admin";
    if (isEliteMod) return "mod";
    return "self";
  };

  async function performDelete(reason = "") {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const dtype = resolveDeleteType();
      const r = await fetch(FN_DELETE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "delete", message_id: msg.id, delete_type: dtype, reason: reason || null }),
      });
      if (!r.ok) { setDeleting(false); return; }
      onDeleted?.(msg.id);
      setShowConfirm(false);
      setShowReasons(false);
      setShowMenu(false);
      if (dtype === "self") {
        const timer = setTimeout(() => setUndoState(null), 10_000);
        setUndoState({ messageId: msg.id, timer });
      }
    } catch (e) { console.error(e); }
    setDeleting(false);
  }

  async function performUndo() {
    if (!undoState) return;
    clearTimeout(undoState.timer);
    setUndoState(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(FN_DELETE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "undo", message_id: undoState.messageId }),
      });
    } catch (e) { console.error(e); }
  }

  const bubbleStyle = {
    maxWidth: "78%", padding: "10px 14px", borderRadius: 16,
    background: isMine ? `${accent}33` : `${text}11`,
    color: text, border: `1px solid ${isMine ? accent : `${text}22`}`,
    fontSize: 14, lineHeight: 1.4, wordBreak: "break-word",
    alignSelf: isMine ? "flex-end" : "flex-start", position: "relative",
    cursor: canDelete ? "pointer" : "default",
    // customBubbleStyle overrides individual properties (preserves room's exact styling)
    ...customBubbleStyle,
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: 6, ...customRowStyle }}>
        {!isMine && (
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2, marginLeft: 8 }}>
            {senderLabel ?? `${msg.avatar_emoji ?? "🌸"} ${(msg.user_email ?? "").split("@")[0] || "fan"}`}
          </div>
        )}

        <div style={bubbleStyle} onClick={() => canDelete && setShowMenu(!showMenu)}>
          {isImage && !blocked && (
            <div style={{ position: "relative", marginBottom: msg.text ? 8 : 0 }}>
              <AuthedImage object_path={msg.object_path} blurred={blurred} revealed={revealed} t={t} accent={accent} onClick={() => blurred && setRevealed(!revealed)} />
              {blurred && !revealed && (
                <button type="button" onClick={() => setRevealed(true)}
                  style={{ position: "absolute", inset: 0, margin: "auto", width: "fit-content", height: "fit-content", padding: "8px 16px", background: "rgba(0,0,0,0.7)", color: "#fff", border: `1px solid ${accent}`, borderRadius: 999, fontSize: 12, cursor: "pointer" }}>
                  ⚠ {t.nsfwHidden} — {t.viewAnyway}
                </button>
              )}
              {blurred && revealed && (
                <button type="button" onClick={() => setRevealed(false)}
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 999, fontSize: 11, padding: "4px 10px", cursor: "pointer" }}>
                  {t.hide}
                </button>
              )}
            </div>
          )}

          {isImage && blocked && (
            <div style={{ padding: 16, background: "#0008", borderRadius: 10, color: `${text}99`, fontStyle: "italic", fontSize: 13, textAlign: "center" }}>
              {t.blocked}
            </div>
          )}

          {msg.text && (
            <div>
              {segmentMessage(msg.text).map((seg, i) =>
                seg.type === "text"
                  ? <span key={i}>{seg.value}</span>
                  : <SafeLinkCard key={i} link={seg.link} accent={accent} />
              )}
            </div>
          )}

          {!isMine && onReport && !showMenu && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onReport(msg.id); }}
              aria-label="Report message"
              style={{ position: "absolute", top: 4, right: 4, background: "transparent", border: "none", color: `${text}55`, fontSize: 12, cursor: "pointer", padding: 2 }}>
              ⚑
            </button>
          )}

          {showMenu && canDelete && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
              <button type="button"
                onClick={() => {
                  const dtype = resolveDeleteType();
                  if (dtype === "mod" || dtype === "admin") { setShowReasons(true); }
                  else { setShowConfirm(true); }
                  setShowMenu(false);
                }}
                style={{ padding: "4px 10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: 999, fontSize: 12, cursor: "pointer" }}>
                {isMine ? t.delete : isAdmin ? t.deleteAdmin : t.deleteMod}
              </button>
              <button type="button" onClick={() => setShowMenu(false)}
                style={{ padding: "4px 10px", background: "transparent", color: text, border: `1px solid ${text}33`, borderRadius: 999, fontSize: 12, cursor: "pointer" }}>
                {t.cancel}
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", padding: 16 }}
          onClick={() => setShowConfirm(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: T?.bg ?? "#111", color: text, borderRadius: 16, padding: 20, maxWidth: 320, width: "100%", border: `1px solid ${accent}55` }}>
            <p style={{ margin: "0 0 16px", fontSize: 15 }}>{t.confirmDel}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: 10, background: "transparent", color: text, border: `1px solid ${text}33`, borderRadius: 10, cursor: "pointer" }}>
                {t.cancel}
              </button>
              <button type="button" disabled={deleting} onClick={() => performDelete()}
                style={{ flex: 2, padding: 10, background: "#c0392b", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: deleting ? "wait" : "pointer" }}>
                {deleting ? "…" : t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReasons && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", padding: 16 }}
          onClick={() => setShowReasons(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: T?.bg ?? "#111", color: text, borderRadius: 16, padding: 20, maxWidth: 340, width: "100%", border: `1px solid ${accent}55` }}>
            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>{t.reason}</p>
            {t.reasons.map(r => (
              <button key={r} type="button" onClick={() => setSelectedReason(r)}
                style={{ display: "block", width: "100%", marginBottom: 6, padding: "10px 14px", borderRadius: 10, background: selectedReason === r ? `${accent}33` : "transparent", border: `1px solid ${selectedReason === r ? accent : `${text}22`}`, color: text, fontSize: 13, textAlign: "left", cursor: "pointer" }}>
                {r}
              </button>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => setShowReasons(false)}
                style={{ flex: 1, padding: 10, background: "transparent", color: text, border: `1px solid ${text}33`, borderRadius: 10, cursor: "pointer" }}>
                {t.cancel}
              </button>
              <button type="button" disabled={!selectedReason || deleting} onClick={() => performDelete(selectedReason)}
                style={{ flex: 2, padding: 10, background: selectedReason ? "#c0392b" : `${text}22`, color: selectedReason ? "#fff" : `${text}55`, border: "none", borderRadius: 10, fontWeight: 600, cursor: selectedReason && !deleting ? "pointer" : "not-allowed" }}>
                {deleting ? "…" : t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {undoState && (
        <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", borderRadius: 999, padding: "10px 16px", fontSize: 13, zIndex: 1200, display: "flex", gap: 10, alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          <span>{t.deleted}</span>
          <button type="button" onClick={performUndo}
            style={{ background: accent, color: "#fff", border: "none", borderRadius: 999, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {t.undo}
          </button>
        </div>
      )}
    </>
  );
}
