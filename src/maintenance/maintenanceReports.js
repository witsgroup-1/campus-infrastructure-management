// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
//   authDomain: "campusinfrastructuremanagement.firebaseapp.com",
//   projectId: "campusinfrastructuremanagement",
//   storageBucket: "campusinfrastructuremanagement.appspot.com",
//   messagingSenderId: "981921503275",
//   appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
//   measurementId: "G-Y95YE5ZDRY"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig)

// const auth = getAuth(app);

// const firestoreUserId = await getFirestoreUserIdByEmail(userEmail);
// console.log(firestoreUserId)

// if (firestoreUserId) {

// } else {
//   console.error('Could not find Firestore userId for the given email.');
// }


// onAuthStateChanged(auth, (user) => {
// if (user) {
//   console.log("User is signed in with email:", user.email);
// } else {
//   console.log("No user is signed in.");
// }});



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
        //https://campus-infrastructure-management.azurewebsites.net
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

  document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW"; 
    const venueInput = document.querySelector('input[placeholder="Venue"]');
    //const suggestionsList = document.getElementById('suggestionsList');
    const venueDropdown = document.getElementById('venue-dropdown');

venueInput.addEventListener('input', async (event) => {
    const query = event.target.value;

    if (query.length >= 2) {
        try {
            const response = await fetch(`http://localhost:3000/api/venues?name=${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch venues');
            const venues = await response.json();
            updateVenueDropdown(venues);
        } catch (error) {
            //console.error('Error fetching venues:', error);
            clearVenueDropdown();
        }
    } else {
        clearVenueDropdown();
    }
});


function updateVenueDropdown(venues) {
  clearVenueDropdown(); // Clear previous options
  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Select a venue...';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  venueDropdown.appendChild(defaultOption); // Add default option

  if (venues.length > 0) {
      venues.forEach(venue => {
          const option = document.createElement('option');
          option.value = venue.Name; // Set value to the venue name
          option.textContent = venue.Name; // Display the venue name
          venueDropdown.appendChild(option);
      });
      venueDropdown.classList.remove('hidden'); // Show the dropdown
  } else {
      clearVenueDropdown(); // Hide if no results
  }
}

// Handle selection from the dropdown
venueDropdown.addEventListener('change', () => {
  venueInput.value = venueDropdown.value; // Set input value to selected option
  //clearVenueDropdown(); // Hide dropdown after selection
});




function clearVenueDropdown() {
    venueDropdown.innerHTML = ''; // Clear dropdown options
    venueDropdown.classList.add('hidden'); // Hide dropdown
}

// Optional: Handle selection from the dropdown
venueDropdown.addEventListener('change', () => {
    venueInput.value = venueDropdown.value; // Set input value to selected option
    clearVenueDropdown(); // Hide dropdown after selection
});
});



  
// document.addEventListener("DOMContentLoaded", () => {
//   const apiKey = "QGbXcci4doXiHamD5gyGXCbvlC5Sv7SEWh7QO6PewW";   
//   const venueInput = document.getElementById('venue-input');
//   const suggestionsList = document.getElementById('venue-suggestions');

//   // Form submission logic remains unchanged
//   document.querySelector("form").addEventListener("submit", async (e) => {
//     e.preventDefault(); 

//     const reportType = document.querySelector('#reportType').value;
//     const description = document.querySelector('textarea[placeholder="Enter description"]').value;
//     const venue = venueInput.value;

//     const timestampNow = new Date().toISOString();

//     const requestData = {
//       assignedTo: 'none',
//       createdAt: timestampNow,
//       description: description,
//       issueType: reportType,
//       roomId: venue,
//       status: 'Scheduled',
//       timestamp: timestampNow,
//       userId: '12345' 
//     };

//     try {
//       const response = await fetch('http://localhost:3000/api/maintenanceRequests', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-api-key': apiKey 
//         },
//         body: JSON.stringify(requestData)
//       });

//       if (!response.ok) {
//         throw new Error('Failed to submit request');
//       }

//       console.log('Maintenance request created successfully!');
//       document.querySelector("form").reset();

//     } catch (error) {
//       console.error('Error creating maintenance request:', error);
//     }
//   });

//   // Venue search functionality
//   venueInput.addEventListener('input', async (e) => {
//     const query = e.target.value;
    
//     if (query.length >= 2) {
//       try {
//         const response = await fetch(`http://localhost:3000/api/venues?name=${query}`, {
//           method: 'GET',
//           headers: {
//             'x-api-key': apiKey,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (response.ok) {
//           const venues = await response.json();
//           updateSuggestionsDropdown(venues);
//         } else {
//           clearSuggestionsDropdown();
//         }
//       } catch (error) {
//         console.error('Error fetching venues:', error);
//         clearSuggestionsDropdown();
//       }
//     } else {
//       clearSuggestionsDropdown(); 
//     }
//   });

//   function updateSuggestionsDropdown(venues) {
//     suggestionsList.innerHTML = ''; // Clear previous suggestions

//     venues.forEach(venue => {
//       const suggestionItem = document.createElement('li');
//       suggestionItem.textContent = venue.name; 
//       suggestionItem.classList.add('suggestion-item');

//       suggestionItem.addEventListener('click', () => {
//         venueInput.value = venue.name;
//         clearSuggestionsDropdown(); 
//       });

//       suggestionsList.appendChild(suggestionItem);
//     });

//     suggestionsList.classList.remove('hidden'); // Show the dropdown
//   }

//   function clearSuggestionsDropdown() {
//     suggestionsList.innerHTML = ''; 
//     suggestionsList.classList.add('hidden'); 
//   }
// });



