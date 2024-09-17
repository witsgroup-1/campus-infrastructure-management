import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


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
//access the venues db, get from there 
//if the venues category === something, use img number 1 
//load only 3 available venues 
//the last image when you click on it, should navigate you to view all venues.

//the venues should have a booked booelan attribute
//if booked then true
//if not booked then false
//this code should then access venues>>venue>>if booked == false, show the venue on the dashboard
//also have venues>>venue>>category >> show specific image
//also get the name of the venue so that when we hover we can see the name of the venue.


// Function to fetch venue data from the API
// Function to fetch venue data from the API

const categoryToImage = {
    "Exam Venue": "img/examHall.jpg",
    "Lecture Room": "img/lectureRooms.jpeg",
    "Tutorial Room": "img/tutorialRoom.png",
    "Lab Room": "img/labRooms0.jpg",
    "Boardroom": "img/witsBoardroom.png"
};

async function fetchVenues() {
    try {
        const url = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch venues, please try again.');
        }

        const venues = await response.json();
        //console.log('Venues fetched:', venues); 

        return venues.map(venue => ({
            ...venue,
            imgSrc: categoryToImage[venue.Category] || 'img/default.jpg'
        }));
    } catch (error) {
        console.error('Error fetching venues:', error);
        return [];
    }
}

function createVenueElement(venue) {
    const venueElement = document.createElement('div');
    venueElement.classList.add('relative', 'group');


    const imgElement = document.createElement('img');
    imgElement.classList.add('w-full', 'h-40', 'object-cover');
    imgElement.src = venue.imgSrc;
    imgElement.alt = venue.Name;

    const overlayElement = document.createElement('div');
    overlayElement.classList.add('absolute', 'inset-0', 'bg-[#003B5C]', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-300');

    const infoElement = document.createElement('div');
    infoElement.classList.add('text-white', 'text-center');
    infoElement.innerHTML = `<p><strong>${venue.Name}</strong></p><p>Capacity: ${venue.Capacity}</p>`;

    overlayElement.appendChild(infoElement);
    venueElement.appendChild(imgElement);
    venueElement.appendChild(overlayElement);

    return venueElement;
}


async function populateVenues() {
    try {
        const venues = await fetchVenues();
        const gridContainer = document.querySelector('#venue-grid'); // Select the container by id

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
        
            // Create and configure the last image element
            const lastImgElement = document.createElement('img');
            lastImgElement.classList.add('w-full', 'h-40', 'object-cover');
            lastImgElement.src = lastVenue.imgSrc;
            lastImgElement.alt = lastVenue.Name;
        
            // Create and configure the overlay element
            const lastOverlayElement = document.createElement('div');
            lastOverlayElement.classList.add('absolute', 'inset-0', 'bg-[#003B5C]', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'opacity-0', 'hover:opacity-100', 'transition-opacity', 'duration-300', 'cursor-pointer');
        
            // Create and configure the link element
            const lastLinkElement = document.createElement('a');
            lastLinkElement.href = 'viewAllVenues.html';
            lastLinkElement.classList.add('flex', 'items-center', 'justify-center'); // Centering arrow
        
            // Create and configure the SVG element
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
        
            // Append the image and overlay to the venue element
            lastVenueElement.appendChild(lastImgElement);
            lastVenueElement.appendChild(lastOverlayElement);
        
            // Append the venue element to the grid container
            gridContainer.appendChild(lastVenueElement);
        }
        
    } catch (error) {
        console.error('Error in populateVenues:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateVenues();
});

module.exports = {populateVenues, fetchVenues, createVenueElement}