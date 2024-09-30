document.addEventListener('DOMContentLoaded', function () {
    const scheduleForm = document.getElementById('schedule_form');
    const recurringSelect = document.getElementById('recurring-select');
    const lastDate = document.getElementById('last-date'); 
   // const venue = document.getElementById('venue');
   const venueDropdown = document.getElementById('venue-dropdown');
    const venueInput = document.querySelector('input[placeholder="Venue"]'); 
    //const search = document.getElementById('search-results');

    // Event listener to show/hide the last date field based on 'Recurring' selection
    recurringSelect.addEventListener('change', function () {
        if (this.value === 'true') {
            lastDate.style.display = 'flex';
        } else {
            lastDate.style.display = 'none';
        }
    });


      // Function to handle venue input changes and fetch matching venues
  venueInput.addEventListener('input', async (event) => {
    const query = event.target.value;

    if (query.length >= 2) {
      try {
        const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/venues?name=${query}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch venues');
        const venues = await response.json();
        updateVenueDropdown(venues);
      } catch (error) {
        clearVenueDropdown();
        //console.error('Error fetching venues:', error);
      }
    } else {
      clearVenueDropdown();
    }
  });

  // Function to update the dropdown with fetched venues
  function updateVenueDropdown(venues) {
    clearVenueDropdown();
    if (venues.length > 0) {
      venues.forEach(venue => {
        const option = document.createElement('option');
        option.textContent = venue.Name;
        option.dataset.id = venue.id; // Store the venue ID in dataset
        venueDropdown.appendChild(option);
      });
      venueDropdown.classList.remove('hidden');
    } else {
      clearVenueDropdown();
    }
  }

  // Handle selection from the dropdown
  venueDropdown.addEventListener('click', (event) => {
    if (event.target.tagName === 'OPTION') {
      const selectedOption = event.target;
      const venueId = selectedOption.dataset.id;
      const venueName = selectedOption.textContent;

      venueInput.value = venueName; // Update input field with selected name
      venueInput.dataset.venueId = venueId; // Store the selected venue ID
      clearVenueDropdown(); // Clear dropdown after selection
    }
  });

  // Function to clear the dropdown
  function clearVenueDropdown() {
    venueDropdown.innerHTML = ''; // Clear dropdown content
    venueDropdown.classList.add('hidden'); // Hide dropdown
  }

    // Attach event listener to the form submission
    scheduleForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Gather form values
        const userId = document.getElementById('name').value.trim();
        const courseId = document.getElementById('course').value.trim();
        const roomId = document.getElementById('venue-dropdown').value.trim();
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
            'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
    });

    if (!response.ok) {
        throw new Error('Error creating schedule');
    }

    return await response.json();
}

async function createBookingsForRecurring(userId, roomId, startDate, startTime, endTime, purpose, recurring, endDate) {
    // Convert startDate and endDate to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Create only a single booking if not recurring
    if (recurring === 'false') {
        await createBooking(userId, roomId, startDate, startTime, endTime, purpose);
        return;
    }
    
    // Create bookings for each week if recurring is true
    else {
        let currentDate = start;
        while (currentDate <= end) {
            const dateString = currentDate.toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'

            // Store time as strings directly
            const formattedStartTime = startTime;  // Assuming startTime is already in string format
            const formattedEndTime = endTime;      // Assuming endTime is already in string format

            await createBooking(userId, roomId, dateString, formattedStartTime, formattedEndTime, purpose);
            
            // Move to the next week
            currentDate.setDate(currentDate.getDate() + 7);
        }
    }
}


// POST single booking
async function createBooking(userId, roomId, date, start_time, end_time, purpose) {
    // Ensure the date and time values are strings
    const bookingData = {
        userId,
        roomId,
        date: date.toString(),           // Ensure date is a string
        start_time: start_time.toString(),  // Ensure start_time is a string
        end_time: end_time.toString(),      // Ensure end_time is a string
        purpose,
        status: 'Pending',
        venueId: roomId // Assuming venueId and roomId are the same
    };

    console.log(bookingData); // Log booking data for debugging

    try {
        const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/Bookings', {
            method: 'POST',
            headers: {
                'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
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



