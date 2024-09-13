import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Function to show a loading state
function showLoading() {
  const bookingsContainer = document.getElementById('bookings-container');
  bookingsContainer.innerHTML = '<p>Loading bookings...</p>';
}

async function fetchUserBookings(userId) {
  try {
    const url = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings, please try again.');
    }

    const bookings = await response.json();
    console.log('Bookings fetched:', bookings); // Log the response to inspect it
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return []; // Return an empty array in case of an error
  }
}

function displayBookings(bookings) {
  const bookingsContainer = document.getElementById('bookings-container');
  const noBookingsMessage = document.getElementById('no-bookings-message');

  // Clear any existing bookings
  bookingsContainer.innerHTML = '';

  // Get current time
  const now = new Date();

  // Filter only upcoming bookings (where start_time is in the future)
  const upcomingBookings = bookings.filter(booking => new Date(booking.start_time) > now);

  if (!upcomingBookings || upcomingBookings.length === 0) {
    // No upcoming bookings, show the "no upcoming bookings" message and image
    bookingsContainer.classList.add('hidden');
    noBookingsMessage.classList.remove('hidden');
  } else {
    // Limit to 3 bookings
    const bookingsToDisplay = upcomingBookings.slice(0, 3);

    // Hide "no upcoming bookings" message
    bookingsContainer.classList.remove('hidden');
    noBookingsMessage.classList.add('hidden');

    // Populate HTML structure with the first 3 upcoming bookings
    bookingsToDisplay.forEach(booking => {
      const bookingElement = document.createElement('div');
      bookingElement.classList.add('w-11/12', 'h-16', 'bg-gray-200', 'rounded-lg', 'mb-2', 'p-2');

      // Customize booking details
      bookingElement.innerHTML = `
        <div class="booking-container flex items-center">
          <div class="booking-info flex-1">
            <div><strong>Name:</strong> ${booking.name}</div>
            <div><strong>Venue name:</strong> ${booking.venue_name}</div>
          </div>
          <div class="separator w-px bg-[#003B5C] h-12  mx-4"></div> 
          <div class="booking-times flex-1">
            <div><strong>Start Time:</strong> ${new Date(booking.start_time).toLocaleString()}</div>
            <div><strong>End Time:</strong> ${new Date(booking.end_time).toLocaleString()}</div>
          </div>
        </div>
      `;

      bookingsContainer.appendChild(bookingElement);
    });
  }
}

// Function to load user bookings once the user is authenticated
async function loadUserBookings(userId) {
  showLoading(); // Display loading state while fetching
  const bookings = await fetchUserBookings(userId);
  displayBookings(bookings);
}


onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
    loadUserBookings(user.uid); // Load bookings for the signed-in user
  } else {
    console.log("No user is signed in.");
    // Optionally redirect to login page or display message
  }
});


