import React from 'react';

export function BrandHeader({ T }) {
  const s = {
    container: {
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center",
      textAlign: "center", 
      width: "100%",
      marginTop: "4vh",     // Gives it a little breathing room at the top
      marginBottom: "24px"  // Perfect spacing before the room's content begins
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif", 
      // Exactly half the size of the Home page!
      fontSize: "clamp(24px, 7vw, 32px)", 
      fontWeight: 600, 
      margin: "0 0 2px", 
      letterSpacing: "2px",
      color: T.text
    },
    subTitle: {
      fontFamily: "'DM Sans', sans-serif", 
      fontSize: "8px",     // Shrunk down to match the smaller title
      fontWeight: 500,
      letterSpacing: "3px", 
      textTransform: "uppercase", 
      opacity: 0.8,
      margin: "0",
      color: T.text
    }
  };

  return (
    <div style={s.container}>
      <h1 style={s.title}>JSukoon</h1>
      <p style={s.subTitle}>DISCOVER STILLNESS</p>
    </div>
  );
}