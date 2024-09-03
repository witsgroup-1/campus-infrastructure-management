const { collection, addDoc ,doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, deleteDoc} = require("firebase/firestore"); 
const express = require('express');
const { app, db, auth } = require("../src/firebaseInit.js");
const venuesRouter = express.Router();

//get all venues
venuesRouter.get('/venues', async (req,res)=>{
    try{
        const snapshot=await getDocs(collection(db, 'venues'));
        const venues=[];
        
        for(const doc of snapshot.docs){
            venues.push({id:doc.id, ...doc.data()});
        }

        res.json(venues);

    }

    catch (error){
        res.status(500).send('Cannot get venues')
    }
})

// Get venue by category
venuesRouter.get('/venues/:Category', async (req, res) => {
    const { Category } = req.params;

    try {
        const docRef = collection(db, 'venues');
        const docs = await getDocs(docRef);
        const category = [];

        docs.forEach((doc) => {
            if (doc.data().Category === Category) {
                category.push({ id: doc.id, ...doc.data() });
            }
        });

        res.status(200).json(category);
    } catch (error) {
        res.status(500).send('Cannot get venues');
    }
});

//create new venue
venuesRouter.post('/venues', async(req,res)=>{
    try{
        const venue= {
            Capacity:req.body.Capacity,
            Category:req.body.Category,
            Features:req.body.Features,
            Building:req.body.Building,
            Name:req.body.Name,
        };
        const docRef = await addDoc(collection(db, 'venues'), venue);
        res.status(201).json({id:docRef.id});
    }

    catch(error){
        console.error("Error adding venue: ", error);
        res.status(500).send('Venue not added');
    }
});


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