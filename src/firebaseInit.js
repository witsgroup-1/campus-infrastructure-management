require('dotenv').config();
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.APP_API_KEY,
  authDomain: process.env.APP_AUTH_DOMAIN,
  projectId: process.env.APP_PROJECT_ID,
  storageBucket: process.env.APP_STORAGE_BUCEKT,
  messagingSenderId: process.env.APP_MESSAGE_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.APP_APP_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
//const analytics = getAnalytics(app);


module.exports = { app, db, auth };