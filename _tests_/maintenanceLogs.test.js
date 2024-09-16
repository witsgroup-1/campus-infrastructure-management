
/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node'
import { rest } from 'msw';
import { getByText, getByRole } from '@testing-library/dom';



// Mock server to handle API requests
const server = setupServer(
  rest.get('http://localhost:3000/api/maintenanceRequests', (req, res, ctx) => {
    return res(ctx.json([
      { 
        assignedTo: 'Test User',
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
        description: 'Test Description',
        issueType: 'Test Issue',
        roomId: 'A101',
        status: 'Scheduled',
        timestamp: { seconds: Math.floor(Date.now() / 1000) },
        userID: 'userTest'
      },
      { 
        assignedTo: 'Test User',
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
        description: 'Test Description',
        issueType: 'Test Issue',
        roomId: 'B101',
        status: 'In Progress',
        timestamp: { seconds: Math.floor(Date.now() / 1000) },
        userID: 'userTest'
      },
      { 
        assignedTo: 'Test User',
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
        description: 'Test Description',
        issueType: 'Test Issue',
        roomId: 'C101',
        status: 'Completed',
        timestamp: { seconds: Math.floor(Date.now() / 1000) },
        userID: 'userTest'
      }
    ]));
  }),
  rest.put('http://localhost:3000/api/maintenanceRequests/:id', (req, res, ctx) => {
    return res(ctx.status(200));
  })
);


// Setup and teardown for tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper function to wait for and assert content in DOM
async function assertContentInDOM() {

  screen.debug();
  await waitFor(() => expect(screen.getByText('Scheduled')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText((text) => text.includes('Scheduled'))).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('In Progress')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('Completed')).toBeInTheDocument());

  expect(screen.getByText('Test Description')).toBeInTheDocument();
  expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  expect(screen.getByText('Test Description 3')).toBeInTheDocument();
}

test('fetches and displays maintenance requests', async () => {
  document.body.innerHTML = `
    <div id="scheduled-content"></div>
    <div id="in-progress-content"></div>
    <div id="completed-content"></div>
    <div id="mobile-scheduled-content"></div>
    <div id="mobile-in-progress-content"></div>
    <div id="mobile-completed-content"></div>
    <button id="show-more-scheduled">Show More</button>
    <button id="show-more-in-progress">Show More</button>
    <button id="show-more-completed">Show More</button>
    <div id="detailsModal" class="hidden">
      <div id="modal-content"></div>
    </div>
  `;

  require('../src/maintenance/maintenanceLogs.js');

  await assertContentInDOM();

  // Simulate click on 'Show More' button
  fireEvent.click(screen.getByText('Show More'));

  // Check if additional content is loaded
  await assertContentInDOM();

  // Check if modal is displayed correctly on request click
  fireEvent.click(screen.getByText('Test Description'));
  expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
});
