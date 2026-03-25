import React, { useState, useEffect } from 'react';
// We are importing our Supabase "Postman" so we can talk to the database
import { supabase } from '../supabase';

// STEP 1: STATIC STYLES (Outside)
const staticStyles = {
  // We updated the header to be a 'flex' box so the Home button and Title sit nicely together
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
  // The shape and font of our new Home button
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
    fontFamily: "'DM Sans', sans-serif"
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
// NOTICE: We added 'setTab' inside the parentheses here so the page knows how to teleport!
export default function SukoonChat({ T, lang, setTab }) {
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]); 
  const [loading, setLoading] = useState(true);

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
    // Adding dynamic colors to our new Home button
    combinedHomeBtn: {
      ...staticStyles.homeBtn,
      backgroundColor: `${T.accent}20`, // A soft, transparent background
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
      cursor: 'pointer'
    }
  };

  return (
    <div style={dynamicStyles.container}>
      
      {/* The Header Area */}
      <div style={staticStyles.header}>
        {/* OUR NEW HOME BUTTON */}
        <button 
          style={dynamicStyles.combinedHomeBtn}
          onClick={() => setTab('home')} // This is the teleportation spell!
        >
          {lang === "Hindi" ? "होम" : "HOME"}
        </button>

        {/* The Title */}
        <div style={staticStyles.headerTitle}>
          {lang === "Hindi" ? "सुकून टीम चैट" : "SUKOON TEAM CHAT"}
        </div>
        
        {/* An empty invisible box on the right to keep the title perfectly centered */}
        <div style={{ width: '60px' }}></div>
      </div>

      {/* The Area where messages or rooms show up */}
      <div style={staticStyles.chatBox}>
        {loading ? (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading secure connection...</p>
        ) : (
          <>
            <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '20px' }}>
              Available Rooms:
            </p>
            {rooms.map((room) => (
              <div key={room.id} style={dynamicStyles.roomCard}>
                📁 {room.name}
              </div>
            ))}
          </>
        )}
      </div>

      {/* The Area where you type */}
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

    </div>
  );
}