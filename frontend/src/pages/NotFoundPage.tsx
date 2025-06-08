import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-caribbean-50 to-tropical-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-caribbean-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link
          to="/"
          className="bg-caribbean-600 hover:bg-caribbean-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage 