const { test, expect } = require('@playwright/test');

test.describe('Bookings Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Replace 'http://localhost:3000' with the URL of your app
    await page.goto('http://localhost:3000/manage-bookings/manageBookings.html'); 
  });

  test('should fetch and display bookings', async ({ page }) => {
    // Assuming you have a container for bookings
    await page.waitForSelector('#bookingsContainer');
    const bookingsCount = await page.locator('#bookingsContainer').count();
    expect(bookingsCount).toBeGreaterThan(0); // Check if bookings are displayed
  });

  test('should allow filtering bookings by status', async ({ page }) => {
    await page.selectOption('#statusFilter', 'confirmed'); // Change 'confirmed' to whatever status you want to filter
    await page.waitForTimeout(1000); // Wait for the filter to apply (replace with a better wait strategy if possible)

    const filteredBookingsCount = await page.locator('#bookingsContainer').count();
    expect(filteredBookingsCount).toBeGreaterThan(0); // Adjust based on your expected outcome
  });

  // test('should allow filtering bookings by room type', async ({ page }) => {
  //   await page.selectOption('#roomFilter', 'Lecture Hall'); // Change to the desired filter
  //   await page.waitForTimeout(1000); // Wait for the filter to apply

  //   const filteredBookingsCount = await page.locator('#bookingsContainer .booking').count();
  //   expect(filteredBookingsCount).toBeGreaterThan(0); // Adjust based on your expected outcome
  // });

  test('should allow editing a booking', async ({ page }) => {
    // Assuming each booking has an edit button
    await page.click('button[data-action="edit"]');
    // Verify that the edit page is opened (you can check for specific elements)
    expect(page.url()).toContain('editBooking.html');
  });

  // test('should allow accepting a booking', async ({ page }) => {
  //   // Click on the accept button of the first booking
  //   await page.click('button[data-action="accept"]'); // Adjust selector accordingly
  //   // Check for the alert and accept it
  //   page.on('dialog', async dialog => {
  //     expect(dialog.message()).toBe('Booking successfully confirmed and notification sent.'); // Adjust message accordingly
  //     await dialog.accept();
  //   });
  // });

});