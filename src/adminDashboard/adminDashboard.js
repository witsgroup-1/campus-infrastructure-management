import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { setPersistence,  browserLocalPersistence, getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { FirebaseConfig } from '../FirebaseConfig.js';
import {  getDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";



const firebaseConfig = new FirebaseConfig(); 
const db = firebaseConfig.getFirestoreInstance();
const auth = getAuth();

const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
const apiBaseUrl = 'https://campus-infrastructure-management.azurewebsites.net/api';



async function fetchData(endpoint) {
    try {
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return null;
    }
}


//             async function fetchBookings() {
//                 const data = await fetchData('/Bookings');
//                 if (data) {
//                     displayBookings(data);
//                 }
//             }
        

//         function displayBookings(bookings) {
//             const container = document.getElementById('bookings-container');
//             const noBookingsMessage = document.getElementById('no-bookings-message');
//             const seeMoreButton = document.getElementById('see-more-button');
            
//             container.innerHTML = '';
        
//             if (bookings.length === 0) {
//                 noBookingsMessage.classList.remove('hidden');
//                 seeMoreButton.classList.add('hidden');
//                 return;
//             } else {
//                 noBookingsMessage.classList.add('hidden'); 
//                 seeMoreButton.classList.remove('hidden'); 
//             }
        
//             bookings.slice(0, 2).forEach((booking) => {
//                 const bookingElement = document.createElement('div');
//                 bookingElement.className = 'bg-custom-gold p-4 flex justify-between items-center rounded';
//                 bookingElement.innerHTML = `
//                     <span class="font-inter text-[16px]">
//                         ${booking.purpose} - ${new Date(booking.start_time.seconds * 1000).toLocaleString()}
//                     </span>
//                     <div>
//                         <button onclick="handleBookingAction('accept', '${booking.id}')" class="font-inter font-normal text-[20px] text-black hover:text-custom-blue focus:text-blue-600 focus:outline-none mr-2">Accept</button>
//                         <button onclick="handleBookingAction('reject', '${booking.id}')" class="font-inter font-normal text-[20px] text-black hover:text-custom-blue focus:text-red-600 focus:outline-none">Reject</button>
//                     </div>
//                 `;
//                 container.appendChild(bookingElement);
//             });
//         }
       
//         fetchBookings();

const getGreetingMessage = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
        return { message: 'Good morning', emoji: '🌅' }; // Sunrise emoji
    } else if (hour >= 12 && hour < 17) {
        return { message: 'Good afternoon', emoji: '☀️' }; // Sun emoji
    } else if (hour >= 17 && hour < 21) {
        return { message: 'Good evening', emoji: '🌇' }; // Sunset emoji
    } else {
        return { message: 'Goodnight', emoji: '🌙' }; // Moon emoji
    }
};

document.addEventListener('DOMContentLoaded', async () => {  // Mark the entire function as async
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');

    // Initialize Firebase Auth
    const auth = getAuth();

    // Check Firebase Authentication state
    onAuthStateChanged(auth, async (user) => {  // Mark this callback as async
        if (user) {
            
            const email = user.email;

            localStorage.setItem('userEmail', email);

            const userDocId = user.uid;
            if (userDocId) {
                localStorage.setItem('userId', userDocId);
                const userDoc = await getDoc(doc(db, 'users', userDocId)); 

                // Fetch the name from the document
                const userName = userDoc.data().name || 'User';  // Default to 'User' if name not found

                // Get the appropriate greeting and emoji based on the time of day
                const { message, emoji } = getGreetingMessage();
                const greetingElement = document.getElementById('userGreeting');
                greetingElement.textContent = `${emoji} ${message}, ${userName}!`;

            }      
        } else {
            console.log('No user is signed in.');
            window.location.href = '../login/login.html'; 
        }
    });

    const getSidebarWidth = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1024) {
            return '20%';
        } else if (screenWidth >= 768) {
            return '33%';
        } else {
            return '50%';
        }
    };

    sidebar.style.width = '0';

    menuIcon.addEventListener('click', () => {
        if (sidebar.style.width === '0px' || sidebar.style.width === '0') {
            sidebar.style.width = getSidebarWidth();
        } else {
            sidebar.style.width = '0';
        }
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.width = '0';
    });

    // Close sidebar when clicking outside of it
    document.addEventListener('click', (event) => {
        if (sidebar.style.width !== '0px' && !sidebar.contains(event.target) && !menuIcon.contains(event.target)) {
            sidebar.style.width = '0';
        }
    });

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0px' && sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth();
        }
    });
});

setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('Persistence set to LOCAL');
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });
