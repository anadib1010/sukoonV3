import React from 'react';

export function Sleep({ setTab, T, lang }) {
  const hi = lang === "Hindi";

  // Strict Zero-Light Aesthetics
  const trueBlack = "#000000";
  const dimAmber = "rgba(184, 93, 25, 0.75)"; 
  const faintBorder = "rgba(184, 93, 25, 0.15)";

  const SLEEP_FEATURES = [
    { 
      id: 'sleep_scrambler', 
      name: 'Dream Scrambler', nameH: 'सपनों का क्रम', 
      desc: 'Randomized visualization to short-circuit racing thoughts.', 
      descH: 'विचारों को शांत करने के लिए यादृच्छिक दृश्य।' 
    },
    { 
      id: 'sleep_ember', 
      name: 'Dimming Ember', nameH: 'बुझता हुआ अंगारा', 
      desc: '4-7-8 breathing with a barely visible visual anchor.', 
      descH: '4-7-8 श्वास अभ्यास।' 
    },
    { 
      id: 'sleep_scan', 
      name: 'Heavy Scan', nameH: 'गहरी शांति', 
      desc: 'Progressive muscle relaxation to release physical tension.', 
      descH: 'शारीरिक तनाव दूर करने के लिए।' 
    },
    { 
      id: 'sleep_beat', 
      name: 'Heartbeat Entrainment', nameH: 'हृदय की लय', 
      desc: 'Deep brown noise and descending delta pulses (Audio only).', 
      descH: 'गहरी ध्वनि और डेल्टा तरंगें (केवल ऑडियो)।' 
    },
    { 
      id: 'sleep_fire', 
      name: 'Midnight Fire', nameH: 'आधी रात की आग', 
      desc: 'Whisper your worries to the dark and let them burn away.', 
      descH: 'अपनी चिंताओं को फुसफुसाएं और उन्हें जलने दें।' 
    }
  ];

  return (
    <div style={{ 
      height: "100%", background: trueBlack, color: dimAmber, 
      overflowY: "auto", display: "flex", flexDirection: "column" 
    }}>
      
      {/* Custom Minimal Nav - No bright buttons */}
      <div style={{ padding: "24px 20px", opacity: 0.6 }}>
        <button 
          onClick={() => setTab('home')} 
          style={{ background: 'none', border: 'none', color: dimAmber, fontSize: 14, cursor: 'pointer' }}
        >
          ← {hi ? 'वापस' : 'Back'}
        </button>
      </div>

      <div style={{ padding: "0 24px 60px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, margin: "0 0 8px 0" }}>
          {hi ? "नींद" : "Sleep"}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.6, margin: "0 0 40px 0", lineHeight: 1.5 }}>
          {hi 
            ? "यहाँ प्रकाश न्यूनतम है। एक अभ्यास चुनें और अपने फोन की चमक कम कर दें।" 
            : "Light is strictly minimized here. Turn down your phone brightness and select a practice."}
        </p>

        {/* Feature Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {SLEEP_FEATURES.map(feature => (
            <button
              key={feature.id}
              onClick={() => setTab(feature.id)}
              style={{
                textAlign: "left", background: "transparent",
                border: `1px solid ${faintBorder}`,
                borderRadius: 12, padding: "18px",
                cursor: "pointer", transition: "background 0.2s"
              }}
            >
              <div style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", marginBottom: 6, color: dimAmber }}>
                {hi ? feature.nameH : feature.name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.5, color: dimAmber, lineHeight: 1.4 }}>
                {hi ? feature.descH : feature.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}