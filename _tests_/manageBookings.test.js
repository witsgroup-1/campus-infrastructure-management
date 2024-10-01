// Import the function (assuming it's in a module)
const { getRoomInfo } = require('./copies/manageBookingsCopy');

describe('getRoomInfo', () => {
    beforeEach(() => {
      // Explicitly declare global variable venues
      global.venues = [
        { id: 'venue1', Name: 'Conference Hall', Category: 'Conference', Building: 'Building A' },
        { id: 'venue2', Name: 'Lecture Room', Category: 'Lecture', Building: 'Building B' }
      ];
    });
  
    test('should return the correct venue information when a valid venueId is provided', () => {
      // Act
      const result = getRoomInfo('venue1');
  
      // Assert
      expect(result).toEqual({ id: 'venue1', Name: 'Conference Hall', Category: 'Conference', Building: 'Building A' });
    });
  
    test('should return undefined if venueId is not found', () => {
      const invalidVenueId = 'invalid_venue';
  
      // Act
      const result = getRoomInfo(invalidVenueId);
  
      // Assert
      expect(result).toBeUndefined();
    });
  });
  

