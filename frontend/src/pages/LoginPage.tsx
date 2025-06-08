import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Form from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, error } = useAuth()
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  // Redirigir si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(credentials)
    } catch (error) {
      // Error manejado por el context
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-white to-tropical-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-caribbean-200/30 to-tropical-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-sunset-200/30 to-coral-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 relative z-10 animate-fadeInUp">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-caribbean-500 to-tropical-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300 mx-auto">
              <span className="text-3xl">🍽️</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-caribbean-800 via-tropical-700 to-sunset-600 bg-clip-text text-transparent mb-3">
            Delicia
          </h1>
          <p className="text-gray-600 mb-4">Bienvenido de vuelta</p>
          <div className="inline-block bg-gradient-to-r from-caribbean-500/10 to-tropical-500/10 text-caribbean-700 px-4 py-2 rounded-full text-sm font-medium border border-caribbean-200/50">
            🇩🇴 Sabores Auténticos te Esperan
          </div>
        </div>

        {/* Form */}
        <Form
          title="Iniciar Sesión"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        >
          {/* Email */}
          <Input
            type="email"
            name="email"
            label="Correo Electrónico"
            value={credentials.email}
            onChange={handleChange}
            required
            placeholder="tu@email.com"
            leftIcon={<span>📧</span>}
          />

          {/* Password */}
          <Input
            type="password"
            name="password"
            label="Contraseña"
            value={credentials.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            leftIcon={<span>🔒</span>}
          />

          {/* Error */}
          {error && (
            <div className="bg-coral-50 border border-coral-200 text-coral-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Iniciar Sesión
          </Button>
        </Form>

        {/* Links */}
        <div className="text-center mt-4">
          <Link
            to="/forgot-password"
            className="text-sm text-caribbean-600 hover:text-caribbean-700 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Demo credentials */}
        <div className="mt-8 p-6 bg-gradient-to-r from-caribbean-50/50 to-tropical-50/50 rounded-xl border border-caribbean-100 backdrop-blur-sm">
          <div className="flex items-center mb-3">
            <span className="text-lg mr-2">🔑</span>
            <p className="text-sm font-semibold text-caribbean-800">Credenciales de demostración:</p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg text-xs text-gray-700 font-mono">
            <div className="flex items-center mb-1">
              <span className="text-caribbean-600 mr-2">📧</span>
              <span>admin@delicia.com</span>
            </div>
            <div className="flex items-center">
              <span className="text-tropical-600 mr-2">🔐</span>
              <span>admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 