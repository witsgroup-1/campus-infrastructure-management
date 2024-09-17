beforeEach(() => {
  // Mock getElementById for different DOM elements
  jest.spyOn(document, 'getElementById').mockImplementation((id) => {
    if (id === 'saveChangesBtn') {
      return { addEventListener: jest.fn() }; // Mock the button's event listener
    } else if (id === 'venueSelector') {
      return { options: [], add: jest.fn() }; // Mock a select element
    }
    return null; // Return null for any other elements
  });
});

// Import the functions to be tested
const {getRoomInfo, getBooking } = require('../src/manage-bookings/editBooking.js');

// Mock data for testing
const venues = [
  { id: '1', Name: 'Conference Room', Category: 'Meeting', Location: '1st Floor' },
  { id: '2', Name: 'Lecture Hall', Category: 'Classroom', Location: '2nd Floor' },
];

const bookings = [
  { id: '101', venueId: '1', date: '2024-09-16', start_time: '9:00 AM', end_time: '11:00 AM', status: 'confirmed' },
];



// Test getRoomInfo
test('getRoomInfo returns the correct venue information', () => {
  expect(getRoomInfo('1')).toEqual(venues[0]);
});

// Test getBooking
test('getBooking returns the correct booking information', () => {
  expect(getBooking('101')).toEqual(bookings[0]);
});
