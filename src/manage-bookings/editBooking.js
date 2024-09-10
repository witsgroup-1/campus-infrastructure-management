let bookings=[];
let venues=[];

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
      'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',  // Use environment variable for API key
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    venues = data; 
    console.log(venues); // Store fetched venues
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
      'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',  // Use environment variable for API key
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    bookings = data;
    console.log(bookings);  // Store fetched bookings
      // Render bookings after fetching data
  })
  .catch(error => {
    console.error('Error fetching bookings:', error);
  });
}

// // Function to get the venue info based on venueId
// function getRoomInfo(venueId) {

//   for(let i=0;i<venues.length;i++){
//     if(venueId==venues[i].id){
//       console.log(venues[i]);
//       return venues[i];
//     }
    
//   }
// }

function populateVenues(data) {
            const venueSelector = document.getElementById('venueSelector');
            data.forEach(venue => {
                const option = document.createElement('option');
                option.value = venue.id;
                option.textContent = venue.Name;
                venueSelector.appendChild(option);
            });
    
}


document.addEventListener('DOMContentLoaded', () => {
    fetchVenues().then(fetchBookings);  // Fetch venues first, then fetch bookings
  });
  

