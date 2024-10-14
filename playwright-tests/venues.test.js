const { test, expect } = require('@playwright/test');

test('Add Venue and Verify List', async ({ page }) => {
  // Navigate to the addVenues page
  await page.goto('http://localhost:3000/adminDashboard/addVenue.html');

  // Fill out the form
  await page.fill('#name', 'Test Venue');
  await page.fill('#capacity', '100');
  await page.fill('#category', 'Lecture Hall');
  await page.fill('#features', 'Projector, Whiteboard');
  await page.fill('#building', 'Test Building');

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for the alert and check its content
  const alertPromise = page.waitForEvent('dialog');
  const alert = await alertPromise;
  expect(alert.message()).toBe('Venue added successfully');
  await alert.accept();

  // Wait for the venues list to update
  await page.waitForTimeout(1000);

  // Check if the new venue is in the list
  const venuesList = await page.$$eval('#venues-list > div', (elements) => 
    elements.map((el) => {
      const name = el.querySelector('strong')?.textContent || '';
      const smallElements = el.querySelectorAll('small');
      return {
        name,
        capacity: smallElements[0]?.textContent || '',
        category: smallElements[1]?.textContent || '',
        features: smallElements[2]?.textContent || '',
        building: smallElements[3]?.textContent || '',
      };
    })
  );

  const addedVenue = venuesList.find(v => v.name.includes('Test Venue'));
  expect(addedVenue).toBeTruthy();
  expect(addedVenue.capacity).toContain('100');
  expect(addedVenue.category).toContain('Lecture Hall');
  expect(addedVenue.features).toContain('Projector, Whiteboard');
  expect(addedVenue.building).toContain('Test Building');
});

test('Fetch and Display Existing Venues', async ({ page }) => {
  // Navigate to the addVenues page
  await page.goto('http://localhost:3000/adminDashboard/addVenue.html');

  // Wait for the venues list to load
  await page.waitForSelector('#venues-list > div');

  // Get the list of venues
  const venuesList = await page.$$eval('#venues-list > div', (elements) => 
    elements.map((el) => {
      const name = el.querySelector('strong')?.textContent || '';
      const smallElements = el.querySelectorAll('small');
      return {
        name,
        capacity: smallElements[0]?.textContent || '',
        category: smallElements[1]?.textContent || '',
        features: smallElements[2]?.textContent || '',
        building: smallElements[3]?.textContent || '',
      };
    })
  );

  // Check if venues are displayed
  expect(venuesList.length).toBeGreaterThan(0);

  // Check the structure of each venue block
  for (const venue of venuesList) {
    expect(venue.name).toBeTruthy();
    expect(venue.capacity).toBeTruthy();
    expect(venue.category).toBeTruthy();
    expect(venue.features).toBeTruthy();
    expect(venue.building).toBeTruthy();
  }
});