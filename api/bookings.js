const { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, deleteDoc } = require("firebase/firestore"); 
const express = require('express');
const { app, db, auth } = require("../src/firebaseInit.js");
const bookingsRouter = express.Router();

// Get all bookings
bookingsRouter.get('/Bookings', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'Bookings'));
        const bookings = [];

        snapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).send('Cannot get bookings');
    }
});

// Get booking by ID
bookingsRouter.get('/Bookings/id/:bookingId', async (req, res) => {
    const { bookingId } = req.params;

    try {
        const bookingDocRef = doc(db, 'Bookings', bookingId);
        const bookingDoc = await getDoc(bookingDocRef);

        if (bookingDoc.exists()) {
            res.status(200).json({ id: bookingDoc.id, ...bookingDoc.data() });
        } else {
            res.status(404).send('Booking not found');
        }
    } catch (error) {
        console.error("Error adding booking: ", error);
        res.status(500).send('Cannot get booking');
    }
});

// Get bookings by user
bookingsRouter.get('/Bookings/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const bookingDocRef = collection(db, 'Bookings');
        const bookingDocs = await getDocs(bookingDocRef);
        const users = [];

        bookingDocs.forEach((doc) => {
            if (doc.data().userId === userId) {
                users.push({ id: doc.id, ...doc.data() });
            }
        });

        if (users.length === 0) {
            res.status(404).json({ message: 'No bookings found for this user' });
        } else {
            res.status(200).json(users);
        }

    } catch (error) {
        res.status(500).send('Cannot get bookings');
    }
});

// Get bookings by date (please note that date is a string)
bookingsRouter.get('/Bookings/date/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const bookingDocRef = collection(db, 'Bookings');
        const bookingDocs = await getDocs(bookingDocRef);
        const dates = [];

        bookingDocs.forEach((doc) => {
            if (doc.data().date === date) {
                dates.push({ id: doc.id, ...doc.data() });
            }
        });

        if (dates.length === 0) {
            res.status(404).json({ message: 'No bookings found for this date' });
        } else {
            res.status(200).json(dates);
        }

    } catch (error) {
        res.status(500).send('Cannot get bookings');
    }
});

// Create new booking
bookingsRouter.post('/Bookings', async (req, res) => {
    try {

        const booking = {
            status: req.body.status,
            date: req.body.date,
            end_time: req.body.end_time,
            purpose: req.body.purpose,
            roomId: req.body.roomId,
            start_time: req.body.start_time,
            userId: req.body.userId,
            venueId: req.body.venueId,
        };
        const docRef = await addDoc(collection(db, 'Bookings'), booking);
        res.status(201).json({ id: docRef.id });
    } catch (error) {
        console.error("Error adding booking: ", error);
        res.status(500).send('Booking not added');
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


//update booking
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


module.exports = bookingsRouter;
