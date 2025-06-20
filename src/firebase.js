import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCimq4c3CCVNKvd9ywz6Q_ESFN3YrVRRzk",
  authDomain: "hackon-cloud-project.firebaseapp.com",
  projectId: "hackon-cloud-project",
  storageBucket: "hackon-cloud-project.firebasestorage.app",
  messagingSenderId: "485400163152",
  appId: "1:485400163152:web:886e8d8937d216332d7255",
  measurementId: "G-38336LN2MZ"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});
