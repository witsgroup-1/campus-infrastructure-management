let bookings = [];
let venues = [];

const params = new URLSearchParams(window.location.search);
const bookingId = params.get('bookingId');
console.log('Booking ID:', bookingId);

// API URLs
const bookingsUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/bookings';  
const venuesUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';  

// Fetch venues from the API
function fetchVenues() {
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
    console.log(venues);
    populateVenues(venues);
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
  });
}

// Fetch bookings from the API
function fetchBookings() {
  return fetch(bookingsUrl, {
    method: 'GET',
    headers: {
      'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    bookings = data;
    console.log(bookings);
  })
  .catch(error => {
    console.error('Error fetching bookings:', error);
  });
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
  venueSelector.innerHTML = '';

  // Populate the dropdown with venue options
  data.forEach(venue => {
    const option = document.createElement('option');
    option.value = venue.id;
    option.textContent = venue.Name;
    venueSelector.appendChild(option);
  });

  // Set the selected value if booking exists
  const booking = getBooking(bookingId);
  if (booking) {
    const venueId = booking.venueId;
    if (venueId) {
      venueSelector.value = venueId; // Set the selected value
    }
  }
}






function isValidVenue(venueId) {
  return venues.some(venue => venue.id === venueId);
}

// Save changes with validation
function saveChanges(id) {
  const selectedVenue = document.getElementById('venueSelector').value;
  const status = document.getElementById('statusSelection').value;

  if (!isValidVenue(selectedVenue)) {
    alert('Please select a valid venue.');
    return;
  }




  
  fetch(`https://campus-infrastructure-management.azurewebsites.net/api/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      venueId: selectedVenue,
      status: status
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    alert('Booking edited successfully');
  })
  .catch(error => console.error('Error:', error));

  const bookingInfo=getBooking(id);
  const venueInfo=getRoomInfo(bookingInfo.venueId);
  const userId=bookingInfo.userId;
  
  const url3 =`https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings/${bookingInfopurpose}`
  const url4 =`https://campus-infrastructure-management.azurewebsites.net/api/venues/${bookingInfo.venueId}/date/bookings/${bookingInfo.purpose}`


  const updateResponse = fetch(url2, {
    method: 'PUT',
    headers: {
        'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        status: status
    })
});

const updateResponse2 = fetch(url2, {
  method: 'PUT',
  headers: {
      'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({
      status: status
  })
});
  notificationMessage=`Your booking for ${venueInfo.Name} has been edited by administrators, please check your bookings for updates or changes made. If you are not happy with these changes please delete that booking and rebook for another available venue.`
  const userNotificationUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/notifications`;
  fetch(userNotificationUrl, {
      method: 'POST',
      headers: {
          'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: notificationMessage,
          type:"notification",
          sendAt: "09:00"
       })
  });

}




// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  fetchVenues().then(fetchBookings);

  const saveChangesBtn = document.getElementById('saveChangesBtn');
if (saveChangesBtn) {
  saveChangesBtn.addEventListener('click', () => saveChanges(bookingId));
}

module.exports = {
  formatDateDMY,
  extractStartEndTime,
  getRoomInfo,
  getBooking,
  populateVenues,
};
});


