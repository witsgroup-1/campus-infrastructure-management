import { fetchAvailableVenues } from '../copy/newVenuesCopy';
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

  test('fetches and processes available venues', async () => {
    // Mock collection and getDocs
    collection.mockReturnValue('mockCollectionRef');
    getDocs.mockResolvedValue({
      docs: mockVenuesData
    });

    // Call the function
    const availableVenues = await fetchAvailableVenues({}, mockIntervals);

    // Check that the Firestore functions were called correctly
    expect(collection).toHaveBeenCalledWith({}, 'venues');
    expect(getDocs).toHaveBeenCalledWith('mockCollectionRef');

    // Check the result
    expect(availableVenues).toEqual([
      { Name: 'Venue 1', Capacity: 100, Features: [], Building: undefined },
      { Name: 'Venue 2', Capacity: 200, Features: [], Building: undefined },
    ]);
  });

  test('returns empty array when no slots are available', async () => {
    const mockIntervals = [
      { start: '08:00', end: '08:45' },
    ];

    const mockDate = new Date('2024-01-15T10:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const availableVenues = await fetchAvailableVenues({}, mockIntervals);
    expect(availableVenues).toEqual([]);
    
    global.Date.mockRestore();
  });

  test('handles Firestore errors gracefully', async () => {
    // Simulate an error from Firestore
    getDocs.mockRejectedValue(new Error('Firestore error'));

    const availableVenues = await fetchAvailableVenues({}, mockIntervals);

    // Should return an empty array if there's an error
    expect(availableVenues).toEqual([]);
  });
});
