document.addEventListener('DOMContentLoaded', function () {
    const scheduleForm = document.getElementById('schedule_form');
    const recurringSelect = document.getElementById('recurring-select');
    const lastDate = document.getElementById('last-date'); 
    //const venue = document.getElementById('venue');
    const venueInput = document.querySelector('input[placeholder="Venue"]');
    const venueId = venueInput.dataset.venueId; // Get the selected venue ID from dataset
    const venueName = venueInput.value; // Get venue name from input field
    const search = document.getElementById('search-results');

    // Event listener to show/hide the last date field based on 'Recurring' selection
    recurringSelect.addEventListener('change', function () {
        if (this.value === 'true') {
            lastDate.style.display = 'flex';
        } else {
            lastDate.style.display = 'none';
        }
    });

    /*venue.addEventListener('input', async function(){
        const room = this.value;
        search.innerHTML = '';

        try {
            const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/venues/search?q=${room}`, {
                method: 'GET',
                headers: {
                    'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            // Display search results
            data.results.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.name; // Customize based on API response
                searchResults.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching venue data:', error);
        }
    });*/

    // Attach event listener to the form submission
    scheduleForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Gather form values
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Create only a single booking if not recurring
    if (recurring === 'false') {
        await createBooking(userId, roomId, startDate, startTime, endTime, purpose);
        return;
    }
    
    // Create bookings for each week if recurring is true
    else{
        let currentDate = start;
        while (currentDate <= end) {
            const date = currentDate.toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'
            await createBooking(userId, roomId, date, startTime, endTime, purpose);
            currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
        }
    }
}

async function createBooking(userId, roomId, date, start_time, end_time, purpose) {

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

  console.log(bookingData); 
  
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


