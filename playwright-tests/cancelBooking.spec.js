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

  test('should allow cancelling a booking', async ({ page }) => {
    // Click on the cancel button of the first booking
    await page.click('button[data-action="cancel"]');
    // Check for the alert and accept it
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Booking cancelled and notification sent.'); // Adjust message accordingly
      await dialog.accept();
    });
  });



});