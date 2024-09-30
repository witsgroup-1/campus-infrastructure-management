const {
    fetchUserData,
    fetchAndRenderBookings,
    getAllowedCategories,
    renderVenues
  } = require('./copies/bookVenueCopy');
  
  // Mock Firebase
  jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
  }));
  
  jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn(),
  }));
  
  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
  }));
  
  // Mock global fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true, // Simulate success or failure
      json: jest.fn(() => Promise.resolve([])), // Simulate successful JSON response
      text: jest.fn(() => Promise.resolve('Error message')), // Simulate error text for failed response
    })
  );
  
  // Mock window.alert
  beforeAll(() => {
    global.alert = jest.fn();  // Mock the global alert function
  });
  
  beforeEach(() => {
    fetch.mockClear();  // Clear fetch mock calls before each test
    global.alert.mockClear();  // Clear alert mock calls before each test
  });
  
  
    // Test fetchUserData
    test('fetchUserData should return user data from the API', async () => {
      const mockUserData = { uid: '12345', name: 'John Doe' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData),
      });
  
      const result = await fetchUserData('12345');
      expect(result).toEqual(mockUserData);
      expect(fetch).toHaveBeenCalledWith(
        'https://campus-infrastructure-management.azurewebsites.net/api/users/12345',
        expect.any(Object)
      );
    });
  
    test('fetchUserData should return null on 404', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
  
      const result = await fetchUserData('12345');
      expect(result).toBeNull();
    });
  
    // Test fetchAndRenderBookings
    test('fetchAndRenderBookings should fetch and render venues', async () => {
        // Mocking the DOM elements required by the function
        document.body.innerHTML = `
            <select id="roomFilter">
                <option value="Lecture Hall">Lecture Hall</option>
            </select>
            <div id="bookingsContainer"></div>
        `;
    
        const mockUserData = { role: 'Student' };
    
        await fetchAndRenderBookings(mockUserData);
    
        // Ensure the fetch API was called with the correct URL
        expect(fetch).toHaveBeenCalledWith(
            'https://campus-infrastructure-management.azurewebsites.net/api/venues?category=Lecture%20Hall',
            expect.any(Object)
        );
    });
    
    // Test getAllowedCategories
    test('getAllowedCategories should return correct categories for students', () => {
      const userData = { role: 'Student', isTutor: false, isLecturer: false };
      const allowedCategories = getAllowedCategories(userData);
      expect(allowedCategories).toEqual(['Study Room']);
    });
  
    test('getAllowedCategories should return multiple categories for lecturers', () => {
      const userData = { role: 'Staff', isLecturer: true };
      const allowedCategories = getAllowedCategories(userData);
      expect(allowedCategories).toEqual(['Tutorial Room', 'Exam Venue', 'Boardroom', 'Lecture Hall']);
    });
  
    // Test renderVenues
    test('renderVenues should render the correct HTML for venues', () => {
        // Mocking the DOM elements
        document.body.innerHTML = `
            <div id="bookingsContainer"></div>
            <input id="searchInput" value=""/>
            <select id="roomFilter">
                <option value="">Room type</option>  <!-- No filter, shows all -->
            </select>
        `;
    
        const mockVenues = [
            { Name: 'Lecture Hall 1', Category: 'Lecture Hall', Capacity: 100 },
            { Name: 'Tutorial Room 2', Category: 'Tutorial Room', Capacity: 30 }
        ];
    
        // Mock userData with the correct privileges to book both Lecture Halls and Tutorial Rooms
        const mockUserData = { role: 'Staff', isLecturer: true };
    
        renderVenues(mockVenues, mockUserData);
    
        const container = document.getElementById('bookingsContainer');
        
        // Check that both venues are rendered correctly
        expect(container.innerHTML).toContain('Lecture Hall 1');
        expect(container.innerHTML).toContain('Tutorial Room 2');
    });
    