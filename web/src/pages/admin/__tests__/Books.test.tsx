import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../../setupTests';
import Books from '../Books';
import { rest } from 'msw';
import { server } from '../../../setupTests';

describe('Books Component', () => {
  it('renders the books page with initial data', async () => {
    renderWithProviders(<Books />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Books Management')).toBeInTheDocument();
    
    // Check if the add book button is present
    expect(screen.getByText('Add Book')).toBeInTheDocument();
    
    // Wait for the books to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
  });

  it('handles book search', async () => {
    renderWithProviders(<Books />);
    
    // Wait for the books to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search books...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Check if the book is still visible
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });

  it('handles book filtering', async () => {
    renderWithProviders(<Books />);
    
    // Wait for the books to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
    
    // Select category filter
    const categoryFilter = screen.getByLabelText('Category');
    fireEvent.change(categoryFilter, { target: { value: 'Fiction' } });
    
    // Check if the book is still visible
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });

  it('handles book deletion with confirmation', async () => {
    // Mock the delete API
    server.use(
      rest.delete('/api/books/1', (req, res, ctx) => {
        return res(ctx.status(200));
      })
    );

    renderWithProviders(<Books />);
    
    // Wait for the book to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
    
    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-book-1'));
    
    // Check if the confirmation dialog appears
    expect(screen.getByText('Are you sure you want to delete this book?')).toBeInTheDocument();
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'));
    
    // Check if the book is removed
    await waitFor(() => {
      expect(screen.queryByText('Test Book')).not.toBeInTheDocument();
    });
  });

  it('handles book editing', async () => {
    renderWithProviders(<Books />);
    
    // Wait for the book to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
    
    // Click the edit button
    fireEvent.click(screen.getByTestId('edit-book-1'));
    
    // Check if the edit modal is opened
    expect(screen.getByText('Edit Book')).toBeInTheDocument();
    
    // Update book details
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Book Title' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if the book is updated
    await waitFor(() => {
      expect(screen.getByText('Updated Book Title')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    // Mock API to return multiple books
    server.use(
      rest.get('/api/books', (req, res, ctx) => {
        return res(
          ctx.json([
            { id: 1, title: 'Book 1', author: 'Author 1' },
            { id: 2, title: 'Book 2', author: 'Author 2' },
            { id: 3, title: 'Book 3', author: 'Author 3' },
          ])
        );
      })
    );

    renderWithProviders(<Books />);
    
    // Check if pagination controls are present
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Click next page
    fireEvent.click(screen.getByText('Next'));
    
    // Check if page number updates
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles sorting', async () => {
    renderWithProviders(<Books />);
    
    // Wait for the books to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
    
    // Click title header to sort
    fireEvent.click(screen.getByText('Title'));
    
    // Check if sort direction changes
    expect(screen.getByTestId('sort-direction')).toHaveTextContent('asc');
  });

  it('handles export functionality', async () => {
    renderWithProviders(<Books />);
    
    // Wait for the books to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
    
    // Click export button
    fireEvent.click(screen.getByTestId('export-books'));
    
    // Check if export options are shown
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
  });
}); 