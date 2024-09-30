import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

function formatFirestoreTimestamp(timestamp) {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear().toString().slice(-2); 
    return `${day}/${month}/${year}`;
  }
  return 'Invalid date';
}

function formatTime(timestamp) {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return 'Invalid time';
}


function showLoading() {
  const bookingsContainer = document.getElementById('bookings-container');
  bookingsContainer.innerHTML = '<p>Loading bookings...</p>';
}


function hideLoading() {
  const bookingsContainer = document.getElementById('bookings-container');
  bookingsContainer.innerHTML = ''; 
}

async function getFirestoreUserIdByEmail(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const firestoreUserId = userDoc.id;
      return firestoreUserId;
    } else {
      throw new Error('No matching user document found in Firestore.');
    }
  } catch (error) {
    console.error('Error fetching Firestore userId by email:', error);
    return null;
  }
}

async function fetchVenueName(venueId) {
  try {
    const venueRef = doc(db, 'venues', venueId);  
    const venueDoc = await getDoc(venueRef); 
    return venueDoc;
  } catch (error) {
    console.error('Error fetching venue:', error);
    return null; 
  }
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

async function displayBookings(bookings) {
  console.log(bookings)
  const bookingsContainer = document.getElementById('bookings-container');
  const noBookingsMessage = document.getElementById('no-bookings-message');
  const seeMoreButton = document.getElementById('see-more-button');

  bookingsContainer.innerHTML = '';
  const now = new Date();

  const upcomingBookings = bookings.filter(booking => {
    const startTime = booking.start_time ? new Date(booking.start_time.seconds * 1000) : null;
    return startTime && startTime > now;
  }).sort((a, b) => {
    const startA = new Date(a.start_time.seconds * 1000);
    const startB = new Date(b.start_time.seconds * 1000);
    return startA - startB; 
  });

  if (!upcomingBookings.length) {
    bookingsContainer.classList.add('hidden');
    noBookingsMessage.classList.remove('hidden');
  } else {
    bookingsContainer.classList.remove('hidden');
    noBookingsMessage.classList.add('hidden');

    const isMobile = window.innerWidth <= 768; 
    const bookingsToDisplay = isMobile ? upcomingBookings.slice(0, 1) : upcomingBookings.slice(0, 3); // Show 1 on mobile, 3 on others

    for (let booking of bookingsToDisplay) {
      const formattedStartTime = formatFirestoreTimestamp(booking.start_time);
      const formattedStartHour = formatTime(booking.start_time);
      const formattedEndHour = formatTime(booking.end_time);

      const bookingElement = document.createElement('div');
      bookingElement.classList.add('w-11/12', 'h-16', 'rounded-lg', 'mb-2', 'p-2');

      const venueDoc = await fetchVenueName(booking.venue_id);
      const venueName = venueDoc.exists() ? venueDoc.data().Name : 'Venue not found';

      bookingElement.innerHTML = `
        <div class="booking-container flex items-center">
          <div class="booking-info flex-1">
            <div><strong>Venue:</strong> ${venueName}</div>
            <div><strong>Purpose:</strong> ${booking.purpose}</div> <!-- Use purpose directly -->
          </div>
          <div class="separator w-px bg-[#003B5C] h-12 mx-4"></div>
          <div class="booking-times flex-1 text-right">
            <div><strong>Date:</strong> ${formattedStartTime}</div>
            <div><strong>Slot:</strong> ${formattedStartHour} - ${formattedEndHour}</div>
          </div>
        </div>
      `;

      bookingsContainer.appendChild(bookingElement);
    }

    if ((isMobile && upcomingBookings.length > 1) || (!isMobile && upcomingBookings.length > 3)) {
      seeMoreButton.classList.remove('hidden');
    } else {
      seeMoreButton.classList.add('hidden');
    }
  }
}


async function loadUserBookings(userEmail) {
  showLoading();

  const firestoreUserId = await getFirestoreUserIdByEmail(userEmail);
  console.log(firestoreUserId);

  if (firestoreUserId) {
    const bookings = await fetchUserBookings(firestoreUserId);
    displayBookings(bookings);
  } else {
    console.error('Could not find Firestore userId for the given email.');
  }
  hideLoading();
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in with email:", user.email);
    loadUserBookings(user.email); 
  } else {
    console.log("No user is signed in.");
  }
});

  




