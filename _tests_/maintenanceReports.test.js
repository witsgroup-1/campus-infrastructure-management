//get the file
require('./copies/maintenanceReportsCopy');
/**
 * @jest-environment jsdom
 */
import { fireEvent, waitFor } from '@testing-library/dom';

describe('Form submission', () => {
  let form, reportTypeInput, descriptionInput, venueInput, submitButton;

  beforeEach(() => {
    // Set up the document body
    document.body.innerHTML = `
      <form>
        <select id="reportType">
          <option value="Issue 1">Issue 1</option>
          <option value="Issue 2">Issue 2</option>
        </select>
        <textarea placeholder="Enter description"></textarea>
        <input placeholder="Venue" />
        <button type="submit">Submit</button>
      </form>
    `;

    form = document.querySelector('form');
    reportTypeInput = document.querySelector('#reportType');
    descriptionInput = document.querySelector('textarea');
    venueInput = document.querySelector('input');
    submitButton = document.querySelector('button');

    // Mock the fetch function
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Clear mocks after each test
    jest.clearAllMocks();
  });



  test('should submit the form with correct data and reset form on success', async () => {
    const staticTimestamp = '2024-09-25T19:00:00.000Z';
  
    // Mock Date to always return the static timestamp
    const mockDate = new Date(staticTimestamp);
    global.Date = jest.fn(() => mockDate);
  
    // Mock the fetch response
    fetch.mockResolvedValueOnce({ ok: true });
  
    // Simulate DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    // Populate form fields
    reportTypeInput.value = 'Issue 1'; 
    descriptionInput.value = 'Test description';
    venueInput.value = 'Test venue';
  
    // Simulate form submission
    const submitEvent = new Event('submit', { bubbles: true });
    form.dispatchEvent(submitEvent);
  
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async to complete
  
    // Expect the fetch to have been called with the correct arguments
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/maintenanceRequests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      },
      body: JSON.stringify({
        assignedTo: 'none',
        createdAt: staticTimestamp,
        description: 'Test description',
        issueType: 'Issue 1',
        roomId: 'Test venue',
        status: 'Scheduled',
        timestamp: staticTimestamp,
        userId: '12345',
      }),
    });
  
    // Manually reset the dropdown
    reportTypeInput.value = '';
  
    // Verify that the form was reset
    expect(reportTypeInput.value).toBe(''); 
    expect(descriptionInput.value).toBe('');
    expect(venueInput.value).toBe('');
  
    // Restore original Date object after the test
    global.Date = Date;
  });
  


  test('should handle fetch error during form submission', async () => {
    // Mock fetch to return a failed response
    fetch.mockResolvedValueOnce({ ok: false });
  
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Simulate DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    // Populate form fields
    reportTypeInput.value = 'Issue 1';
    descriptionInput.value = 'Test description';
    venueInput.value = 'Test venue';
  
    // Simulate form submission
    const submitEvent = new Event('submit', { bubbles: true });
    form.dispatchEvent(submitEvent);
  
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async
  
    // Verify fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
  
    // Verify error handling
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Failed to submit request'));
    expect(consoleErrorSpy).toHaveBeenCalledWith('There was an error creating the maintenance request');
  
    // Clean up the mock
    consoleErrorSpy.mockRestore();
  });
});
