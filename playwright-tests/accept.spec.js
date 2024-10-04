const { test, expect } = require('@playwright/test');

test.describe('Bookings Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Replace 'http://localhost:3000' with the URL of your app
    await page.goto('http://localhost:3000/manage-bookings/manageBookings.html'); 
  });

  test('should allow accepting a booking', async ({ page }) => {
    // Click on the accept button of the first booking
    await page.click('button[data-action="accept"]'); // Adjust selector accordingly
    // Check for the alert and accept it
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Booking successfully confirmed and notification sent.'); // Adjust message accordingly
      await dialog.accept();
    });
  });

});
    