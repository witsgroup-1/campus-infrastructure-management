// Import Firebase SDK and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { where, getDocs, query,getFirestore, collection, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
    authDomain: "campusinfrastructuremanagement.firebaseapp.com",
    projectId: "campusinfrastructuremanagement",
    storageBucket: "campusinfrastructuremanagement.appspot.com",
    messagingSenderId: "981921503275",
    appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
    measurementId: "G-Y95YE5ZDRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch a venue by its ID
async function getVenueById(venueId) {
    if (!venueId) {
        console.error('No venueId provided');
        return null;
    }

    try {
        const venueRef = doc(db, 'venues', venueId);
        const venueDoc = await getDoc(venueRef);

        if (!venueDoc.exists()) {
            console.log('No venue found with the provided venueId.');
            return null;
        }

        return venueDoc.data();

    } catch (error) {
        console.error('Error fetching venue:', error);
    }
}

// Function to search for a user by email and get their user ID
async function getUserByEmail(email) {
    if (!email) {
        console.log('No email provided');
        return null;
    }

    try {
        const usersCollection = collection(db, 'users');
        const userQuery = query(usersCollection, where('email', '==', email));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            console.log('No user found with the provided email.');
            return null;
        }

        let userId;
        querySnapshot.forEach(doc => {
            userId = doc.id;
        });

        return userId;

    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

// Function to submit the booking to Firestore
async function submitBooking(userId, bookingData) {
    if (!userId || !bookingData) {
        console.log('Missing userId or booking data');
        return;
    }

    try {
        const bookingRef = await addDoc(collection(db, 'users', userId, 'bookings'), bookingData);
        alert(`Booking confirmed for ${bookingData.venue_name} at ${bookingData.start_time}.\nPurpose: ${bookingData.purpose}`);
    } catch (error) {
        console.error('Error posting booking data:', error);
    }
}

// Initialize booking functionality
window.onload = function () {

    // Fetch venue details from URL parameters
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');

    if (!bookingId) {
        console.error('No bookingId provided in URL');
        return;
    }

    // Fetch venue details from Firestore using the venue ID
    getVenueById(bookingId).then(venueData => {
        if (!venueData) {
            alert("No venue data found.");
            return;
        }

        document.getElementById("venueName").textContent = `${venueData.Name} (${venueData.Category})`;
        if (venueData.date) {
            document.getElementById('date').textContent = venueData.date;
        }

        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            document.getElementById('userEmailDisplay').textContent = `Logged in as: ${userEmail}`;

            getUserByEmail(userEmail).then(userId => {
                if (!userId) {
                    console.log('No userId found');
                    return;
                }

                const bookNowBtn = document.getElementById('bookNowBtn');

                // Add event listener to the 'Book Now' button
                bookNowBtn.addEventListener('click', async function () {
                    const bookingDate = document.getElementById('bookingDate').value;
                    const timeSlot = document.getElementById('timeSlot').value;
                    const bookingPurpose = document.getElementById('bookingPurpose').value;

                    if (!bookingDate || !timeSlot || !bookingPurpose) {
                        alert("Please fill in all booking details.");
                        return;
                    }

                    // Ensure venueData has been fetched before proceeding
                    if (!venueData || !venueData.Name) {
                        alert("Venue data is missing. Please try again later.");
                        return;
                    }

                    // Prepare booking data
                    const bookingData = {
                        venue_id: bookingId,
                        name: venueData.Name,
                        start_time: timeSlot,
                        end_time: '', // Provide end time if applicable
                        purpose: bookingPurpose,
                        venue_name: venueData.Name,
                        booking_date: bookingDate
                    };

                    // Post booking data
                    submitBooking(userId, bookingData);
                });
            });
        } else {
            console.log('No email found');
        }
    });
};
