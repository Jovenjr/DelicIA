import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { AppConfig } from '@/types'

// Tipos del estado de la aplicación
interface AppState {
  config: AppConfig
  theme: 'light' | 'dark'
  language: 'es' | 'en'
  isOnline: boolean
  notifications: boolean
}

// Tipos del contexto
interface AppContextType {
  // Estado
  config: AppConfig
  theme: 'light' | 'dark'
  language: 'es' | 'en'
  isOnline: boolean
  notifications: boolean
  
  // Funciones
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'es' | 'en') => void
  toggleNotifications: () => void
  updateConfig: (config: Partial<AppConfig>) => void
}

// Configuración por defecto
const defaultConfig: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  restaurantName: 'Delicia',
  currency: 'DOP', // Peso Dominicano
  taxRate: 0.18, // 18% ITBIS en República Dominicana
}

// Estado inicial
const initialState: AppState = {
  config: defaultConfig,
  theme: 'light',
  language: 'es',
  isOnline: navigator.onLine,
  notifications: true,
}

// Crear contexto
const AppContext = createContext<AppContextType | undefined>(undefined)

// Hook para usar el contexto
export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider')
  }
  return context
}

// Props del provider
interface AppProviderProps {
  children: ReactNode
}

// Provider del contexto
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState)

  // Cargar configuración desde localStorage al inicializar
  useEffect(() => {
    const loadStoredSettings = () => {
      try {
        const storedTheme = localStorage.getItem('delicia_theme') as 'light' | 'dark'
        const storedLanguage = localStorage.getItem('delicia_language') as 'es' | 'en'
        const storedNotifications = localStorage.getItem('delicia_notifications')
        const storedConfig = localStorage.getItem('delicia_config')

        setState(prevState => ({
          ...prevState,
          theme: storedTheme || 'light',
          language: storedLanguage || 'es',
          notifications: storedNotifications ? JSON.parse(storedNotifications) : true,
          config: storedConfig ? { ...defaultConfig, ...JSON.parse(storedConfig) } : defaultConfig,
        }))
      } catch (error) {
        console.error('Error loading stored settings:', error)
      }
    }

    loadStoredSettings()
  }, [])

  // Detectar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Función para cambiar tema
  const setTheme = (theme: 'light' | 'dark'): void => {
    setState(prev => ({ ...prev, theme }))
    localStorage.setItem('delicia_theme', theme)
    
    // Aplicar clase al documento para CSS
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }

  // Función para cambiar idioma
  const setLanguage = (language: 'es' | 'en'): void => {
    setState(prev => ({ ...prev, language }))
    localStorage.setItem('delicia_language', language)
    
    // Actualizar atributo lang del documento
    document.documentElement.lang = language
  }

  // Función para alternar notificaciones
  const toggleNotifications = (): void => {
    setState(prev => {
      const newNotifications = !prev.notifications
      localStorage.setItem('delicia_notifications', JSON.stringify(newNotifications))
      return { ...prev, notifications: newNotifications }
    })
  }

  // Función para actualizar configuración
  const updateConfig = (newConfig: Partial<AppConfig>): void => {
    setState(prev => {
      const updatedConfig = { ...prev.config, ...newConfig }
      localStorage.setItem('delicia_config', JSON.stringify(newConfig))
      return { ...prev, config: updatedConfig }
    })
  }

  // Valor del contexto
  const contextValue: AppContextType = {
    // Estado
    config: state.config,
    theme: state.theme,
    language: state.language,
    isOnline: state.isOnline,
    notifications: state.notifications,
    
    // Funciones
    setTheme,
    setLanguage,
    toggleNotifications,
    updateConfig,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext 