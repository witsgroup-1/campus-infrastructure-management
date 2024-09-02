const express = require('express');
const { db } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } = require("firebase/firestore"); 

const venuesRouter = express.Router();


venuesRouter.put('/venues/:venueId', async (req, res) => {
    const { venueId } = req.params;
    const updates = req.body;

    try {
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const venueDocRef= doc(db, 'venues',venueId);
        const venueDoc= await getDoc(venueDocRef);
        

        if (!(venueDoc.exists())) {
            return res.status(404).send('Venue not found');
        }

        

        await updateDoc(venueDocRef, updates);
        res.status(200).json({ venueId: venueId, message: 'Venue updated successfully.' });
    } catch (error) {
        console.error('Error updating your venue:', error);
        res.status(500).send('Error updating venue');
    }
});


venuesRouter.delete('/venues/:venueId', async (req, res) => {
    const { venueId } = req.params;

    try {

        const venueDocRef= doc(db, 'venues',venueId);
        const venueDoc= await getDoc(venueDocRef);

        await deleteDoc(venueDocRef);
        res.status(200).json({ message: 'Venue deleted successfully.' });
    } catch (error) {
        console.error('Error deleting venue:', error);
        res.status(500).send('Error deleting venue');
    }
});


module.exports=venuesRouter;