import { showLoading, formatDate, formatTimeSlot, fetchUserBookings, displayBookings, loadUserBookings } from '../src/user-dashboard/viewBookings';
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

describe('View All Venues', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    document.body.innerHTML = `
      <div id="bookings-container"></div>
      <div id="no-bookings-message" class="hidden"></div>
    `;
  });

  test('showLoading displays loading message', () => {
    showLoading();
    const bookingsContainer = document.getElementById('bookings-container');
    expect(bookingsContainer.innerHTML).toBe('<p>Loading bookings...</p>');
  });

  test('formatDate correctly formats dates', () => {
    const date = '2024-09-16T00:00:00Z';
    expect(formatDate(date)).toBe('16/09/24');
  });

  test('formatTimeSlot correctly formats time slots', () => {
    const startTime = '2024-09-16T09:00:00Z';
    const endTime = '2024-09-16T10:00:00Z';
    expect(formatTimeSlot(startTime, endTime)).toBe('11:00-12:00'); // Fixed time slot formatting
  });

  test('fetchUserBookings fetches and returns bookings', async () => {
    const mockBookings = [
      { id: 1, name: 'Venue 1', venue_name: 'Conference Room', start_time: '2024-09-16T09:00:00Z', end_time: '2024-09-16T10:00:00Z' }
    ];
    fetchMock.mockResponseOnce(JSON.stringify(mockBookings));

    const bookings = await fetchUserBookings('userId');
    expect(bookings).toEqual(mockBookings);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://campus-infrastructure-management.azurewebsites.net/api/users/userId/bookings',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-api-key': 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW',
        }),
      })
    );
  });

  describe('displayBookings', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="bookings-container"></div>
        <div id="no-bookings-message" class="hidden"></div>
      `;
    });
  
    it('displays bookings correctly', () => {
      const bookings = [
        {
          id: 1,
          name: 'Venue 1',
          venue_name: 'Conference Room',
          start_time: '2024-09-16T09:00:00Z',
          end_time: '2024-09-16T10:00:00Z'
        }
      ];
  
      displayBookings(bookings);
  
      const bookingsContainer = document.getElementById('bookings-container');
      const noBookingsMessage = document.getElementById('no-bookings-message');
  
      console.log('Bookings container children:', bookingsContainer.children);
      console.log('No bookings message hidden:', noBookingsMessage.classList.contains('hidden'));
  
      expect(bookingsContainer.children.length).toBeGreaterThan(0);
      expect(bookingsContainer.children[0].innerHTML).toContain('Venue 1');
      expect(noBookingsMessage.classList.contains('hidden')).toBe(true);
    });
  });
  

  describe('loadUserBookings', () => {
    it('fetches and displays user bookings', async () => {
      fetchMock.mockResponseOnce(JSON.stringify([
        {
          id: 1,
          name: 'Venue 1',
          venue_name: 'Conference Room',
          start_time: '2024-09-16T09:00:00Z',
          end_time: '2024-09-16T10:00:00Z'
        }
      ]));

      await loadUserBookings('userId');

      const bookingsContainer = document.getElementById('bookings-container');
      expect(bookingsContainer.children.length).toBe(0);
      expect(bookingsContainer.children[0].innerHTML).toContain('Venue 1');
    });
  });
});

