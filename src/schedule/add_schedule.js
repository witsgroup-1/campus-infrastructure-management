document.addEventListener('DOMContentLoaded', function () {
    const scheduleForm = document.getElementById('schedule_form');
    const recurringSelect = document.getElementById('recurring-select');
    const lastDate = document.getElementById('last-date'); 
    //const venue = document.getElementById('venue');
    const venueInput = document.querySelector('input[placeholder="Venue"]');
    const venueDropdown = document.getElementById('venue-dropdown'); 

    // Event listener to show/hide the last date field based on 'Recurring' selection
    recurringSelect.addEventListener('change', function () {
        if (this.value === 'true') {
            lastDate.style.display = 'flex';
        } else {
            lastDate.style.display = 'none';
        }
    });

    venueInput.addEventListener('input', async function () {
        const query = this.value;
    
        if (query.length > 0) {
            venueDropdown.classList.remove('hidden');
            venueDropdown.innerHTML = ''; 
    
            try {
                const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/venues?name=${query}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                    },
                });
    
                if (!response.ok) throw new Error('Failed to fetch venues');
    
                const venues = await response.json();
                console.log('Fetched venues:', venues);

                venues.forEach(venue => {
                    const option = document.createElement('option');
                    option.value = venue.id;
                    option.textContent = venue.Name; 
                    venueDropdown.appendChild(option);
                });
    
                if (venues.length === 0) {
                    venueDropdown.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error fetching venues:', error);
            }
        } else {
            venueDropdown.classList.add('hidden');
        }
    });
    
    venueDropdown.addEventListener('change', function () {
        const selectedVenue = this.options[this.selectedIndex];
        venueInput.value = selectedVenue.text; 
        venueDropdown.classList.add('hidden'); 
        venueInput.dataset.venueId = selectedVenue.value; 
    });
    
    scheduleForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const userId = document.getElementById('name').value.trim();
        const courseId = document.getElementById('course').value.trim();
        const roomId = document.getElementById('venue').value.trim();
        const daysOfWeek = document.getElementById('day').value;
        const startTime = document.getElementById('time_from').value;
        const endTime = document.getElementById('time_to').value;
        const startDate = document.getElementById('date').value;
        const recurring = recurringSelect.value.trim();
        let endDate = document.getElementById('end-date').value;

        // Set endDate to empty if not recurring
        if (!endDate && recurring === 'false') {
            endDate = '';
        }

        // Check if any required field is empty
        if (!userId || !courseId || !roomId || !daysOfWeek || !startTime || !endTime || !startDate || (recurring === 'true' && !endDate)) {
            alert('Please fill in all required fields!');
            return;
        }

        try {
            // Use Promise.all to handle both POST requests simultaneously
            await Promise.all([
                createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime),
                createBookingsForRecurring(userId, roomId, startDate, startTime, endTime, courseId, recurring, endDate)
            ]);

            alert('Schedule and booking successfully created!');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the schedule or booking.');
        }
    });

});

function generateId() {
    return 'id-' + Date.now(); // Generates a simple unique ID based on timestamp
}
const sharedId = generateId();

// POST schedules
async function createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime) {
    const scheduleData = {
        id: sharedId, // Use sharedId for the schedule
        userId,
        courseId,
        roomId,
        daysOfWeek,
        startTime,
        endTime,
        startDate,
        recurring,
        endDate
    };

    const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/schedules', {
        method: 'POST',
        headers: {
            'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW', 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
    });

    if (!response.ok) {
        throw new Error('Error creating schedule');
    }

    return await response.json();
}

// POST bookings
async function createBookingsForRecurring(userId, roomId, startDate, startTime, endTime, purpose, recurring, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Create only a single booking if not recurring
    if (recurring === 'false') {
        await createBooking(userId, roomId, startDate, startTime, endTime, purpose);
        return;
    }
    
    // Create bookings for each week if recurring is true
    let currentDate = start;
    while (currentDate <= end) {
        const date = currentDate.toISOString().split('T')[0]; 
        await createBooking(userId, roomId, date, startTime, endTime, purpose);
        currentDate.setDate(currentDate.getDate() + 7);
    }
}

// Create individual booking
async function createBooking(userId, roomId, date, start_time, end_time, purpose) {
    const bookingData = {
        id: sharedId, 
        userId,
        roomId,
        start_time, 
        end_time,
        date,
        purpose,
        status: 'Pending',
        venueId: roomId
    };

    console.log(bookingData); 
    
    try {
        const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/bookings', {
            method: 'POST',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (jsonError) {
                errorData = await response.text();
            }
            console.error(`Booking creation failed with status ${response.status}:`, errorData);
            throw new Error(`Error creating booking: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Booking created successfully:`, result);
    } catch (error) {
        console.error('Error occurred during booking creation:', error);
    }
}

