import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// For mobile (native) builds using google-services.json
// Note: Some Firebase JS SDK functions may still require a manual config object for web or certain dev environments.
// However, adding the file to app.json allows Expo to bundle it correctly for production builds.

const firebaseConfig = {
    apiKey: "AIzaSyAw1q68t8pQWyY3Uog3iJ-g8665TaLNWmQ",
    authDomain: "gammirislk-b1880.firebaseapp.com",
    projectId: "gammirislk-b1880",
    storageBucket: "gammirislk-b1880.firebasestorage.app",
    messagingSenderId: "823830677181",
    appId: "1:823830677181:android:23c26cb6f7fb5f7818d9d4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
