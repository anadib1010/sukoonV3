import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "jsukoonv3.firebaseapp.com",
  projectId: "jsukoonv3",
  storageBucket: "jsukoonv3.firebasestorage.app",
  messagingSenderId: "151277128002",
  appId: "1:151277128002:web:7b3c503fc5ed66a245a0db"
};

// Initialize the Engines
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// ─── THE MASTER KEY TOOL (UPGRADED) ───
export const requestFirebaseToken = async () => {
  try {
    // 1. THE CRITICAL WIRE: Hiring the Butler
    // This tells the browser to prepare the service worker file from your public folder
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log("Butler (Service Worker) registered successfully! 👻");

    // 2. THE TOKEN HANDSHAKE: Linking the Token to the Butler
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BNUC6jVa3VCT_QSFyeJ45bGKRqciQuEh73jZy2AO6LudqQqNGYOsU1FUpkTTd0GFdmc1AIFZz4gA-gwnp3MXc-c',
      serviceWorkerRegistration: registration // 👈 THIS IS THE MISSING KEY!
    });
    
    if (currentToken) {
      console.log("Address received and linked to Butler! 📍", currentToken);
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

// 3. LISTEN FOR CALLS WHILE APP IS OPEN
// This ensures that if you are looking at the app, it still rings instantly
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message received while app is open:", payload);
      resolve(payload);
    });
  });