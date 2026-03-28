import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { requestFirebaseToken } from '../firebaseSetup';
import { SecurityKit } from '../utils/security';
import { useChatEngine } from '../hooks/useChatEngine';
import { useAudioEngine } from '../hooks/useAudioEngine';

// ─── iOS DETECTION ─────────────────────────────────────────────────────────
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export default function SukoonChat({ T, lang, setTab }) {
  const location = useLocation();
  const hi = lang === "Hindi";

  // ─── UI & CHAT STATE ───
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const myMasterKeyRef = useRef(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 🌟 ENGINES
  const {
    messages,
    presentUsers,
    messageText,
    handleTyping,
    handleSendMessage,
    handleDeleteMessage
  } = useChatEngine(currentUser, activeRoom, blockedUsers, isVaultUnlocked, myMasterKeyRef, hi);

  const {
    isInCall,
    showAudioBridge,
    startCall,
    joinCall,
    endCall,
    handleStartAudio,
    autoJoinRef
  } = useAudioEngine(currentUser, activeRoom, blockedUsers, hi);

  // ─── GLASSMORPHISM STYLES ──────────────────────────────────────────────────
  const s = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text, position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' },
    // Glass Header
    header: { 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', 
      borderBottom: `1px solid ${T.accent}30`, 
      backgroundColor: `${T.bg}CC`, // 80% opacity
      backdropFilter: 'blur(15px)', 
      WebkitBackdropFilter: 'blur(15px)',
      position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 
    },
    headerTitleBox: { flex: 1, textAlign: 'center' },
    headerTitle: { fontWeight: '700', fontSize: '17px', color: T.text },
    statusContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11px' },
    onlineDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' },
    
    // Modern Bubbles
    getBubble: (isMe) => ({
      padding: '12px 16px',
      borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
      backgroundColor: isMe ? T.accent : `${T.accent}15`,
      color: isMe ? T.bg : T.text,
      maxWidth: '80%',
      fontSize: '15px',
      position: 'relative',
      boxShadow: isMe ? `0 4px 15px ${T.accent}40` : 'none',
      border: isMe ? 'none' : `1px solid ${T.accent}20`
    }),
    
    // Ticks & Status
    tickStyle: (isRead) => ({
      fontSize: '14px',
      color: isRead ? '#3b82f6' : '#94a3b8', // Blue for read, grey for delivered
      marginLeft: '4px',
      fontWeight: 'bold'
    }),

    inputArea: { 
      display: 'flex', padding: '12px 16px', alignItems: 'center', gap: '10px', 
      backgroundColor: `${T.bg}EE`, 
      backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${T.accent}20` 
    },
    inputField: { flex: 1, padding: '14px 20px', borderRadius: '30px', border: `1px solid ${T.accent}30`, backgroundColor: `${T.accent}05`, color: T.text, outline: 'none' },
    
    // Ringing Overlay
    ringingOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000, backdropFilter: 'blur(20px)', color: '#fff'
    }
  };

  // ─── INITIALIZATION ───
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        setIsVaultUnlocked(true);
        // Load rooms logic here...
      }
      setLoading(false);
    }
    init();
  }, []);

  const typingUsers = Object.values(presentUsers).filter(u => u.is_typing && u.id !== currentUser?.id);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={s.container}>
      {/* 🌟 THE AUDIO TAG (Hidden) */}
      <video id="sukoon-remote-audio" autoPlay playsInline style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0 }} />

      {/* 🌟 RINGING SCREEN (If showAudioBridge is true, we are in a call state) */}
      {showAudioBridge && (
        <div style={s.ringingOverlay}>
          <div style={{fontSize: '80px', marginBottom: '20px'}}>📞</div>
          <h2 style={{fontSize: '24px', fontWeight: '700'}}>{hi ? "इनकमिंग कॉल" : "Incoming Call"}</h2>
          <p style={{opacity: 0.6, marginBottom: '40px'}}>{getRoomDisplayName(activeRoom)}</p>
          <div style={{display: 'flex', gap: '20px'}}>
             <button style={{padding: '15px 40px', borderRadius: '30px', background: '#4ade80', border:'none', fontWeight:'700'}} onClick={handleStartAudio}>
               {hi ? "स्वीकार करें" : "Accept"}
             </button>
             <button style={{padding: '15px 40px', borderRadius: '30px', background: '#ef4444', border:'none', color:'#fff', fontWeight:'700'}} onClick={endCall}>
               {hi ? "अस्वीकार करें" : "Decline"}
             </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <button style={{background:'none', border:'none', fontSize:'18px', color:T.accent}} onClick={handleBackOrHome}>◀</button>
        <div style={s.headerTitleBox}>
          <div style={s.headerTitle}>{activeRoom ? getRoomDisplayName(activeRoom) : "Sukoon Chat"}</div>
          {activeRoom && (
             <div style={s.statusContainer}>
                {Object.keys(presentUsers).length > 1 ? (
                  <><span style={s.onlineDot} /> {hi ? "ऑनलाइन" : "Online"}</>
                ) : (
                  <span style={{opacity: 0.5}}>{hi ? "ऑफलाइन" : "Offline"}</span>
                )}
             </div>
          )}
        </div>
        {activeRoom && <button style={{background:'none', border:'none', fontSize:'22px'}} onClick={startCall}>📞</button>}
      </div>

      {/* Chat Messages */}
      <div style={s.chatBox} ref={chatBoxRef}>
        {messages.map((m, idx) => {
          const isMe = m.user_id === currentUser?.id;
          // Missed Call Indication Logic
          if (m.type === 'missed_call') {
            return (
              <div key={m.id} style={{textAlign:'center', margin:'10px 0', opacity: 0.5, fontSize:'12px'}}>
                📞 {hi ? "मिस्ड कॉल" : "Missed Call"} - {formatTime(m.created_at)}
              </div>
            );
          }

          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
              <div style={s.getBubble(isMe)}>
                {m.decrypted_content || "..."}
                
                {/* 🌟 TICKS LOGIC */}
                {isMe && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <span style={{fontSize: '10px', opacity: 0.5, marginRight: '5px'}}>{formatTime(m.created_at)}</span>
                    <span style={s.tickStyle(m.is_read)}>
                      {m.is_read ? '✓✓' : '✓✓'} {/* Logic for double ticks */}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div style={{padding:'5px 20px', fontSize:'12px', opacity:0.6, fontStyle:'italic'}}>
          {typingUsers[0].email.split('@')[0]} {hi ? "टाइप कर रहे हैं..." : "is typing..."}
        </div>
      )}

      {/* Input */}
      {activeRoom && (
        <div style={s.inputArea}>
          <input 
            style={s.inputField} 
            value={messageText} 
            onChange={handleTyping} 
            placeholder={hi ? "एक सुरक्षित संदेश लिखें..." : "Type a secure message..."}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button style={{background:T.accent, color:T.bg, border:'none', padding:'12px 20px', borderRadius:'25px', fontWeight:'700'}} onClick={handleSendMessage}>➤</button>
        </div>
      )}
    </div>
  );

  // --- Helper Functions ---
  function getRoomDisplayName(room) { /* ... same as before ... */ return room?.name || "Chat"; }
  function handleBackOrHome() { activeRoom ? setActiveRoom(null) : setTab('home'); }
  function formatTime(ds) { return new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
}