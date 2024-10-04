const { test, expect } = require('@playwright/test');


test.describe('Bookings Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://campus-infrastructure-management.azurewebsites.net/manage-bookings/manageBookings.html');
    await page.waitForLoadState('domcontentloaded'); 
    await page.coverage.startJSCoverage();
  });

  test.afterEach(async ({ page }) => {
    const coverage = await page.coverage.stopJSCoverage();

  });


  test('should allow filtering bookings by status', async ({ page }) => {
    await page.selectOption('#statusFilter', 'confirmed');
    await page.waitForTimeout(1000); 

    const filteredBookingsCount = await page.locator('#bookingsContainer').count();
    expect(filteredBookingsCount).toBeGreaterThan(0); 
  });

  // test('should allow filtering bookings by room type', async ({ page }) => {
  //   await page.selectOption('#roomFilter', 'Lecture Hall'); 
  //   await page.waitForTimeout(1000); // Wait for the filter to apply

  //   const filteredBookingsCount = await page.locator('#bookingsContainer .booking').count();
  //   expect(filteredBookingsCount).toBeGreaterThan(0); 
  // });

  test('should allow editing a booking', async ({ page }) => {
    await page.click('button[data-action="edit"]');
    expect(page.url()).toContain('editBooking.html');
  });

  // test('should allow accepting a booking', async ({ page }) => {
  //   // Click on the accept button of the first booking
  //   await page.click('button[data-action="accept"]'); 
  //   // Check for the alert and accept it
  //   page.on('dialog', async dialog => {
  //     expect(dialog.message()).toBe('Booking successfully confirmed and notification sent.'); 
  //     await dialog.accept();
  //   });
  // });

});
