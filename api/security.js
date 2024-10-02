const express = require('express');
const { db } = require("../src/firebaseInit.js");
const fetch = require('node-fetch');
const { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } = require("firebase/firestore"); 

const securityRouter = express.Router();

// Get all security info
securityRouter.get('/securityInfo', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'securityInfo'));
        const security = [];

        snapshot.forEach((doc) => {
            security.push({ id: doc.id, ...doc.data() });
        });

        res.json(security);
    } catch (error) {
        res.status(500).send('Cannot get security info');
    }
});

// Update security info
securityRouter.put('/securityInfo/:securityInfoId', async (req, res) => {
    const { securityInfoId } = req.params;
    const updates = req.body;

    try {
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const securityDocRef = doc(db, 'securityInfo', securityInfoId);
        const securityDoc = await getDoc(securityDocRef);

        if (!securityDoc.exists()) {
            return res.status(404).send('Security info not found');
        }

        await updateDoc(securityDocRef, updates);
        res.status(200).json({ securityInfoId: securityInfoId, message: 'Security info updated successfully.' });
    } catch (error) {
        console.error('Error updating security info:', error);
        res.status(500).send('Error updating security info');
    }
});

// Add new security info
securityRouter.post('/securityInfo', async (req, res) => {
    try {

        const security = {
            Name: req.body.Name,
            contact_number: req.body.contact_number,
        };
        const docRef = await addDoc(collection(db, 'securityInfo'), security);
        res.status(201).json({ id: docRef.id });
    } catch (error) {
        console.error("Error adding security info: ", error);
        res.status(500).send('Security info not added');
    }
});

//delete security info
securityRouter.delete('/securityInfo/:securityInfoId', async (req, res) => {
    const { securityInfoId } = req.params;

    try {

        const securityDocRef= doc(db, 'securityInfo', securityInfoId);
        const securityDoc= await getDoc(securityDocRef);

        await deleteDoc(securityDocRef);
        res.status(200).json({ message: 'Security info deleted successfully.' });
    } catch (error) {
        console.error('Error deleting security info:', error);
        res.status(500).send('Error deleting security info');
    }
});

// Fetch security contacts from an external API
securityRouter.get('/securityInfo/contacts', async (req, res) => {
    try {
        const response = await fetch('https://polite-pond-04aadc51e.5.azurestaticapps.net/api/contacts');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

module.exports = securityRouter;