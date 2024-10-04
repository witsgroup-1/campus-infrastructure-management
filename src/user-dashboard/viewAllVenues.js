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

let bookings = [];

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

// Fetch venue data
const url = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';

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
    bookings = data; 
    renderVenues();
})
.catch(error => {
    console.error('Error fetching venues:', error);
});

async function renderVenues() {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = '';

    const loader = document.getElementById('loader');
    loader.style.display = "block"; // Show the loader

    try {
        // Fetch the venues from your API
        const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/venues', {
            method: 'GET',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is ok (status 200)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        bookings = await response.json(); // Parse the response data
    } catch (error) {
        console.error('Error fetching venues:', error);
        loader.style.display = "block"; // Hide the loader on error
        return;
    }


    const user = auth.currentUser;
    
   
    if (!user) {
        container.innerHTML = '<p class="text-center text-gray-500">Please log in to see venues.</p>';
        return;
    }

    const userData = await fetchUserData(user.uid);
    
    if (!userData) {
        console.error('No user data available.');
        return;
    }

    const categoryFilter = document.getElementById('roomFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const allowedCategories = getAllowedCategories(userData);

    const filteredVenues = bookings.filter(venue => {
        const matchesCategory = categoryFilter ? venue.Category === categoryFilter : true;
        const matchesAllowedCategory = allowedCategories.includes(venue.Category);
        const matchesSearch = venue.Name && venue.Name.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesAllowedCategory && matchesSearch;
    });

    if (filteredVenues.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No venues found.</p>';
        return;
    }

    filteredVenues.forEach(venue => {
        const venueBox = document.createElement('div');
        venueBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

        const venueInfo = document.createElement('div');
        venueInfo.className = 'flex-shrink-0';
        venueInfo.innerHTML = `
            <h2 class="text-lg font-semibold">${venue.Name || 'Unknown Name'}</h2>
            <p class="text-sm text-gray-600">Category: ${venue.Category || 'Unknown Category'}</p>
        `;
        venueBox.appendChild(venueInfo);

        const actionButtons = document.createElement('div');
        actionButtons.className = 'flex flex-row space-x-2';

        const bookButton = document.createElement('button');
        bookButton.className = 'bg-[#917248] text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
        bookButton.textContent = 'Book';

        bookButton.onclick = function() {
            window.location.href = `../make-booking/venue-details.html?venueId=${venue.id}`;
        };

        actionButtons.appendChild(bookButton);
        venueBox.appendChild(actionButtons);

        container.appendChild(venueBox);
    });
}


function getAllowedCategories(userData) {
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
        return ['Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    } else if (role === 'Staff' && !isLecturer && !isTutor) {
        return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    } else if ((role === 'Student' || role === 'Staff') && isLecturer && isTutor) {
        return ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'];
    }
    return [];
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await fetchUserData(user.uid);
        if (userData) {
            renderVenues();
        } else {
            console.error('No user data available.');
        }
    } else {
        console.error('No user is signed in.');
    }
});


document.getElementById('roomFilter').addEventListener('change', renderVenues);
document.getElementById('searchInput').addEventListener('input', renderVenues);

document.addEventListener('DOMContentLoaded', renderVenues);
