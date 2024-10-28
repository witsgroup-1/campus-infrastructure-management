import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs,getDoc,doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const venuesUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/venues'; 
let venues=[];

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
let allBookings =[];


let currentPage = 1;
const PAGE_SIZE = 10;

function searchBookings() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const filteredBookings = allBookings.filter(booking => {
      const venueInfo = getRoomInfo(booking.venue_id);
      const venueName = venueInfo ? venueInfo.Name.toLowerCase() : "";
      return venueName.includes(searchInput); // Filter by venue name
  });

  currentPage = 1; // Reset to the first page on search
  displayBookings(filteredBookings); // Display filtered bookings
}

// Attach event listener to the search input
document.getElementById("searchInput").addEventListener("input", searchBookings);




// Fetch all users
export const fetchUsers = async () => {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

function toggleLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.toggle('hidden', !show);
    }

    // Disable/enable UI elements during loading

    document.getElementById('searchInput').disabled = show;
}

// Fetch bookings for a specific user
export const fetchBookingsForUser = async (userId) => {
  const bookingsRef = collection(db, `users/${userId}/bookings`);
  const bookingsSnapshot = await getDocs(bookingsRef);
  const bookingsList = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      userId, // Add the userId to each booking object
      ...doc.data()
  }));
  return bookingsList;
};


function fetchVenues() {
    return fetch(venuesUrl, {
      method: 'GET',
      headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      venues = data; 
      //console.log(venues); 
    })
    .catch(error => {
      console.error('Error fetching venues:', error);
    });
  }

// Function to get the venue info based on venueId
function getRoomInfo(venueId) {

    for(let i=0;i<venues.length;i++){
      if(venueId==venues[i].id){
        //console.log(venues[i]);
        return venues[i];
      }
      
    }
  }



// Display bookings in the HTML
function formatDate(seconds) {
  if (!seconds) return "N/A"; // Handle cases where seconds is undefined
  const date = new Date(seconds * 1000); // Convert seconds to milliseconds

  const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', optionsDate); // Format the date
}

function formatTime(seconds) {
  if (!seconds) return "N/A"; // Handle cases where seconds is undefined
  const date = new Date(seconds * 1000); // Convert seconds to milliseconds

  const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false }; // 24-hour format
  return date.toLocaleTimeString('en-US', optionsTime); // Format the time
}

const displayBookings = (bookings) => {
  const bookingsContainer = document.getElementById("bookingsContainer");
  bookingsContainer.innerHTML = ""; // Clear previous bookings

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedBookings = bookings.slice(startIndex, endIndex);

  paginatedBookings.forEach(booking => {
    const cancelButton = document.createElement('button');
    cancelButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
    cancelButton.textContent = 'Cancel';

    const startTime = formatTime(booking.start_time?.seconds);
    const endTime = formatTime(booking.end_time?.seconds);
    const startDate = formatDate(booking.start_time?.seconds);
    const endDate = formatDate(booking.end_time?.seconds);

    const venueInfo = getRoomInfo(booking.venue_id);
    const venueName = venueInfo ? venueInfo.Name : "Unknown Venue";

    cancelButton.onclick = async function() {
      const confirmation = window.confirm("Are you sure you want to cancel this booking?");
      if (!confirmation) return;

      const cancellationReason = window.prompt("Please enter a reason for the cancellation:");
      if (!cancellationReason) {
        alert("Cancellation reason is required to proceed.");
        return;
      }

      try {
        const url = `https://campus-infrastructure-management.azurewebsites.net/api/users/${booking.userId}/bookings/${booking.id}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
            'Content-Type': 'application/json'
          },
          
        });

        if (!response.ok) throw new Error('Failed to delete booking, please try again.');

        const notificationMessage = `Your booking for ${venueName} on ${startDate} for ${booking.purpose} has been cancelled by administrators. Reason: ${cancellationReason}.We apologize for the inconvenience caused.Please try to book another venue`;

        const userNotificationUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${booking.userId}/notifications`;
        await fetch(userNotificationUrl, {
          method: 'POST',
          headers: {
            'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: notificationMessage,
            type: "notification",
            sendAt: "09:00"
          })
        });

        alert("Booking successfully cancelled and user notified.")
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    };

    const bookingBox = document.createElement("div");
    bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

    const roomDetails = document.createElement('div');
    roomDetails.className = 'flex-shrink-0';
    roomDetails.innerHTML = `
      <h2 class="text-lg font-semibold">${venueName}</h2>
      <p><strong>Date:</strong> ${startDate}</p>
      <p><strong>Start Time:</strong> ${startTime}</p>
      <p><strong>End Time:</strong> ${endTime}</p>
      <p><strong>Purpose:</strong> ${booking.purpose || "N/A"}</p>
    `;

    bookingBox.appendChild(roomDetails);
    bookingBox.appendChild(cancelButton);
    bookingsContainer.appendChild(bookingBox);
  });

  updatePaginationControls(bookings.length); // Update controls with total bookings
};




document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) goToPage(currentPage - 1);
});

document.getElementById("nextPage").addEventListener("click", () => {
  const filteredBookings = allBookings.filter(booking => {
    const venueInfo = getRoomInfo(booking.venue_id);
    return venueInfo?.Name.toLowerCase().includes(document.getElementById("searchInput").value.toLowerCase());
  });
  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE);
  if (currentPage < totalPages) goToPage(currentPage + 1);
});



const updatePaginationControls = (totalBookings) => {
  const totalPages = Math.ceil(totalBookings / PAGE_SIZE);
  document.getElementById("currentPage").textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1; // Disable previous button on first page
  document.getElementById("nextPage").disabled = currentPage === totalPages; // Disable next button on last page
};


// Function to handle page navigation
// Function to handle page navigation
const goToPage = (page) => {
  currentPage = page;
  const filteredBookings = allBookings.filter(booking => {
      const venueInfo = getRoomInfo(booking.venue_id);
      const venueName = venueInfo ? venueInfo.Name.toLowerCase() : "";
      return venueName.includes(document.getElementById("searchInput").value.toLowerCase()); // Keep current filter
  });
  displayBookings(filteredBookings); // Display bookings for the new page
};

// Attach event listeners for pagination buttons
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
      goToPage(currentPage - 1);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const filteredBookings = allBookings.filter(booking => {
      const venueInfo = getRoomInfo(booking.venue_id);
      const venueName = venueInfo ? venueInfo.Name.toLowerCase() : "";
      return venueName.includes(document.getElementById("searchInput").value.toLowerCase()); // Keep current filter
  });
  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE);
  if (currentPage < totalPages) {
      goToPage(currentPage + 1);
  }
});







// Main function to load all bookings
const loadAllBookings = async () => {
  toggleLoading(true); // Show loader at the start
  try {
      await fetchVenues();
      const users = await fetchUsers();
      allBookings = [];

      for (const user of users) {
          const bookings = await fetchBookingsForUser(user.id);
          bookings.forEach(booking => {
              booking.userId = user.id; // Add user ID to each booking for reference
          });
          allBookings = allBookings.concat(bookings); // Combine all bookings
      }

      displayBookings(allBookings); // Show initial list of bookings
  } catch (error) {
      console.error("Error fetching bookings: ", error);
  } finally {
      toggleLoading(false); 
  }
};


async function editBooking(booking) {
    window.location.href = `editBooking.html?booking=${booking}`;
   await fetchBookings();
  }

// Load all bookings when the script is executed

loadAllBookings();
