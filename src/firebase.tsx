// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const WAB_NAME = import.meta.env.VITE_WAB_NAME;
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: `${WAB_NAME}.firebaseapp.com`,
  projectId: WAB_NAME,
  storageBucket: `${WAB_NAME}.firebasestorage.app`,
  messagingSenderId: "646173334703",
  appId: "1:646173334703:web:b0746948a1209f0e68085a",
  measurementId: "G-SGXK229NRC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "ko";
export const db = getFirestore(app);
