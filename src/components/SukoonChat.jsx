import React, { useState } from 'react';

// STEP 1: STATIC STYLES (Outside the component)
// These never change. We put them here to keep the code clean and professional.
const staticStyles = {
  chatBox: {
    flex: 1,
    padding: '20px',
    overflowY: 'scroll',
    fontFamily: 'Arial, sans-serif'
  },
  inputField: {
    flex: 1,
    padding: '12px',
    borderRadius: '25px', // Nice round, friendly corners
    border: 'none',
    marginRight: '10px',
    fontSize: '16px'
  },
  sendButton: {
    padding: '12px 24px',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  }
};

// STEP 2: THE COMPONENT FUNCTION
// We pass our magic 'T' inside the parentheses so the component can use it.
export default function SukoonChat({ T }) {
  
  // This helps us remember what the user is typing in the box
  const [message, setMessage] = useState("");

  // STEP 3: DYNAMIC STYLES (Inside the component)
  // These use the Rule of T! They must stay inside so they can see T.bg, T.accent, etc.
  const dynamicStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: T.bg, // Dynamic background!
      color: T.text          // Dynamic text color!
    },
    inputArea: {
      display: 'flex',
      padding: '15px',
      backgroundColor: T.accent // Dynamic accent color for the typing area!
    },
    
    // Here we combine the outside static rules with the inside dynamic colors
    combinedInput: {
      ...staticStyles.inputField, // Grab the shape and size from outside
      backgroundColor: T.bg,      // Add the dynamic background color
      color: T.text               // Add the dynamic text color
    },
    combinedButton: {
      ...staticStyles.sendButton,   // Grab the shape and size from outside
      backgroundColor: T.buttonBg,  // Add the dynamic button color
      color: T.buttonText           // Add the dynamic button text color
    }
  };

  // STEP 4: DRAWING THE SCREEN
  // We use the styles we just built to draw the chat app on the screen.
  return (
    <div style={dynamicStyles.container}>
      
      {/* The large box where all the messages will appear */}
      <div style={staticStyles.chatBox}>
        <p>Welcome to the highly secure Sukoon Team Chat.</p>
      </div>

      {/* The bottom bar where you type a new message */}
      <div style={dynamicStyles.inputArea}>
        <input 
          style={dynamicStyles.combinedInput} 
          type="text" 
          placeholder="Type a secure message..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button style={dynamicStyles.combinedButton}>Send</button>
      </div>

    </div>
  );
}