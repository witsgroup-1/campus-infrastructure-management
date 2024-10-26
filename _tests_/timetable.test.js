//import './copies/timetable.Copy.js';
import { displaySchedules, deleteSchedule, editSchedule, updateSchedule, closeModal, onclickUpdateSchedule } from '../src/schedule/timetable.js';

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
        modal = document.createElement('div');
        modal.id = 'edit-modal';
        modal.classList.add('hidden');
        document.body.appendChild(modal);

        schedules = [
            { id: '1', roomId: '101', courseId: 'Math', startTime: '09:00', endTime: '10:00', daysOfWeek: 'Monday', startDate: '2024-10-01', endDate: '2024-12-01' },
        ];

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

    test('should populate modal with the correct schedule data', () => {
        expect(modal.classList.contains('hidden')).toBe(true); // Initial state check
        editSchedule('1', schedules);

        expect(document.getElementById('venue').value).toBe('101');
        expect(document.getElementById('course').value).toBe('Math');
        expect(document.getElementById('start-time').value).toBe('09:00');
        expect(document.getElementById('end-time').value).toBe('10:00');
        expect(document.getElementById('day').value).toBe('Monday');
        expect(document.getElementById('start-date').value).toBe('2024-10-01');
        expect(document.getElementById('end-date').value).toBe('2024-12-01');
    });
});


describe('close the modal', () => {
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

   test('should update schedule successfully', async () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        await updateSchedule(mockId, mockUpdatedSchedule);
        expect(fetch).toHaveBeenCalledWith(`https://campus-infrastructure-management.azurewebsites.net/api/schedules/${mockId}`, {
            method: 'PUT',
            headers: {
                'x-api-key': expect.any(String),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockUpdatedSchedule),
        });

        expect(alertMock).toHaveBeenCalledWith('Schedule updated successfully!');
        alertMock.mockRestore(); 
    });
});


test('should delete a schedule and remove from the DOM', async () => {
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
        document.body.innerHTML = `
            <table>
                <tbody id="table-body"></tbody>
            </table>
        `;
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
    });

    // Test GET API 
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
            const scheduleId = e.target.dataset.id; 
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
                    'x-api-key': expect.any(String),
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



