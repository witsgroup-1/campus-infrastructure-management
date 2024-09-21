import { displayRequestsForDesktop, displayInitialRequestsForMobile, createRequestBlock, openPopup, saveChanges, closePopup,  setupStaffSearch, updateStaffDropdown, clearStaffDropdown } from './copies/maintenanceLogsCopy'; 
import { fireEvent, waitFor } from '@testing-library/dom';  
import '@testing-library/jest-dom';  


document.body.innerHTML = `
  <input id="assigned-to" />
  <select id="staff-dropdown" class="hidden"></select>
`;

// fetch.mockResolvedValueOnce({
//     ok: true,
//     json: async () => mockStaffData,
//   });


const mockStaffData = [
  { name: 'Jane', surname: 'Doe', id: '1' },
  { name: 'John', surname: 'Smith', id: '2' },
];

describe('setupStaffSearch', () => {
  let inputEvent;
  let apiKey = 'test-api-key';
  //let apiKey = 'process.env.API_KEY_1'
  beforeEach(() => {
    global.fetch = jest.fn();
    inputEvent = new Event('input');
    document.getElementById('assigned-to').value = '';
    document.getElementById('staff-dropdown').innerHTML = '';
    document.getElementById('staff-dropdown').classList.add('hidden');
  });

  

  test('fetches staff members and populates dropdown when input is provided', async () => {
    // Mock fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaffData,
    });

    // Call the setupStaffSearch function
    setupStaffSearch(apiKey);

    // Set input value and dispatch the input event
    const searchInput = document.getElementById('assigned-to');
    searchInput.value = 'Jo'; 
    searchInput.dispatchEvent(inputEvent);

    // Allow async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify fetch was called with correct URL and headers
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/users/?isLecturer=false&isTutor=false&role=Staff&?name=Jo', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Verify that the dropdown is populated with staff members
    const dropdown = document.getElementById('staff-dropdown');
    expect(dropdown.children.length).toBe(2);
    expect(dropdown.classList).not.toContain('hidden');
  });

  test('clears and hides dropdown when no query is provided', async () => {
    setupStaffSearch(apiKey);

    // Set empty query and dispatch the input event
    const searchInput = document.getElementById('assigned-to');
    searchInput.value = ''; // Empty query
    searchInput.dispatchEvent(inputEvent);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const dropdown = document.getElementById('staff-dropdown');
    expect(dropdown.children.length).toBe(0);
    expect(dropdown.classList).toContain('hidden');
  });

  test('handles API error gracefully', async () => {
    // Mock failed fetch response
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    setupStaffSearch(apiKey);

    const searchInput = document.getElementById('assigned-to');
    searchInput.value = 'Jo';
    searchInput.dispatchEvent(inputEvent);

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify dropdown is cleared and hidden on error
    const dropdown = document.getElementById('staff-dropdown');
    expect(dropdown.children.length).toBe(0);
    expect(dropdown.classList).toContain('hidden');
  });

//   test('handles staff selection from dropdown', () => {
//     setupStaffSearch(apiKey);

//     const searchInput = document.getElementById('assigned-to');
//     const dropdown = document.getElementById('staff-dropdown');

//     // Populate dropdown with options
//     dropdown.innerHTML = `<option data-staff-name="Jane Doe" data-staff-id="1">Jane Doe</option>`;
//     dropdown.classList.remove('hidden');

//     // Simulate a click event on the dropdown
//     const option = dropdown.querySelector('option');
//     option.dispatchEvent(new Event('click'));

//     // Verify that input value and data attributes are updated
//     expect(searchInput.value).toBe('Jane Doe');
//     expect(searchInput.dataset.staffId).toBe('1');
//     expect(dropdown.classList).toContain('hidden');
//   });
test('handles staff selection from dropdown', () => {
    setupStaffSearch(apiKey);
  
    const searchInput = document.getElementById('assigned-to');
    const dropdown = document.getElementById('staff-dropdown');
  
    // Populate dropdown with an option
    const option = document.createElement('option');
    option.dataset.staffName = 'Jane Doe';
    option.dataset.staffId = '1';
    option.textContent = 'Jane Doe';
    dropdown.appendChild(option);
    
    dropdown.classList.remove('hidden');
  
    // Simulate a click event on the option
    option.dispatchEvent(new Event('click'));
  
    // Verify that input value and data attributes are updated
    expect(searchInput.value).toBe('Jane Doe');
    expect(searchInput.dataset.staffId).toBe('1');
    expect(dropdown.classList).toContain('hidden');
  });



});