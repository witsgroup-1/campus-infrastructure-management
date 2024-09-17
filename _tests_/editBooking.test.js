const {
  formatDateDMY,
  extractStartEndTime,
  isValidDate,
  isValidTimeSlot,

} = require('./copies/editBookingCopy.js');

global.fetch = jest.fn(); // Mock fetch globally

describe('editBookings.js', () => {

  beforeEach(() => {
    fetch.mockClear();
    // Reset DOM or any global state if needed
  });

  test('formatDateDMY formats date correctly', () => {
    const dateString = '2024-09-17';
    expect(formatDateDMY(dateString)).toBe('17 September 2024');
  });

  test('extractStartEndTime extracts times correctly', () => {
    const timeSlot = '9:00 AM - 11:00 AM';
    expect(extractStartEndTime(timeSlot)).toEqual({ startTime: '9:00 AM', endTime: '11:00 AM' });
  });

  test('isValidDate returns true for valid date strings', () => {
    expect(isValidDate('2024-09-17')).toBe(true);
    expect(isValidDate('Invalid Date')).toBe(false);
  });

  test('isValidTimeSlot returns true for valid time slots', () => {
    expect(isValidTimeSlot('9:00 AM - 11:00 AM')).toBe(true);
    expect(isValidTimeSlot('Invalid Time Slot')).toBe(false);
  });




  });

  
