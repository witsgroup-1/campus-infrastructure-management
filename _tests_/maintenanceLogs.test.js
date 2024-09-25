
// Import functions to test
import { displayRequestsForDesktop, displayInitialRequestsForMobile, createRequestBlock, openPopup, saveChanges, closePopup,  setupStaffSearch, updateStaffDropdown, clearStaffDropdown } from './copies/maintenanceLogsCopy'; 
import '@testing-library/jest-dom';  

// Mock the DOM methods and fetch
global.fetch = jest.fn();
document.body.innerHTML = `
  <div id="scheduled-content"></div>
  <div id="in-progress-content"></div>
  <div id="completed-content"></div>
  <div id="mobile-scheduled-content"></div>
  <div id="mobile-in-progress-content"></div>
  <div id="mobile-completed-content"></div>
  <button id="show-more-scheduled"></button>
  <button id="show-more-in-progress"></button>
  <button id="show-more-completed"></button>
  <div id="detailsModal" class="hidden">
    <div id="modal-content"></div>
  </div>
`;

// Mock data
const mockData = [
 
    {
      roomId: 'Room 1',
      createdAt: { seconds: 1609459200 },
      timestamp: { seconds: 1609545600 },
      status: 'Scheduled',
      id: '1',
      description: 'Test Description',
      issueType: 'Test Issue',
      assignedTo: 'John Doe'
    }

];

describe('Script tests', () => {
  beforeEach(() => {

    document.getElementById('scheduled-content').innerHTML = '';
    document.getElementById('mobile-scheduled-content').innerHTML = '';
  });

  test('fetches maintenance requests and displays them', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    await require('./copies/maintenanceLogsCopy');

      // Trigger the DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Allow some time for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));


    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/maintenanceRequests', {
      method: 'GET',
      headers: {
        'x-api-key': expect.any(String),
        'Content-Type': 'application/json'
      }
    });

    // Check if the requests are correctly displayed
    expect(document.getElementById('scheduled-content').children.length).toBe(1);
    expect(document.getElementById('mobile-scheduled-content').children.length).toBe(1);
  });

  test('displays requests for desktop', () => {
    displayRequestsForDesktop(mockData, 'scheduled-content');
    expect(document.getElementById('scheduled-content').children.length).toBe(1);
  });

  test('displays initial request for mobile and handles Show More button', () => {
    displayInitialRequestsForMobile(mockData, 'mobile-scheduled-content', 'show-more-scheduled');
    expect(document.getElementById('mobile-scheduled-content').children.length).toBe(1);
    
    // Simulate button click to show more requests
    document.getElementById('show-more-scheduled').click();
    expect(document.getElementById('mobile-scheduled-content').children.length).toBe(mockData.length);
  });

  test('creates request block', () => {
    const block = createRequestBlock('Room 1', '01/01/2021, 12:00:00 AM', '01/02/2021, 12:00:00 AM', 'Scheduled', '1', mockData[0]);
    expect(block).toBeInstanceOf(HTMLDivElement);
    expect(block.innerHTML).toContain('Venue: Room 1');
  });

  test('opens popup with correct content', () => {
    openPopup('1', mockData[0]);
    expect(document.getElementById('modal-content').innerHTML).toContain('Room 1');
  });

  test('saves changes and updates request', async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await saveChanges('1');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/maintenanceRequests/1', {
      method: 'PUT',
      headers: {
        'x-api-key': expect.any(String),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'Scheduled',
        assignedTo: 'John Doe'
      })
    });


    // Additional checks to ensure the popup closes and page reloads
    expect(document.getElementById('detailsModal').classList.contains('hidden')).toBe(true);
  });

  test('closes popup', () => {
    closePopup();
    expect(document.getElementById('detailsModal').classList.contains('hidden')).toBe(true);
  });


});



