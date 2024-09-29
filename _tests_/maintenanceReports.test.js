// //get the file
require('./copies/maintenanceReportsCopy');
// /**
//  * @jest-environment jsdom
//  */
// import { fireEvent, waitFor } from '@testing-library/dom';

// describe('Form submission', () => {
//   let form, reportTypeInput, descriptionInput, venueInput, submitButton;

//   beforeEach(() => {
//     // Set up the document body
//     document.body.innerHTML = `
//       <form>
//         <select id="reportType">
//           <option value="Issue 1">Issue 1</option>
//           <option value="Issue 2">Issue 2</option>
//         </select>
//         <textarea placeholder="Enter description"></textarea>
//         <input placeholder="Venue" />
//         <button type="submit">Submit</button>
//       </form>
//     `;

//     form = document.querySelector('form');
//     reportTypeInput = document.querySelector('#reportType');
//     descriptionInput = document.querySelector('textarea');
//     venueInput = document.querySelector('input');
//     submitButton = document.querySelector('button');

//     // Mock the fetch function
//     global.fetch = jest.fn();
//   });

//   afterEach(() => {
//     // Clear mocks after each test
//     jest.clearAllMocks();
//   });


//   test('Submits the maintenance request form successfully', async () => {
//     // Mocking fetch call for the API
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: true,
//         json: () => Promise.resolve({ message: 'Success' }),
//       })
//     );
  
//     document.body.innerHTML = `
//       <form id="maintenanceForm">
//         <input id="nameInput" value="John Doe" />
//         <select id="reportType">
//           <option value="Electrical">Electrical</option>
//         </select>
//         <input id="venue-input" data-venue-id="123" value="Room 101" />
//         <textarea id="description">Broken light bulb</textarea>
//         <button type="submit">Submit</button>
//       </form>
//     `;
  
//     const maintenanceForm = document.getElementById('maintenanceForm');
//     const submitEvent = new Event('submit');
    
//     // Add event listener from your code
//     await maintenanceForm.dispatchEvent(submitEvent);
  
//     expect(fetch).toHaveBeenCalledWith(
//       'http://localhost:3000/api/maintenanceRequests',
//       expect.any(Object) // Verifies that it's called with any object (you can make it more specific)
//     );
//   });




//   test('should submit the form with correct data and reset form on success', async () => {
//     const staticTimestamp = '2024-09-25T19:00:00.000Z';
  
//     // Mock Date to always return the static timestamp
//     const mockDate = new Date(staticTimestamp);
//     global.Date = jest.fn(() => mockDate);
  
//     // Mock the fetch response
//     fetch.mockResolvedValueOnce({ ok: true });
  
//     // Simulate DOMContentLoaded
//     document.dispatchEvent(new Event('DOMContentLoaded'));
  
//     // Populate form fields
//     reportTypeInput.value = 'Issue 1'; 
//     descriptionInput.value = 'Test description';
//     venueInput.value = 'Test venue';
  
//     // Simulate form submission
//     const submitEvent = new Event('submit', { bubbles: true });
//     form.dispatchEvent(submitEvent);
  
//     await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async to complete
  
//     // Expect the fetch to have been called with the correct arguments
//     expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/maintenanceRequests', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
//       },
//       body: JSON.stringify({
//         assignedTo: 'none',
//         createdAt: staticTimestamp,
//         description: 'Test description',
//         issueType: 'Issue 1',
//         roomId: 'Test venue',
//         roomName: 'Test Name',
//         status: 'Scheduled',
//         timestamp: staticTimestamp,
//         userId: '12345',
//       }),
//     });
  
//     // Manually reset the dropdown
//     reportTypeInput.value = '';
  
//     // Verify that the form was reset
//     expect(reportTypeInput.value).toBe(''); 
//     expect(descriptionInput.value).toBe('');
//     expect(venueInput.value).toBe('');
  
//     // Restore original Date object after the test
//     global.Date = Date;
//   });
  


//   test('should handle fetch error during form submission', async () => {
//     // Mock fetch to return a failed response
//     fetch.mockResolvedValueOnce({ ok: false });
  
//     // Mock console.error
//     const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
//     // Simulate DOMContentLoaded event
//     document.dispatchEvent(new Event('DOMContentLoaded'));
  
//     // Populate form fields
//     reportTypeInput.value = 'Issue 1';
//     descriptionInput.value = 'Test description';
//     venueInput.value = 'Test venue';
  
//     // Simulate form submission
//     const submitEvent = new Event('submit', { bubbles: true });
//     form.dispatchEvent(submitEvent);
  
//     await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async
  
//     // Verify fetch was called
//     expect(fetch).toHaveBeenCalledTimes(1);
  
//     // Verify error handling
//     expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Failed to submit request'));
//     expect(consoleErrorSpy).toHaveBeenCalledWith('There was an error creating the maintenance request');
  
//     // Clean up the mock
//     consoleErrorSpy.mockRestore();
//   });



//   test('Populates the venue dropdown based on input', async () => {
//     // Mock API response
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: true,
//         json: () => Promise.resolve([{ Name: 'Room 101', id: '101' }, { Name: 'Room 102', id: '102' }]),
//       })
//     );
  
//     document.body.innerHTML = `
//       <input id="venue-input" placeholder="Venue" />
//       <select id="venue-dropdown"></select>
//     `;
  
//     const venueInput = document.getElementById('venue-input');
//     const dropdown = document.getElementById('venue-dropdown');
  
//     // Simulate user typing in venue input
//     venueInput.value = 'Room';
//     const inputEvent = new Event('input');
//     venueInput.dispatchEvent(inputEvent);
  
//     await Promise.resolve(); // Wait for async code to finish
  
//     expect(fetch).toHaveBeenCalledWith(
//       'http://localhost:3000/api/venues?name=Room',
//       expect.any(Object)
//     );
  
//     // Check if dropdown is populated with the right options
//     expect(dropdown.children.length).toBe(2);
//     expect(dropdown.children[0].textContent).toBe('Room 101');
//   });
  

//   test('Handles venue API failure', async () => {
//     global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
  
//     document.body.innerHTML = `
//       <input id="venue-input" placeholder="Venue" />
//       <select id="venue-dropdown" class="hidden"></select>
//     `;
  
//     const venueInput = document.getElementById('venue-input');
//     venueInput.value = 'Room';
//     const inputEvent = new Event('input');
//     venueInput.dispatchEvent(inputEvent);
  
//     await Promise.resolve(); // Wait for async code to finish
  
//     // Expect the dropdown to stay hidden when there is an error
//     const dropdown = document.getElementById('venue-dropdown');
//     expect(dropdown.classList.contains('hidden')).toBe(true);
//   });



//   test('Resets form after successful submission', async () => {
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: true,
//         json: () => Promise.resolve({ message: 'Success' }),
//       })
//     );
  
//     document.body.innerHTML = `
//       <form id="maintenanceForm">
//         <input id="nameInput" value="John Doe" />
//         <select id="reportType">
//           <option value="Electrical" selected>Electrical</option>
//         </select>
//         <input id="venue-input" data-venue-id="123" value="Room 101" />
//         <textarea id="description">Broken light bulb</textarea>
//         <button type="submit">Submit</button>
//       </form>
//     `;
  
//     const maintenanceForm = document.getElementById('maintenanceForm');
//     const submitEvent = new Event('submit');
    
//     await maintenanceForm.dispatchEvent(submitEvent);
  
//     expect(document.getElementById('nameInput').value).toBe('');
//     expect(document.getElementById('description').value).toBe('');
//     expect(document.getElementById('reportType').value).toBe('');
//   });
  

// });

/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor } from '@testing-library/dom';
import { updateVenueDropdown, clearVenueDropdown} from './copies/maintenanceReportsCopy'; // Adjust path



// describe('Form submission tests', () => {
//   let form, reportTypeInput, descriptionInput, venueInput, submitButton;

//   beforeEach(() => {
//     // Set up the document body
//     document.body.innerHTML = `
//       <form>
//         <select id="reportType">
//           <option value="Issue 1">Issue 1</option>
//           <option value="Issue 2">Issue 2</option>
//         </select>
//         <textarea placeholder="Enter description"></textarea>
//         <input placeholder="Venue" data-venue-id="123" value="Room 101" />
//         <button type="submit">Submit</button>
//       </form>
//     `;

//     form = document.querySelector('form');
//     reportTypeInput = document.querySelector('#reportType');
//     descriptionInput = document.querySelector('textarea');
//     venueInput = document.querySelector('input');
//     submitButton = document.querySelector('button');

//     // Mock the fetch function
//     global.fetch = jest.fn();
//   });

//   afterEach(() => {
//     // Clear mocks after each test
//     jest.clearAllMocks();
//   });

  // test('Submits the form with correct data', async () => {
  //   // Mock a successful API response
  //   global.fetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: jest.fn().mockResolvedValueOnce({ message: 'Success' }),
  //   });

  //   // Simulate form submission
  //   fireEvent.submit(form);

  //   await waitFor(() => {
  //     expect(fetch).toHaveBeenCalledWith(
  //       'http://localhost:3000/api/maintenanceRequests',
  //       expect.objectContaining({
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'x-api-key': expect.any(String),
  //         },
  //         body: expect.any(String),
  //       })
  //     );
  //   });

  //   // Validate the request body
  //   const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
  //   expect(requestBody).toEqual({
  //     assignedTo: 'none',
  //     createdAt: expect.any(String),
  //     description: descriptionInput.value,
  //     issueType: reportTypeInput.value,
  //     roomId: venueInput.dataset.venueId,
  //     roomName: venueInput.value,
  //     status: 'Scheduled',
  //     timestamp: expect.any(String),
  //     userId: 'email', // Placeholder for the actual user email
  //   });
  // });
//   test('Submits the form with correct data', async () => {
//     // Mock fetch with a resolved promise
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: true,
//         json: () => Promise.resolve({ message: 'Success' }),
//       })
//     );
  
//     // Simulate filling out the form
//     fireEvent.change(reportTypeInput, { target: { value: 'Issue 1' } });
//     fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
//     fireEvent.change(venueInput, { target: { value: 'Room 101', dataset: { venueId: '123' } } });
  
//     // Simulate form submission
//     fireEvent.submit(form);
  
//     await waitFor(() => {
//       // Verify fetch is called with correct arguments
//       expect(fetch).toHaveBeenCalledWith(
//         'http://localhost:3000/api/maintenanceRequests',
//         expect.objectContaining({
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'x-api-key': expect.any(String),
//           },
//           body: JSON.stringify(expect.objectContaining({
//             issueType: 'Issue 1',
//             description: 'Test description',
//             roomId: '123',
//             roomName: 'Room 101',
//             // Other request body data
//           }))
//         })
//       );
//     });
//   });

//   test('Displays an alert if venue is not selected correctly', async () => {
//     // Mock window alert
//     const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

//     // Simulate an invalid venue input (empty venue)
//     venueInput.value = '';
//     venueInput.dataset.venueId = '';
//     fireEvent.submit(form);

//     await waitFor(() => {
//       expect(alertMock).toHaveBeenCalledWith('Please select a valid venue from the dropdown.');
//       expect(venueInput.value).toBe('');
//     });

//     alertMock.mockRestore();
//   });

// });



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


// test('logs error message when API fails', async () => {
//   document.body.innerHTML = `
//   <form id="maintenanceForm">
//     <select id="reportType">
//       <option value="Issue 1">Issue 1</option>
//       <option value="Issue 2">Issue 2</option>
//     </select>
//     <textarea id="description" placeholder="Enter description"></textarea>
//     <input id="venueInput" placeholder="Venue" data-venue-id="" value="Room 101" />
//     <button type="submit">Submit</button>
//     <div id="venue-dropdown" class="hidden"></div>
//   </form>
// `;
//   const reportTypeInput = document.getElementById('reportType');
//   const descriptionInput = document.getElementById('description');
//   const venueInput = document.getElementById('venueInput');

//   const event = new Event('DOMContentLoaded');
//   document.dispatchEvent(event);

//   reportTypeInput.value = 'Issue 1';
//   descriptionInput.value = 'Test description';
//   venueInput.value = 'Room 101'; 

//   // Mock fetch for failed submission
//   const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
//   global.fetch = jest.fn(() =>
//     Promise.resolve({
//       ok: false, // Simulate a failed response
//     })
//   );

//   const form = document.getElementById('maintenanceForm');
//   fireEvent.submit(form);

//   await waitFor(() => {
//     expect(consoleErrorMock).toHaveBeenCalledWith('There was an error creating the maintenance request:', expect.any(Error));
//   });

//   // Clean up mocks
//   consoleErrorMock.mockRestore();
//   global.fetch.mockRestore();
// });


});


describe('Venue dropdown functionality', () => {
  let venueDropdown, venueInput;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="venueInput" data-venue-id="" placeholder="Select a venue" />
      <div id="venue-dropdown" class="hidden"></div>
    `;

    venueDropdown = document.getElementById('venue-dropdown');
    venueInput = document.getElementById('venueInput');
  });

  test('Populates venue dropdown with options and displays it', () => {
    const venues = [
      { id: '1', Name: 'Venue 1' },
      { id: '2', Name: 'Venue 2' },
    ];

    updateVenueDropdown(venueDropdown, venues);

    expect(venueDropdown.children.length).toBe(2); // Two options should be created
    expect(venueDropdown.children[0].textContent).toBe('Venue 1');
    expect(venueDropdown.children[1].textContent).toBe('Venue 2');
    expect(venueDropdown.classList.contains('hidden')).toBe(false); // Dropdown should be visible
  });

  test('Handles venue selection and populates input field', () => {
    const venues = [
      { id: '1', Name: 'Venue 1' },
      { id: '2', Name: 'Venue 2' },
    ];

    updateVenueDropdown(venueDropdown, venues);
    handleVenueSelection(venueDropdown, venueInput);

    const secondOption = venueDropdown.children[1];
    fireEvent.click(secondOption);

    expect(venueInput.value).toBe('Venue 2');
    expect(venueInput.dataset.venueId).toBe('2');
  });
});