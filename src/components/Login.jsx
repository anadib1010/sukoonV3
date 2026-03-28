import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export function Login({ onLogin, T, lang, embedded = false }) {
  const hi = lang === "Hindi";

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [isSignUp, setIsSignUp]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [visible, setVisible]       = useState(false);
  const [forgotSent, setForgotSent]   = useState(false);
  const captchaRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ─── TURNSTILE CAPTCHA ───
  useEffect(() => {
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const renderWidget = () => {
      if (window.turnstile && captchaRef.current && !captchaRef.current.hasChildNodes()) {
        window.turnstile.render(captchaRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
          theme: 'dark',
          callback: (token) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(''),
        });
      }
    };
    renderWidget();
    const script = document.getElementById('cf-turnstile-script');
    script?.addEventListener('load', renderWidget);
    return () => script?.removeEventListener('load', renderWidget);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) { setMessage(error.message); setLoading(false); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (import.meta.env.PROD && !captchaToken) {
      setMessage(hi ? "कृपया CAPTCHA पूरा करें।" : "Please complete the CAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            captchaToken: captchaToken || undefined,
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        setMessage(hi ? "कृपया अपना ईमेल जांचें!" : "Check your email for a confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email, password,
          options: { captchaToken: captchaToken || undefined }
        });
        if (error) throw error;
        if (onLogin) onLogin();
      }
    } catch (error) {
      setMessage(error.message);
      if (window.turnstile) window.turnstile.reset();
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      setMessage("Enter your email above first, then tap Forgot password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) { setMessage(error.message); }
    else { setForgotSent(true); setMessage(""); }
  };

  // ─── STYLES ───
  const s = {
    outer: {
      height: embedded ? "auto" : "100vh",
      width: embedded ? "100%" : "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#080808",
      overflowX: "hidden",
    },

    inner: {
      width: "100%",
      height: "100%",
      maxWidth: "600px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: T.bg,
      color: T.text,
      padding: "20px",
      boxShadow: "0 0 50px rgba(0,0,0,0.55)",
      transition: "background 0.8s ease",
      position: "relative",
      overflow: "hidden",
    },

    ambientGlow: {
      position: "absolute",
      top: "15%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "280px",
      height: "200px",
      background: `radial-gradient(ellipse, ${T.accent}15 0%, transparent 70%)`,
      pointerEvents: "none",
      transition: "background 0.8s ease",
    },

    card: {
      width: "100%",
      maxWidth: "360px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      textAlign: "center",
      position: "relative",
      zIndex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    },

    titleWrap: { marginBottom: 4 },

    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "48px",
      color: T.accent,
      margin: "0 0 10px 0",
      fontWeight: 300,
      letterSpacing: "3px",
      lineHeight: 1,
    },

    subtitle: {
      opacity: 0.65,
      fontSize: "15px",
      margin: 0,
      color: T.textSoft,
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
    },

    messageBanner: {
      padding: "12px 16px",
      borderRadius: 12,
      background: `${T.accent}12`,
      border: `1px solid ${T.accent}40`,
      color: T.accent,
      fontSize: "14px",
      lineHeight: 1.5,
    },

    googleBtn: {
      width: "100%",
      padding: "15px 20px",
      borderRadius: "40px",
      background: T.text,
      color: T.bg,
      fontSize: "15px",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      transition: "transform 0.2s, box-shadow 0.2s",
      fontFamily: "'DM Sans', sans-serif",
    },

    googleIcon: { width: "20px", height: "20px" },

    divider: {
      display: "flex",
      alignItems: "center",
      opacity: 0.25,
      margin: "4px 0",
    },

    dividerLine: { flex: 1, height: "1px", background: T.text },

    dividerText: {
      padding: "0 12px",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "2px",
      color: T.text,
    },

    form: { display: "flex", flexDirection: "column", gap: "14px" },

    input: {
      width: "100%",
      padding: "15px 18px",
      borderRadius: "20px",
      background: `${T.accent}06`,
      border: `1px solid ${T.borderWarm || 'rgba(212,175,55,0.25)'}`,
      color: T.text,
      fontSize: "15px",
      outline: "none",
      fontFamily: "'DM Sans', sans-serif",
      transition: "border-color 0.2s, background 0.2s",
      boxSizing: "border-box",
    },

    captchaWrap: { display: "flex", justifyContent: "center" },

    submitBtn: {
      width: "100%",
      padding: "15px",
      borderRadius: "40px",
      background: "transparent",
      border: `1px solid ${T.accent}`,
      color: T.accent,
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
      marginTop: "4px",
      transition: "background 0.3s, transform 0.2s",
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: "0.5px",
    },

    forgotLink: {
      background: "none", border: "none",
      color: "rgba(255,255,255,0.4)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12, letterSpacing: "0.5px",
      cursor: "pointer", textDecoration: "underline",
      textUnderlineOffset: 3,
      alignSelf: "flex-end", marginTop: -8,
      padding: "4px 0",
    },
    sentMsg: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13, color: "rgba(100,220,140,0.9)",
      textAlign: "center", lineHeight: 1.5,
      padding: "12px 16px",
      background: "rgba(100,220,140,0.08)",
      borderRadius: 10, border: "1px solid rgba(100,220,140,0.2)",
    },
    toggleBtn: {
      background: "none",
      border: "none",
      color: T.textSoft || T.text,
      fontSize: "13px",
      cursor: "pointer",
      textDecoration: "underline",
      opacity: 0.7,
      marginTop: "4px",
      fontFamily: "'DM Sans', sans-serif",
      transition: "opacity 0.2s",
    },
  };

  return (
    <div style={s.outer}>
      <div style={s.inner}>

        {/* Ambient glow */}
        <div style={s.ambientGlow} />

        <div className="fade-in" style={s.card}>

          {/* Title */}
          <div style={s.titleWrap}>
            <h1 style={s.title}>JSukoon</h1>
            <p style={s.subtitle}>
              {hi ? "आपका निजी सुरक्षित स्थान।" : "Your private sanctuary."}
            </p>
          </div>

          {/* Message banner */}
          {message && <div style={s.messageBanner}>{message}</div>}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={s.googleBtn}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={s.googleIcon} />
            {hi ? "Google के साथ जारी रखें" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>{hi ? "या" : "OR"}</span>
            <div style={s.dividerLine} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} style={s.form}>
            <input
              type="email"
              placeholder={hi ? "ईमेल पता" : "Email address"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              maxLength={254}
              required
              style={s.input}
              onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = `${T.accent}10`; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.borderWarm || 'rgba(212,175,55,0.25)'; e.currentTarget.style.background = `${T.accent}06`; }}
            />
            <input
              type="password"
              placeholder={hi ? "पासवर्ड" : "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              maxLength={128}
              required
              style={s.input}
              onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = `${T.accent}10`; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.borderWarm || 'rgba(212,175,55,0.25)'; e.currentTarget.style.background = `${T.accent}06`; }}
            />

            {/* Forgot password — login mode only */}
            {!isSignUp && (
              forgotSent ? (
                <div style={s.sentMsg}>
                  ✓ Reset link sent — check your inbox.{" "}
                  <span style={{opacity:0.6}}>Check spam if you don't see it.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleForgot}
                  style={s.forgotLink}
                >
                  Forgot password?
                </button>
              )
            )}

            {/* Turnstile CAPTCHA */}
            <div ref={captchaRef} style={s.captchaWrap} />

            <button
              type="submit"
              disabled={loading}
              style={s.submitBtn}
              onMouseEnter={e => { e.currentTarget.style.background = `${T.accent}18`; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading
                ? (hi ? "प्रतीक्षा करें..." : "Loading...")
                : isSignUp
                  ? (hi ? "खाता बनाएं" : "Create Account")
                  : (hi ? "साइन इन करें" : "Sign In")}
            </button>

            {/* 🌟 Industry Standard Disclaimer Text */}
            <div style={{ textAlign: "center", marginTop: "4px", fontSize: "12px", color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              {hi ? "जारी रखकर, आप हमारी " : "By continuing, you agree to the "}
              <span
                onClick={e => { e.preventDefault(); window.open('/terms', '_blank'); }}
                style={{ color: T.accent, textDecoration: "underline", cursor: "pointer" }}
              >
                {hi ? "सेवा की शर्तों" : "Terms of Service"}
              </span>
              {hi ? " और " : " and "}
              <span
                onClick={e => { e.preventDefault(); window.open('/privacy', '_blank'); }}
                style={{ color: T.accent, textDecoration: "underline", cursor: "pointer" }}
              >
                {hi ? "गोपनीयता नीति" : "Privacy Policy"}
              </span>
              {hi 
                ? " से सहमत होते हैं और समझते हैं कि JSukoon एक सेल्फ-हेल्प टूल है, कोई चिकित्सा या पेशेवर सेवा नहीं।" 
                : " and understand that JSukoon is a self-help tool and not a medical or professional service."}
            </div>
          </form>

          {/* Toggle sign in / sign up */}
          <button
            onClick={() => { setIsSignUp(!isSignUp); }}
            style={s.toggleBtn}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
          >
            {isSignUp
              ? (hi ? "पहले से खाता है? साइन इन करें" : "Already have an account? Sign in")
              : (hi ? "खाता नहीं है? साइन अप करें" : "Don't have an account? Sign up")}
          </button>

        </div>
      </div>
    </div>
  );
}