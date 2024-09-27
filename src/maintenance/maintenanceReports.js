import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

import { getFirestore, collection, query, where, getDocs} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
  authDomain: "campusinfrastructuremanagement.firebaseapp.com",
  projectId: "campusinfrastructuremanagement",
  storageBucket: "campusinfrastructuremanagement.appspot.com",
  messagingSenderId: "981921503275",
  appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
  measurementId: "G-Y95YE5ZDRY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);



onAuthStateChanged(auth, (user) => {
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {

  if (user) {
    console.log("User is signed in with id:", user.email);
    
  } else {
    console.log("No user is signed in.");
  }
});

async function getFirestoreUserIdByEmail(email) {
  try {
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      
      const userDoc = querySnapshot.docs[0];
      const firestoreUserId = userDoc.id;
      return firestoreUserId;
    } else {
      throw new Error('No matching user document found in Firestore.');
    }
  } catch (error) {
    console.error('Error fetching Firestore userId by email:', error);
    return null;
  }
}

const venueInput = document.querySelector('input[placeholder="Venue"]'); // Ensure it's the right input field

document.addEventListener("DOMContentLoaded", () => {
    //add the event listener for the submit button
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault(); //prevent the default form submission

      const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW";   
      //collect the data that we need from the form
      //const reportType = document.querySelector('select[placeholder="Report Type"]').value;
      const reportType = document.querySelector('#reportType').value;
      const description = document.querySelector('textarea[placeholder="Enter description"]').value;
      // const venueId = document.querySelector('input[placeholder="Venue"]').dataset.venueId; // Get venue ID from dataset
      // const venueName = document.querySelector('input[placeholder="Venue"]').value;
      const venueId = venueInput.dataset.venueId; // Get the selected venue ID from the dataset
      const venueName = venueInput.value; // Get the venue name from the input field
  
      const userId = getFirestoreUserIdByEmail(user.email);
      //generate the timestamp
      const timestampNow = new Date().toISOString();
      //console.log(timestampNow);
      
      //data to be sent to the API
      const requestData = {
        assignedTo: 'none', // Default assigned value
        createdAt: timestampNow, // Generated timestamp
        description: description,
        issueType: reportType,
        roomId: venueId, // Use the selected venue ID
        roomName: venueName,
        status: 'Scheduled', //status starts as Scheduled 
        timestamp: timestampNow, //default status
        userId: '123' //we will replace with the user data
      };
  
      try {
        //Call API to create new maintenance requests
        //https://campus-infrastructure-management.azurewebsites.net
        //http://localhost:3000
        const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/maintenanceRequests', {
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
    //const venueInput = document.querySelector('input[placeholder="Venue"]');
    //const suggestionsList = document.getElementById('suggestionsList');
    const venueDropdown = document.getElementById('venue-dropdown');

venueInput.addEventListener('input', async (event) => {
    const query = event.target.value;

    if (query.length >= 2) {
        try {
            const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/venues?name=${query}`, {
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
          option.textContent = venue.Name; // Set the option's text to the venue name
          option.setAttribute('id', venue.id); // Store the venue ID as a data attribute
          venueDropdown.appendChild(option);
      });
      venueDropdown.classList.remove('hidden'); // Show the dropdown
  } else {
      clearVenueDropdown(); // Hide if no results
  }
}

venueDropdown.addEventListener('change', () => {
  // Get the selected option
  const selectedOption = venueDropdown.options[venueDropdown.selectedIndex];

  // get id and name
  const venueId = selectedOption.getAttribute('id');  
  const venueName = selectedOption.textContent;  
  // Set the input field to display the venue's name
  venueInput.value = venueName;
  // Store the venue id
  venueInput.dataset.venueId = venueId;

});


function clearVenueDropdown() {
    venueDropdown.innerHTML = ''; // Clear dropdown options
    venueDropdown.classList.add('hidden'); // Hide dropdown
}

venueDropdown.addEventListener('change', () => {
    venueInput.value = venueDropdown.value; // Set input value to selected option
    clearVenueDropdown(); // Hide dropdown after selection
});
});
