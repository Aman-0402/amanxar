import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import PageLoader from '@components/ui/PageLoader'

// allowedRoles: array of roles that can access, e.g. ['admin','employee'] or ['student']
// If omitted, any authenticated user passes.
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate home based on actual role
    return <Navigate to={user.role === 'student' ? '/student' : '/dashboard'} replace />
  }

  return <Outlet />
}
