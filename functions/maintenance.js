const express = require('express');
const { app, db, auth } = require("../src/firebaseInit.js");
const { collection, addDoc ,doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, deleteDoc} = require("firebase/firestore"); 
const maintenanceRouter = express.Router();


//get the maintenance requests 
maintenanceRouter.get('/maintenanceRequests', async(req,res)=>{
    try{
        //const maintenanceRef = collection(db, 'maintenance');
        const snapshot = await getDocs(collection(db, 'maintenanceRequests'));

        //array to collect the requests
        const maintenanceRequests = [];
        snapshot.forEach((doc) => {
            maintenanceRequests.push({ id: doc.id, ...doc.data() });
        });

        // Return the data as JSON 
        res.status(200).json(maintenanceRequests);

    }
    catch(error){
        console.error('Error getting documents: ', error);
        res.status(500).send('Error getting documents');
    }

});


//get maintenance request by id
maintenanceRouter.get('/maintenanceRequests/:id', async (req, res) => {
    const {id} = req.params;

    try {
        //get the refrence to the document
        const docRef = doc(db, 'maintenanceRequests', id);
        const docSnap = await getDoc(docRef);

        //Check if the document exists
        if (docSnap.exists()) {
            //for testing
            res.status(200).json({ id: docSnap.id, ...docSnap.data() });
        } else {
            res.status(404).send('Document not found');
        }
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).send('Error getting document');
    }
});





//post a request
 maintenanceRouter.post('/maintenanceRequests', async (req,res)=> {
    const {assignedTo, createdAt, description, issueType, roomId, status, userId} = req.body;

    try{
        const timestamp = Timestamp.fromDate(new Date(createdAt));

        const docRef = await addDoc(collection(db, 'maintenanceRequests'), {
            assignedTo,
            createdAt: timestamp,
            description,
            issueType,
            roomId,
            status,
            userId
        });

       // res.status(201).json({ message: "Posted", });
        res.status(201).json({ id: docRef.id });
     }
     catch(error){
         console.error('Error adding document: ',error);
         res.status(500).send('Error adding documents');
     }

 });




//replace maintenence request - so update
maintenanceRouter.put('/maintenanceRequests/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        // Get the document reference
        const docRef = doc(db, 'maintenanceRequests', id);
        
        //so if only some fields are updated we can preserve the old fields
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return res.status(404).send('Document not found');
        }

        //merge the new data with existing data
        const currentData = docSnap.data();
        const updatedData = {
            ...currentData,
            ...updates,
            createdAt: currentData.createdAt // Preserve the existing timestamp if not updated
        };
        //set the doc
        await setDoc(docRef, updatedData);

        // Return success message
        res.status(200).json({ message: 'Document updated successfully' });
    } catch (error) {
        console.error('Error updating document:', error);
        if (!res.headersSent) {
            res.status(500).send('Error updating document');
        }
    }
});


//delete maintenance by id
maintenanceRouter.delete('/maintenanceRequests/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const docRef = doc(db, 'maintenanceRequests', id);
        await deleteDoc(docRef);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        if (!res.headersSent) {
            res.status(500).send('Error deleting document');
        }
    }
});



//now time to access the subcollections
//get logs

maintenanceRouter.get('/maintenanceRequests/:id/maintenanceLogs', async (req, res) => {
    const { id } = req.params;

    try {
        //reference to the maintenance logs subcollection given the id of the request
        const logsRef = collection(db, 'maintenanceRequests', id, 'maintenanceLogs');
        const logsSnapshot = await getDocs(logsRef);

        const maintenanceLogs = [];
        logsSnapshot.forEach((doc) => {
            //maintenanceRequests.push(doc.data());
            maintenanceLogs.push({ id: doc.id, ...doc.data() });
        });

        // Return the logs data as JSON
        res.status(200).json(maintenanceLogs);
    } catch (error) {
        console.error('Error getting maintenance logs:', error);
        res.status(500).send('Error getting maintenance logs');
    }
});



//post logs
maintenanceRouter.post('/maintenanceRequests/:id/maintenanceLogs', async (req, res) => {
    const { id } = req.params;
    const { actionBy, actionTaken, logId, timestamp } = req.body;

    if (!actionBy || !actionTaken|| !timestamp ||!logId) {
        return res.status(400).send('Missing required fields');
    }

    try {
        //reference to the maintenance logs subcollection for the given maintenance request ID
        const logsRef = collection(db, 'maintenanceRequests', id, 'maintenanceLogs');

        const timestamp1 = Timestamp.fromDate(new Date(timestamp));
        //Create a new log in the subcollection
        const newLog = {
            actionBy,
            actionTaken,
            logId,
            timestamp1
        };

        const logDocRef = await addDoc(logsRef, newLog);

        //return the ID of the newly created log document
        res.status(201).json({ id: logDocRef.id, message: 'Maintenance log added successfully' });

    } catch (error) {
        console.error('Error adding maintenance log:', error);
        res.status(500).send('Error adding maintenance log');
    }
});

//get rooms
maintenanceRouter.get('/maintenanceRequests/:id/rooms', async (req, res) => {
    const { id } = req.params;

    try {
        //reference to the maintenance logs subcollection given the id of the request
        const roomsRef = collection(db, 'maintenanceRequests', id, 'rooms');
        const roomsSnapshot = await getDocs(roomsRef);

        const maintenanceRooms = [];
        roomsSnapshot.forEach((doc) => {
            
            maintenanceRooms.push({ id: doc.id, ...doc.data() });
        });

        // Return the logs data as JSON
        res.status(200).json(maintenanceRooms);
    } catch (error) {
        console.error('Error getting maintenance logs:', error);
        res.status(500).send('Error getting maintenance logs');
    }
});

//post rooms
maintenanceRouter.post('/maintenanceRequests/:id/rooms', async (req, res) => {
    const { id } = req.params;
    const { building, capacity, floor, roomId, roomType} = req.body;



    if (!building|| !capacity|| !floor ||!roomId ||!roomType) {
        return res.status(400).send('Missing required fields');
    }

    try {
        //if want custom id
        // Reference to the specific room document within the rooms subcollection using a custom ID
        //const roomDocRef = doc(db, 'maintenanceRequests', id, 'rooms', roomId);

        //reference to the maintenance logs subcollection for the given maintenance request ID
        const roomsRef = collection(db, 'maintenanceRequests', id, 'rooms');

        
        //Create a new log in the subcollection
        const newRoom = {
            building,
            capacity,
            floor,
            roomId,
            roomType
        };
        //if want custom id
        // Set the document in Firestore with the specified custom ID
        //await setDoc(roomDocRef, newRoom);

        const roomDocRef = await addDoc(roomsRef, newRoom);

        //return the ID of the newly created log document
        res.status(201).json({ id: roomDocRef.id, message: 'room added successfully' });

    } catch (error) {
        console.error('Error adding maintenance log:', error);
        res.status(500).send('Error adding maintenance log');
    }
});

module.exports = maintenanceRouter;
