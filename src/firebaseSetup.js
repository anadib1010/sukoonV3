import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "jsukoonv3.firebaseapp.com",
  projectId: "jsukoonv3",
  storageBucket: "jsukoonv3.firebasestorage.app",
  messagingSenderId: "151277128002",
  appId: "1:151277128002:web:7b3c503fc5ed66a245a0db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Turn on the Messaging Engine
export const messaging = getMessaging(app);