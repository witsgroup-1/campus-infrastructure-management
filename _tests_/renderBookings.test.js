
import { getRoomInfo } from './copies/manageBookingsCopy'; 
import { renderBookings } from './copies/manageBookingsCopy'; 

describe('renderBookings', () => {
  let container;
  let bookings;

  beforeEach(() => {
    // Set up a mock DOM environment
    document.body.innerHTML = `
      <div id="bookingsContainer"></div>
      <input id="statusFilter" value="">
      <input id="roomFilter" value="">
      <input id="searchInput" value="">
    `;
    
    container = document.getElementById('bookingsContainer');

    // Set up bookings data
    bookings = [
      { id: '1', venueId: '123', date: '2024-10-01', start_time: '10:00', end_time: '12:00', purpose: 'Meeting', status: 'confirmed' },
      { id: '2', venueId: '456', date: '2024-10-02', start_time: '14:00', end_time: '16:00', purpose: 'Lecture', status: 'pending' }
    ];

    // Mock the getRoomInfo function using jest.spyOn
    jest.spyOn(window, 'getRoomInfo').mockImplementation((venueId) => {
      return venueId === '123'
        ? { Name: 'Room A', Category: 'Classroom', Building: 'Building 1' }
        : { Name: 'Room B', Category: 'Meeting Room', Building: 'Building 2' };
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test('should display filtered bookings with correct details', () => {
    renderBookings(bookings);
    
    const bookingItems = container.querySelectorAll('div');
    expect(bookingItems.length).toBe(2);
    
    // Check first booking details
    const firstBooking = bookingItems[0];
    expect(firstBooking.querySelector('h2').textContent).toBe('Room A');
    expect(firstBooking.querySelector('.text-gray-600').textContent).toContain('10:00 - 12:00');
  });

  test('should filter bookings by status', () => {
    document.getElementById('statusFilter').value = 'pending';
    renderBookings(bookings);
    
    const bookingItems = container.querySelectorAll('div');
    expect(bookingItems.length).toBe(1);
    
    const pendingBooking = bookingItems[0];
    expect(pendingBooking.querySelector('h2').textContent).toBe('Room B');
  });

  test('should filter bookings by room type', () => {
    document.getElementById('roomFilter').value = 'Classroom';
    renderBookings(bookings);
    
    const bookingItems = container.querySelectorAll('div');
    expect(bookingItems.length).toBe(1);
    
    const classroomBooking = bookingItems[0];
    expect(classroomBooking.querySelector('h2').textContent).toBe('Room A');
  });

  test('should filter bookings by search query', () => {
    document.getElementById('searchInput').value = 'Building 2';
    renderBookings(bookings);
    
    const bookingItems = container.querySelectorAll('div');
    expect(bookingItems.length).toBe(1);
    
    const building2Booking = bookingItems[0];
    expect(building2Booking.querySelector('h2').textContent).toBe('Room B');
  });

  test('should display "No bookings found" if no bookings match the filters', () => {
    document.getElementById('statusFilter').value = 'rejected';
    renderBookings(bookings);
    
    expect(container.innerHTML).toContain('No bookings found');
  });

  test('should call editBooking when edit button is clicked', () => {
    const mockEditBooking = jest.fn();
    window.editBooking = mockEditBooking; // Mock the global function

    renderBookings(bookings);
    
    const editButton = container.querySelector('button');
    editButton.click();
    
    expect(mockEditBooking).toHaveBeenCalledWith('1');
  });

  test('should call cancelBooking when cancel button is clicked', () => {
    const mockCancelBooking = jest.fn();
    window.cancelBooking = mockCancelBooking; // Mock the global function

    renderBookings(bookings);
    
    const cancelButton = container.querySelector('button.bg-red-500');
    cancelButton.click();
    
    expect(mockCancelBooking).toHaveBeenCalledWith('1');
  });

  // Additional tests for acceptBooking, rejectBooking, etc.
});
