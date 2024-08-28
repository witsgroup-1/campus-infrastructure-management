
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
require('dotenv').config();
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

// const firebaseConfig = {
//   apiKey: process.env.APP_API_KEY,
//   authDomain: process.env.APP_AUTH_DOMAIN,
//   projectId: process.env.APP_PROJECT_ID,
//   storageBucket: process.env.APP_STORAGE_BUCEKT,
//   messagingSenderId: process.env.APP_MESSAGE_SENDER_ID,
//   appId: process.env.APP_ID,
//   measurementId: process.env.APP_APP_MEASUREMENT_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
  authDomain: "campusinfrastructuremanagement.firebaseapp.com",
  projectId: "campusinfrastructuremanagement",
  storageBucket: "campusinfrastructuremanagement.appspot.com",
  messagingSenderId: "981921503275",
  appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
  measurementId: "G-Y95YE5ZDRY"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);