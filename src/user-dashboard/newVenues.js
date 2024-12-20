import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";


export const firebaseConfig = {
  apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
  authDomain: "campusinfrastructuremanagement.firebaseapp.com",
  projectId: "campusinfrastructuremanagement",
  storageBucket: "campusinfrastructuremanagement.appspot.com",
  messagingSenderId: "981921503275",
  appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
  measurementId: "G-Y95YE5ZDRY"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

//show more info on desktop, add book button, info hide on mobile.
//show venues that are not under maintenance as well.
export const intervals = [
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

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}






const venuesPerPage = 10; 
let currentPage = 1; 
let availableVenues = [];

function getNextSlot() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (const interval of intervals) {
        const [startHour, startMinute] = interval.start.split(':').map(Number);
        
        if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
            return interval;
        }
    }
    
    return null;
}

function getAllowedCategories(userData) {
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

export async function fetchUserData(uid) {
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

async function fetchAvailableVenues(userData) {
    try {
        const venuesCollectionRef = collection(db, 'venues');
        const venuesSnapshot = await getDocs(venuesCollectionRef);
        const availableVenues = [];
        const currentDate = getCurrentDate();
        const nextSlot = getNextSlot();

        if (!nextSlot) {
            console.log('No more slots available for today.');
            return availableVenues;
        }

        const [nextSlotStartHour, nextSlotStartMinute] = nextSlot.start.split(':').map(Number);
        const [nextSlotEndHour, nextSlotEndMinute] = nextSlot.end.split(':').map(Number);

        const nextSlotStartTime = new Date();
        nextSlotStartTime.setHours(nextSlotStartHour, nextSlotStartMinute, 0, 0);
        
        const nextSlotEndTime = new Date();
        nextSlotEndTime.setHours(nextSlotEndHour, nextSlotEndMinute, 0, 0);
        
        const allowedCategories = getAllowedCategories(userData);

        const venuePromises = venuesSnapshot.docs.map(async (venueDoc) => {
            const venueData = venueDoc.data();
            const venueId = venueDoc.id;

            // Check maintenance status for the venue
            const isUnderMaintenance = await checkMaintenanceStatus(venueId);
            if (isUnderMaintenance) {
                return; // Skip adding this venue if it's under maintenance
            }

            const bookingsCollectionRef = collection(db, 'venues', venueId, currentDate);
            const bookingsSnapshot = await getDocs(bookingsCollectionRef);

            const isBooked = bookingsSnapshot.docs.some(doc => {
                const booking = doc.data();
                const bookingStartTime = new Date(booking.startTime.seconds * 1000);
                const bookingEndTime = new Date(booking.endTime.seconds * 1000);
                
                const isOverlap = (bookingStartTime < nextSlotEndTime && bookingEndTime > nextSlotStartTime);
                
                return isOverlap; 
            });

            const isAllowedCategory = allowedCategories.includes(venueData.Category);
            
            if (!isBooked && isAllowedCategory) {
                availableVenues.push({
                    id: venueId, 
                    Name: venueData.Name,
                    Capacity: venueData.Capacity,
                    Features: venueData.Features || [],
                    Building: venueData.Building,
                    Category: venueData.Category
                });
            }
        });

        await Promise.all(venuePromises);
        return availableVenues;
        
    } catch (error) {
        console.error('Error fetching available venues:', error);
        return [];
    }
}



function createVenueElement(venue) {
    const venueElement = document.createElement('div');
    venueElement.classList.add('venue-container', 'bg-white', 'border', 'border-gray-300', 'rounded-lg', 'p-4', 'shadow', 'flex', 'justify-between');

    venueElement.setAttribute('data-venue-id', venue.id); 

    const bookButton = `<button class="mt-2 px-4 py-2 bg-[#917248] text-white rounded book-button">Book</button>`;
    const calendarButton = `<button class="mt-2 px-4 py-2 bg-[#917248] text-white rounded calendar-button">Availability</button>`;

    // Join the features array into a comma-separated string
    const venueFeatures = venue.Features && venue.Features.length > 0
        ? venue.Features.join(', ')  // Join the array elements with commas
        : 'No features available';

    const venueDetails = `
        <div class="venue-details">
            <strong>Building:</strong> ${venue.Building || 'N/A'}<br>
            <strong>Category:</strong> ${venue.Category || 'N/A'}<br>
            <strong>Features:</strong> ${venueFeatures}
        </div>`;

    venueElement.innerHTML = `
        <div>
            <p class="font-semibold">${venue.Name}</p>

            ${calendarButton}
            ${bookButton}
        </div>
        ${venueDetails}`;

    
    const bookButtonElement = venueElement.querySelector('.book-button');
    const calendarButtonElement = venueElement.querySelector('.calendar-button');

    bookButtonElement.addEventListener('click', () => {
        const venueId = venueElement.getAttribute('data-venue-id');
        window.location.href = `../make-booking/booking-details.html?bookingId=${venueId}`;
    });

    calendarButtonElement.addEventListener('click', () => {
        showCalendarModal(venue.id); // Show the calendar modal
    });

    return venueElement;
}


function closeModal() {
    const venueModal = document.getElementById('venueModal');
    venueModal.style.display = 'none';
    
}

//add book button similar to one in the venues page.



function displayVenues(page) {
    const bookingsContainer = document.getElementById('bookingsContainer');
    bookingsContainer.innerHTML = ''; // Clear existing content

    const start = (page - 1) * venuesPerPage;
    const end = start + venuesPerPage;
    const venuesToDisplay = availableVenues.slice(start, end);

    if (venuesToDisplay.length === 0) {
        bookingsContainer.innerHTML = '<p>No available venues at this time.</p>';
        return;
    }

    venuesToDisplay.forEach(venue => {
        bookingsContainer.appendChild(createVenueElement(venue));
    });

   
    document.getElementById('pageInfo').innerText = `Page ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = end >= availableVenues.length;
}

async function populateVenues(userData) {
    const loader = document.getElementById('loader');
    loader.style.display = "block";

    availableVenues = await fetchAvailableVenues(userData); // Pass userData here
    loader.style.display = "none";

    currentPage = 1;
    displayVenues(currentPage);
}


async function showCalendarModal(venueId) {
    try {
        // Create a date input element for selecting a future date
        const modalContent = document.getElementById('modalContent');
        const modalTitle = document.getElementById('modalTitle');
        const venueModal = document.getElementById('venueModal');
        
        modalTitle.textContent = 'Availability Calendar';

        // Add a date picker input
        modalContent.innerHTML = `
            <label for="calendar-date">Choose a date:</label>
            <input type="date" id="calendar-date" min="${getCurrentDate()}" class="calendar-date-picker">
            <div id="calendar-results"></div>
        `;

        const dateInput = document.getElementById('calendar-date');
        const calendarResults = document.getElementById('calendar-results');

        // Listen for changes to the date input
        dateInput.addEventListener('change', async (event) => {
            const selectedDate = event.target.value; // Get the selected date
            if (selectedDate) {
                // Fetch the calendar content for the selected date
                const calendarContent = await generateCalendarContent(venueId, selectedDate);
                calendarResults.innerHTML = calendarContent;
            }
        });

        venueModal.style.display = 'block'; // Show the modal

    } catch (error) {
        console.error('Error showing calendar modal:', error);
    }
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






document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayVenues(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage * venuesPerPage < availableVenues.length) {
        currentPage++;
        displayVenues(currentPage);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    loader.style.display = "block";
    onAuthStateChanged(auth, async (user) => {
        if (user) {
           
            const userData = await fetchUserData(user.uid); 
    
            await populateVenues(userData);
        } else {
            // User is signed out
            console.log('User is signed out');
            //window.location.href = '../login/login.html'
        }
        loader.style.display = "none";
    });
    const closeButton = document.getElementById('closeButton');
    closeButton.onclick = closeModal;
});

const API_KEY = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";