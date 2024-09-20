document.addEventListener('DOMContentLoaded', function() {
    const recurringSelect = document.getElementById('recurring-select');
    const datesSelect = document.getElementById('last-date');
    const scheduleForm = document.getElementById('schedule_form');

    if (!scheduleForm) {
        console.error('Form element not found!');
        return;
    }

    // Show/hide last date field based on 'Recurring' selection
    recurringSelect.addEventListener('change', function() {
        if (this.value === 'true') {
            datesSelect.style.display = 'flex';
        } else {
            datesSelect.style.display = 'none';
        }
    });

    // Attach event listener to the form submission
    scheduleForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userId = document.getElementById('name').value.trim();
        const courseId = document.getElementById('course').value.trim();
        const roomId = document.getElementById('venue').value.trim();
        const daysOfWeek = document.getElementById('day').value.trim();
        const startTime = document.getElementById('time_from').value.trim();
        const endTime = document.getElementById('time_to').value.trim();
        const startDate = document.getElementById('date').value.trim();
        const recurring = document.getElementById('recurring-select').value.trim();
        let endDate = document.getElementById('end-date').value.trim();

        if (!endDate && recurring === 'false') {
            endDate = '';
        }

        // Check if any required field is empty
        if (!userId || !courseId || !roomId || !daysOfWeek || !startTime || !endTime || !startDate || (recurring === 'yes' && !endDate)) {
            alert('Please fill in all required fields!');
            return;
        }

        await createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime);

        alert('Schedule(s) successfully created!');
    });


    // Helper function to send the API request
    async function createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime) {
        const scheduleData = {
            userId,
            courseId,
            roomId,
            daysOfWeek, // Send the current date as the day of the week
            startTime,
            endTime,
            startDate,
            recurring,
            endDate
        };

        try {
            const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/schedules', {
                method: 'POST',
                headers: {
                    'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scheduleData)
            });

            if (!response.ok) {
                throw new Error('Error creating schedule for ' + date);
            }

            const result = await response.json();
            console.log(`Schedule for ${date} created successfully:`, result);
        } catch (error) {
            console.error('Error:', error);
        }
    }
});



