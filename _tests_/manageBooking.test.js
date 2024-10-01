const {
fetchVenues,
  } = require('./copies/manageBookingsCopy'); 
  
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
  
  // Mock fetch API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([])
    })
  );
  
  // Mock window.alert
  beforeAll(() => {
    global.alert = jest.fn();
  });
  
  describe('manageBookingCopy', () => {
    beforeEach(() => {
      fetch.mockClear();
      global.alert.mockClear();
    });

    test('fetchVenues should return all venues stored in DB', async () => {
        const mockVenues = [
          {
            building: "Great Hall",
            Capacity: "300",
            Category: "Hall",
            Features: [],
            Name: "Great Hall",
            venueId: "1234"
          },
          {
            building: "Hall 29",
            Capacity: "300",
            Category: "Exam Hall",
            Features: [],
            Name: "Hall 29",
            venueId: "1534"
          }
        ];
      
        // Mock the global fetch to return the mockVenues
        fetch.mockResolvedValue({
          json: jest.fn().mockResolvedValue(mockVenues)
        });
      
        const fetchedVenues = await fetchVenues();
        
        // Expect fetch to have been called once
        expect(fetch).toHaveBeenCalledTimes(1);
        
        // Assertion to compare expected and actual data
        expect(fetchedVenues).toEqual(mockVenues);
      });
    });  