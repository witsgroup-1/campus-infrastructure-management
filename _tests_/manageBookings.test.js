const {
    fetchVenues,
    fetchBookings,
    getRoomInfo,
    renderBookings,
    editBooking,
    cancelBooking,
    acceptBooking,
    rejectBooking,
} = require('./copies/manageBookingsCopy'); 

// Mock the global fetch and alert
global.fetch = jest.fn();
global.alert = jest.fn();

describe('manageBookings', () => {
    let mockVenues;
    let mockBookings;
    let venues; // For storing fetched venues
    let bookings; // For storing fetched bookings

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
        });

        // Create mock HTML elements for event listeners
        document.body.innerHTML = `
            <select id="statusFilter">
                <option value="">All</option>
                <option value="confirmed">Confirmed</option>
            </select>
            <select id="roomFilter">
                <option value="">All</option>
                <option value="Hall">Hall</option>
            </select>
            <input id="searchInput" type="text" />
            <div id="bookingsContainer"></div>
        `;
    });

    // // Test fetching venues
    // test('fetchVenues should fetch venues from API', async () => {
    //     venues = await fetchVenues(); // Assign fetched venues to the variable
    //     expect(fetch).toHaveBeenCalledWith(expect.stringContaining('venues'), expect.anything());
    //     expect(venues).toEqual(mockVenues);
    // });

    // // Test fetching bookings
    // test('fetchBookings should fetch bookings from API and render them', async () => {
    //     bookings = await fetchBookings(); // Assign fetched bookings to the variable
    //     expect(fetch).toHaveBeenCalledWith(expect.stringContaining('bookings'), expect.anything());
    //     expect(bookings).toEqual(mockBookings);
    //     expect(document.getElementById('bookingsContainer').children.length).toBe(mockBookings.length);
    // });


    // Test room info retrieval
  test('getRoomInfo should return correct venue based on venueId', () => {
    expect(getRoomInfo('venue1')).toEqual(mockVenues[0]);
  });


//     // Test rendering bookings
//     test('renderBookings should render filtered bookings', () => {
//         renderBookings(); // Call the function to render bookings
//         const container = document.getElementById('bookingsContainer');

//         // Initially, all bookings should be rendered
//         expect(container.children.length).toBe(mockBookings.length);

//         // Change the search input to filter results
//         document.getElementById('searchInput').value = 'One';
//         renderBookings(); // Re-render after input change

//         // Only one booking should match the search query
//         expect(container.children.length).toBe(1); 
//     });

//     // // Test booking editing
//     // test('editBooking should simulate navigation to edit page', () => {
//     //     const bookingId = 'booking1';
//     //     editBooking(bookingId);
//     //     expect(global.alert).toBeCalledWith(`Navigating to editBooking.html?bookingId=${bookingId}`);
//     // });

//     // Test booking cancellation
//     test('cancelBooking should call API and alert success', async () => {
//         const bookingId = 'booking1';
//         await cancelBooking(bookingId);
//         expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`bookings/${bookingId}`), expect.anything());
//         expect(global.alert).toBeCalledWith(`Booking cancelled successfully`);
//     });

//     // // Test booking acceptance
//     // test('acceptBooking should call API and alert success', async () => {
//     //     const bookingId = 'booking2';
//     //     await acceptBooking(bookingId);
//     //     expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`bookings/${bookingId}`), expect.anything());
//     //     expect(global.alert).toBeCalledWith(`Booking successfully confirmed`);
//     // });

//     // Test booking rejection
//     test('rejectBooking should call API and alert success', async () => {
//         const bookingId = 'booking1';
//         await rejectBooking(bookingId);
//         expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`bookings/${bookingId}`), expect.anything());
//         expect(global.alert).toBeCalledWith(`Booking rejected`);
//     });
// 
}); 
