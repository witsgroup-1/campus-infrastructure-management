// dashboard.js

export function getSidebarWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1024) {
        return '20%';
    } else if (screenWidth >= 768) {
        return '33%';
    } else {
        return '50%';
    }
}

export function handleMenuIconClick(sidebar) {
    sidebar.style.width = getSidebarWidth();
}

export function handleCloseButtonClick(sidebar) {
    sidebar.style.width = '0';
}

export function handleNotifBellClick(notificationPanel) {
    notificationPanel.classList.toggle('hidden');
}

export function handleMainButtonClick(reportButton, bookButton, isExpanded) {
    if (!isExpanded) {
        reportButton.classList.remove('hidden');
        bookButton.classList.remove('hidden');
        return true;
    } else {
        reportButton.classList.add('hidden');
        bookButton.classList.add('hidden');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const notifBell = document.getElementById('notif-bell');
    const notificationPanel = document.getElementById('notificationPanel');
    const mainButton = document.getElementById('main-button');
    const reportButton = document.getElementById('report-button');
    const bookButton = document.getElementById('book-button');

    menuIcon.addEventListener('click', () => handleMenuIconClick(sidebar));
    closeBtn.addEventListener('click', () => handleCloseButtonClick(sidebar));

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth();
        }
    });

    notifBell.addEventListener('click', () => handleNotifBellClick(notificationPanel));

    document.addEventListener('click', (event) => {
        if (!notifBell.contains(event.target) && !notificationPanel.contains(event.target)) {
            notificationPanel.classList.add('hidden');
        }
    });

    let isExpanded = false;

    mainButton.addEventListener('click', () => {
        isExpanded = handleMainButtonClick(reportButton, bookButton, isExpanded);
    });

    reportButton.addEventListener('click', () => {
        window.location.href = '../maintenance/maintenanceReports.html';
    });

    bookButton.addEventListener('click', () => {
        window.location.href = '../make-booking/book-venue.html';
    });
});
