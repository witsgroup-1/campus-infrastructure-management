
import { closePopup, saveChanges, openPopup, createRequestBlock, displayInitialRequestsForMobile, displayRequestsForDesktop, setupStaffSearch, updateStaffDropdown, clearStaffDropdown } from '../src/maintenance/maintenanceLogs';
import { fireEvent, waitFor } from '@testing-library/dom';  
import '@testing-library/jest-dom';  

document.body.innerHTML = `
  <input id="assigned-to" />
  <select id="staff-dropdown" class="hidden"></select>
`;


global.fetch = jest.fn();
fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockStaffData,
  });


const mockStaffData = [
  { name: 'Jane', surname: 'Doe', id: '1' },
  { name: 'John', surname: 'Smith', id: '2' },
];

describe('setupStaffSearch', () => {
  let inputEvent;
  let apiKey = 'test-api-key';

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
    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/users/?isLecturer=false&isTutor=false&role=Staff&?name=Jo', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Verify that the dropdown is populated with staff members
    const dropdown = document.getElementById('staff-dropdown');
    expect(dropdown.children.length).toBe(3);
    expect(dropdown.classList).not.toContain('hidden');
  });

  test('clears and hides dropdown when no query is provided', async () => {
    setupStaffSearch(apiKey);

    // Set empty query and dispatch the input event
    const searchInput = document.getElementById('assigned-to');
    searchInput.value = ''; 
    searchInput.dispatchEvent(inputEvent);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const dropdown = document.getElementById('staff-dropdown');
    expect(dropdown.children.length).toBe(0);
    expect(dropdown.classList).toContain('hidden');
  });

  
  test('handles API error gracefully', async () => {
    //Mock failed fetch response
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    setupStaffSearch(apiKey);
  
    const searchInput = document.getElementById('assigned-to');
    searchInput.value = 'Jo';
    searchInput.dispatchEvent(inputEvent);

    await new Promise((resolve) => setTimeout(resolve, 0));

    //Verify dropdown is cleared and hidden on error
    const dropdown = document.getElementById('staff-dropdown');
    expect(dropdown.children.length).toBe(0);
    expect(dropdown.classList).toContain('hidden');
  });

test('handles staff selection from dropdown', () => {
  setupStaffSearch(apiKey); //setup is called first

  const searchInput = document.getElementById('assigned-to');
  const dropdown = document.getElementById('staff-dropdown');


  dropdown.innerHTML = '';

  // Create and append a default "choose" option
  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Choose staff...';
  defaultOption.value = ''; 
  dropdown.appendChild(defaultOption);

  // Create an option with dataset attributes
  const option = document.createElement('option');
  option.dataset.staffName = 'Jane Doe';
  option.dataset.staffId = '1';
  option.value = '1';
  option.textContent = 'Jane Doe';
  dropdown.appendChild(option);

  dropdown.classList.remove('hidden');

  // Ensure the correct index is set
  dropdown.selectedIndex = 1;
  
  // Simulate change event on the dropdown
  fireEvent.change(dropdown);

  // Verify that input value and data attributes are updated
  expect(searchInput.value).toBe('Jane Doe');
  expect(searchInput.dataset.staffId).toBe('1');

 
});

});

