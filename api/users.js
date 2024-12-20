require('dotenv').config();
const express = require('express');
const { app, db, auth,createUserWithEmailAndPassword } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where } = require("firebase/firestore");
const usersRouter = express.Router();

// get all users.
// usersRouter.get('/users', async (req, res) => {
//     try {
//         const snapshot = await getDocs(collection(db, 'users'));
//         const users = [];
//         snapshot.forEach((doc) => {
//             users.push({ id: doc.id, ...doc.data() });
//         });
//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error getting users:', error);
//         res.status(500).send('Error getting users');
//     }
// });

usersRouter.get('/users', async (req, res) => {
    try {
        const usersRef = collection(db, 'users');
        let q = usersRef; // Start with the reference, without any filters

        const { role, isLecturer, isTutor, name, surname } = req.query;

        // Apply filters only if the corresponding query parameters are present
        if (role) {
            q = query(q, where('role', '==', role));
        }

        if (isLecturer) {
            q = query(q, where('isLecturer', '==', isLecturer === 'true')); // Convert string to boolean
        }

        if (isTutor) {
            q = query(q, where('isTutor', '==', isTutor === 'true')); // Convert string to boolean
        }

        // Name or surname search 
        if (name) {
            q = query(q, where('name', '>=', name), where('name', '<=', name + '\uf8ff')); // Filters names starting with 'name'
        }

        if (surname) {
            q = query(q, where('surname', '>=', surname), where('surname', '<=', surname + '\uf8ff')); // Filters surnames starting with 'surname'
        }

        // Get the filtered snapshot or all users if no query filters were applied
        const snapshot = await getDocs(q);
        const users = [];
        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(users); // Return filtered or full list of users
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send('Error getting users');
    }
});



// creating a new user via signup
usersRouter.post('/users/signup', async (req, res) => {
    const { name, surname, email, role, faculty, is_tutor, is_lecturer, password } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await setDoc(doc(db, 'users', userId), { name, surname, email, role, faculty, is_tutor, is_lecturer });

        res.status(201).json({ id: userId, message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).send(`Error creating user: ${error.message}`);
    }
});


//find user by id
usersRouter.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            res.status(200).json({ id: userDoc.id, ...userDoc.data() });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).send('Error getting user');
    }
});

// Update a user by userId
usersRouter.put('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, surname, email, role, faculty, is_tutor, is_lecturer, password } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (surname !== undefined) updateData.surname = surname;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (faculty !== undefined) updateData.faculty = faculty;
    if (is_tutor !== undefined) updateData.is_tutor = is_tutor;
    if (is_lecturer !== undefined) updateData.is_lecturer = is_lecturer;
    if (password !== undefined) updateData.password = password;

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updateData);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
});


// Delete a user by userId
usersRouter.delete('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});

usersRouter.get('/users/:userId/bookings', async (req, res) => {
    const { userId } = req.params;
    try {
        const bookingsSnapshot = await getDocs(collection(db, 'users', userId, 'bookings'));
        const bookings = [];
        bookingsSnapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).send('Error getting bookings');
    }
});

// create a booking for a user
usersRouter.post('/users/:userId/bookings', async (req, res) => {
    const { userId } = req.params;
    const {venue_id,start_time, end_time,purpose } = req.body;
    try {
        const bookingRef = await addDoc(collection(db, 'users', userId, 'bookings'), {venue_id, start_time, end_time,purpose});
        res.status(201).json({ id: bookingRef.id, message: 'Booking created successfully' });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).send('Error creating booking');
    }
});

// get a booking by bookingId
usersRouter.get('/users/:userId/bookings/:bookingId', async (req, res) => {
    const { userId, bookingId } = req.params;
    try {
        const bookingDoc = await getDoc(doc(db, 'users', userId, 'bookings', bookingId));
        if (bookingDoc.exists()) {
            res.status(200).json({ id: bookingDoc.id, ...bookingDoc.data() });
        } else {
            res.status(404).send('Booking not found');
        }
    } catch (error) {
        console.error('Error getting booking:', error);
        res.status(500).send('Error getting booking');
    }
});

// delete a booking by bookingId
usersRouter.delete('/users/:userId/bookings/:bookingId', async (req, res) => {
    const { userId, bookingId } = req.params;
    try {
        await deleteDoc(doc(db, 'users', userId, 'bookings', bookingId));
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).send('Error deleting booking');
    }
});

// all courses for a user
usersRouter.get('/users/:userId/courses', async (req, res) => {
    const { userId } = req.params;
    try {
        const coursesSnapshot = await getDocs(collection(db, 'users', userId, 'courses'));
        const courses = [];
        coursesSnapshot.forEach((doc) => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).send('Error getting courses');
    }
});

// creating a course for a user
usersRouter.post('/users/:userId/courses', async (req, res) => {
    const { userId } = req.params;
    const { course_id, lecturer_id } = req.body;
    try {
        const courseRef = await addDoc(collection(db, 'users', userId, 'courses'), {course_id, lecturer_id});
        res.status(201).json({ id: courseRef.id, message: 'Course created successfully' });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).send('Error creating course');
    }
});

// get a course by courseId
usersRouter.get('/users/:userId/courses/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    try {
        const courseDoc = await getDoc(doc(db, 'users', userId, 'courses', courseId));
        if (courseDoc.exists()) {
            res.status(200).json({ id: courseDoc.id, ...courseDoc.data() });
        } else {
            res.status(404).send('Course not found');
        }
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).send('Error getting course');
    }
});

// delete a course by courseId
usersRouter.delete('/users/:userId/courses/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    try {
        await deleteDoc(doc(db, 'users', userId, 'courses', courseId));
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send('Error deleting course');
    }
});

module.exports = usersRouter;
