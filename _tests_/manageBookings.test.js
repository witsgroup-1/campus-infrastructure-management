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
    rejectBooking,
    updateBookingStatus,  // Make sure this is imported for the test
    venues,
    bookings
  } = require('./copies/manageBookingsCopy.js'); 
  
  jest.mock('firebase/app', () => {
    return {
      initializeApp: jest.fn(),
    };
  });
  
  jest.mock('firebase/auth', () => {
    return {
      getAuth: jest.fn(),
      onAuthStateChanged: jest.fn(),
    };
  });
  
  jest.mock('firebase/firestore', () => {
    return {
      getFirestore: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      getDocs: jest.fn(),
    };
  });
  
  // Mock fetch API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    })
  );
  
  // Mock window.alert
  beforeAll(() => {
    global.alert = jest.fn();
  });
  
  describe('manageBookingCopy', () => {
    beforeEach(() => {
      fetch.mockClear();
      global.alert.mockClear();
      venues.length = 0;
    });
  
  
    // Test getRoomInfo function
    test('getRoomInfo should return correct venue based on venueId', () => {
      venues.push({ id: 'venue1', Name: 'Venue One' });
      expect(getRoomInfo('venue1')).toEqual({ id: 'venue1', Name: 'Venue One' });
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
  
    // Test getBooking function
    test('fetchVenues should return all venues stored in DB', async () => {
      const mockVenues = [
        {
          building: "Great Hall",
          Capacity: "300",
          Category: "Hall",
          Features: [],
          Name: "Great Hall",
          venueId: "1234"
        },
        {
          building: "Hall 29",
          Capacity: "300",
          Category: "Exam Hall",
          Features: [],
          Name: "Hall 29",
          venueId: "1534"
        }
      ];
  
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockVenues)
      });
  
      const fetchedVenues = await fetchVenues();
  
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetchedVenues).toEqual(mockVenues);
    });
  
    test('fetchBookings should return all bookings stored in DB', async () => {
      const mockBookings = [
        {
          id: 'booking1',
          date: '20 September 2024',
          start_time: '9:00 AM',
          end_time: '11:00 AM',
          purpose: 'Meeting',
          roomId: '1278',
          status: 'Confirmed',
          userId: 'user1',
          venueId: '1235'
        },
        {
          id: 'booking2',
          date: '20 September 2024',
          start_time: '8:00 AM',
          end_time: '09:45 AM',
          purpose: 'Lecture',
          roomId: '2356',
          status: 'Confirmed',
          userId: '01',
          venueId: '2356'
        }
      ];
  
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockBookings)
      });
  
      const fetchedBookings = await fetchBookings();
  
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetchedBookings).toEqual(mockBookings);
    });
  
    // Test rejectBooking function
    test('rejectBooking should reject booking and show alert', async () => {
      const bookingId = 'booking1';
  
      // Mock the updateBookingStatus function
      const updateBookingStatusMock = jest.spyOn(module.exports, 'updateBookingStatus')
        .mockResolvedValue(); // Resolve without any value
  
      await rejectBooking(bookingId);
  
      // Check that updateBookingStatus was called with the correct parameters
      expect(updateBookingStatusMock).toHaveBeenCalledWith(bookingId, 'rejected');
      
      // Check that alert was called with the expected message
      expect(global.alert).toHaveBeenCalledWith('Booking rejected');
      
      // Clean up the mock
      updateBookingStatusMock.mockRestore();
    });
  });
  