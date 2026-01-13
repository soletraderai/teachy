/**
 * Protected Route Component
 * Redirects unauthenticated users to login page
 */
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/routes';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, accessToken, isLoading } = useAuthStore();
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = !!(user && accessToken);

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL to redirect back after login
    return (
      <Navigate
        to={ROUTES.auth.login}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Render children or Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
