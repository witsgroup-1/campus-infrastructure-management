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

    if (userEmail) {
        console.log('User email:', userEmail);
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

    menuIcon.addEventListener('click', () => {
        sidebar.style.width = getSidebarWidth(); 
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.width = '0'; 
    });

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth();
        }
    });

    notifBell.addEventListener('click', () => {
        notificationPanel.classList.toggle('hidden');
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

    reportButton.addEventListener('click', ()=>{
        window.location.href = '../maintenance/maintenanceReports.html'
    })

    bookButton.addEventListener('click', ()=>{
        window.location.href = '../make-booking/book-venue.html'
    })
});


