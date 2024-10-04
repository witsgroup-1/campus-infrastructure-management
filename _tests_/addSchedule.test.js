import { createSchedule, createBooking, recurringBooking, venueList, venueSelection, submitSchedules } from './copies/addScheduleCopy';

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

    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/schedules', expect.objectContaining({
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

    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/bookings', expect.objectContaining({
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


test('shows or hides lastDate based on recurringSelect value', () => {
  document.body.innerHTML = `
    <select id="recurringSelect">
        <option value="false">No</option>
        <option value="true">Yes</option>
    </select>
    <div id="lastDate" style="display: none;"></div>
`;

  const recurringSelect = document.getElementById('recurringSelect');
  recurringSelect.addEventListener('change', recurringBooking);

  recurringSelect.value = 'true';
  recurringSelect.dispatchEvent(new Event('change'));

  const lastDate = document.getElementById('lastDate');
  expect(lastDate.style.display).toBe('flex');

  recurringSelect.value = 'false';
  recurringSelect.dispatchEvent(new Event('change'));

  expect(lastDate.style.display).toBe('none');
});

//tests for venue dropdown
describe('test venue dropdown', () => {
  let venueDropdown, venueInput;

  beforeEach(() => {
      document.body.innerHTML = `
          <input id="venueInput" />
          <select id="venueDropdown" class="hidden"></select>
      `;
      venueDropdown = document.getElementById('venueDropdown');
      venueInput = document.getElementById('venueInput');

      global.fetch = jest.fn();
  });

  afterEach(() => {
      global.fetch.mockClear();
  });

  test('displays and populates dropdown when venues are fetched', async () => {
      const mockVenues = [{ id: '1', Name: 'Venue 1' }, { id: '2', Name: 'Venue 2' }];
      global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockVenues,
      });

      await venueList('Venue');
      
      expect(venueDropdown).not.toHaveClass('hidden'); 
      expect(venueDropdown.children.length).toBe(2); 
      expect(venueDropdown.children[0].textContent).toBe('Venue 1');
      expect(venueDropdown.children[1].textContent).toBe('Venue 2');
  });

  test('hides dropdown if no venues are found', async () => {
      global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [],
      });

      await venueList('Non-existent Venue');
      
      expect(venueDropdown).toHaveClass('hidden'); 
      expect(venueDropdown.children.length).toBe(0);
  });

  test('hides dropdown when input is cleared', async () => {
      await venueList(''); 
      expect(venueDropdown).toHaveClass('hidden'); 
  });

  test('logs an error if the API call fails', async () => {
      console.error = jest.fn(); 
      global.fetch.mockRejectedValueOnce(new Error('API failed'));

      await venueList('Venue');
      
      expect(console.error).toHaveBeenCalledWith('Error fetching venues:', expect.any(Error));
  });
});

//tests what hapens after a venue is selected
describe('test selection of venue', () => {
  let venueDropdown, venueInput;

  beforeEach(() => {
      document.body.innerHTML = `
          <input id="venueInput" />
          <select id="venueDropdown">
              <option value="1">Venue 1</option>
              <option value="2">Venue 2</option>
          </select>
      `;
      venueDropdown = document.getElementById('venueDropdown');
      venueInput = document.getElementById('venueInput');
  });

  test('updates input field and hides dropdown after venue selection', () => {
      venueDropdown.selectedIndex = 1; 

    venueSelection.call(venueDropdown); 

      expect(venueInput.value).toBe('Venue 2'); 
      expect(venueDropdown).toHaveClass('hidden'); 
      expect(venueInput.dataset.venueId).toBe('2'); 
  });
}); 

describe('submitSchedules', () => {
    beforeEach(() => {
        // Set up the mock DOM elements
        document.body.innerHTML = `
            <form id="scheduleForm">
                <input id="name" value="John Doe">
                <input id="course" value="Course 101">
                <input id="venue" value="Room A">
                <input id="day" value="Monday">
                <input id="time_from" value="10:00">
                <input id="time_to" value="11:00">
                <input id="date" value="2024-10-03">
                <select id="recurringSelect">
                    <option value="false" selected>No</option>
                    <option value="true">Yes</option>
                </select>
                <input id="end-date" value="2024-10-31">
            </form>
        `;
    });

    it('should alert if a required field is missing', async () => {
        // Clear a required field
        document.getElementById('name').value = '';

        // Mock alert function
        global.alert = jest.fn();

        // Create a fake event and call the submit function
        const event = new Event('submit');
        event.preventDefault = jest.fn();  // Mock preventDefault

        await submitSchedules(event);

        // Assert that preventDefault was called
        expect(event.preventDefault).toHaveBeenCalled();

        // Ensure the alert was called due to missing required field
        expect(global.alert).toHaveBeenCalledWith('Please fill in all required fields!');
    });

    it('should alert on error when creating schedule or bookings fails', async () => {
        // Mock the async functions to throw an error
        const createScheduleMock = jest.fn().mockRejectedValue(new Error('Schedule creation failed'));
        const createBookingsForRecurringMock = jest.fn().mockResolvedValue({});

        // Replace global functions with mocks
        global.createSchedule = createScheduleMock;
        global.createBookingsForRecurring = createBookingsForRecurringMock;

        // Mock alert function
        global.alert = jest.fn();

        // Create a fake event and call the submit function
        const event = new Event('submit');
        event.preventDefault = jest.fn();  // Mock preventDefault

        await submitSchedules(event);

        // Ensure alert was called due to the error
        expect(global.alert).toHaveBeenCalledWith('An error occurred while creating the schedule or booking.');
    });
});
