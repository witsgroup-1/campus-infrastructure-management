// Import Firebase SDK and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDoc, addDoc, Timestamp, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
const auth = getAuth(app);

const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";   


// Function to toggle loading indicator
function toggleLoading(show) {
    document.getElementById('loadingIndicator').classList.toggle('hidden', !show);
    document.getElementById('bookNowBtn').disabled = show;
}

// Function to fetch a venue by its ID via API
async function getVenueById(venueId) {
   
    const apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey 
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching venue: ${response.statusText}`);
        }

        const venueData = await response.json();
        return venueData; // Venue data from API
    } catch (error) {
        console.error('Error fetching venue from API:', error);
        return null;
    }
}


// Function to fetch bookings for a specific date via API
async function fetchBookingsForDate(venueId, bookingDate) {
    const apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}/${bookingDate}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey // Include your API key if needed
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching bookings: ${response.statusText}`);
        }

        const bookings = await response.json();
        return bookings; // Return the bookings data
    } catch (error) {
        console.error('Error fetching bookings from API:', error);
        return [];
    }
}


function convertToDate(timestamp) {
    if (timestamp.seconds) {
        // Firestore timestamp format
        return new Date(timestamp.seconds * 1000);
    } else {
        // Assume it's already a valid Date object or ISO string
        return new Date(timestamp);
    }
}

function hasTimeConflict(startTime, endTime, existingBookings) {
    for (const booking of existingBookings) {
        const existingStart = convertToDate(booking.startTime);
        const existingEnd = convertToDate(booking.endTime);

        // Check for any overlap
        if (
            (startTime >= existingStart && startTime < existingEnd) ||
            (endTime > existingStart && endTime <= existingEnd) ||
            (startTime <= existingStart && endTime >= existingEnd)
        ) {
            return true;
        }
    }
    return false;
}



// Function to submit the booking
async function submitBooking(
    userId,
    bookingData,
    venueBookingData,
    venueId,
    bookingDate,
    venueName,
    bookingDataCollection,
    dependencies = {}
) {
    const {
        toggleLoadingFn = toggleLoading,
        fetchBookingsForDateFn = fetchBookingsForDate,
        hasTimeConflictFn = hasTimeConflict,
        alertFn = alert,
        clearFormFn = clearForm,
    } = dependencies;

    toggleLoadingFn(true);
    try {
        // Fetch existing bookings for the selected date
        const existingBookings = await fetchBookingsForDateFn(venueId, bookingDate);

        // Check for time conflicts
        const startTime = bookingData.start_time instanceof Date
            ? bookingData.start_time
            : bookingData.start_time.toDate();
        const endTime = bookingData.end_time instanceof Date
            ? bookingData.end_time
            : bookingData.end_time.toDate();

        if (hasTimeConflictFn(startTime, endTime, existingBookings)) {
            alertFn(`The venue is already booked between ${startTime.toLocaleTimeString()} and ${endTime.toLocaleTimeString()}. Please choose a different time.`);
            toggleLoadingFn(false);
            return; // Stop the booking process if there is a conflict
        }

        // Proceed with booking if no conflicts
        const userBookingResponse = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(bookingData)
        });

        if (!userBookingResponse.ok) {
            // Handle error response from the API
            const errorText = await userBookingResponse.text();
            console.error('Error posting booking to API:', userBookingResponse.status, errorText);
            alertFn('Failed to post booking to the server API.');
            toggleLoadingFn(false);
            return;
        }

        // Post venue booking to the venues/venueId/bookingDate API
        const apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}/${bookingDate}`;
        const venueResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(venueBookingData)
        });

        if (!venueResponse.ok) {
            const errorText = await venueResponse.text();
            console.error('Error adding booking to venues:', venueResponse.status, errorText);
            alertFn('Failed to add booking to venue.');
            toggleLoadingFn(false);
            return;
        }

        const venueResponseData = await venueResponse.json();

        // Post venue booking data collection (if necessary)
        const dataCollectionResponse = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/Bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(bookingDataCollection)
        });

        if (!dataCollectionResponse.ok) {
            const errorText = await dataCollectionResponse.text();
            console.error('Error posting venue booking to API:', dataCollectionResponse.status, errorText);
            alertFn('Failed to post venue booking to the server API.');
        } else {
            const responseData = await dataCollectionResponse.json();
            alertFn(`Booking confirmed for ${venueName} at ${startTime.toLocaleTimeString()}.`);
            clearFormFn();
        }

    } catch (error) {
        console.error('Error posting booking:', error);
        alertFn('An unexpected error occurred while booking.');
    } finally {
        toggleLoadingFn(false); // Ensure loading is stopped
    }
}



// Function to clear the form
function clearForm() {
    document.getElementById('bookingDate').value = "";
    document.getElementById('timeSlot').value = "";
    document.getElementById('bookingPurpose').value = "";
}

// Function to validate if the booking is for a future date and time
function isFutureDateTime(bookingDate, startTime) {
    const currentDateTime = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${startTime}:00`);
    return bookingDateTime > currentDateTime;  // Ensure the selected booking time is in the future
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

    const [startTime] = timeSlot.split(' - ');
    if (!isFutureDateTime(bookingDate, startTime)) {
        alert("You cannot book for a date and time in the past. Please select a valid time.");
        return false;
    }

    return true;
}



// Initialize booking functionality
window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');  // This is the venueId

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

        const bookingDateInput = document.getElementById('bookingDate');

        // Track the user's authentication state
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid;
              

                // Add event listener to the 'Book Now' button
                const bookNowBtn = document.getElementById('bookNowBtn');
                bookNowBtn.addEventListener('click', async function () {
                    if (!isFormValid()) return;

                    const bookingDate = bookingDateInput.value;
                    const timeSlot = document.getElementById('timeSlot').value;
                    const bookingPurpose = document.getElementById('bookingPurpose').value;
                    const [startTime, endTime] = timeSlot.split(' - ');

                    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
                    const endDateTime = new Date(`${bookingDate}T${endTime}:00`);

                    const startTimestamp = Timestamp.fromDate(startDateTime);
                    const endTimestamp = Timestamp.fromDate(endDateTime);

                    const bookingData = {
                        "venue_id": bookingId,
                        "start_time": startTimestamp,
                        "end_time": endTimestamp,
                        "purpose": bookingPurpose
                    };

                    const venueBookingData = {
                        booker: user.uid,
                        startTime: startTimestamp,
                        endTime: endTimestamp,
                        purpose: bookingPurpose,
                        createdAt: Timestamp.now()
                    };

                    const bookingDataCollection = {
                       
                        "status": "approved",
                        "date": bookingDate,
                        "start_time": startTime,
                        "end_time": endTime,
                        "purpose": bookingPurpose,
                        "userId": userId,
                        "venueId": bookingId
                        
                    };
                  

                    await submitBooking(userId, bookingData, venueBookingData, bookingId, bookingDate, venueData.Name, bookingDataCollection);
                });
            } else {
                
                window.location.href = "../index.html";  // Redirect to login page
            }
        });
    });
};
