import { 
    submitWhitelistRequest, 
    showLoadingSpinner, 
    hideLoadingSpinner, 
    ensureAuthenticatedUser 
} from '../copy/requestWhitelistCopy';
import { getDocs, addDoc, query, collection, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


jest.mock('firebase/firestore', () => ({
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    query: jest.fn(),
    collection: jest.fn(),
    where: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
});

describe('Whitelist Requests', () => {
    const mockDb = {}; // Mock db object

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('submitWhitelistRequest', () => {
        it('throws an error if any field is missing', async () => {
            await expect(submitWhitelistRequest(mockDb, '', 'Doe', 'john@example.com'))
                .rejects
                .toThrow('Please fill in all required fields.');
        });

        it('throws an error if the email has already been requested', async () => {
            getDocs.mockResolvedValueOnce({ empty: false });

            await expect(submitWhitelistRequest(mockDb, 'John', 'Doe', 'john@example.com'))
                .rejects
                .toThrow('This email has already been requested for approval.');
        });

        it('submits the request if all fields are valid and email is unique', async () => {
            getDocs.mockResolvedValueOnce({ empty: true });
            addDoc.mockResolvedValueOnce({});

            await expect(submitWhitelistRequest(mockDb, 'John', 'Doe', 'john@example.com'))
                .resolves
                .toBe('Your request has been submitted for approval!');
                
            expect(addDoc).toHaveBeenCalledTimes(1);
        });

        it('handles addDoc failure gracefully', async () => {
            getDocs.mockResolvedValueOnce({ empty: true });
            addDoc.mockRejectedValueOnce(new Error('Firestore error'));

            await expect(submitWhitelistRequest(mockDb, 'John', 'Doe', 'john@example.com'))
                .rejects
                .toThrow('Firestore error');
        });
    });

    describe('ensureAuthenticatedUser', () => {
        it('resolves when the user is authenticated', async () => {
            const mockUser = { uid: '123', email: 'test@example.com' };
            onAuthStateChanged.mockImplementationOnce((auth, callback) => callback(mockUser));

            await expect(ensureAuthenticatedUser({})).resolves.toBe(mockUser);
        });

        it('rejects when the user is not authenticated', async () => {
            onAuthStateChanged.mockImplementationOnce((auth, callback) => callback(null));

            await expect(ensureAuthenticatedUser({})).rejects.toThrow('User not authenticated');
        });
    });
});

describe('Loading Spinner', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="loadingSpinner" class="hidden"></div>';
    });

    it('shows the loading spinner', () => {
        showLoadingSpinner();
        expect(document.getElementById('loadingSpinner').classList.contains('hidden')).toBe(false);
    });

    it('hides the loading spinner', () => {
        hideLoadingSpinner();
        expect(document.getElementById('loadingSpinner').classList.contains('hidden')).toBe(true);
    });
});
