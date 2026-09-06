import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // User is logged in but is not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
