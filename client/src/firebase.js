// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Added for Firestore (database)

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFGxs1u_yOhVSqUoiuhLNtTVS2I4CSPUc",
  authDomain: "vivaha-52f9e.firebaseapp.com",
  projectId: "vivaha-52f9e",
  storageBucket: "vivaha-52f9e.firebasestorage.app",
  messagingSenderId: "1075621547269",
  appId: "1:1075621547269:web:726e201f60a4c098c3bb6c",
  measurementId: "G-ZBHCTWNL68",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Authentication
export const auth = getAuth(app);

// ✅ Initialize Firestore (Database)
export const db = getFirestore(app);