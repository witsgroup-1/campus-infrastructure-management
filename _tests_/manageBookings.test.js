
const {
    fetchVenues,
    fetchBookings,
    getRoomInfo,
    renderBookings,
    editBooking,
    cancelBooking,
    acceptBooking,
    rejectBooking
  } = require('./manage-bookings/manageBookings.js');
  
  // Mock data
  const mockVenues = [
    { id: '1', Name: 'Conference Room', Category: 'Meeting', Building: 'Main Building' },
    { id: '2', Name: 'Lecture Hall', Category: 'Classroom', Building: 'North Wing' }
  ];
  
  const mockBookings = [
    { id: '101', venueId: '1', date: '2024-09-16', start_time: '9:00 AM', end_time: '11:00 AM', status: 'confirmed' },
    { id: '102', venueId: '2', date: '2024-09-16', start_time: '1:00 PM', end_time: '3:00 PM', status: 'pending' }
  ];
  
  // Mock the fetch API
  global.fetch = require('jest-fetch-mock');
  
  beforeEach(() => {
    fetch.resetMocks();
  });
  
  test('fetchVenues fetches and stores venues', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockVenues));
  
    await fetchVenues();
    expect(venues).toEqual(mockVenues);
  });
  
  test('fetchBookings fetches and stores bookings and calls renderBookings', async () => {
    fetch.mockResponses(
      [JSON.stringify(mockBookings)],
      [JSON.stringify(mockVenues)]
    );
  
    // Mock renderBookings
    const renderBookingsMock = jest.fn();
    global.renderBookings = renderBookingsMock;
  
    await fetchBookings();
  
    expect(bookings).toEqual(mockBookings);
    expect(renderBookingsMock).toHaveBeenCalled();
  });
  
  test('getRoomInfo returns correct room info', () => {
    venues.push(...mockVenues);
  
    expect(getRoomInfo('1')).toEqual(mockVenues[0]);
    expect(getRoomInfo('2')).toEqual(mockVenues[1]);
  });
  
  test('renderBookings filters and displays bookings', () => {
    // Set up the document body
    document.body.innerHTML = `
      <div id="bookingsContainer"></div>
      <select id="statusFilter">
        <option value="">All</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
      </select>
      <select id="roomFilter">
        <option value="">All</option>
        <option value="Meeting">Meeting</option>
        <option value="Classroom">Classroom</option>
      </select>
      <input id="searchInput" type="text">
    `;
  
    venues.push(...mockVenues);
    bookings.push(...mockBookings);
  
    renderBookings();
  
    const container = document.getElementById('bookingsContainer');
    expect(container.innerHTML).toContain('Conference Room');
    expect(container.innerHTML).toContain('Lecture Hall');
    expect(container.innerHTML).toContain('9:00 AM - 11:00 AM');
    expect(container.innerHTML).toContain('1:00 PM - 3:00 PM');
  });
  
  test('editBooking redirects to editBooking.html with bookingId', () => {
    const bookingId = '101';
    delete window.location;
    window.location = { href: '' };
  
    editBooking(bookingId);
  
    expect(window.location.href).toBe(`editBooking.html?bookingId=${bookingId}`);
  });
  
  test('cancelBooking updates status to "Cancelled"', async () => {
    fetch.mockResponseOnce(JSON.stringify({ status: 'Cancelled' }));
  
    await cancelBooking('101');
  
    expect(fetch).toHaveBeenCalledWith(
      'https://campus-infrastructure-management.azurewebsites.net/api/bookings/101',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'Cancelled' })
      })
    );
  });
  
  test('acceptBooking updates status to "Confirmed"', async () => {
    fetch.mockResponseOnce(JSON.stringify({ status: 'Confirmed' }));
  
    await acceptBooking('102');
  
    expect(fetch).toHaveBeenCalledWith(
      'https://campus-infrastructure-management.azurewebsites.net/api/bookings/102',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'Confirmed' })
      })
    );
  });
  
  test('rejectBooking updates status to "Rejected"', async () => {
    fetch.mockResponseOnce(JSON.stringify({ status: 'Rejected' }));
  
    await rejectBooking('103');
  
    expect(fetch).toHaveBeenCalledWith(
      'https://campus-infrastructure-management.azurewebsites.net/api/bookings/103',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected' })
      })
    );
  });
  