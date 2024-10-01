const {
fetchVenues,
fetchBookings,
getRoomInfo,
venues

  } = require('./copies/manageBookingsCopy'); 
  
  jest.mock('firebase/app', () => {
    return {
        initializeApp: jest.fn(),  // Mock the initializeApp function
    };
  });
  
  jest.mock('firebase/auth', () => {
    return {
        getAuth: jest.fn(),  // Mock the getAuth function
        onAuthStateChanged: jest.fn(), // Mock auth state changes
    };
  });
  
  jest.mock('firebase/firestore', () => {
    return {
        getFirestore: jest.fn(), // Mock Firestore
        collection: jest.fn(),
        doc: jest.fn(),
        getDocs: jest.fn(),
    };
  });
  
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
  
  describe('manageBookingCopy', () => {
    beforeEach(() => {
      fetch.mockClear();
      global.alert.mockClear();
    });

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
      
        // Mock the global fetch to return the mockVenues
        fetch.mockResolvedValue({
          json: jest.fn().mockResolvedValue(mockVenues)
        });
      
        const fetchedVenues = await fetchVenues();
        
        // Expect fetch to have been called once
        expect(fetch).toHaveBeenCalledTimes(1);
        
        // Assertion to compare expected and actual data
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
      
        // Mock the global fetch to return the mockBookings
        fetch.mockResolvedValue({
          json: jest.fn().mockResolvedValue(mockBookings)
        });
      
        const fetchedBookings = await fetchBookings();
        
        // Expect fetch to have been called once
        expect(fetch).toHaveBeenCalledTimes(1);
        
        // Assertion to compare expected and actual data
        expect(fetchedBookings).toEqual(mockBookings);
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

  test('getRoomInfo should return correct venue based on venueId', () => {
    venues.push({ id: 'venue1', Name: 'Venue One' });
    expect(getRoomInfo('venue1')).toEqual({ id: 'venue1', Name: 'Venue One' });
  });


    });  