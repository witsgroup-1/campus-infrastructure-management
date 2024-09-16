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

venuesRouter.get('/venues/:venueId', async (req, res) => {
    const { venueId } = req.params;

    try {
        const venueDoc = await getDoc(doc(db, 'venues', venueId));
        if (venueDoc.exists()) {
            res.status(200).json({ id: venueDoc.id, ...venueDoc.data() });
        } else {
            res.status(404).send('Venue not found');
        }
    } catch (error) {
        console.error('Error getting Venue:', error);
        res.status(500).send('Error getting venue');
    }
});




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
            //a boolean value that says if the venue is booked or not, it should change when a booking is made.
            Booked:req.body.Booked
        };
        const docRef = await addDoc(collection(db, 'venues'), venue);
        res.status(201).json({id:docRef.id});
    }

    catch(error){
        console.error("Error adding venue: ", error);
        res.status(500).send('Venue not added');
    }
});

module.exports = venuesRouter;