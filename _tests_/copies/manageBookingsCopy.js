let bookings = [];
let venues = [];

// API URLs
const bookingsUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/bookings';  
const venuesUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';  

// Fetch venues from the API
async function fetchVenues(apiKey) {
  try {
    const response = await fetch(venuesUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    venues = await response.json();
    console.log(venues); // Store fetched venues
  } catch (error) {
    console.error('Error fetching venues:', error);
  }
}

// Fetch bookings from the API
async function fetchBookings(apiKey) {
  try {
    const response = await fetch(bookingsUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    bookings = await response.json();
    console.log(bookings);  // Store fetched bookings
    renderBookings();  // Render bookings after fetching data
  } catch (error) {
    console.error('Error fetching bookings:', error);
  }
}

// Function to get the venue info based on venueId
function getRoomInfo(venueId) {
  return venues.find(venue => venue.id === venueId);
}

// Function to render bookings based on current filters
function renderBookings() {
  const container = document.getElementById('bookingsContainer');
  container.innerHTML = ''; // Clear existing bookings

  const statusFilter = document.getElementById('statusFilter').value;
  const roomFilter = document.getElementById('roomFilter').value;
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();

  // Filter bookings based on selected filters and search query
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter ? booking.status.toLowerCase() === statusFilter : true;
    const roomInfo = getRoomInfo(booking.venueId); // Get room info
    const matchesRoom = roomFilter ? roomInfo && roomInfo.Category === roomFilter : true;
    const matchesSearch = roomInfo && roomInfo.Building.toLowerCase().includes(searchQuery);
    return matchesStatus && matchesRoom && matchesSearch;
  });

  if (filteredBookings.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500">No bookings found.</p>';
    return;
  }

  // Create booking boxes
  filteredBookings.forEach(booking => {
    const roomInfo = getRoomInfo(booking.venueId); // Get room info

    if (roomInfo) {
      const bookingBox = document.createElement('div');
      bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

      // Room Info
      const roomDetails = document.createElement('div');
      roomDetails.className = 'flex-shrink-0';
      roomDetails.innerHTML = `
        <h2 class="text-lg font-semibold">${roomInfo.Name}</h2>
        <p class="text-sm text-gray-600">Type: ${roomInfo.Category}</p>
        <p class="text-sm text-gray-600">Date: ${booking.date}</p>
        <p class="text-sm text-gray-600">Time: ${booking.start_time} - ${booking.end_time}</p>
        <p class="text-sm text-gray-600">Status: ${booking.status}</p>
      `;
      bookingBox.appendChild(roomDetails);

      const actionButtons = document.createElement('div');
      actionButtons.className = 'flex flex-row space-x-2';

      const buttonHandlers = {
        confirmed: () => {
          actionButtons.appendChild(createButton('Edit', 'bg-blue-500', () => editBooking(booking.id)));
          actionButtons.appendChild(createButton('Cancel', 'bg-red-500', () => cancelBooking(booking.id)));
        },
        pending: () => {
          actionButtons.appendChild(createButton('Accept', 'bg-green-500', () => acceptBooking(booking.id)));
          actionButtons.appendChild(createButton('Reject', 'bg-red-500', () => rejectBooking(booking.id)));
        }
      };

      (buttonHandlers[booking.status.toLowerCase()] || function(){} )(); // Call appropriate button handler

      bookingBox.appendChild(actionButtons);
      container.appendChild(bookingBox);
    }
  });
}

// Helper function to create buttons
function createButton(text, bgClass, onClick) {
  const button = document.createElement('button');
  button.className = `${bgClass} text-white px-3 py-1 rounded hover:bg-opacity-80 focus:outline-none`;
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

// Placeholder functions for button actions
function editBooking(id) {
  window.location.href = `editBooking.html?bookingId=${id}`;
}

async function cancelBooking(id) {
  await updateBookingStatus(id, 'cancelled');
  alert('Booking cancelled successfully');
}

async function acceptBooking(id) {
  await updateBookingStatus(id, 'confirmed');
  alert('Booking successfully confirmed');
}

async function rejectBooking(id) {
  await updateBookingStatus(id, 'rejected');
  alert('Booking rejected');
}

// Function to update booking status
async function updateBookingStatus(id, status) {
  const url = `${bookingsUrl}/${id}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
}

// Initial fetch for venues and bookings
document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
  fetchVenues(apiKey).then(() => fetchBookings(apiKey));  // Fetch venues first, then fetch bookings
});

module.exports = {
  fetchVenues,
  fetchBookings,
  getRoomInfo,
  renderBookings,
  editBooking,
  cancelBooking,
  acceptBooking,
  rejectBooking,
}
