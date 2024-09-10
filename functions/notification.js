require('dotenv').config();
const express = require('express');
const {  db } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc } = require("firebase/firestore");
const notificationsRouter = express.Router();

// Get all notifications for a user
notificationsRouter.get('/users/:userId/notifications', async (req, res) => {
    const { userId } = req.params;

    try {
        const snapshot = await getDocs(collection(db, 'users', userId, 'notifications'));
        const notifications = [];
        snapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).send('Error getting notifications');
    }
});

// Create a new notification for a user
notificationsRouter.post('/users/:userId/notifications', async (req, res) => {
    const { userId } = req.params;
    const { type, message, sendAt } = req.body;

    try {
        const notificationRef = await addDoc(collection(db, 'users', userId, 'notifications'), {
            type,
            message,
            sendAt,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });
        res.status(201).json({ notificationId: notificationRef.id, message: 'Notification created successfully.' });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).send('Error creating notification');
    }
});

// Get a notification by notificationId
notificationsRouter.get('/users/:userId/notifications/:notificationId', async (req, res) => {
    const { userId, notificationId } = req.params;

    try {
        const notificationDoc = await getDoc(doc(db, 'users', userId, 'notifications', notificationId));
        if (notificationDoc.exists()) {
            res.status(200).json({ id: notificationDoc.id, ...notificationDoc.data() });
        } else {
            res.status(404).send('Notification not found');
        }
    } catch (error) {
        console.error('Error getting notification:', error);
        res.status(500).send('Error getting notification');
    }
});

// Update a notification by notificationId
notificationsRouter.put('/users/:userId/notifications/:notificationId', async (req, res) => {
    const { userId, notificationId } = req.params;
    const { type, message, sendAt, status } = req.body;

    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (message !== undefined) updateData.message = message;
    if (sendAt !== undefined) updateData.sendAt = sendAt;
    if (status !== undefined) updateData.status = status;

    try {
        const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
        await updateDoc(notificationRef, updateData);
        res.status(200).json({ message: 'Notification updated successfully.' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).send('Error updating notification');
    }
});

// Delete a notification by notificationId
notificationsRouter.delete('/users/:userId/notifications/:notificationId', async (req, res) => {
    const { userId, notificationId } = req.params;

    try {
        const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
        await deleteDoc(notificationRef);
        res.status(200).json({ message: 'Notification deleted successfully.' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).send('Error deleting notification');
    }
});

module.exports = notificationsRouter;
