import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC_GL5H_NP8Bb_e66wBxQW989UqtUytIco",
  authDomain: "duahub.firebaseapp.com",
  projectId: "duahub",
  storageBucket: "duahub.firebasestorage.app",
  messagingSenderId: "264186564874",
  appId: "1:264186564874:web:09cf5fc3cd0b2c0dffaaf3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with Persistence
let auth;
try {
  // @ts-ignore
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  console.warn("Firebase Auth persistence initialization failed, falling back to memory.", e);
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
