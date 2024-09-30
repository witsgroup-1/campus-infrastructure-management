// bookings.test.js
const { fetchVenues, fetchBookings, getRoomInfo, getBookingInfo, renderBookings, cancelBooking, acceptBooking } = require('./copies/manageBookingsCopy'); // Adjust path accordingly
const { JSDOM } = require('jsdom');
global.fetch = jest.fn();

let venues = []; // Change to let
let bookings = []; // Change to let

// Sample data for testing
const mockVenues = [
    { id: 1, Name: 'Room A', Category: 'Lecture' },
    { id: 2, Name: 'Room B', Category: 'Seminar' },
];

const mockBookings = [
    { id: 1, venueId: 1, date: '2024-09-30', start_time: '10:00', end_time: '12:00', purpose: 'Class', status: 'Pending' },
    { id: 2, venueId: 2, date: '2024-09-30', start_time: '13:00', end_time: '15:00', purpose: 'Workshop', status: 'Confirmed' },
];

// Tests for fetchVenues
describe('fetchVenues', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should fetch venues and update the venues array', async () => {
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockVenues),
        });

        await fetchVenues();
        expect(venues).toEqual(mockVenues);
    });

    it('should log an error when fetching venues fails', async () => {
        console.error = jest.fn();
        fetch.mockRejectedValueOnce(new Error('Fetch failed'));

        await fetchVenues();
        expect(console.error).toHaveBeenCalledWith('Error fetching venues:', expect.any(Error));
    });
});

// Tests for fetchBookings
describe('fetchBookings', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should fetch bookings and update the bookings array', async () => {
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockBookings),
        });

        await fetchBookings();
        expect(bookings).toEqual(mockBookings);
    });

    it('should log an error when fetching bookings fails', async () => {
        console.error = jest.fn();
        fetch.mockRejectedValueOnce(new Error('Fetch failed'));

        await fetchBookings();
        expect(console.error).toHaveBeenCalledWith('Error fetching bookings:', expect.any(Error));
    });
});

// Tests for getRoomInfo
describe('getRoomInfo', () => {
    beforeEach(() => {
        venues = mockVenues; // Use let to assign mock venues
    });

    it('should return room info for a valid venueId', () => {
        const roomInfo = getRoomInfo(1);
        expect(roomInfo).toEqual(mockVenues[0]);
    });

    it('should return undefined for an invalid venueId', () => {
        const roomInfo = getRoomInfo(999); // Invalid ID
        expect(roomInfo).toBeUndefined();
    });
});

// Tests for getBookingInfo
describe('getBookingInfo', () => {
    beforeEach(() => {
        bookings = mockBookings; // Use let to assign mock bookings
    });

    it('should return booking info for a valid bookingId', () => {
        const bookingInfo = getBookingInfo(1);
        expect(bookingInfo).toEqual(mockBookings[0]);
    });

    it('should return undefined for an invalid bookingId', () => {
        const bookingInfo = getBookingInfo(999); // Invalid ID
        expect(bookingInfo).toBeUndefined();
    });
});

// Tests for cancelBooking
describe('cancelBooking', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should update booking status to cancelled', async () => {
        const bookingId = 1;
        fetch.mockResolvedValueOnce({ ok: true });

        await cancelBooking(bookingId);
        expect(fetch).toHaveBeenCalled(); // Ensure fetch was called
    });

    it('should alert user and log an error if update fails', async () => {
        const bookingId = 1;
        console.error = jest.fn();
        window.alert = jest.fn(); // Mock alert
        fetch.mockResolvedValueOnce({ ok: false });

        await cancelBooking(bookingId);
        expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
        expect(window.alert).toHaveBeenCalledWith('An error occurred while cancelling the booking.');
    });
});

// Tests for acceptBooking
describe('acceptBooking', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should update booking status to approved', async () => {
        const bookingId = 1;
        fetch.mockResolvedValueOnce({ ok: true });

        await acceptBooking(bookingId);
        expect(fetch).toHaveBeenCalled(); // Ensure fetch was called
    });

    it('should alert user and log an error if update fails', async () => {
        const bookingId = 1;
        console.error = jest.fn();
        window.alert = jest.fn(); // Mock alert
        fetch.mockResolvedValueOnce({ ok: false });

        await acceptBooking(bookingId);
        expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
        expect(window.alert).toHaveBeenCalledWith('An error occurred while accepting the booking.');
    });
});
