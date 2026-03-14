import React, { useState, useEffect, useRef } from 'react';

export function QuietCorner({ setTab, T, lang }) {
  const isHindi = lang === "Hindi";
  const videoRef = useRef(null);
  
  const [permission, setPermission] = useState('prompt'); // prompt, granted, denied
  const [heading, setHeading] = useState(180); 
  const [targetHeading] = useState(45); // 45 degrees = North-East (Vastu's Ishanya)

  // ─── 1. CAMERA SETUP ───
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        // Try to get the back camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermission('granted');
      } catch (err) {
        console.warn("Camera access denied or unavailable", err);
        setPermission('denied');
      }
    };

    startCamera();

    // Cleanup: turn off the camera when they leave the page
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // ─── 2. COMPASS / MOVEMENT SETUP ───
  useEffect(() => {
    // For mobile phones with a gyroscope/compass
    const handleOrientation = (e) => {
      if (e.alpha !== null) {
        // e.alpha represents the compass heading (0 to 360)
        setHeading(e.alpha);
      }
    };

    // For desktop testing (simulates spinning by moving your mouse left to right)
    const handleMouseMove = (e) => {
      const simulatedHeading = (e.clientX / window.innerWidth) * 360;
      setHeading(simulatedHeading);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // ─── 3. CALCULATE THE "MAGIC" GLOW ───
  // Find the shortest distance between their current heading and the target (0 to 180 degrees)
  let diff = Math.abs(heading - targetHeading);
  if (diff > 180) diff = 360 - diff;

  // The closer they are to the target (diff < 40), the stronger the glow (0.0 to 1.0)
  const intensity = Math.max(0, 1 - (diff / 40));
  const isPerfect = intensity > 0.95;

  // ─── VISUAL STYLES ───
  // A dark, mysterious overlay that turns into a bright, warm sun
  const overlayGradient = `radial-gradient(circle at center, rgba(255, 220, 100, ${intensity * 0.9}) 0%, rgba(10, 10, 15, ${1 - (intensity * 0.5)}) 100%)`;

  return (
    <div style={{
      height: "100%", width: "100%",
      position: "relative", backgroundColor: "#000",
      overflow: "hidden", userSelect: "none"
    }}>
      
      {/* ─── NAV ─── */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); setTab('resonance'); }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, textShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}>
          ← {isHindi ? 'वापस' : 'Back'}
        </button>
      </div>

      {/* ─── CAMERA FEED ─── */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted
        style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: `blur(${5 - (intensity * 5)}px) grayscale(${100 - (intensity * 100)}%)`, // Clears up and gains color as you get closer
          transition: "filter 0.5s ease"
        }}
      />

      {/* ─── THE MAGIC GLOW OVERLAY ─── */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        background: overlayGradient,
        transition: "background 0.5s ease",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none"
      }}>

        {/* ─── INSTRUCTIONS / SUCCESS MESSAGE ─── */}
        <div style={{ textAlign: "center", padding: "0 20px" }}>
          {permission === 'denied' ? (
             <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
               {isHindi ? "कैमरा एक्सेस की आवश्यकता है।" : "Camera access is required for this tool."}
             </p>
          ) : !isPerfect ? (
            <>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: 'rgba(255,255,255,0.8)', fontWeight: 300, margin: '0 0 10px', textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}>
                {isHindi ? "शांत कोना" : "The Quiet Corner"}
              </h2>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}>
                {isHindi ? "कमरे के चारों ओर धीरे-धीरे घूमें।" : "Slowly pan around the room."}
              </p>
            </>
          ) : (
            <div style={{ animation: "fadeIn 2s ease forwards" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', color: '#fff', fontWeight: 300, margin: '0 0 10px', textShadow: "0px 0px 20px rgba(255, 200, 100, 0.8)" }}>
                {isHindi ? "यहाँ बैठें।" : "Sit here."}
              </h2>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', textShadow: "0px 2px 10px rgba(0,0,0,0.5)" }}>
                {isHindi ? "ऊर्जा संतुलित है।" : "The energy is balanced."}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}