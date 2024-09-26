const { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, deleteDoc } = require("firebase/firestore"); 
const express = require('express');
const { app, db, auth } = require("../src/firebaseInit.js");
const apiLogsRouter = express.Router();

// GET /APILogs
apiLogsRouter.get('/APILogs', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'APILogs'));
        const apiLogs = [];

        snapshot.forEach((doc) => {
            apiLogs.push({ id: doc.id, ...doc.data() });
        });

        res.json(apiLogs);
    } catch (error) {
        res.status(500).send('Cannot get API logs');
    }
});



// POST /APILogs/:id
apiLogsRouter.post('/APILogs/:id', async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    const { count } = req.body; // Get the count from the request body

    // Validate the ID
    if (!['API_Key1', 'API_Key2', 'API_Key3', 'API_Key4', 'API_Key5'].includes(id)) {
        return res.status(400).send('Invalid API log ID');
    }

    try {
        const apiLogRef = doc(db, 'APILogs', id); // Reference the document in Firestore
        const currentDoc = await getDoc(apiLogRef); // Get the current document

        // Calculate the new count
        // console.log(currentDoc.data().count);
        const newCount = currentDoc.exists() ? (currentDoc.data().count || 0) + 1 : 1;
        // console.log(newCount);
        await setDoc(apiLogRef, { count: newCount }, { merge: true }); 
        res.status(201).send('API log updated');
    } catch (error) {
        res.status(500).send('Cannot update API log');
    }
});

module.exports = apiLogsRouter;