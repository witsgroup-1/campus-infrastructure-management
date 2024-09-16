// dashboard.test.js

import { getSidebarWidth, handleMenuIconClick, handleCloseButtonClick, handleNotifBellClick, handleMainButtonClick } from '../src/user-dashboard/dashboard.js';

describe('DOM Manipulation and Event Handling', () => {
    let sidebar, menuIcon, closeBtn, notifBell, notificationPanel, mainButton, reportButton, bookButton;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="menu-icon"></div>
            <div id="sidebar"></div>
            <div id="close-btn"></div>
            <div id="notif-bell"></div>
            <div id="notificationPanel" class="hidden"></div>
            <button id="main-button"></button>
            <button id="report-button" class="hidden"></button>
            <button id="book-button" class="hidden"></button>
        `;
        sidebar = document.getElementById('sidebar');
        menuIcon = document.getElementById('menu-icon');
        closeBtn = document.getElementById('close-btn');
        notifBell = document.getElementById('notif-bell');
        notificationPanel = document.getElementById('notificationPanel');
        mainButton = document.getElementById('main-button');
        reportButton = document.getElementById('report-button');
        bookButton = document.getElementById('book-button');
    });

    test('should expand sidebar when menu icon is clicked', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
        menuIcon.click();
        expect(sidebar.style.width).toBe('20%');

        Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
        menuIcon.click();
        expect(sidebar.style.width).toBe('33%');
    });

    test('should collapse sidebar when close button is clicked', () => {
        sidebar.style.width = '50%';
        closeBtn.click();
        expect(sidebar.style.width).toBe('0');
    });

    test('should toggle notification panel visibility when bell icon is clicked', () => {
        notifBell.click();
        expect(notificationPanel.classList.contains('hidden')).toBe(false);
        notifBell.click();
        expect(notificationPanel.classList.contains('hidden')).toBe(true);
    });

    test('should hide notification panel when clicking outside', () => {
        notifBell.click(); // Show notification panel
        expect(notificationPanel.classList.contains('hidden')).toBe(false);
        document.body.click(); // Click outside
        expect(notificationPanel.classList.contains('hidden')).toBe(true);
    });

    test('should show and hide additional buttons when main button is clicked', () => {
        mainButton.click();
        expect(reportButton.classList.contains('hidden')).toBe(false);
        expect(bookButton.classList.contains('hidden')).toBe(false);
        mainButton.click();
        expect(reportButton.classList.contains('hidden')).toBe(true);
        expect(bookButton.classList.contains('hidden')).toBe(true);
    });

    test('should navigate to correct pages when buttons are clicked', () => {
        // Mock window.location.href for navigation
        Object.defineProperty(window, 'location', {
            value: {
                href: ''
            },
            writable: true
        });

        reportButton.click();
        expect(window.location.href).toBe('../maintenance/maintenanceReports.html');

        bookButton.click();
        expect(window.location.href).toBe('../make-booking/book-venue.html');
    });
});
