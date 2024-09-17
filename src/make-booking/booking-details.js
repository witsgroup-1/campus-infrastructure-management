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

    // Simulate booking confirmation (replace with real backend call)
    alert(`Booking confirmed for ${venueData.Name || 'the selected venue'} at ${timeSlot}.\nPurpose: ${bookingPurpose}`);
});
