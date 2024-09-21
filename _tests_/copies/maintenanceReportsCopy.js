
document.addEventListener("DOMContentLoaded", () => {
    //add the event listener for the submit button
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault(); //prevent the default form submission
  
      const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";   
      //collect the data that we need from the form
      //const reportType = document.querySelector('select[placeholder="Report Type"]').value;
      const reportType = document.querySelector('#reportType').value;
      const description = document.querySelector('textarea[placeholder="Enter description"]').value;
      const venue = document.querySelector('input[placeholder="Venue"]').value;
  
      
      //generate the timestamp
      const timestampNow = new Date().toISOString();
      //console.log(timestampNow);
  
      //data to be sent to the API
      const requestData = {
        assignedTo: 'none', // Default assigned value
        createdAt: timestampNow, // Generated timestamp
        description: description,
        issueType: reportType,
        roomId: venue,
        status: 'Scheduled', //status starts as Scheduled 
        timestamp: timestampNow, //default status
        userId: '12345' //we will replace with the user data
      };
  
      try {
        //Call API to create new maintenance requests
        
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

        //alert('Maintenance request created successfully!');
        console.log('Maintenance request created successfully!');

        document.querySelector("form").reset();
        //document.querySelector("form").reset();
        console.log(document.querySelector("#reportType").value); // Should log an empty string


      } catch (error) {
        console.error(error);
        //alert('There was an error creating the maintenance request');
        console.error('There was an error creating the maintenance request');
      }
    });
  });
  

  