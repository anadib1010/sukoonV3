import React, { useState, useEffect, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';
import { creditSession } from '../../utils/activity';

// Local helper to track how many times the user has sent warmth (for the Progress screen)
const creditMetta = () => {
  try {
    const count = parseInt(localStorage.getItem("jsukoon_metta_count") || "0");
    localStorage.setItem("jsukoon_metta_count", (count + 1).toString());
  } catch {}
};

function MettaCircles({ T, lang }) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState([]);
  const [done, setDone] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState("");
  const [micBlocked, setMicBlocked] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const getBestMime = () => {
    if (isMobile) {
      const mobile = ["audio/ogg;codecs=opus", "audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
      return mobile.find(t => MediaRecorder.isTypeSupported(t)) || "";
    } else {
      const desktop = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
      return desktop.find(t => MediaRecorder.isTypeSupported(t)) || "";
    }
  };

  const CIRCLES = [
    { label:lang==="Hindi"?"स्वयं":"Yourself",         sub:lang==="Hindi"?"केंद्र से शुरू करें":"Start at the center",     color:"#C88A8E", r:30 },
    { label:lang==="Hindi"?"प्रिय लोग":"Loved ones",   sub:lang==="Hindi"?"जो आपके करीब हैं":"Those closest to you",       color:"#D4A373", r:60 },
    { label:lang==="Hindi"?"परिचित":"Acquaintances",   sub:lang==="Hindi"?"जिन्हें आप जानते हैं":"People you know",         color:"#7A9EA8", r:90 },
    { label:lang==="Hindi"?"अजनबी":"Strangers",        sub:lang==="Hindi"?"अनजान लोग":"Those you have never met",           color:"#8aaa7a", r:120 },
    { label:lang==="Hindi"?"कठिन लोग":"Difficult ones",sub:lang==="Hindi"?"जो कठिन लगते हैं":"Those who challenge you",    color:"#726FBA", r:150 },
  ];

  const startRecording = async () => {
    setMicBlocked(false);
    setShareError("");
    try {
      if (navigator.permissions) {
        const perm = await navigator.permissions.query({ name: "microphone" });
        if (perm.state === "denied") { setMicBlocked(true); return; }
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mime = getBestMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const finalMime = mr.mimeType || mime || "audio/webm";
        const ext = finalMime.includes("ogg") ? "ogg" : finalMime.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(chunksRef.current, { type: finalMime });
        blob._ext = ext;
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };
      mr.start();
      setIsRecording(true);
    } catch(e) {
      if (e.name === "NotAllowedError") setMicBlocked(true);
      else setShareError(lang==="Hindi"?"माइक्रोफ़ोन उपलब्ध नहीं।":"Microphone unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const generateWarmthImage = (recipient, sender) => new Promise((resolve) => {
    const W = 800, H = 800;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const CIRCLES_DEF = [
      { color:"#C88A8E", r:60,  label:lang==="Hindi"?"स्वयं":"Yourself" },
      { color:"#D4A373", r:120, label:lang==="Hindi"?"प्रिय लोग":"Loved ones" },
      { color:"#7A9EA8", r:180, label:lang==="Hindi"?"परिचित":"Acquaintances" },
      { color:"#8aaa7a", r:240, label:lang==="Hindi"?"अजनबी":"Strangers" },
      { color:"#726FBA", r:300, label:lang==="Hindi"?"कठिन लोग":"Difficult ones" },
    ];

    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 320);
    glow.addColorStop(0, "rgba(212,163,115,0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    [...CIRCLES_DEF].reverse().forEach(c => {
      ctx.beginPath();
      ctx.arc(W/2, H/2 + 30, c.r, 0, Math.PI * 2);
      ctx.strokeStyle = c.color + "70";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = c.color + "10";
      ctx.fill();
    });

    const cx = W/2, cy = H/2 + 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#C88A8E50";
    ctx.fill();
    ctx.strokeStyle = "#C88A8E";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText("🫀", cx, cy);

    ctx.font = "500 15px sans-serif";
    ctx.fillStyle = "#ffffff40";
    ctx.textAlign = "center";
    ctx.fillText("JSukoon  •  jsukoon.vercel.app", W/2, 42);

    const displayName = recipient || (lang==="Hindi"?"आपको":"You");
    ctx.font = "300 52px Georgia, serif";
    ctx.fillStyle = "#D4A373";
    ctx.textAlign = "center";
    ctx.fillText(displayName, W/2, 118);

    const msg = lang==="Hindi" ? "को प्रेम, शांति और सुख मिले।" : "May you be at peace. May you be well.";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillStyle = "#ffffff90";
    ctx.fillText(msg, W/2, 158);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#ffffff50";
    const fromText = sender
      ? (lang==="Hindi" ? `— ${sender} की ओर से 💛` : `— with love from ${sender} 💛`)
      : "— from JSukoon 💛";
    ctx.fillText(fromText, W/2, H - 52);

    ctx.strokeStyle = "#D4A37340";
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    canvas.toBlob(blob => resolve(blob), "image/png");
  });

  const shareWarmth = async () => {
    setShareError("");
    const recipient = recipientName.trim() || (lang==="Hindi"?"आपको":"you");
    const sender = senderName.trim();
    const fromPart = sender
      ? (lang==="Hindi" ? ` — ${sender} की ओर से` : ` — with love from ${sender}`)
      : (lang==="Hindi" ? " — JSukoon से" : " — from JSukoon");
    const text = lang==="Hindi"
      ? `💛 ${recipient} के लिए गर्माहट का संदेश${fromPart}\n\n✨ JSukoon से भेजा गया — jsukoon.vercel.app पर आएं`
      : `💛 A message of warmth for ${recipient}${fromPart}\n\n✨ Sent with JSukoon — find your sukoon at jsukoon.vercel.app`;

    const safeRecipient = recipient.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);

    const imgBlob = await generateWarmthImage(recipient, sender);
    const imgURL = URL.createObjectURL(imgBlob);
    setImageURL(imgURL);
    const imgFile = new File([imgBlob], `warmth-for-${safeRecipient}.png`, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [imgFile] })) {
      try {
        await navigator.share({ files: [imgFile], text });
        setShared(true);
        return;
      } catch(e) {
        if (e.name === "AbortError") return;
      }
    }

    const a = document.createElement("a");
    a.href = imgURL;
    a.download = `warmth-for-${safeRecipient}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShared(true);
  };

  const sendWarmth = () => {
    setGlowing(true);
    if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    setTimeout(() => {
      setGlowing(false);
      setSent(p => [...p, step]);
      if (step < CIRCLES.length - 1) setStep(s => s + 1);
      else { setDone(true); creditSession(4); creditMetta(); }
    }, 800);
  };

  const reset = () => {
    setStep(0); setSent([]); setDone(false); setGlowing(false);
    setRecipientName(""); setSenderName("");
    setAudioBlob(null); setAudioURL(null); setImageURL(null);
    setShared(false); setShareError(""); setMicBlocked(false);
  };

  const current = CIRCLES[step];

  if (done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>💛</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>
        {lang==="Hindi"?"गर्माहट फैल गई।":"Warmth has spread."}
      </h3>
      <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.7, margin:"0 auto 20px", maxWidth:260 }}>
        {lang==="Hindi"?"आपने खुद से शुरू करके सबको प्रेम दिया। यह साहस है।":"You sent warmth from yourself outward to all. That is courage."}
      </p>

      <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", marginBottom:20, textAlign:"left" }}>
        <p style={{ fontSize:11, color:T.accent, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 12px", fontWeight:500 }}>
          💛 {lang==="Hindi"?"किसी को भेजें":"Send to someone"}
        </p>

        <input
          value={recipientName}
          onChange={e => setRecipientName(e.target.value)}
          placeholder={lang==="Hindi"?"किसे भेजना है? नाम या रिश्ता…":"Who is this for? (e.g. Mum, best friend)"}
          style={{ width:"100%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", marginBottom:8, boxSizing:"border-box" }}
        />
        <input
          value={senderName}
          onChange={e => setSenderName(e.target.value)}
          placeholder={lang==="Hindi"?"आपका नाम (वैकल्पिक)":"Your name (optional)"}
          style={{ width:"100%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", marginBottom:12, boxSizing:"border-box" }}
        />

        {micBlocked ? (
          <div style={{ background:"rgba(224,102,102,0.1)", border:"1px solid #e0666640", borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
            <p style={{ fontSize:13, color:"#e06666", margin:0, lineHeight:1.6 }}>
              {lang==="Hindi"
                ? "माइक्रोफ़ोन की अनुमति नहीं है। ब्राउज़र के address bar में 🔒 आइकन पर क्लिक करके माइक्रोफ़ोन चालू करें।"
                : "Microphone blocked. Click the 🔒 icon in your browser address bar → allow microphone → come back here."}
            </p>
          </div>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{ width:"100%", background:isRecording?"rgba(224,102,102,0.15)":T.surface, border:`1px solid ${isRecording?"#e06666":T.border}`, borderRadius:12, padding:"11px", color:isRecording?"#e06666":T.textSoft, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:audioURL?10:12, boxSizing:"border-box" }}
          >
            {isRecording
              ? `🛑 ${lang==="Hindi"?"रिकॉर्डिंग रोकें":"Stop recording"}`
              : audioURL
              ? `🔄 ${lang==="Hindi"?"फिर से रिकॉर्ड करें":"Re-record message"}`
              : `🎙️ ${lang==="Hindi"?"आवाज़ में संदेश रिकॉर्ड करें":"Record a voice message"}`}
          </button>
        )}

        {audioURL && (
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:11, color:T.muted, margin:"0 0 6px" }}>
              {lang==="Hindi"?"सुनें:":"Preview:"}
            </p>
            <audio controls src={audioURL} style={{ width:"100%", height:36 }} />
          </div>
        )}

        {shareError && (
          <p style={{ fontSize:12, color:"#e06666", margin:"0 0 8px", textAlign:"center" }}>{shareError}</p>
        )}

        {(audioURL || recipientName.trim()) && !micBlocked && (
          <button
            onClick={shareWarmth}
            style={{ width:"100%", background:`${T.accent}18`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:14, fontWeight:500, padding:"12px", borderRadius:12, boxSizing:"border-box" }}
          >
            {shared
              ? (lang==="Hindi"?"✓ भेज दिया / डाउनलोड हुआ":"✓ Shared / Downloaded!")
              : (lang==="Hindi"?"💛 गर्माहट साझा करें":"💛 Share this warmth")}
          </button>
        )}

        {shared && (
          <p style={{ fontSize:11, color:T.muted, textAlign:"center", marginTop:8, lineHeight:1.6 }}>
            {isMobile
              ? (lang==="Hindi"?"📱 WhatsApp से भेजें।":"📱 Choose WhatsApp from the share sheet.")
              : (lang==="Hindi"?"💻 ऑडियो फ़ाइल डाउनलोड हुई। WhatsApp Web खोलें → अटैचमेंट → फ़ाइल चुनें।":"💻 Audio file downloaded. Open WhatsApp Web → attachment → choose the file.")}
          </p>
        )}
      </div>

      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>
        {lang==="Hindi"?"फिर से करें":"Begin again"}
      </button>
    </div>
  );

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px" }}>
      {step === 1 && (
        <div style={{ marginBottom:16 }}>
          <input
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            placeholder={lang==="Hindi"?"किसका नाम सोच रहे हैं? (वैकल्पिक)":"Who are you thinking of? (optional)"}
            style={{ width:"100%", background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}
          />
        </div>
      )}
      <div style={{ position:"relative", height:180, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        {[...CIRCLES].reverse().map((c,i) => {
          const idx = CIRCLES.length-1-i;
          const isSent = sent.includes(idx);
          const isCurrent = idx === step;
          return (
            <div key={i} style={{ position:"absolute", width:c.r*2, height:c.r*2, borderRadius:"50%", border:`1.5px solid ${isSent||isCurrent?c.color+"80":T.border}`, background:isSent?`${c.color}12`:"transparent", transition:"all 0.6s ease", boxShadow:isCurrent&&glowing?`0 0 20px ${c.color}50`:"none" }} />
          );
        })}
        <div style={{ position:"absolute", width:30, height:30, borderRadius:"50%", background:`${CIRCLES[0].color}40`, border:`2px solid ${CIRCLES[0].color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🫀</div>
      </div>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <p style={{ fontSize:12, color:T.textSoft, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>
          {lang==="Hindi"?"अभी भेजें":"Sending warmth to"}
        </p>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:current.color, fontWeight:400, marginBottom:4 }}>
          {step===1 && recipientName.trim() ? recipientName.trim() : current.label}
        </h3>
        <p style={{ fontSize:12, color:T.muted }}>{current.sub}</p>
      </div>
      <div style={{ background:T.surfaceAlt, borderRadius:14, padding:"12px 16px", marginBottom:20, textAlign:"center" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:14, color:T.textSoft, lineHeight:1.7, margin:0 }}>
          {lang==="Hindi"
            ? `"${step===1&&recipientName.trim()?recipientName.trim():current.label} को प्रेम, शांति और सुख मिले।"`
            : `"May ${step===1&&recipientName.trim()?recipientName.trim():current.label.toLowerCase()} be at peace. May they be well."`}
        </p>
      </div>
      <button onClick={sendWarmth} style={{ width:"100%", background:glowing?`${current.color}35`:`${current.color}18`, border:`1px solid ${current.color}50`, color:current.color, fontSize:14, fontWeight:500, padding:"13px", borderRadius:14, transition:"all 0.3s ease", boxShadow:glowing?`0 0 20px ${current.color}40`:"none" }}>
        {glowing
          ? (lang==="Hindi"?"भेज रहे हैं…":"Sending…")
          : (lang==="Hindi"?"गर्माहट भेजें 💛":"Send Warmth 💛")}
      </button>
      <p style={{ fontSize:12, color:T.textSoft, textAlign:"center", marginTop:10, letterSpacing:1, textTransform:"uppercase", opacity:.6 }}>
        {lang==="Hindi"?`${step+1} / ${CIRCLES.length}`:`${step+1} of ${CIRCLES.length}`}
      </p>
    </div>
  );
}

export function WarmthPage({ setTab, goBack, T, lang }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
        <div style={{ padding:"16px 18px" }}>
          <MettaCircles T={T} lang={lang} />
        </div>
      </div>
    </div>
  );
}