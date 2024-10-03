import { fetchData,displayBookings, checkAuthState, toggleSidebar} from '../copy/adminDashboardCopy'
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

describe('fetchData', () => {
    beforeEach(() => {
      
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    afterEach(() => {
      console.error.mockRestore();
    });
  
    it('should handle errors when the fetch fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );
  
      const data = await fetchData('/Bookings');
      expect(data).toBeNull();
      expect(console.error).toHaveBeenCalled(); 
    });
  });
  

describe('displayBookings', () => {
    let container;
    let noBookingsMessage;
    let seeMoreButton;
  
    beforeEach(() => {
      // Create mock DOM elements
      container = document.createElement('div');
      noBookingsMessage = document.createElement('div');
      noBookingsMessage.classList.add('hidden');
      seeMoreButton = document.createElement('button');
      seeMoreButton.classList.add('hidden');
    });
  
    it('should show "no bookings" message when there are no bookings', () => {
      displayBookings(container, [], noBookingsMessage, seeMoreButton);
  
      expect(noBookingsMessage.classList.contains('hidden')).toBe(false);
      expect(seeMoreButton.classList.contains('hidden')).toBe(true);
      expect(container.innerHTML).toBe('');
    });
  
    it('should display bookings and remove "no bookings" message', () => {
      const bookings = [
        { id: '1', purpose: 'Test Booking 1', start_time: { seconds: 1633039200 } },
        { id: '2', purpose: 'Test Booking 2', start_time: { seconds: 1633042800 } },
      ];
  
      displayBookings(container, bookings, noBookingsMessage, seeMoreButton);
  
      expect(noBookingsMessage.classList.contains('hidden')).toBe(true);
      expect(seeMoreButton.classList.contains('hidden')).toBe(false);
      expect(container.childElementCount).toBe(2);
      expect(container.innerHTML).toContain('Test Booking 1');
      expect(container.innerHTML).toContain('Test Booking 2');
    });
  });

  jest.mock('https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js');

  describe('checkAuthState', () => {
    it('should call onUserLoggedIn when user is authenticated', () => {
      const user = { email: 'test@example.com', uid: 'test-uid' };  
      const onUserLoggedIn = jest.fn();
      const onUserLoggedOut = jest.fn();
  
      // Mock Firebase's getAuth and onAuthStateChanged
      const mockAuth = {
        onAuthStateChanged: jest.fn((callback) => callback(user)),
      };
      jest.spyOn(require('firebase/auth'), 'getAuth').mockReturnValue(mockAuth);  // Mock getAuth()
  
      checkAuthState(mockAuth, onUserLoggedIn, onUserLoggedOut);
  
      expect(onUserLoggedIn).toHaveBeenCalledWith(user);
      expect(onUserLoggedOut).not.toHaveBeenCalled();
    });
  
  });
  
  

  describe('toggleSidebar', () => {
    let sidebar, menuIcon, closeBtn;
  
    beforeEach(() => {
      sidebar = { style: { width: '0' } };
      menuIcon = document.createElement('button');
      closeBtn = document.createElement('button');
    });
  
    const mockGetSidebarWidth = jest.fn(() => '50%');
  
    it('should open the sidebar when menuIcon is clicked', () => {
      toggleSidebar(sidebar, menuIcon, closeBtn, mockGetSidebarWidth);
  
      menuIcon.click();
      expect(sidebar.style.width).toBe('50%');
    });
  
    it('should close the sidebar when closeBtn is clicked', () => {
      sidebar.style.width = '50%'; // Sidebar is open
  
      toggleSidebar(sidebar, menuIcon, closeBtn, mockGetSidebarWidth);
  
      closeBtn.click();
      expect(sidebar.style.width).toBe('0');
    });
  
    it('should adjust the sidebar width on window resize', () => {
      toggleSidebar(sidebar, menuIcon, closeBtn, mockGetSidebarWidth);
  
      sidebar.style.width = '50%'; // Sidebar is open
      window.dispatchEvent(new Event('resize'));
  
      expect(mockGetSidebarWidth).toHaveBeenCalled();
      expect(sidebar.style.width).toBe('50%'); // Should remain open and adjust size
    });
  });
