// bookings.test.js
const {
    fetchVenues,
    fetchBookings,
    getRoomInfo,
    renderBookings,
    editBooking,
    cancelBooking,
    acceptBooking,
    rejectBooking,
  } = require('./bookings'); 
  
  describe('Booking Functions', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      document.body.innerHTML = `
        <div id="bookingsContainer"></div>
        <select id="statusFilter"></select>
        <select id="roomFilter"></select>
        <input id="searchInput" type="text" />
      `;
    });
  
    afterEach(() => {
      jest.resetAllMocks();
    });
  
    test('fetchVenues should fetch and store venues', async () => {
      const mockData = [{ id: 1, Name: 'Room A', Category: 'Classroom' }];
      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockData),
      });
  
      await fetchVenues('mockApiKey');
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.any(Object));
      expect(venues).toEqual(mockData);
    });
  
    test('getRoomInfo should return correct venue', () => {
      venues = [{ id: 1, Name: 'Room A' }];
      const result = getRoomInfo(1);
      expect(result).toEqual({ id: 1, Name: 'Room A' });
    });

});