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



function showLoading() {
    const scheduledContent = document.getElementById('scheduled-content');
    scheduledContent.innerHTML = '<p>Loading bookings...</p>';
    const pastContent = document.getElementById('in-progress-content');
    pastContent.innerHTML = '<p>Loading bookings...</p>';
    const mobileScheduledContent = document.getElementById('mobile-scheduled-content');
    mobileScheduledContent.innerHTML = '<p>Loading bookings...</p>';
    const mobilePastContent = document.getElementById('mobile-in-progress-content');
    mobilePastContent.innerHTML = '<p>Loading bookings...</p>';
  }

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
  

  
  async function fetchUserBookings(userId) {
    try {
      const url = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': api_key,
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
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
       
        const userDoc = querySnapshot.docs[0];
        const firestoreUserId = userDoc.id; // The document ID is the userId
        return firestoreUserId;
      } else {
        throw new Error('No matching user document found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching Firestore userId by email:', error);
      return null; 
    }
  }


  let currentPageUpcomingDesktop = 1;
  let currentPagePastDesktop = 1;
  let currentPageUpcomingMobile = 1;
  let currentPagePastMobile = 1;
  
  const itemsPerPageDesktop = 4;
  const itemsPerPageMobile = 2;
  
  let venueCache = {}; 
  
  async function displayBookings(bookings, userId) {
    const now = new Date();
  
    const upcomingBookings = bookings.filter(booking => {
      const startTime = booking.startTime ? new Date(booking.startTime.seconds * 1000) : null;
      return startTime && startTime > now;
    }).sort((a, b) => new Date(a.startTime.seconds * 1000) - new Date(b.startTime.seconds * 1000));
  
    const pastBookings = bookings.filter(booking => {
      const startTime = booking.startTime ? new Date(booking.startTime.seconds * 1000) : null;
      return startTime && startTime <= now;
    }).sort((a, b) => new Date(a.startTime.seconds * 1000) - new Date(b.startTime.seconds * 1000));
  
    displayUpcomingBookings(upcomingBookings, userId);
    displayPastBookings(pastBookings, userId);
  }
  
  async function displayUpcomingBookings(upcomingBookings, userId) {
    const scheduledContent = document.getElementById('scheduled-content');
    const mobileScheduledContent = document.getElementById('mobile-scheduled-content');
  
    scheduledContent.innerHTML = '';
    mobileScheduledContent.innerHTML = '';
  
    const paginatedUpcomingDesktop = paginateBookings(upcomingBookings, currentPageUpcomingDesktop, itemsPerPageDesktop);
    const paginatedUpcomingMobile = paginateBookings(upcomingBookings, currentPageUpcomingMobile, itemsPerPageMobile);
  
    renderBookings(paginatedUpcomingDesktop, scheduledContent, 'upcoming', userId, 'desktop');
    renderBookings(paginatedUpcomingMobile, mobileScheduledContent, 'upcoming', userId, 'mobile');
  
    renderPaginationControls(upcomingBookings, currentPageUpcomingDesktop, itemsPerPageDesktop, scheduledContent, 'desktop', 'upcoming', userId);
    renderPaginationControls(upcomingBookings, currentPageUpcomingMobile, itemsPerPageMobile, mobileScheduledContent, 'mobile', 'upcoming', userId);
  }
  
  async function displayPastBookings(pastBookings, userId) {
    const pastContent = document.getElementById('in-progress-content');
    const mobilePastContent = document.getElementById('mobile-in-progress-content');
  
    pastContent.innerHTML = '';
    mobilePastContent.innerHTML = '';
  
    const paginatedPastDesktop = paginateBookings(pastBookings, currentPagePastDesktop, itemsPerPageDesktop);
    const paginatedPastMobile = paginateBookings(pastBookings, currentPagePastMobile, itemsPerPageMobile);
  
    renderBookings(paginatedPastDesktop, pastContent, 'past', userId, 'desktop');
    renderBookings(paginatedPastMobile, mobilePastContent, 'past', userId, 'mobile');
  
    renderPaginationControls(pastBookings, currentPagePastDesktop, itemsPerPageDesktop, pastContent, 'desktop', 'past', userId);
    renderPaginationControls(pastBookings, currentPagePastMobile, itemsPerPageMobile, mobilePastContent, 'mobile', 'past', userId);
  }
  
  function paginateBookings(bookings, page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return bookings.slice(start, end);
  }
  
  async function renderBookings(bookings, container, type, userId, deviceType) {
    const bookingsSection = document.createElement('div');
    bookingsSection.classList.add(`${type}-bookings`, 'mb-4');
  
    if (bookings.length === 0) {
      bookingsSection.innerHTML = `<p>No ${type} bookings.</p>`;
    } else {
      for (const booking of bookings) {
        const venueName = await getCachedVenueName(booking.venueId);
        const formattedStartTime = formatFirestoreTimestamp(booking.startTime);
        const formattedStartHour = formatTime(booking.startTime);
        const formattedEndHour = formatTime(booking.endTime);
  
        const bookingElement = document.createElement('div');
        bookingElement.classList.add('w-full', 'bg-gray-200', 'rounded-lg', 'mb-2', 'p-4', 'shadow-sm');
  
        bookingElement.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <div><strong>Purpose:</strong> ${booking.purpose}</div>
              <div><strong>Venue:</strong> ${venueName}</div>
              <div><strong>Date:</strong> ${formattedStartTime}</div>
              <div><strong>Slot:</strong> ${formattedStartHour} - ${formattedEndHour}</div>
            </div>
            ${type === 'upcoming'
              ? `<button class="bg-red-500 text-white px-3 py-1 rounded" onclick="cancelBooking('${userId}', '${booking.id}')">Cancel</button>`
              : `<button class="bg-green-500 text-white px-3 py-1 rounded" onclick="bookAgain('${booking.venueId}', '${venueName}')">Book Again</button>`}
          </div>
        `;
  
        bookingsSection.appendChild(bookingElement);
      }
    }
  
    container.appendChild(bookingsSection);
  }
  
  async function getCachedVenueName(venueId) {
    if (venueCache[venueId]) {
      return venueCache[venueId];
    }
    const venueDoc = await fetchVenueName(venueId);
    const venueName = venueDoc.exists() ? venueDoc.data().Name : 'Venue not found';
    venueCache[venueId] = venueName;
    return venueName;
  }
  
  function renderPaginationControls(bookings, currentPage, itemsPerPage, container, deviceType, bookingType, userId) {
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    if (totalPages <= 1) return; // No pagination if only one page
    
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-controls');
  
    const prevButton = document.createElement('button');
    prevButton.classList.add('bg-white', 'text-[#917248]', 'px-4', 'py-2', 'rounded');
    prevButton.innerText = 'Previous';
    prevButton.disabled = currentPage === 1; 
    prevButton.setAttribute('aria-label', 'Previous Page');
    prevButton.onclick = () => {
      const newPage = currentPage - 1;
      updateCurrentPage(newPage, deviceType, bookingType);
      if (bookingType === 'upcoming') {
        displayUpcomingBookings(bookings, userId);
      } else {
        displayPastBookings(bookings, userId);
      }
    };
    paginationContainer.appendChild(prevButton);
  
    // Add page buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('px-3', 'py-1', 'mx-1', currentPage === i ? 'bg-[#917248]' : 'bg-gray-300', 'rounded');
      pageButton.setAttribute('aria-label', `Page ${i}`);
      pageButton.onclick = () => {
        updateCurrentPage(i, deviceType, bookingType);
        if (bookingType === 'upcoming') {
          displayUpcomingBookings(bookings, userId);
        } else {
          displayPastBookings(bookings, userId);
        }
      };
      paginationContainer.appendChild(pageButton);
    }
  
   
    const nextButton = document.createElement('button');
    nextButton.classList.add('bg-white', 'text-[#917248]', 'px-4', 'py-2', 'rounded');
    nextButton.innerText = 'Next';
    nextButton.disabled = currentPage === totalPages; 
    nextButton.setAttribute('aria-label', 'Next Page');
    nextButton.onclick = () => {
      const newPage = currentPage + 1;
      updateCurrentPage(newPage, deviceType, bookingType);
      if (bookingType === 'upcoming') {
        displayUpcomingBookings(bookings, userId);
      } else {
        displayPastBookings(bookings, userId);
      }
    };
    paginationContainer.appendChild(nextButton);
  
    // Append the pagination controls to the container
    container.appendChild(paginationContainer);
  }
  
  function updateCurrentPage(newPage, deviceType, bookingType) {
    if (deviceType === 'desktop') {
      if (bookingType === 'upcoming') {
        currentPageUpcomingDesktop = newPage;
      } else {
        currentPagePastDesktop = newPage;
      }
    } else {
      if (bookingType === 'upcoming') {
        currentPageUpcomingMobile = newPage;
      } else {
        currentPagePastMobile = newPage;
      }
    }
  }
  
  

  window.cancelBooking = async function(userId, bookingId) {
    try {
      const cancelButton = document.querySelector(`button[onclick="cancelBooking('${userId}', '${bookingId}')"]`);
      if (cancelButton) {
        cancelButton.disabled = true;
        cancelButton.innerHTML = 'Cancelling...'; 
      }
  
      const url = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings/${bookingId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'x-api-key': api_key,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete booking, please try again.');
      }
  
      alert(`Booking cancelled successfully.`);
  
      const updatedBookings = await fetchUserBookings(userId);
      displayUpcomingBookings(updatedBookings.filter(booking => {
        const startTime = booking.startTime ? new Date(booking.startTime.seconds * 1000) : null;
        return startTime && startTime > new Date();
      }), userId);
  
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking: ' + error.message);
    } finally {
      if (cancelButton) {
        cancelButton.disabled = false;
        cancelButton.innerHTML = 'Cancel'; 
      }
    }
  }

window.bookAgain = function(venueId, venueName) {
  try {
    
    localStorage.setItem('bookingId', venueId);
    localStorage.setItem('venueName', venueName);

    const bookingDetailsUrl = `../make-booking/booking-details.html?bookingId=${venueId}&venueName=${encodeURIComponent(venueName)}`;
    window.location.href = bookingDetailsUrl;
  } catch (error) {
    console.error('Error storing booking info:', error);
    alert('Error: ' + error.message);
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

  async function loadUserBookings(userEmail) {
    showLoading();
  
    const firestoreUserId = await getFirestoreUserIdByEmail(userEmail);
   
    if (firestoreUserId) {
      const bookings = await fetchUserBookings(firestoreUserId);
      displayBookings(bookings, firestoreUserId);
    } else {
      console.error('Could not find Firestore userId for the given email.');
    }
  }
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in with email:", user.email);
      loadUserBookings(user.email);
    } else {
      console.log("No user is signed in.");
    }
  });

  const api_key = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW'