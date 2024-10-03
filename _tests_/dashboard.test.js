import { getUserDocumentByEmail,setupAuthListener } from '../copy/dashboardCopy';
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
    jest.spyOn(Storage.prototype, 'setItem'); 
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn(); 
    localStorage.clear(); 
});

afterEach(() => {
    jest.restoreAllMocks(); 
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
            return mockQuerySnapshot.docs[0].id; 
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


describe('setupAuthListener', () => {
    beforeEach(() => {
        jest.spyOn(Storage.prototype, 'setItem'); 
        jest.clearAllMocks(); 
    });


    it('should handle scenario when currentUser is null', async () => {
        const mockAuth = { currentUser: null };
        const mockDb = {};
        const mockGreetingElement = { textContent: '' };
        document.getElementById = jest.fn().mockReturnValue(mockGreetingElement);

        await setupAuthListener(mockAuth, mockDb);

        expect(localStorage.setItem).not.toHaveBeenCalled(); 
        expect(mockGreetingElement.textContent).toBe(''); 
    });
});


