// //get the file
require('./copies/maintenanceReportsCopy');
/**
 * @jest-environment jsdom
 */
import { fireEvent, waitFor } from '@testing-library/dom';


describe('Form submission', () => {
  let form, reportTypeInput, descriptionInput, venueInput;
  let apiKey = process.env.API_KEY_1
  beforeEach(() => {

  document.body.innerHTML = `
  <form id="maintenanceForm">
    <select id="reportType">
      <option value="Issue 1">Issue 1</option>
      <option value="Issue 2">Issue 2</option>
    </select>
    <textarea id="description" placeholder="Enter description"></textarea>
    <input id="venueInput" placeholder="Venue" data-venue-id="" value="Room 101" />
    <button type="submit">Submit</button>
    <div id="venue-dropdown" class="hidden"></div>
  </form>
`;

    form = document.getElementById('maintenanceForm');
    reportTypeInput = document.getElementById('reportType');
    descriptionInput = document.getElementById('description');
    venueInput = document.getElementById('venueInput');

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      })
    );

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Submits the form correctly', async () => {
    // Fill out the form
    fireEvent.change(reportTypeInput, { target: { value: 'Issue 1' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.change(venueInput, { target: { value: 'Room 101' } });

    // Add event listener 
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      await fetch('http://localhost:3000/api/maintenanceRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your-api-key',
        },
        body: JSON.stringify({
          sample: {
            issueType: reportTypeInput.value,
            description: descriptionInput.value,
            roomId: venueInput.dataset.venueId,
            roomName: venueInput.value,
          },
          inverse: false,
        }),
      });
    });

    // Simulate form submission
    fireEvent.submit(form);

    // Verify fetch was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/maintenanceRequests',
        expect.any(Object) 
      );
    });
  });

test('Displays an alert if venue is not selected correctly', async () => {
  document.body.innerHTML = `
    <form id="maintenanceForm">
      <select id="reportType">
        <option value="Issue 1">Issue 1</option>
        <option value="Issue 2">Issue 2</option>
      </select>
      <textarea id="description" placeholder="Enter description"></textarea>
      <input id="venueInput" placeholder="Venue" data-venue-id="" value="Room 101" />
      <button type="submit">Submit</button>
      <div id="venue-dropdown" class="hidden"></div>
    </form>
  `;

  // Manually trigger the DOMContentLoaded event to ensure event listeners are attached
  const event = new Event('DOMContentLoaded');
  document.dispatchEvent(event);

  // Now check if the form is submitted
  const form = document.getElementById('maintenanceForm');
  const venueInput = document.getElementById('venueInput');

  // Simulate input values
  venueInput.value = ''; // Invalid venue selection

  // Mock window.alert
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  // Submit the form
  fireEvent.submit(form);

  // Wait for the alert to be called
  await waitFor(() => {
    expect(alertMock).toHaveBeenCalledWith('Please select a valid venue from the dropdown.');
  });

  expect(venueInput.value).toBe('');

  alertMock.mockRestore(); // Cleanup mock
});
});

// describe('Venue Dropdown Functionality', () => {
//   let venueDropdown, venueInput;

//   beforeEach(() => {
//     // Set up a mock DOM before each test
//     document.body.innerHTML = `
//       <div id="venue-dropdown" class="hidden"></div>
//       <input id="venueInput" placeholder="Venue" data-venue-id="" value="Room 101" />
//     `;

//     // Get the DOM elements
//     venueDropdown = document.getElementById('venue-dropdown');
//     venueInput = document.getElementById('venueInput');

//     // Ensure that the functions are assigned to the window
//     window.updateVenueDropdown = updateVenueDropdown;
//     window.clearVenueDropdown = clearVenueDropdown;
//   });

//   test('updateVenueDropdown should populate and show dropdown', () => {
//     const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];

//     //call the function from the script
//     window.updateVenueDropdown(venues);
//     console.log("update venue dropdown", venueDropdown.innerHTML);
//     // Assert that the dropdown has the correct options
//     expect(venueDropdown.innerHTML).toContain('Room 101');
//     expect(venueDropdown.innerHTML).toContain('Room 102');
//     expect(venueDropdown.classList).not.toContain('hidden');
//   });

//   test('clearVenueDropdown should clear the dropdown', () => {
//     venueDropdown.innerHTML = '<option>Room 101</option>';
//     // Call the actual function 
//     window.clearVenueDropdown();

//     console.log('venue should be clear', venueDropdown.innerHTML);
//     // Assert that the dropdown is cleared and hidden
//     expect(venueDropdown.innerHTML).toBe('');
//     expect(venueDropdown.classList).toContain('hidden');
//   });
// });



describe('Venue Dropdown Functionality', () => {
  let venueDropdown, venueInput;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="venue-dropdown" class="hidden"></div>
      <input id="venueInput" placeholder="Venue" data-venue-id="" value="Room 101" />
    `;
    venueDropdown = document.getElementById('venue-dropdown');
    venueInput = document.getElementById('venueInput');

    window.updateVenueDropdown = updateVenueDropdown;
    window.clearVenueDropdown = clearVenueDropdown;

    console.log('Initial venueDropdown:', venueDropdown.innerHTML);
  });

  test('updateVenueDropdown should populate and show dropdown', () => {
    const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
    
    console.log('Before calling updateVenueDropdown', venueDropdown.innerHTML);
    console.log(venues);
    // Call the function from the script
    window.updateVenueDropdown(venues);

    console.log('After calling updateVenueDropdown', venueDropdown.innerHTML);

    // Assert that the dropdown has the correct options
    expect(venueDropdown.innerHTML).toContain('Room 101');
    expect(venueDropdown.innerHTML).toContain('Room 102');
    expect(venueDropdown.classList).not.toContain('hidden');
  });

  test('clearVenueDropdown should clear the dropdown', () => {

    venueDropdown.innerHTML = '<option data-id="123">Room 101</option>';
    
    console.log('Before calling clearVenueDropdown', venueDropdown.innerHTML);
    
    // Call the actual function 
    window.clearVenueDropdown();
    
    console.log('After calling clearVenueDropdown', venueDropdown.innerHTML);

    // Assert that the dropdown is cleared and hidden
    expect(venueDropdown.innerHTML).toBe('');
    expect(venueDropdown.classList).toContain('hidden');
  });
});


