
//wait for dom to load
document.addEventListener("DOMContentLoaded", async () => {

  try {
    const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
    //https://campus-infrastructure-management.azurewebsites.net
    //http://localhost:3000

    //get maintenance requests
    const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/maintenanceRequests', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const maintenanceRequests = await response.json();

    const scheduledRequests = maintenanceRequests.filter(req => req.status === 'Scheduled');
    const inProgressRequests = maintenanceRequests.filter(req => req.status === 'In Progress');

    const completedRequests = maintenanceRequests.filter(req => {
      if (req.status === 'Completed') {
          const now = new Date();
          const completedTime = new Date(req.timestamp.seconds * 1000); 
          const hoursPassed = (now - completedTime) / (1000 * 60 * 60); 
          return hoursPassed <= 48; 
      }
      return false;
  });
    // Display all requests for desktop view
    displayRequestsForDesktop(scheduledRequests, 'scheduled-content');
    displayRequestsForDesktop(inProgressRequests, 'in-progress-content');
    displayRequestsForDesktop(completedRequests, 'completed-content');

    // Display initial requests for mobile view and handle Show More
    displayInitialRequestsForMobile(scheduledRequests, 'mobile-scheduled-content', 'show-more-scheduled');
    displayInitialRequestsForMobile(inProgressRequests, 'mobile-in-progress-content', 'show-more-in-progress');
    displayInitialRequestsForMobile(completedRequests, 'mobile-completed-content', 'show-more-completed');

  } catch (error) {
    //robustness
    alert('Something went wrong, please try again later');
  }
});

// Function to handle desktop view, loading all requests at once
// function displayRequestsForDesktop(requests, containerId) {
//   const container = document.getElementById(containerId);
//   requests.forEach(request => {
//     const block = createRequestBlock(request.roomName, new Date(request.createdAt.seconds * 1000).toLocaleString(), new Date(request.timestamp.seconds * 1000).toLocaleString(), request.status, request.id, request);
//     container.appendChild(block);
//   });
// }

function displayRequestsForDesktop(requests, containerId) {
  const container = document.getElementById(containerId);

  // Group requests by roomName
  const venueGroups = requests.reduce((acc, request) => {
    const roomName = request.roomName || 'Unknown Venue';
    if (!acc[roomName]) acc[roomName] = [];
    acc[roomName].push(request);
    return acc;
  }, {});

  // display only the first request in each venue group
  Object.keys(venueGroups).forEach(roomName => {
    const roomRequests = venueGroups[roomName];
    const firstRequest = roomRequests[0];

    // Create a block for the first request
    const block = createRequestBlock(
      firstRequest.roomName,
      new Date(firstRequest.createdAt.seconds * 1000).toLocaleString(),
      new Date(firstRequest.timestamp.seconds * 1000).toLocaleString(),
      firstRequest.status,
      firstRequest.id,
      firstRequest
    );
    // Append the block to the container
    container.appendChild(block);

    // if there are additional requests for this room, add a "Show More" button
  
    if (roomRequests.length > 1) {
      
      const showMoreButton = document.createElement('button');
      showMoreButton.textContent = 'Show More for this Venue';
      showMoreButton.classList.add('bg-gray-400', 'text-white', 'p-2', 'rounded' );

      const additionalContainer = document.createElement('div');
      additionalContainer.classList.add('additional-requests', 'hidden'); 

      // event listener to display remaining requests for this room only
      showMoreButton.addEventListener('click', () => {
        roomRequests.slice(1).forEach(request => {
          const additionalBlock = createRequestBlock(
            request.roomName,
            new Date(request.createdAt.seconds * 1000).toLocaleString(),
            new Date(request.timestamp.seconds * 1000).toLocaleString(),
            request.status,
            request.id,
            request
          );
          additionalContainer.appendChild(additionalBlock); 
        });
        // Show the additional requests and hide the button
        additionalContainer.classList.remove('hidden');
        showMoreButton.style.display = 'none';
      });

      // Append the show more button and the additional container to the main container
      container.appendChild(showMoreButton);
      container.appendChild(additionalContainer);
    }
  });
}

//function to set up the data for the staff drop down
async function setupStaffSearch(apiKey) {
  const searchInput = document.getElementById('assigned-to');
  const staffDropdown = document.getElementById('staff-dropdown');

  if (searchInput) {
    //get all the staff memebers (admin)
    searchInput.addEventListener('input', async (event) => {
      const query = event.target.value;

      if (query.length >= 2) {
        try {
          const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/users/?isLecturer=false&isTutor=false&role=Staff&?name=${query}`, {
            method: 'GET',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const staffMembers = await response.json();
          updateStaffDropdown(staffMembers);
        } catch (error) {
          
          clearStaffDropdown(); // Clear dropdown on error
        }
      } else {
        clearStaffDropdown();
      }
    });
    //event listener to check for changes (so if you click a staff memeber)
    staffDropdown.addEventListener('change', (event) => {
      const selectedOption = event.target.options[event.target.selectedIndex];
      const selectedStaff = selectedOption.dataset.staffName;
      const selectedStaffId = selectedOption.dataset.staffId;
  
      
      if (selectedStaff && selectedStaffId) {
        searchInput.value = selectedStaff;
        searchInput.dataset.staffId = selectedStaffId;

      }
    });
  } else {
    console.warn('Assigned To input not found on the page.');
  }
}
//functionn to update the list in the staff dropdown
function updateStaffDropdown(staffMembers) {
  const staffDropdown = document.getElementById('staff-dropdown');
  staffDropdown.innerHTML = ''; // Clear existing options

  // Add the unselectable placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.textContent = 'Please select staff member';
  placeholderOption.disabled = true; // Make it unselectable
  placeholderOption.selected = true; // Make it the default selected option
  staffDropdown.appendChild(placeholderOption);

  // Populate dropdown with staff members
  if (staffMembers.length > 0) {
    staffMembers.forEach((staff) => {
      const option = document.createElement('option');
      option.classList.add('staff-option');
      option.textContent = `${staff.name} ${staff.surname}`;
      option.dataset.staffName = `${staff.name} ${staff.surname}`; // Store full name
      option.dataset.staffId = staff.id; // Store ID for later use

      staffDropdown.appendChild(option);
    });

    staffDropdown.classList.remove('hidden'); // Show the dropdown
  } else {
    clearStaffDropdown(); // Hide if no results
  }
}


function clearStaffDropdown() {
  const staffDropdown = document.getElementById('staff-dropdown');
  staffDropdown.innerHTML = ''; // Clear dropdown
  staffDropdown.classList.add('hidden'); // Hide dropdown
}

// Function to display one request initially for mobile
// function displayInitialRequestsForMobile(requests, containerId, buttonId) {
//   const container = document.getElementById(containerId);
//   if (requests.length > 0) {
//     // Display only the first item initially
//     const firstRequest = requests[0];
//     const block = createRequestBlock(firstRequest.roomName, new Date(firstRequest.createdAt.seconds * 1000).toLocaleString(), new Date(firstRequest.timestamp.seconds * 1000).toLocaleString(), firstRequest.status, firstRequest.id, firstRequest);
//     container.appendChild(block);

//     // Add event listener for the Show More button
//     document.getElementById(buttonId).addEventListener('click', () => {
//       requests.slice(1).forEach(request => {
//         const block = createRequestBlock(request.roomName, new Date(request.createdAt.seconds * 1000).toLocaleString(), new Date(request.timestamp.seconds * 1000).toLocaleString(), request.status, request.id, request);
//         container.appendChild(block);
//       });
//       // Hide the button after expanding
//       document.getElementById(buttonId).style.display = 'none';
//     });
//   }
// }


function displayInitialRequestsForMobile(requests, containerId, mainButtonId) {
  const container = document.getElementById(containerId);

  // sorting requests alphabetically by room name
  requests.sort((a, b) => a.roomName.localeCompare(b.roomName));

  // group the requests by roomId
  const venueGroups = requests.reduce((acc, request) => {
    const venueId = request.roomId || 'unknown';
    if (!acc[venueId]) acc[venueId] = [];
    acc[venueId].push(request);
    return acc;
  }, {});

  const venueIds = Object.keys(venueGroups);

  // Show the first request of the first venue initially
  if (venueIds.length > 0) {
    const firstVenueRequests = venueGroups[venueIds[0]];
    const firstRequest = firstVenueRequests[0];

    const block = createRequestBlock(
      firstRequest.roomName,
      new Date(firstRequest.createdAt.seconds * 1000).toLocaleString(),
      new Date(firstRequest.timestamp.seconds * 1000).toLocaleString(),
      firstRequest.status,
      firstRequest.id,
      firstRequest
    );
    container.appendChild(block);

    // Add "Show More for this Venue" for additional requests in the first venue
    if (firstVenueRequests.length > 1) {
      const subShowMoreButton = createSubShowMoreButton(firstVenueRequests.slice(1), container, firstVenueRequests);
      container.appendChild(subShowMoreButton);
    }
  }

  // the main "Show More" button for additional venues
  document.getElementById(mainButtonId).addEventListener('click', () => {
    venueIds.slice(1).forEach(venueId => {
      const venueRequests = venueGroups[venueId];
      const firstRequest = venueRequests[0];

      const block = createRequestBlock(
        firstRequest.roomName,
        new Date(firstRequest.createdAt.seconds * 1000).toLocaleString(),
        new Date(firstRequest.timestamp.seconds * 1000).toLocaleString(),
        firstRequest.status,
        firstRequest.id,
        firstRequest
      );
      container.appendChild(block);

      // Add sub "Show More for this Venue" for additional requests in this venue
      if (venueRequests.length > 1) {
        const subShowMoreButton = createSubShowMoreButton(venueRequests.slice(1), container, venueRequests);
        container.appendChild(subShowMoreButton);
      }
    });

    
    document.getElementById(mainButtonId).style.display = 'none';
  });
}


// helper function to create a sub-level "Show More" button for mobile view
function createSubShowMoreButton(additionalRequests, container, venueRequests) {
  const subShowMoreButton = document.createElement('button');
  subShowMoreButton.textContent = 'Show More for this Venue';
  subShowMoreButton.classList.add('bg-gray-400', 'text-white', 'p-2', 'rounded', 'mt-2', 'text-sm');

  subShowMoreButton.addEventListener('click', () => {
    // insert additional requests right after the first request block for this venue
    additionalRequests.forEach(request => {
      const additionalBlock = createRequestBlock(
        request.roomName,
        new Date(request.createdAt.seconds * 1000).toLocaleString(),
        new Date(request.timestamp.seconds * 1000).toLocaleString(),
        request.status,
        request.id,
        request
      );
      // insert the additional blocks after the first block for this venue
      const firstBlock = container.lastElementChild; 
      container.insertBefore(additionalBlock, subShowMoreButton); // Insert before the show more button
    });
    subShowMoreButton.style.display = 'none'; 
  });

  return subShowMoreButton;
}


//function to create a request block based on the maintenance reports
function createRequestBlock(roomName, createdAt, timestamp, status, id, request) {
  const displayDate = status === "Scheduled" ? createdAt : timestamp;

  //create the html for the block
  const block = document.createElement('div');
  block.classList.add('bg-gray-200', 'p-4', 'rounded-md', 'mb-2', 'cursor-pointer');
  block.innerHTML = `
    <strong class="text-[#003B5C]">Venue: ${roomName}</strong><br> 
    <small class="text-gray-500">${displayDate}</small> 
  `;

  //macke it clickable
  block.addEventListener('click', () => openPopup(id, request));
  return block;
}


//openPopup function
function openPopup(id, request) {
  const { roomName, description, issueType, assignedTo, status, createdAt, timestamp } = request;

  //the date they show is conditional
  const displayDate = status === "Scheduled"
      ? new Date(createdAt.seconds * 1000).toLocaleString()
      : timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'Not Set';

  //generate the html  
  document.getElementById('modal-content').innerHTML = `
    <p><strong>Room ID:</strong> ${roomName}</p>
    <p><strong>Description:</strong> ${description}</p>
    <p><strong>Issue Type:</strong> ${issueType}</p>
    <label><strong>Status:</strong>
      <select id="status-select" class="border p-2 mt-1 rounded">
        <option value="Scheduled" ${status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
        <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Completed" ${status === 'Completed' ? 'selected' : ''}>Completed</option>
      </select>
    </label>
    <p><strong>Assigned To:</strong> 
      <input id="assigned-to" class="border p-2 mt-1 rounded w-full" type="text" value="${assignedTo}" />
      <select id="staff-dropdown" class="border p-2 mt-1 rounded w-full hidden"></select>
    </p>
    <p><strong>Date:</strong> 
      <input id="timestamp-input" class="border p-2 mt-1 rounded w-full" type="datetime-local" 
        value="${status === 'Scheduled' ? '' : timestamp ? new Date(timestamp.seconds * 1000).toISOString().slice(0, 16) : ''}" 
        ${status === 'Scheduled' ? 'disabled' : ''} />
      <small>${status === 'Scheduled' ? `Created At: ${displayDate}` : `Timestamp: ${displayDate}`}</small>
    </p>
    <button onclick="saveChanges('${id}')" class="mt-4 bg-[#917248] text-white p-2 rounded">Save Changes</button>
  `;

  document.getElementById('detailsModal').classList.remove('hidden');

  // Call setupStaffSearch
  setupStaffSearch('QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW');
}

//function to save changes to the maintenance request db via API
async function saveChanges(id) {
  const updatedStatus = document.getElementById('status-select').value;
  const updatedAssignedTo = document.getElementById('assigned-to').value;
  const timestampInput = document.getElementById('timestamp-input').value;
  let timestamp = timestampInput ? new Date(timestampInput).toISOString() : null;

    if (updatedStatus === 'Completed') {
        timestamp = new Date().toISOString();  // Set to current time if "Completed"
    }

  const updatedData = {
    status: updatedStatus,
    assignedTo: updatedAssignedTo,
    ...(timestamp ? { timestamp } : {})
  };
 //update the requests
  try {
    const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
    const response = await fetch(`https://campus-infrastructure-management.azurewebsites.net/api/maintenanceRequests/${id}`, {
      method: 'PUT',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      console.log('Request updated successfully');
      closePopup();
      
      location.reload();
    } else {
      console.log('Failed to update request');
    }
  } catch (error) {
    console.error('Error updating request:', error);
  }
}

//if they close the popup - this function hides it for us
function closePopup() {
  document.getElementById('detailsModal').classList.add('hidden');
}

export { saveChanges, closePopup, openPopup, createRequestBlock, displayInitialRequestsForMobile, displayRequestsForDesktop, setupStaffSearch, updateStaffDropdown, clearStaffDropdown };

window.saveChanges = saveChanges;
window.openPopup = openPopup;
window.closePopup = closePopup;