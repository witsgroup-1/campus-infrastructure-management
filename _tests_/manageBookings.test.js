const {
    fetchVenues,
    fetchBookings,
    getRoomInfo,
    renderBookings,
    editBooking,
    cancelBooking,
    acceptBooking,
    rejectBooking,
} = require('./copies/manageBookingsCopy.js'); 
// Mock the global fetch and alert
global.fetch = jest.fn();
global.alert = jest.fn();

describe('manageBookings', () => {
    let mockVenues;
    let mockBookings;
    let venues = [];
    let bookings = [];

    beforeEach(() => {
        // Set up the mock venues and bookings data
        mockVenues = [
            { id: 'venue1', Name: 'Venue One', Building: 'Building One', Category: 'Hall' },
            { id: 'venue2', Name: 'Venue Two', Building: 'Building Two', Category: 'Room' },
        ];
        
        mockBookings = [
            {
                id: 'booking1',
                date: '20 September 2024',
                start_time: '9:00 AM',
                end_time: '11:00 AM',
                purpose: 'Meeting',
                roomId: 'venue1',
                status: 'Confirmed',
                userId: 'user1',
                venueId: 'venue1',
            },
            {
                id: 'booking2',
                date: '21 September 2024',
                start_time: '10:00 AM',
                end_time: '12:00 PM',
                purpose: 'Lecture',
                roomId: 'venue2',
                status: 'Pending',
                userId: 'user2',
                venueId: 'venue2',
            },
        ];

        fetch.mockClear();
        fetch.mockImplementation((url) => {
            if (url.includes('venues')) {
                return Promise.resolve({
                    json: jest.fn().mockResolvedValue(mockVenues),
                });
            } else if (url.includes('bookings')) {
                return Promise.resolve({
                    json: jest.fn().mockResolvedValue(mockBookings),
                });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });


    test('fetchVenues should return all venues stored in DB', async () => {
      
        // Mock the global fetch to return the mockVenues
        fetch.mockResolvedValue({
          json: jest.fn().mockResolvedValue(mockVenues)
        });
      
        const fetchedVenues = fetchVenues();
        
        // Expect fetch to have been called once
        expect(fetch).toHaveBeenCalledTimes(1);
        
        // Assertion to compare expected and actual data
        expect(fetchedVenues).toEqual(mockVenues);
      });

});