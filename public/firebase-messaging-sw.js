// Import the Firebase app and messaging libraries.
// See: https://firebase.google.com/docs/web/setup#access-firebase
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

// The Firebase config object is sourced from the client-side config.
// The service worker is in the /public folder, so the path to the config is relative to the root.
const firebaseConfig = {
  "projectId": "studio-7840988595-13b35",
  "appId": "1:160498681310:web:bc4f2fbfeac531e65a494f",
  "storageBucket": "studio-7840988595-13b35.appspot.com",
  "apiKey": "AIzaSyAdr6xj-AZUvMBWbGSSE05wuyhQD-BlhVU",
  "authDomain": "studio-7840988595-13b35.firebaseapp.com",
  "messagingSenderId": "160498681310"
};

// Initialize the Firebase app in the service worker.
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Background message handler (optional)
// If you want to customize the notification that is displayed when your app is in the background,
// you can set a background message handler.
// self.addEventListener('push', (event) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', event);
//   const notificationTitle = 'New Message';
//   const notificationOptions = {
//     body: 'You have a new message.',
//     icon: '/firebase-logo.png'
//   };
//   event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
// });
