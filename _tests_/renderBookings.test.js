import { renderBookings } from '../src/user-dashboard/viewAllVenues'; // Adjust the import path
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('Fetch Venues', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should fetch venues successfully and call renderBookings', async () => {
    const mockData = [{ id: 1, Name: 'Conference Room', Category: 'Meeting' }];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    document.body.innerHTML = '<div id="bookingsContainer"></div>';

    await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': 'your-api-key',
        'Content-Type': 'application/json'
      }
    });

    expect(global.fetch).toHaveBeenCalledWith(url, expect.any(Object));
    expect(renderBookings).toHaveBeenCalled();
    expect(document.getElementById('bookingsContainer').innerHTML).toContain('Conference Room');
  });

  test('should handle fetch error', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    });

    document.body.innerHTML = '<div id="bookingsContainer"></div>';

    await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': 'your-api-key',
        'Content-Type': 'application/json'
      }
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(document.getElementById('bookingsContainer').innerHTML).toContain('No bookings found.');
  });

  test('should handle fetch exception', async () => {
    global.fetch.mockRejectedValue(new Error('Fetch failed'));

    document.body.innerHTML = '<div id="bookingsContainer"></div>';

    await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': 'your-api-key',
        'Content-Type': 'application/json'
      }
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(document.getElementById('bookingsContainer').innerHTML).toContain('No bookings found.');
  });
});

describe('renderBookings', () => {
  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <div id="bookingsContainer"></div>
      <input id="roomFilter" type="text" />
      <input id="searchInput" type="text" />
    `;

    // Mock data
    window.bookings = [];
  });

  test('should display a message when no bookings are available', () => {
    renderBookings();
    const container = document.getElementById('bookingsContainer');
    expect(container.innerHTML).toBe('<p class="text-center text-gray-500">No bookings found.</p>');
  });
});

describe('renderBookings with bookings data', () => {
  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <div id="bookingsContainer"></div>
      <input id="roomFilter" type="text" />
      <input id="searchInput" type="text" />
    `;

    // Mock data
    window.bookings = [
      { id: 1, Name: 'Venue 1', Category: 'Conference Room' },
      { id: 2, Name: 'Venue 2', Category: 'Meeting Room' }
    ];
  });

  test('should display all bookings when no filters are applied', () => {
    renderBookings();
    const container = document.getElementById('bookingsContainer');
    expect(container.children.length).toBe(2); // Two bookings
    expect(container.innerHTML).toContain('Venue 1');
    expect(container.innerHTML).toContain('Venue 2');
  });
});
describe('renderBookings with category filter', () => {
  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <div id="bookingsContainer"></div>
      <input id="roomFilter" type="text" value="Conference Room" />
      <input id="searchInput" type="text" />
    `;

    // Mock data
    window.bookings = [
      { id: 1, Name: 'Venue 1', Category: 'Conference Room' },
      { id: 2, Name: 'Venue 2', Category: 'Meeting Room' }
    ];
  });

  test('should display only bookings that match the category filter', () => {
    renderBookings();
    const container = document.getElementById('bookingsContainer');
    expect(container.children.length).toBe(1); // One booking matching the filter
    expect(container.innerHTML).toContain('Venue 1');
    expect(container.innerHTML).not.toContain('Venue 2');
  });
});
describe('renderBookings with search query', () => {
  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <div id="bookingsContainer"></div>
      <input id="roomFilter" type="text" />
      <input id="searchInput" type="text" value="Venue 1" />
    `;

    // Mock data
    window.bookings = [
      { id: 1, Name: 'Venue 1', Category: 'Conference Room' },
      { id: 2, Name: 'Venue 2', Category: 'Meeting Room' }
    ];
  });

  test('should display only bookings that match the search query', () => {
    renderBookings();
    const container = document.getElementById('bookingsContainer');
    expect(container.children.length).toBe(1); // One booking matching the search query
    expect(container.innerHTML).toContain('Venue 1');
    expect(container.innerHTML).not.toContain('Venue 2');
  });
});

describe('Event Listeners', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <select id="roomFilter">
        <option value="">All</option>
        <option value="Meeting">Meeting</option>
      </select>
      <input id="searchInput" type="text">
    `;

    jest.spyOn(window, 'renderBookings');
    // Mock implementation of renderBookings
    window.renderBookings = jest.fn();
  });

  test('should call renderBookings when roomFilter value changes', () => {
    const roomFilter = document.getElementById('roomFilter');
    roomFilter.value = 'Meeting';
    roomFilter.dispatchEvent(new Event('change'));
    expect(window.renderBookings).toHaveBeenCalled();
  });

  test('should call renderBookings when searchInput value changes', () => {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = 'Room';
    searchInput.dispatchEvent(new Event('input'));
    expect(window.renderBookings).toHaveBeenCalled();
  });
});
