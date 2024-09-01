require('dotenv').config();
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.APP_API_KEY,
  authDomain: process.env.APP_AUTH_DOMAIN,
  projectId: process.env.APP_PROJECT_ID,
  storageBucket: process.env.APP_STORAGE_BUCKET, // Corrected typo
  messagingSenderId: process.env.APP_MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// const analytics = getAnalytics(app); // Uncomment if you are using Firebase Analytics

module.exports = { app, db, auth,createUserWithEmailAndPassword  };
