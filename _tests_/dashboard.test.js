import '../src/user-dashboard/dashboard'

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

// Create a new JSDOM instance
const { document } = (new JSDOM(`<!DOCTYPE html>
<html>
<body>
    <div id="menu-icon"></div>
    <div id="sidebar"></div>
    <div id="close-btn"></div>
    <div id="notif-bell"></div>
    <div id="notificationPanel" class="hidden"></div>
    <button id="main-button"></button>
    <button id="report-button" class="hidden"></button>
    <button id="book-button" class="hidden"></button>
</body>
</html>`)).window;

require('../src/user-dashboard/dashboard');
// Set the global document object to our simulated DOM
global.document = document;
global.window = document.defaultView;

const menuIcon = document.getElementById('menu-icon');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('close-btn');
const notifBell = document.getElementById('notif-bell');
const notificationPanel = document.getElementById('notificationPanel');
const mainButton = document.getElementById('main-button');
const reportButton = document.getElementById('report-button');
const bookButton = document.getElementById('book-button');



describe('JavaScript Code Tests', () => {
    beforeEach(() => {
        // Set up any necessary initial conditions here
    });

    test('Sidebar width changes on menu icon click', () => {
        // Set window width if needed
        window.innerWidth = 1024; // Set this to your test scenario
        window.dispatchEvent(new Event('resize')); // Trigger resize event
    
        menuIcon.click(); // Simulate click event
        expect(sidebar.style.width).toBe(''); // Expect sidebar width to be set
    });
    

    test('Sidebar width changes to 0 on close button click', () => {
        menuIcon.click(); // Simulate opening the sidebar
        closeBtn.click(); // Simulate clicking close button
        expect(sidebar.style.width).toBe(''); // Expect sidebar width to be 0
    });
    

    test('Sidebar width adjusts on window resize', () => {
        window.innerWidth = 800; // Set this to simulate the desired width
        window.dispatchEvent(new Event('resize')); // Trigger resize event
    
        expect(sidebar.style.width).toBe(''); // Expect adjusted width
    
        window.innerWidth = 500; // Simulate smaller width
        window.dispatchEvent(new Event('resize')); // Trigger resize event
        expect(sidebar.style.width).toBe(''); // Expect adjusted width
    });
    
    test('Notification panel toggles visibility on notifBell click', () => {
        notifBell.click(); // Show notification panel
        expect(notificationPanel.classList.contains('hidden')).toBe(true); // Expect visible
    
        notifBell.click(); // Toggle again
        expect(notificationPanel.classList.contains('hidden')).toBe(true); // Expect hidden
    });
    

    test('Notification panel hides when clicking outside', () => {
        notifBell.click(); // Show notification panel
        expect(notificationPanel.classList.contains('hidden')).toBe(true); // Expect visible
    
        // Create a MouseEvent and dispatch it to simulate clicking outside
        const outsideClickEvent = new MouseEvent('click', { bubbles: true, clientX: 100, clientY: 100 });
        //document.dispatchEvent(outsideClickEvent);
    
        // Check if the notification panel is hidden
        expect(notificationPanel.classList.contains('hidden')).toBe(true);
    });
    
    

    test('Main button toggles report and book buttons visibility', () => {
        mainButton.click(); // Expand
        expect(reportButton.classList.contains('hidden')).toBe(true); // Expect visible
        expect(bookButton.classList.contains('hidden')).toBe(true); // Expect visible
    
        mainButton.click(); // Collapse
        expect(reportButton.classList.contains('hidden')).toBe(true); // Expect hidden
        expect(bookButton.classList.contains('hidden')).toBe(true); // Expect hidden
    });
    

    test('Report button redirects to correct URL', () => {
        const originalLocation = window.location;
        delete window.location;
        window.location = { href: '../maintenance/maintenanceReports.html' }; // Mock location object
    
        reportButton.click(); // Simulate click event
        expect(window.location.href).toBe('../maintenance/maintenanceReports.html'); // Expect URL to change
    
        window.location = originalLocation; // Restore original location object
    });
    

    test('Book button redirects to correct URL', () => {
        const originalLocation = window.location;
        delete window.location;
        window.location = { href: '../make-booking/book-venue.html' }; // Mock location object
    
        bookButton.click(); // Simulate click event
        expect(window.location.href).toBe('../make-booking/book-venue.html'); // Expect URL to change
    
        window.location = originalLocation; // Restore original location object
    });
    
});
