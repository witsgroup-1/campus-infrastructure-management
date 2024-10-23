import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { setPersistence, browserLocalPersistence, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
    authDomain: "campusinfrastructuremanagement.firebaseapp.com",
    projectId: "campusinfrastructuremanagement",
    storageBucket: "campusinfrastructuremanagement.appspot.com",
    messagingSenderId: "981921503275",
    appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
    measurementId: "G-Y95YE5ZDRY"
};

const auth = getAuth();

const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
const apiBaseUrl = 'https://campus-infrastructure-management.azurewebsites.net/api';

export async function fetchData(endpoint) {
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

export async function fetchBookings() {
    return await fetchData('/Bookings');
}

export function displayBookings(container, bookings, noBookingsMessage, seeMoreButton) {
    container.innerHTML = '';

    if (bookings.length === 0) {
        noBookingsMessage.classList.remove('hidden');
        seeMoreButton.classList.add('hidden');
        return;
    } else {
        noBookingsMessage.classList.add('hidden');
        seeMoreButton.classList.remove('hidden');
    }

    bookings.slice(0, 2).forEach((booking) => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'bg-custom-gold p-4 flex justify-between items-center rounded';
        bookingElement.innerHTML = `
            <span class="font-inter text-[16px]">
                ${booking.purpose} - ${new Date(booking.start_time.seconds * 1000).toLocaleString()}
            </span>
            <div>
                <button onclick="handleBookingAction('accept', '${booking.id}')" class="font-inter font-normal text-[20px] text-black hover:text-custom-blue focus:text-blue-600 focus:outline-none mr-2">Accept</button>
                <button onclick="handleBookingAction('reject', '${booking.id}')" class="font-inter font-normal text-[20px] text-black hover:text-custom-blue focus:text-red-600 focus:outline-none">Reject</button>
            </div>
        `;
        container.appendChild(bookingElement);
    });
}

export function checkAuthState(auth, onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onUserLoggedIn(user);
        } else {
            onUserLoggedOut();
        }
    });
}


export function toggleSidebar(sidebar, menuIcon, closeBtn, getSidebarWidth) {
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

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0px' && sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth();
        }
    });
}

export function initializePage(container, noBookingsMessage, seeMoreButton) {
    fetchBookings().then((bookings) => {
        if (bookings) {
            displayBookings(container, bookings, noBookingsMessage, seeMoreButton);
        }
    });
}

