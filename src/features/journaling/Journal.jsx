import posthog from 'posthog-js';
import React, { useState, useEffect, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';
import { readEmotionalCtx, clearEmotionalCtx } from '../../utils/context';
import { supabase } from '../../supabase';
import { CRISIS_WORDS, CRISIS_RESOURCES } from '../../utils/crisisData';

// ─── CRISIS OVERLAY COMPONENTS ──────────────────────────────────────────────
function TwoTapDismiss({ lang, onDismiss }) {
  const [taps, setTaps] = useState(0);
  const [msg, setMsg] = useState("");
  const handle = () => {
    if (taps === 0) {
      setTaps(1);
      setMsg(lang === "Hindi" ? "क्या आप वाकई बंद करना चाहते हैं? एक बार और टैप करें।" : "Are you sure? Tap once more to close.");
      setTimeout(() => { setTaps(0); setMsg(""); }, 4000);
    } else {
      onDismiss();
    }
  };
  return (
    <div style={{ textAlign: "center" }}>
      {msg && <p style={{ fontSize: 12, color: "rgba(255,150,150,0.8)", marginBottom: 10, lineHeight: 1.6 }}>{msg}</p>}
      <button onClick={handle} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 1, padding: "10px 20px", cursor: "pointer" }}>
        {taps === 0
          ? (lang === "Hindi" ? "मैं ठीक हूँ — वापस जाएं" : "I am safe — go back")
          : (lang === "Hindi" ? "हाँ, बंद करें" : "Yes, close this")}
      </button>
    </div>
  );
}

function CrisisOverlay({ lang, onDismiss }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    if (navigator.vibrate) navigator.vibrate([100, 80, 100, 80, 200]);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: pulse ? "rgba(10,0,0,0.97)" : "rgba(20,5,5,0.97)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 24px", transition: "background 0.8s ease",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        border: pulse ? "3px solid rgba(255,60,60,0.9)" : "3px solid rgba(255,60,60,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, transition: "border 0.8s ease",
        boxShadow: pulse ? "0 0 30px rgba(255,60,60,0.4)" : "0 0 8px rgba(255,60,60,0.1)",
      }}>
        <span style={{ fontSize: 36 }}>🆘</span>
      </div>

      <p style={{ fontSize: 10, color: "rgba(255,100,100,0.7)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
        {lang === "Hindi" ? "कृपया रुकें — बाहरी सहायता लें" : "PLEASE STOP — SEEK REAL HELP NOW"}
      </p>

      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 300, color: "#fff", textAlign: "center", lineHeight: 1.5, marginBottom: 12, maxWidth: 300 }}>
        {lang === "Hindi" ? "कृपया अभी किसी प्रशिक्षित व्यक्ति से बात करें।" : "Please speak to a trained person right now."}
      </h2>

      <p style={{ fontSize: 13, color: "rgba(255,200,200,0.7)", textAlign: "center", lineHeight: 1.7, marginBottom: 32, maxWidth: 280 }}>
        {lang === "Hindi"
          ? "यह ऐप संकट सहायता के लिए नहीं है। नीचे दी गई हेल्पलाइन पर अभी कॉल करें — वे सुनने के लिए प्रशिक्षित हैं।"
          : "This app is not equipped for crisis support. Please call one of the helplines below — they are trained to help."}
      </p>

      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {CRISIS_RESOURCES.map(r => (
          <a key={r.name} href={`tel:${r.number}`} style={{ textDecoration: "none" }}>
            <div style={{
              background: pulse ? "rgba(255,60,60,0.18)" : "rgba(255,60,60,0.10)",
              border: `2px solid ${pulse ? "rgba(255,80,80,0.6)" : "rgba(255,80,80,0.3)"}`,
              borderRadius: 18, padding: "18px 22px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.8s ease",
            }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 3px" }}>{r.name}</p>
                <p style={{ fontSize: 13, color: "rgba(255,180,180,0.8)", margin: 0 }}>{r.desc}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#ff6b6b", margin: "0 0 2px", letterSpacing: 0.5 }}>{r.number}</p>
                <p style={{ fontSize: 10, color: "rgba(255,100,100,0.6)", letterSpacing: 1 }}>TAP TO CALL</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      <TwoTapDismiss lang={lang} onDismiss={onDismiss} />
    </div>
  );
}

// ─── MAIN JOURNAL COMPONENT ─────────────────────────────────────────────────
export function Journal({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  const [activeTab, setActiveTab] = useState("write");
  const [isComposing, setIsComposing] = useState(false);
  const [entry, setEntry] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [cloudHistory, setCloudHistory] = useState([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [contextData, setContextData] = useState(null);
  const [visible, setVisible] = useState(false);
  
  // ── CRISIS STATE ──
  const [crisisDetected, setCrisisDetected] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ctx = readEmotionalCtx();
    if (ctx && ctx.timestamp) {
      const twoHours = 2 * 60 * 60 * 1000;
      if ((Date.now() - ctx.timestamp) < twoHours) setContextData(ctx);
    }
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
    }
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  // ── CRISIS SCANNER ──
  const checkCrisis = (textToCheck) => {
    const lower = textToCheck.toLowerCase();
    return CRISIS_WORDS.some(w => lower.includes(w.toLowerCase()));
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setEntry(val);
    if (checkCrisis(val)) setCrisisDetected(true);
  };

  const fetchCloudHistory = async () => {
    setIsLoadingCloud(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries').select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCloudHistory(data || []);
    } catch {
      // silent
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(hi ? "आपका ब्राउज़र वॉयस डिक्टेशन को सपोर्ट नहीं करता है।" : "Your browser does not support voice dictation.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = hi ? 'hi-IN' : 'en-US';
        recognitionRef.current.onresult = (event) => {
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
          }
          if (final) {
            // Check for crisis in voice input
            if (checkCrisis(final)) {
              setCrisisDetected(true);
              recognitionRef.current.stop();
              setIsRecording(false);
              return;
            }
            setEntry(prev => prev + final);
          }
        };
        recognitionRef.current.onerror = (event) => {
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert(hi ? "माइक्रोफ़ोन एक्सेस अस्वीकृत कर दिया गया।" : "Microphone access denied. Check settings.");
          }
        };
        recognitionRef.current.onend = () => setIsRecording(false);
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = hi ? 'hi-IN' : 'en-US';
      u.rate = 0.9; u.pitch = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const prompts = {
    burn:    { en: ["Something was let go. How do you feel from inside?", "What space has opened up for you now?", "What did the fire take away that you no longer need?"], hi: ["कुछ पीछे छूट गया है। आप अंदर से कैसा महसूस कर रहे हैं?", "अब आपके लिए कौन सी नई जगह खुल गई है?", "अग्नि ने वह क्या भस्म किया जिसकी आपको अब आवश्यकता नहीं थी?"] },
    wish:    { en: ["Write the story behind your stars...", "What else should the universe know?", "Record the hope that follows a wish..."], hi: ["अपने सितारों के पीछे की कहानी लिखें...", "ब्रह्मांड को और क्या बताना है?", "इच्छा के बाद की आशा के बारे में लिखें..."] },
    default: { en: ["What is on your mind today?", "How is your body feeling right now?", "What is one quiet truth you are holding today?"], hi: ["आज आपके मन में क्या है?", "अभी आपका शरीर कैसा महसूस कर रहा है?", "आज आप कौन सा शांत सच अपने भीतर महसूस कर रहे हैं?"] },
  };

  const promptKey = !contextData ? 'default' : contextData.type === 'burn' ? 'burn' : 'wish';
  const currentPrompts = prompts[promptKey][hi ? 'hi' : 'en'];
  const [promptIndex, setPromptIndex] = useState(0);
  const cyclePrompt = () => setPromptIndex(prev => (prev + 1) % currentPrompts.length);

  const handleDiscard = () => {
    setEntry(""); setAiResponse(""); setIsComposing(false);
    if (isRecording) toggleRecording();
    window.speechSynthesis.cancel();
    if (contextData) { clearEmotionalCtx(); setContextData(null); }
  };

  const handleSave = async () => {
    if (!entry.trim()) return;
    const { error } = await supabase.from('journal_entries').insert([{ content: entry }]);
    if (error) { alert(hi ? "सहेजा नहीं जा सका।" : "Could not save."); return; }
    if (isRecording) toggleRecording();
    window.speechSynthesis.cancel();
    if (contextData) { clearEmotionalCtx(); setContextData(null); }
    setEntry(""); setAiResponse(""); setIsComposing(false);
    setActiveTab("history");
    fetchCloudHistory();
  };

  const askGemini = async () => {
    if (!entry.trim()) return;
    
    // Final check before sending to backend
    if (checkCrisis(entry)) {
      setCrisisDetected(true);
      return;
    }

    if (isRecording) toggleRecording();
    setIsThinking(true);
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(''); u.volume = 0;
      window.speechSynthesis.speak(u);
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ entry, hi }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch");
      setAiResponse(data.response);
      speakText(data.response);
    } catch {
      const fallback = hi ? "मुझे क्षमा करें, मैं अभी आपसे जुड़ नहीं पा रहा हूँ।" : "I'm sorry, I'm having trouble connecting right now.";
      setAiResponse(fallback);
      speakText(fallback);
    } finally {
      setIsThinking(false);
    }
  };

  // ─── STYLES ───
  const s = {
    page: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      color: T.text,
    },

    tabBar: {
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      padding: "20px 0",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.5s ease",
    },

    tab: (active) => ({
      background: "none",
      border: "none",
      borderBottom: active ? `1px solid ${T.accent}` : "none",
      color: active ? T.accent : T.muted,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "18px",
      cursor: "pointer",
      paddingBottom: 4,
      transition: "color 0.2s",
    }),

    scrollArea: {
      flex: 1,
      padding: "20px 30px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    },

    landing: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "24px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
    },

    contextHint: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "18px",
      color: T.accent,
      fontStyle: "italic",
      opacity: 0.6,
      margin: 0,
    },

    btnGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%",
      maxWidth: "320px",
      marginTop: "10px",
    },

    writeBtnPrimary: {
      width: "100%",
      padding: "16px",
      borderRadius: "40px",
      background: T.accent,
      border: "none",
      color: T.bg,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "20px",
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      transition: "transform 0.2s, box-shadow 0.2s",
    },

    writeBtnSecondary: {
      width: "100%",
      padding: "16px",
      borderRadius: "40px",
      background: `${T.accent}15`,
      border: `1px solid ${T.accent}50`,
      color: T.accent,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "20px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      transition: "transform 0.2s",
    },

    btnEmoji: { fontSize: "22px" },

    editor: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },

    promptBox: {
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${T.borderWarm}`,
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "20px",
      textAlign: "center",
    },

    promptText: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "22px",
      margin: "0 0 16px",
      lineHeight: "1.4",
      color: T.text,
    },

    promptCycleBtn: {
      background: "none",
      border: "none",
      color: T.textSoft,
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      width: "100%",
      cursor: "pointer",
    },

    textAreaWrapper: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: "200px",
      marginBottom: "20px",
    },

    textarea: {
      flex: 1,
      background: "transparent",
      border: "none",
      color: T.text,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "20px",
      outline: "none",
      resize: "none",
      lineHeight: "1.6",
      paddingBottom: "40px",
    },

    micBtn: (recording) => ({
      position: "absolute",
      bottom: "10px",
      right: "10px",
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: recording ? "rgba(255,78,0,0.1)" : `${T.accent}15`,
      border: `1px solid ${recording ? "#ff4e00" : T.accent}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: recording ? "0 0 15px rgba(255,78,0,0.4)" : "none",
    }),

    micEmoji: { fontSize: "20px" },

    privacy: {
      opacity: 0.5,
      fontSize: "0.85rem",
      textAlign: "center",
      marginBottom: "20px",
      padding: "0 10px",
      lineHeight: "1.5",
      fontStyle: "italic",
    },

    privacyP: (mb) => ({ margin: mb ? "0 0 8px 0" : 0 }),

    aiBox: {
      padding: "20px",
      borderRadius: "20px",
      background: `${T.accent}15`,
      border: `1px solid ${T.accent}40`,
      marginBottom: "20px",
    },

    aiBoxHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
    },

    aiLabel: {
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      opacity: 0.6,
      margin: 0,
      color: T.text,
    },

    speakBtn: {
      background: "none",
      border: "none",
      fontSize: "16px",
      cursor: "pointer",
      opacity: 0.7,
    },

    aiText: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "18px",
      fontStyle: "italic",
      margin: 0,
      lineHeight: "1.5",
      color: T.text,
    },

    actionRow: {
      marginTop: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },

    aiBtn: (active) => ({
      width: "100%",
      padding: "16px",
      borderRadius: "40px",
      background: "transparent",
      border: `1px solid ${T.accent}`,
      color: T.accent,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "18px",
      cursor: "pointer",
      opacity: active ? 1 : 0.4,
      transition: "opacity 0.2s",
    }),

    saveRow: { display: "flex", gap: "12px" },

    discardBtn: {
      flex: 1,
      padding: "16px",
      borderRadius: "40px",
      background: "transparent",
      border: "none",
      color: T.textSoft,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "18px",
      cursor: "pointer",
    },

    saveBtn: (active) => ({
      flex: 2,
      padding: "16px",
      borderRadius: "40px",
      background: T.accent,
      border: "none",
      color: T.bg,
      fontWeight: 600,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "18px",
      cursor: "pointer",
      opacity: active ? 1 : 0.4,
      transition: "opacity 0.2s",
    }),

    historyHeader: {
      fontSize: "12px",
      opacity: 0.5,
      marginBottom: "20px",
      letterSpacing: "2px",
      textAlign: "center",
      textTransform: "uppercase",
      color: T.text,
      fontWeight: 400,
    },

    historyEmpty: { textAlign: "center", opacity: 0.5, color: T.textSoft },

    historyCard: {
      background: "rgba(255,255,255,0.05)",
      border: `1px solid ${T.accent}40`,
      borderRadius: "24px",
      padding: "20px",
      marginBottom: "16px",
      transition: "transform 0.2s ease",
    },

    historyCardTop: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
    },

    historyTag: {
      fontSize: "10px",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: T.accent,
    },

    historyDate: { fontSize: "10px", opacity: 0.4, color: T.text },

    historyContent: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "18px",
      lineHeight: "1.5",
      margin: 0,
      color: T.text,
    },

    historyReflectionWrap: {
      marginTop: "12px",
      paddingTop: "12px",
      borderTop: `1px solid ${T.accent}30`,
    },

    historyAiLabel: {
      fontSize: "10px",
      opacity: 0.5,
      display: "block",
      marginBottom: "4px",
      color: T.text,
    },

    historyReflection: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "16px",
      fontStyle: "italic",
      margin: 0,
      color: T.accent,
    },
  };

  // ── RENDER CRISIS OVERLAY INSTEAD OF NORMAL PAGE IF DANGER IS DETECTED ──
  if (crisisDetected) {
    return (
      <CrisisOverlay 
        lang={lang} 
        onDismiss={() => { 
          setCrisisDetected(false); 
          setEntry(""); 
          setIsComposing(false);
          if (isRecording) toggleRecording();
        }} 
      />
    );
  }

  return (
    <div style={s.page}>
      <PageNav onBack={() => setTab("home")} onHome={() => setTab("home")} T={T} lang={lang} />

      {!isComposing && (
        <div style={s.tabBar}>
          <button onClick={() => setActiveTab("write")} style={s.tab(activeTab === "write")}>
            {hi ? "लिखें" : "Write"}
          </button>
          <button onClick={() => { setActiveTab("history"); fetchCloudHistory(); }} style={s.tab(activeTab === "history")}>
            {hi ? "इतिहास" : "History"}
          </button>
        </div>
      )}

      <div style={s.scrollArea}>
        {activeTab === "write" ? (
          !isComposing ? (

            <div className="fade-in" style={s.landing}>
              {contextData && (
                <p style={s.contextHint}>
                  {contextData.type === 'burn'
                    ? (hi ? "अग्नि ने कुछ जगह बनाई है..." : "The fire has made some space...")
                    : (hi ? "सितारे आपकी प्रतीक्षा कर रहे हैं..." : "The stars are waiting for your words...")}
                </p>
              )}

              <div style={s.btnGroup}>
                <button
                  onClick={() => setIsComposing(true)}
                  style={s.writeBtnPrimary}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; }}
                >
                  <span style={s.btnEmoji}>✍️</span>
                  {hi ? "लिखना शुरू करें" : "Write an entry"}
                </button>

                <button
                  onClick={() => { setIsComposing(true); setTimeout(toggleRecording, 300); }}
                  style={s.writeBtnSecondary}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <span style={s.btnEmoji}>🎙️</span>
                  {hi ? "बोलना शुरू करें" : "Record an entry"}
                </button>
              </div>
            </div>

          ) : (

            <div className="fade-in" style={s.editor}>

              <div style={s.promptBox}>
                <p style={s.promptText}>{currentPrompts[promptIndex]}</p>
                <button onClick={cyclePrompt} style={s.promptCycleBtn}>
                  <span>{hi ? "कोई अन्य विषय?" : "Try another prompt?"}</span>
                  <span>🔄</span>
                </button>
              </div>

              <div style={s.textAreaWrapper}>
                <textarea
                  autoFocus
                  value={entry}
                  onChange={handleTextChange} /* <-- Scanner added here! */
                  placeholder={hi ? "स्वतंत्र रूप से लिखें या बोलें..." : "Write or speak freely..."}
                  style={s.textarea}
                />
                <button onClick={toggleRecording} style={s.micBtn(isRecording)}>
                  <span className={isRecording ? "pulse" : ""} style={s.micEmoji}>
                    {isRecording ? "⏹️" : "🎙️"}
                  </span>
                </button>
              </div>

              <div style={s.privacy}>
                <p style={s.privacyP(true)}>
                  {hi 
                    ? '"यह एक निजी स्थान है। आपकी प्रविष्टियां आपके खाते में सुरक्षित रूप से संग्रहीत होती हैं और दूसरों के साथ साझा नहीं की जाती हैं। यदि आप AI चिंतन का उपयोग करते हैं, तो आपकी प्रविष्टि प्रतिक्रिया उत्पन्न करने के लिए उपयोग की जाती है।"'
                    : '"This is a private space. Your entries are stored securely in your account and are not shared with others. If you choose to use AI reflection, your entry is used to generate a response."'}
                </p>
                <p style={s.privacyP(false)}>
                  {hi 
                    ? "हम Sukoon को बेहतर बनाने के लिए गुमनाम उपयोग विश्लेषण का भी उपयोग करते हैं — यह कभी भी आपकी पहचान नहीं करता या आप जो लिखते हैं उसे रिकॉर्ड नहीं करता।"
                    : "We also use anonymous usage analytics to improve Sukoon — this never identifies you or records what you write."}
                </p>
              </div>

              {(isThinking || aiResponse) && (
                <div className="fade-in" style={s.aiBox}>
                  <div style={s.aiBoxHeader}>
                    <p style={s.aiLabel}>{hi ? "सुकून एआई" : "Sukoon AI"}</p>
                    {aiResponse && !isThinking && (
                      <button onClick={() => speakText(aiResponse)} style={s.speakBtn}>🔊</button>
                    )}
                  </div>
                  <p style={s.aiText}>
                    {isThinking ? (hi ? "सुन रहा हूँ..." : "Thinking...") : aiResponse}
                  </p>
                </div>
              )}

              <div style={s.actionRow}>
                <button
                  onClick={askGemini}
                  disabled={!entry.trim() || isThinking}
                  style={s.aiBtn(entry.trim() && !isThinking)}
                >
                  {hi ? "प्रतिबिंब के लिए AI से पूछें" : "Ask AI for reflection"}
                </button>

                <div style={s.saveRow}>
                  <button onClick={handleDiscard} style={s.discardBtn}>
                    {hi ? "छोड़ दें" : "Discard"}
                  </button>
                  <button onClick={handleSave} disabled={!entry.trim()} style={s.saveBtn(entry.trim())}>
                    {hi ? "सहेजें" : "Save Entry"}
                  </button>
                </div>
              </div>

            </div>
          )
        ) : (

          <div className="fade-in">
            <h3 style={s.historyHeader}>
              {hi ? "क्लाउड यादें" : "CLOUD MEMORIES"}
            </h3>

            {isLoadingCloud ? (
              <p style={s.historyEmpty}>{hi ? "खोज रहे हैं..." : "Gathering reflections..."}</p>
            ) : cloudHistory.length === 0 ? (
              <p style={{ ...s.historyEmpty, opacity: 0.3, marginBottom: "40px" }}>
                {hi ? "क्लाउड में कुछ नहीं मिला।" : "No cloud entries found."}
              </p>
            ) : (
              cloudHistory.map(item => (
                <div
                  key={item.id}
                  style={s.historyCard}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={s.historyCardTop}>
                    <span style={s.historyTag}>{hi ? "जर्नल" : "Journal"}</span>
                    <span style={s.historyDate}>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={s.historyContent}>{item.content}</p>
                  {item.reflection && (
                    <div style={s.historyReflectionWrap}>
                      <span style={s.historyAiLabel}>AI:</span>
                      <p style={s.historyReflection}>{item.reflection}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}