import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtVC_q19bM_-DB4JIXrfHxEqWINTz6Oh4",
    authDomain: "habit-tracker-500f8.firebaseapp.com",
    projectId: "habit-tracker-500f8",
    storageBucket: "habit-tracker-500f8.firebasestorage.app",
    messagingSenderId: "970354232343",
    appId: "1:970354232343:web:f61eadc669332c17832052"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;