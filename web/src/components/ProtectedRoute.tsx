import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';
import { Spinner } from './Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { from: location }, replace: true });
      } else if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
        // Redirect to home if user doesn't have required role
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, location, requiredRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || (requiredRoles.length > 0 && !requiredRoles.includes(user?.role))) {
    return null;
  }

  return <>{children}</>;
}; 