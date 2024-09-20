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


  
let currentPageUpcomingDesktop = 1;
let currentPagePastDesktop = 1;
let currentPageUpcomingMobile = 1;
let currentPagePastMobile = 1;

const itemsPerPageDesktop = 4;
const itemsPerPageMobile = 2;

async function displayBookings(bookings, userId) {
  const scheduledContent = document.getElementById('scheduled-content');
  const pastContent = document.getElementById('in-progress-content');
  const mobileScheduledContent = document.getElementById('mobile-scheduled-content');
  const mobilePastContent = document.getElementById('mobile-in-progress-content');

 
  scheduledContent.innerHTML = '';
  pastContent.innerHTML = '';
  mobileScheduledContent.innerHTML = '';
  mobilePastContent.innerHTML = '';

  const now = new Date();

  const upcomingBookings = bookings.filter(booking => {
    const startTime = booking.startTime ? new Date(booking.startTime.seconds * 1000) : null;
    return startTime && startTime > now;
  }).sort((a, b) => {
    const startA = new Date(a.startTime.seconds * 1000);
    const startB = new Date(b.startTime.seconds * 1000);
    return startA - startB;
  });

  const pastBookings = bookings.filter(booking => {
    const startTime = booking.startTime ? new Date(booking.startTime.seconds * 1000) : null;
    return startTime && startTime <= now;
  }).sort((a, b) => {
    const startA = new Date(a.startTime.seconds * 1000);
    const startB = new Date(b.startTime.seconds * 1000);
    return startA - startB;
  });

  const paginatedUpcomingDesktop = paginateBookings(upcomingBookings, currentPageUpcomingDesktop, 4);  // 4 items per page for desktop
  const paginatedPastDesktop = paginateBookings(pastBookings, currentPagePastDesktop, 4);  // Same for past bookings

  
  const paginatedUpcomingMobile = paginateBookings(upcomingBookings, currentPageUpcomingMobile, 2);  // 2 items per page for mobile
const paginatedPastMobile = paginateBookings(pastBookings, currentPagePastMobile, 2);  // Same for past bookings


  
  renderDesktopBookings(paginatedUpcomingDesktop, scheduledContent, 'upcoming', userId);
  renderDesktopBookings(paginatedPastDesktop, pastContent, 'past', userId);

  renderMobileBookings(paginatedUpcomingMobile, mobileScheduledContent, 'upcoming', userId);
  renderMobileBookings(paginatedPastMobile, mobilePastContent, 'past', userId);

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

 window.cancelBooking = async function(userId, bookingId) {
  try {
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
  } catch (error) {
    console.error('Error cancelling booking:', error);
    alert('Error cancelling booking: ' + error.message);
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






async function renderDesktopBookings(bookings, container, type, userId) {
  const bookingsSection = document.createElement('div');
  bookingsSection.classList.add(`${type}-bookings`, 'mb-4');

  if (bookings.length === 0) {
    bookingsSection.innerHTML = `<p>No ${type} bookings.</p>`;
  } else {
    for (const booking of bookings) {
      const venueDoc = await fetchVenueName(booking.venueId);
      const venueName = venueDoc.exists() ? venueDoc.data().Name : 'Venue not found';
      
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



async function renderMobileBookings(bookings, container, type, userId) {
  const bookingsSection = document.createElement('div');
  bookingsSection.classList.add(`${type}-bookings`, 'mb-4');

  if (bookings.length === 0) {
    bookingsSection.innerHTML = `<p>No ${type} bookings.</p>`;
  } else {
    for (const booking of bookings) {
      const venueDoc = await fetchVenueName(booking.venueId);
      const venueName = venueDoc.exists() ? venueDoc.data().Name : 'Venue not found';
      
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

async function fetchVenueName(venueId) {
  try {
    const venueRef = doc(db, 'venues', venueId);  
    const venueDoc = await getDoc(venueRef); 
    return venueDoc;
    
  } catch (error) {
    console.error('Error fetching venue:', error);
    return null;  // Handle error case
  }
}

function renderPaginationControls(bookings, currentPage, itemsPerPage, container, deviceType, bookingType) {
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  // Always show pagination controls, even if there is only one page
  const paginationControls = document.createElement('div');
  paginationControls.classList.add('pagination-controls', 'mt-4', 'flex', 'justify-between');

  const prevButton = document.createElement('button');
  prevButton.classList.add('bg-white', 'text-[#917248]', 'px-4', 'py-2', 'rounded');
  prevButton.innerText = 'Previous';

  // Disable the 'Previous' button on the first page
  prevButton.disabled = currentPage === 1;

  prevButton.onclick = () => {
    if (deviceType === 'desktop') {
      if (bookingType === 'upcoming') currentPageUpcomingDesktop--;
      else currentPagePastDesktop--;
    } else {
      if (bookingType === 'upcoming') currentPageUpcomingMobile--;
      else currentPagePastMobile--;
    }
    displayBookings(bookings);  // Re-render the bookings with the new page
  };

  const nextButton = document.createElement('button');
  nextButton.classList.add('bg-white', 'text-[#917248]', 'px-4', 'py-2', 'rounded');
  nextButton.innerText = 'Next';

  // Disable the 'Next' button only if on the last page
  nextButton.disabled = currentPage === totalPages;

  nextButton.onclick = () => {
    if (deviceType === 'desktop') {
      if (bookingType === 'upcoming') currentPageUpcomingDesktop++;
      else currentPagePastDesktop++;
    } else {
      if (bookingType === 'upcoming') currentPageUpcomingMobile++;
      else currentPagePastMobile++;
    }
    displayBookings(bookings);  // Re-render the bookings with the new page
  };

  paginationControls.appendChild(prevButton);
  paginationControls.appendChild(nextButton);

  container.appendChild(paginationControls);
}




  async function loadUserBookings(userEmail) {
    showLoading();
  
    const firestoreUserId = await getFirestoreUserIdByEmail(userEmail);
    console.log(firestoreUserId);
  
    if (firestoreUserId) {
      const bookings = await fetchUserBookings(firestoreUserId);
      console.log(bookings);
      // Pass firestoreUserId to displayBookings
      displayBookings(bookings, firestoreUserId);
    } else {
      console.error('Could not find Firestore userId for the given email.');
    }
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

  const api_key = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW'