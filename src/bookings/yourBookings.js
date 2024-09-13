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

function showLoading() {
    const scheduledContent = document.getElementById('scheduled-content');
    scheduledContent.innerHTML = '<p>Loading bookings...</p>';
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
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }
  
  function displayBookings(bookings) {
    const scheduledContent = document.getElementById('scheduled-content');
    const inprogressContent = document.getElementById('in-progress-content')
  
    // Clear any existing bookings content
    scheduledContent.innerHTML = '';
  
    const now = new Date();
  
    // Separate upcoming and past bookings
    const upcomingBookings = bookings.filter(booking => new Date(booking.start_time) > now);
    const pastBookings = bookings.filter(booking => new Date(booking.start_time) <= now);
  
    // Display Upcoming Bookings
    const upcomingBookingsSection = document.createElement('div');
    upcomingBookingsSection.classList.add('upcoming-bookings', 'mb-4');
  
  
    if (upcomingBookings.length === 0) {
      upcomingBookingsSection.innerHTML += '<p>No upcoming bookings.</p>';
    } else {
      upcomingBookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.classList.add('w-full', 'bg-gray-200', 'rounded-lg', 'mb-2', 'p-4', 'shadow-sm');
        bookingElement.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <div><strong>Name:</strong> ${booking.name}</div>
              <div><strong>Venue:</strong> ${booking.venue_name}</div>
              <div><strong>Start:</strong> ${new Date(booking.start_time).toLocaleString()}</div>
              <div><strong>End:</strong> ${new Date(booking.end_time).toLocaleString()}</div>
            </div>
            <button class="bg-red-500 text-white px-3 py-1 rounded" onclick="cancelBooking('${booking.id}')">Cancel</button>
          </div>
        `;
        upcomingBookingsSection.appendChild(bookingElement);
      });
    }
  
    // Add upcoming bookings section to the scheduled content
    scheduledContent.appendChild(upcomingBookingsSection);
  
    // Display Past Bookings
    const pastBookingsSection = document.createElement('div');
    pastBookingsSection.classList.add('past-bookings', 'mb-4');
  
  
    if (pastBookings.length === 0) {
      pastBookingsSection.innerHTML += '<p>No past bookings.</p>';
    } else {
      pastBookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.classList.add('w-full', 'bg-gray-200', 'rounded-lg', 'mb-2', 'p-4', 'shadow-sm');
        bookingElement.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <div><strong>Name:</strong> ${booking.name}</div>
              <div><strong>Venue:</strong> ${booking.venue_name}</div>
              <div><strong>Start:</strong> ${new Date(booking.start_time).toLocaleString()}</div>
              <div><strong>End:</strong> ${new Date(booking.end_time).toLocaleString()}</div>
            </div>
            <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-[#003B5C] focus:outline-none" onclick="bookAgain('${booking.id}')">Book Again</button>
          </div>
        `;
        pastBookingsSection.appendChild(bookingElement);
      });
    }
  
    // Add past bookings section to the scheduled content
    inprogressContent.appendChild(pastBookingsSection);
  }
  
  // Function to handle booking cancellation
  function cancelBooking(bookingId) {
    alert(`Booking with ID ${bookingId} cancelled (You would add logic to delete the booking).`);
    // Add logic to delete the booking from the server
  }
  
  // Function to handle rebooking
  function bookAgain(bookingId) {
    alert(`Booking with ID ${bookingId} being booked again (You would add logic to create a new booking).`);
    // Add logic to create a new booking based on the past booking
  }
  
  // Function to load user bookings once the user is authenticated
  async function loadUserBookings(userId) {
    showLoading(); // Display loading state while fetching
    const bookings = await fetchUserBookings(userId);
    displayBookings(bookings);
  }
  
  // Listen to the user's authentication state and load bookings if signed in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadUserBookings(user.uid); // Load bookings for the signed-in user
    } else {
      console.log("No user is signed in.");
      // Optionally redirect to login page or display message
    }
  });
  