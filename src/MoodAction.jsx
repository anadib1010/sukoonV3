import React, { useState, useEffect } from 'react';

// 1. Updated Dictionary: Fixed 'Restless' and 'Sad' routing
const moodLibrary = {
  Heavy: {
    bgColor: "#4a0b19", // Maroon
    textColor: "#ffffff",
    message: "You're carrying something heavy.",
    cta: "A 2-minute breath might help.",
    primaryLabel: "Quick Return · 2 min",
    primaryTab: "practice",
    secondaryLabel: "Or burn it in Reflection",
    secondaryTab: "reflection"
  },
  Restless: { // FIXED: Changed from 'Frustrated' to 'Restless'
    bgColor: "#1a2332", // Twilight Blue
    textColor: "#ffffff",
    message: "Let this restless energy have somewhere to go.",
    cta: "Burn it or write it out.",
    primaryLabel: "Open Reflection",
    primaryTab: "reflection",
    secondaryLabel: "Or write in your journal",
    secondaryTab: "journal"
  },
  Exhausted: {
    bgColor: "#2c4c3b", // Deep Sage
    textColor: "#ffffff",
    message: "Acknowledging exhaustion takes courage.",
    cta: "A sleep meditation might be what you need.",
    primaryLabel: "Meditation Clips",
    primaryTab: "audio",
    secondaryLabel: "Or just rest",
    secondaryTab: "bench"
  },
  Okay: {
    bgColor: "#e8ede7", // Sage Sanctuary
    textColor: "#1a1a1a",
    message: "Steady is a good place to be.",
    cta: "Write a little — it helps.",
    primaryLabel: "Open your journal",
    primaryTab: "journal",
    secondaryLabel: "Or explore practices",
    secondaryTab: "practice"
  },
  Warm: {
    bgColor: "#f9e8e8", // Pink Champagne
    textColor: "#1a1a1a",
    message: "A warm feeling — hold it gently.",
    cta: "Write a little, or send warmth.",
    primaryLabel: "Send Warmth",
    primaryTab: "warmth", 
    secondaryLabel: "Or write in your journal",
    secondaryTab: "journal"
  },
  Sad: {
    bgColor: "#234035", // Sage Green
    textColor: "#ffffff",
    message: "Let go of it and be a witness.",
    cta: "Let it sink.",
    primaryLabel: "Write a message and let it sink in water",
    primaryTab: "focus", // FIXED: Now routes to the Focus games!
    secondaryLabel: "Or write your Journal",
    secondaryTab: "journal"
  }
};

export default function MoodAction({ selectedMood, goBack, setTab }) {
  const [aiTip, setAiTip] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const activeMood = moodLibrary[selectedMood];

  useEffect(() => {
    const fetchAiTip = async () => {
      if (!selectedMood) return;
      setIsLoading(true);
      try {
        const response = await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: selectedMood })
        });
        const data = await response.json();
        setAiTip(data.tip);
      } catch (error) {
        console.error("AI fetch failed", error);
        setAiTip("Take a gentle breath. You are in a safe space.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAiTip();
  }, [selectedMood]);

  if (!activeMood) return <div style={{ color: "white", padding: 20 }}>Mood not found.</div>;

  return (
    <div style={{ 
      minHeight: "100%", 
      padding: "40px 24px", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: activeMood.bgColor,
      color: activeMood.textColor,
      transition: "background-color 0.5s ease",
      position: "relative" // Ensure absolute positioning works for top buttons
    }}>
      
      {/* LEFT: Back Button */}
      <button 
        onClick={goBack}
        style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "inherit", opacity: 0.7, cursor: "pointer", fontSize: "16px" }}
      >
        ← Back
      </button>

      {/* RIGHT: Home Button (NEW) */}
      <button 
        onClick={() => setTab("home")}
        style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "inherit", opacity: 0.7, cursor: "pointer", fontSize: "16px" }}
      >
        Home ⌂
      </button>

      {/* Core Message */}
      <h1 style={{ fontSize: "28px", fontWeight: 300, textAlign: "center", marginBottom: "16px", fontFamily: "'Cormorant Garamond', serif" }}>
        {activeMood.message}
      </h1>
      
      {/* The AI Comfort Tip */}
      <div style={{ minHeight: "60px", display: "flex", alignItems: "center", marginBottom: "32px", textAlign: "center" }}>
        {isLoading ? (
          <p style={{ fontSize: "14px", fontStyle: "italic", opacity: 0.7 }}>Gathering a gentle thought...</p>
        ) : (
          <p style={{ fontSize: "15px", fontStyle: "italic", opacity: 0.9 }}>"{aiTip}"</p>
        )}
      </div>

      <p style={{ fontSize: "18px", marginBottom: "32px", opacity: 0.9 }}>{activeMood.cta}</p>

      {/* Routing Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "300px" }}>
        <button 
          onClick={() => setTab(activeMood.primaryTab)}
          style={{ backgroundColor: activeMood.textColor === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)", color: "inherit", padding: "16px", borderRadius: "16px", border: `1px solid ${activeMood.textColor}`, cursor: "pointer", fontSize: "16px" }}
        >
          {activeMood.primaryLabel}
        </button>
        
        <button 
          onClick={() => setTab(activeMood.secondaryTab)}
          style={{ backgroundColor: "transparent", color: "inherit", padding: "16px", borderRadius: "16px", border: "none", cursor: "pointer", opacity: 0.7, fontSize: "14px", textDecoration: "underline" }}
        >
          {activeMood.secondaryLabel}
        </button>
      </div>
    </div>
  );
}