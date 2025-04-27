import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../../setupTests';
import Reports from '../Reports';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock the API responses
const server = setupServer(
  rest.get('/api/reports', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          name: 'Test Report',
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [{ data: [10, 20, 30] }]
          },
          filters: [],
          schedule: null
        }
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Reports Component', () => {
  it('renders the reports page', async () => {
    renderWithProviders(<Reports />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
    
    // Check if the create report button is present
    expect(screen.getByText('Create Report')).toBeInTheDocument();
    
    // Wait for the reports to load
    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });
  });

  it('opens the report builder modal when create button is clicked', async () => {
    renderWithProviders(<Reports />);
    
    // Click the create report button
    fireEvent.click(screen.getByText('Create Report'));
    
    // Check if the modal is opened
    expect(screen.getByText('Create New Report')).toBeInTheDocument();
  });

  it('handles report deletion', async () => {
    // Mock the delete API
    server.use(
      rest.delete('/api/reports/1', (req, res, ctx) => {
        return res(ctx.status(200));
      })
    );

    renderWithProviders(<Reports />);
    
    // Wait for the report to load
    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });
    
    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-report-1'));
    
    // Check if the confirmation dialog appears
    expect(screen.getByText('Are you sure you want to delete this report?')).toBeInTheDocument();
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'));
    
    // Check if the report is removed
    await waitFor(() => {
      expect(screen.queryByText('Test Report')).not.toBeInTheDocument();
    });
  });

  it('handles report export', async () => {
    renderWithProviders(<Reports />);
    
    // Wait for the report to load
    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });
    
    // Click the export button
    fireEvent.click(screen.getByTestId('export-report-1'));
    
    // Check if the export options are shown
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
  });
}); 