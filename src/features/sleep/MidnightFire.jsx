import React, { useState, useEffect } from 'react';
import { supabase } from "../../supabase";

export function MidnightFire({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [thought, setThought] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  
  // NEW: State for History
  const [viewingHistory, setViewingHistory] = useState(false);
  const [burntHistory, setBurntHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.85)";
  const faintBorder = "rgba(184, 93, 25, 0.25)";

  // THE "CALM TECHNOLOGY" SENSORY HANDSHAKE
  const handleBurn = async () => {
    if (!thought.trim()) return;

    // A. Setup the "Gentle" Sound
    const audio = new Audio('/whoosh.mp3');
    audio.volume = 0.2; // 20% volume - very soft, like a whisper

    // 1. Start the Magic Animation!
    setIsBurning(true);

    // 2. SOFT TOUCH: A tiny "tick" instead of a "thump"
    if (navigator.vibrate) {
      navigator.vibrate(40); // 40ms is very short and feels premium
    }
    
    // 3. GENTLE SOUND: Play the soft Whoosh
    audio.play().catch(() => console.log("Sound ready for next time!"));

    // 4. MEMORY: The Invisible Handshake to Mumbai (Supabase)
    try {
      const { error } = await supabase
        .from('burnt_thoughts') 
        .insert([{ content: thought }]);

      if (error) console.error("Database Bridge Error:", error.message);
    } catch (err) {
      console.error("System Error:", err);
    }

    // 5. CLEANUP: Clear the screen after the fire finishes
    setTimeout(() => {
      setThought("");
      setIsBurning(false);
    }, 6500); 
  };

  // NEW: THE FETCH TRUCK (Getting data from Mumbai)
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // 1. Send the truck across the bridge!
      const { data, error } = await supabase
        .from('burnt_thoughts')
        .select('*')
        .order('created_at', { ascending: false }); // Newest first

      // 2. Check if the bridge is broken
      if (error) {
        console.error("Fetch Error:", error);
        alert(hi ? "इतिहास लोड नहीं हो सका।" : "Could not load history.");
      } else {
        // 3. Unpack the boxes!
        setBurntHistory(data || []);
      }
    } catch (err) {
      console.error("System Error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // When they click the History button, open the view and start the truck
  const toggleHistory = () => {
    if (!viewingHistory) {
      fetchHistory();
    }
    setViewingHistory(!viewingHistory);
  };

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: trueBlack, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* ─── HEADER: BACK BUTTON & HISTORY TOGGLE ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setTab('sleep')} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}>
          ← {hi ? 'वापस' : 'Back'}
        </button>
        
        {/* NEW: History Toggle Button */}
        {!isBurning && (
          <button onClick={toggleHistory} style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}>
            {viewingHistory ? (hi ? "आग पर वापस" : "Back to Fire") : (hi ? "राख (इतिहास)" : "The Ashes (History)")}
          </button>
        )}
      </div>

      <div style={{ width: '85%', maxWidth: 400, textAlign: 'center', marginTop: "40px" }}>
        
        {/* VIEW 1: THE HISTORY (THE ASHES) */}
        {viewingHistory ? (
          <div style={{ animation: 'fadeIn 0.5s ease', height: '60vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 24 }}>
              {hi ? "राख" : "The Ashes"}
            </h2>
            
            {isLoadingHistory ? (
              <p style={{ color: dimAmber, opacity: 0.5 }}>{hi ? "यादें ला रहा हूँ..." : "Gathering ashes..."}</p>
            ) : burntHistory.length === 0 ? (
              <p style={{ color: dimAmber, opacity: 0.5 }}>{hi ? "यहाँ कुछ नहीं जला है।" : "Nothing has burned here yet."}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {burntHistory.map((item) => (
                  <div key={item.id} style={{ borderBottom: `1px solid ${faintBorder}`, paddingBottom: '12px', textAlign: 'left' }}>
                    <p style={{ color: dimAmber, opacity: 0.4, fontSize: '12px', margin: '0 0 4px 0' }}>
                      {new Date(item.created_at).toLocaleDateString(hi ? 'hi-IN' : 'en-US')}
                    </p>
                    <p style={{ color: dimAmber, opacity: 0.8, fontSize: '16px', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (
          /* VIEW 2: THE FIRE (Original Code) */
          !isBurning ? (
            <div style={{ animation: 'fadeIn 2s ease' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 16 }}>
                {hi ? "आधी रात की आग" : "Midnight Fire"}
              </h2>
              <p style={{ color: dimAmber, opacity: 0.6, fontSize: 15, lineHeight: 1.6, marginBottom: 30, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                {hi 
                  ? "जो विचार आपको जगाए हुए हैं, उन्हें यहां रखें। फिर उन्हें अंधेरे में जलने दें।" 
                  : "Leave the thoughts keeping you awake here. Then let them burn away in the dark."}
              </p>

              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder={hi ? "मुझे चिंता है..." : "I am holding onto..."}
                style={{
                  width: '100%', height: '120px', backgroundColor: 'transparent',
                  border: `1px solid ${faintBorder}`, borderRadius: '12px',
                  color: dimAmber, padding: '16px', fontSize: '16px',
                  fontFamily: 'inherit', resize: 'none', outline: 'none',
                  opacity: 0.8
                }}
              />

              <button 
                onClick={handleBurn}
                disabled={!thought.trim()}
                style={{
                  marginTop: 24, background: 'transparent', border: `1px solid ${dimAmber}`,
                  color: dimAmber, padding: '10px 40px', borderRadius: 30,
                  fontSize: 16, cursor: 'pointer', letterSpacing: 2, opacity: thought ? 1 : 0.3,
                  transition: 'opacity 0.3s'
                }}
              >
                {hi ? "छोड़ दें" : "RELEASE"}
              </button>
            </div>
          ) : (
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: dimAmber,
              lineHeight: 1.5, wordWrap: 'break-word'
            }}>
              {/* Particle Effect: Breaking text into characters */}
              {thought.split('').map((char, index) => {
                const randomX = (Math.random() - 0.5) * 80; 
                const randomDelay = Math.random() * 1.5; 
                
                return (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'pre-wrap',
                      '--rx': `${randomX}px`, 
                      animation: `burnLetter 5s ease-in forwards`,
                      animationDelay: `${randomDelay}s`
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </p>
          )
        )}
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.3, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes burnLetter {
          0% { 
            opacity: 1; 
            color: ${dimAmber}; 
            transform: translate(0, 0) scale(1); 
            filter: blur(0px); 
          }
          20% { 
            color: #ff8c00; 
            transform: translate(0, -5px) scale(1.1); 
            filter: blur(1px); 
          }
          100% { 
            opacity: 0; 
            color: #2a0f05; 
            transform: translate(var(--rx), -150px) scale(0.4); 
            filter: blur(12px); 
          }
        }
      `}</style>
    </div>
  );
}