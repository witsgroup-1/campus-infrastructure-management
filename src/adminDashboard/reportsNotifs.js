

        const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
        const apiBaseUrl = 'https://campus-infrastructure-management.azurewebsites.net/api';

        
        async function fetchData(endpoint) {
            try {
                const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`Error fetching data from ${endpoint}:`, error);
                return null;
            }
        }

        async function fetchMaintenanceRequests() {
            const data = await fetchData('/maintenanceRequests');
            if (data) {
                displayMaintenanceRequests(data);
            }
        }

        async function fetchMaintenanceRequests() {
        try {
            const response = await fetch(`${apiBaseUrl}/maintenanceRequests`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const requests = await response.json();
            const filteredRequests = filterRequestsByLast48Hours(requests);

            displayNotifications(filteredRequests);
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
        }
    }

    // Function to filter requests from the last 48 hours
    function filterRequestsByLast48Hours(requests) {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // Subtract 2 days (48 hours)

        return requests.filter(request => {
            const createdAt = new Date(request.createdAt.seconds * 1000); // Assuming createdAt is a Firestore timestamp
            return createdAt >= twoDaysAgo;
        });
    }

    // Function to display notifications
    function displayNotifications(requests) {
        const notificationPanel = document.getElementById('notificationPanel');
        const notificationList = notificationPanel.querySelector('ul');
        
        // Clear the existing list
        notificationList.innerHTML = '';

        if (requests.length === 0) {
            notificationList.innerHTML = '<li class="text-[#917248]">No new notifications</li>';
        } else {
            requests.forEach(request => {
                const requestItem = document.createElement('li');
                requestItem.classList.add('text-[#003B5C]');
                requestItem.textContent = `Maintenance Request: ${request.issueType} - ${new Date(request.createdAt.seconds * 1000).toLocaleString()}`;
                notificationList.appendChild(requestItem);
            });
        }
    }

    // Fetch and display maintenance requests on page load
    fetchMaintenanceRequests();

    // Event listener for the notification bell to toggle panel visibility
    document.getElementById('notif-bell').addEventListener('click', () => {
        const notificationPanel = document.getElementById('notificationPanel');
        notificationPanel.classList.toggle('hidden');
    });