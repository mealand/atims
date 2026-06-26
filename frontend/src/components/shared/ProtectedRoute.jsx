import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * Wraps a route and redirects if:
 * - Not authenticated → /login
 * - Authenticated but pending/rejected → /pending
 * - Wrong role → their correct dashboard
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, entity, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (entity?.status === 'pending') return <Navigate to="/pending" replace />
  if (entity?.status === 'rejected') return <Navigate to="/rejected" replace />

  if (allowedRoles && entity && !allowedRoles.includes(entity.role)) {
    // Redirect to the correct dashboard for their role
    const roleRedirects = {
      inspector: '/inspector',
      admin: '/admin',
    }
    return <Navigate to={roleRedirects[entity.role] || '/dashboard'} replace />
  }

  return children
}
