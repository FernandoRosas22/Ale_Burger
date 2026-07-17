import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCx4n0Fj29i7rVVQx0SK0HfbJu2Cfy2lk0",
  authDomain: "ale-burgers.firebaseapp.com",
  projectId: "ale-burgers",
  storageBucket: "ale-burgers.firebasestorage.app",
  messagingSenderId: "643043021010",
  appId: "1:643043021010:web:8fa2887e28be4253cd5d0b",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
