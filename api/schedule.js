const express = require('express');
const { db } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } = require("firebase/firestore"); 

const scheduleRouter = express.Router();

// Create a new schedule
scheduleRouter.post('/schedules', async (req, res) => {
    const { roomId, courseId, startTime, endTime, daysOfWeek, startDate, endDate, recurring, userId } = req.body;

    try {
        const newSchedule = {
            roomId,
            courseId,
            startTime,
            endTime,
            daysOfWeek,
            startDate,
            endDate,
            recurring,
            userId
        };

        const scheduleDocRef = await addDoc(collection(db, 'schedules'), newSchedule);

        res.status(201).json({ scheduleId: scheduleDocRef.id, message: 'Schedule created successfully.' });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).send('Error creating schedule');
    }
});

// Get all schedules
scheduleRouter.get('/schedules', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'schedules'));
        const schedules = [];

        snapshot.forEach((doc) => {
            schedules.push({ id: doc.id, ...doc.data() });
        });

        res.json(schedules);
    } catch (error) {
        res.status(500).send('Cannot get schedules');
    }
});

// Retrieve a specific schedule by its ID
scheduleRouter.get('/schedules/:scheduleId', async (req, res) => {
    const { scheduleId } = req.params;

    try {
        const scheduleDocRef = doc(db, 'schedules', scheduleId);
        const scheduleDoc = await getDoc(scheduleDocRef);

        if (scheduleDoc.exists()) {
            res.status(200).json({ scheduleId: scheduleDoc.id, ...scheduleDoc.data() });
        } else {
            res.status(404).send('Schedule not found');
        }
    } catch (error) {
        console.error('Error getting schedule:', error);
        res.status(500).send('Error getting schedule');
    }
});

// Update an existing schedule
scheduleRouter.put('/schedules/:scheduleId', async (req, res) => {
    const { scheduleId } = req.params;
    const updates = req.body;

    try {
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const scheduleDocRef = doc(db, 'schedules', scheduleId);
        const scheduleDoc = await getDoc(scheduleDocRef);

        if (!scheduleDoc.exists()) {
            return res.status(404).send('Schedule not found');
        }

        await updateDoc(scheduleDocRef, updates);
        res.status(200).json({ scheduleId: scheduleId, message: 'Schedule updated successfully.' });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).send('Error updating schedule');
    }
});

// Delete a specific schedule by its ID
scheduleRouter.delete('/schedules/:scheduleId', async (req, res) => {
    const { scheduleId } = req.params;

    try {
        const scheduleDocRef = doc(db, 'schedules', scheduleId);
        await deleteDoc(scheduleDocRef);
        res.status(200).json({ message: 'Schedule deleted successfully.' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).send('Error deleting schedule');
    }
});

// Retrieve all schedules for a specific room
scheduleRouter.get('/schedules/room/:roomId', async (req, res) => {
    const { roomId } = req.params;

    try {
        const schedulesRef = collection(db, 'schedules');
        const schedulesSnapshot = await getDocs(schedulesRef);

        const roomSchedules = [];
        schedulesSnapshot.forEach((doc) => {
            const scheduleData = doc.data();
            if (scheduleData.roomId === roomId) {
                roomSchedules.push({ scheduleId: doc.id, ...scheduleData });
            }
        });

        res.status(200).json(roomSchedules);
    } catch (error) {
        console.error('Error getting schedules for room:', error);
        res.status(500).send('Error getting schedules for room');
    }
});

module.exports = scheduleRouter;
