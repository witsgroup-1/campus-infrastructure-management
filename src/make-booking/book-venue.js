// book-venue.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js"; // Updated to match system prompt version
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// Function to toggle loading indicator
function toggleLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

   //disable/enable UI elements during loading
    const roomFilter = document.getElementById('roomFilter');
    const searchInput = document.getElementById('searchInput');
    if (roomFilter) roomFilter.disabled = show;
    if (searchInput) searchInput.disabled = show;
}

toggleLoading(true); // Show loader at the start

// Function to fetch user data using the API
async function fetchUserData(uid) {
    const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW"; 
    const apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${uid}`; // Include uid in the URL

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey 
            }
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else if (response.status === 404) {
            return null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function fetchAndRenderBookings(userData) {
   

    const roomFilterElement = document.getElementById('roomFilter');
    
    // Check if the roomFilterElement exists before accessing its value
    if (!roomFilterElement) {
        toggleLoading(false); // Hide loader if element is missing
        return; // Exit the function if the element is missing
    }

    const categoryFilter = roomFilterElement.value; // Safely access the value now
    const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";   

    let apiUrl;
    if (categoryFilter) {
        apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/venues?category=${encodeURIComponent(categoryFilter)}`;
    } else {
        apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/venues`;
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
            renderVenues(venues, userData);  // Render fetched venues with user-specific filters
        } else {
            console.error('Failed to fetch venues:', response.statusText);
            document.getElementById('bookingsContainer').innerHTML = '<p class="text-center text-red-500">Failed to load venues. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error fetching venues:', error);
        document.getElementById('bookingsContainer').innerHTML = '<p class="text-center text-red-500">An error occurred while loading venues.</p>';
    } finally {
        toggleLoading(false); // Hide loader after fetching and rendering
    }
}

function renderVenues(venues, userData) {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = ''; // Clear existing venues

    const categoryFilterElement = document.getElementById('roomFilter');
    const searchInputElement = document.getElementById('searchInput');

    // Add checks before accessing value
    const categoryFilter = categoryFilterElement ? categoryFilterElement.value : '';
    const searchQuery = searchInputElement ? searchInputElement.value.toLowerCase() : '';

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

    if (role === 'Student' && !isTutor && !isLecturer) {
        return ['Study Room'];
    } else if (role === 'Student' && isTutor && !isLecturer) {
        return ['Study Room', 'Tutorial Room'];
    } else if (role === 'Student' && !isTutor && isLecturer) {
        return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    } else if (role === 'Staff' && isLecturer) {
        return ['Tutorial Room', 'Exam Venue', 'Boardroom','Lecture Hall'];
    } else if (role === 'Staff' && !isLecturer && !isTutor) {
        return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    } else if ((role === 'Student' || role === "Staff") && isLecturer && isTutor) {
        return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    }
    return [];
}

// Handle authentication and render venues
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await fetchUserData(user.uid);
        fetchAndRenderBookings(userData);  // Fetch venues once user is authenticated and user data is fetched
    } else {
        window.location.href = "../index.html";  // Redirect to login page
    }
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
