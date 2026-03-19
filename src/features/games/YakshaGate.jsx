// ─── YAKSHA GATE COMPONENT (THE UNBREAKABLE CENTER) ───
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
      // ✅ Step 1: Create a Black Curtain that covers the WHOLE screen
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      height: "100dvh", 
      zIndex: 99999, 
      background: "#050508",
      margin: 0,
      padding: 0,
      overflow: "hidden"
    }}>
      
      {/* ✅ Step 2: The Content Box (This is what we center perfectly) */}
      <div style={{ 
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)", // 🎯 The "Mathematical Center"
        width: "90%",
        maxWidth: "340px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box"
      }}>
        
        {/* Back Button */}
        <button 
          onClick={onCancel} 
          style={{ 
            position: 'fixed', // Stay fixed relative to the screen
            top: 30, 
            left: 30, 
            background: 'none', 
            border: 'none', 
            color: 'rgba(255,255,255,0.3)', 
            cursor: 'pointer',
            fontSize: 14, 
            fontFamily: "'Cormorant Garamond', serif"
          }}
        >
          ← {isHindi ? "वापस" : "Back"}
        </button>
        
        {/* The Guardian Icon */}
        <div style={{ fontSize: 32, marginBottom: 20, opacity: 0.5 }}>⚖️</div>
        
        {/* The Yaksha's Question */}
        <h2 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: 24, 
          color: '#fff', 
          fontWeight: 300, 
          marginBottom: 40, 
          lineHeight: 1.6,
          width: "100%"
        }}>
          {isHindi 
            ? '"क्या आपके पास अगले स्तर की कुंजी है?"' 
            : '"Do you have the key to the next level?"'}
        </h2>

        {/* Input Field Area */}
        <div style={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: error ? 'translateX(10px)' : 'none', 
          transition: 'transform 0.1s',
          marginBottom: 30
        }}>
          <input 
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isHindi ? "कोड यहाँ लिखें" : "TYPE CODE HERE"}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              borderBottom: '1px solid rgba(212, 175, 55, 0.3)', 
              color: '#d4af37', 
              textAlign: 'center', 
              fontSize: 18, 
              letterSpacing: 6, 
              outline: 'none', 
              width: '200px', 
              paddingBottom: 10,
              borderRadius: 0 // 🍎 Prevents iPhone from rounding corners
            }}
          />
        </div>

        {/* Proceed Button */}
        <button 
          onClick={handleCheck} 
          style={{ 
            background: 'transparent', 
            border: '1px solid #d4af37', 
            color: '#d4af37', 
            padding: '12px 45px', 
            borderRadius: 30, 
            fontSize: 13, 
            letterSpacing: 2, 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {isHindi ? "प्रवेश करें" : "PROCEED"}
        </button>

        {/* Access Key */}
        <div style={{ 
          marginTop: 30, 
          opacity: 0.2, 
          fontSize: 10, 
          color: '#fff', 
          letterSpacing: 1.5,
          fontFamily: 'monospace' 
        }}>
          KEY: {MASTER_KEY}
        </div>
      </div>

      <style>{`
        input::placeholder {
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}