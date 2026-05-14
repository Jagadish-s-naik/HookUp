import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const { user, profile, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    // In development, we might want to bypass this, but for a real app it's necessary
    // If you want to bypass auth in dev, uncomment the line below and comment the Navigate line
    // return <Outlet />;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not onboarded, and not on the onboarding page, redirect to onboarding
  if (!profile?.onboarding_complete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If already onboarded and trying to access onboarding, redirect to dashboard
  if (profile?.onboarding_complete && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
