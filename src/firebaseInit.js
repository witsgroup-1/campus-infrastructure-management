require('dotenv').config(); // Load environment variables from .env file

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');



const firebaseConfig = {
  apiKey: process.env.API_KEY_1,
  authDomain: process.env.APP_AUTH_DOMAIN,
  projectId: process.env.APP_PROJECT_ID,
  storageBucket: process.env.APP_STORAGE_BUCKET,
  messagingSenderId: process.env.APP_MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.APP_MEASUREMENT_ID
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


module.exports = { app, db, auth,createUserWithEmailAndPassword,signInWithEmailAndPassword };
