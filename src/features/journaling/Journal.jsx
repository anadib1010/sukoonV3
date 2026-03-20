import React, { useState, useEffect, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';
import { readEmotionalCtx, clearEmotionalCtx } from '../../utils/context';
import { supabase } from '../../supabase';

export function Journal({ setTab, T, lang }) {
  const hi = lang === "Hindi";
 
  // ─── COMPONENT STATES ───
  const [activeTab, setActiveTab] = useState("write");
  const [isComposing, setIsComposing] = useState(false);
  const [entry, setEntry] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // ─── CLOUD HISTORY STATE ───
  const [cloudHistory, setCloudHistory] = useState([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
 
  // ─── VOICE STATE (THE MICROPHONE BRAIN) ───
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
 
  // ─── THE BRIDGE MEMORY (FROM REFLECTION ROOM) ───
  const [contextData, setContextData] = useState(null);

  // ─── STEP 1: INITIALIZE THE PAGE ───
  useEffect(() => {
    // A. Check the "Memory Jar" for recent reflections
    const ctx = readEmotionalCtx();
    
    // We only nudge if the reflection is less than 2 hours old
    if (ctx && ctx.timestamp) {
      const twoHours = 2 * 60 * 60 * 1000;
      if ((Date.now() - ctx.timestamp) < twoHours) {
        setContextData(ctx);
      }
    }

    // B. Wake up the Speech Recognition engine
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
    }
    
    // Cleanup: Turn off the mic if we leave the page
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ─── STEP 2: THE CLOUD FETCH LOGIC ───
  const fetchCloudHistory = async () => {
    setIsLoadingCloud(true);
    try {
      // 🔗 THE FIX: Changed 'entries' to 'journal_entries'
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });


      
      if (error) {
        throw error;
      }
      
      setCloudHistory(data || []);
    } catch (err) {
    } finally {
      setIsLoadingCloud(false);
    }
  };

  // ─── STEP 3: VOICE RECORDING (SPEECH TO TEXT) ───
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(hi 
        ? "आपका ब्राउज़र वॉयस डिक्टेशन को सपोर्ट नहीं करता है।" 
        : "Your browser does not support voice dictation.");
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
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert(hi 
              ? "माइक्रोफ़ोन एक्सेस अस्वीकृत कर दिया गया।" 
              : "Microphone access denied. Check settings.");
          }
        };

        recognitionRef.current.onend = () => setIsRecording(false);
       
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  // ─── STEP 4: AI VOICE (TEXT TO SPEECH) ───
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

  // ─── STEP 5: PROMPT LIBRARY ───
  const burnPromptsEN = [
    "Something was let go. How do you feel from inside?", 
    "What space has opened up for you now?", 
    "What did the fire take away that you no longer need?"
  ];
  const burnPromptsHI = [
    "कुछ पीछे छूट गया है। आप अंदर से कैसा महसूस कर रहे हैं?", 
    "अब आपके लिए कौन सी नई जगह खुल गई है?", 
    "अग्नि ने वह क्या भस्म किया जिसकी आपको अब आवश्यकता नहीं थी?"
  ];
  
  const wishPromptsEN = [
    "Write the story behind your stars...", 
    "What else should the universe know?", 
    "Record the hope that follows a wish..."
  ];
  const wishPromptsHI = [
    "अपने सितारों के पीछे की कहानी लिखें...", 
    "ब्रह्मांड को और क्या बताना है?", 
    "इच्छा के बाद की आशा के बारे में लिखें..."
  ];
  
  const standardPromptsEN = [
    "What is on your mind today?", 
    "How is your body feeling right now?", 
    "What is one quiet truth you are holding today?"
  ];
  const standardPromptsHI = [
    "आज आपके मन में क्या है?", 
    "अभी आपका शरीर कैसा महसूस कर रहा है?", 
    "आज आप कौन सा शांत सच अपने भीतर महसूस कर रहे हैं?"
  ];

  // Logic to decide which array of prompts to use
  const currentPrompts = !contextData
    ? (hi ? standardPromptsHI : standardPromptsEN)
    : contextData.type === 'burn'
      ? (hi ? burnPromptsHI : burnPromptsEN)
      : (hi ? wishPromptsHI : wishPromptsEN);

  const [promptIndex, setPromptIndex] = useState(0);
  const cyclePrompt = () => setPromptIndex((prev) => (prev + 1) % currentPrompts.length);

  // ─── STEP 6: BUTTON ACTIONS ───
  const handleDiscard = () => {
    setEntry(""); 
    setAiResponse(""); 
    setIsComposing(false);
    if (isRecording) toggleRecording();
    window.speechSynthesis.cancel();
    if (contextData) { 
      clearEmotionalCtx(); 
      setContextData(null); 
    }
  };

  const handleSave = async () => {
    if (!entry.trim()) return;

    const packageForCloud = { 
      content: entry 
    };

    // 🔗 THE FIX: Changed 'entries' to 'journal_entries'
    const { error } = await supabase
      .from('journal_entries')
      .insert([packageForCloud]);

    if (error) {
      alert(hi ? "सहेजा नहीं जा सका।" : "Could not save.");
      return;
    }
   
    if (isRecording) toggleRecording();
    window.speechSynthesis.cancel();
    if (contextData) { 
      clearEmotionalCtx(); 
      setContextData(null); 
    }
    
    setEntry(""); 
    setAiResponse(""); 
    setIsComposing(false); 
    
    setActiveTab("history");
    fetchCloudHistory();
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
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry, hi }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch");

      setAiResponse(data.response);
      speakText(data.response);
    } catch (error) {
      const fallbackText = hi
        ? "मुझे क्षमा करें, मैं अभी आपसे जुड़ नहीं पा रहा हूँ।"
        : "I'm sorry, I'm having trouble connecting right now.";
     
      setAiResponse(fallbackText);
      speakText(fallbackText);
    } finally {
      setIsThinking(false);
    }
  };

  // ─── STEP 7: THE USER INTERFACE ───
  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: T.bg, 
      color: T.text 
    }}>
      
      <PageNav 
        onBack={() => setTab("home")} 
        onHome={() => setTab("home")} 
        T={T} 
        lang={lang} 
      />
     
      {!isComposing && (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "30px", 
          padding: "20px 0" 
        }}>
          <button 
            onClick={() => setActiveTab("write")} 
            style={{ 
              background: "none", 
              border: "none", 
              color: activeTab === "write" ? T.accent : T.muted, 
              fontFamily: "'Cormorant Garamond', serif", 
              fontSize: "18px", 
              cursor: "pointer", 
              borderBottom: activeTab === "write" ? `1px solid ${T.accent}` : "none" 
            }}
          >
            {hi ? "लिखें" : "Write"}
          </button>
          
          <button 
            onClick={() => { setActiveTab("history"); fetchCloudHistory(); }} 
            style={{ 
              background: "none", 
              border: "none", 
              color: activeTab === "history" ? T.accent : T.muted, 
              fontFamily: "'Cormorant Garamond', serif", 
              fontSize: "18px", 
              cursor: "pointer", 
              borderBottom: activeTab === "history" ? `1px solid ${T.accent}` : "none" 
            }}
          >
            {hi ? "इतिहास" : "History"}
          </button>
        </div>
      )}

      <div style={{ 
        flex: 1, 
        padding: "20px 30px", 
        overflowY: "auto", 
        display: "flex", 
        flexDirection: "column" 
      }}>
        
        {activeTab === "write" ? (
          !isComposing ? (
            /* --- LANDING SCREEN --- */
            <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "24px" }}>
              
              {contextData && (
                <p style={{ 
                  fontFamily: "'Cormorant Garamond', serif", 
                  fontSize: "18px", 
                  color: T.accent, 
                  fontStyle: "italic", 
                  opacity: 0.6 
                }}>
                  {contextData.type === 'burn' 
                    ? (hi ? "अग्नि ने कुछ जगह बनाई है..." : "The fire has made some space...")
                    : (hi ? "सितारे आपकी प्रतीक्षा कर रहे हैं..." : "The stars are waiting for your words...")
                  }
                </p>
              )}
             
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "320px", marginTop: "10px" }}>
                <button
                  onClick={() => setIsComposing(true)}
                  style={{ 
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
                    gap: "10px" 
                  }}
                >
                  <span style={{ fontSize: "22px" }}>✍️</span> {hi ? "लिखना शुरू करें" : "Write an entry"}
                </button>

                <button
                  onClick={() => { setIsComposing(true); setTimeout(toggleRecording, 300); }}
                  style={{ 
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
                    gap: "10px" 
                  }}
                >
                  <span style={{ fontSize: "22px" }}>🎙️</span> {hi ? "बोलना शुरू करें" : "Record an entry"}
                </button>
              </div>
            </div>
          ) : (
            /* --- EDITOR SCREEN --- */
            <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderWarm}`, borderRadius: "20px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", margin: "0 0 16px", lineHeight: "1.4" }}>
                  {currentPrompts[promptIndex]}
                </p>
                <button onClick={cyclePrompt} style={{ background: "none", border: "none", color: T.textSoft, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", cursor: "pointer" }}>
                  <span>{hi ? "कोई अन्य विषय?" : "Try another prompt?"}</span> <span>🔄</span>
                </button>
              </div>

              <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, minHeight: "200px", marginBottom: "20px" }}>
                <textarea
                  autoFocus
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder={hi ? "स्वतंत्र रूप से लिखें या बोलें..." : "Write or speak freely..."}
                  style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", outline: "none", resize: "none", lineHeight: "1.6", paddingBottom: "40px" }}
                />
                
                <button
                  onClick={toggleRecording}
                  style={{
                    position: "absolute", 
                    bottom: "10px", 
                    right: "10px", 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%",
                    background: isRecording ? "rgba(255, 78, 0, 0.1)" : `${T.accent}15`, 
                    border: `1px solid ${isRecording ? "#ff4e00" : T.accent}`,
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer", 
                    transition: "all 0.3s ease",
                    boxShadow: isRecording ? "0 0 15px rgba(255, 78, 0, 0.4)" : "none"
                  }}
                >
                  <span className={isRecording ? "pulse" : ""} style={{ fontSize: "20px" }}>
                    {isRecording ? "⏹️" : "🎙️"}
                  </span>
                </button>
              </div>

              {/* PRIVACY DISCLAIMER */}
              <div style={{ 
                opacity: 0.5, 
                fontSize: '0.85rem', 
                textAlign: 'center', 
                marginBottom: '20px', 
                padding: '0 10px', 
                lineHeight: '1.5', 
                fontStyle: 'italic' 
              }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  “This is a private space. Your words remain on your device and are not stored or read by us.”
                </p>
                <p style={{ margin: 0 }}>
                  To help improve Sukoon, we use anonymous usage analytics. This never identifies you and never records what you write.
                </p>
              </div>

              {/* AI RESPONSE BOX */}
              {(isThinking || aiResponse) && (
                <div className="fade-in" style={{ padding: "20px", borderRadius: "20px", background: `${T.accent}15`, border: `1px solid ${T.accent}40`, marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.6, margin: 0 }}>
                      {hi ? "सुकोन एआई" : "Sukoon AI"}
                    </p>
                    {aiResponse && !isThinking && (
                      <button onClick={() => speakText(aiResponse)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", opacity: 0.7 }}>🔊</button>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontStyle: "italic", margin: 0, lineHeight: "1.5" }}>
                    {isThinking ? (hi ? "सुन रहा हूँ..." : "Thinking...") : aiResponse}
                  </p>
                </div>
              )}

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                <button 
                  onClick={askGemini} 
                  disabled={!entry.trim() || isThinking} 
                  style={{ width: "100%", padding: "16px", borderRadius: "40px", background: "transparent", border: `1px solid ${T.accent}`, color: T.accent, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer", opacity: entry.trim() ? 1 : 0.4 }}
                >
                  {hi ? "प्रतिबिंब के लिए AI से पूछें" : "Ask AI for reflection"}
                </button>
                
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={handleDiscard} style={{ flex: 1, padding: "16px", borderRadius: "40px", background: "transparent", border: "none", color: T.textSoft, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer" }}>
                    {hi ? "छोड़ दें" : "Discard"}
                  </button>
                  <button onClick={handleSave} disabled={!entry.trim()} style={{ flex: 2, padding: "16px", borderRadius: "40px", background: T.accent, border: "none", color: T.bg, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", cursor: "pointer", opacity: entry.trim() ? 1 : 0.4 }}>
                    {hi ? "सहेजें" : "Save Entry"}
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* --- HISTORY TAB --- */
          <div className="fade-in">
            <h3 style={{ 
              fontSize: '12px', 
              opacity: 0.5, 
              marginBottom: '20px', 
              letterSpacing: '2px', 
              textAlign: 'center', 
              textTransform: 'uppercase' 
            }}>
              {hi ? "क्लाउड यादें" : "CLOUD MEMORIES"}
            </h3>
            
            {isLoadingCloud ? (
              <p style={{ textAlign: "center", opacity: 0.5 }}>{hi ? "खोज रहे हैं..." : "Gathering reflections..."}</p>
            ) : cloudHistory.length === 0 ? (
              <p style={{ textAlign: "center", opacity: 0.3, marginBottom: "40px" }}>{hi ? "क्लाउड में कुछ नहीं मिला।" : "No cloud entries found."}</p>
            ) : (
              cloudHistory.map(item => (
                <div key={item.id} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.accent}40`, borderRadius: "24px", padding: "20px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: T.accent }}>
                      {hi ? "जर्नल" : "Journal"}
                    </span>
                    <span style={{ fontSize: "10px", opacity: 0.4 }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", lineHeight: "1.5", margin: 0 }}>
                    {item.content}
                  </p>
                  {item.reflection && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${T.accent}30` }}>
                      <span style={{ fontSize: "10px", opacity: 0.5, display: "block", marginBottom: "4px" }}>AI:</span>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontStyle: "italic", margin: 0, color: T.accent }}>
                        {item.reflection}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        .fade-in { 
          animation: fadeIn 0.8s ease-in; 
        }
        .pulse { 
          animation: pulseAnim 1.5s infinite; 
        }
        @keyframes pulseAnim { 
          0% { transform: scale(1); opacity: 1; } 
          50% { transform: scale(1.1); opacity: 0.7; } 
          100% { transform: scale(1); opacity: 1; } 
        }
      `}</style>
    </div>
  );
}