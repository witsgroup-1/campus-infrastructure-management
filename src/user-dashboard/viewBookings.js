import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTimeSlot(startTime, endTime) {
  const start = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${start} - ${end}`;
}


// Function to show a loading state
function showLoading() {
  const bookingsContainer = document.getElementById('bookings-container');
  bookingsContainer.innerHTML = '<p>Loading bookings...</p>';
}

// Function to hide the loading state
function hideLoading() {
  const bookingsContainer = document.getElementById('bookings-container');
  bookingsContainer.innerHTML = ''; // Clear the loading message
}

async function getFirestoreUserIdByEmail(email) {
  try {
    // Query the Firestore 'users' collection where the 'email' field equals the Firebase Auth email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Retrieve the document ID (which is the Firestore userId)
      const userDoc = querySnapshot.docs[0];
      const firestoreUserId = userDoc.id; // The document ID is the userId
      return firestoreUserId;
    } else {
      throw new Error('No matching user document found in Firestore.');
    }
  } catch (error) {
    console.error('Error fetching Firestore userId by email:', error);
    return null; // Handle the error
  }
}
// Function to fetch user bookings from the API
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
  console.log("Displaying bookings:", bookings);

  const bookingsContainer = document.getElementById('bookings-container');
  const noBookingsMessage = document.getElementById('no-bookings-message');

  bookingsContainer.innerHTML = '';

  const now = new Date();

  // Filter only upcoming bookings (where start_time is in the future)
  const upcomingBookings = bookings.filter(booking => new Date(booking.start_time) > now);

  if (!upcomingBookings.length) {
    // No upcoming bookings, show the "no upcoming bookings" message and hide the container
    bookingsContainer.classList.add('hidden');
    noBookingsMessage.classList.remove('hidden');
  } else {
    // Limit to 3 bookings
    const bookingsToDisplay = upcomingBookings.slice(0, 3);

    bookingsContainer.classList.remove('hidden');
    noBookingsMessage.classList.add('hidden');

    bookingsToDisplay.forEach(booking => {
      const bookingElement = document.createElement('div');
      bookingElement.classList.add('w-11/12', 'h-16', 'bg-gray-200', 'rounded-lg', 'mb-2', 'p-2');

      bookingElement.innerHTML = `
        <div class="booking-container flex items-center">
          <div class="booking-info flex-1">
            <div><strong>Name:</strong> ${booking.name}</div>
            <div><strong>Venue:</strong> ${booking.venue_name}</div>
          </div>
          <div class="separator w-px bg-[#003B5C] h-12 mx-4"></div>
          <div class="booking-times flex-1 text-right">
            <div><strong>Date:</strong> ${formatDate(booking.start_time)}</div>
            <div><strong>Slot:</strong> ${formatTimeSlot(booking.start_time, booking.end_time)}</div>
          </div>
        </div>
      `;

      bookingsContainer.appendChild(bookingElement);
    });
  }
}

// Function to load and display user bookings
async function loadUserBookings(userEmail) {
  showLoading(); // Show loading message

  // Fetch the corresponding Firestore userId using Firebase Auth email
  const firestoreUserId = await getFirestoreUserIdByEmail(userEmail);
  console.log(firestoreUserId)

  if (firestoreUserId) {
    // Use the Firestore userId to fetch bookings
    const bookings = await fetchUserBookings(firestoreUserId);
    displayBookings(bookings);
  } else {
    console.error('Could not find Firestore userId for the given email.');
  }

  hideLoading(); // Hide loading message
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in with email:", user.email);
    loadUserBookings(user.email); // Load bookings based on the user's email
    console.log(user.email)
  } else {
    console.log("No user is signed in.");
  }
});

  




