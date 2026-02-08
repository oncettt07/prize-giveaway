import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAG2jDEEYDsH0yk7OAd2hrVxfMe6WSq6o8",
    authDomain: "prize-giveaway-32771.firebaseapp.com",
    projectId: "prize-giveaway-32771",
    storageBucket: "prize-giveaway-32771.firebasestorage.app",
    messagingSenderId: "623332311200",
    appId: "1:623332311200:web:9269fa1ed60b52245289c5",
    measurementId: "G-EBTDHPWXHC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };
