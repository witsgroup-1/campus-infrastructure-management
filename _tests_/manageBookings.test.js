// _tests_/fetchVenues.test.js
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

import { fetchVenues } from './copy/manageBookingsCopy'; // Adjust the import path

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { Name: 'Venue 1', Capacity: 100, Category: 'Lecture Room' },
      { Name: 'Venue 2', Capacity: 50, Category: 'Lab Room' }
    ])
  })
);

describe('fetchVenues', () => {
  it('fetches venues successfully', async () => {
    const venues = await fetchVenues();
    expect(venues).toHaveLength(2);
    expect(venues[0].Name).toBe('Venue 1');

  });

  it('handles fetch failure', async () => {
    // Mock fetch to return an error
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));

    const venues = await fetchVenues();
    expect(venues).toEqual([]); // Adjust based on your error handling logic
  });
});

