const { test, expect } = require('@playwright/test');

test('should display maintenance notifications and toggle the notification panel', async ({ page }) => {
    // Navigate to the admin dashboard page
    await page.goto('https://campus-infrastructure-management.azurewebsites.net/adminDashboard/adminDashboard.html'); // Update URL as needed

 
    await page.waitForLoadState('networkidle');

    // Wait for the notification bell to appear before interacting
    const notificationBell = await page.waitForSelector('#notif-bell', { state: 'visible', timeout: 60000 });
    
    // Trigger fetchMaintenanceRequests by clicking the notification bell
    await notificationBell.click();

    // Wait for the notification panel to be displayed
    const notificationPanel = await page.locator('#notificationPanel');
    await expect(notificationPanel).toBeVisible();

    // Check if the notification list contains items (or no new notifications)
    const notificationItems = await page.locator('#notificationPanel ul li');
    
    // Check if there are any new notifications (could be 'No new notifications' or actual list items)
    const notificationText = await notificationItems.first().innerText();
    
    if (notificationText === 'No new notifications') {
        console.log('No new maintenance requests to display.');
    } else {
        console.log('Maintenance notifications:', notificationText);
    }

    // Simulate a toggle of the notification panel visibility
    await notificationBell.click();
    await expect(notificationPanel).toHaveClass(/hidden/); // Panel should now be hidden

    // Optionally, test the "Show All Requests" button
    const showAllRequestsButton = await page.locator('#notificationPanel a[href="../maintenance/maintenanceLogs.html"]');
    await expect(showAllRequestsButton).toBeVisible();

    // Ensure the button redirects to the maintenance logs page
    await showAllRequestsButton.click();
    await page.waitForURL('**/maintenance/maintenanceLogs.html');
});

