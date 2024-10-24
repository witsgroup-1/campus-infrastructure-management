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

const venuesPerPage = 10; 
let currentPage = 1

function renderBookings() {
    const container = document.getElementById('bookingsContainer');
    const categoryFilter = document.getElementById('roomFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    const filteredBookings = bookings.filter(booking => {
        const matchesCategory = categoryFilter ? booking.Category === categoryFilter : true;
        const matchesSearch = booking.Name && booking.Name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(filteredBookings.length / venuesPerPage);

    // Ensure currentPage is within bounds
    if (currentPage > totalPages) {
        currentPage = totalPages;
    } else if (currentPage < 1) {
        currentPage = 1;
    }

    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * venuesPerPage, 
        currentPage * venuesPerPage
    );

    setTimeout(() => {
        container.innerHTML = '';
        if (paginatedBookings.length === 0) {
            toggleLoading(false);
            return; 
        }

        paginatedBookings.forEach(booking => {
            const bookingBox = document.createElement('div');
            bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

            const infoWrapper = document.createElement('div');
            infoWrapper.className = 'flex items-center justify-between w-full flex-wrap';


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
                    let statusMessage = 'Status: Available (No Maintenance Scheduled)'; 
                    let issueType = '';

                    if (!querySnapshot.empty) {
                        let hasActiveMaintenance = false;
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            if (data.status === 'In Progress' || data.status === 'Scheduled') {
                                statusMessage = `Status: Under Maintenance`;
                                issueType = `Issue: ${data.issueType}`;
                                hasActiveMaintenance = true; 
                            }
                        });
                    }
                    showModal(statusMessage, issueType);
                } catch (error) {
                    console.error('Error fetching maintenance status:', error);
                }
            };
            actionButtons.appendChild(bookButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 focus:outline-none';
            deleteButton.textContent = 'Delete';
            
            deleteButton.onclick = async function() {
                const bookingId = booking.id;
                const confirmed = confirm(`Are you sure you want to delete this venue: ${booking.Name}?`);
                if (confirmed) {
                    try {
                        await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/venues/${bookingId}`, { method: 'DELETE', headers: {'x-api-key': API_KEY }});
                        alert('Venue deleted successfully.');
                        renderBookings(); 
                    } catch (error) {
                        console.error('Error deleting the venue:', error);
                        alert('Failed to delete the venue.');
                    }
                }
            };
            actionButtons.appendChild(deleteButton);

            
            const editButton = document.createElement('button');
            editButton.className = 'bg-[#003B5C] text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none';
            editButton.textContent = 'Edit';

            editButton.onclick = async function() {
                const bookingId = booking.id;
                const newName = prompt('Enter the new venue name:', booking.Name);

                if (newName) {
                    try {
                        const updatedBooking = {
                            Name: newName,
                        };

                        await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/venues/${bookingId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': API_KEY
                            },
                            body: JSON.stringify(updatedBooking),
                        });

                        alert('Venue updated successfully.');
                        renderBookings();
                    } catch (error) {
                        console.error('Error updating the venue:', error);
                        alert('Failed to update the venue.');
                    }
                }
            };
            actionButtons.appendChild(editButton);

            infoWrapper.appendChild(bookingInfo);
            infoWrapper.appendChild(actionButtons);
            bookingBox.appendChild(infoWrapper);
            container.appendChild(bookingBox);
        });

        updatePaginationControls(totalPages);

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
    const roomFilter = document.getElementById('roomFilter');
    const searchInput = document.getElementById('searchInput');
    if (roomFilter) roomFilter.disabled = show;
    if (searchInput) searchInput.disabled = show;
}

function updatePaginationControls(totalPages) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const paginationInfo = document.getElementById('pageInfo');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderBookings();
    }
});


document.getElementById('nextPage').addEventListener('click', () => {
    const totalFilteredBookings = bookings.filter(booking => {
        const categoryFilter = document.getElementById('roomFilter').value;
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const matchesCategory = categoryFilter ? booking.Category === categoryFilter : true;
        const matchesSearch = booking.Name && booking.Name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(totalFilteredBookings.length / venuesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderBookings();
    }
});


document.getElementById('roomFilter').addEventListener('change', () => {
    currentPage = 1; 
    renderBookings();
});

document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    renderBookings();
});



document.addEventListener('DOMContentLoaded', () => {
    toggleLoading(true);
    renderBookings();
});

const API_KEY = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";