const { test, expect } = require('@playwright/test');

test.describe('Bookings Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Replace 'http://localhost:3000' with the URL of your app
    await page.goto('https://campus-infrastructure-management.azurewebsites.net/manage-bookings/manageBookings.html'); 
    await page.waitForLoadState('domcontentloaded');
    await page.coverage.startJSCoverage();
  });

  test.afterEach(async ({ page }) => {

    await page.coverage.stopJSCoverage();
  });

  test('should fetch and display bookings', async ({ page }) => {
    // Assuming you have a container for bookings
    await page.waitForSelector('#bookingsContainer');
    const bookingsCount = await page.locator('#bookingsContainer').count();
    expect(bookingsCount).toBeGreaterThan(0); // Check if bookings are displayed
  });

});