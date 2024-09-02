const express = require('express');
const { db } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } = require("firebase/firestore"); 

const bookingsRouter = express.Router();


bookingsRouter.put('/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const updates = req.body;

    try {
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const bookingDocRef= doc(db, 'Bookings',bookingId);
        const bookingDoc= await getDoc(bookingDocRef);
        

        if (!(bookingDoc.exists())) {
            return res.status(404).send('Booking not found');
        }

        

        await updateDoc(bookingDocRef, updates);
        res.status(200).json({ bookingId: bookingId, message: 'Booking updated successfully.' });
    } catch (error) {
        console.error('Error updating your booking:', error);
        res.status(500).send('Error updating booking');
    }
});


bookingsRouter.delete('/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;

    try {

        const bookingDocRef= doc(db, 'Bookings',bookingId);
        const bookingDoc= await getDoc(bookingDocRef);

        await deleteDoc(bookingDocRef);
        res.status(200).json({ message: 'Booking deleted successfully.' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).send('Error deleting booking');
    }
});


module.exports=bookingsRouter;