import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Firebase configuration
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

const db = getFirestore(app);
const auth = getAuth(app);


const getUserDocumentByEmail = async (email) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userDocId = userDoc.id;
            return userDocId;
        } else {
            console.log('No user document found with the given email.');
            return null;
        }
    } catch (error) {
        console.error('Error getting user document by email:', error);
        return null;
    }
};


const getGreetingMessage = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
        return { message: 'Good morning', emoji: '🌅' }; // Sunrise emoji
    } else if (hour >= 12 && hour < 17) {
        return { message: 'Good afternoon', emoji: '☀️' }; // Sun emoji
    } else if (hour >= 17 && hour < 21) {
        return { message: 'Good evening', emoji: '🌇' }; // Sunset emoji
    } else {
        return { message: 'Goodnight', emoji: '🌙' }; // Moon emoji
    }
};


onAuthStateChanged(auth, async (user) => {
    if (user) {
        const email = user.email;

        localStorage.setItem('userEmail', email);

        const userDocId = await getUserDocumentByEmail(email);
        if (userDocId) {
            localStorage.setItem('userId', userDocId);
            const userDoc = await getDoc(doc(db, 'users', userDocId)); 

            // Fetch the name from the document
            const userName = userDoc.data().name || 'User';  // Default to 'User' if name not found

            // Get the appropriate greeting and emoji based on the time of day
            const { message, emoji } = getGreetingMessage();
            const greetingElement = document.getElementById('userGreeting');
            greetingElement.textContent = `${emoji} ${message}, ${userName}!`;

            const isTutor = userDoc.data().isTutor || false;
            const isLecturer = userDoc.data().isLecturer || false;
            const role = userDoc.data().role || '';
            const isAdmin = !isTutor && !isLecturer && role === 'Staff';

            if (isAdmin) {
                document.getElementById('admin-link').style.display = 'block'; // Show admin link
                document.getElementById('admin-link').addEventListener('click', () => {
                    window.location.href = "../adminDashboard/adminDashboard.html"; // Redirect to admin page
                });
            } else {
                document.getElementById('admin-link').addEventListener('click', (event) => {
                    event.preventDefault();
                    showModal("Oops! Only admins can access this.");
                });
            }
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const notifBell = document.getElementById('notif-bell');
    const notificationPanel = document.getElementById('notificationPanel');
    const mainButton = document.getElementById('main-button');
    const reportButton = document.getElementById('report-button');
    const bookButton = document.getElementById('book-button');

    const userEmail = localStorage.getItem('userEmail');
    const userId= localStorage.getItem('userId');
    const notificationsUrl = `https://campus-infrastructure-management.azurewebsites.net/api/users/${userId}/notifications`;

    if (userEmail) {
        console.log('User email:', userEmail);
        // Use the email (e.g., display it, use it in queries, etc.)
    }

   



    const getSidebarWidth = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1024) {
            return '20%';
        } else if (screenWidth >= 768) {
            return '33%';
        } else {
            return '50%';
        }
    };
      // Initialize the sidebar to be closed
      sidebar.style.width = '0'; // Keep the sidebar closed by default

  

    menuIcon.addEventListener('click', () => {
        if (sidebar.style.width === '0px' || sidebar.style.width === '0') {
            sidebar.style.width = getSidebarWidth(); // Open the sidebar
            localStorage.setItem('sidebarState', 'open'); // Store the state as open
        } else {
            sidebar.style.width = '0'; // Close the sidebar
            localStorage.setItem('sidebarState', 'closed'); // Store the state as closed
        }
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.width = '0'; // Close the sidebar
        localStorage.setItem('sidebarState', 'closed'); // Store the state as closed
    });

    // Close sidebar when clicking outside of it
    document.addEventListener('click', (event) => {
        if (sidebar.style.width !== '0px' && !sidebar.contains(event.target) && !menuIcon.contains(event.target)) {
            sidebar.style.width = '0';
            localStorage.setItem('sidebarState', 'closed'); // Store the state as closed
        }
    });

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0px' && sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth(); // Adjust sidebar width on window resize
        }
    });


    const link = document.getElementById('reservationLink');
    
    // Construct the URL with the variable
    link.href = `../make-reservation/makeReservation.html?reservationId=${userId}&userEmail=${userEmail}`;

    



const fetchNotifications = async () => {
    try {
        const loader = document.getElementById('loader');
        loader.classList.remove('hidden'); // Show loader

        if (!userId) {
            console.log('No userId found');
            loader.classList.add('hidden'); // Hide loader
            return;
        }

        const response = await fetch(notificationsUrl, {
            method: 'GET',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error('Error fetching notifications:', response.status, errorText);
            loader.classList.add('hidden'); // Hide loader
            return;
        }

        const notifications = await response.json();

        // Check if there are notifications
        const notificationList = notificationPanel.querySelector('ul');
        notificationList.innerHTML = ''; // Clear existing notifications

        if (notifications.length === 0) {
            notificationList.innerHTML = '<li class="text-[#917248]">No new notifications</li>';
        } else {
            notifications.forEach(notification => {
                const li = document.createElement('li');
                li.textContent = notification.message || 'New Notification';
                li.classList.add('notification-item');

                // Apply read status styling
                if (notification.read) {
                    li.classList.add('read-notification'); 
                } else {
                    li.classList.add('unread-notification'); 
                }

                // Create delete icon
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('fas', 'fa-trash-alt', 'delete-icon');
                deleteIcon.addEventListener('click', async () => {
                    const confirmDelete = confirm('Are you sure you want to delete this notification?');
                    if (confirmDelete) {
                        try {
                            await deleteNotification(notification.id);
                            fetchNotifications(); // Refresh notifications list
                        } catch (error) {
                            console.error('Error deleting notification:', error);
                        }
                    }
                });

                li.appendChild(deleteIcon); // Append delete icon to each notification item
                notificationList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    } finally {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden'); // Hide loader
    }
};

// Function to delete a notification
const deleteNotification = async (notificationId) => {
    try {
        const deleteUrl = `${notificationsUrl}/${notificationId}`;
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error('Error deleting notification:', response.status, errorText);
            return;
        }

        console.log('Notification deleted successfully');
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
};

    
    
    
    notifBell.addEventListener('click', () => {
        notificationPanel.classList.toggle('hidden');
        if (!notificationPanel.classList.contains('hidden')) {
            fetchNotifications(); // Fetch notifications when the panel is shown
        }
    });

    document.addEventListener('click', (event) => {
        if (!notifBell.contains(event.target) && !notificationPanel.contains(event.target)) {
            notificationPanel.classList.add('hidden');
        }
    });

    let isExpanded = false;

mainButton.addEventListener('click', () => {
    if (!isExpanded) {
        reportButton.classList.remove('hidden');
        bookButton.classList.remove('hidden');
        mainButton.textContent = '×';  // Change the plus button to an X symbol
        isExpanded = true;
    } else {
        reportButton.classList.add('hidden');
        bookButton.classList.add('hidden');
        mainButton.textContent = '+';  // Change the X button back to a plus symbol
        isExpanded = false;
    }
});

    reportButton.addEventListener('click', () => {
        window.location.href = '../maintenance/maintenanceReports.html';
    });

    bookButton.addEventListener('click', () => {
        window.location.href = '../make-booking/book-venue.html';
    });

    fetchSecurityContact();
});

const showModal = (message) => {
    const modal = document.createElement('div');
    modal.className = 'modal'; // Add styles for the modal
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(modal);
    
   
    modal.querySelector('.close').onclick = function() {
        modal.style.display = "none";
        document.body.removeChild(modal); 
    };
    
    modal.style.display = "block"; 
};

//const proxyUrl = 'https://api.allorigins.win/raw?url=';
const securityUrl = 'https://campus-infrastructure-management.azurewebsites.net/api/contacts'
//const securityUrl = 'https://polite-pond-04aadc51e.5.azurestaticapps.net/api/contacts'
const ourSecurityUrl = `https://campus-infrastructure-management.azurewebsites.net/api/securityInfo`;

async function fetchSecurityContact() {
    const loading = document.getElementById('loading');
    try {

        loading.style.display = 'block';
        const response = await fetch(securityUrl, {
            method: 'GET',
           // mode: 'no-cors',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const securityInfo = await response.json();

        const section = document.getElementById('security_info');
        section.innerHTML = ''; 

        const usedIds = ['-O6xQK5q9Fou9kqC4DNL', '-O6xQN7-MLjFy6qUh0uQ', '-O6xQP17b0jz4OsdIPyC', '-O6xQRwE4VB5iab1PS-P'];

        if (typeof securityInfo === 'object' && securityInfo !== null) {
            Object.values(securityInfo).forEach(info => {
                if(usedIds.includes(info.id)){

                    const contact_details = document.createElement('div');

                    const phoneNumbers = info.phone.join(', '); 
                    
                    contact_details.innerHTML = `
                        <span class="text-xs text-white">${info.name}:</span>
                        <span class="text-xs text-gray-300">${phoneNumbers}</span>
                    `;
                    section.appendChild(contact_details);
                }
            });
        } else {
            console.error('Unexpected data format for securityInfo:', securityInfo);
        }

    } catch (err) {
        console.error('Error fetching security contact information:', err);
        fetchOurSecurityContact();
    }
    finally {
        loading.style.display = 'none';
    }
}


async function fetchOurSecurityContact() {
    try {
        const response = await fetch(ourSecurityUrl, {
            method: 'GET',
            headers: {
                'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const securityInfo = await response.json();
    
        const section = document.getElementById('security_info');
        section.innerHTML = ''; 

        securityInfo.forEach(info => {
            const contact_details = document.createElement('div');

            contact_details.innerHTML = `
            <span class="text-xs text-white">${info.Name}:</span>
            <span class="text-xs text-gray-300">${info['Contact Number']}</span>
            `;
           // contact_details.textContent = `${info.Name}: ${info['Contact Number']}`;
            section.appendChild(contact_details);
        });

    } catch (error) {
        console.error('Error fetching security contact information:', error);
    }
}

