// addVenues.test.js

import { fetchVenues, displayVenues, createVenueBlock, addVenue } from './addVenueCopy';

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM methods
document.getElementById = jest.fn();
document.createElement = jest.fn(() => ({
  classList: {
    add: jest.fn()
  },
  innerHTML: ''
}));

describe('Venue Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchVenues should call the API and return venues', async () => {
    const mockVenues = [
      { Name: 'Venue 1', Capacity: 100, Category: 'Conference', Features: 'Wi-Fi', Building: 'A', id: 1 },
      { Name: 'Venue 2', Capacity: 50, Category: 'Classroom', Features: 'Projector', Building: 'B', id: 2 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockVenues)
    });

    const result = await fetchVenues();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://campus-infrastructure-management.azurewebsites.net/api/venues',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-api-key': expect.any(String),
          'Content-Type': 'application/json'
        })
      })
    );

    expect(result).toEqual(mockVenues);
  });

  test('displayVenues should create venue blocks', () => {
    const mockVenues = [
      { Name: 'Venue 1', Capacity: 100, Category: 'Conference', Features: 'Wi-Fi', Building: 'A', id: 1 },
      { Name: 'Venue 2', Capacity: 50, Category: 'Classroom', Features: 'Projector', Building: 'B', id: 2 }
    ];

    const venuesList = {
      innerHTML: '',
      appendChild: jest.fn()
    };
    document.getElementById.mockReturnValue(venuesList);

    displayVenues(mockVenues);

    expect(venuesList.innerHTML).toBe('');
    expect(venuesList.appendChild).toHaveBeenCalledTimes(2);
    expect(document.createElement).toHaveBeenCalledTimes(2);
  });

  test('createVenueBlock should return a div with venue information', () => {
    const block = createVenueBlock('Test Venue', 100, 'Conference', 'Wi-Fi', 'A', 1);

    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(block.classList.add).toHaveBeenCalledWith('bg-gray-200', 'p-4', 'rounded-md', 'mb-2', 'cursor-pointer');
    expect(block.innerHTML).toContain('Test Venue');
    expect(block.innerHTML).toContain('100');
    expect(block.innerHTML).toContain('Conference');
    expect(block.innerHTML).toContain('Wi-Fi');
    expect(block.innerHTML).toContain('A');
  });

  test('addVenue should call the API and return true on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true
    });

    const venue = { Name: 'New Venue', Capacity: 200, Category: 'Lab', Features: 'Computers', Building: 'C' };
    const result = await addVenue(venue);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://campus-infrastructure-management.azurewebsites.net/api/venues',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': expect.any(String),
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(venue)
      })
    );

    expect(result).toBe(true);
  });
});