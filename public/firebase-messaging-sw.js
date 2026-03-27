// 1. Import the Google Worker Scripts
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// 2. Give the Watchman your VIP Badges
const firebaseConfig = {
  apiKey: "AIzaSyAmTvNIYInWO0SU7SKsA13W7hv6dVAd0Ss",
  authDomain: "jsukoonv3.firebaseapp.com",
  projectId: "jsukoonv3",
  storageBucket: "jsukoonv3.firebasestorage.app",
  messagingSenderId: "151277128002",
  appId: "1:151277128002:web:7b3c503fc5ed66a245a0db"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. The Nightwatchman's Orders (Waking up the phone)
messaging.onBackgroundMessage(function(payload) {
  console.log('Nightwatchman received a transmission!', payload);

  // 💡 FIX: Look in 'notification' FIRST, then 'data'
  const title = payload.notification?.title || payload.data?.title || "सुकून कॉल (Sukoon Call)";
  const body = payload.notification?.body || payload.data?.body || "Incoming secure call...";

  const notificationOptions = {
    body: body,
    icon: '/logo192.png', // Make sure this file exists in your public folder!
    badge: '/logo192.png',
    tag: 'incoming-call', // This prevents 100 notifications from stacking up
    renotify: true,
    requireInteraction: true, // 🚨 STICKY: The notification won't disappear until they act
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 1000, 40], // Professional "Ring" vibration
    data: {
      url: 'https://sukoon-v3.vercel.app', // Your app URL
      roomId: payload.data?.roomId
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// 4. THE "ANSWER" FEATURE
// When the user taps the notification in their pocket, open the app!
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
// 🌟 THE FIX: Teach the Butler to instantly close the notification on Decline!
self.addEventListener('notificationclick', function(event) {
  // If the user clicked "Decline"
  if (event.action === 'decline') {
    console.log("User declined the call. Closing notification instantly.");
    event.notification.close();
    
    // The React app's 30-second timer will act as our safety net 
    // to update the Supabase database and clear the Caller's screen.
  } 
  // If they click anything else (like Accept), close the notification and open the app
  else {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // If the app is already open, just focus it!
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        // If the app is fully closed, open a new window to the chat!
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});