import { FirebaseConfig } from '../FirebaseConfig.js';
import { getDocs, collection, query, where} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

let bookings = [];

const db = new FirebaseConfig().getFirestoreInstance();
const url = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';

toggleLoading(true);

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
    bookings = data; 
    renderBookings();
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = '<p class="text-center text-red-500">Error fetching venues. Please try again.</p>';
});


function renderBookings() {
    const container = document.getElementById('bookingsContainer');

    const categoryFilter = document.getElementById('roomFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

   
    toggleLoading(true);

    
    const filteredBookings = bookings.filter(booking => {
        const matchesCategory = categoryFilter ? booking.Category === categoryFilter : true;
        const matchesSearch = booking.Name && booking.Name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

   
    setTimeout(() => {
        
        container.innerHTML = ''
        if (filteredBookings.length === 0) {
            toggleLoading(true);
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
            
                    // Default message assuming no maintenance
                    let statusMessage = 'Status: Available (No Maintenance Scheduled)'; 
                    let issueType = ''; // Default issueType
            
                    if (!querySnapshot.empty) {
                        // Check if any maintenance requests indicate ongoing issues
                        let hasActiveMaintenance = false;
            
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            if (data.status === 'In Progress' || data.status === 'Scheduled') {
                                statusMessage = `Status: Under Maintenance`;
                                issueType = `Issue: ${data.issueType}`;
                                hasActiveMaintenance = true; 
                            } else if (data.status === 'Completed') {
                                
                                statusMessage = 'Status: Available (No Maintenance Scheduled)';
                            }
                        });
            
                        // If there's no active maintenance but completed records exist
                        if (!hasActiveMaintenance && statusMessage === 'Status: Available (No Maintenance Scheduled)') {
                            statusMessage = 'Status: Available (No Maintenance Scheduled)';
                            issueType = ''; // Clear any issues
                        }
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

        
        toggleLoading(false); 
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

function toggleLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

   //disable/enable UI elements during loading
    const roomFilter = document.getElementById('roomFilter');
    const searchInput = document.getElementById('searchInput');
    if (roomFilter) roomFilter.disabled = show;
    if (searchInput) searchInput.disabled = show;
}


// Attach event listeners to filters and search input
document.getElementById('roomFilter').addEventListener('change', renderBookings);
document.getElementById('searchInput').addEventListener('input', renderBookings);

// Initial render after DOM content loads
document.addEventListener('DOMContentLoaded', renderBookings);
