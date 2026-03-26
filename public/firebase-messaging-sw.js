// 1. Import the Google Worker Scripts
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// 2. Give the Watchman your VIP Badges
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "jsukoonv3.firebaseapp.com",
  projectId: "jsukoonv3",
  storageBucket: "jsukoonv3.firebasestorage.app",
  messagingSenderId: "151277128002",
  appId: "1:151277128002:web:7b3c503fc5ed66a245a0db"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. The Nightwatchman's Orders (What to do when the phone is asleep)
messaging.onBackgroundMessage(function(payload) {
  console.log('Nightwatchman received a transmission!', payload);

  const notificationTitle = payload.data.title || "सुकून कॉल (Sukoon Call)";
  const notificationOptions = {
    body: payload.data.body || "Incoming secure call...",
    icon: '/vite.svg', // The icon on the notification
    requireInteraction: true, // Forces it to stay on the screen!
    vibrate: [200, 100, 200, 100, 200, 100, 200] // Makes the phone buzz hard!
  };

  // Force the phone to wake up and show the banner
  return self.registration.showNotification(notificationTitle, notificationOptions);
});