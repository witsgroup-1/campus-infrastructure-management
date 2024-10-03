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

export function showLoading() {
    const scheduledContent = document.getElementById('scheduled-content');
    scheduledContent.innerHTML = '<p>Loading bookings...</p>';
  }

export  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2); // Get last 2 digits of year
    return `${day}/${month}/${year}`;
  }
  
  export function formatTimeSlot(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(start)}-${formatTime(end)}`;
  }
  
  export async function fetchUserBookings(userId) {
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
  

export function paginateBookings(bookings, page, itemsPerPage) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return bookings.slice(start, end);
}

export function renderDesktopBookings(bookings, container, type) {
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

export function renderMobileBookings(bookings, container, type) {
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

export function renderPaginationControls(bookings, currentPage, itemsPerPage, container, deviceType, bookingType) {
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
