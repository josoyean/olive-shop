// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
const WAB_NAME = import.meta.env.VITE_WAB_NAME?.trim();

if (!FIREBASE_API_KEY || !WAB_NAME) {
  throw new Error(
    "Firebase 환경변수가 없습니다. .env에 VITE_FIREBASE_API_KEY, VITE_WAB_NAME(프로젝트 ID)을 설정한 뒤 개발 서버를 재시작하세요."
  );
}

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
