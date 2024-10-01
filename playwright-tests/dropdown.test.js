// const { test, expect } = require('@playwright/test');

// test.describe('Venue Dropdown Integration Tests', () => {

//   test.beforeEach(async ({ page }) => {
    
//     await page.goto('http://localhost:3000/maintenance/maintenanceReports.html'); 
//   });

//   test('should populate dropdown on venue data load', async ({ page }) => {
//     // Simulate the dropdown being populated
//     const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
//     await page.evaluate((venues) => {
//       updateVenueDropdown(venues);
//     }, venues);

//     // Assert the dropdown options are updated
//     const dropdown = await page.$('#venue-dropdown');
//     const options = await dropdown.$$('option');

//     expect(options.length).toBe(2);
//     expect(await options[0].textContent()).toBe('Room 101');
//     expect(await options[1].textContent()).toBe('Room 102');
//   });

//   test('should update venue input when an option is selected', async ({ page }) => {
//     const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
//     await page.evaluate((venues) => {
//       updateVenueDropdown(venues);
//     }, venues);

//     // Select an option
//     await page.selectOption('#venue-dropdown', { label: 'Room 101' });

//     // Assert that the input field is updated
//     const venueInput = await page.$('#venueInput');
//     const value = await venueInput.inputValue();
//     expect(value).toBe('Room 101');
//   });

//   test('should clear dropdown when clearVenueDropdown is called', async ({ page }) => {
//     // Populate the dropdown
//     const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
//     await page.evaluate((venues) => {
//       updateVenueDropdown(venues);
//     }, venues);

//     // Clear the dropdown
//     await page.evaluate(() => {
//       clearVenueDropdown();
//     });

//     // Assert the dropdown is cleared
//     const dropdown = await page.$('#venue-dropdown');
//     const options = await dropdown.$$('option');
//     expect(options.length).toBe(0);
//   });
// });

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

    expect(options.length).toBe(2);
    expect(await options[0].textContent()).toBe('Room 101');
    expect(await options[1].textContent()).toBe('Room 102');
  });

  // Test for updating the venue input when an option is selected
  test('should update venue input when an option is selected', async ({ page }) => {
    const venues = [{ Name: 'Room 101', id: '123' }, { Name: 'Room 102', id: '124' }];
    
    // Populate the dropdown first
    await page.evaluate((venues) => {
      if (typeof window.updateVenueDropdown === 'function') {
        window.updateVenueDropdown(venues);
      } else {
        throw new Error('updateVenueDropdown function is not available');
      }
    }, venues);

    // Select an option from the dropdown
    await page.selectOption('#venue-dropdown', { label: 'Room 101' });

    // Assert that the input field is updated correctly
    const venueInput = await page.$('#venueInput');
    const value = await venueInput.inputValue();
    expect(value).toBe('Room 101');
  });

  // Test for clearing the dropdown when clearVenueDropdown is called
  test('should clear dropdown when clearVenueDropdown is called', async ({ page }) => {
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
  });
});
