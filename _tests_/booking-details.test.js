// Import the functions you want to test
import { getVenueById, fetchBookingsForDate, submitBooking, isFormValid, updateAvailableTimeSlots } from './copies/booking-detailsCopy';

// Mock Firebase SDK
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date) => date),  // Mock Timestamp conversion
    now: jest.fn(() => new Date()),  // Mock Timestamp.now
  }
}));

// Mock the global fetch API
global.fetch = jest.fn();

// Mock window.alert
beforeAll(() => {
  global.alert = jest.fn();
});

// Mock DOM elements
beforeEach(() => {
  document.body.innerHTML = `
    <div id="venueName"></div>
    <input id="bookingDate" />
    <select id="timeSlot"></select>
    <button id="bookNowBtn"></button>
    <input id="bookingPurpose" />
    <div id="loadingIndicator"></div>
  `;

  // Clear mocks before each test
  fetch.mockClear();
});

// Test for getVenueById
test('getVenueById should fetch venue data from API', async () => {
  const mockVenueData = { id: '123', Name: 'Lecture Hall', Category: 'Lecture' };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(mockVenueData),
  });

  const result = await getVenueById('123');
  expect(result).toEqual(mockVenueData);
  expect(fetch).toHaveBeenCalledWith(
    'https://campus-infrastructure-management.azurewebsites.net/api/venues/123',
    expect.any(Object)
  );
});

// Test for fetchBookingsForDate
test('fetchBookingsForDate should return bookings for a specific date', async () => {
  const mockBookings = [{ startTime: { seconds: 1609459200 }, endTime: { seconds: 1609462800 } }];
  fetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(mockBookings),
  });

  const result = await fetchBookingsForDate('123', '2021-01-01');
  expect(result).toEqual(mockBookings);
  expect(fetch).toHaveBeenCalledWith(
    'https://campus-infrastructure-management.azurewebsites.net/api/venues/123/2021-01-01',
    expect.any(Object)
  );
});

// Test for submitBooking
test('submitBooking should post booking data to the API', async () => {
    const mockUserData = { uid: '12345' };
    const mockVenueData = { id: '123', Name: 'Lecture Hall' };
    const mockBookingData = { venue_id: '123', start_time: new Date(), end_time: new Date(), purpose: 'Lecture' };
  
    // Mock fetch responses for each API call
    fetch
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue([]) }) // First call to fetch bookings (no conflict)
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({}) }) // Second call to post user's booking
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({}) }); // Third call for venue booking
  
    const mockVenueBookingData = {};
    const mockBookingDataCollection = {};
  
    await submitBooking(
      mockUserData.uid, 
      mockBookingData, 
      mockVenueBookingData, 
      mockVenueData.id, 
      '2021-01-01', 
      mockVenueData.Name, 
      mockBookingDataCollection
    );
  
    // Ensure all fetch calls are made
    expect(fetch).toHaveBeenCalledTimes(3);  // Ensure all three API interactions are made
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://campus-infrastructure-management.azurewebsites.net/api/users'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://campus-infrastructure-management.azurewebsites.net/api/venues'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://campus-infrastructure-management.azurewebsites.net/api/Bookings'),
      expect.any(Object)
    );
  });
  

// Test for updateAvailableTimeSlots
test('updateAvailableTimeSlots should update the dropdown with available slots', async () => {
  const mockBookings = [{ startTime: { seconds: 1609459200 }, endTime: { seconds: 1609462800 } }];
  fetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(mockBookings),
  });

  const venueId = '123';
  const bookingDate = '2021-01-01';

  await updateAvailableTimeSlots(venueId, bookingDate);

  const timeSlotSelect = document.getElementById('timeSlot');
  expect(timeSlotSelect.children.length).toBeGreaterThan(0); // Check that options were added
});

// Test for form validation (isFormValid)
test('isFormValid should validate the form fields correctly', () => {
  // Set form inputs
  document.getElementById('bookingDate').value = '2021-01-01';
  document.getElementById('timeSlot').value = '08:00 - 08:45';
  document.getElementById('bookingPurpose').value = 'Lecture';

  const result = isFormValid();
  expect(result).toBe(true); // Expect form to be valid

  // Test with missing fields
  document.getElementById('bookingPurpose').value = '';
  const resultInvalid = isFormValid();
  expect(resultInvalid).toBe(false); // Expect form to be invalid
});
