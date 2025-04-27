import { API } from '../api';
import { rest } from 'msw';
import { server } from '../../setupTests';
import { logAuditEvent } from '../security';

describe('API Configuration', () => {
  it('should apply rate limiting when enabled', async () => {
    // Mock environment variable
    vi.stubEnv('VITE_REACT_APP_ENABLE_RATE_LIMIT', 'true');
    
    // Mock the rate limit check
    const checkRateLimit = vi.fn();
    vi.mock('../security', () => ({
      checkRateLimit,
    }));

    // Make a request
    await API.books.getAll();

    // Check if rate limit was checked
    expect(checkRateLimit).toHaveBeenCalled();
  });

  it('should add CSRF token when enabled', async () => {
    // Mock environment variable
    vi.stubEnv('VITE_REACT_APP_ENABLE_CSRF', 'true');
    
    // Mock the CSRF token
    const getCsrfToken = vi.fn().mockResolvedValue('test-csrf-token');
    vi.mock('../security', () => ({
      getCsrfToken,
    }));

    // Make a request
    await API.books.getAll();

    // Check if CSRF token was added
    expect(getCsrfToken).toHaveBeenCalled();
  });

  it('should log audit events when enabled', async () => {
    // Mock environment variable
    vi.stubEnv('VITE_REACT_APP_ENABLE_AUDIT_LOG', 'true');
    
    // Mock the audit log
    const logAuditEvent = vi.fn();
    vi.mock('../security', () => ({
      logAuditEvent,
    }));

    // Make a request
    await API.books.getAll();

    // Check if audit event was logged
    expect(logAuditEvent).toHaveBeenCalledWith({
      action: 'API_REQUEST',
      details: expect.any(Object),
    });
  });

  it('should handle unauthorized access', async () => {
    // Mock 401 response
    server.use(
      rest.get('/api/books', (req, res, ctx) => {
        return res(ctx.status(401));
      })
    );

    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    // Make a request
    await API.books.getAll();

    // Check if redirected to login
    expect(window.location.href).toBe('/login');
  });

  it('should handle API errors', async () => {
    // Mock error response
    server.use(
      rest.get('/api/books', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    // Make a request
    await expect(API.books.getAll()).rejects.toThrow();
  });

  it('should handle successful responses', async () => {
    // Mock successful response
    server.use(
      rest.get('/api/books', (req, res, ctx) => {
        return res(ctx.json([{ id: 1, title: 'Test Book' }]));
      })
    );

    // Make a request
    const response = await API.books.getAll();

    // Check response
    expect(response.data).toEqual([{ id: 1, title: 'Test Book' }]);
  });
}); 