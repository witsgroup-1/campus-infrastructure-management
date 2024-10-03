// addVenues.test.js

import { fetchVenues, displayVenues, createVenueBlock, addVenue, handleFormSubmit } from './addVenueCopy';

// Mock fetch globally
global.fetch = jest.fn();

describe('Venue Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id="venues-list"></div>
      <form id="venue-form">
        <input id="name" value="Test Venue">
        <input id="capacity" value="100">
        <input id="category" value="Conference">
        <input id="features" value="Wi-Fi">
        <input id="building" value="A">
      </form>
    `;
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

  test('fetchVenues should handle errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API error'));

    const result = await fetchVenues();

    expect(result).toEqual([]);
  });

  test('displayVenues should create venue blocks', () => {
    const mockVenues = [
      { Name: 'Venue 1', Capacity: 100, Category: 'Conference', Features: 'Wi-Fi', Building: 'A', id: 1 },
      { Name: 'Venue 2', Capacity: 50, Category: 'Classroom', Features: 'Projector', Building: 'B', id: 2 }
    ];

    const result = displayVenues(mockVenues);

    expect(result.length).toBe(2);
    expect(result[0].innerHTML).toContain('Venue 1');
    expect(result[1].innerHTML).toContain('Venue 2');
  });

  test('createVenueBlock should return a div element with venue information', () => {
    const result = createVenueBlock('Test Venue', 100, 'Conference', 'Wi-Fi', 'A', 1);

    expect(result.tagName).toBe('DIV');
    expect(result.innerHTML).toContain('Test Venue');
    expect(result.innerHTML).toContain('100');
    expect(result.innerHTML).toContain('Conference');
    expect(result.innerHTML).toContain('Wi-Fi');
    expect(result.innerHTML).toContain('A');
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

  test('addVenue should handle errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API error'));

    const venue = { Name: 'New Venue', Capacity: 200, Category: 'Lab', Features: 'Computers', Building: 'C' };
    const result = await addVenue(venue);

    expect(result).toBe(false);
  });

  test('handleFormSubmit should add a new venue and update the display', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([{ Name: 'Test Venue', Capacity: 100, Category: 'Conference', Features: 'Wi-Fi', Building: 'A', id: 1 }])
    });

    global.alert = jest.fn();

    const event = { preventDefault: jest.fn(), target: { reset: jest.fn() } };
    await handleFormSubmit(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.alert).toHaveBeenCalledWith('Venue added successfully');
    expect(event.target.reset).toHaveBeenCalled();

    const venuesList = document.getElementById('venues-list');
    expect(venuesList.children.length).toBe(1);
    expect(venuesList.innerHTML).toContain('Test Venue');
  });

  test('handleFormSubmit should show an error alert on failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    global.alert = jest.fn();

    const event = { preventDefault: jest.fn(), target: { reset: jest.fn() } };
    await handleFormSubmit(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.alert).toHaveBeenCalledWith('Failed to add venue');
    expect(event.target.reset).not.toHaveBeenCalled();
  });
});