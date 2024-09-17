// Mock Firebase Modules
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

// Now import your module
import { createVenueElement } from '../src/user-dashboard/availVenues'; // Adjust the import path

describe('createVenueElement', () => {
    it('creates a venue element with correct attributes and classes', () => {
        const venue = { Name: 'Venue 1', imgSrc: 'img/venue.jpg', Capacity: 100 };
        const element = createVenueElement(venue);
        
        expect(element.tagName).toBe('DIV');
        expect(element.classList.contains('relative')).toBe(true);
        expect(element.querySelector('img').src).toContain('img/venue.jpg');
        expect(element.querySelector('div').innerHTML).toContain('Venue 1');
    });
});

