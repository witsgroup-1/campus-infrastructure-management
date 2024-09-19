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

function showLoading() {
    const scheduledContent = document.getElementById('scheduled-content');
    scheduledContent.innerHTML = '<p>Loading bookings...</p>';
  }

  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2); // Get last 2 digits of year
    return `${day}/${month}/${year}`;
  }
  
  function formatTimeSlot(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(start)}-${formatTime(end)}`;
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


  // Function to hide the loading state
function hideLoading() {
  const bookingsContainer = document.getElementById('bookings-container');
  bookingsContainer.innerHTML = ''; // Clear the loading message
}
  
let currentPageUpcomingDesktop = 1;
let currentPagePastDesktop = 1;
let currentPageUpcomingMobile = 1;
let currentPagePastMobile = 1;

const itemsPerPageDesktop = 5;
const itemsPerPageMobile = 2;

function displayBookings(bookings) {
  const scheduledContent = document.getElementById('scheduled-content');
  const pastContent = document.getElementById('in-progress-content');
  const mobileScheduledContent = document.getElementById('mobile-scheduled-content');
  const mobilePastContent = document.getElementById('mobile-in-progress-content');

  // Clear any existing bookings content
  scheduledContent.innerHTML = '';
  pastContent.innerHTML = '';
  mobileScheduledContent.innerHTML = '';
  mobilePastContent.innerHTML = '';

  const now = new Date();

  // Separate upcoming and past bookings
  const upcomingBookings = bookings.filter(booking => new Date(booking.start_time) > now);
  const pastBookings = bookings.filter(booking => new Date(booking.start_time) <= now);


  const paginatedUpcomingDesktop = paginateBookings(upcomingBookings, currentPageUpcomingDesktop, itemsPerPageDesktop);
  const paginatedPastDesktop = paginateBookings(pastBookings, currentPagePastDesktop, itemsPerPageDesktop);

  
  const paginatedUpcomingMobile = paginateBookings(upcomingBookings, currentPageUpcomingMobile, itemsPerPageMobile);
  const paginatedPastMobile = paginateBookings(pastBookings, currentPagePastMobile, itemsPerPageMobile);

 
  renderDesktopBookings(paginatedUpcomingDesktop, scheduledContent, 'upcoming');
  renderDesktopBookings(paginatedPastDesktop, pastContent, 'past');

 
  renderMobileBookings(paginatedUpcomingMobile, mobileScheduledContent, 'upcoming');
  renderMobileBookings(paginatedPastMobile, mobilePastContent, 'past');

  
  renderPaginationControls(upcomingBookings, currentPageUpcomingDesktop, itemsPerPageDesktop, scheduledContent, 'desktop', 'upcoming');
  renderPaginationControls(pastBookings, currentPagePastDesktop, itemsPerPageDesktop, pastContent, 'desktop', 'past');

 
  renderPaginationControls(upcomingBookings, currentPageUpcomingMobile, itemsPerPageMobile, mobileScheduledContent, 'mobile', 'upcoming');
  renderPaginationControls(pastBookings, currentPagePastMobile, itemsPerPageMobile, mobilePastContent, 'mobile', 'past');
}

function paginateBookings(bookings, page, itemsPerPage) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return bookings.slice(start, end);
}

function renderDesktopBookings(bookings, container, type) {
  const bookingsSection = document.createElement('div');
  bookingsSection.classList.add(`${type}-bookings`, 'mb-4');
  
  if (bookings.length === 0) {
    bookingsSection.innerHTML = `<p>No ${type} bookings.</p>`;
  } else {
    bookings.forEach(booking => {
      const bookingElement = document.createElement('div');
      bookingElement.classList.add('w-full', 'bg-gray-200', 'rounded-lg', 'mb-2', 'p-4', 'shadow-sm');
      bookingElement.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <div><strong>Name:</strong> ${booking.name}</div>
            <div><strong>Venue:</strong> ${booking.venue_name}</div>
            <div><strong>Date:</strong> ${formatDate(booking.start_time)}</div>
            <div><strong>Slot:</strong> ${formatTimeSlot(booking.start_time, booking.end_time)}</div>
          </div>
          ${type === 'upcoming' 
            ? `<button class="bg-red-500 text-white px-3 py-1 rounded" onclick="cancelBooking('${booking.id}')">Cancel</button>`
            : `<button class="bg-green-500 text-white px-3 py-1 rounded" onclick="bookAgain('${booking.id}')">Book Again</button>`}
        </div>
      `;
      bookingsSection.appendChild(bookingElement);
    });
  }

  container.appendChild(bookingsSection);
}

function renderMobileBookings(bookings, container, type) {
  const bookingsSection = document.createElement('div');
  bookingsSection.classList.add(`${type}-bookings-mobile`, 'mb-4');
  
  if (bookings.length === 0) {
    bookingsSection.innerHTML = `<p>No ${type} bookings.</p>`;
  } else {
    bookings.forEach(booking => {
      const bookingElement = document.createElement('div');
      bookingElement.classList.add('w-full', 'bg-gray-200', 'rounded-lg', 'mb-2', 'p-4', 'shadow-sm');
      bookingElement.innerHTML = `
        <div class="flex flex-col justify-between items-start">
          <div>
            <div><strong>Name:</strong> ${booking.name}</div>
            <div><strong>Venue:</strong> ${booking.venue_name}</div>
            <div><strong>Date:</strong> ${formatDate(booking.start_time)}</div>
            <div><strong>Slot:</strong> ${formatTimeSlot(booking.start_time, booking.end_time)}</div>
          </div>
          ${type === 'upcoming' 
            ? `<button class="bg-red-500 text-white w-full mt-2 rounded" onclick="cancelBooking('${booking.id}')">Cancel</button>`
            : `<button class="bg-green-500 text-white w-full mt-2 rounded" onclick="bookAgain('${booking.id}')">Book Again</button>`}
        </div>
      `;
      bookingsSection.appendChild(bookingElement);
    });
  }

  container.appendChild(bookingsSection);
}

function renderPaginationControls(bookings, currentPage, itemsPerPage, container, deviceType, bookingType) {
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  
  if (totalPages <= 1) return; // No pagination needed if there's only one page

  const paginationControls = document.createElement('div');
  paginationControls.classList.add('pagination-controls', 'mt-4', 'flex', 'justify-between');

  const prevButton = document.createElement('button');
  prevButton.classList.add('bg-gray-400', 'text-white', 'px-4', 'py-2', 'rounded');
  prevButton.innerText = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    if (deviceType === 'desktop') {
      if (bookingType === 'upcoming') currentPageUpcomingDesktop--;
      else currentPagePastDesktop--;
    } else {
      if (bookingType === 'upcoming') currentPageUpcomingMobile--;
      else currentPagePastMobile--;
    }
    displayBookings(bookings);
  };

  const nextButton = document.createElement('button');
  nextButton.classList.add('bg-gray-400', 'text-white', 'px-4', 'py-2', 'rounded');
  nextButton.innerText = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => {
    if (deviceType === 'desktop') {
      if (bookingType === 'upcoming') currentPageUpcomingDesktop++;
      else currentPagePastDesktop++;
    } else {
      if (bookingType === 'upcoming') currentPageUpcomingMobile++;
      else currentPagePastMobile++;
    }
    displayBookings(bookings);
  };

  paginationControls.appendChild(prevButton);
  paginationControls.appendChild(nextButton);

  container.appendChild(paginationControls);
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