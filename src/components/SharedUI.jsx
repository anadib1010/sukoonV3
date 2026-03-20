import React from 'react';

// ─── ORB ──────────────────────────────────────────────────────────────
export function Orb({ size = 180, col, pulse = false, label }) {
  return (
    <div style={{
      position: "relative",
      width: size, height: size,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {/* Core orb */}
      <div style={{
        width: size, height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 38% 32%, ${col}55, ${col}20 45%, ${col}08 70%, transparent)`,
        border: `1.5px solid ${col}35`,
        boxShadow: `0 0 ${size * .35}px ${col}18, 0 0 ${size * .12}px ${col}30, inset 0 0 ${size * .2}px ${col}12`,
        animation: pulse ? "orbFloat 4.5s ease-in-out infinite" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .6s ease",
      }}>
        {label && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, letterSpacing: 2,
            color: col, opacity: .95,
          }}>
            {label}
          </span>
        )}
      </div>
      {/* Outer rings */}
      <div style={{
        position: "absolute",
        width: size * 1.35, height: size * 1.35,
        borderRadius: "50%",
        border: `1px solid ${col}18`,
        animation: pulse ? "orbRing 4.5s ease-in-out infinite .4s" : "none",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        width: size * 1.65, height: size * 1.65,
        borderRadius: "50%",
        border: `1px solid ${col}08`,
        animation: pulse ? "orbRing 4.5s ease-in-out infinite .9s" : "none",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── PAGE NAV ─────────────────────────────────────────────────────────
export function PageNav({ onBack, onHome, backLabel, T, lang }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: `calc(env(safe-area-inset-top, 0px) + 14px) 18px 10px`,
      background: `${T.bg}ee`,
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <button
        onClick={onBack}
        style={{
          background: "none", border: "none",
          display: "flex", alignItems: "center", gap: 5,
          color: T.muted, fontSize: 14, padding: "4px 0",
          cursor: "pointer", transition: "color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = T.text}
        onMouseLeave={e => e.currentTarget.style.color = T.muted}
      >
        ← {backLabel || (lang === "Hindi" ? "वापस" : "Back")}
      </button>

      {onHome && (
        <button
          onClick={onHome}
          style={{
            background: `${T.accent}15`,
            border: `1px solid ${T.accent}30`,
            borderRadius: 99, padding: "6px 14px",
            display: "flex", alignItems: "center", gap: 5,
            color: T.accent, fontSize: 13, cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${T.accent}25`}
          onMouseLeave={e => e.currentTarget.style.background = `${T.accent}15`}
        >
          🏡 {lang === "Hindi" ? "होम" : "Home"}
        </button>
      )}
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────
export function SectionLabel({ text, T }) {
  return (
    <p style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12, color: T.textSoft,
      letterSpacing: 2, textTransform: "uppercase",
      margin: "0 0 14px", fontWeight: 500,
    }}>
      {text}
    </p>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────
export function Card({ children, T, style = {} }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.borderWarm}`,
      borderRadius: 20, padding: 18,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── AMBIENT AURA ─────────────────────────────────────────────────────
export function AmbientAura({ T }) {
  return (
    <div style={{
      position: "fixed",
      top: "-20vh", left: "-20vw",
      width: "140vw", height: "140vh",
      background: `radial-gradient(circle at 30% 30%, ${T.accent}22 0%, ${T.accent}08 40%, transparent 70%)`,
      zIndex: 0, pointerEvents: "none",
      animation: "auraBreath 14s infinite alternate ease-in-out",
      transition: "background 0.8s ease",
    }} />
  );
}
