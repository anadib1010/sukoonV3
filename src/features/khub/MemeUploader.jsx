// ============================================================================
// src/features/khub/MemeUploader.jsx  (V2 — Oracle-backed)
// ============================================================================

import { useRef, useState } from "react";
import { uploadAndSendMeme } from "./moderation";

const COPY = {
  en: {
    pick:        "📷 Meme",
    sending:     "Sending…",
    cancel:      "Cancel",
    send:        "Send meme",
    captionPh:   "Caption (optional)",
    tooLarge:    "Image too large. Max 4 MB.",
    notImage:    "Please pick an image file.",
    blocked:     "This image was blocked as NSFW. -20 reputation.",
    blurred:     "Image was flagged. It will be sent blurred.",
    newAccount:  "New accounts can't share memes for the first 15 minutes.",
    rateLimit:   "Slow down — 10 image uploads per hour.",
    networkErr:  "Couldn't reach the server. Try again.",
    nsfwDown:    "Image safety check is busy. Try again in a moment.",
  },
  hi: {
    pick:        "📷 मीम",
    sending:     "भेजा जा रहा है…",
    cancel:      "रद्द करें",
    send:        "मीम भेजें",
    captionPh:   "कैप्शन (वैकल्पिक)",
    tooLarge:    "इमेज बहुत बड़ी है। अधिकतम 4 MB।",
    notImage:    "कृपया एक इमेज फ़ाइल चुनें।",
    blocked:     "यह इमेज NSFW के रूप में ब्लॉक की गई। -20 प्रतिष्ठा।",
    blurred:     "इमेज को फ़्लैग किया गया। यह धुंधली भेजी जाएगी।",
    newAccount:  "नए अकाउंट पहले 15 मिनट तक मीम शेयर नहीं कर सकते।",
    rateLimit:   "थोड़ा रुकिए — एक घंटे में 10 अपलोड।",
    networkErr:  "सर्वर से कनेक्ट नहीं हो सका। दोबारा कोशिश करें।",
    nsfwDown:    "इमेज सेफ्टी चेक व्यस्त है। एक पल में दोबारा कोशिश करें।",
  },
};

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_DIM = 1280;
const JPEG_QUALITY = 0.82;

async function compressImage(file) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result); r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i); i.onerror = rej;
    i.src = dataUrl;
  });
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", JPEG_QUALITY)
  );
}

export default function MemeUploader({
  room, roomName, accent = "#A18CD1", avatarEmoji = "🌸",
  T, lang = "en", onSent, onToast, disabled,
}) {
  const t = COPY[lang] ?? COPY.en;
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const toast = (msg, kind = "info") => onToast?.(msg, kind);

  async function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast(t.notImage, "error");
    if (file.size > MAX_BYTES * 2) return toast(t.tooLarge, "error");

    let blob;
    try { blob = await compressImage(file); }
    catch { blob = file; }
    if (blob.size > MAX_BYTES) return toast(t.tooLarge, "error");

    setPreview({ url: URL.createObjectURL(blob), blob, name: file.name });
  }

  function reset() {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setCaption("");
    setBusy(false);
    setErrorMsg(null);
  }

  async function send() {
    if (!preview || busy) return;
    setBusy(true);
    try {
      const result = await uploadAndSendMeme({
        room,
        roomName,
        blob: preview.blob,
        caption: caption.trim().slice(0, 500),
        avatarEmoji,
      });
      if (result.nsfw_state === "blurred") toast(t.blurred, "warn");
      reset();
      onSent?.();
    } catch (err) {
      setBusy(false);
      let errText;
      switch (err.code) {
        case "nsfw_blocked":          errText = t.blocked; break;
        case "new_account_no_images": errText = t.newAccount; break;
        case "rate_limited":          errText = t.rateLimit; break;
        case "nsfw_check_failed":
        case "storage_failed":        errText = t.nsfwDown; break;
        default:                      errText = err.message || t.networkErr;
      }
      setErrorMsg(errText);
      toast(errText, "error");
    }
  }
  
  const text = T?.text ?? "#fff";
  const bg = T?.bg ?? "#000";

  return (
    <>
      {!preview && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled || busy}
            aria-label={t.pick}
            style={{
              background: "transparent",
              border: `1px solid ${accent}55`,
              color: accent, borderRadius: 999,
              padding: "8px 12px", fontSize: 13,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
            }}
          >
            {t.pick}
          </button>
          <input
            ref={fileRef} type="file" accept="image/*"
            onChange={onPick} style={{ display: "none" }}
          />
        </>
      )}

      {preview && (
        <div
          role="dialog" aria-modal="true"
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            display: "grid", placeItems: "center", padding: 16,
          }}
          onClick={busy ? undefined : reset}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: bg, color: text, borderRadius: 16,
              maxWidth: 420, width: "100%", padding: 16,
              border: `1px solid ${accent}66`,
              boxShadow: `0 10px 40px ${accent}33`,
            }}
          >
            <img src={preview.url} alt=""
              style={{
                width: "100%", maxHeight: "50vh",
                objectFit: "contain", borderRadius: 8, background: "#0006",
              }}
            />
            {errorMsg && (
              <div style={{
                marginTop: 10,
                padding: "10px 12px",
                background: "#c0392b",
                color: "#fff",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.4,
                textAlign: "center",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                ⚠️ {errorMsg}
              </div>
            )}
            <input
              type="text" value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 500))}
              placeholder={t.captionPh} disabled={busy}
              style={{
                width: "100%", marginTop: 12,
                background: "transparent", color: text,
                border: `1px solid ${accent}55`, borderRadius: 10,
                padding: "10px 12px", fontSize: 14,
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button" onClick={reset} disabled={busy}
                style={{
                  flex: 1, padding: "10px", background: "transparent",
                  color: text, border: `1px solid ${text}33`,
                  borderRadius: 10, cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                {t.cancel}
              </button>
              <button
                type="button" onClick={send} disabled={busy}
                style={{
                  flex: 2, padding: "10px", background: accent,
                  color: "#fff", border: "none", borderRadius: 10,
                  fontWeight: 600, cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy ? t.sending : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
