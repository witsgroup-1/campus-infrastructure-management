document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = document.getElementById('schedule_form');
    const recurringSelect = document.getElementById('recurring-select');
    const lastDate = document.getElementById('last-date'); // Assuming this contains 'end-date'

    // Event listener to show/hide the last date field based on 'Recurring' selection
    recurringSelect.addEventListener('change', function() {
        if (this.value === 'true') {
            lastDate.style.display = 'flex';
        } else {
            lastDate.style.display = 'none';
        }
    });

    // Attach event listener to the form submission
    scheduleForm.addEventListener('submit', async function(event) {
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

        const date = document.getElementById('date').value;
        const start_time = document.getElementById('time_from').value;
        const end_time = document.getElementById('time_to').value;
        const purpose = document.getElementById('course').value;

        try {
            // Use Promise.all to handle both POST requests simultaneously
            await Promise.all([
                createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime),
                createBooking(userId, roomId, date, start_time, end_time, purpose)
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

// POST bookings
async function createBooking(userId, roomId, date, start_time, end_time, purpose) {
    const bookingData = {
        userId,
        roomId,
        start_time,
        end_time,
        date,
        purpose
    };

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
            // Try to parse the response as JSON, if that fails, treat it as text
            let errorData;
            try {
                errorData = await response.json();
            } catch (jsonError) {
                errorData = await response.text();  // Handle plain text response
            }
            console.error(`Booking creation failed with status ${response.status}:`, errorData);
            throw new Error(`Error creating booking: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Booking created successfully:`, result);
        return result;
    } catch (error) {
        console.error('Error occurred during booking creation:', error);
        throw error;
    }
}


