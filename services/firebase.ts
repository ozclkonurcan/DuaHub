// services/firebase.ts
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  Auth,
  getAuth,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Hack for getReactNativePersistence if it's missing from types but present in runtime
// or if we need to use a different import path
// In newer firebase versions, React Native support might be handled differently
// For now, we will try to import it using require if the standard import fails type checking
// Or we cast the auth module to any.

import * as FirebaseAuth from 'firebase/auth';

// Firebase config - ŞİMDİLİK PLACEHOLDER
// Firebase Console'dan alacağız
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "duahub-app.firebaseapp.com",
  projectId: "duahub-app",
  storageBucket: "duahub-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: any;

// Initialize Firebase
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);

  let persistence;

  if (Platform.OS === 'web') {
    persistence = browserLocalPersistence;
  } else {
    // Attempt to use getReactNativePersistence via casting to avoid TS errors
    // if the type definition is missing it but the runtime has it.
    // If it's truly missing, we might need a different strategy (like not setting persistence explicitly and letting default kick in,
    // though RN usually needs explicit AsyncStorage).
    const authModule = FirebaseAuth as any;
    if (authModule.getReactNativePersistence) {
      persistence = authModule.getReactNativePersistence(AsyncStorage);
    } else {
      console.warn("getReactNativePersistence not found in firebase/auth. Persistence might not work.");
      // Fallback or leave undefined (in-memory)
    }
  }

  // Initialize Auth
  // If persistence is undefined, it might default to in-memory
  auth = initializeAuth(app, {
    persistence: persistence,
  });

  db = getFirestore(app);
  storage = getStorage(app);

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
}

export { auth, db, storage, analytics };
export default app;
