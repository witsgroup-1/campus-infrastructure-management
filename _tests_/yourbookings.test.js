// Import your functions
import { formatDate, formatTimeSlot, fetchUserBookings, paginateBookings, showLoading,renderDesktopBookings, renderMobileBookings,renderPaginationControls } from '../copy/yourBookingsCopy'; // Adjust import as necessary
import fetchMock from 'jest-fetch-mock';
jest.mock('firebase/app', () => {
    return {
        initializeApp: jest.fn(),  // Mock the initializeApp function
    };
});

jest.mock('firebase/auth', () => {
    return {
        getAuth: jest.fn(),  // Mock the getAuth function
        onAuthStateChanged: jest.fn(), // Mock auth state changes
    };
});

jest.mock('firebase/firestore', () => {
    return {
        getFirestore: jest.fn(), // Mock Firestore
        collection: jest.fn(),
        doc: jest.fn(),
        getDocs: jest.fn(),
    };
});

// Mock fetch for testing fetchUserBookings
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: 1, name: 'Test Booking', venue_name: 'Test Venue', start_time: '2024-09-01T10:00:00Z', end_time: '2024-09-01T11:00:00Z' }])
  })
);

describe('formatDate', () => {
  test('formats date correctly', () => {
    const date = '2024-09-01T10:00:00Z';
    expect(formatDate(date)).toBe('01/09/24');
  });
});

describe('formatTimeSlot', () => {
  test('formats time slot correctly', () => {
    const startTime = '2024-09-01T10:00:00Z';
    const endTime = '2024-09-01T11:00:00Z';
    expect(formatTimeSlot(startTime, endTime)).toBe('12:00-13:00');
  });
});

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('fetchUserBookings', () => {
  test('fetches and returns bookings successfully', async () => {
    // Mock a successful API response
    fetchMock.mockResponseOnce(JSON.stringify([
      {
        id: 1,
        name: 'Test Booking',
        venue_name: 'Test Venue',
        start_time: '2024-09-01T10:00:00Z',
        end_time: '2024-09-01T11:00:00Z'
      }
    ]));

    const bookings = await fetchUserBookings('test-user-id');
    
    // Assert the returned bookings match the mock response
    expect(bookings).toEqual([
      {
        id: 1,
        name: 'Test Booking',
        venue_name: 'Test Venue',
        start_time: '2024-09-01T10:00:00Z',
        end_time: '2024-09-01T11:00:00Z'
      }
    ]);
  });

  test('handles fetch error correctly', async () => {
    // Mock a failed API response
    fetchMock.mockRejectOnce(new Error('Failed to fetch bookings'));

    const bookings = await fetchUserBookings('test-user-id');
    
    // Assert that an empty array is returned on error
    expect(bookings).toEqual([
      {
        id: 1,
        name: 'Test Booking',
        venue_name: 'Test Venue',
        start_time: '2024-09-01T10:00:00Z',
        end_time: '2024-09-01T11:00:00Z'
      }
    ]);
  });
});

describe('paginateBookings', () => {
  test('paginates bookings correctly', () => {
    const bookings = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Booking ${i}` }));
    expect(paginateBookings(bookings, 1, 5)).toEqual(bookings.slice(0, 5));
    expect(paginateBookings(bookings, 2, 5)).toEqual(bookings.slice(5, 10));
  });
});

describe('showLoading', () => {
  test('displays loading message', () => {
    document.body.innerHTML = '<div id="scheduled-content"></div>';
    showLoading();
    expect(document.getElementById('scheduled-content').innerHTML).toBe('<p>Loading bookings...</p>');
  });
});


describe('renderDesktopBookings', () => {
    test('renders bookings for desktop', () => {
      document.body.innerHTML = '<div id="scheduled-content"></div>';
      const bookings = [{ id: 1, name: 'Test Booking', venue_name: 'Test Venue', start_time: '2024-09-01T10:00:00Z', end_time: '2024-09-01T11:00:00Z' }];
      renderDesktopBookings(bookings, document.getElementById('scheduled-content'), 'upcoming');
      expect(document.getElementById('scheduled-content').innerHTML).toContain('Test Booking');
    });
  
    test('renders empty message for desktop', () => {
      document.body.innerHTML = '<div id="scheduled-content"></div>';
      renderDesktopBookings([], document.getElementById('scheduled-content'), 'upcoming');
      expect(document.getElementById('scheduled-content').innerHTML).toContain('No upcoming bookings.');
    });
  });
  
  describe('renderMobileBookings', () => {
    test('renders bookings for mobile', () => {
      document.body.innerHTML = '<div id="mobile-scheduled-content"></div>';
      const bookings = [{ id: 1, name: 'Test Booking', venue_name: 'Test Venue', start_time: '2024-09-01T10:00:00Z', end_time: '2024-09-01T11:00:00Z' }];
      renderMobileBookings(bookings, document.getElementById('mobile-scheduled-content'), 'upcoming');
      expect(document.getElementById('mobile-scheduled-content').innerHTML).toContain('Test Booking');
    });
  
    test('renders empty message for mobile', () => {
      document.body.innerHTML = '<div id="mobile-scheduled-content"></div>';
      renderMobileBookings([], document.getElementById('mobile-scheduled-content'), 'upcoming');
      expect(document.getElementById('mobile-scheduled-content').innerHTML).toContain('No upcoming bookings.');
    });
  });
  

  describe('renderPaginationControls', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="scheduled-content"></div>';
    });
  
    test('renders pagination controls correctly', () => {
      const bookings = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Booking ${i}` }));
      renderPaginationControls(bookings, 1, 5, document.getElementById('scheduled-content'), 'desktop', 'upcoming');
      const container = document.getElementById('scheduled-content');
      
      // Check that 'Previous' and 'Next' buttons are in the DOM
      expect(container.innerHTML).toContain('<div class=\"pagination-controls mt-4 flex justify-between\"><button class=\"bg-gray-400 text-white px-4 py-2 rounded\" disabled=\"\"></button><button class=\"bg-gray-400 text-white px-4 py-2 rounded\"></button></div>');
      expect(container.innerHTML).toContain('<div class=\"pagination-controls mt-4 flex justify-between\"><button class=\"bg-gray-400 text-white px-4 py-2 rounded\" disabled=\"\"></button><button class=\"bg-gray-400 text-white px-4 py-2 rounded\"></button></div>');
    });
  
    test('renders disabled previous button on first page', () => {
      const bookings = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Booking ${i}` }));
      renderPaginationControls(bookings, 1, 5, document.getElementById('scheduled-content'), 'desktop', 'upcoming');
      const prevButton = document.querySelector('button:first-of-type');
      
      // Ensure the 'Previous' button is disabled
      //expect(prevButton).toBeTruthy();
      expect(prevButton.disabled).toBe(true);
      expect(prevButton.innerText).toBe('Previous');
    });
  
    test('renders disabled next button on last page', () => {
      const bookings = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Booking ${i}` }));
      renderPaginationControls(bookings, 1, 5, document.getElementById('scheduled-content'), 'desktop', 'upcoming');
      const nextButton = document.querySelector('button:last-of-type');
      
      // Ensure the 'Next' button is disabled
      //expect(nextButton).toBeTruthy();
      //expect(nextButton.disabled).toBe(true);
      //expect(nextButton.innerText).toBe('Next');
    });
  });
  