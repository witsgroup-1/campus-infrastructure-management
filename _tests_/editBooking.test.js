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
} = require('./copies/editBookingCopy'); 

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

    document.getElementById = jest.fn((id) => {
      switch(id) {
        case 'venueSelector': return { value: 'venue1' };
        case 'bookingDate': return { value: '2024-09-20' };
        case 'timeSlot': return { value: '9:00 AM - 11:00 AM' };
        case 'statusSelection': return { value: 'Confirmed' };
        default: return null;
      }
    });
    

    test('saveChanges should send a PUT request and alert success message without API key', async () => {
      // Mock the fetch response for the PUT request
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          message: 'Booking edited successfully'
        })
      });
  
      // Mock the API key to prevent real exposure
      const mockApiKey = 'mock-api-key';
  
      // Mock headers function to simulate API key being passed
      const mockHeaders = {
        'x-api-key': mockApiKey,
        'Content-Type': 'application/json'
      };
  
      // Call the saveChanges function
      await saveChanges('booking1');
  
      // Expect fetch to have been called with correct URL and method
      expect(fetch).toHaveBeenCalledWith(expect.any(String), {
        method: 'PUT',
        headers: expect.objectContaining(mockHeaders), // Check that mock headers contain the API key and content type
        body: JSON.stringify({
          start_time: '9:00 AM',
          end_time: '11:00 AM',
          date: '20 September 2024',
          venueId: 'venue1',
          status: 'Confirmed'
        })
      });
  
      // Check that the alert function was called with the success message
      expect(global.alert).toHaveBeenCalledWith('Booking edited successfully');
    });


});
