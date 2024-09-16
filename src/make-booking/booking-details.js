// Declare a variable to hold venue data
let venueData = {};

// Extract booking ID from the URL
const params = new URLSearchParams(window.location.search);
const bookingId = params.get('bookingId');
console.log('Booking ID:', bookingId);

// API URL to fetch venue details
const url = `https://campus-infrastructure-management.azurewebsites.net/api/venues/${bookingId}`; // Modify endpoint as needed

// Fetch venue details from the API
fetch(url, {
    method: 'GET',
    headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
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
    console.log('API Response:', data); // Log the response to check its content
    // Store the data in the global variable
    venueData = data;
    // Update the DOM with venue details
    document.getElementById("venueName").textContent = `${data.Name} (${data.Category})`;
    // Optionally update other elements (like date) if available
    if (data.date) {
        document.getElementById('date').textContent = data.date;
    }
})
.catch(error => {
    console.error('Error fetching venue details:', error);
});

// Handle the booking submission
document.getElementById('bookNowBtn').addEventListener('click', () => {
    const timeSlot = document.getElementById('timeSlot').value;
    const bookingPurpose = document.getElementById('bookingPurpose').value.trim();

    if (bookingPurpose === '') {
        alert('Please provide a purpose for this booking.');
        return;
    }

    // Prepare booking data
    const bookingData = {
        venue_id: bookingId,
        name: venueData.Name,
        start_time: timeSlot, // Adjust if you have a specific start time
        end_time: '', // Provide end time if applicable
        purpose: bookingPurpose,
        venue_name: venueData.Name
    };

    // API URL to post booking data
    const bookingUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/LuEegOvvNsSnIsYZfZdkoVi9nej2/bookings`; // Replace YOUR_USER_ID with actual user ID

    // Post booking data to the API
    fetch(bookingUrl, {
        method: 'POST',
        headers: {
            'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert(`Booking confirmed for ${venueData.Name || 'the selected venue'} at ${timeSlot}.\nPurpose: ${bookingPurpose}`);
        console.log('Booking Response:', data);
    })
    .catch(error => {
        console.error('Error posting booking data:', error);
    });
});
