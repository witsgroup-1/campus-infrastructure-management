// // Import the file that contains the event listener (formHandler.js)
//require('../src/maintenance/maintenanceReports.js');
require('./copies/maintenanceReportsCopy');

/**
 * @jest-environment jsdom
 */
import { fireEvent, waitFor } from '@testing-library/dom';

describe('Maintenance Request Form', () => {
  let form, reportType, description, venue, submitButton;

  beforeEach(() => {
    //mock the html
    document.body.innerHTML = `
      <form>
        <select id="reportType">
          <option value="">Select a report type</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
        </select>
        <textarea placeholder="Enter description"></textarea>
        <input placeholder="Venue" />
        <button type="submit">Submit</button>
      </form>
    `;

    // Select form elements
    form = document.querySelector('form');
    reportType = document.querySelector('#reportType');
    description = document.querySelector('textarea[placeholder="Enter description"]');
    venue = document.querySelector('input[placeholder="Venue"]');
    submitButton = document.querySelector('button[type="submit"]');

    // Mock fetch before the test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    //mock the event listener
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelector("form").addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent the default form submission

       
        const apiKey = process.env.API_KEY_1;

        //get mock data for our fetch request
        const timestampNow = new Date().toISOString();

        const requestData = {
          assignedTo: 'none',
          createdAt: timestampNow,
          description: description,
          issueType: reportType,
          roomId: venue,
          status: 'Scheduled',
          timestamp: timestampNow,
          userId: '12345'
        };
        //try the fetch - mock it with data
        try {
          const response = await fetch('http://localhost:3000/api/maintenanceRequests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey
            },
            body: JSON.stringify(requestData)
          });

          if (!response.ok) {
            throw new Error('Failed to submit request');
          }

          console.log('Maintenance request created successfully!');
          
          document.querySelector("form").reset();
        } catch (error) {
          console.error('There was an error creating the maintenance request');
        }
      });
    });

    // Trigger DOMContentLoaded manually in the test environment
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  afterEach(() => {
    // Reset the fetch mock after each test
    jest.clearAllMocks();
  });

  it('should submit the form and reset it', async () => {
    // Mocking console methods
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Set initial values
    reportType.value = 'Electrical';
    description.value = 'Broken socket';
    venue.value = 'Room 305';
  
    // Simulate form submission
    fireEvent.submit(form);
  
    // Wait for the async form submission to complete
    await waitFor(() => {
      // Check if fetch was called correctly
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/maintenanceRequests', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': expect.any(String)
        },
        body: expect.any(String)
      }));
  
      // Verify form reset
      
      expect(description.value).toBe('');
      expect(venue.value).toBe('');
      expect(reportType.value).toBe('');
      // Check for console log success message
      expect(consoleLogSpy).toHaveBeenCalledWith('Maintenance request created successfully!');
    });
  
    // Restore spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  

  it('should log an error on failed request', async () => {
    // Force fetch to fail
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));

    // Spy on console.log and console.error
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Fill in form fields
    reportType.value = 'Electrical';
    description.value = 'Broken socket';
    venue.value = 'Room 305';

    // Simulate form submission
    fireEvent.submit(form);

    // Wait for the async process
    await waitFor(() => {
      // Check if the error message was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('There was an error creating the maintenance request');
    });

    // Restore the spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
