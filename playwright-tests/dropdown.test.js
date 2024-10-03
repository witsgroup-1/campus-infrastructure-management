const { test, expect } = require('@playwright/test');

test.describe('Venue Dropdown Integration Tests', () => {

  // Before each test, navigate to the correct page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/maintenance/maintenanceReports.html'); 

    // Wait for the page to fully load before proceeding
    await page.waitForLoadState('domcontentloaded');
  });

  // Test for populating the dropdown on venue data load
  test('should populate dropdown on venue data load', async ({ page }) => {
    await page.coverage.startJSCoverage();
    
    const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
    
    // Ensure the function exists and is accessible
    await page.evaluate((venues) => {
      if (typeof window.updateVenueDropdown === 'function') {
        window.updateVenueDropdown(venues);
      } else {
        throw new Error('updateVenueDropdown function is not available');
      }
    }, venues);

    // Assert the dropdown options are updated
    const dropdown = await page.$('#venue-dropdown');
    const options = await dropdown.$$('option');

    expect(options.length).toBe(3);
    expect(await options[1].textContent()).toBe('Room 101');
    expect(await options[2].textContent()).toBe('Room 102');

    const coverage = await page.coverage.stopJSCoverage();
  });

  test('should update venue input when an option is selected', async ({ page }) => {
    await page.coverage.startJSCoverage();
    
    const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
  
    // Populate the dropdown
    await page.evaluate((venues) => {
      window.updateVenueDropdown(venues);
    }, venues);
  
    // Check dropdown is populated
    const dropdownOptions = await page.$$('#venue-dropdown option');
    console.log('Dropdown options count:', dropdownOptions.length);
    if (dropdownOptions.length === 0) {
      throw new Error('Dropdown not populated');
    }
  
    // Select an option
    await page.selectOption('#venue-dropdown', { label: 'Room 101' });
  
    //Check if the input is being updated
    await page.evaluate(() => {
      const venueInput = document.querySelector('input[placeholder="Venue"]');
      console.log('Current value in input:', venueInput.value);
    });
  
    // Wait for the input to be attached
    await page.waitForSelector('input[placeholder="Venue"]', { state: 'attached' });
  
    // Assert that the input field is updated correctly
    const venueInput = await page.$('input[placeholder="Venue"]');
    const value = await venueInput.inputValue();
    expect(value).toBe('Room 101');
    const coverage = await page.coverage.stopJSCoverage();
  });
  

  // Test for clearing the dropdown when clearVenueDropdown is called
  test('should clear dropdown when clearVenueDropdown is called', async ({ page }) => {
    await page.coverage.startJSCoverage();
    
    const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
    
    // Populate the dropdown first
    await page.evaluate((venues) => {
      if (typeof window.updateVenueDropdown === 'function') {
        window.updateVenueDropdown(venues);
      } else {
        throw new Error('updateVenueDropdown function is not available');
      }
    }, venues);

    // Clear the dropdown using the clearVenueDropdown function
    await page.evaluate(() => {
      if (typeof window.clearVenueDropdown === 'function') {
        window.clearVenueDropdown();
      } else {
        throw new Error('clearVenueDropdown function is not available');
      }

      
    });

    // Assert the dropdown is cleared
    const dropdown = await page.$('#venue-dropdown');
    const options = await dropdown.$$('option');
    expect(options.length).toBe(0);

    const coverage = await page.coverage.stopJSCoverage();
  });
});
