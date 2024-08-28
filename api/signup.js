const { app, db, auth } = require("../src/firebaseInit.js");


const express = require('express');
const { collection, addDoc } = require("firebase/firestore"); 
const signupRouter = express.Router();

// API route to sign up a user
signupRouter.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields (name, email, password) are required" });
    }

    try {
        const docRef = await addDoc(collection(db, "users"), {
            name,
            email,
            password // Note: Storing passwords in plain text is not secure. Consider hashing passwords before storing them.
        });

        res.status(201).json({ message: "User signed up successfully", userId: docRef.id });
    } catch (error) {
        res.status(500).json({ error: "Failed to sign up user", details: error.message });
    }
});

module.exports = signupRouter;


