const express = require('express');
const { db } = require("../src/firebaseInit.js");
const { collection,query,where, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } = require("firebase/firestore"); 

const bookingsRouter = express.Router();


bookingsRouter.put('/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const updates = req.body;

    try {
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const findDocu= query(collection(db, 'Bookings'), where('bookingId','==',bookingId));
        const bookingDoc = await getDocs(findDocu);
        

        if (bookingDoc.empty) {
            return res.status(404).send('Booking not found');
        }

        const bookingDocRef=bookingDoc.docs[0].ref;
        
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

        const findDocu= query(collection(db, 'Bookings'), where('bookingId','==',bookingId));
        const bookingDoc = await getDocs(findDocu);
        const bookingDocRef=bookingDoc.docs[0].ref;

        await deleteDoc(bookingDocRef);
        res.status(200).json({ message: 'Booking deleted successfully.' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).send('Error deleting booking');
    }
});


module.exports=bookingsRouter;