import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// process.env is the environment (DO NOT USE EXACT VALUES, USE ENV KEYS) as demonstrated below
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase file storage
const STORAGE_FOLDER_PATH = "gs://craftly-14eda.firebasestorage.app"; // TO DO: Make this an environment variable (security reasons)
export const storage = getStorage(app, STORAGE_FOLDER_PATH);

export { app, storage };
