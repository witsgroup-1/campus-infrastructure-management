import './copies/timetable.Copy.js';
import { displaySchedules, deleteSchedule, editSchedule, updateSchedule, closeModal, onclickUpdateSchedule } from './copies/timetable.Copy.js';

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

// Mocking the fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        statusText: 'OK',
    })
);

describe('editSchedule', () => {
    let modal;
    let schedules;

    beforeEach(() => {
        // Setting up a mock modal
        modal = document.createElement('div');
        modal.id = 'edit-modal';
        modal.classList.add('hidden');
        document.body.appendChild(modal);

        // Mocking schedule data
        schedules = [
            { id: '1', roomId: '101', courseId: 'Math', startTime: '09:00', endTime: '10:00', daysOfWeek: 'Monday', startDate: '2024-10-01', endDate: '2024-12-01' },
        ];

        // Mocking DOM elements
        document.body.innerHTML += `
            <input id="venue" type="text">
            <input id="course" type="text">
            <input id="start-time" type="text">
            <input id="end-time" type="text">
            <input id="day" type="text">
            <input id="start-date" type="text">
            <input id="end-date" type="text">
        `;
    });

    afterEach(() => {
        // Cleanup
        jest.clearAllMocks();
        modal.remove();
    });

    test('should populate modal with the correct schedule data', () => {
        // Verify initial state
        expect(modal.classList.contains('hidden')).toBe(true); // Initial state check

        // Call the function and pass schedules
        editSchedule('1', schedules);

        // Verify that modal fields are populated correctly
        expect(document.getElementById('venue').value).toBe('101');
        expect(document.getElementById('course').value).toBe('Math');
        expect(document.getElementById('start-time').value).toBe('09:00');
        expect(document.getElementById('end-time').value).toBe('10:00');
        expect(document.getElementById('day').value).toBe('Monday');
        expect(document.getElementById('start-date').value).toBe('2024-10-01');
        expect(document.getElementById('end-date').value).toBe('2024-12-01');

        //expect(modal.classList.contains('hidden')).toBe(false); 
    });
});

describe('closeModalFunction', () => {
    let modal;

    beforeEach(() => {
        modal = {
            classList: {
                add: jest.fn() 
            }
        };

        global.modal = modal; 
    });

    it('should add the "hidden" class to the modal', () => {
        closeModal();

        expect(modal.classList.add).toHaveBeenCalledWith('hidden');
    });
});


describe('updateSchedule', () => {
    const mockId = '1';
    const mockUpdatedSchedule = {
        roomId: 'WSS',
        courseId: 'APPM2026',
        startTime: '10:00',
        endTime: '11:00',
        daysOfWeek: 'Tuesday',
        startDate: '2024-10-02',
        endDate: '2024-12-02',
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    test('should update schedule successfully', async () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        await updateSchedule(mockId, mockUpdatedSchedule);

        // Check if fetch was called with correct parameters
        expect(fetch).toHaveBeenCalledWith(`https://campus-infrastructure-management.azurewebsites.net/api/schedules/${mockId}`, {
            method: 'PUT',
            headers: {
                'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockUpdatedSchedule),
        });

        expect(alertMock).toHaveBeenCalledWith('Schedule updated successfully!');
        alertMock.mockRestore(); // Restore original alert function
    });

    test('should handle errors during update', async () => {
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Bad Request',
            })
        );

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        await updateSchedule(mockId, mockUpdatedSchedule);

        expect(alertMock).toHaveBeenCalledWith('Failed to update the schedule.');
        alertMock.mockRestore();
    });
});


test('should delete a schedule and remove from the DOM', async () => {
    global.confirm = jest.fn(() => true);
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
        })
    );
    document.body.innerHTML = `
        <table id="table-body">
            <tr><td><button class="delete-btn" data-id="1"></button></td></tr>
        </table>
    `;

    const deleteButton = document.querySelector('.delete-btn');

    await deleteSchedule('1', deleteButton);

    expect(fetch).toHaveBeenCalledWith(
        'https://campus-infrastructure-management.azurewebsites.net/api/schedules/1',
        expect.any(Object)
    );
    expect(document.querySelector('tr')).toBeNull
});


describe('displaySchedules', () => {
    beforeEach(() => {
        // Set up a basic table structure in the DOM
        document.body.innerHTML = `
            <table>
                <tbody id="table-body"></tbody>
            </table>
        `;
    });

    it('should render the correct number of rows based on the schedules data', () => {
        const mockSchedules = [
            { id: '1', daysOfWeek: 'Monday', startDate: '2024-10-02', endDate: '2024-12-15', courseId: 'PSYC1028', roomId: 'OLS101', startTime: '08:00', endTime: '10:00' },
            { id: '2', daysOfWeek: 'Wednesday', startDate: '2024-10-03', courseId: 'COMS2008', roomId: 'Flower Hall', startTime: '10:00', endTime: '12:00' }
        ];

        displaySchedules(mockSchedules);

        const rows = document.querySelectorAll('tr');
        expect(rows.length).toBe(2);  // Should render 2 rows
    });

    it('should display correct data in the rows', () => {
        const mockSchedules = [
            { id: '1', daysOfWeek: 'Monday', startDate: '2024-10-02', endDate: '2024-12-15', courseId: 'PSYC1028', roomId: 'OLS101', startTime: '08:00', endTime: '10:00' }
        ];

        displaySchedules(mockSchedules);

        const firstRow = document.querySelector('tr');
        expect(firstRow.children[0].textContent.trim()).toBe('Monday');  
        expect(firstRow.children[1].textContent.trim()).toBe('2024-10-02 - 2024-12-15');  
        expect(firstRow.children[2].textContent.trim()).toBe('PSYC1028');  
        expect(firstRow.children[3].textContent.trim()).toBe('OLS101');  
        expect(firstRow.children[4].textContent.trim()).toBe('08:00 - 10:00'); 
    });

    it('should handle empty or null data', () => {
        const mockSchedules = [
            { id: '1', daysOfWeek: null, startDate: '2024-10-02', endDate: null, courseId: '', roomId: '', startTime: '08:00', endTime: '10:00' }
        ];

        displaySchedules(mockSchedules);

        const firstRow = document.querySelector('tr');
        expect(firstRow.children[0].textContent.trim()).toBe('N/A');  
        expect(firstRow.children[1].textContent.trim()).toBe('2024-10-02');  
        expect(firstRow.children[2].textContent.trim()).toBe('N/A');  
        expect(firstRow.children[3].textContent.trim()).toBe('N/A'); 
    });
});


/*describe('updating the schedule when press update', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="data-id" type="hidden" value="123" />
            <input id="venue" value="Room A" />
            <input id="course" value="Course 101" />
            <input id="start-time" value="10:00" />
            <input id="end-time" value="11:00" />
            <input id="day" value="Monday" />
            <input id="start-date" value="2024-10-01" />
            <input id="end-date" value="2024-10-31" />
            <button id="update">Update Schedule</button>
        `;
        
        global.updateSchedule = jest.fn();
    });

    test('should call updateSchedule with correct parameters', () => {
        const updateButton = document.getElementById('update');
        updateButton.click();

        expect(global.updateSchedule).toHaveBeenCalledWith('123', {
            roomId: 'Room A',
            courseId: 'Course 101',
            startTime: '10:00',
            endTime: '11:00',
            daysOfWeek: 'Monday',
            startDate: '2024-10-01',
            endDate: '2024-10-31',
        });
    });
});*/

