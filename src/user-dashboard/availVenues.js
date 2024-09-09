require('dotenv').config();
const express = require('express');
const { app, db, auth,createUserWithEmailAndPassword } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc } = require("firebase/firestore");
const usersRouter = express.Router();


