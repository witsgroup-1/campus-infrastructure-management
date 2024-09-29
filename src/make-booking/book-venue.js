
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc , query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
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


// Function to fetch user data using the API
// Function to fetch user data using the API
async function fetchUserData(uid) {
    const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW"; 
    const apiUrl = `http://localhost:3000/api/users/${uid}`; // Include uid in the URL

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey 
            }
            // No 'body' property needed for GET requests
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('User data:', userData);
            return userData;
        } else if (response.status === 404) {
            console.log('User not found.');
            return null;
        } else {
            console.error('Error fetching user data:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function fetchAndRenderBookings(userData) {
    const categoryFilter = document.getElementById('roomFilter').value; // Get the selected category
    const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";   

    let apiUrl;
    if (categoryFilter) {
        apiUrl = `http://localhost:3000/api/venues?category=${encodeURIComponent(categoryFilter)}`; // Use query parameter
    } else {
        apiUrl = `http://localhost:3000/api/venues`;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey 
            }
        });

        if (response.ok) {
            const venues = await response.json();
            console.log('Venues:', venues);
            renderVenues(venues, userData);  // Render fetched venues with user-specific filters
        } else {
            const errorText = await response.text();
            console.error('Error:', errorText);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}




function renderVenues(venues, userData) {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = ''; // Clear existing venues

    const categoryFilter = document.getElementById('roomFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    const allowedCategories = getAllowedCategories(userData);

    // Check if the user is filtering by a category they don't have access to
    if (categoryFilter && !allowedCategories.includes(categoryFilter)) {
        container.innerHTML = `<p class="text-center text-red-500">You don't have the privilege to book ${categoryFilter}s.</p>`;
        return; // Stop further rendering
    }

    // Filter venues based on user access, category filter, and search query
    const filteredVenues = venues.filter(venue => {
        const matchesCategory = categoryFilter ? venue.Category === categoryFilter : true;
        const matchesSearch = venue.Name && venue.Name.toLowerCase().includes(searchQuery);
        const matchesAccess = allowedCategories.includes(venue.Category);

        // Ensure that all conditions (category, search, and access) are met
        return matchesCategory && matchesSearch && matchesAccess;
    });

    if (filteredVenues.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No venues found.</p>';
        return;
    }

    // Loop through the filtered venues and create venue boxes
    filteredVenues.forEach(venue => {
        const venueBox = document.createElement('div');
        venueBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

        const venueInfo = document.createElement('div');
        venueInfo.className = 'flex-shrink-0';
        venueInfo.innerHTML = `
            <h2 class="text-lg font-semibold">${venue.Name || 'Unknown Name'}</h2>
            <p class="text-sm text-gray-600">Category: ${venue.Category || 'Unknown Category'}</p>
            <p class="text-sm text-gray-600">Capacity: ${venue.Capacity || 'Unknown Capacity'}</p>
        `;

        const bookButton = document.createElement('button');
        bookButton.className = 'bg-[#917248] text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
        bookButton.textContent = 'Book';

        // Add a click event to redirect the user to the booking details page
        bookButton.onclick = function() {
            window.location.href = `booking-details.html?bookingId=${venue.id}`;
        };

        const actionButtons = document.createElement('div');
        actionButtons.className = 'flex flex-row space-x-2';
        actionButtons.appendChild(bookButton);

        // Append venue info and action buttons to the venue box
        venueBox.appendChild(venueInfo);
        venueBox.appendChild(actionButtons);

        // Append the venue box to the container
        container.appendChild(venueBox);
    });
}





// Function to determine allowed categories based on user role, isTutor, and isLecturer
function getAllowedCategories(userData) {
    // Provide default values in case fields are missing
    const role = userData.role || '';
    const isTutor = userData.isTutor || false;
    const isLecturer = userData.isLecturer || false;
    console.log(role, isTutor, isLecturer);

    if (role === 'Student' && !isTutor && !isLecturer) {
        return ['Study Room'];
    } else if (role === 'Student' && isTutor && !isLecturer) {
        return ['Study Room', 'Tutorial Room'];
    }  else if (role === 'Student' && !isTutor && isLecturer) {
       return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    }else if (role === 'Staff' && isLecturer) {
        return ['Tutorial Room', 'Exam Venue', 'Boardroom','Lecture Hall'];
    } else if (role === 'Staff' && !isLecturer && !isTutor) {
        return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    }else if ((role === 'Student'||role=="Staff") && isLecturer && isTutor) {
        return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    }
    return [];
}

// Other existing functions and imports above...

// Handle authentication and render venues
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User email from Firebase Auth:', user.email);
        const userData = await fetchUserData(user.uid);
        console.log(`User data from Firestore:`, userData);

        fetchAndRenderBookings(userData);  // Fetch venues once user is authenticated and user data is fetched
    } else {
        console.log('No user is signed in.');
        window.location.href = "../index.html";  // Redirect to login page
    }
});

// Updated DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userData = await fetchUserData(user.uid);
            fetchAndRenderBookings(userData);
        } else {
            window.location.href = "../index.html";  // Redirect if no user
        }
    });
});

// Attach event listeners to filters and search input
document.addEventListener('DOMContentLoaded', () => {
    const roomFilterElement = document.getElementById('roomFilter');
    if (roomFilterElement) {
        roomFilterElement.addEventListener('change', async () => {
            const user = auth.currentUser;
            if (user) {
                const userData = await fetchUserData(user.uid);
                fetchAndRenderBookings(userData); // Fetch venues after changing filter
            }
        });
    }

    const searchInputElement = document.getElementById('searchInput');
    if (searchInputElement) {
        searchInputElement.addEventListener('input', async () => {
            const user = auth.currentUser;
            if (user) {
                const userData = await fetchUserData(user.uid);
                fetchAndRenderBookings(userData); // Fetch venues after typing in search
            }
        });
    }
});
