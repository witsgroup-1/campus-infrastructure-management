document.addEventListener('DOMContentLoaded', function() {
    const monthYear = document.getElementById('month-year');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonth = document.getElementById('prev-month');
    const nextMonth = document.getElementById('next-month');
    const modal = document.getElementById('date-modal'); 
    const modalDate = document.getElementById('modal-date'); 
    const closeModal = document.getElementById('close-modal');
    
    let currentDate = new Date();
    const today = new Date(); // Get today's full date
    const current_day = today.getDate(); // Get today's day of the month

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

            if (day === current_day && year === today.getFullYear() && month === today.getMonth()) {
                dayElement.classList.add('bg-[#003B5C]', 'text-white', 'hover:bg-[#01517d]');
            } else {
                dayElement.classList.add('hover:bg-gray-200', 'text-gray-800');
            }

            // Add click event listener to show popup
            dayElement.addEventListener('click', function() {
                modalDate.textContent = `Your schedule for ${month + 1}/${day}/${year}`;
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

  