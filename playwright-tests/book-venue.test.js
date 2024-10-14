// tests/venues.spec.js

const { test, expect } = require('@playwright/test');

test.describe('Venue Booking Application Integration Tests', () => {
  const baseURL = 'https://campus-infrastructure-management.azurewebsites.net/'; 

  // Mock data for API responses
  const mockUserData = {
    uid: 'test-user-id',
    role: 'Student',
    isTutor: false,
    isLecturer: false,
  };

  const mockVenues = [
    {
      id: 'venue1',
      Name: 'Study Room 101',
      Category: 'Study Room',
      Capacity: 20,
    },
    {
      id: 'venue2',
      Name: 'Lecture Hall A',
      Category: 'Lecture Hall',
      Capacity: 100,
    },
    {
      id: 'venue3',
      Name: 'Tutorial Room B',
      Category: 'Tutorial Room',
      Capacity: 30,
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Intercept API calls to mock responses
    await page.route('**/api/users/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUserData),
      });
    });

    await page.route('**/api/venues**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockVenues),
      });
    });

    // Mock Firebase Auth
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'firebaseAuth',
        JSON.stringify({ uid: 'test-user-id' })
      );

      window.firebase = {
        initializeApp: () => {},
        auth: () => ({
          onAuthStateChanged: (cb) => cb({ uid: 'test-user-id' }),
          currentUser: { uid: 'test-user-id' },
        }),
      };
    });
  });

  test('Authenticated student sees allowed venues', async ({ page }) => {
    // Navigate to the main page
    await page.goto(`${baseURL}/bookings.html`);

    // Wait for venues to load
    await page.waitForSelector('#bookingsContainer');

    // Get the list of displayed venues
    const venueNames = await page.$$eval(
      '#bookingsContainer .flex.items-center h2',
      venues => venues.map(venue => venue.textContent.trim())
    );

    // Expect only 'Study Room 101' to be visible for a student without tutor or lecturer privileges
    expect(venueNames).toEqual(['Study Room 101']);
  });

  test('Authenticated student with tutor role sees additional venues', async ({ page }) => {
    // Update mock user data
    mockUserData.isTutor = true;

    // Navigate to the main page
    await page.goto(`${baseURL}/bookings.html`);

    // Wait for venues to load
    await page.waitForSelector('#bookingsContainer');

    // Get the list of displayed venues
    const venueNames = await page.$$eval(
      '#bookingsContainer .flex.items-center h2',
      venues => venues.map(venue => venue.textContent.trim())
    );

    // Expect 'Study Room 101' and 'Tutorial Room B' to be visible
    expect(venueNames.sort()).toEqual(['Study Room 101', 'Tutorial Room B'].sort());
  });

  test('Filter venues by category', async ({ page }) => {
    // Set user as a staff member
    mockUserData.role = 'Staff';
    mockUserData.isLecturer = true;

    // Navigate to the main page
    await page.goto(`${baseURL}/bookings.html`);

    // Wait for venues to load
    await page.waitForSelector('#bookingsContainer');

    // Select 'Lecture Hall' from the category filter
    await page.selectOption('#roomFilter', 'Lecture Hall');

    // Wait for venues to re-render
    await page.waitForTimeout(500); // Adjust as needed for your app

    // Get the list of displayed venues
    const venueNames = await page.$$eval(
      '#bookingsContainer .flex.items-center h2',
      venues => venues.map(venue => venue.textContent.trim())
    );

    // Expect only 'Lecture Hall A' to be visible
    expect(venueNames).toEqual(['Lecture Hall A']);
  });

  test('Search for a venue', async ({ page }) => {
    // Set user as a staff member
    mockUserData.role = 'Staff';
    mockUserData.isLecturer = true;

    // Navigate to the main page
    await page.goto(`${baseURL}/bookings.html`);

    // Wait for venues to load
    await page.waitForSelector('#bookingsContainer');

    // Type 'Tutorial' into the search input
    await page.fill('#searchInput', 'Tutorial');

    // Wait for venues to re-render
    await page.waitForTimeout(500); // Adjust as needed

    // Get the list of displayed venues
    const venueNames = await page.$$eval(
      '#bookingsContainer .flex.items-center h2',
      venues => venues.map(venue => venue.textContent.trim())
    );

    // Expect only 'Tutorial Room B' to be visible
    expect(venueNames).toEqual(['Tutorial Room B']);
  });

  test('Unauthenticated users are redirected to login page', async ({ page }) => {
    // Mock Firebase Auth to simulate no user logged in
    await page.addInitScript(() => {
      window.firebase = {
        initializeApp: () => {},
        auth: () => ({
          onAuthStateChanged: (cb) => cb(null),
          currentUser: null,
        }),
      };
    });

    // Navigate to the main page
    await page.goto(`${baseURL}/bookings.html`);

    // Wait for redirection
    await page.waitForURL('**/index.html');

    // Verify redirection to login page
    expect(page.url()).toContain('/index.html');
  });
});
