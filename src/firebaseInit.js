require('dotenv').config(); // Load environment variables from .env file

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");


// Initialize Firebase
const firebaseConfig = {

    apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
    authDomain: "campusinfrastructuremanagement.firebaseapp.com",
    projectId: "campusinfrastructuremanagement",
    storageBucket: "campusinfrastructuremanagement.appspot.com",
    messagingSenderId: "981921503275",
    appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
    measurementId: "G-Y95YE5ZDRY"
  };

const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Conditionally initialize Analytics
if (typeof window !== "undefined") { // Ensure this is a browser environment
    const { getAnalytics, isSupported } = require("firebase/analytics");

    isSupported().then((supported) => {
        if (supported) {
            const analytics = getAnalytics(app);
            console.log('Firebase Analytics initialized');
        } else {
            console.log('Firebase Analytics not supported in this environment');
        }
    }).catch(console.error);
}

module.exports = { app, db, auth };
