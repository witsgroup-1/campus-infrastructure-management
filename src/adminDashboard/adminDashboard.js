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

       
        // function displayMaintenanceRequests(requests) {
        //     const container = document.getElementById('maintenanceRequests');
        //     container.innerHTML = '';

        //     requests.slice(0, 2).forEach((request) => {
        //         const requestElement = document.createElement('div');
        //         requestElement.className = 'bg-custom-light-blue p-4 flex justify-between items-center rounded';
        //         requestElement.innerHTML = `
        //             <span class="font-inter text-[16px]">${request.description}</span>
        //             <div>
        //                 <button onclick="handleMaintenanceAction('assign', ${request.id})" class="font-inter font-normal text-[20px] text-black hover:text-blue-600 focus:text-blue-600 focus:outline-none mr-2">Assign</button>
        //                 <button onclick="handleMaintenanceAction('track', ${request.id})" class="font-inter font-normal text-[20px] text-black hover:text-blue-600 focus:text-blue-600 focus:outline-none mr-2">Track</button>
        //                 <button onclick="handleMaintenanceAction('update', ${request.id})" class="font-inter font-normal text-[20px] text-black hover:text-blue-600 focus:text-blue-600 focus:outline-none">Update</button>
        //             </div>
        //         `;
        //         container.appendChild(requestElement);
        //     });
        // }

        /*function displayMaintenanceRequests(requests) {
            const container = document.getElementById('reports-container');
            const noReportsMessage = document.getElementById('no-bookings-message');
            
            // Clear previous requests
            container.innerHTML = '';
        
            // Check if there are requests
            if (requests.length === 0) {
                noReportsMessage.classList.remove('hidden');
                return; // Exit if there are no requests
            } else {
                noReportsMessage.classList.add('hidden'); // Hide message if there are requests
            }
        
            // Display requests, limit to 2
            requests.slice(0, 2).forEach((request) => {
                const requestElement = document.createElement('div');
                requestElement.className = 'bg-custom-light-blue p-4 flex justify-between items-center rounded';
                requestElement.innerHTML = `
                    <span class="font-inter text-[16px]">${request.description}</span>
                    <div>
                        <button onclick="handleMaintenanceAction('assign', ${request.id})" class="font-inter font-normal text-[20px] text-black hover:text-blue-600 focus:text-blue-600 focus:outline-none mr-2">Assign</button>
                        <button onclick="handleMaintenanceAction('track', ${request.id})" class="font-inter font-normal text-[20px] text-black hover:text-blue-600 focus:text-blue-600 focus:outline-none mr-2">Track</button>
                        <button onclick="handleMaintenanceAction('update', ${request.id})" class="font-inter font-normal text-[20px] text-black hover:text-blue-600 focus:text-blue-600 focus:outline-none">Update</button>
                    </div>
                `;
                container.appendChild(requestElement);
            });
        }*/

            async function fetchBookings() {
                const data = await fetchData('/Bookings');
                if (data) {
                    displayBookings(data);
                }
            }
        

        function displayBookings(bookings) {
            const container = document.getElementById('bookings-container');
            const noBookingsMessage = document.getElementById('no-bookings-message');
            const seeMoreButton = document.getElementById('see-more-button');
            
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
        
        //commented this out i dont understand what it does.
        /*function displaySchedules(schedules) {
            const container = document.getElementById('schedulesList');
            container.innerHTML = '';

            schedules.slice(0, 2).forEach((schedule) => {
                const scheduleElement = document.createElement('div');
                scheduleElement.className = 'bg-custom-light-blue p-4 flex justify-between items-center rounded';
                scheduleElement.innerHTML = `
                    <span class="font-inter text-[16px]">
                        Room: ${schedule.roomId}, Course: ${schedule.courseId}, 
                        Time: ${schedule.startTime} - ${schedule.endTime}
                    </span>
                    <div>
                        <button onclick="handleScheduleAction('edit', '${schedule.scheduleId}')" class="font-inter font-normal text-[20px] text-black hover:text-blue-600 focus:text-blue-600 focus:outline-none mr-2">Edit</button>
                        <button onclick="handleScheduleAction('delete', '${schedule.scheduleId}')" class="font-inter font-normal text-[20px] text-black hover:text-red-600 focus:text-red-600 focus:outline-none">Delete</button>
                    </div>
                `;
                container.appendChild(scheduleElement);
            });
        }*/

        // function handleMaintenanceAction(action, requestId) {
        //     console.log(`${action} action for maintenance request ${requestId}`);
        //     // Implement the logic for each action (assign, track, update) here
        // }

        function handleBookingAction(action, bookingId) {
            console.log(`${action} action for booking ${bookingId}`);
            // Implement the logic for each action (accept, reject) here
        }

        function handleScheduleAction(action, scheduleId) {
            console.log(`${action} action for schedule ${scheduleId}`);
            // Implement the logic for each action (edit, delete) here
        }

        // Fetch data when the page loads
        //fetchMaintenanceRequests();
        fetchBookings();
        //fetchSchedules();

document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const mainButton = document.getElementById('main-button');
    const reportButton = document.getElementById('report-button');
    const scheduleButton = document.getElementById('schedule-button');
    const bookButton = document.getElementById('book-button');
    const whitelistButton = document.getElementById('request-button');


    const userEmail = localStorage.getItem('userEmail');
    const userId= localStorage.getItem('userId');

    if (userEmail) {
        console.log('User email:', userEmail);
        console.log("userId:",userId);
        // Use the email (e.g., display it, use it in queries, etc.)
        document.getElementById('userEmailDisplay').textContent = `Logged in as: ${userEmail}`;
    } else {
        console.log('No email found');
    }

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

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0px' && sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth();
        }
    });


    let isExpanded = false;

    mainButton.addEventListener('click', () => {
        if (!isExpanded) {
            reportButton.classList.remove('hidden');
            bookButton.classList.remove('hidden');
            scheduleButton.classList.remove('hidden');
            whitelistButton.classList.remove('hidden');

            isExpanded = true;
        } else {
            reportButton.classList.add('hidden');
            bookButton.classList.add('hidden');
            scheduleButton.classList.add('hidden');
            whitelistButton.classList.add('hidden');

            isExpanded = false;
        }
    });

    reportButton.addEventListener('click', () => {
        window.location.href = '../maintenance/maintenanceLogs.html';
    });

    bookButton.addEventListener('click', () => {
        window.location.href = '../manage-bookings/manageBookings.html';
    });

    scheduleButton.addEventListener('click', () => {
        window.location.href = '../schedule/add_schedule.html';
    });

    whitelistButton.addEventListener('click', () => {
        window.location.href = './allWhitelistRequests.html';
    });
});