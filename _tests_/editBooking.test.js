const { fetchVenues, populateVenues } = require('../src/manage-bookings/editBooking.js');

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { id: '1', Name: 'Conference Room', Category: 'Meeting', Location: '1st Floor' }
    ]),
  })
);

test('fetchVenues populates venues array and calls populateVenues', async () => {
  // Spy on populateVenues to mock its behavior
  const mockPopulateVenues = jest.spyOn(require('../src/manage-bookings/editBooking.js'), 'populateVenues');
  mockPopulateVenues.mockImplementation(() => {});

  await fetchVenues();

  expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/venues', expect.any(Object));
  expect(venues).toEqual([{ id: '1', Name: 'Conference Room', Category: 'Meeting', Location: '1st Floor' }]);
  expect(mockPopulateVenues).toHaveBeenCalledWith(venues);
});
