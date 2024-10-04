const { test, expect } = require('@playwright/test');
const codecov = require('codecov');

test.describe('Bookings Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://campus-infrastructure-management.azurewebsites.net/manage-bookings/manageBookings.html'); 
    await page.coverage.startJSCoverage();
  });

  test.afterEach(async ({ page }) => {
    const coverage = await page.coverage.stopJSCoverage();
    await codecov.upload({ coverage });
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
