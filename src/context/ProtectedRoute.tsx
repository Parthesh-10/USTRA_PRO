import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface Props {
  children: React.ReactNode
  allowedRoles?: ('customer' | 'owner' | 'admin')[]
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
