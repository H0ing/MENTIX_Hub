import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wraps protected admin routes.
 * - While AuthContext is still reading localStorage → show nothing (avoids flash).
 * - If no user is logged in → redirect to /admin/login, preserving the intended path.
 * - If the logged-in user is not an admin role → redirect to /admin/login.
 */
const ADMIN_ROLES = ['moderator', 'dev_admin', 'super_admin'];

export default function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still rehydrating from localStorage — render nothing to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5FB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in, or logged in as a student/mentor
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
