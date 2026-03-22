import React from 'react';

export function BackButton({ setTab, destination = 'home', T, lang }) {
  // We check if the background is light so the arrow icon stays visible
  const isLight = T.bg === "#ffffff" || T.bg.includes("f") || T.bg.includes("e"); 
  const arrowColor = isLight ? "#111111" : "#ffffff";

  const s = {
    button: {
      position: "fixed",     // Glues the button to the screen
      bottom: "30px",        // Perfect height for the thumb
      left: "24px",          // Perfect distance from the left edge
      width: "56px", 
      height: "56px",
      borderRadius: "28px",  // Makes it a perfect circle
      background: `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}40 100%)`,
      border: `1px solid ${T.accent}40`,
      color: arrowColor,
      fontSize: "24px",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
      zIndex: 1000,          // Guarantees it floats ON TOP of everything else
      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
    }
  };

  const handleHover = (e, isEnter) => {
    if (isEnter) {
      e.currentTarget.style.transform = "scale(1.08) translateY(-2px)";
      e.currentTarget.style.border = `1px solid ${T.accent}80`;
      e.currentTarget.style.background = `linear-gradient(135deg, ${T.accent}20 0%, ${T.accent}60 100%)`;
    } else {
      e.currentTarget.style.transform = "scale(1) translateY(0)";
      e.currentTarget.style.border = `1px solid ${T.accent}40`;
      e.currentTarget.style.background = `linear-gradient(135deg, ${T.bg} 0%, ${T.accent}40 100%)`;
    }
  };

  return (
    <button 
      onClick={() => setTab(destination)} 
      style={s.button}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
      aria-label={lang === "Hindi" ? "वापस" : "Go Back"}
    >
      ←
    </button>
  );
}