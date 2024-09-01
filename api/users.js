require('dotenv').config();
const express = require('express');
const { app, db, auth,createUserWithEmailAndPassword } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, deleteDoc } = require("firebase/firestore");
const usersRouter = express.Router();

// get all users.
usersRouter.get('/users', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const users = [];
        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send('Error getting users');
    }
});

// creating a new user via signup
usersRouter.post('/users/signup', async (req, res) => {
    const { name, surname, email, role, faculty, is_tutor, is_lecturer, password } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await setDoc(doc(db, 'users', userId), { name, surname, email, role, faculty, is_tutor, is_lecturer });

        res.status(201).json({ id: userId, message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).send(`Error creating user: ${error.message}`);
    }
});


//find user by id
usersRouter.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            res.status(200).json({ id: userDoc.id, ...userDoc.data() });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).send('Error getting user');
    }
});

// Update a user by userId
usersRouter.put('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
});

// Delete a user by userId
usersRouter.delete('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});

module.exports = usersRouter;
