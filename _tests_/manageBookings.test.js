// Import the necessary modules
import { fetchVenues } from './yourFile';  // Adjust the import based on your file structure

describe('fetchVenues', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch venues and populate the venues array', async () => {
    const mockVenues = [{ id: '1', name: 'Main Hall' }];  // Mocked venue data

    // Mocking the fetch response
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockVenues),
    });

    await fetchVenues();
    
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.any(Object));  // Ensure fetch was called
    expect(venues).toEqual(mockVenues);  // Check if venues array was updated
  });

  it('should handle errors during fetch', async () => {
    global.fetch.mockRejectedValue(new Error('Failed to fetch venues'));

    console.error = jest.fn();  // Mock console.error

    await fetchVenues();

    expect(console.error).toHaveBeenCalledWith('Error fetching venues:', expect.any(Error));
  });
});
