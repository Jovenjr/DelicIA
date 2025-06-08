import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Form from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Integrar con API de recuperación de contraseña
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulación
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-caribbean-50 to-tropical-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Success message */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-tropical-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Correo Enviado
            </h2>
            <p className="text-gray-600">
              Te hemos enviado un enlace de recuperación a <strong>{email}</strong>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button variant="outline" fullWidth onClick={() => setIsSubmitted(false)}>
              Enviar otro correo
            </Button>
            <Link to="/login">
              <Button variant="ghost" fullWidth>
                Volver al login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-caribbean-50 to-tropical-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-caribbean-800 mb-2">
            🍽️ Delicia
          </h1>
          <p className="text-gray-600">Recuperar Contraseña</p>
        </div>

        {/* Form */}
        <Form
          onSubmit={handleSubmit}
          isLoading={isLoading}
        >
          <div className="mb-4">
            <p className="text-sm text-gray-600 text-center">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          <Input
            type="email"
            name="email"
            label="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            leftIcon={<span>📧</span>}
          />

          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Enviar Enlace de Recuperación
            </Button>

            <Link to="/login">
              <Button variant="ghost" fullWidth>
                Volver al Login
              </Button>
            </Link>
          </div>
        </Form>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>Nota:</strong> Esta es una funcionalidad básica. 
            En producción se integrará con el sistema de correo del backend.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage 