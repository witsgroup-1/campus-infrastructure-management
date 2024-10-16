const express = require('express');
const { app, db, auth } = require("../src/firebaseInit.js");
const { collection, addDoc ,doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, deleteDoc} = require("firebase/firestore"); 
const maintenanceRouter = express.Router();



//get the maintenance requests 
maintenanceRouter.get('/maintenanceRequests', async(req,res)=>{
    try{
       
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

// Get maintenance requests by venueId (roomId)
maintenanceRouter.get('/maintenanceRequests/venue/:venueId', async (req, res) => {
    const { venueId } = req.params;

    try {
        // Query the maintenanceRequests collection where the roomId equals the venueId
        const snapshot = await getDocs(collection(db, 'maintenanceRequests'));
        const maintenanceRequests = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.roomId === venueId) {
                maintenanceRequests.push({ id: doc.id, ...data });
            }
        });

        // Return the filtered maintenance requests as JSON
        if (maintenanceRequests.length > 0) {
            res.status(200).json(maintenanceRequests);
        } else {
            res.status(404).send('No maintenance requests found for this venue');
        }
    } catch (error) {
        console.error('Error getting maintenance requests by venueId:', error);
        res.status(500).send('Error getting maintenance requests by venueId');
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
    const {assignedTo, createdAt, description, issueType, roomId, roomName, status,timestamp, userId} = req.body;

    try{
        // convert dates into the Timestamp type for firestore
        const timestampNow = Timestamp.fromDate(new Date(createdAt));
        const timestampTime = Timestamp.fromDate(new Date(timestamp));

        const docRef = await addDoc(collection(db, 'maintenanceRequests'), {
            assignedTo,
            createdAt: timestampNow,
            description,
            issueType,
            roomId,
            roomName,
            status,
            timestamp: timestampTime,
            userId
        });

       
        res.status(201).json({ id: docRef.id });
     }
     catch(error){
         console.error('Error adding document: ',error);
         res.status(500).send('Error adding documents');
     }

 });



maintenanceRouter.put('/maintenanceRequests/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
  
      const docRef = doc(db, 'maintenanceRequests', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return res.status(404).send('Document not found');
      }
  
      const currentData = docSnap.data();
  
      if (updates.timestamp) {
        const newDate = new Date( updates.timestamp);
        updates.timestamp = Timestamp.fromDate(newDate);
      }
  
      const updatedData = {
        ...currentData,
        ...updates,
        createdAt: currentData.createdAt
      };
  
      await setDoc(docRef, updatedData);
  
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


module.exports = maintenanceRouter;
