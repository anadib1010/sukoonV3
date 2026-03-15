// ─── YAKSHA GATE COMPONENT (REVISED FOR ALIGNMENT) ───
function YakshaGate({ lang, T, onUnlock, onCancel }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const MASTER_KEY = "SUKOON2026";
  const isHindi = lang === "Hindi";

  const handleCheck = () => {
    if (input.toUpperCase() === MASTER_KEY) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div style={{ 
      height: "100%", width: "100%", 
      display: "flex", flexDirection: "column", 
      alignItems: "center", justifyContent: "center", // Perfect Centering
      padding: 40, textAlign: "center", 
      background: "#050508",
      position: "relative"
    }}>
      {/* Back Button */}
      <button 
        onClick={onCancel} 
        style={{ 
          position: 'absolute', top: 30, left: 30, 
          background: 'none', border: 'none', 
          color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
          fontSize: 14, fontFamily: "'Cormorant Garamond', serif"
        }}
      >
        ← {isHindi ? "वापस" : "Back"}
      </button>
      
      {/* The Guardian Icon */}
      <div style={{ fontSize: 32, marginBottom: 20, opacity: 0.5 }}>⚖️</div>
      
      {/* The Yaksha's Question */}
      <h2 style={{ 
        fontFamily: "'Cormorant Garamond', serif", 
        fontSize: 24, color: '#fff', 
        fontWeight: 300, marginBottom: 50, 
        lineHeight: 1.6, maxWidth: 320 
      }}>
        {isHindi 
          ? '"क्या आपके पास अगले स्तर, शांत स्थान की कुंजी है?"' 
          : '"Do you have the key to the next level, the Quieter Place?"'}
      </h2>

      {/* Input Field */}
      <div style={{ 
        width: '100%',
        transform: error ? 'translateX(10px)' : 'none', 
        transition: 'transform 0.1s',
        marginBottom: 20
      }}>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isHindi ? "कोड यहाँ लिखें" : "TYPE CODE HERE"}
          style={{ 
            background: 'transparent', border: 'none', 
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)', 
            color: '#d4af37', textAlign: 'center', 
            fontSize: 18, letterSpacing: 6, 
            outline: 'none', width: '220px', 
            paddingBottom: 10
          }}
        />
      </div>

      {/* Proceed Button */}
      <button 
        onClick={handleCheck} 
        style={{ 
          background: 'transparent', border: '1px solid #d4af37', 
          color: '#d4af37', padding: '12px 45px', 
          borderRadius: 30, fontSize: 13, 
          letterSpacing: 2, cursor: 'pointer',
          marginTop: 10,
          transition: 'all 0.3s ease'
        }}
      >
        {isHindi ? "प्रवेश करें" : "PROCEED"}
      </button>

      {/* Access Key - Placed directly below button */}
      <div style={{ 
        marginTop: 25, 
        opacity: 0.25, 
        fontSize: 11, 
        color: '#fff', 
        letterSpacing: 1.5,
        fontFamily: 'monospace' 
      }}>
        KEY: <span style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>{MASTER_KEY}</span>
      </div>

      <style>{`
        input::placeholder {
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}