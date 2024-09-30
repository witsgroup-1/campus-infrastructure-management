// Import the necessary modules
import { cancelBooking, acceptBooking, renderBookings, bookings, venues} from './copies/manageBookingsCopy'; 


// Mock the global fetch function
global.fetch = jest.fn();
global.prompt = jest.fn();
global.alert = jest.fn();

// Mock DOM elements for renderBookings
document.body.innerHTML = `
  <div id="bookingsContainer"></div>
  <input id="statusFilter" value="confirmed">
  <input id="roomFilter" value="">
  <input id="searchInput" value="">
`;

describe('Booking Functions', () => {

  // Reset mocks before each test
  beforeEach(() => {
    fetch.mockClear();
    prompt.mockClear();
    alert.mockClear();
  });

  // Test Suite for cancelBooking
  describe('cancelBooking', () => {
    test('should send cancel request and update status', async () => {
      // Mock prompt input
      prompt.mockReturnValue('Test reason for cancellation');

      // Mock the booking data returned from getBookingInfo
      const mockBooking = {
        userId: '123',
        venueId: '456',
        roomId: '789',
        start_time: '10:00',
        end_time: '11:00',
        purpose: 'Meeting',
        date: '2024-09-29'
      };

      // Mock the getBookingInfo function to return mock booking
      const getBookingInfo = jest.fn().mockReturnValue(mockBooking);

      // Mock API response
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      // Call the cancelBooking function
      await cancelBooking('booking-id');

      // Check that the fetch was called to update the booking status
      expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          status: 'Cancelled'
        })
      }));

      // Check if notification is sent with correct message
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/users/${mockBooking.userId}/notifications`), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          message: expect.stringContaining('Test reason for cancellation'),
          type: "notification",
          sendAt: "09:00"
        })
      }));

      // Check if alert is called to notify cancellation success
      expect(alert).toHaveBeenCalledWith('Booking cancelled and notification sent.');
    });

    test('should not proceed if cancellation reason is not provided', async () => {
      // Mock prompt returning null (indicating cancellation)
      prompt.mockReturnValue(null);

      await cancelBooking('booking-id');

      // Ensure fetch is never called since cancellation was aborted
      expect(fetch).not.toHaveBeenCalled();

      // Ensure alert is called to notify the user
      expect(alert).toHaveBeenCalledWith('Cancellation reason is required to proceed.');
    });
  });

  // Test Suite for acceptBooking
  describe('acceptBooking', () => {
    test('should send accept request and update booking status', async () => {
      // Mock the booking data returned from getBookingInfo
      const mockBooking = {
        userId: '123',
        venueId: '456',
        roomId: '789',
        start_time: '10:00',
        end_time: '11:00',
        purpose: 'Meeting',
        date: '2024-09-29'
      };

      // Mock API response
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      // Call the acceptBooking function
      await acceptBooking('booking-id');

      // Check that the fetch was called to update the booking status
      expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          status: 'Approved'
        })
      }));

      // Check if notification is sent with correct message
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/users/${mockBooking.userId}/notifications`), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          message: expect.stringContaining('Booking approved'),
          type: "notification",
          sendAt: "09:00"
        })
      }));
    });
  });

  // Test Suite for renderBookings
  describe('renderBookings', () => {
    test('should render bookings based on filter criteria', () => {
      // Mock bookings and venues data
      const mockBookings = [
        {
          id: 'booking1',
          venueId: 'venue1',
          status: 'confirmed',
          date: '2024-09-29',
          start_time: '10:00',
          end_time: '11:00',
          purpose: 'Meeting'
        }
      ];

      const mockVenues = [
        {
          id: 'venue1',
          Name: 'Room 101',
          Category: 'Lecture Hall',
          Building: 'Main Campus'
        }
      ];

      // Mock global data for bookings and venues
      global.bookings = mockBookings;
      global.venues = mockVenues;

      // Call renderBookings function
      renderBookings();

      // Check that the bookingsContainer was updated with booking info
      const container = document.getElementById('bookingsContainer');
      expect(container.innerHTML).toContain('Room 101');
      expect(container.innerHTML).toContain('Meeting');
    });
  });
});
