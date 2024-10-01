// Import the function (assuming it's in a module)
const { getRoomInfo } = require('./copies/manageBookingsCopy');

describe('getRoomInfo', () => {
  beforeEach(() => {
    // Reset the venues array before each test to avoid state leaks
    global.venues = [];
  });

  test('should return the correct venue information when a valid venueId is provided', () => {
    // Arrange
    global.venues = [
      { id: 'venue1', Name: 'Conference Hall', Category: 'Conference', Building: 'Building A' },
      { id: 'venue2', Name: 'Lecture Room', Category: 'Lecture', Building: 'Building B' }
    ];
    const venueId = 'venue1';

    // Act
    const result = getRoomInfo(venueId);

    // Assert
    expect(result).toEqual({ id: 'venue1', Name: 'Conference Hall', Category: 'Conference', Building: 'Building A' });
  });

  test('should return undefined if venueId is not found', () => {
    // Arrange
    global.venues = [
      { id: 'venue1', Name: 'Conference Hall', Category: 'Conference', Building: 'Building A' },
      { id: 'venue2', Name: 'Lecture Room', Category: 'Lecture', Building: 'Building B' }
    ];
    const invalidVenueId = 'invalid_venue';

    // Act
    const result = getRoomInfo(invalidVenueId);

    // Assert
    expect(result).toBeUndefined();
  });
});
