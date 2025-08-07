// src/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCSMShYiEsDuW4Nuk0k2qV3_xhGhwJEOW4",
  authDomain: "fameflowr-217f9.firebaseapp.com",
  projectId: "fameflowr-217f9",
  storageBucket: "fameflowr-217f9.appspot.com", // <-- This is correct!
  messagingSenderId: "292930303272",
  appId: "1:292930303272:web:ff58322ffc6232105e8c1d",
  measurementId: "G-PYMXMKM3CC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
