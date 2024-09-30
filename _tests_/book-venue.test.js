import { fetchUserData, fetchAndRenderBookings } from '../src/make-booking/book-venue.js'; // Adjust path as necessary
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.resetMocks();

    // Mock DOM elements including #roomFilter, #searchInput, and #bookingsContainer
    document.body.innerHTML = `
        <select id="roomFilter">
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Tutorial Room">Tutorial Room</option>
        </select>
        <input id="searchInput" value="lecture" /> <!-- Mock search query -->
        <div id="bookingsContainer"></div> <!-- Mock container for venue rendering -->
    `;

    // Mock Firebase Auth
    jest.mock('firebase/auth', () => ({
        getAuth: jest.fn(),
        onAuthStateChanged: jest.fn((auth, callback) => callback({ uid: 'test-user' })),
    }));

    // Mock Firestore
    jest.mock('firebase/firestore', () => ({
        getFirestore: jest.fn(),
        collection: jest.fn(),
        getDocs: jest.fn(() => Promise.resolve({
            forEach: (callback) => {
                const venues = [
                    { id: 'venue1', data: () => ({ Name: 'Lecture Hall 1', Category: 'Lecture Hall', Capacity: 100 }) },
                    { id: 'venue2', data: () => ({ Name: 'Tutorial Room 1', Category: 'Tutorial Room', Capacity: 30 }) }
                ];
                venues.forEach((venue) => callback(venue));
            }
        })),
    }));
});

test('fetches and renders bookings for a user', async () => {
    // Mock API response for user data
    fetchMock.mockResponseOnce(JSON.stringify({ uid: 'test-user', role: 'Student' }));

    // Call the function to fetch user data
    const userData = await fetchUserData('test-user');
    expect(userData).toEqual({ uid: 'test-user', role: 'Student' });

    // Mock the response for venues
    fetchMock.mockResponseOnce(JSON.stringify([
        { id: 'venue1', Name: 'Lecture Hall 1', Category: 'Lecture Hall', Capacity: 100 },
        { id: 'venue2', Name: 'Tutorial Room 1', Category: 'Tutorial Room', Capacity: 30 }
    ]));

    // Call the function to render bookings
    await fetchAndRenderBookings(userData);

    // Check if the bookings container is populated with venue data
    const bookingsContainer = document.getElementById('bookingsContainer');
    expect(bookingsContainer.innerHTML).toContain('Lecture Hall 1');
    expect(bookingsContainer.innerHTML).toContain('Tutorial Room 1');
});
