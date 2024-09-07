
// mock data
const bookings = [
    {
        id: 1,
        roomType: 'Lecture Hall',
        roomName: 'CLM102',
        status: 'confirmed',
        date: '2024-05-01',
        time: '10:00 AM - 12:00 PM'
    },
    {
        id: 2,
        roomType: 'Tutorial Room',
        roomName: 'WSS105',
        status: 'pending',
        date: '2024-05-02',
        time: '1:00 PM - 3:00 PM'
    },

    {
        id: 4,
        roomType: 'Lecture Hall',
        roomName: 'CLM302',
        status: 'confirmed',
        date: '2024-05-01',
        time: '10:00 AM - 12:00 PM'
    },
    {
        id: 5,
        roomType: 'Tutorial Room',
        roomName: 'WSS705',
        status: 'pending',
        date: '2024-05-02',
        time: '1:00 PM - 3:00 PM'
    },
    
];

// Function to render bookings based on current filters
function renderBookings() {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = ''; // Clear existing bookings

    const statusFilter = document.getElementById('statusFilter').value;
    const roomFilter = document.getElementById('roomFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    // Filter bookings based on selected filters and search query
    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = statusFilter ? booking.status === statusFilter : true;
        const matchesRoom = roomFilter ? booking.roomType === roomFilter : true;
        const matchesSearch = booking.roomName.toLowerCase().includes(searchQuery);
        return matchesStatus && matchesRoom && matchesSearch;
    });

    if (filteredBookings.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No bookings found.</p>';
        return;
    }

    // Create booking boxes
    filteredBookings.forEach(booking => {
        const bookingBox = document.createElement('div');
        bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

        // Room Info
        const roomInfo = document.createElement('div');
        roomInfo.className = 'flex-shrink-0';
        roomInfo.innerHTML = `
            <h2 class="text-lg font-semibold">${booking.roomName}</h2>
            <p class="text-sm text-gray-600">Type: ${booking.roomType}</p>
            <p class="text-sm text-gray-600">Date: ${booking.date}</p>
            <p class="text-sm text-gray-600">Time: ${booking.time}</p>
        `;
        bookingBox.appendChild(roomInfo);


        const actionButtons = document.createElement('div');
        actionButtons.className = 'flex flex-row space-x-2';
        //if booking is confirmed edit/cancel
        if (booking.status === 'confirmed') {
            const editButton = document.createElement('button');
            editButton.className = 'bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
            editButton.textContent = 'Edit';
            

            const cancelButton = document.createElement('button');
            cancelButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none';
            cancelButton.textContent = 'Cancel';
            

            actionButtons.appendChild(editButton);
            actionButtons.appendChild(cancelButton);
        } 
        
        //if booking is pending accept/reject
        else if (booking.status === 'pending') {

            const acceptButton = document.createElement('button');
            acceptButton.className = 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none';
            acceptButton.textContent = 'Accept';
            

            const rejectButton = document.createElement('button');
            rejectButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none';
            rejectButton.textContent = 'Reject';
            

            actionButtons.appendChild(acceptButton);
            actionButtons.appendChild(rejectButton);
        }

        bookingBox.appendChild(actionButtons);
        container.appendChild(bookingBox);
    });
}



document.getElementById('statusFilter').addEventListener('change', renderBookings);
document.getElementById('roomFilter').addEventListener('change', renderBookings);
document.getElementById('searchInput').addEventListener('input', renderBookings);

// Initial render
document.addEventListener('DOMContentLoaded', renderBookings);