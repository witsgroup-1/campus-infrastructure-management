const {
  formatDateDMY,
  extractStartEndTime,
  isValidDate,
  isValidTimeSlot,
  isValidVenue,
  fetchVenues,
  fetchBookings,
  getRoomInfo,
  getBooking,
  populateVenues,
  saveChanges,
  venues,
  bookings
} = require('./copies/editBookingCopy.js');

global.fetch = jest.fn();

describe('./copies/editBookingCopy.js', () => {
  beforeEach(() => {
    // Clear previous mocks and setup the DOM
    fetch.mockClear();
    document.body.innerHTML = `
      <select id="venueSelector">
        <option value="1">Venue 1</option>
        <option value="2">Venue 2</option>
      </select>
      <input id="bookingDate" value="2024-09-17" />
      <input id="timeSlot" value="9:00 AM - 11:00 AM" />
      <select id="statusSelection">
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
      </select>
    `;
    
    // Reset global variables
    venues.length = 0;
    bookings.length = 0;

    // Mock alert to prevent errors
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock fetch to return a promise
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );
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

  test('fetchVenues populates venue dropdown correctly', async () => {
    const mockVenues = [
      { id: '1', Name: 'Venue 1' },
      { id: '2', Name: 'Venue 2' }
    ];
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockVenues)
    });

    await fetchVenues();

    const venueSelector = document.getElementById('venueSelector');
    expect(venueSelector.children.length).toBe(mockVenues.length);
    expect(venueSelector.children[0].value).toBe(mockVenues[0].id);
    expect(venueSelector.children[0].textContent).toBe(mockVenues[0].Name);
  });

  test('fetchBookings fetches bookings and stores in array', async () => {
    const mockBookings = [
      { id: '1', venueId: '1', date: '2024-09-17', timeSlot: '9:00 AM - 11:00 AM', status: 'confirmed' }
    ];
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockBookings)
    });

    const result = await fetchBookings();
    expect(result).toEqual(mockBookings);
  });

});
