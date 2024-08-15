import {initializeApp} from 'firebase/app';
import {getMessaging} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAv9z8Lk9GH0tnmjVLJPbjLfrDWit_xm9I",
  authDomain: "new-app-2e4bb.firebaseapp.com",
  projectId: "new-app-2e4bb",
  storageBucket: "new-app-2e4bb.appspot.com",
  messagingSenderId: "594411158182",
  appId: "1:594411158182:web:84cdd180adab8d67c89267",
  measurementId: "G-NEZ5802GS6"
};

let app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export { messaging };
