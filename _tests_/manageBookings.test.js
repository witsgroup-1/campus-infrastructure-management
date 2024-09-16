const fetchMock = require('jest-fetch-mock');
global.fetch = fetchMock;

// Import the functions to be tested
const {
  fetchVenues,
  fetchBookings,
  getRoomInfo,
  renderBookings,
  editBooking,
  cancelBooking,
  acceptBooking,
  rejectBooking
} = require('../src/manage-bookings/manageBookings.js');

// Mock data
const mockVenues = [
  { id: '1', Name: 'Conference Room', Category: 'Meeting', Building: 'Main Building' },
  { id: '2', Name: 'Lecture Hall', Category: 'Classroom', Building: 'North Wing' }
];

const mockBookings = [
  { id: '101', venueId: '1', date: '2024-09-16', start_time: '9:00 AM', end_time: '11:00 AM', status: 'confirmed' },
  { id: '102', venueId: '2', date: '2024-09-16', start_time: '1:00 PM', end_time: '3:00 PM', status: 'pending' }
];

beforeEach(() => {
  // Mock DOM elements
  document.body.innerHTML = `
    <select id="statusFilter"></select>
    <select id="roomFilter"></select>
    <input id="searchInput" />
    <div id="bookingsContainer"></div>
  `;

  // Mock fetch API
  fetchMock.resetMocks();
});

test('fetchVenues fetches and stores venues', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(mockVenues));

  await fetchVenues();
  expect(global.venues).toEqual(mockVenues); // Ensure `venues` is defined globally
});

test('fetchBookings fetches and stores bookings and calls renderBookings', async () => {
  fetchMock.mockResponses(
    [JSON.stringify(mockBookings)],
    [JSON.stringify(mockVenues)]
  );

  // Mock renderBookings
  const renderBookingsMock = jest.fn();
  global.renderBookings = renderBookingsMock;

  await fetchBookings();

  expect(global.bookings).toEqual(mockBookings); // Ensure `bookings` is defined globally
  expect(renderBookingsMock).toHaveBeenCalled();
});

test('getRoomInfo returns correct room info', () => {
  global.venues = mockVenues; // Ensure `venues` is defined globally

  expect(getRoomInfo('1')).toEqual(mockVenues[0]);
  expect(getRoomInfo('2')).toEqual(mockVenues[1]);
});

test('renderBookings filters and displays bookings', () => {
  global.venues = mockVenues; // Ensure `venues` is defined globally
  global.bookings = mockBookings; // Ensure `bookings` is defined globally

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
  fetchMock.mockResponseOnce(JSON.stringify({ status: 'Cancelled' }));

  await cancelBooking('101');

  expect(fetchMock).toHaveBeenCalledWith(
    'https://campus-infrastructure-management.azurewebsites.net/api/bookings/101',
    expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ status: 'Cancelled' })
    })
  );
});

test('acceptBooking updates status to "Confirmed"', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ status: 'Confirmed' }));

  await acceptBooking('102');

  expect(fetchMock).toHaveBeenCalledWith(
    'https://campus-infrastructure-management.azurewebsites.net/api/bookings/102',
    expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ status: 'Confirmed' })
    })
  );
});

test('rejectBooking updates status to "Rejected"', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ status: 'Rejected' }));

  await rejectBooking('103');

  expect(fetchMock).toHaveBeenCalledWith(
    'https://campus-infrastructure-management.azurewebsites.net/api/bookings/103',
    expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ status: 'Rejected' })
    })
  );
});
