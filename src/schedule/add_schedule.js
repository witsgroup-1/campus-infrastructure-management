document.addEventListener('DOMContentLoaded', function () {
    const scheduleForm = document.getElementById('schedule_form');
    const recurringSelect = document.getElementById('recurring-select');
    const lastDate = document.getElementById('last-date'); 
    const venueDropdown = document.getElementById('venue-dropdown');
    const venueInput = document.querySelector('input[placeholder="Venue"]')

    
    
    // Event listener to show/hide the last date field based on 'Recurring' selection
    recurringSelect.addEventListener('change', function () {
        if (this.value === 'true') {
            lastDate.style.display = 'flex';
        } else {
            lastDate.style.display = 'none';
        }
    });

    //input in the venue input field
    venueInput.addEventListener('input', async (event) => {
        const query = event.target.value;

        if (query.length >= 2) {
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
                updateVenueDropdown(venues, venueDropdown);
            } catch (error) {
                clearVenueDropdown(venueDropdown);
                console.error(error); 
            }
        } else {
            clearVenueDropdown(venueDropdown);
        }
    });
    
    venueDropdown.addEventListener('change', function () {
        const selectedVenue = this.options[this.selectedIndex];
        venueInput.value = selectedVenue.text; 
        venueInput.dataset.venueId = selectedVenue.value; 
        clearVenueDropdown(venueDropdown); 
    });

    const dateInput = document.getElementById('date'); 
    const dayInput = document.getElementById('day'); 

    dateInput.addEventListener('change', function () {
        const selectedDate = new Date(this.value); 
        const options = { weekday: 'long' }; 
        const dayName = selectedDate.toLocaleDateString('en-US', options);
        dayInput.value = dayName; 
    });

    // Schedule form submission handler
    scheduleForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const userId = localStorage.getItem("userEmail");
        const courseId = document.getElementById('course').value.trim();
        const roomId = venueInput.dataset.venueId; // Get venue ID from the input'
        const venue = venueInput.value;
        const daysOfWeek = dayInput.value; 
        const startTime = document.getElementById('time_from').value;
        const endTime = document.getElementById('time_to').value;
        let startDate = document.getElementById('date').value;
        const recurring = recurringSelect.value.trim();
        let endDate = document.getElementById('end-date').value;

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const today = new Date();

        // Set endDate to empty if not recurring
        if (!endDate && recurring === 'false') {
            endDate = '';
        }
    
        // Check if the start date is after today
        if (startDateObj <= today) {
            alert('Start date must be after today.');
            return;
        }
    
        // Check if the end date is after the start date
        if (endDateObj && endDateObj <= startDateObj) {
            alert('End date must be after start date.');
            return;
        }

        // Check if end date is provided and has the same day of the week as start date
        if (endDate.trim() !== '' && endDateObj.getDay() !== startDateObj.getDay()) {
            alert('End date must be on the same day of the week as the start date.');
            return;
        }

        // Check if any required field is empty
        if (!userId || !courseId || !venue || !daysOfWeek || !startTime || !endTime || !startDate || (recurring === 'true' && !endDate)) {
            alert('Please fill in all required fields!');
            return;
        }

        try {
            const hasOverlap = await checkForOverlappingSchedule(roomId, startDate, startTime, endTime);
            if (hasOverlap) {
                alert('This time slot is already booked. Please choose a different time.');
                return;
            }

            // Use Promise.all to handle both POST requests simultaneously
            await Promise.all([
                createSchedule(userId, courseId, venue, daysOfWeek, startDate, endDate, startTime, recurring, endTime),
                createBookingsForRecurring(userId, roomId, startDate, startTime, endTime, courseId, recurring, endDate)
            ]);

            alert('Schedule and booking successfully created!');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the schedule or booking.');
        }
    });

    function clearVenueDropdown(venueDropdown) {
        venueDropdown.innerHTML = ''; 
        venueDropdown.classList.add('hidden'); 
    }

    // Ensure dropdown is hidden initially
    clearVenueDropdown(venueDropdown);

    window.updateVenueDropdown = (venues, venueDropdown) => {
        clearVenueDropdown(venueDropdown);
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Please select a venue...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        venueDropdown.appendChild(defaultOption);
    
        if (venues.length > 0) {
            venues.forEach((venue) => {
                const option = document.createElement('option');
                option.textContent = venue.Name; // Ensure this is correct
                option.value = venue.id;         // Ensure this is correct
                venueDropdown.appendChild(option);
            });
            venueDropdown.classList.remove('hidden'); 
        } else {
            clearVenueDropdown(venueDropdown); 
        }
    };
    

    
});

async function checkForOverlappingSchedule(roomId, date, startTime, endTime) {
    try {
        const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/schedules?date=${date}&roomId=${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch existing schedules');

        const schedules = await response.json();

        for (const schedule of schedules) {
            const existingStartTime = new Date(`${date}T${schedule.startTime}`);
            const existingEndTime = new Date(`${date}T${schedule.endTime}`);
            const newStartTime = new Date(`${date}T${startTime}`);
            const newEndTime = new Date(`${date}T${endTime}`);

            if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
                return true; // Overlap detected
            }
        }
        return false; // No overlap
    } catch (error) {
        console.error('Error checking for overlapping schedules:', error);
        return false; // Allow creation if there's an error in the check
    }
}


// POST schedules
async function createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime) {
    const scheduleData = {
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

function convertToTimestamp(date, time = null) {
    const dateObj = new Date(date);

    if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        dateObj.setHours(hours, minutes, 0, 0);
    }

    const seconds = Math.floor(dateObj.getTime() / 1000);
    const nanoseconds = (dateObj.getTime() % 1000) * 1e6;

    return { seconds, nanoseconds };
}

async function createBooking(userId, roomId, date, start_time, end_time, purpose) {
    const startTimeTimestamp = convertToTimestamp(date, start_time);
    const endTimeTimestamp = convertToTimestamp(date, end_time);
    const createdAtTimestamp = convertToTimestamp(new Date().toISOString());

    const bookingData = {
        userId,
        roomId,
        start_time, 
        end_time,
        date,
        purpose,
        status: 'Pending',
        venueId: roomId
    };

    console.log("Main booking data:", bookingData);

    try {
        // Main booking API request
        const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/Bookings', {
            method: 'POST',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Booking creation failed with status ${response.status}:`, errorData);
            throw new Error(`Error creating booking: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Booking created successfully:`, result);

        // Venue subcollection booking API request
        const venueBookingData = {
                booker: userId,  // Assuming booker is the userId
                startTime: startTimeTimestamp,
                endTime: endTimeTimestamp,
                purpose,
                createdAt: createdAtTimestamp,  
                bookingDate: date  
        };

        console.log("Subcollection booking data:", venueBookingData);

        const venueResponse = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/venues/${roomId}/${date}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW'
            },
            body: JSON.stringify(venueBookingData)
        });

        if (!venueResponse.ok) {
            const venueErrorData = await venueResponse.json();
            console.error(`Venue booking creation failed with status ${venueResponse.status}:`, venueErrorData);
            throw new Error(`Error creating venue booking: ${venueResponse.statusText}`);
        }

        const venueResult = await venueResponse.json();
        console.log(`Subcollection booking created successfully:`, venueResult);

    } catch (error) {
        console.error('Error occurred during booking creation:', error);
    }
}
