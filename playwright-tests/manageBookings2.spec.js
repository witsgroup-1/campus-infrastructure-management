const { test, expect } = require('@playwright/test');

test.describe('Bookings Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Replace 'http://localhost:3000' with the URL of your app
    await page.goto('http://localhost:3000/manage-bookings/manageBookings.html'); 
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

  test('should allow filtering bookings by status', async ({ page }) => {
    await page.selectOption('#statusFilter', 'confirmed'); // Change 'confirmed' to whatever status you want to filter
    await page.waitForTimeout(1000); // Wait for the filter to apply (replace with a better wait strategy if possible)

    const filteredBookingsCount = await page.locator('#bookingsContainer').count();
    expect(filteredBookingsCount).toBeGreaterThan(0); // Adjust based on your expected outcome
  });

});