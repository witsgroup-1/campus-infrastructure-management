/**
 * @jest-environment jsdom
 */

const { renderBookings } = require('./copies/manageBookingsCopy');
const { getRoomInfo, editBooking, cancelBooking, acceptBooking, rejectBooking } = require('./copies/manageBookingsCopy');

// Mock necessary DOM elements
document.body.innerHTML = `
  <div id="bookingsContainer"></div>
  <select id="statusFilter">
    <option value="">All</option>
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
  </select>
  <select id="roomFilter">
    <option value="">All</option>
    <option value="Classroom">Classroom</option>
  </select>
  <input id="searchInput" type="text" placeholder="Search by building">
`;

let bookings = [];
beforeEach(() => {
  bookings = [
    {
      id: '1',
      venueId: '123',
      date: '2024-10-01',
      start_time: '09:00',
      end_time: '10:00',
      purpose: 'Lecture',
      status: 'confirmed',
    },
    {
      id: '2',
      venueId: '124',
      date: '2024-10-02',
      start_time: '11:00',
      end_time: '12:00',
      purpose: 'Meeting',
      status: 'pending',
    },
  ];

  // Mocking helper functions
  getRoomInfo = jest.fn((venueId) => {
    return venueId === '123'
      ? { Name: 'Room A', Category: 'Classroom', Building: 'Building 1' }
      : { Name: 'Room B', Category: 'Meeting Room', Building: 'Building 2' };
  });

  editBooking = jest.fn();
  cancelBooking = jest.fn();
  acceptBooking = jest.fn();
  rejectBooking = jest.fn();
});

describe('renderBookings', () => {
  it('should display filtered bookings with correct details', () => {
    // Set filters
    document.getElementById('statusFilter').value = '';
    document.getElementById('roomFilter').value = '';
    document.getElementById('searchInput').value = '';

    // Call renderBookings
    renderBookings();

    const container = document.getElementById('bookingsContainer');
    expect(container.childElementCount).toBe(2); // Should render two bookings

    // Check for room details in first booking
    const firstBooking = container.children[0];
    expect(firstBooking.querySelector('h2').textContent).toBe('Room A');
    expect(firstBooking.querySelector('p').textContent).toContain('Lecture');
  });

  it('should filter bookings by status', () => {
    // Set status filter to 'pending'
    document.getElementById('statusFilter').value = 'pending';

    // Call renderBookings
    renderBookings();

    const container = document.getElementById('bookingsContainer');
    expect(container.childElementCount).toBe(1); // Only one booking is 'pending'

    // Check if the booking is the pending one
    const firstBooking = container.children[0];
    expect(firstBooking.querySelector('h2').textContent).toBe('Room B'); // Pending booking
  });

  it('should filter bookings by room type', () => {
    // Set room filter to 'Classroom'
    document.getElementById('roomFilter').value = 'Classroom';

    // Call renderBookings
    renderBookings();

    const container = document.getElementById('bookingsContainer');
    expect(container.childElementCount).toBe(1); // Only one booking is in a classroom

    const firstBooking = container.children[0];
    expect(firstBooking.querySelector('h2').textContent).toBe('Room A');
  });

  it('should filter bookings by search query', () => {
    // Set search input to filter by 'Building 1'
    document.getElementById('searchInput').value = 'Building 1';

    // Call renderBookings
    renderBookings();

    const container = document.getElementById('bookingsContainer');
    expect(container.childElementCount).toBe(1); // Only one booking is in 'Building 1'

    const firstBooking = container.children[0];
    expect(firstBooking.querySelector('h2').textContent).toBe('Room A');
  });

  it('should display "No bookings found" if no bookings match the filters', () => {
    // Set filters so no bookings will match
    document.getElementById('statusFilter').value = 'confirmed';
    document.getElementById('roomFilter').value = 'Meeting Room';
    document.getElementById('searchInput').value = 'Nonexistent Building';

    // Call renderBookings
    renderBookings();

    const container = document.getElementById('bookingsContainer');
    expect(container.innerHTML).toContain('No bookings found.');
  });

  it('should call editBooking when edit button is clicked', () => {
    // Call renderBookings
    renderBookings();

    const editButton = document.querySelector('button.bg-blue-500');
    editButton.click();

    expect(editBooking).toHaveBeenCalledWith('1'); // Check that editBooking is called with correct booking ID
  });

  it('should call cancelBooking when cancel button is clicked', () => {
    // Call renderBookings
    renderBookings();

    const cancelButton = document.querySelector('button.bg-red-500');
    cancelButton.click();

    expect(cancelBooking).toHaveBeenCalledWith('1'); // Check that cancelBooking is called with correct booking ID
  });

  it('should call acceptBooking when accept button is clicked', () => {
    // Set filter to pending so accept button shows
    document.getElementById('statusFilter').value = 'pending';

    // Call renderBookings
    renderBookings();

    const acceptButton = document.querySelector('button.bg-green-500');
    acceptButton.click();

    expect(acceptBooking).toHaveBeenCalledWith('2'); // Check that acceptBooking is called with correct booking ID
  });

  it('should call rejectBooking when reject button is clicked', () => {
    // Set filter to pending so reject button shows
    document.getElementById('statusFilter').value = 'pending';

    // Call renderBookings
    renderBookings();

    const rejectButton = document.querySelector('button.bg-red-500');
    rejectButton.click();

    expect(rejectBooking).toHaveBeenCalledWith('2'); // Check that rejectBooking is called with correct booking ID
  });
});
