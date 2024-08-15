importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyAv9z8Lk9GH0tnmjVLJPbjLfrDWit_xm9I",
  authDomain: "new-app-2e4bb.firebaseapp.com",
  projectId: "new-app-2e4bb",
  storageBucket: "new-app-2e4bb.appspot.com",
  messagingSenderId: "594411158182",
  appId: "1:594411158182:web:84cdd180adab8d67c89267",
  measurementId: "G-NEZ5802GS6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
