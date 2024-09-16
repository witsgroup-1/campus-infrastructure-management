beforeEach(() => {
  // Mock DOM elements
  document.body.innerHTML = `
    <button id="saveChangesBtn"></button>
    <select id="venueSelector"></select>
  `;
});

// Import the functions to be tested
const { formatDateDMY, extractStartEndTime, getRoomInfo, getBooking, populateVenues } = require('../src/manage-bookings/editBooking.js');

// Mock data for testing
const mockVenues = [
  { id: '1', Name: 'Conference Room', Category: 'Meeting', Location: '1st Floor' },
  { id: '2', Name: 'Lecture Hall', Category: 'Classroom', Location: '2nd Floor' },
];

const mockBookings = [
  { id: '101', venueId: '1', date: '2024-09-16', start_time: '9:00 AM', end_time: '11:00 AM', status: 'confirmed' },
];

// Test formatDateDMY
test('formatDateDMY formats date as "Day Month Year"', () => {
  expect(formatDateDMY('2024-09-16')).toBe('16 September 2024');
});

// Test extractStartEndTime
test('extractStartEndTime splits time slot into start and end times', () => {
  expect(extractStartEndTime('9:00 AM - 11:00 AM')).toEqual({ startTime: '9:00 AM', endTime: '11:00 AM' });
});

// Test getRoomInfo
test('getRoomInfo returns the correct venue information', () => {
  expect(getRoomInfo('1')).toEqual(mockVenues[0]);
});

// Test getBooking
test('getBooking returns the correct booking information', () => {
  expect(getBooking('101')).toEqual(mockBookings[0]);
});

// Test populateVenues
test('populateVenues populates the venue selector correctly', () => {
  populateVenues(mockVenues);

  const venueSelector = document.getElementById('venueSelector');
  expect(venueSelector.options.length).toBe(2); // Should have 2 options
  expect(venueSelector.options[0].value).toBe('1');
  expect(venueSelector.options[0].text).toBe('Conference Room');
});
