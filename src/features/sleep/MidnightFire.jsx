import React, { useState } from 'react';
import { supabase } from "../../supabase";

export function MidnightFire({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  const [thought,        setThought]        = useState("");
  const [isBurning,      setIsBurning]      = useState(false);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [burntHistory,   setBurntHistory]   = useState([]);
  const [isLoading,      setIsLoading]      = useState(false);

  const amber      = "rgba(184,93,25,0.85)";
  const faintBorder = "rgba(184,93,25,0.25)";

  const handleBurn = async () => {
    if (!thought.trim()) return;
    setIsBurning(true);
    if (navigator.vibrate) navigator.vibrate(40);
    try {
      await supabase.from('midnight_fire_burns').insert([{ content: thought }]);
    } catch {}
    setTimeout(() => { setThought(""); setIsBurning(false); }, 5000);
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('midnight_fire_burns')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setBurntHistory(data || []);
    } catch {} finally { setIsLoading(false); }
  };

  const toggleHistory = () => {
    if (!viewingHistory) fetchHistory();
    setViewingHistory(v => !v);
  };

  const s = {
    page:       { height: '100%', width: '100%', backgroundColor: '#000000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    nav:        { position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between' },
    navBtn:     { background: 'none', border: 'none', color: amber, opacity: 0.6, cursor: 'pointer', fontSize: 16, transition: 'opacity 0.2s' },
    inner:      { width: '85%', maxWidth: 400, textAlign: 'center', marginTop: 40 },
    histWrap:   { height: '60vh', overflowY: 'auto' },
    histTitle:  { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: amber, fontWeight: 300, marginBottom: 24 },
    histEmpty:  { color: amber, opacity: 0.5 },
    histList:   { display: 'flex', flexDirection: 'column', gap: 16 },
    histItem:   { borderBottom: `1px solid ${faintBorder}`, paddingBottom: 12, textAlign: 'left' },
    histDate:   { color: amber, opacity: 0.4, fontSize: 12, margin: '0 0 4px 0' },
    histText:   { color: amber, opacity: 0.8, fontSize: 16, margin: 0, fontFamily: "'Cormorant Garamond', serif" },
    fireWrap:   {},
    fireTitle:  { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: amber, fontWeight: 300, marginBottom: 16 },
    textarea:   { width: '100%', height: 120, backgroundColor: 'transparent', border: `1px solid ${faintBorder}`, borderRadius: 12, color: amber, padding: 16, fontSize: 16, fontFamily: 'inherit', resize: 'none', outline: 'none', opacity: 0.8, boxSizing: 'border-box' },
    burnBtn:    (active) => ({ marginTop: 24, background: 'transparent', border: `1px solid ${amber}`, color: amber, padding: '10px 40px', borderRadius: 30, fontSize: 16, cursor: 'pointer', letterSpacing: 2, opacity: active ? 1 : 0.3, transition: 'opacity 0.3s' }),
    ashText:    { fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: amber, lineHeight: 1.5, wordWrap: 'break-word' },
    disclaimer: { position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', opacity: 0.3, fontSize: 11, color: amber },
  };

  return (
    <div style={s.page}>
      <div style={s.nav}>
        <button
          onClick={() => viewingHistory ? setViewingHistory(false) : setTab('sleep')}
          style={s.navBtn}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ← {hi ? 'वापस' : 'Back'}
        </button>
        {!isBurning && (
          <button
            onClick={toggleHistory}
            style={s.navBtn}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          >
            {viewingHistory ? (hi ? "आग पर वापस" : "Back to Fire") : (hi ? "राख (इतिहास)" : "The Ashes")}
          </button>
        )}
      </div>

      <div style={s.inner}>
        {viewingHistory ? (
          <div style={s.histWrap}>
            <h2 style={s.histTitle}>{hi ? "राख" : "The Ashes"}</h2>
            {isLoading ? (
              <p style={s.histEmpty}>{hi ? "ला रहा हूँ..." : "Gathering..."}</p>
            ) : burntHistory.length === 0 ? (
              <p style={s.histEmpty}>{hi ? "खाली" : "Empty"}</p>
            ) : (
              <div style={s.histList}>
                {burntHistory.map(item => (
                  <div key={item.id} style={s.histItem}>
                    <p style={s.histDate}>{new Date(item.created_at).toLocaleDateString(hi ? 'hi-IN' : 'en-US')}</p>
                    <p style={s.histText}>{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !isBurning ? (
          <div style={s.fireWrap}>
            <h2 style={s.fireTitle}>{hi ? "देर रात तक काम करना" : "Midnight Fire"}</h2>
            <textarea
              value={thought}
              onChange={e => setThought(e.target.value)}
              placeholder={hi ? "मुझे चिंता है..." : "I am holding onto..."}
              style={s.textarea}
            />
            <button
              onClick={handleBurn}
              disabled={!thought.trim()}
              style={s.burnBtn(!!thought.trim())}
              onTouchStart={e => { if (thought.trim()) e.currentTarget.style.transform = 'scale(0.96)'; }}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔥 {hi ? "छोड़ दें" : "RELEASE"}
            </button>
          </div>
        ) : (
          <p style={s.ashText}>
            {thought.split('').map((char, i) => (
              <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre-wrap', '--rx': `${(Math.random() - 0.5) * 80}px`, animation: `ashFall 4s ease-in forwards`, animationDelay: `${Math.random() * 1.5}s` }}>
                {char}
              </span>
            ))}
          </p>
        )}
      </div>

      <p style={s.disclaimer}>
        {hi ? "यह एक साधारण ऐप है और कोई चिकित्सा या मनोवैज्ञानिक सलाह ऐप नहीं है।" : "This is a simple app and not a medical or psychological advice app."}
      </p>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ashFall {
          0%   { opacity: 1; color: ${amber}; transform: translate(0,0) scale(1); filter: blur(0px); }
          30%  { color: #ff4500; transform: translate(calc(var(--rx) / 2), 40px) scale(0.9); filter: blur(1px); }
          100% { opacity: 0; color: #1a0a00; transform: translate(var(--rx), 150px) scale(0.3); filter: blur(8px); }
        }
      `}</style>
    </div>
  );
}
