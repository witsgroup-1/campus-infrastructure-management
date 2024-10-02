import { getCurrentDate, getNextSlot } from '../copy/newVenuesCopy';

describe('Utility functions', () => {
  test('getCurrentDate returns correct date in YYYY-MM-DD format', () => {
    const mockDate = new Date('2024-01-15T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    expect(getCurrentDate()).toBe('2024-01-15');
    
    global.Date.mockRestore();
  });

  test('getNextSlot returns the correct upcoming slot', () => {
    const intervals = [
      { start: '08:00', end: '08:45' },
      { start: '09:00', end: '09:45' }
    ];

    const mockDate = new Date('2024-01-15T08:30:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const nextSlot = getNextSlot(intervals);
    expect(nextSlot).toEqual({ start: '09:00', end: '09:45' });

    global.Date.mockRestore();
  });

  test('getNextSlot returns null when no slots are left', () => {
    const intervals = [
      { start: '08:00', end: '08:45' },
      { start: '09:00', end: '09:45' }
    ];

    const mockDate = new Date('2024-01-15T10:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const nextSlot = getNextSlot(intervals);
    expect(nextSlot).toBeNull();

    global.Date.mockRestore();
  });
});
