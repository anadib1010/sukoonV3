import React, { useEffect, useRef } from 'react';

export function MeditationGuide({ sel, secs, T, lang, onSpeak }) {
  const total = sel.dur * 60;
  const elapsed = total - secs;
  const pct = elapsed / total;

  const hindiScripts = {
    1: [
      [0.0,  "आँखें धीरे से बंद करें। एक धीमी सांस लें।"],
      [0.1,  "दिन शुरू होने से पहले इस पल की शांति को महसूस करें।"],
      [0.25, "हर सांस के साथ, थोड़ी और गर्माहट अपने सीने में भरने दें।"],
      [0.5,  "आप यहाँ हैं। आप पर्याप्त हैं। दिन इंतज़ार कर सकता है।"],
      [0.75, "एक धीमा इरादा बनाएं — लक्ष्य नहीं, बस एक दिशा।"],
      [0.9,  "इस पल की रोशनी को धीरे-धीरे अपने साथ आगे ले जाने दें।"],
    ],
  };

  const scripts = {
    1: [
      [0.0,  "Close your eyes gently. Take a slow breath in."],
      [0.1,  "Feel the quiet of this moment before the day begins."],
      [0.25, "With each breath, let a little more warmth fill your chest."],
      [0.5,  "You are here. You are enough. The day can wait."],
      [0.75, "Begin to set one gentle intention — not a goal, just a direction."],
      [0.9,  "Slowly let the light of this moment carry you forward."],
    ],
  };

  const isHindi = lang === "Hindi";
  const activeScripts = isHindi ? hindiScripts : scripts;
  const lines = activeScripts[sel.id] || activeScripts[1];
  const currentLine = [...lines].reverse().find(([t]) => pct >= t)?.[1] || lines[0][1];

  const prevLineRef = useRef(null);

  useEffect(() => {
    if (!isHindi || !onSpeak) return;
    if (currentLine !== prevLineRef.current) {
      prevLineRef.current = currentLine;
      onSpeak(currentLine);
    }
  }, [currentLine, isHindi, onSpeak]);

  const s = {
    text: {
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: 16, color: T.textSoft, lineHeight: 1.8,
      textAlign: "center", maxWidth: 300, margin: "0 auto 28px",
      minHeight: 54, transition: "opacity 0.8s ease",
    },
  };

  return <p style={s.text}>{currentLine}</p>;
}
