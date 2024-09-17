let bookings = [];
let venues = [];

const params = new URLSearchParams(window.location.search);
const bookingId = params.get('bookingId');
console.log('Booking ID:', bookingId);

// API URLs
const bookingsUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/bookings';  
const venuesUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';  

// Fetch venues from the API
async function fetchVenues() {
  try {
    const response = await fetch(venuesUrl, {
      method: 'GET',
      headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    venues = data; 
    populateVenues(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
  }
}

// Fetch bookings from the API
async function fetchBookings() {
  try {
    const response = await fetch(bookingsUrl, {
      method: 'GET',
      headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    bookings = data; 
    return bookings; 
  } catch (error) {
    console.error('Error fetching bookings:', error);
  }
}

// Function to get the venue info based on venueId
function getRoomInfo(venueId) {
  return venues.find(venue => venue.id === venueId);
}

// Function to get the booking info based on bookingId
function getBooking(bookingId) {
  return bookings.find(booking => booking.id === bookingId);
}

// Populate venue dropdown
function populateVenues(data) {
  const venueSelector = document.getElementById('venueSelector');
  if (!venueSelector) return;

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


// Validate input fields
function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}

function isValidTimeSlot(timeSlot) {
  const regex = /^\d{1,2}:\d{2} [APM]{2} - \d{1,2}:\d{2} [APM]{2}$/; // Example format: 9:00 AM - 11:00 AM
  return regex.test(timeSlot);
}

function isValidVenue(venueId) {
  return venues.some(venue => venue.id === venueId);
}

// Save changes with validation
async function saveChanges(id) {
  const selectedVenue = document.getElementById('venueSelector').value;
  const bookingDate = document.getElementById('bookingDate').value;
  const timeSlot = document.getElementById('timeSlot').value;
  const status = document.getElementById('statusSelection').value;

  if (!isValidVenue(selectedVenue)) {
    alert('Please select a valid venue.');
    return;
  }

  if (!isValidDate(bookingDate)) {
    alert('Please enter a valid date.');
    return;
  }

  if (!isValidTimeSlot(timeSlot)) {
    alert('Please select a valid time slot.');
    return;
  }

  const newDate = formatDateDMY(bookingDate);
  const { startTime, endTime } = extractStartEndTime(timeSlot);
  
  try {
    const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start_time: startTime,
        end_time: endTime,
        date: newDate,
        venueId: selectedVenue,
        status: status
      })
    });
    const data = await response.json();
    console.log(data);
    alert('Booking edited successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Format date as 'Day Month Year'
function formatDateDMY(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

// Extract start and end time from time slot
function extractStartEndTime(timeSlot) {
  const [startTime, endTime] = timeSlot.split(' - ').map(time => time.trim());
  return { startTime, endTime };
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  fetchVenues().then(fetchBookings);

  const saveChangesBtn = document.getElementById('saveChangesBtn');
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', () => saveChanges(bookingId));
  }
});

// Export functions for testing
module.exports = {
  formatDateDMY,
  extractStartEndTime,
  getRoomInfo,
  getBooking,
  populateVenues,
  fetchVenues,
  fetchBookings,
  isValidDate,
  isValidTimeSlot,
  isValidVenue,
  saveChanges,
  venues,
  bookings
};
