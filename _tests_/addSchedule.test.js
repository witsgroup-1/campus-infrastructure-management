import { createSchedule, createBooking } from './copies/addScheduleCopy';

describe('Schedule and Booking API', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({}),
            })
        );
    });
    

  afterEach(() => {
    jest.clearAllMocks(); 
  });

global.scheduleForm = `
  <form id="schedule_form">
    <input id="name" value="testingName" />
    <input id="course" value="testCourse" />
    <input id="venue" value="testVenue" />
    <input id="day" value="testDay" />
    <input id="time_from" value="08:00" />
    <input id="time_to" value="10:00" />
    <input id="date" value="2024-09-01" />
    <select id="recurring-select">
      <option value="false">No</option>
      <option value="true">Yes</option>
    </select>
    <input id="end-date" value="2024-12-01" style="display: none;" />
    <button id="submit-btn" type="submit">Submit</button>
  </form>
`;

  // Test that the API call to create a schedule works
  test('Schedule created successfully', async () => {
    const userId = 'testingUser';
    const courseId = 'testCourse';
    const roomId = 'testRoom';
    const daysOfWeek = 'testDay';
    const startTime = '08:00';
    let endTime = '10:00';
    const startDate = '2024-09-01';
    const recurring = 'true';
    const endDate = '2024-12-01';

    // Mock the fetch response for schedule creation
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: "Schedule created" }),
    });

    const result = await createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime);

    expect(result).toEqual({ message: "Schedule created" });

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/schedules', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': expect.any(String),
      },
      body: JSON.stringify({
        userId,
        courseId,
        roomId,
        daysOfWeek,
        startTime,
        endTime,
        startDate,
        recurring,
        endDate
      }),
    }));
  });

  // Test that the API call to create a booking works
  test('Booking created successfully', async () => {
    const userId = 'testingUser';
    const roomId = 'testRoom';
    const start_time = '08:00';
    const end_time = '10:00';
    const date = '2024-09-01';
    const purpose = 'course';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: "Booking created" }),
    });

    await createBooking(userId, roomId, date, start_time, end_time, purpose);

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/Bookings', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': expect.any(String),
      },
      body: JSON.stringify({
        userId,
        roomId,
        start_time,
        end_time,
        date,
        purpose,
        status: 'Pending', 
        venueId: roomId
      }),
    }));
  });
});

//testing DOM fields

test('show last date field when recurring is true', () => {
    document.body.innerHTML = `
        <select id="recurring-select">
            <option value="false">No</option>
            <option value="true">Yes</option>
        </select>
        <input type="date" id="end-date" style="display:none;" />
    `;

    const recurringSelect = document.getElementById('recurring-select');
    const lastDate = document.getElementById('end-date');

    recurringSelect.addEventListener('change', () => {
        if (recurringSelect.value === 'true') {
            lastDate.style.display = 'block';
        } else {
            lastDate.style.display = 'none';
        }
    });

    recurringSelect.value = 'true';
    recurringSelect.dispatchEvent(new Event('change'));

    expect(lastDate.style.display).toBe('block');
});

test( 'no form submission if a value is missing', async () => {
    window.alert = jest.fn();

    document.body.innerHTML = global.scheduleForm;

    const submit = document.getElementById('submit-btn');
    const name = document.getElementById('name');

    name.value='';

    document.getElementById('schedule_form').addEventListener('submit', (event) => {
        event.preventDefault(); 
        if (!name.value.trim()) {
            alert('Please fill in all required fields!');
        }
        console.log('Submit button clicked'); 

    });

    submit.click();

    expect(alert).toHaveBeenCalledWith('Please fill in all required fields!');
})

global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    })
);

test('form is submitted with valid inputs', async () => {
    document.body.innerHTML = global.scheduleForm;

    const form = document.getElementById('schedule_form');
    const submit = document.getElementById('submit-btn');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const formData = new FormData(form);
        
        await fetch('http://localhost:3000/api/schedules', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': expect.any(String)
            },
        });

        console.log("Schedule created.");

        await fetch('http://localhost:3000/api/Bookings', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': expect.any(String)
            },
        });

        console.log("Booking created.");
    });

    submit.click();

    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledTimes(2);
});
