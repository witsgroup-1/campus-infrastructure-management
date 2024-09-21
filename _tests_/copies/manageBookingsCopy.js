let bookings=[];
let venues=[];
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
    console.log(venues); // Store fetched venues
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
      'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    bookings = data;
    console.log(bookings);  // Store fetched bookings
    renderBookings();  // Render bookings after fetching data
  })
  .catch(error => {
    console.error('Error fetching bookings:', error);
  });
}

// Function to get the venue info based on venueId
function getRoomInfo(venueId) {

  for(let i=0;i<venues.length;i++){
    if(venueId==venues[i].id){
      console.log(venues[i]);
      return venues[i];
    }
    
  }
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

            if (booking.status.toLowerCase() === 'confirmed') {
                const editButton = document.createElement('button');
                editButton.className = 'bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
                editButton.textContent = 'Edit';
                editButton.onclick = () => editBooking(booking.id);
                

                const cancelButton = document.createElement('button');
                cancelButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none';
                cancelButton.textContent = 'Cancel';
                cancelButton.onclick = () => cancelBooking(booking.id);

                actionButtons.appendChild(editButton);
                actionButtons.appendChild(cancelButton);
            } else if (booking.status.toLowerCase() === 'pending') {
                const acceptButton = document.createElement('button');
                acceptButton.className = 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none';
                acceptButton.textContent = 'Accept';
                acceptButton.onclick = () => acceptBooking(booking.id);

                const rejectButton = document.createElement('button');
                rejectButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none';
                rejectButton.textContent = 'Reject';
                rejectButton.onclick = () => rejectBooking(booking.id);

                actionButtons.appendChild(acceptButton);
                actionButtons.appendChild(rejectButton);
            }

            bookingBox.appendChild(actionButtons);
            container.appendChild(bookingBox);
        }
    });
}

    // Placeholder functions for button actions
  function editBooking(id) {
    window.location.href = `editBooking.html?bookingId=${id}`;

      
  }


  
  function cancelBooking(id) {
  const bookingId = id;  
  const url = `https://campus-infrastructure-management.azurewebsites.net/api/bookings/${bookingId}`; 

fetch(url, {
  method: 'PUT',
  headers: {
    'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'cancelled'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

      alert(`Booking cancelled successfully`);
      
  }

  function acceptBooking(id) {

    const bookingId = id;  
    const url = `https://campus-infrastructure-management.azurewebsites.net/api/bookings/${bookingId}`; 
  
  fetch(url, {
    method: 'PUT',
    headers: {
      'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'confirmed'
    })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
      alert(`Booking succcessfully confirmed`);
     
  }

  function rejectBooking(id) {

    const bookingId = id;  
    const url = `https://campus-infrastructure-management.azurewebsites.net/api/bookings/${bookingId}`; 
  
  fetch(url, {
    method: 'PUT',
    headers: {
      'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'rejected'
    })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
      alert(`Booking rejected`);
      
  }


// Initial fetch for venues and bookings
document.addEventListener('DOMContentLoaded', () => {
  fetchVenues().then(fetchBookings);  // Fetch venues first, then fetch bookings
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