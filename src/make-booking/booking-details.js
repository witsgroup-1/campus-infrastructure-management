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

// Function to toggle loading indicator
function toggleLoading(show) {
    document.getElementById('loadingIndicator').classList.toggle('hidden', !show);
    document.getElementById('bookNowBtn').disabled = show;
}

// Function to fetch a venue by its ID
async function getVenueById(venueId) {
    try {
        const venueRef = doc(db, 'venues', venueId);
        const venueDoc = await getDoc(venueRef);
        return venueDoc.exists() ? venueDoc.data() : null;
    } catch (error) {
        console.error('Error fetching venue:', error);
        return null;
    }
}


// Function to fetch bookings for a specific date
async function fetchBookingsForDate(venueId, bookingDate) {
    try {
        const bookingsRef = collection(db, 'venues', venueId, bookingDate);
        const bookingsSnapshot = await getDocs(bookingsRef);
        return bookingsSnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error fetching bookings for date:', error);
        return [];
    }
}


// Function to submit the booking
async function submitBooking(userId, bookingData, venueBookingData, venueId, bookingDate, venueName) {
    toggleLoading(true);
    try {
        await addDoc(collection(db, 'users', userId, 'bookings'), bookingData);
        await addDoc(collection(db, 'venues', venueId, bookingDate), venueBookingData);
        alert(`Booking confirmed for ${venueName} at ${new Date(bookingData.startTime.seconds * 1000)}.`);
        clearForm();
    } catch (error) {
        console.error('Error posting booking:', error);
    } finally {
        toggleLoading(false);
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

// List of all available time slots
const allTimeSlots = [
    "08:00 - 08:45",
    "09:00 - 09:45",
    "10:15 - 11:00",
    "11:15 - 12:00",
    "12:30 - 13:15",
    "14:15 - 15:00",
    "15:15 - 16:00",
    "16:15 - 17:00",
    "17:15 - 18:00",
    "18:15 - 19:00",
    "19:15 - 20:00",
    "20:15 - 21:00",
    "21:15 - 22:00",
    "22:15 - 23:00",
    "23:15 - 00:00"
];

// Function to update the available time slots dropdown
async function updateAvailableTimeSlots(venueId, bookingDate) {
    const bookedSlots = await fetchBookingsForDate(venueId, bookingDate);
    
    // Extract booked start and end times
    const bookedTimes = bookedSlots.map(booking => {
        const startTime = booking.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = booking.endTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${startTime} - ${endTime}`;
    });

    // Filter available time slots
    const availableTimeSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));

    // Update the dropdown
    const timeSlotSelect = document.getElementById('timeSlot');
    timeSlotSelect.innerHTML = ''; // Clear existing options
    availableTimeSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSlotSelect.appendChild(option);
    });

    // If no slots are available, show a message
    if (availableTimeSlots.length === 0) {
        const noSlotsOption = document.createElement('option');
        noSlotsOption.value = '';
        noSlotsOption.textContent = 'No available slots';
        timeSlotSelect.appendChild(noSlotsOption);
    }
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

        // Event listener for date change to update available time slots
        const bookingDateInput = document.getElementById('bookingDate');
        bookingDateInput.addEventListener('change', async function () {
            const bookingDate = bookingDateInput.value;
            if (bookingDate) {
                await updateAvailableTimeSlots(bookingId, bookingDate);
            }
        });

        // Track the user's authentication state
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid;
                console.log(`Logged in as: ${user.email}, User ID: ${userId}`);

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

                    // If the time slot is available (filtered by updateAvailableTimeSlots)
                    if (timeSlot) {
                        const bookingData = {
                            venueId: bookingId,
                            startTime: startTimestamp,
                            endTime: endTimestamp,
                            purpose: bookingPurpose,
                            createdAt: Timestamp.now()
                        };

                        const venueBookingData = {
                            booker: user.uid,
                            startTime: startTimestamp,
                            endTime: endTimestamp,
                            purpose: bookingPurpose,
                            createdAt: Timestamp.now()
                        };

                        await submitBooking(userId, bookingData, venueBookingData, bookingId, bookingDate, venueData.Name);
                    } else {
                        alert("Venue booked for that time, sorry.");
                    }
                });
            } else {
                console.log('No user is signed in.');
                window.location.href = "../index.html";  // Redirect to login page
            }
        });
    });
};
