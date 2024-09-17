

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
    //const apiKey = document.querySelector('meta[name="api-key"]').getAttribute('content');
   
    //https://campus-infrastructure-management.azurewebsites.net

    //http://localhost:3000
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
    const completedRequests = maintenanceRequests.filter(req => req.status === 'Completed');

    // Display all requests for desktop view
    displayRequestsForDesktop(scheduledRequests, 'scheduled-content');
    displayRequestsForDesktop(inProgressRequests, 'in-progress-content');
    displayRequestsForDesktop(completedRequests, 'completed-content');

    // Display initial requests for mobile view and handle Show More
    displayInitialRequestsForMobile(scheduledRequests, 'mobile-scheduled-content', 'show-more-scheduled');
    displayInitialRequestsForMobile(inProgressRequests, 'mobile-in-progress-content', 'show-more-in-progress');
    displayInitialRequestsForMobile(completedRequests, 'mobile-completed-content', 'show-more-completed');

  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
  }
});

// Function to handle desktop view, loading all requests at once
function displayRequestsForDesktop(requests, containerId) {
  const container = document.getElementById(containerId);
  requests.forEach(request => {
    const block = createRequestBlock(request.roomId, new Date(request.createdAt.seconds * 1000).toLocaleString(), new Date(request.timestamp.seconds * 1000).toLocaleString(), request.status, request.id, request);
    container.appendChild(block);
  });
}

// Function to display one request initially for mobile and add Show More functionality
function displayInitialRequestsForMobile(requests, containerId, buttonId) {
  const container = document.getElementById(containerId);
  if (requests.length > 0) {
    // Display only the first item initially
    const firstRequest = requests[0];
    const block = createRequestBlock(firstRequest.roomId, new Date(firstRequest.createdAt.seconds * 1000).toLocaleString(), new Date(firstRequest.timestamp.seconds * 1000).toLocaleString(), firstRequest.status, firstRequest.id, firstRequest);
    container.appendChild(block);

    // Add event listener for the Show More button
    document.getElementById(buttonId).addEventListener('click', () => {
      requests.slice(1).forEach(request => {
        const block = createRequestBlock(request.roomId, new Date(request.createdAt.seconds * 1000).toLocaleString(), new Date(request.timestamp.seconds * 1000).toLocaleString(), request.status, request.id, request);
        container.appendChild(block);
      });
      // Hide the button after expanding
      document.getElementById(buttonId).style.display = 'none';
    });
  }
}



function createRequestBlock(roomId, createdAt, timestamp, status, id, request) {
  const displayDate = status === "Scheduled" ? createdAt : timestamp;

  const block = document.createElement('div');
  block.classList.add('bg-gray-200', 'p-4', 'rounded-md', 'mb-2', 'cursor-pointer');
  block.innerHTML = `
    <strong class="text-[#003B5C]">Venue: ${roomId}</strong><br> 
    <small class="text-gray-500">${displayDate}</small> 
  `;
  block.addEventListener('click', () => openPopup(id, request));
  return block;
}



function openPopup(id, request) {
  const { roomId, description, issueType, assignedTo, status, createdAt, timestamp } = request;

  const displayDate = status === "Scheduled"
      ? new Date(createdAt.seconds * 1000).toLocaleString()
      : timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'Not Set';

  document.getElementById('modal-content').innerHTML = `
    <p><strong>Room ID:</strong> ${roomId}</p>
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
}

async function saveChanges(id) {
  const updatedStatus = document.getElementById('status-select').value;
  const updatedAssignedTo = document.getElementById('assigned-to').value;
  const timestampInput = document.getElementById('timestamp-input').value;
  const timestamp = timestampInput ? new Date(timestampInput).toISOString() : null;

  const updatedData = {
    status: updatedStatus,
    assignedTo: updatedAssignedTo,
    ...(timestamp ? { timestamp } : {})
  };
 //https://campus-infrastructure-management.azurewebsites.net
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

function closePopup() {
  document.getElementById('detailsModal').classList.add('hidden');
}



module.exports = {closePopup,saveChanges,openPopup, createRequestBlock, displayInitialRequestsForMobile, displayRequestsForDesktop};
