import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Your Google VIP Badges
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "jsukoonv3.firebaseapp.com",
  projectId: "jsukoonv3",
  storageBucket: "jsukoonv3.firebasestorage.app",
  messagingSenderId: "151277128002",
  appId: "1:151277128002:web:7b3c503fc5ed66a245a0db"
};

// Initialize the Firebase Engine
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// ─── THE MASTER KEY TOOL ───
// This asks Google for the user's specific phone address!
export const requestFirebaseToken = async () => {
  try {
    console.log("Asking Google for the device address...");
    
    const currentToken = await getToken(messaging, { 
      // Your VAPID Key goes right here:
      vapidKey: 'BNUC6jVa3VCT_QSFyeJ45bGKRqciQuEh73jZy2AO6LudqQqNGYOsU1FUpkTTd0GFdmc1AIFZz4gA-gwnp3MXc-c' 
    });
    
    if (currentToken) {
      console.log("Address received! 📍", currentToken);
      return currentToken;
    } else {
      console.log("No address available. The user needs to allow notifications.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while getting the address: ", err);
    return null;
  }
};