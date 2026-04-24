import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import PageLoader from '@components/ui/PageLoader'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
