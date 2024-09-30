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

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('table-body');
    const modal = document.getElementById('edit-modal');
    const closeModal = document.getElementById('close-modal');
    
    // Event delegation on tableBody
    tableBody.addEventListener('click', async function (event) {
        const deleteButton = event.target.closest('.delete-btn');
        const editButton = event.target.closest('.edit-btn');

        if (deleteButton) {
            const id = deleteButton.getAttribute('data-id');

            if (confirm('Are you sure you want to delete this schedule?')) {
                try {
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

                    deleteButton.closest('tr').remove();
                    alert('Schedule deleted successfully!');
                } catch (error) {
                    console.error('Error deleting schedule:', error);
                    alert('Failed to delete the schedule.');
                }
            }
        }

        if (editButton) {
            const id = editButton.getAttribute('data-id');
            const schedule = schedules.find(sch => sch.id === id);

            if (schedule) {
                // Populate modal input fields for editing
                document.getElementById('venue').value = schedule.roomId || '';
                document.getElementById('course').value = schedule.courseId || '';
                document.getElementById('start-time').value = schedule.startTime || '';
                document.getElementById('end-time').value = schedule.endTime || '';
                document.getElementById('day').value = schedule.daysOfWeek || '';
                document.getElementById('start-date').value = schedule.startDate || '';
                document.getElementById('end-date').value = schedule.endDate || '';

                // Store schedule ID in a hidden field (can be created dynamically)
                if (!document.getElementById('data-id')) {
                    const hiddenField = document.createElement('input');
                    hiddenField.type = 'hidden';
                    hiddenField.id = 'data-id';
                    hiddenField.value = id;
                    modal.appendChild(hiddenField);
                } else {
                    document.getElementById('data-id').value = id;
                }
                
                modal.classList.remove('hidden');  // Show the modal
            }
        }
    });

    // Close the modal
    closeModal.addEventListener('click', function () {
        modal.classList.add('hidden');  // Hide the modal
    });

// Handle modal form submission (Edit functionality)
document.getElementById('update').addEventListener('click', async function () {
    const id = document.getElementById('data-id').value;  // Assuming schedule ID is stored in a hidden field
    const updatedSchedule = {
        roomId: document.getElementById('venue').value,
        courseId: document.getElementById('course').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        daysOfWeek: document.getElementById('day').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
    };

    try {
        const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/schedules/${id}`, {
            method: 'PUT',
            headers: {
                'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedSchedule),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        alert('Schedule updated successfully!');
        modal.classList.add('hidden');  // Hide the modal after saving
        displaySchedules();  // Reload or refresh the schedules
    } catch (error) {
        console.error('Error updating schedule:', error);
        alert('Failed to update the schedule.');
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
            <td class="p-3 text-gray-700 text-center">${schedule.startDate} ${schedule.endDate ? ` - ${schedule.endDate}` : ''}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.courseId || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.roomId || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.startTime} - ${schedule.endTime}</td>
            <td class="p-3 text-center">
                <button class="delete-btn text-black mr-3 ring-1 ring-[#917248] hover:bg-[#917248] hover:bg-opacity-20 p-1 rounded" data-id="${schedule.id}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</button>
                <button class="edit-btn text-black ring-1 ring-[#917248] hover:bg-[#917248] hover:bg-opacity-20 p-1 rounded" data-id="${schedule.id}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

