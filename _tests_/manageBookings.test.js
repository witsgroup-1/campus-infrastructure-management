// bookings.test.js
const { fetchVenues, fetchBookings, getRoomInfo, getBookingInfo, renderBookings, cancelBooking, acceptBooking } = require('./copies/manageBookingsCopy'); // Adjust path accordingly
const { JSDOM } = require('jsdom');
global.fetch = jest.fn();

// Import or mock necessary data/functions if needed

describe('getRoomInfo', () => {
    beforeEach(() => {
      // Reset venues array before each test
      venues = [];
    });
  
    test('should return the correct room info for a given venueId', () => {
      // Arrange
      const venueId = '123';
      const expectedRoom = {
        id: '123',
        Name: 'Conference Room A',
        Category: 'Conference',
        Building: 'Main Building'
      };
      venues = [
        { id: '123', Name: 'Conference Room A', Category: 'Conference', Building: 'Main Building' },
        { id: '456', Name: 'Lecture Hall', Category: 'Lecture', Building: 'Education Building' }
      ];
  
      // Act
      const roomInfo = getRoomInfo(venueId);
  
      // Assert
      expect(roomInfo).toEqual(expectedRoom);
    });
  
    test('should return undefined if no room matches the venueId', () => {
      // Arrange
      const venueId = '789'; // This ID does not exist in the venues array
      venues = [
        { id: '123', Name: 'Conference Room A', Category: 'Conference', Building: 'Main Building' },
        { id: '456', Name: 'Lecture Hall', Category: 'Lecture', Building: 'Education Building' }
      ];
  
      // Act
      const roomInfo = getRoomInfo(venueId);
  
      // Assert
      expect(roomInfo).toBeUndefined();
    });
  
    test('should return undefined if venues array is empty', () => {
      // Act
      const roomInfo = getRoomInfo('123');
  
      // Assert
      expect(roomInfo).toBeUndefined();
    });
  });
  