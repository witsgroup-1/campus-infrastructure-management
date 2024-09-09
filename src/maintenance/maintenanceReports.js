document.addEventListener("DOMContentLoaded", () => {
    //add the event listener for the submit button
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault(); //prevent the default form submission
  
      //collect the data that we need from the form
      const reportType = document.querySelector('select[placeholder="Report Type"]').value;
      const description = document.querySelector('textarea[placeholder="Enter description"]').value;
      const venue = document.querySelector('input[placeholder="Venue"]').value;
  
  
      //generate the timestamp
      const timestamp = new Date().toISOString();
  
      //data to be sent to the API
      const requestData = {
        assignedTo: 'none', // Default assigned value
        createdAt: timestamp, // Generated timestamp
        description: description,
        issueType: reportType,
        roomId: venue,
        status: 'Open', //status starts as open
        userId: '12345' //we will replace with the user data
      };
  
      try {
        //Call API to create new maintenance requests
        const response = await fetch('/api/maintenanceRequests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY_1 
          },
          body: JSON.stringify(requestData)
        });
  
        if (!response.ok) {
          throw new Error('Failed to submit request');
        }
  
        //get the ID of the created maintenance request
        const { id } = await response.json();
  
        //create a maintenance log entry
        const logData = {
          actionBy: 'system',
          actionTaken: 'Scheduled',
          logId: 'log_' + Math.random().toString(36).substr(2, 9), // Generate a random log ID
          timestamp: timestamp 
        };
        //access the API for logs
        const logResponse = await fetch(`/api/maintenanceRequests/${id}/maintenanceLogs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY_1 
          },
          body: JSON.stringify(logData)
        });
  
        if (!logResponse.ok) {
          throw new Error('Failed to create maintenance log');
        }
  
        alert('Maintenance request created successfully with a scheduled log entry!');
        // Optionally, reset the form or redirect to another page
      } catch (error) {
        console.error(error);
        alert('There was an error creating the maintenance request');
      }
    });
  });
  