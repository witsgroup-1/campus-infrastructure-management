import { populateVenues,fetchVenues,createVenueElement } from '../src/user-dashboard/availVenues'; // Adjust the import path
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

describe('Venue Functions', () => {
    let originalConsoleError;

    beforeAll(() => {
        // Save the original console.error and mock it
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterAll(() => {
        // Restore the original console.error after tests
        console.error = originalConsoleError;
    });

    beforeEach(() => {
        // Clean up the DOM before each test
        document.body.innerHTML = '';
    });

    describe('fetchVenues', () => {
        it('should fetch and return venue data', async () => {
            const mockResponse = [
                { Name: 'Venue 1', Capacity: 100, Category: 'conference' },
                { Name: 'Venue 2', Capacity: 200, Category: 'meeting' }
            ];

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                })
            );

            const venues = await fetchVenues();
            expect(venues).toHaveLength(2);
            expect(venues[0]).toHaveProperty('imgSrc');
        });

        it('should handle errors gracefully', async () => {
            global.fetch = jest.fn(() => Promise.reject('API is down'));

            const venues = await fetchVenues();
            expect(venues).toEqual([]);
        });
    });

    describe('createVenueElement', () => {
        it('should create and return a DOM element for a venue', () => {
            const venue = {
                Name: 'Venue 1',
                Capacity: 100,
                imgSrc: 'img/default.jpg'
            };

            const element = createVenueElement(venue);
            expect(element).toBeInstanceOf(HTMLElement);
            expect(element.querySelector('img').src).toContain('img/default.jpg');
        });
    });

    describe('populateVenues', () => {
        it('should populate the venue grid with venue elements', async () => {
            const mockVenues = [
                { Name: 'Venue 1', Capacity: 100, imgSrc: 'img/default.jpg' },
                { Name: 'Venue 2', Capacity: 200, imgSrc: 'img/default.jpg' },
                { Name: 'Venue 3', Capacity: 300, imgSrc: 'img/default.jpg' },
                { Name: 'Venue 4', Capacity: 400, imgSrc: 'img/default.jpg' }
            ];

            // Mock fetchVenues to return the mockVenues
            jest.spyOn(global, 'fetch').mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockVenues)
                })
            );

            // Add a container for the grid
            document.body.innerHTML = '<div id="venue-grid"></div>';

            await populateVenues();
            
            const gridContainer = document.querySelector('#venue-grid');
            expect(gridContainer.children.length).toBe(4); // 3 venues + 1 last venue element

            // Test the last venue element with link and arrow SVG
            const lastVenueElement = gridContainer.lastElementChild;
            const linkElement = lastVenueElement.querySelector('a');
            expect(linkElement).not.toBeNull();
            expect(linkElement.getAttribute('href')).toBe('viewAllVenues.html');
        });
    });
});