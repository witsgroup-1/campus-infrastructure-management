// Import Firebase SDK and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { where, getDocs, query,getFirestore, collection, doc, getDoc, addDoc,  Timestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// Function to check if the venue is booked for the selected time slot
async function isVenueAvailable(venueId, bookingDate, startTimestamp, endTimestamp) {
    try {
        // Query all bookings for the venue on the selected date
        const bookingsRef = collection(db, 'venues', venueId, bookingDate);
        const bookingsSnapshot = await getDocs(bookingsRef);

        if (bookingsSnapshot.empty) {
            // No bookings exist for this date, the venue is available
            return true;
        }

        // Loop through all bookings and check for matching start and end times
        let isAvailable = true;
        bookingsSnapshot.forEach(doc => {
            const booking = doc.data();

            // Check if the booking has the same start and end times
            const existingStart = booking.startTime.toDate();
            const existingEnd = booking.endTime.toDate();

            if (
                startTimestamp.toDate().getTime() === existingStart.getTime() && 
                endTimestamp.toDate().getTime() === existingEnd.getTime()
            ) {
                // Exact time match found, the venue is not available
                isAvailable = false;
            }
        });

        return isAvailable;
    } catch (error) {
        console.error('Error checking venue availability:', error);
        return false;
    }
}


// Function to clear the form
function clearForm() {
    document.getElementById('bookingDate').value = "";
    document.getElementById('timeSlot').value = "";
    document.getElementById('bookingPurpose').value = "";
}

// Function to show loading and disable the button
function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('bookNowBtn').disabled = true;
}

// Function to hide loading and enable the button
function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
    document.getElementById('bookNowBtn').disabled = false;
}

// Function to submit the booking to Firestore
async function submitBooking(userId, bookingData, venueBookingData, venueId, bookingDate, venueName) {
    if (!userId || !bookingData || !venueId || !bookingDate) {
        console.log('Missing userId, bookingData, venueId, or bookingDate');
        hideLoading();  // Ensure to hide loading if there's an error
        return;
    }

    try {
        // Add booking to the user's bookings collection
        await addDoc(collection(db, 'users', userId, 'bookings'), bookingData);

        // Add booking to the venue's collection for the specific date
        await addDoc(collection(db, 'venues', venueId, bookingDate), venueBookingData);

        alert(`Booking confirmed for venue name: ${venueName} at ${Date(bookingData.startTime)}.\nPurpose: ${bookingData.purpose}`);

         // Clear the form after successful booking
         clearForm();
    } catch (error) {
        console.error('Error posting booking data:', error);
    }
    finally {
        hideLoading();  // Always hide loading after the booking is processed
    }


}

/// Function to validate if the booking is for a future date and time
function isFutureDateTime(bookingDate, startTime) {
    const currentDateTime = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${startTime}:00`);
    
    // Check if the selected booking time is in the future
    return bookingDateTime > currentDateTime;
}

// Function to validate the form
function isFormValid() {
    const bookingDate = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const bookingPurpose = document.getElementById('bookingPurpose').value;

    if (!bookingDate || !timeSlot || !bookingPurpose) {
        alert("Please fill in all fields.");
        return false;
    }

    // Extract the start time from the selected time slot
    const [startTime, endTime] = timeSlot.split(' - ');

    // Check if the booking date and time are in the future
    if (!isFutureDateTime(bookingDate, startTime)) {
        alert("You cannot book for a date and time in the past. Please select a valid time.");
        return false;
    }

    return true;
}

// Initialize booking functionality
window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId'); // This is the venueId

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
        let venueName = venueData.Name;

        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            console.log(`Logged in as: ${userEmail}`);

            getUserByEmail(userEmail).then(userId => {
                if (!userId) {
                    console.log('No userId found');
                    return;
                }

                const bookNowBtn = document.getElementById('bookNowBtn');

                // Add event listener to the 'Book Now' button
                bookNowBtn.addEventListener('click', async function () {
                    showLoading();  // Show loading when booking starts

                    // Validate the form and the selected date/time
                    if (!isFormValid()) {
                        hideLoading();
                        return;
                    }

                    const bookingDate = document.getElementById('bookingDate').value; // e.g., '2024-09-20'
                    const timeSlot = document.getElementById('timeSlot').value;
                    const bookingPurpose = document.getElementById('bookingPurpose').value;

                    // Split the time slot into start and end times
                    const [startTime, endTime] = timeSlot.split(' - ');

                    // Combine the date and time to create Date objects
                    const startDateTimeString = `${bookingDate}T${startTime}:00`;
                    const endDateTimeString = `${bookingDate}T${endTime}:00`;

                    const startDateTime = new Date(startDateTimeString);
                    const endDateTime = new Date(endDateTimeString);

                    // Convert Date objects to Firestore Timestamps
                    const startTimestamp = Timestamp.fromDate(startDateTime);
                    const endTimestamp = Timestamp.fromDate(endDateTime);

                    // Await the result of the venue availability check
                    const isAvailable = await isVenueAvailable(bookingId, bookingDate, startTimestamp, endTimestamp);

                    if (isAvailable) {
                        // Create the booking object for the user
                        const bookingData = {
                            venueId: bookingId,
                            startTime: startTimestamp,
                            endTime: endTimestamp,
                            purpose: bookingPurpose,
                            createdAt: Timestamp.now()
                        };

                        // Create the booking object for the venue
                        const venueBookingData = {
                            startTime: startTimestamp,
                            endTime: endTimestamp,
                            purpose: bookingPurpose,
                            createdAt: Timestamp.now()
                        };

                        console.log(bookingData);

                        // Post booking data to both the user's collection and the venue's collection
                        await submitBooking(userId, bookingData, venueBookingData, bookingId, bookingDate, venueName);
                    } else {
                        alert("Venue booked for that time, sorry.");
                        hideLoading();  // Always hide loading after the booking is processed
                    }
                });
            });
        } else {
            console.log('No email found');
        }
    });
};
