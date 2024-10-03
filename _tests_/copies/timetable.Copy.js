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
    tableBody.addEventListener('click', function (event) {
        const deleteButton = event.target.closest('.delete-btn');
        const editButton = event.target.closest('.edit-btn');

        if (deleteButton) {
            const id = deleteButton.getAttribute('data-id');
            deleteSchedule(id, deleteButton);
        }

        if (editButton) {
            const id = editButton.getAttribute('data-id');
            editSchedule(id);
        }
    });

    // Close the modal
    closeModal.addEventListener('click', function () {
        modal.classList.add('hidden');  // Hide the modal
    });

    // Handle modal form submission (Edit functionality)
    document.getElementById('update').addEventListener('click', function () {
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

        updateSchedule(id, updatedSchedule);
    });
});

// Function to delete the schedule via API
export async function deleteSchedule(id, deleteButton) {
    try {
        const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/schedules/${id}`, {
            method: 'DELETE',
            headers: {
                'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        // Remove the schedule from the UI
        const row = deleteButton.closest('tr'); // Find the closest table row
        if (row && row.parentNode) { // Check if row exists and has a parent
            row.remove(); // Remove the row from the table
        } else {
            console.error('Row not found for deletion.');
        }

        alert('Schedule deleted successfully!');
    } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Failed to delete the schedule.');
    }
}

export function editSchedule(id, schedules) {
    const schedule = schedules.find(sch => sch.id === id);

    if (schedule) {
        const modal = document.getElementById('edit-modal');
        // Populate modal input fields for editing
        document.getElementById('venue').value = schedule.roomId || '';
        document.getElementById('course').value = schedule.courseId || '';
        document.getElementById('start-time').value = schedule.startTime || '';
        document.getElementById('end-time').value = schedule.endTime || '';
        document.getElementById('day').value = schedule.daysOfWeek || '';
        document.getElementById('start-date').value = schedule.startDate || '';
        document.getElementById('end-date').value = schedule.endDate || '';

        // Store schedule ID in a hidden field
        let hiddenField = document.getElementById('data-id');
        if (!hiddenField) {
            hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.id = 'data-id';
            modal.appendChild(hiddenField); // This line might be failing if modal is null
        }
        hiddenField.value = id;

        modal.classList.remove('hidden');  
    }
}


// Function to update the schedule via API
export async function updateSchedule(id, updatedSchedule) {
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
        const modal = document.getElementById('edit-modal');
        modal.classList.add('hidden');  // Hide the modal after saving
        displaySchedules(schedules);  // Reload or refresh the schedules
    } catch (error) {
        console.error('Error updating schedule:', error);
        alert('Failed to update the schedule.');
    }
}

// Function to display schedules
export function displaySchedules(schedules) {
    const tableBody = document.getElementById('table-body'); 
    tableBody.innerHTML = ''; 

    schedules.forEach(schedule => {
        const row = document.createElement('tr');
        row.classList.add('m-2', 'border-gray-200', 'rounded-md', 'hover:bg-[#003B5C]', 'hover:bg-opacity-20', 'border-b');

        row.innerHTML = `
            <td class="p-3 text-gray-700 text-center">${schedule.daysOfWeek || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.startDate} ${schedule.endDate ? ` - ${schedule.endDate}`.trim() : ''}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.courseId || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.roomId || 'N/A'}</td>
            <td class="p-3 text-gray-700 text-center">${schedule.startTime} - ${schedule.endTime}</td>
            <td class="p-3 text-center">
                <button class="delete-btn text-black mr-3 ring-1 ring-[#917248] hover:bg-[#917248] hover:bg-opacity-20 p-1 rounded" data-id="${schedule.id}">
                Delete
                </button>
                <button class="edit-btn text-black ring-1 ring-[#917248] hover:bg-[#917248] hover:bg-opacity-20 p-1 rounded" data-id="${schedule.id}">
                Edit
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}
