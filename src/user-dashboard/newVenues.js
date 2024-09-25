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


function getCurrentDateTime() {
    const today = new Date();
    return new Date(today.getTime() + 2 * 60 * 60 * 1000); 
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function fetchAvailableVenues() {
    try {
        const venuesCollectionRef = collection(db, 'venues');
        const venuesSnapshot = await getDocs(venuesCollectionRef);
        const availableVenues = [];

        for (const venueDoc of venuesSnapshot.docs) {
            const venueData = venueDoc.data();
            const bookingsCollectionRef = collection(db, 'venues', venueDoc.id, getCurrentDate());
            const bookingsSnapshot = await getDocs(bookingsCollectionRef);

            const isBooked = bookingsSnapshot.docs.some(doc => {
                const booking = doc.data();
                const startTime = new Date(booking.startTime.seconds * 1000);
                const endTime = new Date(booking.endTime.seconds * 1000);
                const currentDateTime = new Date();
                
                return currentDateTime >= startTime && currentDateTime <= endTime;
            });

            if (!isBooked) {
                availableVenues.push({
                    Name: venueData.Name,
                    Capacity: venueData.Capacity
                });
            }
        }

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
    `;

    return venueElement;
}

async function populateVenues() {
    console.log("Populating venues...");
    const bookingsContainer = document.getElementById('bookingsContainer');
    const availableVenues = await fetchAvailableVenues();

    bookingsContainer.innerHTML = ''; // Clear existing content

    availableVenues.forEach(venue => {
        bookingsContainer.appendChild(createVenueElement(venue));
    });
}

const availableVenues = await fetchAvailableVenues();
console.log("Available Venues:", availableVenues);


document.addEventListener('DOMContentLoaded', () => {
    populateVenues();
});

