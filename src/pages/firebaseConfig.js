// firebaseconfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- ✅ Add this line

const firebaseConfig = {
  apiKey: "AIzaSyAqsV8RMa6UjLmAfwVpBAQgOactGqS3lDg",
  authDomain: "database-1cc79.firebaseapp.com",
  projectId: "database-1cc79",
  storageBucket: "database-1cc79.appspot.com",// <-- ✅ FIX this line (was incorrect)
  messagingSenderId: "384818326791",
  appId: "1:384818326791:web:0792289194715e177029a2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- ✅ Add this line
