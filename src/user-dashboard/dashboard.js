import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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
            console.log('User document ID:', userDocId);
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


onAuthStateChanged(auth, async (user) => {
    if (user) {
        const email = user.email;
        
        // Store email in localStorage 
        localStorage.setItem('userEmail', email);

        // Get user document ID by email
        const userDocId = await getUserDocumentByEmail(email);
        if (userDocId) {
            localStorage.setItem('userId', userDocId);
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
        console.log("userId:",userId);
        // Use the email (e.g., display it, use it in queries, etc.)
        document.getElementById('userEmailDisplay').textContent = `Logged in as: ${userEmail}`;
    } else {
        console.log('No email found');
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

    sidebar.style.width = '0';

    menuIcon.addEventListener('click', () => {
        if (sidebar.style.width === '0px' || sidebar.style.width === '0') {
            sidebar.style.width = getSidebarWidth();
        } else {
            sidebar.style.width = '0';
        }
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.width = '0';
    });

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0px' && sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth();
        }
    });

    const fetchNotifications = async () => {
        try {
            if (!userId) {
                console.log('No userId found');
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

    // `read` status in case needed
                    if (notification.read) {
                        li.classList.add('read-notification'); 
                    } else {
                        li.classList.add('unread-notification'); 
                    }
    
                    notificationList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
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
            isExpanded = true;
        } else {
            reportButton.classList.add('hidden');
            bookButton.classList.add('hidden');
            isExpanded = false;
        }
    });

    reportButton.addEventListener('click', () => {
        window.location.href = '../maintenance/maintenanceReports.html';
    });

    bookButton.addEventListener('click', () => {
        window.location.href = '../make-booking/book-venue.html';
    });
});



