import React from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  return (
    <div className="text-center">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-caribbean-800 mb-4">
          🍽️ Bienvenido a Delicia
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Plataforma Inteligente de Pedidos para Restaurantes
        </p>
        <div className="space-x-4">
          <Link
            to="/menu"
            className="bg-caribbean-600 hover:bg-caribbean-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg inline-block"
          >
            Ver Menú
          </Link>
          <Link
            to="/orders"
            className="bg-tropical-600 hover:bg-tropical-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg inline-block"
          >
            Mis Pedidos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-caribbean-500">
          <div className="w-12 h-12 bg-caribbean-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-caribbean-800 mb-2">IA Inteligente</h3>
          <p className="text-gray-600 text-sm">
            Asistente virtual para ayudarte con tus pedidos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-tropical-500">
          <div className="w-12 h-12 bg-tropical-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-tropical-800 mb-2">Pedidos Rápidos</h3>
          <p className="text-gray-600 text-sm">
            Ordena en segundos con nuestra interfaz intuitiva
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-coral-500">
          <div className="w-12 h-12 bg-coral-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-coral-800 mb-2">Entrega Rápida</h3>
          <p className="text-gray-600 text-sm">
            Seguimiento en tiempo real de tu pedido
          </p>
        </div>
      </section>

      {/* Status */}
      <div className="glass-morphism rounded-xl p-6 max-w-md mx-auto">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Estado del Proyecto</h4>
        <p className="text-gray-600 text-sm">
          ✅ Frontend base completado - React Router configurado
        </p>
      </div>
    </div>
  )
}

export default HomePage 