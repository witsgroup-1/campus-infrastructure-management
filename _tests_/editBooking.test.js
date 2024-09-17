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

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([])
  })
);

// Mock window.alert
beforeAll(() => {
  global.alert = jest.fn();
});

describe('editBookingCopy', () => {
  beforeEach(() => {
    fetch.mockClear();
    global.alert.mockClear();
  });

  // Test formatDateDMY function
  test('formatDateDMY should format date as "Day Month Year"', () => {
    expect(formatDateDMY('2024-09-20')).toBe('20 September 2024');
  });

  // Test extractStartEndTime function
  test('extractStartEndTime should correctly split time slot into start and end time', () => {
    expect(extractStartEndTime('9:00 AM - 11:00 AM')).toEqual({
      startTime: '9:00 AM',
      endTime: '11:00 AM'
    });
  });

  // Test getRoomInfo function
  test('getRoomInfo should return correct venue based on venueId', () => {
    venues.push({ id: 'venue1', Name: 'Venue One' });
    expect(getRoomInfo('venue1')).toEqual({ id: 'venue1', Name: 'Venue One' });
  });

  // Test getBooking function
  test('getBooking should return correct booking based on bookingId', () => {
    bookings.push({
      id: 'booking1',
      date: '20 September 2024',
      start_time: '9:00 AM',
      end_time: '11:00 AM',
      purpose: 'Meeting',
      roomId: 'venue1',
      status: 'Confirmed',
      userId: 'user1',
      venueId: 'venue1'
    });
    expect(getBooking('booking1')).toEqual({
      id: 'booking1',
      date: '20 September 2024',
      start_time: '9:00 AM',
      end_time: '11:00 AM',
      purpose: 'Meeting',
      roomId: 'venue1',
      status: 'Confirmed',
      userId: 'user1',
      venueId: 'venue1'
    });
  });

  // Test populateVenues function
  test('populateVenues should populate the venue dropdown correctly', () => {
    document.body.innerHTML = '<select id="venueSelector"></select>';

    venues.length = 0;
    venues.push({ id: 'venue1', Name: 'Venue One' });
    populateVenues(venues);

    const venueSelector = document.getElementById('venueSelector');
    expect(venueSelector.children.length).toBe(1);
    expect(venueSelector.children[0].textContent).toBe('Venue One');
  });

  // Test isValidDate function
  test('isValidDate should return true for valid date strings', () => {
    expect(isValidDate('2024-09-20')).toBe(true);
  });

  test('isValidDate should return false for invalid date strings', () => {
    expect(isValidDate('invalid-date')).toBe(false);
  });

  // Test isValidTimeSlot function
  test('isValidTimeSlot should return true for valid time slots', () => {
    expect(isValidTimeSlot('9:00 AM - 11:00 AM')).toBe(true);
  });

  test('isValidTimeSlot should return false for invalid time slots', () => {
    expect(isValidTimeSlot('invalid-time-slot')).toBe(false);
  });

  // Test isValidVenue function
  test('isValidVenue should return true for existing venue IDs', () => {
    venues.push({ id: 'venue1', Name: 'Venue One' });
    expect(isValidVenue('venue1')).toBe(true);
  });

  test('isValidVenue should return false for non-existing venue IDs', () => {
    expect(isValidVenue('invalid-venue')).toBe(false);
  });

  // Mock for saveChanges function
  test('saveChanges should send a PUT request with correct data', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Booking edited successfully' })
      })
    );

    document.body.innerHTML = `
      <select id="venueSelector">
        <option value="venue1">Venue One</option>
      </select>
      <input id="bookingDate" value="2024-09-20" />
      <input id="timeSlot" value="9:00 AM - 11:00 AM" />
      <select id="statusSelection">
        <option value="Confirmed">Confirmed</option>
      </select>
    `;

    await saveChanges('booking1');

    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/bookings/booking1', {
      method: 'PUT',
      headers: {
        'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start_time: '9:00 AM',
        end_time: '11:00 AM',
        date: '20 September 2024',
        venueId: 'venue1',
        status: 'Confirmed'
      })
    });
  });

  // Test error handling in fetchVenues
  test('fetchVenues should handle errors correctly', async () => {
    fetch.mockImplementation(() => Promise.reject(new Error('API error')));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await fetchVenues();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching venues:', new Error('API error'));
    consoleErrorSpy.mockRestore();
  });

  // Test error handling in fetchBookings
  test('fetchBookings should handle errors correctly', async () => {
    fetch.mockImplementation(() => Promise.reject(new Error('API error')));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await fetchBookings();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching bookings:', new Error('API error'));
    consoleErrorSpy.mockRestore();
  });
});
