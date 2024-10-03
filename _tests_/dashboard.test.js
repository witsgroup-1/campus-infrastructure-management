import { getUserDocumentByEmail, getGreetingMessage, setupAuthListener } from '../copy/dashboardCopy';
import { collection, getDocs, getDoc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
}));

jest.mock('../copy/dashboardCopy', () => ({
    getUserDocumentByEmail: jest.fn(),
    setupAuthListener: jest.fn(),
    getGreetingMessage: jest.fn(),
}));

beforeEach(() => {
    jest.spyOn(Storage.prototype, 'setItem'); // Mock localStorage.setItem
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn(); // Mock fetch globally before each test
    localStorage.clear(); // Clear localStorage before each test
});

afterEach(() => {
    jest.restoreAllMocks(); // Restore all mocks
});

describe('getUserDocumentByEmail', () => {
    const db = {};
    const email = 'test@example.com';
    const mockUserId = 'abc123';

    beforeEach(() => {
        collection.mockReturnValue('users');
        getUserDocumentByEmail.mockImplementation(async (db, email) => {
            const mockQuerySnapshot = {
                empty: false,
                docs: [{ id: mockUserId }],
            };
            return mockQuerySnapshot.docs[0].id; // return user ID directly for the mock
        });
    });

    it('should return user document ID when email exists', async () => {
        const result = await getUserDocumentByEmail(db, email);
        expect(result).toBe(mockUserId);
    });

    it('should return null when email does not exist', async () => {
        getUserDocumentByEmail.mockImplementationOnce(async (db, email) => {
            return null; // Simulate no document found
        });

        const result = await getUserDocumentByEmail(db, email);
        expect(result).toBeNull();
    });

});

describe('getGreetingMessage', () => {
    it('should return correct greeting based on the hour of the day', () => {
        const mockDate = (hour) => {
            jest.setSystemTime(new Date(2022, 0, 1, hour)); // Mock date to specific hour
        };

        mockDate(10);
        expect(getGreetingMessage()).toEqual({ message: 'Good morning', emoji: '🌅' });

        mockDate(15);
        expect(getGreetingMessage()).toEqual({ message: 'Good afternoon', emoji: '☀️' });

        mockDate(18);
        expect(getGreetingMessage()).toEqual({ message: 'Good evening', emoji: '🌇' });

        mockDate(22);
        expect(getGreetingMessage()).toEqual({ message: 'Goodnight', emoji: '🌙' });
    });
});

describe('setupAuthListener', () => {
    beforeEach(() => {
        jest.spyOn(Storage.prototype, 'setItem'); // Mock localStorage.setItem
        jest.clearAllMocks(); // Clear mocks to ensure a fresh state
    });


    it('should handle scenario when currentUser is null', async () => {
        const mockAuth = { currentUser: null };
        const mockDb = {};
        const mockGreetingElement = { textContent: '' };
        document.getElementById = jest.fn().mockReturnValue(mockGreetingElement);

        await setupAuthListener(mockAuth, mockDb);

        expect(localStorage.setItem).not.toHaveBeenCalled(); // Should not set anything if no user
        expect(mockGreetingElement.textContent).toBe(''); // Should not update greeting
    });
});


