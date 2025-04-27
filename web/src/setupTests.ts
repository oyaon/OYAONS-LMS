import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

// Custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    initialState = {},
    ...renderOptions
  }: {
    route?: string;
    initialState?: Record<string, any>;
    [key: string]: any;
  } = {}
) {
  window.history.pushState({}, 'Test page', route);
  const testQueryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  const { rerender, ...result } = render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });

  return {
    ...result,
    rerender: (ui: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={testQueryClient}>
          <BrowserRouter>{ui}</BrowserRouter>
        </QueryClientProvider>
      ),
  };
}

// Mock server setup
export const server = setupServer(
  rest.get('/api/books', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          isbn: '1234567890',
          category: 'Fiction',
          copies: 5,
          availableCopies: 3,
        },
      ])
    );
  }),
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
      ])
    );
  }),
  rest.get('/api/loans', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          bookId: 1,
          userId: 1,
          status: 'active',
          dueDate: new Date().toISOString(),
        },
      ])
    );
  })
);

// Start the server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

// Close the server after all tests
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
}); 