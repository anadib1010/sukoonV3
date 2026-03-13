import React, { useState, useEffect, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';
import { useLS } from '../../hooks/useLS';
import { readEmotionalCtx, clearEmotionalCtx } from '../../utils/context';

export function Journal({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  
  const [activeTab, setActiveTab] = useState("write"); 
  const [isComposing, setIsComposing] = useState(false);
  const [entry, setEntry] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useLS("jsukoon_master_history", []);
  
  // ─── VOICE STATE ───
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  
  // ─── THE BRIDGE MEMORY ───
  const [contextData, setContextData] = useState(null);

  useEffect(() => {
    const ctx = readEmotionalCtx();
    if (ctx && ctx.type === 'burn') {
      setContextData(ctx);
    }

    // Initialize Speech Recognition (Cross-Browser)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true;
    }
  }, []);

  // ─── VOICE RECORDING (SPEECH TO TEXT) ───
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(hi ? "आपका ब्राउज़र या डिवाइस वॉयस डिक्टेशन को सपोर्ट नहीं करता है।" : "Your browser or device does not support voice dictation.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = hi ? 'hi-IN' : 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setEntry((prev) => prev + finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error("Speech Recognition Error:", event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert(hi ? "माइक्रोफ़ोन एक्सेस अस्वीकृत कर दिया गया।" : "Microphone access denied. Please check settings.");
          }
        };

        recognitionRef.current.onend = () => setIsRecording(false);
        
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start recording:", e);
        setIsRecording(false);
        alert(hi ? "रिकॉर्डिंग शुरू नहीं हो सकी।" : "Failed to start recording on this device.");
      }
    }
  };

  // ─── AI VOICE (TEXT TO SPEECH) ───
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = hi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;  
      utterance.pitch = 0.95; 
      window.speechSynthesis.speak(utterance);
    }
  };

  // ─── DYNAMIC PROMPTS ───
  const burnPromptsEN = ["Something was let go. How do you feel from inside?", "What space has opened up for you now?", "What did the fire take away that you no longer need?"];
  const burnPromptsHI = ["कुछ पीछे छूट गया है। आप अंदर से कैसा महसूस कर रहे हैं?", "अब आपके लिए कौन सी नई जगह खुल गई है?", "अग्नि ने वह क्या भस्म किया जिसकी आपको अब आवश्यकता नहीं थी?"];
  const standardPromptsEN = ["What is on your mind today?", "How is your body feeling right now?", "What is one quiet truth you are holding today?"];
  const standardPromptsHI = ["आज आपके मन में क्या है?", "अभी आपका शरीर कैसा महसूस कर रहा है?", "आज आप कौन सा शांत सच अपने भीतर महसूस कर रहे हैं?"];

  const currentPrompts = contextData ? (hi ? burnPromptsHI : burnPromptsEN) : (hi ? standardPromptsHI : standardPromptsEN);
  const [promptIndex, setPromptIndex] = useState(0);
  const cyclePrompt = () => setPromptIndex((prev) => (prev + 1) % currentPrompts.length);

  // ─── ACTIONS ───
  const handleDiscard = () => {
    setEntry(""); setAiResponse(""); setIsComposing(false);
    if (isRecording) toggleRecording();
    window.speechSynthesis.cancel(); 
    if (contextData) { clearEmotionalCtx(); setContextData(null); }
  };

  const handleSave = () => {
    if (!entry.trim()) return;
    const newRecord = {
      id: Date.now(), type: "Journal", text: entry, ai: aiResponse,
      date: new Date().toLocaleDateString(hi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setHistory([newRecord, ...history]);
    if (isRecording) toggleRecording();
    window.speechSynthesis.cancel();
    if (contextData) { clearEmotionalCtx(); setContextData(null); }
    setEntry(""); setAiResponse(""); setIsComposing(false); setActiveTab("history");
  };

  const askGemini = async () => {
    if (!entry.trim()) return;
    if (isRecording) toggleRecording(); 
    setIsThinking(true);
    
    // iOS Safari Audio Unlock
    if ('speechSynthesis' in window) {
      const unlockUtterance = new SpeechSynthesisUtterance('');
      unlockUtterance.volume = 0; 
      window.speechSynthesis.speak(unlockUtterance);
    }
    
    try {
      // We securely call our own Vercel backend instead of exposing the API key
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry, hi }), // Send the text and language toggle
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      setAiResponse(data.response);
      speakText(data.response); 

    } catch (error) {
      console.error("Bridge Error:", error);
      const fallbackText = hi 
        ? "मुझे क्षमा करें, मैं अभी आपसे जुड़ नहीं पा रहा हूँ। कृपया अपनी प्रविष्टि सहेजें।" 
        : "I'm sorry, I'm having trouble connecting to the universe right now. Please save your entry.";
      
      setAiResponse(fallbackText);
      speakText(fallbackText);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, color: T.text }}>
      <PageNav onBack={() => setTab("home")} onHome={() => setTab("home")} T={T} lang={lang} />
      
      {!isComposing && (
        <div style={{ display: "flex", justifyContent: "center", gap: "30px", padding: "20px 0" }}>
          <button onClick={() => setActiveTab("write")} style={{ background: "none", border: "none", color: activeTab === "write" ? T.accent : T.muted, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer", borderBottom: activeTab === "write" ? `1px solid ${T.accent}` : "none" }}>{hi ? "लिखें" : "Write"}</button>
          <button onClick={() => setActiveTab("history")} style={{ background: "none", border: "none", color: activeTab === "history" ? T.accent : T.muted, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer", borderBottom: activeTab === "history" ? `1px solid ${T.accent}` : "none" }}>{hi ? "इतिहास" : "History"}</button>
        </div>
      )}

      <div style={{ flex: 1, padding: "20px 30px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {activeTab === "write" ? (
          !isComposing ? (
            /* ─── THE NEW START SCREEN ─── */
            <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "24px" }}>
              {contextData && (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: T.accent, fontStyle: "italic", lineHeight: "1.4" }}>
                  {hi ? "आपने हाल ही में कुछ जलाया था। जर्नल को पता है। आज का विषय वहीं से शुरू होगा।" : "You burnt something recently. The Journal knows. Today's prompt will meet you there."}
                </p>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "320px", marginTop: "10px" }}>
                <button 
                  onClick={() => setIsComposing(true)} 
                  style={{ width: "100%", padding: "16px", borderRadius: "40px", background: T.accent, border: "none", color: T.bg, fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "22px" }}>✍️</span> {hi ? "लिखना शुरू करें" : "Write an entry"}
                </button>

                <button 
                  onClick={() => { setIsComposing(true); setTimeout(toggleRecording, 300); }} 
                  style={{ width: "100%", padding: "16px", borderRadius: "40px", background: `${T.accent}15`, border: `1px solid ${T.accent}50`, color: T.accent, fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.3s" }}
                >
                  <span style={{ fontSize: "22px" }}>🎙️</span> {hi ? "बोलना शुरू करें" : "Record an entry"}
                </button>
              </div>
            </div>
          ) : (
            <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {contextData && (
                <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: T.accent, opacity: 0.8, marginBottom: "16px", textAlign: "center" }}>
                  {hi ? "आपके द्वारा मुक्त किए गए विचारों से बना एक विषय" : "A prompt shaped by what you released"}
                </p>
              )}
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderWarm}`, borderRadius: "20px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", margin: "0 0 16px", lineHeight: "1.4" }}>{currentPrompts[promptIndex]}</p>
                <button onClick={cyclePrompt} style={{ background: "none", border: "none", color: T.textSoft, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", cursor: "pointer" }}>
                  <span>{hi ? "कोई अन्य विषय आज़माएं" : "Try a different prompt"}</span> <span>🔄</span>
                </button>
              </div>

              {/* TEXT AREA WITH EMBEDDED MIC BUTTON */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, minHeight: "200px", marginBottom: "20px" }}>
                <textarea 
                  autoFocus 
                  value={entry} 
                  onChange={(e) => setEntry(e.target.value)} 
                  placeholder={hi ? "स्वतंत्र रूप से लिखें या माइक का उपयोग करें..." : "Write freely or use the mic..."} 
                  style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", outline: "none", resize: "none", lineHeight: "1.6", paddingBottom: "40px" }} 
                />
                <button 
                  onClick={toggleRecording}
                  style={{ 
                    position: "absolute", bottom: "10px", right: "10px", 
                    width: "48px", height: "48px", borderRadius: "50%", 
                    background: isRecording ? "rgba(255, 78, 0, 0.1)" : `${T.accent}15`, 
                    border: `1px solid ${isRecording ? "#ff4e00" : T.accent}`, 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    cursor: "pointer", transition: "all 0.3s ease",
                    boxShadow: isRecording ? "0 0 15px rgba(255, 78, 0, 0.4)" : "none"
                  }}
                >
                  <span className={isRecording ? "pulse" : ""} style={{ fontSize: "20px" }}>
                    {isRecording ? "⏹️" : "🎙️"}
                  </span>
                </button>
              </div>

              {(isThinking || aiResponse) && (
                <div className="fade-in" style={{ padding: "20px", borderRadius: "20px", background: `${T.accent}15`, border: `1px solid ${T.accent}40`, marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.6, margin: 0 }}>{hi ? "सुकोन एआई" : "Sukoon AI"}</p>
                    {aiResponse && !isThinking && (
                      <button onClick={() => speakText(aiResponse)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", opacity: 0.7 }}>🔊</button>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontStyle: "italic", margin: 0, lineHeight: "1.5" }}>{isThinking ? (hi ? "सुन रहा हूँ..." : "Listening...") : aiResponse}</p>
                </div>
              )}

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={askGemini} disabled={!entry.trim() || isThinking} style={{ width: "100%", padding: "16px", borderRadius: "40px", background: "transparent", border: `1px solid ${T.accent}`, color: T.accent, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer", opacity: entry.trim() ? 1 : 0.4 }}>{hi ? "प्रतिबिंब के लिए AI से पूछें" : "Ask AI for reflection"}</button>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={handleDiscard} style={{ flex: 1, padding: "16px", borderRadius: "40px", background: "transparent", border: "none", color: T.textSoft, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer" }}>{hi ? "छोड़ दें" : "Discard"}</button>
                  <button onClick={handleSave} disabled={!entry.trim()} style={{ flex: 2, padding: "16px", borderRadius: "40px", background: T.accent, border: "none", color: T.bg, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer", opacity: entry.trim() ? 1 : 0.4 }}>{hi ? "प्रविष्टि सहेजें" : "Save Entry"}</button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="fade-in">
            {history.length === 0 ? (
              <p style={{ textAlign: "center", opacity: 0.5, marginTop: "40px" }}>{hi ? "अभी कोई इतिहास नहीं है।" : "No history recorded yet."}</p>
            ) : (
              history.map(item => (
                <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.accent}20`, borderRadius: "24px", padding: "20px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: item.type === "Journal" ? T.textSoft : T.accent }}>{item.type === "Journal" ? (hi ? "जर्नल" : "Journal") : (hi ? "प्रार्थना" : "Prayer/Wish")}</span>
                    <span style={{ fontSize: "10px", opacity: 0.4 }}>{item.date}</span>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", lineHeight: "1.5", margin: 0, fontStyle: item.type === "Wish/Prayer" ? "italic" : "normal" }}>{item.text}</p>
                  {item.ai && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${T.borderWarm}` }}>
                      <span style={{ fontSize: "10px", opacity: 0.5, display: "block", marginBottom: "4px" }}>AI:</span>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontStyle: "italic", margin: 0, color: T.accent }}>{item.ai}</p>
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