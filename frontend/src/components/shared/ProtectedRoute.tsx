import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: UserRole[]
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [], 
  requireAuth = true 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-caribbean-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Verificar autenticación
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Verificar roles si se especificaron
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
        <p className="text-gray-600 mb-4">
          No tienes permisos para acceder a esta página.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="bg-caribbean-600 hover:bg-caribbean-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Volver
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute 