const { collection, addDoc ,doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, deleteDoc, query, where} = require("firebase/firestore"); 
const express = require('express');
const { app, db, auth } = require("../src/firebaseInit.js");
const venuesRouter = express.Router();

//get all venues
// venuesRouter.get('/venues', async (req,res)=>{
//     try{
//         const snapshot=await getDocs(collection(db, 'venues'));
//         const venues=[];
        
//         for(const doc of snapshot.docs){
//             venues.push({id:doc.id, ...doc.data()});
//         }

//         res.json(venues);

//     }

//     catch (error){
//         res.status(500).send('Cannot get venues')
//     }
// })


venuesRouter.get('/venues', async (req, res) => {
    const { name } = req.query; // Use query instead of params

    try {
        const docRef = collection(db, 'venues');
        const docs = await getDocs(docRef);
        const venues = [];

        docs.forEach((doc) => {
            if (!name || doc.data().Name.toLowerCase().includes(name.toLowerCase())) {
                venues.push({ id: doc.id, ...doc.data() });
            }
        });

        if (venues.length === 0) {
            return res.status(200).send("No venues found for this name");
        }

        res.status(200).json(venues);
    } catch (error) {
        res.status(500).send('Cannot get venues');
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

        if(category.length==0){
            res.status(200).send("No venues found for this filter");
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).send('Cannot get venues');
    }
});


//get venue by name
// venuesRouter.get('/venues/:name', async (req, res) => {
//     const { name } = req.params;

//     try {
//         const docRef = collection(db, 'venues');
//         const docs = await getDocs(docRef);
//         const Name = [];

//         docs.forEach((doc) => {
//             if (doc.data().name === name) {
//                 Name.push({ id: doc.id, ...doc.data() });
//             }
//         });

//         if(Name.length==0){
//             res.status(200).send("No venues found for this name");
//         }

//         res.status(200).json(Name);
//     } catch (error) {
//         res.status(500).send('Cannot get venues');
//     }
// });




//create new venue
venuesRouter.post('/venues', async(req,res)=>{
    try{
        const venue= {
            Capacity:req.body.Capacity,
            Category:req.body.Category,
            Features:req.body.Features,
            Building:req.body.Building,
            Name:req.body.Name,
          Booked:req.body.Booked
        };
        const docRef = await addDoc(collection(db, 'venues'), venue);
        res.status(201).send("Venue created successfully");
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

        const venueDocRef= doc(db, 'venues',venueId);
        const venueDoc= await getDoc(venueDocRef);

        if (!(venueDoc.exists())) {
            return res.status(404).send('Venue not found');
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
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

// Get venue by ID
venuesRouter.get('/venues/:venueId', async (req, res) => {
    const { venueId } = req.params;

    try {
        const venueDocRef = doc(db, 'venues', venueId);
        const venueDoc = await getDoc(venueDocRef);

        if (venueDoc.exists()) {
            res.status(200).json({ id: venueDoc.id, ...venueDoc.data() });
        } else {
            res.status(404).send('Venue not found');
        }
    } catch (error) {
        console.error("Error fetching venue: ", error);
        res.status(500).send('Cannot get venue');
    }
});



module.exports=venuesRouter;
