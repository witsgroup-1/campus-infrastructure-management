import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore,collection, getDocs, getDoc, doc} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
//import { getAllowedCategories } from "../make-booking/book-venue";

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
const auth = getAuth(app);
const db = getFirestore(app);


//the venues should have a bookings sub collection labelled yyyy-mm-dd, we should access these colections and thne iterate 
//thru each id in there to find which venues are booked, these ids contain venue name, start time and end time

const categoryToImage = {
    "Exam Venue": ["img/examHall.jpg", "img/examHall2.jpg","img/lectureRooms1.jpeg"],
    "Lecture Room": ["img/lectureRooms.jpeg"],
    "Tutorial Room": ["img/tutorialRoom.png", "img/libraryStudyRoom.jpg"],
    "Lab Room": ["img/labRooms0.jpg", "img/labRooms1.jpg"],
    "Boardroom": ["img/witsBoardroom.png"],
    "Study Room": ["img/libraryStudyRoom.jpg"]
};

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



async function fetchVenuesWithBookings(date, userData) {
    try {
        const venuesCollectionRef = collection(db, 'venues');
        const venuesSnapshot = await getDocs(venuesCollectionRef);
        const venues = [];
        const currentDateTime = getCurrentDateTime();

        // Get allowed categories for the user
        const allowedCategories = getAllowedCategories(userData);

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

        // Filter venues based on allowed categories
        const accessibleVenues = venuesWithBookings.filter(venue => 
            allowedCategories.includes(venue.Category) // Check if the venue category is allowed
        );

        return accessibleVenues;

    } catch (error) {
        console.error('Error fetching venues with bookings:', error);
        return [];
    }
}



function createVenueElement(venue) {
    const venueElement = document.createElement('div');
    venueElement.classList.add('relative', 'venue-item', 'cursor-pointer'); // Added cursor-pointer for click effect

    const imgElement = document.createElement('img');
    imgElement.classList.add('w-full', 'h-40', 'object-cover');
    imgElement.src = venue.imgSrc;
    imgElement.alt = venue.Name;

    const overlayElement = document.createElement('div');
    overlayElement.classList.add('absolute', 'inset-0', 'bg-[#003B5C]', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'transition-opacity', 'duration-300');

    const infoElement = document.createElement('div');
    infoElement.classList.add('text-white', 'text-center');
    infoElement.innerHTML = `
        <p><strong>${venue.Name}</strong></p>
        <p>Capacity: ${venue.Capacity}</p>
    `;

    overlayElement.appendChild(infoElement);
    venueElement.appendChild(imgElement);
    venueElement.appendChild(overlayElement);

    // Add click event listener to navigate to the desired page
    venueElement.addEventListener('click', () => {
        window.location.href = 'availVenues.hmtl';
    });

    return venueElement;
}



async function populateVenues() {

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userId = user.uid; // Get the current user's ID

            try {
                const userDoc = await getDoc(doc(db, 'users', userId)); // Fetch user data
                const userData = userDoc.exists() ? userDoc.data() : {}; // Ensure user data exists

                const venues = await fetchVenuesWithBookings(getCurrentDate(), userData); // Pass user data

                const gridContainer = document.querySelector('#venue-grid');

                if (!gridContainer) {
                    console.error('Element with id "venue-grid" not found.');
                    return;
                }

                gridContainer.innerHTML = ''; 

                const venuesToDisplay = getRandomVenues(venues, 3);
                venuesToDisplay.forEach(venue => {
                    gridContainer.appendChild(createVenueElement(venue));
                });

                const lastVenue = venues[3];
                if (lastVenue) {
                    const lastVenueElement = document.createElement('div');
                    lastVenueElement.classList.add('relative');
                    lastVenueElement.addEventListener('click', () => {
                        window.location.href = 'availVenues.html';
                    });

                    const lastImgElement = document.createElement('img');
                    lastImgElement.classList.add('w-full', 'h-40', 'object-cover');
                    lastImgElement.src = getRandomImage(lastVenue.category); // Use random image from category
                    lastImgElement.alt = lastVenue.Name;

                    const lastOverlayElement = document.createElement('div');
                    lastOverlayElement.classList.add('absolute', 'inset-0', 'bg-[#003B5C]', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'opacity-100', 'transition-opacity', 'duration-300', 'cursor-pointer');

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
        } else {
            console.log('No user is signed in.');
            // Handle case when no user is signed in
        }
    });
}

function getRandomImage(category) {
    const images = categoryToImage[category];
    if (images && images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }
    return 'img/default.jpg'; 
}

function getRandomVenues(venues, num) {
    const shuffledVenues = [...venues]; 
    for (let i = shuffledVenues.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledVenues[i], shuffledVenues[randomIndex]] = [shuffledVenues[randomIndex], shuffledVenues[i]];
    }
    return shuffledVenues.slice(0, num);
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


document.addEventListener('DOMContentLoaded', () => {
    populateVenues();
});











  






  




