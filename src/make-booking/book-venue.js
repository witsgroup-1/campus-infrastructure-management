// Array to hold venues data (mock or fetched)

const userEmail = localStorage.getItem('userEmail');

if (userEmail) {
    console.log('User email:', userEmail);
    document.getElementById('userEmailDisplay').textContent = `Logged in as: ${userEmail}`;
} else {
    console.log('No email found');
}
let bookings = [];

// API URL
const url = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';  // Replace with your actual API URL

// Fetch venues from the API with API key in headers
fetch(url, {
    method: 'GET',
    headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',  // Replace with your actual API key
        'Content-Type': 'application/json'
    }
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    bookings = data;  // Store fetched venues in the bookings array
    console.log(bookings);
    renderBookings();  // Render bookings after fetching data
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
  });


// Function to render bookings (i.e., venues) based on current filters
function renderBookings() {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = ''; // Clear existing bookings

    const categoryFilter = document.getElementById('roomFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    // Filter bookings based on selected filters and search query
    const filteredBookings = bookings.filter(booking => {
        const matchesCategory = categoryFilter ? booking.Category === categoryFilter : true;
        const matchesSearch = booking.Name && booking.Name.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesSearch;
    });

    if (filteredBookings.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No bookings found.</p>';
        return;
    }

    // Create booking boxes
    filteredBookings.forEach(booking => {
        const bookingBox = document.createElement('div');
        bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

        // Booking Info
        const bookingInfo = document.createElement('div');
        bookingInfo.className = 'flex-shrink-0';
        bookingInfo.innerHTML = `
            <h2 class="text-lg font-semibold">${booking.Name || 'Unknown Name'}</h2>
            <p class="text-sm text-gray-600">Category: ${booking.Category || 'Unknown Category'}</p>
        `;
        bookingBox.appendChild(bookingInfo);

        // Book button for all bookings
        const actionButtons = document.createElement('div');
        actionButtons.className = 'flex flex-row space-x-2';

        const bookButton = document.createElement('button');
        bookButton.className = 'bg-[#917248] text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
        bookButton.textContent = 'Book';

        // Add click event listener to the button
        bookButton.onclick = function() {
            // Redirect to the booking details page, passing the booking ID or any other info through the URL
            window.location.href = `booking-details.html?bookingId=${booking.id}`;
        };
        
        actionButtons.appendChild(bookButton);
        bookingBox.appendChild(actionButtons);

        container.appendChild(bookingBox);
    });
}



// Attach event listeners to filters and search input
document.getElementById('roomFilter').addEventListener('change', renderBookings);
document.getElementById('searchInput').addEventListener('input', renderBookings);

// Initial render after DOM content loads
document.addEventListener('DOMContentLoaded', renderBookings);
