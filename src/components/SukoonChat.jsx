import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// STEP 1: STATIC STYLES (Outside)
const staticStyles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: '18px',
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: '2px',
    flex: 1,
    textAlign: 'center'
  },
  homeBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  chatBox: {
    flex: 1,
    padding: '20px',
    overflowY: 'scroll',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column'
  },
  inputField: {
    flex: 1,
    padding: '12px',
    borderRadius: '25px',
    border: 'none',
    marginRight: '10px',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif"
  },
  sendButton: {
    padding: '12px 24px',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif"
  }
};

// STEP 2: THE COMPONENT
export default function SukoonChat({ T, lang, setTab }) {
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // NEW: Our Magic Memory Box! It starts empty (null).
  const [activeRoom, setActiveRoom] = useState(null);

  // STEP 3: THE MAGIC FETCH
  useEffect(() => {
    async function setupChat() {
      let { data: existingRooms, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) {
        console.error("Error fetching rooms:", error);
        return;
      }

      if (existingRooms.length === 0) {
        const { data: newRoom, insertError } = await supabase
          .from('rooms')
          .insert([{ name: 'Main Team Board', type: 'public' }])
          .select();

        if (!insertError && newRoom) {
          setRooms(newRoom);
        }
      } else {
        setRooms(existingRooms);
      }
      setLoading(false);
    }

    setupChat();
  }, []);

  // STEP 4: DYNAMIC STYLES (Rule of T)
  const dynamicStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%', 
      backgroundColor: T.bg,
      color: T.text
    },
    combinedHomeBtn: {
      ...staticStyles.homeBtn,
      backgroundColor: `${T.accent}20`, 
      color: T.text,
      border: `1px solid ${T.accent}50`
    },
    inputArea: {
      display: 'flex',
      padding: '15px',
      backgroundColor: `${T.accent}15` 
    },
    combinedInput: {
      ...staticStyles.inputField,
      backgroundColor: T.bg,
      color: T.text,
      border: `1px solid ${T.accent}40`
    },
    combinedButton: {
      ...staticStyles.sendButton,
      backgroundColor: T.accent,
      color: T.bg 
    },
    roomCard: {
      padding: '15px',
      margin: '10px 0',
      borderRadius: '12px',
      border: `1px solid ${T.accent}40`,
      backgroundColor: `${T.accent}10`,
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    }
  };

  // NEW: A smart function for our top-left button
  const handleBackOrHome = () => {
    if (activeRoom) {
      // If we are inside a room, just go back to the folder list
      setActiveRoom(null);
    } else {
      // If we are looking at the folders, go back to the Sukoon Home screen
      setTab('home');
    }
  };

  return (
    <div style={dynamicStyles.container}>
      
      {/* The Header Area */}
      <div style={staticStyles.header}>
        {/* Our Smart Back/Home Button */}
        <button 
          style={dynamicStyles.combinedHomeBtn}
          onClick={handleBackOrHome} 
        >
          {lang === "Hindi" 
            ? (activeRoom ? "पीछे" : "होम") 
            : (activeRoom ? "BACK" : "HOME")}
        </button>

        {/* The Title changes depending on where we are! */}
        <div style={staticStyles.headerTitle}>
          {activeRoom 
            ? activeRoom.name 
            : (lang === "Hindi" ? "सुकून टीम चैट" : "SUKOON TEAM CHAT")}
        </div>
        
        <div style={{ width: '60px' }}></div>
      </div>

      {/* The Middle Area (Where the magic happens) */}
      <div style={staticStyles.chatBox}>
        {loading ? (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading secure connection...</p>
        ) : !activeRoom ? (
          /* --- VIEW 1: THE HALLWAY (Folder List) --- */
          <>
            <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '20px' }}>
              Available Rooms:
            </p>
            {rooms.map((room) => (
              <div 
                key={room.id} 
                style={dynamicStyles.roomCard}
                onClick={() => setActiveRoom(room)} // NEW: Clicking this puts the room in the Memory Box!
              >
                📁 {room.name}
              </div>
            ))}
          </>
        ) : (
          /* --- VIEW 2: INSIDE THE ROOM --- */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '14px', marginTop: '20px' }}>
              You are now inside the secure {activeRoom.name}.<br/>
              Messages will appear here soon!
            </p>
          </div>
        )}
      </div>

      {/* The Bottom Area where you type (Only show if inside a room!) */}
      {activeRoom && (
        <div style={dynamicStyles.inputArea}>
          <input 
            style={dynamicStyles.combinedInput} 
            type="text" 
            placeholder={lang === "Hindi" ? "एक सुरक्षित संदेश टाइप करें..." : "Type a secure message..."} 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button style={dynamicStyles.combinedButton}>
            {lang === "Hindi" ? "भेजें" : "Send"}
          </button>
        </div>
      )}

    </div>
  );
}