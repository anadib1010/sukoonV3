import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// ─── STATIC STYLES (Outside the component) ─────────────────────────────────
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
  messageList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
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

// ─── THE COMPONENT ────────────────────────────────────────────────────────
export default function SukoonChat({ T, lang, setTab }) {
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]); 
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: A memory box to hold all the text messages for the room we are inside!
  const [messages, setMessages] = useState([]);

  // 1. Fetch the Rooms (Runs once when the app opens)
  useEffect(() => {
    async function setupRooms() {
      let { data: existingRooms, error } = await supabase.from('rooms').select('*');
      if (!error && existingRooms.length === 0) {
        const { data: newRoom } = await supabase.from('rooms').insert([{ name: 'Main Team Board', type: 'public' }]).select();
        if (newRoom) setRooms(newRoom);
      } else if (!error) {
        setRooms(existingRooms);
      }
      setLoading(false);
    }
    setupRooms();
  }, []);

  // 2. THE WALKIE-TALKIE (Runs every time you click into a different room)
  useEffect(() => {
    // If we are not in a room, do nothing.
    if (!activeRoom) return;

    // First, ask the Postman for all old messages from this specific room
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', activeRoom.id) // Only get messages for THIS room
        .order('created_at', { ascending: true }); // Oldest at the top, newest at the bottom
      
      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Next, turn on the Walkie-Talkie to listen for brand new messages instantly
    const channel = supabase
      .channel('room-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
        (payload) => {
          // When a new message arrives, add it to our list!
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    // When we leave the room, turn the Walkie-Talkie off so we don't waste battery
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom]); // This magic trick tells the Walkie-Talkie to reset if we change rooms

  // 3. THE STAMP (Sending a message)
  const handleSendMessage = async () => {
    // If the box is empty, don't send anything
    if (!message.trim()) return;

    // Create the package
    const newMessage = {
      content: message,           // The words you typed
      room_id: activeRoom.id      // The bridge we built earlier!
    };

    // Send it to the Post Office
    const { error } = await supabase.from('messages').insert([newMessage]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      // Clear the typing box so you can type the next message
      setMessage("");
    }
  };

  // ─── DYNAMIC STYLES (Rule of T: Must stay inside) ────────────────────────
  const dynamicStyles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.bg, color: T.text },
    combinedHomeBtn: { ...staticStyles.homeBtn, backgroundColor: `${T.accent}20`, color: T.text, border: `1px solid ${T.accent}50` },
    inputArea: { display: 'flex', padding: '15px', backgroundColor: `${T.accent}15` },
    combinedInput: { ...staticStyles.inputField, backgroundColor: T.bg, color: T.text, border: `1px solid ${T.accent}40` },
    combinedButton: { ...staticStyles.sendButton, backgroundColor: T.accent, color: T.bg },
    roomCard: { padding: '15px', margin: '10px 0', borderRadius: '12px', border: `1px solid ${T.accent}40`, backgroundColor: `${T.accent}10`, cursor: 'pointer' },
    // A beautiful style for the message bubbles
    messageBubble: { padding: '10px 15px', borderRadius: '15px', backgroundColor: `${T.accent}20`, border: `1px solid ${T.accent}30`, maxWidth: '80%', alignSelf: 'flex-start', wordBreak: 'break-word' }
  };

  const handleBackOrHome = () => {
    if (activeRoom) setActiveRoom(null);
    else setTab('home');
  };

  return (
    <div style={dynamicStyles.container}>
      {/* HEADER */}
      <div style={staticStyles.header}>
        <button style={dynamicStyles.combinedHomeBtn} onClick={handleBackOrHome}>
          {lang === "Hindi" ? (activeRoom ? "पीछे" : "होम") : (activeRoom ? "BACK" : "HOME")}
        </button>
        <div style={staticStyles.headerTitle}>
          {activeRoom ? activeRoom.name : (lang === "Hindi" ? "सुकून टीम चैट" : "SUKOON TEAM CHAT")}
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* MIDDLE AREA */}
      <div style={staticStyles.chatBox}>
        {loading ? (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading secure connection...</p>
        ) : !activeRoom ? (
          /* THE HALLWAY (Folder List) */
          <>
            <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '20px' }}>Available Rooms:</p>
            {rooms.map((room) => (
              <div key={room.id} style={dynamicStyles.roomCard} onClick={() => setActiveRoom(room)}>
                📁 {room.name}
              </div>
            ))}
          </>
        ) : (
          /* INSIDE THE ROOM (Showing the Messages) */
          <div style={staticStyles.messageList}>
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '14px', marginTop: '20px' }}>
                This room is empty. Be the first to say hello!
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} style={dynamicStyles.messageBubble}>
                  {msg.content}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* BOTTOM AREA (Typing Box) */}
      {activeRoom && (
        <div style={dynamicStyles.inputArea}>
          <input 
            style={dynamicStyles.combinedInput} 
            type="text" 
            placeholder={lang === "Hindi" ? "एक सुरक्षित संदेश टाइप करें..." : "Type a secure message..."} 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }} // Let's you press 'Enter' on the keyboard to send!
          />
          <button style={dynamicStyles.combinedButton} onClick={handleSendMessage}>
            {lang === "Hindi" ? "भेजें" : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}