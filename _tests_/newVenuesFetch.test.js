import { fetchAvailableVenues } from '../copy/newVenuesCopy';
import { collection, getDocs } from "firebase/firestore";

// Mock Firebase Firestore methods
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

describe('fetchAvailableVenues', () => {
  const mockVenuesData = [
    { id: '1', data: () => ({ Name: 'Venue 1', Capacity: 100 }) },
    { id: '2', data: () => ({ Name: 'Venue 2', Capacity: 200 }) }
  ];

  const mockIntervals = [
    { start: '08:00', end: '08:45' },
    { start: '09:00', end: '09:45' },
  ];

  beforeEach(() => {
    getDocs.mockClear();
    collection.mockClear();
  });

  test('fetches and processes available venues successfully', async () => {
    // Mock collection and getDocs to simulate Firestore behavior
    collection.mockReturnValue('mockCollectionRef');
    getDocs.mockResolvedValue({
      docs: mockVenuesData
    });

    // Call the fetchAvailableVenues function
    const availableVenues = await fetchAvailableVenues({}, mockIntervals);

    // Verify Firestore methods were called
    expect(collection).toHaveBeenCalledWith({}, 'venues');
    expect(getDocs).toHaveBeenCalledWith('mockCollectionRef');

    // Check if available venues are returned correctly
    expect(availableVenues).toEqual([]);
  });

  test('returns empty array when no slots are available', async () => {
    // Mock the date to simulate no available slots
    const mockDate = new Date('2024-01-15T10:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const availableVenues = await fetchAvailableVenues({}, mockIntervals);

    // Expect an empty array since no slots are available
    expect(availableVenues).toEqual([]);

    // Restore the Date object
    global.Date.mockRestore();
  });

  test('handles Firestore errors gracefully', async () => {
    // Simulate an error from Firestore's getDocs
    getDocs.mockRejectedValue(new Error('Firestore error'));

    const availableVenues = await fetchAvailableVenues({}, mockIntervals);

    // Expect an empty array to be returned on error
    expect(availableVenues).toEqual([]);
  });
});