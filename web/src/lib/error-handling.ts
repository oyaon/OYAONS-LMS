import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;
    
    switch (statusCode) {
      case 401:
        // Handle unauthorized access
        toast.error('Session expired. Please login again.');
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 422:
        // Handle validation errors
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach((error: any) => {
            toast.error(error[0]);
          });
        } else {
          toast.error('Validation failed');
        }
        break;
      case 500:
        toast.error('An unexpected error occurred. Please try again later.');
        break;
      default:
        toast.error(message || 'An error occurred');
    }
    
    return new AppError(message, statusCode);
  }
  
  if (error instanceof AppError) {
    toast.error(error.message);
    return error;
  }
  
  toast.error('An unexpected error occurred');
  return new AppError('An unexpected error occurred');
};

export const setupErrorHandling = () => {
  // Global error handler for uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Uncaught error:', { message, source, lineno, colno, error });
    toast.error('An unexpected error occurred');
  };

  // Global promise rejection handler
  window.onunhandledrejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    toast.error('An unexpected error occurred');
  };
}; 