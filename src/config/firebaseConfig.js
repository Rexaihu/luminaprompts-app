import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBqyLU7jQxVtZ_7FYg0z2cGrwZETpnWk7Y",
  authDomain: "luminaprompts-fdf6a.firebaseapp.com",
  projectId: "luminaprompts-fdf6a",
  storageBucket: "luminaprompts-fdf6a.firebasestorage.app",
  messagingSenderId: "668636863614",
  appId: "1:668636863614:web:ad0da86a13515c198ccc2f",
  measurementId: "G-NY6T6DFB20"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
