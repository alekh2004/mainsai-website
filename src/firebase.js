import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZj4rgMjvRKVZwWJwibqJUt_QU5_RTLSM",
  authDomain: "mainsai-evaluator.firebaseapp.com",
  projectId: "mainsai-evaluator",
  storageBucket: "mainsai-evaluator.firebasestorage.app",
  messagingSenderId: "918025838480",
  appId: "1:918025838480:web:d189c82449fb6f74491d15",
  measurementId: "G-5K690KYTXT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Use localStorage persistence so session survives page refresh
setPersistence(auth, browserLocalPersistence).catch(() => {});

export default app;
