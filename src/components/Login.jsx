import React, { useState } from 'react';
import { supabase } from '../supabase'; 

export function Login({ onLogin, T, lang }) {
  const hi = lang === "Hindi";
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🚪 DOOR #2: The VIP Google Scanner
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  // 🚪 DOOR #1: The Traditional Email Lock
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(hi ? "कृपया अपना ईमेल जांचें!" : "Check your email for a confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (onLogin) onLogin();
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ─── NEW PROFESSIONAL CENTERED WRAPPER ─── */
    <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: "#080808", overflowX: "hidden" }}>
      
      {/* ─── THE APP CONTAINER (Matches your main App exactly) ─── */}
      <div style={{ width: "100%", height: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, color: T.text, padding: "20px", boxShadow: "0 0 50px rgba(0,0,0,0.55)", transition: "background 0.8s ease" }}>
        
        <div className="fade-in" style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "24px", textAlign: "center" }}>
          
          {/* The App Logo / Title */}
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "42px", color: T.accent, margin: "0 0 10px 0" }}>
              Sukoon
            </h1>
            <p style={{ opacity: 0.7, fontSize: "16px", margin: 0 }}>
              {hi ? "आपका निजी सुरक्षित स्थान।" : "Your private sanctuary."}
            </p>
          </div>

          {/* Status Messages (Errors or Success) */}
          {message && (
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255, 78, 0, 0.1)", border: `1px solid ${T.accent}50`, color: T.accent, fontSize: "14px" }}>
              {message}
            </div>
          )}

          {/* VIP Google Button */}
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            style={{ width: "100%", padding: "16px", borderRadius: "40px", background: T.text, color: T.bg, fontSize: "16px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "transform 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "20px", height: "20px" }} />
            {hi ? "Google के साथ जारी रखें" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", opacity: 0.3, margin: "10px 0" }}>
            <div style={{ flex: 1, height: "1px", background: T.text }}></div>
            <span style={{ padding: "0 10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{hi ? "या" : "OR"}</span>
            <div style={{ flex: 1, height: "1px", background: T.text }}></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input 
              type="email" 
              placeholder={hi ? "ईमेल पता" : "Email address"} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "16px", borderRadius: "20px", background: "transparent", border: `1px solid ${T.borderWarm || 'rgba(212, 175, 55, 0.3)'}`, color: T.text, fontSize: "16px", outline: "none" }}
            />
            <input 
              type="password" 
              placeholder={hi ? "पासवर्ड" : "Password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "16px", borderRadius: "20px", background: "transparent", border: `1px solid ${T.borderWarm || 'rgba(212, 175, 55, 0.3)'}`, color: T.text, fontSize: "16px", outline: "none" }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: "100%", padding: "16px", borderRadius: "40px", background: "transparent", border: `1px solid ${T.accent}`, color: T.accent, fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "8px", transition: "background 0.3s" }}
              onMouseOver={(e) => e.currentTarget.style.background = `${T.accent}15`}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              {loading ? (hi ? "प्रतीक्षा करें..." : "Loading...") : (isSignUp ? (hi ? "खाता बनाएं" : "Create Account") : (hi ? "साइन इन करें" : "Sign In"))}
            </button>
          </form>

          {/* Toggle between Login and Sign Up */}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: "none", border: "none", color: T.textSoft || T.text, fontSize: "14px", cursor: "pointer", textDecoration: "underline", opacity: 0.8, marginTop: "10px" }}
          >
            {isSignUp 
              ? (hi ? "पहले से खाता है? साइन इन करें" : "Already have an account? Sign in") 
              : (hi ? "खाता नहीं है? साइन अप करें" : "Don't have an account? Sign up")
            }
          </button>

        </div>
      </div>
    </div>
  );
}