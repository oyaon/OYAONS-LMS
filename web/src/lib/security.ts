import axios from 'axios';
import { toast } from 'react-hot-toast';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute
const requestTimestamps: number[] = [];

export const checkRateLimit = () => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Remove old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }

  // Check if we've exceeded the rate limit
  if (requestTimestamps.length >= MAX_REQUESTS) {
    toast.error('Too many requests. Please try again later.');
    throw new Error('Rate limit exceeded');
  }

  // Add current timestamp
  requestTimestamps.push(now);
};

// CSRF Protection
let csrfToken: string | null = null;

export const getCsrfToken = async () => {
  if (!csrfToken) {
    try {
      const response = await axios.get('/api/csrf-token');
      csrfToken = response.data.token;
      axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return csrfToken;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Password policy validation
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
};

// Audit logging
export const logAuditEvent = async (event: {
  action: string;
  userId?: string;
  details?: Record<string, any>;
}) => {
  try {
    await axios.post('/api/audit-logs', {
      ...event,
      timestamp: new Date().toISOString(),
      ipAddress: await getClientIp(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

// Get client IP (simplified version)
const getClientIp = async (): Promise<string> => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    return 'unknown';
  }
}; 