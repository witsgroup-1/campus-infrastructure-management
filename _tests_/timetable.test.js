import './copies/timetable.Copy.js';

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
);

describe('Schedule Management', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table>
                <tbody id="table-body"></tbody>
            </table>
            <div id="edit-modal" class="hidden"></div>
            <button id="update"></button>
            <button id="close-modal"></button> 
            <input id="venue" type="text" />
            <input id="course" type="text" />
            <input id="start-time" type="text" />
            <input id="end-time" type="text" />
            <input id="day" type="text" />
            <input id="start-date" type="text" />
            <input id="end-date" type="text" />
        `;

        fetch.mockClear();
        global.alert = jest.fn(); 
    });

    // Test GET API (also tests display of schedules)
    it('fetch schedules on load', async () => {
        const schedules = [{ id: '1', roomId: 'Room A', courseId: 'Course 1' }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(schedules),
        });

        const loadSchedules = async () => {
            // Had to use real link as GET for localhost was not working.
            const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/schedules');
            if (response.ok) {
                const data = await response.json();
                const tableBody = document.getElementById('table-body');
                data.forEach(schedule => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${schedule.id}</td><td>${schedule.roomId}</td><td>${schedule.courseId}</td>`;
                    tableBody.appendChild(row);
                });
            }
        };

        await loadSchedules();
        
        expect(fetch).toHaveBeenCalledTimes(1); 
        expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/schedules');

        const tableBody = document.getElementById('table-body');
        expect(tableBody.children.length).toBe(schedules.length); 
    });

    // Mock the deleteSchedule function
    const deleteSchedule = jest.fn((id, element) => {
        element.remove(); 
        return Promise.resolve();
    });

    //test delete API
    it('delete a schedule when delete button is clicked', async () => {
        const Id = '1'; 
    
        document.body.innerHTML = `
            <table>
                <tbody id="table-body">
                    <tr id="row-${Id}">
                        <td>Room A</td>
                        <td><button id="delete-btn" data-id="${Id}">Delete</button></td>
                    </tr>
                </tbody>
            </table>
        `;
    
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
        });
    
        global.alert = jest.fn();
    
        const deleteBtn = document.getElementById('delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            const scheduleId = e.target.dataset.id; // Get ID from the button
            const rowElement = e.target.closest('tr'); 
    
            const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/schedules/${scheduleId}`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                if (rowElement) {
                    rowElement.remove();
                    alert('Schedule deleted successfully!');
                }
            }
        });
    
        await deleteBtn.click();
    
        expect(fetch).toHaveBeenCalledWith(
            `https://campus-infrastructure-management.azurewebsites.net/api/schedules/${Id}`,
            expect.objectContaining({ method: 'DELETE' })
        );

        //create a delay
        await new Promise((resolve) => setTimeout(resolve, 0));
    
        const element = document.getElementById(`row-${Id}`);
        expect(element).toBeNull(); 
        expect(alert).toHaveBeenCalledWith('Schedule deleted successfully!');
    });
    
    
    it('open popup when edit button is clicked', () => {
        const Id = '1';
        const schedules = [{ id: '1', roomId: 'Room A', courseId: 'Course 1' }];
        
        document.getElementById('table-body').innerHTML = `
            <tr>
                <button class="edit-btn" data-id="${Id}">Edit</button>
            </tr>
        `;
    
        global.schedules = schedules; 
    
        const editBtn = document.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            const scheduleId = editBtn.dataset.id; 
            const schedule = global.schedules.find(s => s.id === scheduleId); 
            
            document.getElementById('venue').value = schedule.roomId;
           
            const modal = document.getElementById('edit-modal');
            modal.classList.remove('hidden');
        });
    
        editBtn.click();
    
        const modal = document.getElementById('edit-modal');
        expect(modal.classList.contains('hidden')).toBe(false); 
        expect(document.getElementById('venue').value).toBe('Room A');
    });

    //test PUT api
    it('updates schedule when update button is clicked', async () => {
        const Id = '1';
        const updatedSchedule = {
            roomId: 'Updated Room',
            courseId: 'Updated Course',
            startTime: '08:00',
            endTime: '10:00',
            daysOfWeek: 'Monday',
            startDate: '2024-09-01',
            endDate: '2024-09-30',
        };
    
        document.body.innerHTML = `
            <input type="hidden" id="data-id" value="${Id}" />
            <input id="venue" value="${updatedSchedule.roomId}" />
            <input id="course" value="${updatedSchedule.courseId}" />
            <input id="start-time" value="${updatedSchedule.startTime}" />
            <input id="end-time" value="${updatedSchedule.endTime}" />
            <input id="day" value="${updatedSchedule.daysOfWeek}" />
            <input id="start-date" value="${updatedSchedule.startDate}" />
            <input id="end-date" value="${updatedSchedule.endDate}" />
            <button id="update"></button>
            <div id="edit-modal" class="hidden"></div>
        `;
    
        fetch.mockResolvedValueOnce({ ok: true });
        global.alert = jest.fn();
    
        document.getElementById('update').addEventListener('click', async function () {
            const id = document.getElementById('data-id').value;
            const updatedSchedule = {
                roomId: document.getElementById('venue').value,
                courseId: document.getElementById('course').value,
                startTime: document.getElementById('start-time').value,
                endTime: document.getElementById('end-time').value,
                daysOfWeek: document.getElementById('day').value,
                startDate: document.getElementById('start-date').value,
                endDate: document.getElementById('end-date').value,
            };
    
            await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/schedules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                },
                body: JSON.stringify(updatedSchedule),
            });
    
            alert('Schedule updated successfully!');
            document.getElementById('edit-modal').classList.add('hidden');
        });
    
        await document.getElementById('update').click();
    
        expect(fetch).toHaveBeenCalledWith(
            `https://campus-infrastructure-management.azurewebsites.net/api/schedules/${Id}`, 
            expect.objectContaining({
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': expect.any(String)
                },
                body: JSON.stringify(updatedSchedule),
            })
        );
    
        expect(document.getElementById('edit-modal').classList.contains('hidden')).toBe(true);
        expect(alert).toHaveBeenCalledWith('Schedule updated successfully!');
    });
    
    
});
