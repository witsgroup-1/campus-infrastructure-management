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
  saveChanges
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

  test('isValidVenue returns true for valid venue IDs', () => {
    const venues = [{ id: '1' }, { id: '2' }];
    global.venues = venues; // Set global venues array
    expect(isValidVenue('1')).toBe(true);
    expect(isValidVenue('3')).toBe(false);
  });

  test('fetchVenues fetches and populates venues', async () => {
    const mockData = [{ id: '1', Name: 'Venue 1' }];
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData)
    });

    const mockPopulateVenues = jest.fn();
    global.populateVenues = mockPopulateVenues; // Override populateVenues for testing

    await fetchVenues();

    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/venues', {
      method: 'GET',
      headers: {
        'x-api-key': expect.any(String),
        'Content-Type': 'application/json'
      }
    });
    expect(mockPopulateVenues).toHaveBeenCalledWith(mockData);
  });

  test('fetchBookings fetches bookings', async () => {
    const mockData = [{ id: '1' }];
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData)
    });

    await fetchBookings();

    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/bookings', {
      method: 'GET',
      headers: {
        'x-api-key': expect.any(String),
        'Content-Type': 'application/json'
      }
    });
    expect(global.bookings).toEqual(mockData);
  });

  test('saveChanges sends the correct data to API', async () => {
    global.venues = [{ id: '1' }];
    global.bookings = [{ id: '1', venueId: '1' }];
    document.body.innerHTML = `
      <select id="venueSelector">
        <option value="1">Venue 1</option>
      </select>
      <input id="bookingDate" value="2024-09-17" />
      <input id="timeSlot" value="9:00 AM - 11:00 AM" />
      <select id="statusSelection">
        <option value="confirmed">Confirmed</option>
      </select>
    `;

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true })
    });

    await saveChanges('1');

    expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/bookings/1', {
      method: 'PUT',
      headers: {
        'x-api-key': expect.any(String),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start_time: '9:00 AM',
        end_time: '11:00 AM',
        date: '17 September 2024',
        venueId: '1',
        status: 'confirmed'
      })
    });
    expect(alert).toHaveBeenCalledWith('Booking edited successfully');
  });
});
