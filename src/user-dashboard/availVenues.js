require('dotenv').config();
const express = require('express');
const { app, db, auth,createUserWithEmailAndPassword } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc } = require("firebase/firestore");
const usersRouter = express.Router();


//access the venues db, get from there 
//if the venues category === something, use img what what
//load only 3 available venues 
//the last image when you click on it, should navigate you to view all venues.