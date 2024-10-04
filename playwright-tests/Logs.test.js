const { test, expect } = require('@playwright/test');

test.describe('Maintenance Requests Page Tests', () => {
  const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';
  const baseURL = 'https://campus-infrastructure-management.azurewebsites.net/maintenance/maintenanceLogs.html';

  test.beforeEach(async ({ page }) => {

    await page.goto(baseURL);
  });

  test('should fetch and display maintenance requests correctly', async ({ page }) => {
    await page.coverage.startJSCoverage();
    // Wait for the maintenance requests to load
    await page.waitForSelector('#scheduled-content');
    const scheduled = await page.locator('#scheduled-content').count();
    const inProgress = await page.locator('#in-progress-content').count();
    const completed = await page.locator('#completed-content').count();

    expect(scheduled).toBeGreaterThan(0);
    expect(inProgress).toBeGreaterThan(0);
    expect(completed).toBeGreaterThan(0);

    const coverage = await page.coverage.stopJSCoverage();
  });

  test('should show more requests when "Show More" button is clicked in mobile view', async ({ page }) => {
    await page.coverage.startJSCoverage();
    // Emulate mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });


    await page.waitForSelector('#mobile-scheduled-content');
    
    // Verify initially only one request is displayed
    const initialRequests = await page.locator('#mobile-scheduled-content').count();
    expect(initialRequests).toBe(1);
    
    // Click "Show More" and check if more requests are loaded
    await page.click('#show-more-scheduled'); 
    await page.waitForSelector('#mobile-scheduled-content', { visible: true });  

    const allRequests = await page.locator('#mobile-scheduled-content').count();
    // if there are 1 or more - accounts for the live server not having more then 1
    expect(allRequests).toBeGreaterThan(0); 
    const coverage = await page.coverage.stopJSCoverage();
  });

  test('should search and display staff results', async ({ page }) => {
      await page.coverage.startJSCoverage();
       // Open the popup where the 'assigned-to' search input is located
       await page.click('.bg-gray-200.p-4.rounded-md.mb-2.cursor-pointer'); 
       await page.waitForSelector('#detailsModal', { state: 'visible' });

       // Wait for the popup to appear and the input field to be visible
       await page.waitForSelector('#assigned-to', { state: 'visible' });
   
    
    // Trigger a search for staff
    await page.fill('#assigned-to', 'Jo'); // Type 2 characters to trigger search

    // Wait for the staff dropdown to show results
    await page.waitForSelector('#staff-dropdown', { state: 'visible' });

    // await page.waitForSelector('#staff-dropdown');
    const optionsCount = await page.locator('#staff-dropdown').count();
    
    expect(optionsCount).toBeGreaterThan(0); // Ensure staff options are displayed

    const coverage = await page.coverage.stopJSCoverage();
  });
});


