import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6OtLLbNwr31LuQhfOkIi1LH0fWtKAaPU",
  authDomain: "hermes-esfiha.firebaseapp.com",
  projectId: "hermes-esfiha",
  storageBucket: "hermes-esfiha.firebasestorage.app",
  messagingSenderId: "508421342982",
  appId: "1:508421342982:web:8314d0ea8e5ae14cc30087"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);