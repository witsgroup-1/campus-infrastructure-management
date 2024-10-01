

let bookings=[];
let venues=[];
// API URLs
const bookingsUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/bookings';  
const venuesUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/venues';  

// Fetch venues from the API
function fetchVenues() {
  return fetch(venuesUrl, {
    method: 'GET',
    headers: {
      'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    venues = data; 
    //console.log(venues); 
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
  });
}

// Fetch bookings from the API
function fetchBookings() {
  return fetch(bookingsUrl, {
    method: 'GET',
    headers: {
      'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    bookings = data;
    //console.log(bookings); 
    renderBookings();  // Render bookings after fetching data
  })
  .catch(error => {
    console.error('Error fetching bookings:', error);
  });
}

// Function to get the venue info based on venueId
function getRoomInfo(venueId) {
    return venues.find(venue => venue.id === venueId);
  }
  

function getBookingInfo(bookingId) {

    for(let i=0;i<bookings.length;i++){
      if(bookingId==bookings[i].id){
        //console.log(bookings[i]);
        return bookings[i];
      }
      
    }
  }

// Function to render bookings based on current filters
function renderBookings() {
  const container = document.getElementById('bookingsContainer');
  container.innerHTML = ''; // Clear existing bookings

  const statusFilter = document.getElementById('statusFilter').value;
  const roomFilter = document.getElementById('roomFilter').value;
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();


  const filteredBookings = bookings.filter(booking => {
      const roomInfo = getRoomInfo(booking.venueId); // Get room info

      const matchesStatus = !statusFilter || booking.status.toLowerCase() === statusFilter;
      const matchesRoom = !roomFilter || (roomInfo && roomInfo.Category === roomFilter);
      const matchesSearch = !searchQuery || (roomInfo && roomInfo.Building.toLowerCase().includes(searchQuery));

      return matchesStatus && matchesRoom && matchesSearch;
  });

  if (filteredBookings.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-500">No bookings found.</p>';
      return;
  }

  // Create booking boxes
  filteredBookings.forEach(booking => {
      const roomInfo = getRoomInfo(booking.venueId); // Get room info
      if (roomInfo) {
          const bookingBox = document.createElement('div');
          bookingBox.className = 'flex items-center justify-between bg-gray-100 p-4 border border-gray-300 rounded-lg shadow';

          // Room Info
          const roomDetails = document.createElement('div');
          roomDetails.className = 'flex-shrink-0';
          roomDetails.innerHTML = `
              <h2 class="text-lg font-semibold">${roomInfo.Name}</h2>
              <p class="text-sm text-gray-600">Type: ${roomInfo.Category}</p>
              <p class="text-sm text-gray-600">Date: ${booking.date}</p>
              <p class="text-sm text-gray-600">Time: ${booking.start_time} - ${booking.end_time}</p>
              <p class="text-sm text-gray-600">Purpose: ${booking.purpose}</p>
              <p class="text-sm text-gray-600 font-semibold">Status: ${booking.status}</p>
          `;
          bookingBox.appendChild(roomDetails);

          const actionButtons = document.createElement('div');
          actionButtons.className = 'flex flex-row space-x-2';

          // Only add the edit button
          if (booking.status.toLowerCase() != "pending") {
              const editButton = document.createElement('button');
              editButton.className = 'bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none';
              editButton.textContent = 'Edit';
              editButton.onclick = () => editBooking(booking.id);
              actionButtons.appendChild(editButton);
          }

          // Adding cancel, accept, and reject buttons based on booking status
          if (booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase()==='accepted' ||booking.status.toLowerCase()==='approved') {
              const cancelButton = document.createElement('button');
              cancelButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none';
              cancelButton.textContent = 'Cancel';
              cancelButton.onclick = () => cancelBooking(booking.id);
              actionButtons.appendChild(cancelButton);
          } else if (booking.status.toLowerCase() === 'pending') {
              const acceptButton = document.createElement('button');
              acceptButton.className = 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none';
              acceptButton.textContent = 'Accept';
              acceptButton.onclick = () => acceptBooking(booking.id);
              actionButtons.appendChild(acceptButton);

              const rejectButton = document.createElement('button');
              rejectButton.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none';
              rejectButton.textContent = 'Reject';
              rejectButton.onclick = () => rejectBooking(booking.id);
              actionButtons.appendChild(rejectButton);
          }

          bookingBox.appendChild(actionButtons);
          container.appendChild(bookingBox);
      }
  });
}


 async function editBooking(id) {
    window.location.href = `editBooking.html?bookingId=${id}`;
   await fetchBookings();
  }


  
  async function cancelBooking(id) {
    const bookingId = id;  
    const url = `https://campus-infrastructure-management.azurewebsites.net/api/bookings/id/${bookingId}`;
    const url2 =`https://campus-infrastructure-management.azurewebsites.net/api/bookings/${bookingId}`;
    
    let bookingData = {};

    // Prompt admin for the reason for cancellation
    const reasonForCancellation = prompt("Please provide a reason for cancelling this booking:");

    if (!reasonForCancellation) {
        alert("Cancellation reason is required to proceed.");
        return;
    }

    try {
        
        const bookingData=getBookingInfo(bookingId);

        // Destructure the necessary fields from bookingData
        const { userId, venueId, roomId, start_time, end_time, purpose, date } = bookingData;
        const url3 =`https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings/${purpose}`
        const url4 =`https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}/date/bookings/${purpose}`

        // Update the booking status to 'cancelled'
        const updateResponse = await fetch(url2, {
            method: 'PUT',
            headers: {
                'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'Cancelled'
            })
        });

        const updateResponse2 = await fetch(url3, {
          method: 'PUT',
          headers: {
              'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              status: 'Cancelled'
          })
      });

      const updateResponse3 = await fetch(url4, {
        method: 'PUT',
        headers: {
            'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'Cancelled'
        })
    });

        if (!updateResponse.ok) {
            throw new Error('Failed to update booking status');
        }

        // Fetch the venue name
        const venueData= getRoomInfo(venueId);

        const venueName = venueData.Name; // Assuming venueData contains a 'name' field

        // Create a notification message
        const notificationMessage = `Your previously accepted booking for ${purpose} on ${date} from ${start_time} to ${end_time} at ${venueName} has been cancelled. Reason: ${reasonForCancellation}. We apologize for the inconvenience.`;

        // Add the notification to the user's subcollection
        const userNotificationUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/notifications`;
        await fetch(userNotificationUrl, {
            method: 'POST',
            headers: {
                'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: notificationMessage,
                type:"notification",
                sendAt: "09:00"
             })
        });

        alert('Booking cancelled and notification sent.');

        await fetchBookings();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while cancelling the booking.');
    }


}


async function acceptBooking(id) {
    const bookingId = id;  
    const url = `https://campus-infrastructure-management.azurewebsites.net/api/bookings/id/${bookingId}`; 
    const url2= `https://campus-infrastructure-management.azurewebsites.net/api/bookings/${bookingId}`;
    let bookingData;  // Use let to allow re-assignment

    try {
        // Fetch the booking data
        const bookingData=getBookingInfo(bookingId)

        // Destructure the necessary fields from bookingData
        const { userId, venueId, roomId, start_time, end_time, purpose, date } = bookingData;
        const url3 =`https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings/${purpose}`
        const url4 =`https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}/date/bookings/${purpose}`

        // Update the booking status
        const updateResponse = await fetch(url2, {
            method: 'PUT',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'Approved' // Change to 'confirmed' upon acceptance
            })
        });

        const updateResponse2 = await fetch(url3, {
          method: 'PUT',
          headers: {
              'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              status: 'Approved' // Change to 'confirmed' upon acceptance
          })
      });

      const updateResponse3 = await fetch(url4, {
        method: 'PUT',
        headers: {
            'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'Approved' // Change to 'confirmed' upon acceptance
        })
    });

        if (!updateResponse.ok) {
            throw new Error('Failed to update booking status');
        }

        // Fetch venue details
        const venueData=getRoomInfo(bookingData.venueId)

        console.log(venueData); 
        const venueName = venueData.Name; // Assuming venueData contains a 'Name' field

        // Create a notification message
        const notificationMessage = `Your booking for ${purpose} on ${bookingData.date} from ${start_time} to ${end_time} at ${venueName} has been successfully confirmed.`;

        // Ensure notifications subcollection exists
        const userNotificationUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/notifications`;
        

        // Add the notification to the user's subcollection
        await fetch(userNotificationUrl, {
            method: 'POST',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: notificationMessage,
                                    type: "Notification",
                                    sendAt:"09:00"
             })
        });

        alert('Booking successfully confirmed and notification sent.');
        await fetchBookings();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while confirming the booking.');
    }

}




async function rejectBooking(id) {
  const bookingId = id;  
  const url = `https://campus-infrastructure-management.azurewebsites.net/api/bookings/id/${bookingId}`;
  const url2 = `https://campus-infrastructure-management.azurewebsites.net/api/bookings/${bookingId}`;
  let bookingData = {};

  try {
      // Fetch booking data
        bookingData=getBookingInfo(bookingId);

      // Destructure the necessary fields from bookingData
      const { userId, venueId, roomId, start_time, end_time, purpose, date } = bookingData;
      const url3 =`https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/bookings/${purpose}`
      const url4 =`https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}/date/bookings/${purpose}`


      // Update the booking status to 'rejected'
      const updateResponse = await fetch(url2, {
          method: 'PUT',
          headers: {
              'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              status: 'Rejected' // Change to 'rejected'
          })
      });

      const updateResponse2 = await fetch(url3, {
        method: 'PUT',
        headers: {
            'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'Rejected' // Change to 'rejected'
        })
    });

    const updateResponse3 = await fetch(url4, {
      method: 'PUT',
      headers: {
          'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          status: 'Rejected' // Change to 'rejected'
      })
  });

      if (!updateResponse.ok) {
          throw new Error('Failed to update booking status');
      }

      
      const venueInfo=getRoomInfo(bookingData.venueId);

      const venueName = venueInfo.Name; 
      // Create a notification message
      const notificationMessage = `We regret to inform you that your booking for ${purpose} on ${date} from ${start_time} to ${end_time} at ${venueName} has been rejected. We apologize for the inconvenience caused. Please consider booking another venue for your purpose.`;

      // Add the notification to the user's subcollection
      const userNotificationUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/notifications`;
      //const curTime=new Date().toISOString;
      await fetch(userNotificationUrl, {
          method: 'POST',
          headers: {
              'x-api-key':'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: notificationMessage,
            type: "Notification",
            sendAt:"09:00"
})
      });

      alert('Booking rejected.');
      await fetchBookings();

  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while rejecting the booking.');
  }

}


// Initial fetch for venues and bookings
document.addEventListener('DOMContentLoaded', () => {
  fetchVenues().then(fetchBookings);  // Fetch venues first, then fetch bookings
});


// document.getElementById('statusFilter').addEventListener('change', renderBookings);
// document.getElementById('roomFilter').addEventListener('change', renderBookings);
// document.getElementById('searchInput').addEventListener('input', renderBookings);


module.exports={ bookings, venues, fetchVenues, fetchBookings, getRoomInfo, getBookingInfo, renderBookings, cancelBooking, acceptBooking }