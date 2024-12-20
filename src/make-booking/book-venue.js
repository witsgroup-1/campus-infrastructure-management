// book-venue.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import { getFirestore, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";



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




const intervals = [
    { start: '08:00', end: '08:45' },
    { start: '09:00', end: '09:45' },
    { start: '10:15', end: '11:00' },
    { start: '11:15', end: '12:00' },
    { start: '12:30', end: '13:15' },
    { start: '14:15', end: '15:00' },
    { start: '15:15', end: '16:00' },
    { start: '16:15', end: '17:00' },
    { start: '17:15', end: '18:00' },
    { start: '18:15', end: '19:00' },
    { start: '19:15', end: '20:00' },
    { start: '20:15', end: '21:00' },
    { start: '21:15', end: '22:00' },
    { start: '22:15', end: '23:00' },
    { start: '23:15', end: '00:00' }
];

window.closeModal = function() {
    const venueModal = document.getElementById('venueModal');
    venueModal.style.display = 'none';
    
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let venues = []; // Declare venues as a global variable

const API_KEY = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";

// Function to toggle loading indicator
function toggleLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.toggle('hidden', !show);
    }

    // Disable/enable UI elements during loading
    document.getElementById('roomFilter').disabled = show;
    document.getElementById('searchInput').disabled = show;
}

toggleLoading(true); // Show loader at the start

// Function to fetch user data using the API
async function fetchUserData(uid) {
    const apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${uid}`; // Include uid in the URL

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY 
            }
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    return null; // Return null if there was an error or not found
}

// Function to determine allowed categories based on user role
export function getAllowedCategories(userData) {
    const role = userData.role || '';
    const isTutor = userData.isTutor || false;
    const isLecturer = userData.isLecturer || false;

    const categoryMapping = {
        'Student': {
            default: ['Study Room'],
            isTutor: ['Study Room', 'Tutorial Room'],
            isLecturer: ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'],
        },
        'Staff': {
            isLecturer: ['Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'],
            default: ['Study Room', 'Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall'],
        }
    };

    if (role in categoryMapping) {
        if (isTutor) return categoryMapping[role].isTutor || categoryMapping[role].default;
        if (isLecturer) return categoryMapping[role].isLecturer || categoryMapping[role].default;
        return categoryMapping[role].default;
    }

    return [];
}

// Pagination variables
let currentPage = 1;
const PAGE_SIZE = 10; // Number of venues to display per page


async function fetchAndRenderBookings(userData) {
    toggleLoading(true); // Show loader at the start

    const categoryFilter = document.getElementById('roomFilter').value || '';
    let apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/venues`;
    if (categoryFilter) {
        apiUrl += `?category=${encodeURIComponent(categoryFilter)}`;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY 
            }
        });

        if (response.ok) {
            venues = await response.json(); // Assign fetched venues to the global variable
            await renderVenues(venues, userData); // Wait for rendering to finish
        } else {
            console.error('Failed to fetch venues:', response.statusText);
            document.getElementById('bookingsContainer').innerHTML = '<p class="text-center text-red-500">Failed to load venues. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error fetching venues:', error);
        document.getElementById('bookingsContainer').innerHTML = '<p class="text-center text-red-500">An error occurred while loading venues.</p>';
    } finally {
        toggleLoading(false); // Hide loader after fetching venues
    }
}

async function checkMaintenanceStatus(venueId) {
    const apiUrl = `https://campus-infrastructure-management.azurewebsites.net/api/maintenanceRequests/venue/${venueId}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY 
            }
        });

        if (response.ok) {
            const maintenanceRequests = await response.json();

            // Check if there is a request with status "In Progress" or "Scheduled"
            return maintenanceRequests.some(request => 
                request.status === "In Progress" || request.status === "Scheduled"
            );
        }
    } catch (error) {
        console.error('Error checking maintenance status:', error);
    }
    
    return false; // Return false if there was an error or no relevant requests found
}

window.showCalendarModal = async function (venueId) {
    try {
        const modalContent = document.getElementById('modalContent');
        const modalTitle = document.getElementById('modalTitle');
        const venueModal = document.getElementById('venueModal');
        
        modalTitle.textContent = 'Availability Calendar';

        modalContent.innerHTML = `
            <label for="calendar-date">Choose a date:</label>
            <input type="date" id="calendar-date" min="${getCurrentDate()}" class="calendar-date-picker">
            <div id="calendar-results"></div>
        `;

        const dateInput = document.getElementById('calendar-date');
        const calendarResults = document.getElementById('calendar-results');

        dateInput.addEventListener('change', async (event) => {
            const selectedDate = event.target.value;
            if (selectedDate) {
                const calendarContent = await generateCalendarContent(venueId, selectedDate);
                calendarResults.innerHTML = calendarContent;
            }
        });

        venueModal.style.display = 'block';

    } catch (error) {
        console.error('Error showing calendar modal:', error);
    }
};


function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function generateCalendarContent(venueId, currentDate = getCurrentDate()) {
    try {
        

        const bookingsCollectionRef = collection(db, 'venues', venueId, currentDate);
        const bookingsSnapshot = await getDocs(bookingsCollectionRef);


        const calendarContent = intervals.map((slot) => ({
            ...slot,
            isBooked: false,  // Initially, all slots are assumed to be available
        }));

        bookingsSnapshot.docs.forEach((bookingDoc) => {
            const bookingData = bookingDoc.data();
            const bookingStartTime = new Date(bookingData.startTime.seconds * 1000);
            const bookingEndTime = new Date(bookingData.endTime.seconds * 1000);

            calendarContent.forEach((slot) => {
                const [slotStartHour, slotStartMinute] = slot.start.split(':').map(Number);
                const [slotEndHour, slotEndMinute] = slot.end.split(':').map(Number);

                const slotStartTime = new Date(currentDate);
                slotStartTime.setHours(slotStartHour, slotStartMinute, 0, 0);

                const slotEndTime = new Date(currentDate);
                slotEndTime.setHours(slotEndHour, slotEndMinute, 0, 0);

               
                if (bookingStartTime < slotEndTime && bookingEndTime > slotStartTime) {
                    slot.isBooked = true;
                }
            });
        });

        const calendarHtml = `
            <div class="calendar-grid">
                ${calendarContent.map((slot) => {
                    const status = slot.isBooked ? 'Booked' : 'Available';
                    const statusClass = slot.isBooked ? 'booked-slot' : 'available-slot';

                    return `
                        <div class="time-slot ${statusClass}">
                            <span class="slot-time">${slot.start} - ${slot.end}</span>
                            <span class="slot-status">${status}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        return calendarHtml;

    } catch (error) {
        console.error('Error generating calendar content:', error);
        return '<div class="error">Error loading calendar data.</div>';
    }
}

async function renderVenues(venues, userData) {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = ''; // Clear existing venues

    const categoryFilterElement = document.getElementById('roomFilter');
    const searchInputElement = document.getElementById('searchInput');
    const searchQuery = searchInputElement.value.toLowerCase();

    // Filter venues based on user access, category filter, and search query
    const filteredVenues = venues.filter(venue => {
        const matchesCategory = categoryFilterElement.value ? venue.Category === categoryFilterElement.value : true;
        const matchesSearch = venue.Name && venue.Name.toLowerCase().includes(searchQuery);
        const matchesAccess = getAllowedCategories(userData).includes(venue.Category);
        return matchesCategory && matchesSearch && matchesAccess;
    });

    // Handle pagination
    const totalPages = Math.ceil(filteredVenues.length / PAGE_SIZE);
    const paginatedVenues = filteredVenues.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    if (paginatedVenues.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No venues found.</p>';
        return;
    }

    // Create an array of promises to check maintenance status for all venues
    const maintenanceChecks = paginatedVenues.map(async (venue) => {
        const isUnderMaintenance = await checkMaintenanceStatus(venue.id);
        return { venue, isUnderMaintenance }; // Return venue and its maintenance status
    });

    // Wait for all maintenance checks to complete
    const venuesWithMaintenanceStatus = await Promise.all(maintenanceChecks);

    // Render the venues based on their maintenance status
    venuesWithMaintenanceStatus.forEach(({ venue, isUnderMaintenance }) => {
        const venueBox = document.createElement('div');
        venueBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

        if (isUnderMaintenance) {
            venueBox.innerHTML = `
                <div class="flex-shrink-0">
                    <h2 class="text-lg font-semibold">${venue.Name || 'Unknown Name'}</h2>
                    <p class="text-sm text-gray-600">Category: ${venue.Category || 'Unknown Category'}</p>
                    <p class="text-sm text-gray-600">Capacity: ${venue.Capacity || 'Unknown Capacity'}</p>
                     <p class="text-sm text-gray-600">Features: ${venue.Features || 'Unknown Features'}</p>
                    <p class="text-red-500">This venue is currently under maintenance.</p>
                </div>
            `;
        } else {
            venueBox.innerHTML = `
                <div class="flex-shrink-0">
                    <h2 class="text-lg font-semibold">${venue.Name || 'Unknown Name'}</h2>
                    <p class="text-sm text-gray-600">Building: ${venue.Building || 'Unknown Building'}</p>
                    <p class="text-sm text-gray-600">Category: ${venue.Category || 'Unknown Category'}</p>
                    <p class="text-sm text-gray-600">Capacity: ${venue.Capacity || 'Unknown Capacity'}</p>
                     <p class="text-sm text-gray-600">Features: ${venue.Features || 'Unknown Features'}</p>
                </div>
                <div>
                    <button class="bg-[#917248] text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none" onclick="window.location.href='booking-details.html?bookingId=${venue.id}'">Book</button>
                    <button class="bg-[#917248] text-white px-3 py-1 rounded ml-2 hover:bg-gray-600 focus:outline-none" onclick="showCalendarModal('${venue.id}')">Availability</button>
                </div>
            `;
        }

        container.appendChild(venueBox);
    });

    setupPagination(totalPages, userData); // Pass userData to setupPagination
}





function setupPagination(totalPages, userData) {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = `
        <button id="prevPage" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="nextPage" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;

    // Previous Page Button
    document.getElementById('prevPage').onclick = async () => {
        if (currentPage > 1) {
            currentPage--;
            toggleLoading(true); // Show loader when changing pages
            await renderVenues(venues, userData); // Wait for rendering to finish
            toggleLoading(false); // Hide loader after rendering
        }
    };

    // Next Page Button
    document.getElementById('nextPage').onclick = async () => {
        if (currentPage < totalPages) {
            currentPage++;
            toggleLoading(true); // Show loader when changing pages
            await renderVenues(venues, userData); // Wait for rendering to finish
            toggleLoading(false); // Hide loader after rendering
        }
    };
}

// Function to populate category dropdown based on user permissions
function populateCategoryDropdown(userData) {
    const roomFilterElement = document.getElementById('roomFilter');
    const allowedCategories = getAllowedCategories(userData); // Get allowed categories for the user

    // Clear existing options
    roomFilterElement.innerHTML = '<option value="">Room type</option>';

    // Add allowed categories to the dropdown
    allowedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        roomFilterElement.appendChild(option);
    });
}

// Update onAuthStateChanged to populate categories after fetching user data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await fetchUserData(user.uid);
        populateCategoryDropdown(userData); // Populate categories based on user permissions
        fetchAndRenderBookings(userData);
        currentPage = 1; // Reset to first page when user logs in
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
                toggleLoading(true); // Show loader at the start
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
                fetchAndRenderBookings(userData);
            }
        });
    }
});

