

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
      clearVenueDropdown(); // Clear and hide dropdown
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
      userId: user.email // Update with the actual user email
    };

    try {
      const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/maintenanceRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error('Failed to submit request');

      console.log('Maintenance request created successfully!');
      document.querySelector("form").reset();
    } catch (error) {
      console.error('There was an error creating the maintenance request:', error);
    }
  });

  // Function to handle venue input changes and fetch matching venues
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
        clearVenueDropdown();
        //console.error('Error fetching venues:', error);
      }
    } else {
      clearVenueDropdown();
    }
  });

  // Function to update the dropdown with fetched venues
  function updateVenueDropdown(venues) {
    clearVenueDropdown();
    if (venues.length > 0) {
      venues.forEach(venue => {
        const option = document.createElement('option');
        option.textContent = venue.Name;
        option.dataset.id = venue.id; // Store the venue ID in dataset
        venueDropdown.appendChild(option);
      });
      venueDropdown.classList.remove('hidden');
    } else {
      clearVenueDropdown();
    }
  }

  // Handle selection from the dropdown
  venueDropdown.addEventListener('click', (event) => {
    if (event.target.tagName === 'OPTION') {
      const selectedOption = event.target;
      const venueId = selectedOption.dataset.id;
      const venueName = selectedOption.textContent;

      venueInput.value = venueName; // Update input field with selected name
      venueInput.dataset.venueId = venueId; // Store the selected venue ID
      clearVenueDropdown(); // Clear dropdown after selection
    }
  });

  // Function to clear the dropdown
  function clearVenueDropdown() {
    venueDropdown.innerHTML = ''; // Clear dropdown content
    venueDropdown.classList.add('hidden'); // Hide dropdown
  }
});
