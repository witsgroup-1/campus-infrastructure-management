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


//the venues should have a bookings sub collection labelled yyyy-mm-dd, we should access these colections and thne iterate 
//thru each id in there to find which venues are booked, these ids contain venue name, start time and end time

const categoryToImage = {
    "Exam Venue": ["img/examHall.jpg", "img/examHall2.jpg"],
    "Lecture Room": ["img/lectureRooms.jpeg"],
    "Tutorial Room": ["img/tutorialRoom.png", "img/libraryStudyRoom.jpg"],
    "Lab Room": ["img/labRooms0.jpg", "img/labRooms1.jpg"],
    "Boardroom": ["img/witsBoardroom.png"],
    "Study Room": ["img/libraryStudyRoom.jpg"]
};

function getRandomImage(category) {
    const images = categoryToImage[category];
    if (images && images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }
    return 'img/default.jpg'; 
}


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

async function fetchVenuesWithBookings(date) {
    try {
        const venuesCollectionRef = collection(db, 'venues');
        const venuesSnapshot = await getDocs(venuesCollectionRef);
        const venues = [];
        const currentDateTime = getCurrentDateTime();

        // Collect promises for bookings fetching
        const bookingsPromises = venuesSnapshot.docs.map(async venueDoc => {
            const venueData = venueDoc.data();
            const bookingsCollectionRef = collection(db, 'venues', venueDoc.id, date);
            const bookingsSnapshot = await getDocs(bookingsCollectionRef);
            
            const bookings = bookingsSnapshot.docs.map(doc => doc.data());
            const isBooked = bookings.some(booking => {
                const startTime = new Date(booking.startTime.seconds * 1000);
                const endTime = new Date(booking.endTime.seconds * 1000);
                
                return currentDateTime >= startTime && currentDateTime <= endTime; 
            });

            return {
                ...venueData,
                imgSrc: getRandomImage(venueData.Category),
                isBooked,
                bookings
            };
        });

        const venuesWithBookings = await Promise.all(bookingsPromises);
        return venuesWithBookings;

    } catch (error) {
        console.error('Error fetching venues with bookings:', error);
        return [];
    }
}


function createVenueElement(venue) {
    const venueElement = document.createElement('div');
    venueElement.classList.add('relative', 'group', 'venue-item');

    const imgElement = document.createElement('img');
    imgElement.classList.add('w-full', 'h-40', 'object-cover');
    imgElement.src = venue.imgSrc;
    imgElement.alt = venue.Name;

    const overlayElement = document.createElement('div');
    overlayElement.classList.add('absolute', 'inset-0', 'bg-[#003B5C]', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-300');

    const infoElement = document.createElement('div');
    infoElement.classList.add('text-white', 'text-center');
    infoElement.innerHTML = `
        <p><strong>${venue.Name}</strong></p>
        <p>Capacity: ${venue.Capacity}</p>
    `;

    overlayElement.appendChild(infoElement);
    venueElement.appendChild(imgElement);
    venueElement.appendChild(overlayElement);

    return venueElement;
}



async function populateVenues() {
    try {
        const venues = await fetchVenuesWithBookings(getCurrentDate());
        const gridContainer = document.querySelector('#venue-grid');

        if (!gridContainer) {
            console.error('Element with id "venue-grid" not found.');
            return;
        }

        gridContainer.innerHTML = ''; 

        const venuesToDisplay = venues.slice(0, 3);
        venuesToDisplay.forEach(venue => {
            gridContainer.appendChild(createVenueElement(venue));
        });

        const lastVenue = venues[3];
        if (lastVenue) {
            const lastVenueElement = document.createElement('div');
            lastVenueElement.classList.add('relative');

            const lastImgElement = document.createElement('img');
            lastImgElement.classList.add('w-full', 'h-40', 'object-cover');
            lastImgElement.src = lastVenue.imgSrc;
            lastImgElement.alt = lastVenue.Name;

            const lastOverlayElement = document.createElement('div');
            lastOverlayElement.classList.add('absolute', 'inset-0', 'bg-[#003B5C]', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'opacity-0', 'hover:opacity-100', 'transition-opacity', 'duration-300', 'cursor-pointer');

            const lastLinkElement = document.createElement('a');
            lastLinkElement.href = 'availVenues.html'; 
            lastLinkElement.classList.add('flex', 'items-center', 'justify-center');

            // SVG for the arrow
            const arrowSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            arrowSvg.classList.add('w-6', 'h-6', 'text-white');
            arrowSvg.setAttribute('fill', 'none');
            arrowSvg.setAttribute('stroke', 'currentColor');
            arrowSvg.setAttribute('viewBox', '0 0 24 24');
            arrowSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('d', 'M12 19l7-7-7-7m-5 7h12');

            arrowSvg.appendChild(path);
            lastLinkElement.appendChild(arrowSvg);
            lastOverlayElement.appendChild(lastLinkElement);
            lastVenueElement.appendChild(lastImgElement);
            lastVenueElement.appendChild(lastOverlayElement);

            gridContainer.appendChild(lastVenueElement);
        }

    } catch (error) {
        console.error('Error in populateVenues:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateVenues();
});











  






  





