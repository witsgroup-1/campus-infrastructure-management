const {
  formatDateDMY,
  extractStartEndTime,
  getRoomInfo,
  getBooking,
  populateVenues,
  fetchVenues,
  fetchBookings,
  isValidDate,
  isValidTimeSlot,
  isValidVenue,
  saveChanges,
  venues,
  bookings
} = require('./copies/editBookingCopy'); // Adjust the path as needed

// Mock data
const mockVenues = [
  {
    Building: 'DJ Du Plessis',
    Capacity: 300,
    Category: 'Exam Venue',
    Features: [], // assuming empty array
    Name: 'Venue A',
    id: '24ooqgtCzpnz'
  },
  {
    Building: 'Main Hall',
    Capacity: 500,
    Category: 'Conference Room',
    Features: ['Projector', 'Sound System'],
    Name: 'Venue B',
    id: 'PRy24YwFivSStW4SVP6u'
  }
];

const mockBookings = [
  {
    date: '20 September 2024',
    end_time: '11:00 AM',
    purpose: 'SDP Lecture',
    roomId: 'PRy24YwFivSStW4SVP6u',
    start_time: '9:00 AM',
    status: 'Confirmed',
    userId: '03',
    venueId: '24ooqgtCzpnz'
  }
];

// Test formatDateDMY function
test('formatDateDMY should format date as "Day Month Year"', () => {
  expect(formatDateDMY('2024-09-20')).toBe('20 September 2024');
});

// Test extractStartEndTime function
test('extractStartEndTime should return start and end times', () => {
  expect(extractStartEndTime('9:00 AM - 11:00 AM')).toEqual({
    startTime: '9:00 AM',
    endTime: '11:00 AM'
  });
});

// Test getRoomInfo function
test('getRoomInfo should return venue object by id', () => {
  venues.push(...mockVenues); // Populate venues with mock data
  expect(getRoomInfo('24ooqgtCzpnz')).toEqual(mockVenues[0]);
  expect(getRoomInfo('PRy24YwFivSStW4SVP6u')).toEqual(mockVenues[1]);
  expect(getRoomInfo('unknown')).toBeUndefined();
});

// Test getBooking function
test('getBooking should return booking object by id', () => {
  bookings.push(...mockBookings); // Populate bookings with mock data
  expect(getBooking('101')).toBeUndefined(); // Booking ID not in mock data
  expect(getBooking('102')).toBeUndefined(); // Booking ID not in mock data
});

// Test isValidDate function
test('isValidDate should return true for valid dates', () => {
  expect(isValidDate('20 September 2024')).toBe(true);
  expect(isValidDate('invalid-date')).toBe(false);
});

// Test isValidTimeSlot function
test('isValidTimeSlot should return true for valid time slots', () => {
  expect(isValidTimeSlot('9:00 AM - 11:00 AM')).toBe(true);
  expect(isValidTimeSlot('9:00 AM - 25:00 AM')).toBe(false);
});

// Test isValidVenue function
test('isValidVenue should return true for valid venue IDs', () => {
  venues.push(...mockVenues); // Populate venues with mock data
  expect(isValidVenue('24ooqgtCzpnz')).toBe(true);
  expect(isValidVenue('PRy24YwFivSStW4SVP6u')).toBe(true);
  expect(isValidVenue('unknown')).toBe(false);
});

// Mock fetch for saveChanges
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true })
  })
);

test('saveChanges should call fetch with correct arguments', async () => {
  const mockId = '101'; // This ID is not in the mock data, should be adjusted if necessary
  const mockFormValues = {
    venueSelector: { value: '24ooqgtCzpnz' },
    bookingDate: { value: '20 September 2024' },
    timeSlot: { value: '9:00 AM - 11:00 AM' },
    statusSelection: { value: 'Confirmed' }
  };
  
  document.getElementById = jest.fn((id) => mockFormValues[id]);
  
  await saveChanges(mockId);
  
  expect(fetch).toHaveBeenCalledWith(
    `https://campus-infrastructure-management.azurewebsites.net/api/bookings/${mockId}`,
    expect.objectContaining({
      method: 'PUT',
      headers: expect.any(Object),
      body: JSON.stringify({
        start_time: '9:00 AM',
        end_time: '11:00 AM',
        date: '20 September 2024',
        venueId: '24ooqgtCzpnz',
        status: 'Confirmed'
      })
    })
  );
});

