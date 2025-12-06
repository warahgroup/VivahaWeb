// client/src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFGxs1u_yOhVSqUoiuhLNtTVS2I4CSPUc",
  authDomain: "vivaha-52f9e.firebaseapp.com",
  databaseURL: "https://vivaha-52f9e-default-rtdb.firebaseio.com",
  projectId: "vivaha-52f9e",
  // Firebase Storage buckets must end with .appspot.com
  storageBucket: "vivaha-52f9e.appspot.com",
  messagingSenderId: "1075621547269",
  appId: "1:1075621547269:web:726e201f60a4c098c3bb6c",
  measurementId: "G-ZBHCTWNL68",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database
export const realtimeDb = getDatabase(app);

// Initialize Storage
export const storage = getStorage(app);