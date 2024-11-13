// Import the necessary functions from the SDKs
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoQGxjMrNZEsFv5VILmJ25nwgeaIEKH4s",
  authDomain: "streamfit-c6fa6.firebaseapp.com",
  projectId: "streamfit-c6fa6",
  storageBucket: "streamfit-c6fa6.firebasestorage.app",
  messagingSenderId: "187059472301",
  appId: "1:187059472301:web:3e961c9f60db2c77e10324",
  measurementId: "G-DRNMEN3KF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
const auth = getAuth(app);

const db = getFirestore(app);  // Initialize Firestore

export { auth, db };
