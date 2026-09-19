import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Loading } from '../ui/States'

export function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading label="Preparando todo..." />
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (profile && !profile.active) return <Navigate to="/login" state={{ inactive: true }} replace />
  if (admin && profile?.role !== 'ADMIN') return <Navigate to="/home" replace />
  return <Outlet />
}
