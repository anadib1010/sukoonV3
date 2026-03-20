import React, { useState } from 'react';
import { PageNav } from '../../components/SharedUI';
import { useLS } from '../../hooks/useLS';
// ⚠️ Adjust this path to point exactly to your context file!
import { writeEmotionalCtx } from '../../utils/context'; 
import { supabase } from "../../supabase"; 

export function Reflection({ setTab, T, lang }) {
  const [thought, setThought] = useState("");
  const [animating, setAnimating] = useState(null); 
  const [particles, setParticles] = useState([]);
  
  const hi = lang === "Hindi";

  // --- SUPABASE HISTORY STATES ---
  const [viewingHistory, setViewingHistory] = useState(false);
  const [burntHistory, setBurntHistory] = useState([]);
  const [wishHistory, setWishHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // --- PARTICLE ENGINE & SUPABASE WRITER ---
  const triggerAnimation = async (type) => {
    if (!thought.trim()) return;
    setAnimating(type);

    // 1. Write to your custom context file
    writeEmotionalCtx(type, thought, { timestamp: Date.now() });

    // 2. 🔗 THE BRIDGE: Send the thought to Supabase
    const tableName = type === "burn" ? 'reflection_burns' : 'quiet_wishes';
    
    try {
      // 🕵️‍♂️ Step A: Get the current user's ID badge
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      // 🕵️‍♂️ Step B: Explicitly stamp the user_id onto the data
      const { error } = await supabase
        .from(tableName) 
        .insert([{ 
          content: thought,
          user_id: user.id 
        }]);

    } catch (err) {
    }

    // 3. Generate physics particles (Your original magic)
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      delay: Math.random() * 0.2 + "s",
      duration: Math.random() * 1.5 + 1 + "s",
      size: Math.random() * 6 + 4 + "px",
      xDrift: (Math.random() - 0.5) * 100 + "px" 
    }));
    setParticles(newParticles);

    // 4. Clear UI after animation completes
    setTimeout(() => {
      setAnimating(null);
      setThought("");
      setParticles([]);
    }, 2500);
  };
  const onFinish = () => {
  addCredits(10); // Reward for completing a session
  setTab("progress"); 
};
  // --- SUPABASE DELIVERY TRUCK (Fetches BOTH tables) ---
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // 🕵️‍♂️ Get user ID to ensure we fetch only our own data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [burnResponse, wishResponse] = await Promise.all([
        supabase.from('reflection_burns')
          .select('*')
          .eq('user_id', user.id) // Filter by your ID
          .order('created_at', { ascending: false }),
        supabase.from('quiet_wishes')
          .select('*')
          .eq('user_id', user.id) // Filter by your ID
          .order('created_at', { ascending: false })
      ]);

      if (!burnResponse.error) setBurntHistory(burnResponse.data || []);
      if (!wishResponse.error) setWishHistory(wishResponse.data || []);
    } catch (err) {
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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, color: T.text, position: "relative", overflow: "hidden" }}>
      
      {/* ─── INJECTED PHYSICS CSS ─── */}
      <style>{`
        @keyframes burnDrop {
          0% { transform: translate(0, 0) scale(1.5); opacity: 1; background: #ff4e00; border-radius: 50% 0 50% 50%; }
          50% { background: #ff9d00; border-radius: 50%; }
          100% { transform: translate(var(--xDrift), 250px) scale(0); opacity: 0; background: #333; }
        }
        @keyframes starRise {
          0% { transform: translate(0, 0) scale(1) rotate(45deg); opacity: 1; background: #fff; box-shadow: 0 0 10px #fff; }
          100% { transform: translate(var(--xDrift), -300px) scale(0.1) rotate(180deg); opacity: 0; background: #ffd700; box-shadow: 0 0 20px #ffd700; }
        }
        .text-dissolve { animation: dissolveOut 2s forwards; }
        @keyframes dissolveOut {
          0% { filter: blur(0px); opacity: 1; }
          50% { filter: blur(4px); opacity: 0.5; transform: scale(0.98); }
          100% { filter: blur(10px); opacity: 0; transform: scale(0.95); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* HEADER: PageNav + Moved History Button */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <PageNav 
          onBack={() => { viewingHistory ? setViewingHistory(false) : setTab("yakshagate"); }} 
          onHome={() => setTab("home")} 
          T={T} 
          lang={lang} 
        />
        
        {!animating && (
          <button 
            onClick={toggleHistory} 
            style={{ 
              position: 'absolute', 
              top: '75px', 
              right: '20px', 
              background: 'transparent', 
              border: `1px solid ${T.borderWarm}`, 
              borderRadius: '20px',
              padding: '6px 16px',
              color: T.text, 
              opacity: 0.8, 
              cursor: 'pointer', 
              fontSize: '14px',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            {viewingHistory ? (hi ? "वापस जाएं" : "Go Back") : (hi ? "इतिहास" : "History")}
          </button>
        )}
      </div>
      
      <div style={{ flex: 1, padding: "30px", display: "flex", flexDirection: "column", position: "relative" }}>
        
        {viewingHistory ? (
          /* --- CLOUD HISTORY VIEW (Two Columns) --- */
          <div style={{ animation: 'fadeIn 0.5s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: T.text, fontWeight: 300, marginBottom: "20px", textAlign: "center" }}>
              {hi ? "आपकी यादें" : "Your Reflections"}
            </h2>
            
            {isLoadingHistory ? (
              <p style={{ color: T.text, opacity: 0.5, textAlign: "center" }}>{hi ? "यादें ला रहा हूँ..." : "Gathering memories..."}</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1, overflowY: 'hidden' }}>
                
                {/* COLUMN 1: THE ASHES */}
                <div style={{ overflowY: 'auto', paddingRight: '10px', borderRight: `1px solid ${T.borderWarm}` }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#ff4e00", opacity: 0.8, fontSize: '20px', borderBottom: `1px solid ${T.borderWarm}`, paddingBottom: '10px', marginTop: 0 }}>
                    🔥 {hi ? "राख" : "The Ashes"}
                  </h3>
                  {burntHistory.length === 0 ? (
                    <p style={{ color: T.text, opacity: 0.4, fontSize: '14px' }}>{hi ? "खाली" : "Empty"}</p>
                  ) : (
                    burntHistory.map((item) => (
                      <div key={item.id} style={{ padding: '10px 0', borderBottom: `1px dashed ${T.borderWarm}`, textAlign: 'left' }}>
                        <p style={{ color: T.textSoft, fontSize: '12px', margin: '0 0 4px 0' }}>{new Date(item.created_at).toLocaleDateString(hi ? 'hi-IN' : 'en-US')}</p>
                        <p style={{ color: T.text, opacity: 0.8, fontSize: '15px', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>"{item.content}"</p>
                      </div>
                    ))
                  )}
                </div>

                {/* COLUMN 2: THE STARS */}
                <div style={{ overflowY: 'auto', paddingLeft: '10px' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: T.accent, opacity: 0.8, fontSize: '20px', borderBottom: `1px solid ${T.borderWarm}`, paddingBottom: '10px', marginTop: 0 }}>
                    ✨ {hi ? "सितारे" : "The Stars"}
                  </h3>
                  {wishHistory.length === 0 ? (
                    <p style={{ color: T.text, opacity: 0.4, fontSize: '14px' }}>{hi ? "खाली" : "Empty"}</p>
                  ) : (
                    wishHistory.map((item) => (
                      <div key={item.id} style={{ padding: '10px 0', borderBottom: `1px dashed ${T.borderWarm}`, textAlign: 'left' }}>
                         <p style={{ color: T.textSoft, fontSize: '12px', margin: '0 0 4px 0' }}>{new Date(item.created_at).toLocaleDateString(hi ? 'hi-IN' : 'en-US')}</p>
                        <p style={{ color: T.text, opacity: 0.9, fontSize: '15px', margin: 0, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>"{item.content}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          
          /* --- YOUR ORIGINAL INPUT VIEW --- */
          <>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 300, margin: "0 0 8px" }}>
                {hi ? "पवित्र स्थान" : "Sacred Space"}
              </h2>
              <p style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.6 }}>
                {hi ? "लिखें, सहेजें, या जाने दें" : "Record, Save, or Release"}
              </p>
            </div>

            <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <textarea
                className={animating ? "text-dissolve" : ""}
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                disabled={!!animating}
                placeholder={hi ? "अपने विचार या इच्छा यहाँ लिखें..." : "Record your thought or wish here..."}
                style={{ width: "100%", height: "250px", background: "transparent", border: "none", color: T.text, fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", textAlign: "center", outline: "none", resize: "none", lineHeight: "1.4" }}
              />

              {animating && particles.map(p => (
                <div key={p.id} style={{
                  position: "absolute", top: animating === 'burn' ? "40%" : "60%", left: p.left, width: p.size, height: p.size,
                  animationName: animating === 'burn' ? 'burnDrop' : 'starRise', animationDuration: p.duration, animationDelay: p.delay, animationFillMode: "forwards",
                  animationTimingFunction: animating === 'burn' ? "cubic-bezier(0.4, 0, 1, 1)" : "ease-out", '--xDrift': p.xDrift 
                }} />
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                {/* BURN BUTTON */}
                <button onClick={() => triggerAnimation('burn')} disabled={!thought.trim() || !!animating} style={{ flex: 1, padding: "18px", borderRadius: "16px", background: "rgba(255, 78, 0, 0.08)", border: "1px solid rgba(255, 78, 0, 0.3)", color: "#ff7333", cursor: "pointer", opacity: thought.trim() && !animating ? 1 : 0.4, transition: "all 0.3s" }}>
                  <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>🔥</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600 }}>{hi ? "जलाएं" : "Burn"}</span>
                </button>
                {/* WISH BUTTON */}
                <button onClick={() => triggerAnimation('wish')} disabled={!thought.trim() || !!animating} style={{ flex: 1, padding: "18px", borderRadius: "16px", background: `${T.accent}15`, border: `1px solid ${T.accent}50`, color: T.accent, cursor: "pointer", opacity: thought.trim() && !animating ? 1 : 0.4, transition: "all 0.3s" }}>
                  <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>✨</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600 }}>{hi ? "शांत इच्छा" : "Quiet Wish"}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}