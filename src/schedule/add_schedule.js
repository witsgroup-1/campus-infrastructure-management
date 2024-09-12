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
        if (this.value === 'yes') {
            datesSelect.style.display = 'flex';
        } else {
            datesSelect.style.display = 'none';
        }
    });

    // Attach event listener to the form submission
    scheduleForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const schedule_data = {
            userId: document.getElementById('name').value,
            courseId: document.getElementById('course').value,
            roomId: document.getElementById('venue').value,
            daysOfWeek: document.getElementById('day').value,
            startTime: document.getElementById('time_from').value,
            endTime: document.getElementById('time_to').value,
            startDate: document.getElementById('date').value,
            recurring: document.getElementById('recurring-select').value,
            endDate: document.getElementById('end-date').value // Ensure this ID matches your HTML
        };

        try {
            // Send the POST request to your backend API
            const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/schedules', {
                method: 'POST',
                headers: {
                    'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(schedule_data) // Send the schedule data as JSON
            });

            if (!response.ok) {
                throw new Error('Error creating schedule');
            }

            // Handle the success response
            const result = await response.json();
            console.log('Schedule created successfully:', result);
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

