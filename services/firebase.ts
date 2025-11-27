import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Web/JS SDK Configuration (Fallback or Expo Go compatible usually requires explicit config if natively loaded isn't sufficient)
// Since we provided google-services.json, native builds handle initialization automatically mostly for native SDKs (React Native Firebase).
// But for Expo Go or standard JS SDK usage, we often need config here.
// Assuming we are using standard JS SDK for this phase as per plan.
// We'll use the values from the provided google-services.json for the web config equivalent where possible.

const firebaseConfig = {
  apiKey: "AIzaSyC_GL5H_NP8Bb_e66wBxQW989UqtUytIco", // from google-services.json
  authDomain: "duahub.firebaseapp.com", // assumed based on project_id
  projectId: "duahub",
  storageBucket: "duahub.firebasestorage.app",
  messagingSenderId: "264186564874",
  appId: "1:264186564874:web:09cf5fc3cd0b2c0dffaaf3", // This is usually distinct for web, but for hybrid JS SDK usage often auto-detects or we need a web app registered in Firebase console.
  // Using Android App ID for now as placeholder if strictly JS SDK is used on native without native linking.
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
