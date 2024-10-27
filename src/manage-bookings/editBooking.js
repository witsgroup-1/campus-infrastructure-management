import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs,getDoc,doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
  authDomain: "campusinfrastructuremanagement.firebaseapp.com",
  projectId: "campusinfrastructuremanagement",
  storageBucket: "campusinfrastructuremanagement.appspot.com",
  messagingSenderId: "981921503275",
  appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
  measurementId: "G-Y95YE5ZDRY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Fetch all users
export const fetchUsers = async () => {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const fetchBookingsForUser = async (userId) => {
  const bookingsRef = collection(db, `users/${userId}/bookings`);
  const bookingsSnapshot = await getDocs(bookingsRef);
  const bookingsList = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
  }));
  return bookingsList;
};

let allBookings = [];
let venues = [];
let booking;

const params = new URLSearchParams(window.location.search);
const bookingId = params.get('bookingId');

console.log('Booking ID:', bookingId);

// API URLs
const bookingsUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/bookings';  
const venuesUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';  

// Fetch venues from the API
async function fetchVenues() {
  return fetch(venuesUrl, {
    method: 'GET',
    headers: {
      'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    venues = data; 
    populateVenues(venues);
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
  });
}


// Function to get the venue info based on venueId
async function getRoomInfo(venueId) {

  for(let i=0;i<venues.length;i++){
    if(venueId==venues[i].id){
      //console.log(venues[i]);
      return venues[i];
    }
    
  }
}


// Function to get the booking info based on bookingId
async function getBooking(bookingId) {
  return allBookings.find(booking => booking.id === bookingId);
}

// Populate venue dropdown
function populateVenues(data) {
  const venueSelector = document.getElementById('venueSelector');
  venueSelector.innerHTML = '';

  data.forEach(venue => {
    const option = document.createElement('option');
    option.value = venue.id;
    option.textContent = venue.Name;
    venueSelector.appendChild(option);
  });

  const booking = getBooking(bookingId);
  if (booking) {
    const venueId = booking.venueId;
    if (venueId) {
      venueSelector.value = venueId;
    }
  }
}

// Main async function to load booking data
async function loadBookingData() {
  await fetchVenues();
  await fetchVenues();
  const users = await fetchUsers();


  for (const user of users) {
      const bookings = await fetchBookingsForUser(user.id);
      bookings.forEach(booking => {
          booking.userId = user.id; // Add user ID to each booking for reference
      });
      allBookings = allBookings.concat(bookings); // Combine all bookings
  }

  booking = await getBooking(bookingId);
  console.log(booking);
  const bookingsContainer = document.getElementById("bookingsContainer");
  bookingsContainer.innerHTML = ""; 

  const bookingBox = document.createElement("div");
  bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

  const startTime = booking.start_time?.seconds 
      ? new Date(booking.start_time.seconds * 1000).toLocaleString() 
      : "N/A";
  const endTime = booking.end_time?.seconds 
      ? new Date(booking.end_time.seconds * 1000).toLocaleString() 
      : "N/A";

  const venueInfo = getRoomInfo(booking.venue_id);
  console.log(venueInfo);
  const venueName = venueInfo.Name;

  const roomDetails = document.createElement('div');
  roomDetails.className = 'flex-shrink-0';
  roomDetails.innerHTML = `
      <h1 class="text-lg font-semibold">Current Booking Info:</h1>
      <h2 class="text-lg font-semibold"> ${venueName}</h2>
      <p><strong>Start Time:</strong> ${startTime}</p>
      <p><strong>End Time:</strong> ${endTime}</p>
      <p><strong>Purpose:</strong> ${booking.purpose || "N/A"}</p>
  `;
  bookingBox.appendChild(roomDetails)
  bookingsContainer.appendChild(bookingBox);
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  loadBookingData();

  const saveChangesBtn = document.getElementById('saveChangesBtn');
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', () => saveChanges(bookingId));
  }
});


