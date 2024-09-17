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
    console.log("API is working fine");
    return response.json();
})
.then(data => {
    schedules = data;
    displaySchedules();  
})
.catch(error => console.error('Error fetching schedules:', error));

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('table-body');

    tableBody.addEventListener('click', async function(event) {
        if (event.target.classList.contains('delete-btn')) {
            const id = event.target.getAttribute('data-id');
            
            // Confirm deletion
            if (confirm('Are you sure you want to delete this schedule?')) {
                try {
                    // Make the DELETE request
                    const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/schedules/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`API error: ${response.statusText}`);
                    }

                    // Remove the row from the table
                    event.target.closest('tr').remove();
                    
                    alert('Schedule deleted successfully!');
                } catch (error) {
                    console.error('Error deleting schedule:', error);
                    alert('Failed to delete the schedule.');
                }
            }
        }
    });
});



function displaySchedules() {
    const tableBody = document.getElementById('table-body'); 
    tableBody.innerHTML = ''; 

    schedules.forEach(schedule => {
        const row = document.createElement('tr');
        row.classList.add('m-2', 'border-gray-200', 'rounded-md', 'hover:bg-[#003B5C]', 'hover:bg-opacity-20', 'border-b');

        row.innerHTML = `
            <td class="p-3 text-gray-700 text-center">${schedule.daysOfWeek || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.startDate} - ${schedule.endDate}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.courseId || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.roomId || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.startTime} - ${schedule.endTime}</td>
            <td class="p-3 text-center">
                <button class="delete-btn text-black ring-1 ring-[#917248] hover:bg-[#917248] hover:bg-opacity-20 p-1 rounded" data-id="${schedule.id}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


