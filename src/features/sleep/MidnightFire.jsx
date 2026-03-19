import React, { useState } from 'react';
import { supabase } from "../../supabase";

export function MidnightFire({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [thought, setThought] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  
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
    audio.volume = 0.2; 
    audio.play().catch(() => console.log("Sound ready!"));

    // 1. Start Animation
    setIsBurning(true);
    
    // 2. Gentle Vibration
    if (navigator.vibrate) {
      navigator.vibrate(40); 
    }

    // 3. Send to Mumbai (Database)
    try {
      const { error } = await supabase
        .from('midnight_fire_burns') // ✅ Updated table name to match database
        .insert([{ content: thought }]);
        
      if (error) console.error("Database Error:", error.message);
    } catch (err) {
      console.error("System Error:", err);
    }

    // 4. Cleanup
    setTimeout(() => {
      setThought("");
      setIsBurning(false);
    }, 5000); 
  };

  // THE FETCH TRUCK
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // ✅ FIXED: Removed the extra semicolon that was causing the crash
      const { data, error } = await supabase
        .from('midnight_fire_burns') 
        .select('*')
        .order('created_at', { ascending: false }); 
        
      if (!error) {
        setBurntHistory(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
        <button 
          onClick={() => { viewingHistory ? setViewingHistory(false) : setTab('Sleep'); }} 
          style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}
        >
          ← {hi ? 'वापस' : 'Back'}
        </button>
        
        {!isBurning && (
          <button 
            onClick={toggleHistory} 
            style={{ background: 'none', border: 'none', color: dimAmber, opacity: 0.6, cursor: 'pointer', fontSize: 16 }}
          >
            {viewingHistory ? (hi ? "आग पर वापस" : "Back to Fire") : (hi ? "राख (इतिहास)" : "The Ashes")}
          </button>
        )}
      </div>

      <div style={{ width: '85%', maxWidth: 400, textAlign: 'center', marginTop: "40px" }}>
        
        {/* ─── THE HISTORY VIEW ─── */}
        {viewingHistory ? (
          <div style={{ animation: 'fadeIn 0.5s ease', height: '60vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 24 }}>
              {hi ? "राख" : "The Ashes"}
            </h2>
            
            {isLoadingHistory ? (
              <p style={{ color: dimAmber, opacity: 0.5 }}>{hi ? "ला रहा हूँ..." : "Gathering..."}</p>
            ) : burntHistory.length === 0 ? (
              <p style={{ color: dimAmber, opacity: 0.5 }}>{hi ? "खाली" : "Empty"}</p>
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
          
          /* ─── THE FIRE VIEW ─── */
          !isBurning ? (
            <div style={{ animation: 'fadeIn 2s ease' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: dimAmber, fontWeight: 300, marginBottom: 16 }}>
                {hi ? "आधी रात की आग" : "Midnight Fire"}
              </h2>
              
              <textarea 
                value={thought} 
                onChange={(e) => setThought(e.target.value)} 
                placeholder={hi ? "मुझे चिंता है..." : "I am holding onto..."} 
                style={{ 
                  width: '100%', 
                  height: '120px', 
                  backgroundColor: 'transparent', 
                  border: `1px solid ${faintBorder}`, 
                  borderRadius: '12px', 
                  color: dimAmber, 
                  padding: '16px', 
                  fontSize: '16px', 
                  fontFamily: 'inherit', 
                  resize: 'none', 
                  outline: 'none', 
                  opacity: 0.8 
                }} 
              />
              
              <button 
                onClick={handleBurn} 
                disabled={!thought.trim()} 
                style={{ 
                  marginTop: 24, 
                  background: 'transparent', 
                  border: `1px solid ${dimAmber}`, 
                  color: dimAmber, 
                  padding: '10px 40px', 
                  borderRadius: 30, 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  letterSpacing: 2, 
                  opacity: thought ? 1 : 0.3, 
                  transition: 'opacity 0.3s' 
                }}
              >
                🔥 {hi ? "छोड़ दें" : "RELEASE"}
              </button>
            </div>
          ) : (
            
            /* ─── THE ANIMATION ─── */
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: dimAmber, lineHeight: 1.5, wordWrap: 'break-word' }}>
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
                      animation: `ashFall 4s ease-in forwards`, 
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

      {/* ─── THE RESTORED DISCLAIMER ─── */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.3, fontSize: '11px', color: dimAmber }}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes ashFall {
          0% { opacity: 1; color: ${dimAmber}; transform: translate(0, 0) scale(1); filter: blur(0px); }
          30% { color: #ff4500; transform: translate(calc(var(--rx) / 2), 40px) scale(0.9); filter: blur(1px); }
          100% { opacity: 0; color: #1a0a00; transform: translate(var(--rx), 150px) scale(0.3); filter: blur(8px); }
        }
      `}</style>
    </div>
  );
}