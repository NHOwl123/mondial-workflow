// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA330Ie5YvLAUAAyBnAG3FpG1iMm7rsPO8",
  authDomain: "mondial-workflow.firebaseapp.com",
  projectId: "mondial-workflow",
  storageBucket: "mondial-workflow.firebasestorage.app",
  messagingSenderId: "1046941527018",
  appId: "1:1046941527018:web:c321764ab72c5af7bae093",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
