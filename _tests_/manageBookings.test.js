// fetchVenues.test.js

const mockVenuesData = [
  { id: "1", Name: "Venue A", Category: "Auditorium", Building: "Building A" },
  { id: "2", Name: "Venue B", Category: "Conference Room", Building: "Building B" }
];

global.fetch = jest.fn(() =>
Promise.resolve({
  json: () => Promise.resolve(mockVenuesData)
})
);

const { fetchVenues } = require('./copies/manageBookingsCopy');

describe("fetchVenues", () => {
  it("fetches venues and updates the venues array", async () => {
      await fetchVenues();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('https://campus-infrastructure-management.azurewebsites.net/api/venues', {
          method: 'GET',
          headers: {
            'x-api-key': expect.any(String),
            'Content-Type': 'application/json'
          }
      });

      expect(venues).toEqual(mockVenuesData); // Verify that fetched data matches expected
  });
});
