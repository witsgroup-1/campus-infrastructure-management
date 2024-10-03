
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const db = getFirestore(app);

const venueInput = document.querySelector('input[placeholder="Venue"]'); 

document.addEventListener("DOMContentLoaded", () => {
//auth get current user
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is signed in with");
  } else {
    console.log("No user is signed in.");
  }

  const apiKey = "QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW"; 
  const venueDropdown = document.getElementById('venue-dropdown');
  const venueInput = document.querySelector('input[placeholder="Venue"]');
  
  // Add event listener for the submit button
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission


    const reportType = document.querySelector('#reportType').value;
    const description = document.querySelector('textarea[placeholder="Enter description"]').value;
    const venueId = venueInput.dataset.venueId; // Get the selected venue ID from dataset
    const venueName = venueInput.value; // Get venue name from input field

    // Check if a valid venue is selected
    if (!venueId || venueName === '') {
      alert('Please select a valid venue from the dropdown.');
      venueInput.value = ''; // Clear the input field
      venueInput.dataset.venueId = '';
      clearVenueDropdown(venueDropdown); // Clear and hide dropdown
      return;
    }

    const requestData = {
      assignedTo: 'none',
      createdAt: new Date().toISOString(),
      description: description,
      issueType: reportType,
      roomId: venueId,
      roomName: venueName,
      status: 'Scheduled',
      timestamp: new Date().toISOString(),
      userId: user.email // Store user email
    };

    try {
      const response = await fetch('http://localhost:3000/api/maintenanceRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error('Failed to submit request');

      //console.log('Maintenance request created successfully!');
      document.querySelector("form").reset();
    } catch (error) {
      alert('Something went wrong, please try again later.');
      
    }
  });

 // Handle input in the venue input field
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
      updateVenueDropdown(venues, venueDropdown); // Populate the dropdown with venues
    } catch (error) {
      // console.error("Error fetching venues:", error);
      clearVenueDropdown(venueDropdown); // Clear the dropdown in case of an error
    }
  } else {
    clearVenueDropdown(venueDropdown); // Clear dropdown if input is too short
  }
});

// Function to update the dropdown with fetched venues
function updateVenueDropdown(venues, venueDropdown) {
  clearVenueDropdown(venueDropdown); // Clear any previous entries
  // Add a default option that is not selectable
  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Please select a venue...';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  venueDropdown.appendChild(defaultOption);

  if (venues.length > 0) {
    venues.forEach((venue) => {
      const option = document.createElement('option');
      option.textContent = venue.Name;
      option.dataset.id = venue.id; 
      venueDropdown.appendChild(option);
    });
    venueDropdown.classList.remove('hidden'); 
  } else {
    clearVenueDropdown(venueDropdown); 
  }
}

// Function to handle venue selection
venueDropdown.addEventListener('change', (event) => {
  const selectedOption = event.target.options[event.target.selectedIndex];
  const venueId = selectedOption.dataset.id;
  const venueName = selectedOption.textContent;
  // Update input field with selected venue name
  venueInput.value = venueName; 
  venueInput.dataset.venueId = venueId; 
  clearVenueDropdown(venueDropdown); // Clear the dropdown after selection
});

// Function to clear the dropdown
function clearVenueDropdown(venueDropdown) {
  venueDropdown.innerHTML = ''; // Clear the dropdown content

  venueDropdown.classList.add('hidden'); // Hide the dropdown
}

// Ensure dropdown is hidden initially
clearVenueDropdown(venueDropdown);

window.updateVenueDropdown = updateVenueDropdown;
window.clearVenueDropdown = clearVenueDropdown;


//end of auth
});
//end of dom
});
