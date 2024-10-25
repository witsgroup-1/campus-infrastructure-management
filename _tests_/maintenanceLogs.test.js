
// Import functions to test
import { closePopup, saveChanges, openPopup, createRequestBlock, displayInitialRequestsForMobile, displayRequestsForDesktop, setupStaffSearch, updateStaffDropdown, clearStaffDropdown } from '../src/maintenance/maintenanceLogs';

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

// Mock data with roomName instead of roomId
// const mockData = [
//   {
//     roomName: 'Room 1',
//     createdAt: { seconds: 1609459200 },
//     timestamp: { seconds: 1609545600 },
//     status: 'Scheduled',
//     id: '1',
//     description: 'Test Description',
//     issueType: 'Test Issue',
//     assignedTo: 'John Doe'
//   }
// ];
const mockData = [
  {
    roomName: 'Room 1',
    createdAt: { seconds: 1609459200 },
    timestamp: { seconds: 1609545600 },
    status: 'Scheduled',
    id: '1',
    description: 'Test Description',
    issueType: 'Test Issue',
    assignedTo: 'John Doe'
  },
  {
    roomName: 'Room 1',
    createdAt: { seconds: 1609545600 },
    timestamp: { seconds: 1609632000 },
    status: 'In Progress',
    id: '2',
    description: 'Another Test Description',
    issueType: 'Another Test Issue',
    assignedTo: 'Jane Doe'
  },
  {
    roomName: 'Room 2',
    createdAt: { seconds: 1609632000 },
    timestamp: { seconds: 1609718400 },
    status: 'Completed',
    id: '3',
    description: 'Completed Description',
    issueType: 'Completion Issue',
    assignedTo: 'John Smith'
  }
];

// helper function to count visible children to improve tests
function countVisibleChildren(container) {
  return Array.from(container.children).filter(child => {
    return getComputedStyle(child).display !== 'none' && getComputedStyle(child).visibility !== 'hidden';
  }).length;
}



// unit tests for maintenance logs
describe('Script tests', () => {
  beforeEach(() => {
    
    document.getElementById('scheduled-content').innerHTML = '';
    document.getElementById('mobile-scheduled-content').innerHTML = '';
    
    // Mock location.reload
    delete window.location; 
    window.location = { reload: jest.fn() };  
   
    
  });

  test('fetches maintenance requests and displays them', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    await require('../src/maintenance/maintenanceLogs');

    // Trigger the DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Allow some time for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/maintenanceRequests', {
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

  test('displays requests for desktop with show more functionality', () => {
    displayRequestsForDesktop(mockData, 'scheduled-content');
    
    const scheduledContent = document.getElementById('scheduled-content');
    const visibleCount = countVisibleChildren(scheduledContent); // using the helper function to count the children
    console.log("visible count",visibleCount);
    expect(visibleCount).toBe(4); // the way we store the data so show more venue button, 2 requests same name and 1 extra request
  
    // check if "Show More" button is present for Room 1
    expect(scheduledContent.querySelector('button').textContent).toBe('Show More for this Venue');
  
    // simulate clicking the Show More button
    scheduledContent.querySelector('button').click();
  
    // check that all displayed
    const newVisibleCount = countVisibleChildren(scheduledContent);
    expect(newVisibleCount).toBe(3); // Expecting 3 children to be visible now - no show more
  });
  


  test('displays initial request for mobile and handles Show More button', () => {
    displayInitialRequestsForMobile(mockData, 'mobile-scheduled-content', 'show-more-scheduled');
    
    const mobileScheduledContent = document.getElementById('mobile-scheduled-content');
    expect(mobileScheduledContent.children.length).toBe(2); // Should show first request and button to show more

    // Check if the Show More button is created
    const showMoreButton = mobileScheduledContent.querySelector('button');
    expect(showMoreButton).toBeTruthy();
    expect(showMoreButton.textContent).toBe('Show More for this Venue');

    // Simulate button click to show more requests
    showMoreButton.click();

    // Verify if additional requests are shown
    expect(mobileScheduledContent.children.length).toBe(4); //buttons plus blocks
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
    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/maintenanceRequests/1', {
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
    expect(window.location.reload).toHaveBeenCalled();
  });

  test('closes popup', () => {
    closePopup();
    expect(document.getElementById('detailsModal').classList.contains('hidden')).toBe(true);
  });
});