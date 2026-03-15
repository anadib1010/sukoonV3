import React, { useState } from 'react';
import { PageNav } from '../../components/SharedUI';

const PREFIXES = [
  { id: 'realized', en: "Today I realized...", hi: "आज मैंने महसूस किया कि..." },
  { id: 'sitting', en: "A thought I am sitting with:", hi: "एक विचार जिसके साथ मैं हूँ:" },
  { id: 'learning', en: "I am learning to...", hi: "मैं सीख रहा हूँ..." },
  { id: 'feeling', en: "I am feeling...", hi: "मैं महसूस कर रहा हूँ..." },
  { id: 'struggling', en: "I am struggling with...", hi: "मैं इस बात से जूझ रहा हूँ..." },
  { id: 'letting_go', en: "Letting go of...", hi: "मैं मुक्त कर रहा हूँ..." },
  { id: 'win', en: "A small win today:", hi: "आज की एक छोटी जीत:" },
  { id: 'grateful', en: "I am grateful for...", hi: "मैं आभारी हूँ..." },
  { id: 'smile', en: "Something that made me smile:", hi: "जिसने मुझे खुशी दी:" },
  { id: 'share', en: "Just wanted to share:", hi: "बस साझा करना चाहता था:" },
  { id: 'love', en: "Sending love to anyone who...", hi: "उन सभी को प्यार जो..." }
];

// Mock data to visualize the board
const MOCK_POSTS = [
  { id: 1, prefix: "Today I realized...", text: "that I don't have to carry everything all at once.", time: "2h ago" },
  { id: 2, prefix: "I am struggling with...", text: "finding quiet time for myself in a noisy house.", time: "4h ago" },
  { id: 3, prefix: "Just wanted to share:", text: "the morning air felt really crisp today. It was nice.", time: "5h ago" },
];

export function CommunityRoom({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [selectedPrefix, setSelectedPrefix] = useState(PREFIXES[0]);
  const [postText, setPostText] = useState("");

  // Determine theme properties for glassmorphism
  const bgM = T.bg.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const isDark = bgM ? (parseInt(bgM[1], 16) * 0.299 + parseInt(bgM[2], 16) * 0.587 + parseInt(bgM[3], 16) * 0.114) < 128 : true;
  const glass = {
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.60)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.5)",
    borderRadius: 16,
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    // In the future, this is where you'd send the post to your database
    console.log("Posting:", `${hi ? selectedPrefix.hi : selectedPrefix.en} ${postText}`);
    setPostText(""); 
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        
        {/* ── Header ── */}
        <div style={{ padding: "24px 24px 8px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400, color: T.text, fontFamily: "'Cormorant Garamond', serif" }}>
            {hi ? "समुदाय" : "Community"}
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: T.muted, lineHeight: 1.4 }}>
            {hi 
              ? "एक शांत जगह साझा करने और देखे जाने के लिए। कोई निर्णय नहीं, कोई सलाह नहीं।" 
              : "A quiet space to share and be seen. No judgment, no fixing."}
          </p>
        </div>

        {/* ── Composer Area ── */}
        <div style={{ padding: "16px 24px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
          
          {/* Prefix Scroll Row */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {PREFIXES.map(p => {
              const isSelected = selectedPrefix.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrefix(p)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    cursor: "pointer",
                    background: isSelected ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)") : "transparent",
                    border: isSelected ? `1px solid ${T.accent}` : (isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)"),
                    color: isSelected ? T.text : T.muted,
                    transition: "all 0.2s ease"
                  }}
                >
                  {hi ? p.hi : p.en}
                </button>
              );
            })}
          </div>

          {/* Input Area */}
          <div style={{ ...glass, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>
              {hi ? selectedPrefix.hi : selectedPrefix.en}
            </span>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={hi ? "यहाँ धीरे से लिखें..." : "Write gently here..."}
              style={{
                background: "transparent", border: "none", outline: "none", resize: "none",
                minHeight: 60, fontSize: 14, color: T.text, fontFamily: "inherit", lineHeight: 1.5
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handlePost}
                disabled={!postText.trim()}
                style={{
                  background: postText.trim() ? T.accent : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                  color: postText.trim() ? "#fff" : T.muted,
                  border: "none", padding: "8px 20px", borderRadius: 20, fontSize: 13, cursor: postText.trim() ? "pointer" : "default",
                  transition: "all 0.3s ease"
                }}
              >
                {hi ? "साझा करें" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Community Board (Quiet Witness) ── */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {MOCK_POSTS.map(post => (
            <div key={post.id} style={{ ...glass, padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{post.prefix}</span>
              <p style={{ margin: 0, fontSize: 15, color: T.text, lineHeight: 1.6, fontFamily: "'Cormorant Garamond', serif" }}>
                {post.text}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: T.muted, opacity: 0.6 }}>{post.time}</span>
                {/* Heart / Witness icon - just visual for now */}
                <button style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 14, opacity: 0.7 }}>
                  🤍
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}