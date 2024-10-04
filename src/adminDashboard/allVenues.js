import { FirebaseConfig } from '../FirebaseConfig.js';
import { getDocs, collection, query, where} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

let bookings = [];

const db = new FirebaseConfig().getFirestoreInstance();
const url = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';

fetch(url, {
    method: 'GET',
    headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',  // Replace with your actual API key
        'Content-Type': 'application/json'
    }
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    bookings = data;  // Store fetched venues in the bookings array
    console.log(bookings);
    renderBookings();  // Render bookings after fetching data
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
  });


  function renderBookings() {
    const container = document.getElementById('bookingsContainer');
    const loader = document.getElementById('loader');

   
    loader.style.display = "block";
    container.innerHTML = ''; 

    const categoryFilter = document.getElementById('roomFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    
    const filteredBookings = bookings.filter(booking => {
        const matchesCategory = categoryFilter ? booking.Category === categoryFilter : true;
        const matchesSearch = booking.Name && booking.Name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    setTimeout(() => {
        loader.style.display = "none";
        
        if (filteredBookings.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No venues found.</p>';
            return;
        }

        filteredBookings.forEach(booking => {
            const bookingBox = document.createElement('div');
            bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

            const bookingInfo = document.createElement('div');
            bookingInfo.className = 'flex-shrink-0';
            bookingInfo.innerHTML = `
                <h2 class="text-lg font-semibold">${booking.Name || 'Unknown Name'}</h2>
                <p class="text-sm text-gray-600">Category: ${booking.Category || 'Unknown Category'}</p>
            `;
            bookingBox.appendChild(bookingInfo);

            const actionButtons = document.createElement('div');
            actionButtons.className = 'flex flex-row space-x-2';

            const bookButton = document.createElement('button');
            bookButton.className = 'bg-[#917248] text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
            bookButton.textContent = 'Status';
            
            bookButton.onclick = async function() {
                const bookingId = booking.id;
                const maintenanceRequestsRef = collection(db, 'maintenanceRequests');
            
                try {
                    const q = query(maintenanceRequestsRef, where('roomId', '==', bookingId));
                    const querySnapshot = await getDocs(q);

                    let statusMessage;
                    let issueType;
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            statusMessage = `Status: ${data.status}`;
                            issueType = `Issue: ${data.issueType}`;
                        });
                    } else {
                        statusMessage = 'Status: Available (No Maintenance Scheduled)';
                        issueType = '';
                    }

                    showModal(statusMessage, issueType);

                } catch (error) {
                    console.error('Error fetching maintenance status:', error);
                }
            };

            actionButtons.appendChild(bookButton);
            bookingBox.appendChild(actionButtons);
            container.appendChild(bookingBox);
        });
    }, 1000);
}


function showModal(statusMessage, issueType) {
  const modal = document.createElement('div');
  modal.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50';

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-white p-6 rounded-lg text-center';

 
  const statusText = document.createElement('p');
  statusText.textContent = statusMessage;

  const issueText = document.createElement('p');
  issueText.textContent = issueType;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.className = 'bg-red-500 text-white px-4 py-2 rounded mt-4 hover:bg-red-700';
  closeButton.onclick = function() {
      document.body.removeChild(modal); 
  };

  
  modalContent.appendChild(statusText);
  modalContent.appendChild(issueText);
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}


// Attach event listeners to filters and search input
document.getElementById('roomFilter').addEventListener('change', renderBookings);
document.getElementById('searchInput').addEventListener('input', renderBookings);

// Initial render after DOM content loads
document.addEventListener('DOMContentLoaded', renderBookings);
