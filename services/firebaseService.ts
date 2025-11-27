// services/firebaseService.ts
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Dua } from '../types/dua';

// Firebase Config - ŞİMDİ BU BOŞ, SONRA FIREBASE CONSOLE'DAN ALACAĞIZ
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "duahub-app.firebaseapp.com",
  projectId: "duahub-app",
  storageBucket: "duahub-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// ============================================
// DUAS COLLECTION
// ============================================

export const getDuasFromFirebase = async (): Promise<Dua[]> => {
  try {
    const duasRef = collection(db, 'duas');
    const snapshot = await getDocs(duasRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Dua[];
  } catch (error) {
    console.error('Error getting duas:', error);
    return [];
  }
};

export const getDuaById = async (id: string): Promise<Dua | null> => {
  try {
    const duaRef = doc(db, 'duas', id);
    const snapshot = await getDoc(duaRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Dua;
    }
    return null;
  } catch (error) {
    console.error('Error getting dua:', error);
    return null;
  }
};

export const getDuasByCategory = async (category: string): Promise<Dua[]> => {
  try {
    const duasRef = collection(db, 'duas');
    const q = query(duasRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Dua[];
  } catch (error) {
    console.error('Error getting duas by category:', error);
    return [];
  }
};

// ============================================
// AUDIO FILES (Storage)
// ============================================

export const uploadAudioFile = async (
  duaId: string,
  audioBlob: Blob
): Promise<string> => {
  try {
    const storageRef = ref(storage, `audio/${duaId}.mp3`);
    await uploadBytes(storageRef, audioBlob);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
};

export const getAudioUrl = async (duaId: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `audio/${duaId}.mp3`);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return null;
  }
};

// ============================================
// ANALYTICS
// ============================================

export const logDuaRead = (duaId: string, duaTitle: string) => {
  if (analytics) {
    logEvent(analytics, 'dua_read', {
      dua_id: duaId,
      dua_title: duaTitle,
    });
  }
};

export const logDuaFavorited = (duaId: string, duaTitle: string) => {
  if (analytics) {
    logEvent(analytics, 'dua_favorited', {
      dua_id: duaId,
      dua_title: duaTitle,
    });
  }
};

export const logAudioPlayed = (duaId: string, duaTitle: string) => {
  if (analytics) {
    logEvent(analytics, 'audio_played', {
      dua_id: duaId,
      dua_title: duaTitle,
    });
  }
};

// ============================================
// USER SYNC (isteğe bağlı, premium için)
// ============================================

export const syncUserData = async (userId: string, data: any): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing user data:', error);
  }
};

export default app;