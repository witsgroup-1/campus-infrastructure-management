let schedules = [];

// Fetch schedules from API with API key
fetch('https://campus-infrastructure-management.azurewebsites.net/api/schedules', {
    method: 'GET',
    headers: {
        'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
        'Content-Type': 'application/json'
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
})
.then(data => {
    schedules = data;
})
.catch(error => console.error('Error fetching schedules:', error));

document.addEventListener('DOMContentLoaded', function() {
    const monthYear = document.getElementById('month-year');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonth = document.getElementById('prev-month');
    const nextMonth = document.getElementById('next-month');
    const modal = document.getElementById('date-modal');
    //const dateElement = document.getElementById('modal-date');
    const venue = document.getElementById('venue');
    const course = document.getElementById('course');
    const time = document.getElementById('time');
    const closeModal = document.getElementById('close-modal');

    let currentDate = new Date();
    const today = new Date(); // Get today's full date
    const current_day = today.getDate(); // Get today's day of the month

// Combined function to handle calendar rendering and showing modal with schedule info
function calendar(date) {
    calendarDays.innerHTML = ''; // Clear the previous calendar
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYear.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty slots before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendarDays.appendChild(emptyDiv);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'p-2 cursor-pointer rounded-full';
        dayElement.textContent = day;

        const clickedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        // Highlight current day
        if (day === current_day && year === today.getFullYear() && month === today.getMonth()) {
            dayElement.classList.add('bg-[#003B5C]', 'text-white', 'hover:bg-[#01517d]');
        } else {
            dayElement.classList.add('hover:bg-gray-200', 'text-gray-800');
        }

        // Add click event listener to handle both modal display and schedule check
        dayElement.addEventListener('click', function() {
            const recurring = document.getElementById('recurring-select').value;
            const startDate = new Date(document.getElementById('date').value);
            let endDate = new Date(document.getElementById('end-date').value);

            let matchedSchedule = false;

            // Check if recurring is enabled
            if (recurring === 'yes') {
                let d = new Date(startDate); // Start with startDate
                while (d <= endDate) {
                    const recurringDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                    if (clickedDate === recurringDate) {
                        matchedSchedule = true;
                        break;
                    }
                    d.setDate(d.getDate() + 7); // Increment by a week
                }
            } else if (clickedDate === `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`) {
                matchedSchedule = true;
            }

            // Find the schedule based on clickedDate
            const schedule = schedules.find(s => s.startDate === clickedDate);

            if (matchedSchedule && schedule) {
                venue.textContent = `Venue: ${schedule.roomId}`;
                course.textContent = `Course: ${schedule.courseId}`;
                time.textContent = `Time: ${schedule.startTime} - ${schedule.endTime}`;
            } else {
                venue.textContent = "Venue: N/A";
                course.textContent = "Course: N/A";
                time.textContent = "Time: N/A";
            }

            modal.classList.remove('hidden');
        });

        calendarDays.appendChild(dayElement);
    }
}


    prevMonth.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        calendar(currentDate);
    });

    nextMonth.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        calendar(currentDate);
    });

    // Close modal on button click
    closeModal.addEventListener('click', function() {
        modal.classList.add('hidden');
    });

    calendar(currentDate);
});