// booking-details.test.js

const bookingModule = require('./copies/booking-detailsCopy');

const {
  isFormValid,
  toggleLoading,
  getVenueById,
  fetchBookingsForDate,
  convertToDate,
  hasTimeConflict,
  submitBooking,
  clearForm,
  isFutureDateTime,
  handleBooking 
} = bookingModule;

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
  Timestamp: {
    fromDate: jest.fn((date) => date),
    now: jest.fn(() => new Date()),
  },
}));

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: jest.fn(() => Promise.resolve([])),
    text: jest.fn(() => Promise.resolve('Error message')),
  })
);

// Mock window.alert
beforeAll(() => {
  global.alert = jest.fn(); // Mock the global alert function
});

beforeEach(() => {
  fetch.mockClear(); // Clear fetch mock calls before each test
  global.alert.mockClear(); // Clear alert mock calls before each test
});

// Mock DOM elements
beforeEach(() => {
  // Clear any previous DOM setup before each test
  document.body.innerHTML = `
    <div id="loadingIndicator" class="hidden"></div>
    <button id="bookNowBtn"></button>
    <select id="timeSlot"></select>
  `;
});

describe('toggleLoading function', () => {
  test('should show loading indicator and disable the button when passed true', () => {
    toggleLoading(true);

    const loadingIndicator = document.getElementById('loadingIndicator');
    const bookNowBtn = document.getElementById('bookNowBtn');

    // Assert that the loading indicator is visible (no hidden class)
    expect(loadingIndicator.classList.contains('hidden')).toBe(false);
    // Assert that the button is disabled
    expect(bookNowBtn.disabled).toBe(true);
  });

  test('should hide loading indicator and enable the button when passed false', () => {
    toggleLoading(false);

    const loadingIndicator = document.getElementById('loadingIndicator');
    const bookNowBtn = document.getElementById('bookNowBtn');

    // Assert that the loading indicator is hidden (contains hidden class)
    expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    // Assert that the button is enabled
    expect(bookNowBtn.disabled).toBe(false);
  });
});

describe('getVenueById function', () => {
  const venueId = '12345';
  const mockVenueData = { id: '12345', name: 'Lecture Hall', category: 'Lecture Hall' };

  // Test: Successful fetch
  test('should fetch venue data successfully', async () => {
    // Mock a successful fetch call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockVenueData),
    });

    const result = await getVenueById(venueId);

    // Assertions
    expect(result).toEqual(mockVenueData); // Ensure the returned data matches
    expect(fetch).toHaveBeenCalledWith(
      `https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': expect.any(String),
        },
      }
    );
  });

  // Test: Fetch fails
  test('should return null if the API call fails', async () => {
    // Mock a failed fetch call
    fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    const result = await getVenueById(venueId);

    // Assertions
    expect(result).toBeNull(); // Should return null on failure
    expect(fetch).toHaveBeenCalledWith(
      `https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': expect.any(String),
        },
      }
    );
  });

  // Test: Fetch throws an error
  test('should return null and log an error if fetch throws', async () => {
    console.error = jest.fn(); // Mock console.error to capture the error log

    // Simulate fetch throwing an error
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getVenueById(venueId);

    // Assertions
    expect(result).toBeNull(); // Should return null on error
    expect(console.error).toHaveBeenCalledWith('Error fetching venue from API:', expect.any(Error));
  });
});

describe('fetchBookingsForDate function', () => {
  const venueId = '12345';
  const bookingDate = '2024-10-03';
  const mockBookingData = [
    { startTime: { seconds: 17221600 }, endTime: { seconds: 17222000 } },
    { startTime: { seconds: 17223000 }, endTime: { seconds: 17224000 } },
  ];

  // Test: Successful fetch
  test('should fetch bookings data successfully', async () => {
    // Mock a successful fetch call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockBookingData),
    });

    const result = await fetchBookingsForDate(venueId, bookingDate);

    // Assertions
    expect(result).toEqual(mockBookingData); // Ensure the returned data matches
    expect(fetch).toHaveBeenCalledWith(
      `https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}/${bookingDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': expect.any(String),
        },
      }
    );
  });

  // Test: Fetch fails
  test('should return an empty array if the API call fails', async () => {
    // Mock a failed fetch call
    fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    const result = await fetchBookingsForDate(venueId, bookingDate);

    // Assertions
    expect(result).toEqual([]); // Should return an empty array on failure
    expect(fetch).toHaveBeenCalledWith(
      `https://campus-infrastructure-management.azurewebsites.net/api/venues/${venueId}/${bookingDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': expect.any(String),
        },
      }
    );
  });

  // Test: Fetch throws an error
  test('should return an empty array and log an error if fetch throws', async () => {
    console.error = jest.fn(); // Mock console.error to capture the error log

    // Simulate fetch throwing an error
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchBookingsForDate(venueId, bookingDate);

    // Assertions
    expect(result).toEqual([]); // Should return an empty array on error
    expect(console.error).toHaveBeenCalledWith('Error fetching bookings from API:', expect.any(Error));
  });
});

describe('convertToDate function', () => {
  // Test Case 1: Firestore Timestamp object
  test('should convert Firestore timestamp to JavaScript Date object', () => {
    const timestamp = { seconds: 1629475200 }; // Example timestamp (represents a date)
    const expectedDate = new Date(1629475200 * 1000); // Expected result in Date format

    const result = convertToDate(timestamp);

    // Assertions
    expect(result).toEqual(expectedDate);
    expect(result instanceof Date).toBe(true); // Ensure it's a Date object
  });

  // Test Case 2: Date object input
  test('should return the same Date object when input is already a Date', () => {
    const date = new Date(); // Current date

    const result = convertToDate(date);

    // Assertions
    expect(result).toStrictEqual(date); // Should return a Date object with the same value
    expect(result instanceof Date).toBe(true); // Ensure it's a Date object
  });

  // Test Case 3: ISO string input
  test('should convert ISO string to JavaScript Date object', () => {
    const isoString = '2024-10-03T10:15:30Z'; // Example ISO string
    const expectedDate = new Date(isoString); // Expected result

    const result = convertToDate(isoString);

    // Assertions
    expect(result).toEqual(expectedDate);
    expect(result instanceof Date).toBe(true); // Ensure it's a Date object
  });
});

describe('hasTimeConflict function', () => {
  const existingBookings = [
    {
      startTime: { seconds: 1629475200 }, // 2021-08-20 10:00:00
      endTime: { seconds: 1629478800 }, // 2021-08-20 11:00:00
    },
    {
      startTime: { seconds: 1629482400 }, // 2021-08-20 12:00:00
      endTime: { seconds: 1629486000 }, // 2021-08-20 13:00:00
    },
  ];

  // Test Case 1: Time conflict with existing booking
  test('should return true when there is a time conflict', () => {
    const newStartTime = new Date(1629476400 * 1000); // 2021-08-20 10:20:00
    const newEndTime = new Date(1629477600 * 1000); // 2021-08-20 10:40:00

    const result = hasTimeConflict(newStartTime, newEndTime, existingBookings);

    // Assertions
    expect(result).toBe(true); // Should return true due to time overlap
  });

  // Test Case 2: No time conflict with existing bookings
  test('should return false when there is no time conflict', () => {
    const newStartTime = new Date(1629471600 * 1000); // 2021-08-20 09:00:00
    const newEndTime = new Date(1629473400 * 1000); // 2021-08-20 09:30:00

    const result = hasTimeConflict(newStartTime, newEndTime, existingBookings);

    // Assertions
    expect(result).toBe(false); // Should return false due to no time overlap
  });

  // Test Case 3: New booking covers an entire existing booking
  test('should return true when the new booking covers an entire existing booking', () => {
    const newStartTime = new Date(1629475200 * 1000); // 2021-08-20 10:00:00
    const newEndTime = new Date(1629478800 * 1000); // 2021-08-20 11:00:00

    const result = hasTimeConflict(newStartTime, newEndTime, existingBookings);

    // Assertions
    expect(result).toBe(true); // Should return true because the new time fully covers an existing booking
  });

  // Test Case 4: New booking starts before and ends after an existing booking
  test('should return true when new booking starts before and ends after an existing booking', () => {
    const newStartTime = new Date(1629471600 * 1000); // 2021-08-20 09:00:00
    const newEndTime = new Date(1629486000 * 1000); // 2021-08-20 13:00:00

    const result = hasTimeConflict(newStartTime, newEndTime, existingBookings);

    // Assertions
    expect(result).toBe(true); // Should return true because the new booking fully overlaps with an existing booking
  });
});

describe('isFutureDateTime function', () => {
  beforeAll(() => {
    // Mock the current date to a fixed point in time
    const currentDate = new Date('2023-10-01T12:00:00'); // Adjust this date as needed
    jest.useFakeTimers();
    jest.setSystemTime(currentDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should return true for a future date and time', () => {
    const bookingDate = '2023-10-02'; // Future date
    const startTime = '13:00';
    expect(isFutureDateTime(bookingDate, startTime)).toBe(true);
  });

  test('should return false for a past date', () => {
    const bookingDate = '2023-09-30'; // Past date
    const startTime = '13:00';
    expect(isFutureDateTime(bookingDate, startTime)).toBe(false);
  });

  test('should return false for a past time on the same day', () => {
    const bookingDate = '2023-10-01'; // Same day as current date
    const startTime = '10:00'; // Past time
    expect(isFutureDateTime(bookingDate, startTime)).toBe(false);
  });

  test('should return true for a future time on the same day', () => {
    const bookingDate = '2023-10-01'; // Same day
    const startTime = '14:00'; // Future time
    expect(isFutureDateTime(bookingDate, startTime)).toBe(true);
  });

  test('should return false for the current time', () => {
    const bookingDate = '2023-10-01';
    const startTime = '12:00'; // Same as current time
    expect(isFutureDateTime(bookingDate, startTime)).toBe(false);
  });

  test('should handle invalid date formats gracefully', () => {
    const bookingDate = 'invalid-date';
    const startTime = '13:00';
    expect(isFutureDateTime(bookingDate, startTime)).toBe(false);
  });

  test('should handle invalid time formats gracefully', () => {
    const bookingDate = '2023-10-02';
    const startTime = 'invalid-time';
    expect(isFutureDateTime(bookingDate, startTime)).toBe(false);
  });

  test('should return false when both inputs are empty', () => {
    expect(isFutureDateTime('', '')).toBe(false);
  });
});

describe('clearForm function', () => {
  beforeEach(() => {
    // Set up the DOM elements required by clearForm
    document.body.innerHTML = `
      <input type="date" id="bookingDate" value="2024-10-05" />
      <select id="timeSlot">
        <option value="" disabled>Select Time Slot</option>
        <option value="08:00 - 08:45" selected>08:00 - 08:45</option>
        <option value="09:00 - 09:45">09:00 - 09:45</option>
      </select>
      <select id="bookingPurpose">
        <option value="" disabled>Select Purpose</option>
        <option value="Meeting" selected>Meeting</option>
        <option value="Lecture">Lecture</option>
      </select>
    `;
  });

  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = '';
  });

  test('should clear the bookingDate field', () => {
    // Act
    clearForm();

    // Assert
    const bookingDate = document.getElementById('bookingDate');
    expect(bookingDate.value).toBe('');
  });

  test('should clear the timeSlot field', () => {
    // Act
    clearForm();

    // Assert
    const timeSlot = document.getElementById('timeSlot');
    expect(timeSlot.value).toBe('');
  });

  test('should clear the bookingPurpose field', () => {
    // Act
    clearForm();

    // Assert
    const bookingPurpose = document.getElementById('bookingPurpose');
    expect(bookingPurpose.value).toBe('');
  });
});

// Add the tests for isFormValid function
describe('isFormValid function', () => {
  beforeEach(() => {
    // Set up the DOM elements required by isFormValid
    document.body.innerHTML = `
      <input type="date" id="bookingDate" />
      <select id="timeSlot"></select>
      <select id="bookingPurpose"></select>
    `;

    // Mock the global alert function
    global.alert = jest.fn();
  });

  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should return false and alert when bookingDate is empty', () => {
    // Arrange
    document.getElementById('bookingDate').value = '';
    document.getElementById('timeSlot').value = '09:00 - 10:00';
    document.getElementById('bookingPurpose').value = 'Meeting';

    // Act
    const result = isFormValid();

    // Assert
    expect(result).toBe(false);
    expect(global.alert).toHaveBeenCalledWith('Please fill in all fields.');
  });

  test('should return false and alert when timeSlot is empty', () => {
    // Arrange
    document.getElementById('bookingDate').value = '2024-10-05';
    document.getElementById('timeSlot').value = '';
    document.getElementById('bookingPurpose').value = 'Meeting';

    // Act
    const result = isFormValid();

    // Assert
    expect(result).toBe(false);
    expect(global.alert).toHaveBeenCalledWith('Please fill in all fields.');
  });

  test('should return false and alert when bookingPurpose is empty', () => {
    // Arrange
    document.getElementById('bookingDate').value = '2024-10-05';
    document.getElementById('timeSlot').value = '09:00 - 10:00';
    document.getElementById('bookingPurpose').value = '';

    // Act
    const result = isFormValid();

    // Assert
    expect(result).toBe(false);
    expect(global.alert).toHaveBeenCalledWith('Please fill in all fields.');
  });
});

// Add the tests for submitBooking function
describe('submitBooking function', () => {
  const userId = 'user123';
  const bookingData = {
      venue_id: 'venue456',
      start_time: new Date('2024-10-05T09:00:00'),
      end_time: new Date('2024-10-05T10:00:00'),
      purpose: 'Meeting',
  };
  const venueBookingData = {
      booker: userId,
      startTime: new Date('2024-10-05T09:00:00'),
      endTime: new Date('2024-10-05T10:00:00'),
      purpose: 'Meeting',
      createdAt: new Date(),
  };
  const venueId = 'venue456';
  const bookingDate = '2024-10-05';
  const venueName = 'Lecture Hall';
  const bookingDataCollection = {
      status: 'approved',
      date: bookingDate,
      start_time: '09:00',
      end_time: '10:00',
      purpose: 'Meeting',
      userId: userId,
      venueId: venueId,
  };

  let mockToggleLoading;
  let mockFetchBookingsForDate;
  let mockHasTimeConflict;
  let mockAlert;
  let mockClearForm;

  beforeEach(() => {
      mockToggleLoading = jest.fn();
      mockFetchBookingsForDate = jest.fn();
      mockHasTimeConflict = jest.fn();
      mockAlert = jest.fn();
      mockClearForm = jest.fn();

      jest.clearAllMocks();
  });

  test('should alert and stop booking when there is a time conflict', async () => {
      // Arrange
      mockHasTimeConflict.mockReturnValue(true);
      mockFetchBookingsForDate.mockResolvedValue([{ /* existing booking */ }]);

      const dependencies = {
          toggleLoadingFn: mockToggleLoading,
          fetchBookingsForDateFn: mockFetchBookingsForDate,
          hasTimeConflictFn: mockHasTimeConflict,
          alertFn: mockAlert,
          clearFormFn: mockClearForm,
      };

      // Act
      await submitBooking(
          userId,
          bookingData,
          venueBookingData,
          venueId,
          bookingDate,
          venueName,
          bookingDataCollection,
          dependencies
      );

      // Assert
      expect(mockToggleLoading).toHaveBeenCalledWith(true);
      expect(mockToggleLoading).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('The venue is already booked'));
      expect(mockClearForm).not.toHaveBeenCalled();
  });

  test('should proceed with booking when there is no time conflict', async () => {
      // Arrange
      mockHasTimeConflict.mockReturnValue(false);
      mockFetchBookingsForDate.mockResolvedValue([]);

      // Mock fetch responses for API calls
      fetch.mockImplementation((url, options) => {
          if (url.includes('/users/') && url.endsWith('/bookings')) {
              return Promise.resolve({ ok: true });
          } else if (url.includes('/venues/') && url.includes(bookingDate)) {
              return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
          } else if (url.endsWith('/Bookings')) {
              return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
          }
          return Promise.resolve({ ok: false });
      });

      const dependencies = {
          toggleLoadingFn: mockToggleLoading,
          fetchBookingsForDateFn: mockFetchBookingsForDate,
          hasTimeConflictFn: mockHasTimeConflict,
          alertFn: mockAlert,
          clearFormFn: mockClearForm,
      };

      // Act
      await submitBooking(
          userId,
          bookingData,
          venueBookingData,
          venueId,
          bookingDate,
          venueName,
          bookingDataCollection,
          dependencies
      );

      // Assert
      expect(mockToggleLoading).toHaveBeenCalledWith(true);
      expect(mockToggleLoading).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith(
          `Booking confirmed for ${venueName} at ${bookingData.start_time.toLocaleTimeString()}.`
      );
      expect(mockClearForm).toHaveBeenCalled();
  });

  test('should alert and stop when user booking API call fails', async () => {
      // Arrange
      mockHasTimeConflict.mockReturnValue(false);
      mockFetchBookingsForDate.mockResolvedValue([]);

      // Mock fetch responses
      fetch.mockImplementation((url, options) => {
          if (url.includes('/users/') && url.endsWith('/bookings')) {
              return Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('Server Error') });
          }
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const dependencies = {
          toggleLoadingFn: mockToggleLoading,
          fetchBookingsForDateFn: mockFetchBookingsForDate,
          hasTimeConflictFn: mockHasTimeConflict,
          alertFn: mockAlert,
          clearFormFn: mockClearForm,
      };

      // Act
      await submitBooking(
          userId,
          bookingData,
          venueBookingData,
          venueId,
          bookingDate,
          venueName,
          bookingDataCollection,
          dependencies
      );

      // Assert
      expect(mockToggleLoading).toHaveBeenCalledWith(true);
      expect(mockToggleLoading).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('Failed to post booking to the server API.');
  });

  test('should alert and stop when venue booking API call fails', async () => {
      // Arrange
      mockHasTimeConflict.mockReturnValue(false);
      mockFetchBookingsForDate.mockResolvedValue([]);

      // Mock fetch responses
      fetch.mockImplementation((url, options) => {
          if (url.includes('/users/') && url.endsWith('/bookings')) {
              return Promise.resolve({ ok: true });
          } else if (url.includes('/venues/') && url.includes(bookingDate)) {
              return Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('Server Error') });
          }
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const dependencies = {
          toggleLoadingFn: mockToggleLoading,
          fetchBookingsForDateFn: mockFetchBookingsForDate,
          hasTimeConflictFn: mockHasTimeConflict,
          alertFn: mockAlert,
          clearFormFn: mockClearForm,
      };

      // Act
      await submitBooking(
          userId,
          bookingData,
          venueBookingData,
          venueId,
          bookingDate,
          venueName,
          bookingDataCollection,
          dependencies
      );

      // Assert
      expect(mockToggleLoading).toHaveBeenCalledWith(true);
      expect(mockToggleLoading).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('Failed to add booking to venue.');
  });

  test('should alert but continue when data collection API call fails', async () => {
      // Arrange
      mockHasTimeConflict.mockReturnValue(false);
      mockFetchBookingsForDate.mockResolvedValue([]);

      // Mock fetch responses
      fetch.mockImplementation((url, options) => {
          if (url.includes('/users/') && url.endsWith('/bookings')) {
              return Promise.resolve({ ok: true });
          } else if (url.includes('/venues/') && url.includes(bookingDate)) {
              return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
          } else if (url.endsWith('/Bookings')) {
              return Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('Server Error') });
          }
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const dependencies = {
          toggleLoadingFn: mockToggleLoading,
          fetchBookingsForDateFn: mockFetchBookingsForDate,
          hasTimeConflictFn: mockHasTimeConflict,
          alertFn: mockAlert,
          clearFormFn: mockClearForm,
      };

      // Act
      await submitBooking(
          userId,
          bookingData,
          venueBookingData,
          venueId,
          bookingDate,
          venueName,
          bookingDataCollection,
          dependencies
      );

      // Assert
      expect(mockToggleLoading).toHaveBeenCalledWith(true);
      expect(mockToggleLoading).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('Failed to post venue booking to the server API.');
      expect(mockClearForm).not.toHaveBeenCalled(); // Form is only cleared on success
  });

  test('should handle exceptions and ensure loading is stopped', async () => {
      // Arrange
      mockHasTimeConflict.mockImplementation(() => {
          throw new Error('Test Error');
      });
      mockFetchBookingsForDate.mockResolvedValue([]);

      const dependencies = {
          toggleLoadingFn: mockToggleLoading,
          fetchBookingsForDateFn: mockFetchBookingsForDate,
          hasTimeConflictFn: mockHasTimeConflict,
          alertFn: mockAlert,
          clearFormFn: mockClearForm,
      };

      // Act
      await submitBooking(
          userId,
          bookingData,
          venueBookingData,
          venueId,
          bookingDate,
          venueName,
          bookingDataCollection,
          dependencies
      );

      // Assert
      expect(mockToggleLoading).toHaveBeenCalledWith(true);
      expect(mockToggleLoading).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('An unexpected error occurred while booking.');
  });
});

describe('handleBooking function', () => {
  let mockGetElementById;
  let mockSubmitBooking;
  let mockGetTimestamp;

  beforeEach(() => {
      mockGetElementById = jest.fn();
      mockSubmitBooking = jest.fn();
      mockGetTimestamp = jest.fn((date) => date);
  });

  test('should call submitBooking with correct parameters', async () => {
      // Arrange
      mockGetElementById.mockImplementation((id) => {
          switch (id) {
              case 'bookingDate':
                  return { value: '2024-10-05' };
              case 'timeSlot':
                  return { value: '09:00 - 10:00' };
              case 'bookingPurpose':
                  return { value: 'Meeting' };
              default:
                  return {};
          }
      });

      const userId = 'user123';
      const bookingId = 'venue456';
      const venueData = { Name: 'Lecture Hall' };

      const dependencies = {
          getTimestampFn: mockGetTimestamp,
          getElementByIdFn: mockGetElementById,
          submitBookingFn: mockSubmitBooking,
      };

      // Act
      await handleBooking(userId, bookingId, venueData, dependencies);

      // Assert
      expect(mockSubmitBooking).toHaveBeenCalledWith(
          userId,
          expect.any(Object),
          expect.any(Object),
          bookingId,
          '2024-10-05',
          'Lecture Hall',
          expect.any(Object)
      );
  });
});
