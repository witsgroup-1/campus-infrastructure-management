import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore,collection, getDocs} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
  authDomain: "campusinfrastructuremanagement.firebaseapp.com",
  projectId: "campusinfrastructuremanagement",
  storageBucket: "campusinfrastructuremanagement.appspot.com",
  messagingSenderId: "981921503275",
  appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
  measurementId: "G-Y95YE5ZDRY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    
    // Find the next available time slot after the current time
    for (const interval of intervals) {
        const [startHour, startMinute] = interval.start.split(':').map(Number);
        
        // Check if the current time is before the start of the next interval
        if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
            return interval;
        }
    }
    
    return null; // No more slots available today
}

async function fetchAvailableVenues() {
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

        // Create Date objects for the start and end of the next time slot
        const nextSlotStartTime = new Date();
        nextSlotStartTime.setHours(nextSlotStartHour, nextSlotStartMinute, 0, 0);
        
        const nextSlotEndTime = new Date();
        nextSlotEndTime.setHours(nextSlotEndHour, nextSlotEndMinute, 0, 0);
        
        const venuePromises = venuesSnapshot.docs.map(async (venueDoc) => {
            const venueData = venueDoc.data();
            const bookingsCollectionRef = collection(db, 'venues', venueDoc.id, currentDate);
            const bookingsSnapshot = await getDocs(bookingsCollectionRef);

            const isBooked = bookingsSnapshot.docs.some(doc => {
                const booking = doc.data();
                const bookingStartTime = new Date(booking.startTime.seconds * 1000);
                const bookingEndTime = new Date(booking.endTime.seconds * 1000);

                // Only consider bookings that overlap with or are after the nextSlot
                const isOverlap = (bookingStartTime < nextSlotEndTime && bookingEndTime > nextSlotStartTime);
                
                return isOverlap; 
            });

            if (!isBooked) {
                availableVenues.push({
                    Name: venueData.Name,
                    Capacity: venueData.Capacity,
                    Features: venueData.Features || [],
                    Building: venueData.Building
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
    venueElement.classList.add('bg-white', 'border', 'border-gray-300', 'rounded-lg', 'p-4', 'shadow');

    venueElement.innerHTML = `
        <p class="font-semibold">${venue.Name}</p>
        <p>Capacity: ${venue.Capacity}</p>
        <button class="mt-2 px-4 py-2 bg-[#917248] text-white rounded info-button">Info</button>
    `;

   
    const infoButton = venueElement.querySelector('.info-button');
    infoButton.addEventListener('click', () => {
        showVenueInfo(venue); 
    });

    return venueElement;
}

function showVenueInfo(venue) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modalTitle.innerText = venue.Name;

    let content = `<strong>Building:</strong> ${venue.Building || 'N/A'}`;

    if (venue.Features && venue.Features.length > 0) {
        content += `<br><strong>Features:</strong> <ul>${venue.Features.map(feature => `<li>${feature}</li>`).join('')}</ul>`;
    }
    modalContent.innerHTML = content;

   
    const venueModal = document.getElementById('venueModal');
    venueModal.classList.remove('hidden');
}

function closeModal() {
    const venueModal = document.getElementById('venueModal');
    venueModal.classList.add('hidden');
}



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

async function populateVenues() {
    const loader = document.getElementById('loader');
    loader.style.display = "block";

    availableVenues = await fetchAvailableVenues();
    loader.style.display = "none";

  
    currentPage = 1;
    displayVenues(currentPage);
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
    populateVenues();
    const closeButton = document.getElementById('closeButton');
    closeButton.onclick = closeModal;
});