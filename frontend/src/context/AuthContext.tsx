import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, UserRole, LoginCredentials, AuthResponse } from '@/types'

// Tipos del estado de autenticación
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

// Tipos de acciones
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }

// Tipos del contexto
interface AuthContextType {
  // Estado
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Funciones
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }
    
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      }
    
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    
    default:
      return state
  }
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Props del provider
interface AuthProviderProps {
  children: ReactNode
}

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Cargar token desde localStorage al inicializar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem('delicia_token')
        const storedUser = localStorage.getItem('delicia_user')
        
        if (storedToken && storedUser) {
          const user: User = JSON.parse(storedUser)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token: storedToken }
          })
        }
      } catch (error) {
        console.error('Error loading stored auth:', error)
        // Limpiar datos corruptos
        localStorage.removeItem('delicia_token')
        localStorage.removeItem('delicia_user')
      }
    }

    loadStoredAuth()
  }, [])

  // Función de login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      // TODO: Reemplazar con llamada real a la API cuando el backend esté listo
      // const response = await authService.login(credentials)
      
      // Mock temporal para desarrollo
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay de red
      
      if (credentials.email === 'admin@delicia.com' && credentials.password === 'admin123') {
        const mockUser: User = {
          id: '1',
          name: 'Administrador',
          email: credentials.email,
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const mockToken = 'mock-jwt-token-' + Date.now()
        
        // Guardar en localStorage
        localStorage.setItem('delicia_token', mockToken)
        localStorage.setItem('delicia_user', JSON.stringify(mockUser))
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: mockUser, token: mockToken }
        })
      } else {
        throw new Error('Credenciales inválidas')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de autenticación'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  // Función de logout
  const logout = (): void => {
    // Limpiar localStorage
    localStorage.removeItem('delicia_token')
    localStorage.removeItem('delicia_user')
    
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  // Función para limpiar errores
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Función para verificar rol específico
  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role
  }

  // Función para verificar múltiples roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false
  }

  // Valor del contexto
  const contextValue: AuthContextType = {
    // Estado
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Funciones
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 