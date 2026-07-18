import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB38HnTRtjcwqqx6PcIYX751FbQu6FgsBE",
  authDomain: "chatbot-44108.firebaseapp.com",
  projectId: "chatbot-44108",
  storageBucket: "chatbot-44108.firebasestorage.app",
  messagingSenderId: "104375515488",
  appId: "1:104375515488:web:79466e13473556a6fc4605",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
